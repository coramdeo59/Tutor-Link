import {
	Inject,
	Injectable,
	ConflictException,
	InternalServerErrorException,
	UnauthorizedException,
	NotFoundException,
	BadRequestException,
} from "@nestjs/common";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { eq } from "drizzle-orm";
import { HashingService } from "../hashing/hashing.service";
import { SignUpDto } from "./dto/sign-up.dto";
import { SignInDto } from "./dto/sign-in.dto";
import { ChildSignInDto } from "./dto/child-sign-in.dto";
import { JwtService } from "@nestjs/jwt";
import { ConfigType } from "@nestjs/config";
import jwtConfig from "../config/jwt.config";
import { ActiveUserData } from "../interfaces/active-user.data.interface";
import { RefreshTokenDto } from "./dto/refresh-token.dto";
import { randomUUID } from "crypto";
import { RefreshTokenIdsStorage } from "./refresh-token-ids.storage/refresh-token-ids.storage";
import { InvalidatedRefreshTokenError } from "./exceptions/invalidated-refresh-token.exception";
import { DATABASE_CONNECTION } from "src/core/database-connection";
import { Role } from "./enums/roles-type-enum";
import { admin } from "../../users/admin/schema/admin.schema";
import { tutors, tutorVerifications, tutorSubjects, tutorGrades, tutorAvailability } from "../../users/tutors/schema/tutor.schema";
import { parents, children } from "../../users/parent/schema/parent.schema";
import { refreshTokens } from "./refresh-token-ids.storage/schema/refresh-tokens.schema";
import { passwordResetTokens } from "./schema/password-reset-tokens.schema";
import { randomBytes } from "crypto";
import { MailerService } from "../../mailer/mailer.service";
import { ConfigService } from "@nestjs/config";

interface RefreshTokenPayload extends ActiveUserData {
	refreshTokenId: string;
}

// Define a simple user interface for token generation
interface BasicUser {
    id: number;
    email?: string; // Make email optional for child users who don't have email
    username?: string; // For child users who use username
    role: Role;
}

@Injectable()
export class AuthenticationService {
	constructor(
		@Inject(DATABASE_CONNECTION)
		private readonly database: NodePgDatabase<{ 
			admin: typeof admin;
			tutors: typeof tutors;
			parents: typeof parents;
			children: typeof children;
			refreshTokens: typeof refreshTokens;
			passwordResetTokens: typeof passwordResetTokens;
		}>,
		private readonly hashingService: HashingService,
		private readonly jwtService: JwtService,
		@Inject(jwtConfig.KEY)
		private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
		private readonly refreshTokenIdsStorage: RefreshTokenIdsStorage,
		private readonly mailerService: MailerService,
		private readonly configService: ConfigService
	) {}

	async signup(signUpDto: SignUpDto) {
		const { email, password, firstName, lastName, phoneNumber, role, ...additionalFields } = signUpDto;
		
		if (!role) {
			throw new BadRequestException("Role is required");
		}
		
		const hashedPassword = await this.hashingService.hash(password);

		try {
			// Create user in the appropriate table based on role
			switch (role) {
				case Role.PARENT:
					// Using the column names as defined in parent.schema.ts
					return await this.database
						.insert(parents)
						.values({
							email: email,
							password: hashedPassword,
							firstName: firstName,
							lastName: lastName,
							phoneNumber: phoneNumber || '',
							role: role,
							...additionalFields, // Include any additional fields
						})
						.returning();
				case Role.TUTOR:
					// Extract verification, subjects, grades, and availability fields from additionalFields
					const {
						// Verification fields
						fanNumber, idDocumentUrl, cvUrl, educationLevel, institutionName,
						degree, graduationYear, yearsOfExperience, hasTeachingCertificate,
						certificateUrl,
						// Subject fields
						subjects,
						// Grade level fields
						gradeLevels,
						// Availability fields
						availabilitySlots,
						// Remaining tutor fields
						...tutorFields
					} = additionalFields as any;

					// Convert hourlyRate to integer if it's a decimal
					let tutorFieldsWithIntegerRate = { ...tutorFields };
					if (tutorFieldsWithIntegerRate.hourlyRate !== undefined) {
						try {
							// Parse as float first, then convert to integer
							const rateAsFloat = parseFloat(tutorFieldsWithIntegerRate.hourlyRate);
							tutorFieldsWithIntegerRate.hourlyRate = Math.round(rateAsFloat);
						} catch (error) {
							console.error('Error converting hourlyRate to integer:', error);
							// If conversion fails, use a default value
							tutorFieldsWithIntegerRate.hourlyRate = 0;
						}
					}

					// Insert the tutor record
					const result = await this.database
						.insert(tutors)
						.values({
							email: email,
							password: hashedPassword,
							firstName: firstName,
							lastName: lastName,
							phoneNumber: phoneNumber || '',
							role: role,
							...tutorFieldsWithIntegerRate, // Include remaining tutor fields with fixed hourlyRate
						})
						.returning();

					if (!result || result.length === 0) {
						throw new InternalServerErrorException('Failed to create tutor account');
					}

					const newTutor = result[0];
					// Process verification data if provided
					if (newTutor && (fanNumber || idDocumentUrl || cvUrl || educationLevel || institutionName ||
						degree || graduationYear || yearsOfExperience || hasTeachingCertificate ||
						certificateUrl)) {
						
						await this.database
							.insert(tutorVerifications)
							.values({
								tutorId: newTutor.tutorId,
								fanNumber,
								idDocumentUrl,
								cvUrl,
								educationLevel,
								institutionName,
								degree,
								graduationYear,
								yearsOfExperience,
								hasTeachingCertificate,
								certificateUrl,
								status: 'pending',
							})
							.returning();
					}

					// Process subjects if provided
					if (newTutor && subjects && Array.isArray(subjects) && subjects.length > 0) {
						for (const subject of subjects) {
							await this.database
								.insert(tutorSubjects)
								.values({
									tutorId: newTutor.tutorId,
									subjectName: subject,
								});
						}
					}
					
					// Process grade levels if provided
					if (newTutor && gradeLevels && Array.isArray(gradeLevels) && gradeLevels.length > 0) {
						for (const grade of gradeLevels) {
							await this.database
								.insert(tutorGrades)
								.values({
									tutorId: newTutor.tutorId,
									gradeName: grade,
								});
						}
					}

					// Process availability slots if provided
					if (newTutor && availabilitySlots && Array.isArray(availabilitySlots) && availabilitySlots.length > 0) {
						for (const slot of availabilitySlots) {
							await this.database
								.insert(tutorAvailability)
								.values({
									tutorId: newTutor.tutorId,
									dayOfWeek: slot.dayOfWeek,
									startTime: new Date(slot.startTime),
									endTime: new Date(slot.endTime),
								});
						}
					}

					return newTutor;

				case Role.ADMIN:
					// Using the column names as defined in admin.schema.ts
					return await this.database
						.insert(admin)
						.values({
							email: email,
							password: hashedPassword,
							firstName: firstName,
							lastName: lastName,
							phoneNumber: phoneNumber || '',
							role: role,
							...additionalFields, // Include any additional fields
						})
						.returning();
				default:
					throw new BadRequestException(`Invalid role: ${role}`);
			}
		} catch (error) {
			// PostgreSQL error code for unique violation is '23505'
			if (error.code === "23505" && error.detail.includes("email")) {
				throw new ConflictException("User with this email already exists");
			}
			console.error("Database error during user signup:", error);
			throw new InternalServerErrorException("Failed to create user account");
		}
	}
	
	async signIn(signInDto: SignInDto) {
		const { email, password } = signInDto;

		try {
			// Check all tables for the user's email
			let user: any = null;
			let role: Role | null = null;
			let userId: number | null = null;

			// Try finding in tutors table
			const tutorUsers = await this.database
				.select()
				.from(tutors)
				.where(eq(tutors.email, email))
				.limit(1);

			if (tutorUsers.length > 0) {
				user = tutorUsers[0];
				role = Role.TUTOR;
				userId = user.tutorId;
			}

			// Try finding in parents table if not found
			if (!user) {
				const parentUsers = await this.database
					.select()
					.from(parents)
					.where(eq(parents.email, email))
					.limit(1);

				if (parentUsers.length > 0) {
					user = parentUsers[0];
					role = Role.PARENT;
					userId = user.parentId;
				}
			}

			// Try finding in admin table if not found
			if (!user) {
				const adminUsers = await this.database
					.select()
					.from(admin)
					.where(eq(admin.email, email))
					.limit(1);

				if (adminUsers.length > 0) {
					user = adminUsers[0];
					role = Role.ADMIN;
					userId = user.adminId;
				}
			}

			// Check if user exists in any table
			if (!user) {
				throw new NotFoundException(
					"We couldn't find an account with that email"
				);
			}

			// Verify password
			const isPasswordValid = await this.hashingService.compare(
				password,
				user.password
			);

			if (!isPasswordValid) {
				throw new UnauthorizedException(
					"The password you entered is incorrect"
				);
			}

			// Generate tokens with role included
			return await this.generateTokens({
				id: userId!,
				email: user.email,
				role: role!,
			});
		} catch (error) {
			if (
				error instanceof UnauthorizedException ||
				error instanceof NotFoundException
			) {
				throw error;
			}
			console.error("Error during sign-in:", error);
			throw new InternalServerErrorException(
				"An error occurred while signing in. Please try again later."
			);
		}
	}

	/**
	 * Child sign-in method - allows children to authenticate using username/password
	 * @param childSignInDto Contains username and password
	 * @returns Access and refresh tokens upon successful authentication
	 */
	async childSignIn(childSignInDto: ChildSignInDto) {
		const { username, password } = childSignInDto;

		try {
			// Find child by username
			const childUser = await this.database
				.select()
				.from(children)
				.where(eq(children.username, username))
				.limit(1);

			// Check if child exists
			if (!childUser || childUser.length === 0) {
				throw new NotFoundException(
					"We couldn't find an account with that username"
				);
			}

			const child = childUser[0];

			// Check if child exists
			if (!child) {
				throw new NotFoundException(
					"Child with this username was not found"
				);
			}

			// Verify password
			const isPasswordValid = await this.hashingService.compare(
				password,
				child.password
			);

			if (!isPasswordValid) {
				throw new UnauthorizedException(
					"The password you entered is incorrect"
				);
			}

			// Generate tokens for child with role CHILD
			return await this.generateTokens({
				id: child.childId,
				username: child.username,
				role: Role.CHILD, // Define this role in the Role enum
			});

		} catch (error) {
			if (
				error instanceof UnauthorizedException ||
				error instanceof NotFoundException
			) {
				throw error;
			}
			console.error("Error during child sign-in:", error);
			throw new InternalServerErrorException(
				"An error occurred while signing in. Please try again later."
			);
		}
	}

	async generateTokens(user: BasicUser) {
		const refreshTokenId = randomUUID();

		const [accessToken, refreshToken] = await Promise.all([
			this.signToken<Partial<ActiveUserData>>(
				user.id,
				this.jwtConfiguration.accessTokenTtl,
				{
					email: user.email,
					role: user.role,
				}
			),
			this.signToken<Partial<RefreshTokenPayload>>(
				user.id,
				this.jwtConfiguration.refreshTokenTtl,
				{
					refreshTokenId,
					role: user.role,
				}
			),
		]);

		// Store the token in the db.
		await this.refreshTokenIdsStorage.insert(
			user.id, 
			refreshTokenId,
			this.jwtConfiguration.refreshTokenTtl
		);

		return {
			accessToken,
			refreshToken
		};
	}

	async refreshTokens(refreshTokenDto: RefreshTokenDto) {
		try {
			const payload = await this.jwtService.verifyAsync<RefreshTokenPayload>(
				refreshTokenDto.refreshToken,
				{
					audience: this.jwtConfiguration.audience,
					issuer: this.jwtConfiguration.issuer,
					secret: this.jwtConfiguration.secret,
				}
			);

			const { sub, refreshTokenId, role } = payload;

			if (!refreshTokenId) {
				throw new UnauthorizedException("Refresh token ID not found");
			}

			// Validate the refresh token ID
			await this.refreshTokenIdsStorage.validate(sub, refreshTokenId);

			// Invalidate the current refresh token
			await this.refreshTokenIdsStorage.invalidate(sub, refreshTokenId);

			// Find user based on role
			let user: BasicUser | null = null;
			
			// Check the appropriate table based on role with proper null checks
			if (role === Role.TUTOR) {
				const tutorUsers = await this.database
					.select()
					.from(tutors)
					.where(eq(tutors.tutorId, sub))
					.limit(1);
					
				if (tutorUsers.length > 0 && tutorUsers[0]) {
					const tutor = tutorUsers[0];
					user = { 
						id: tutor.tutorId,
						email: tutor.email,
						role: Role.TUTOR
					};
				}
			} else if (role === Role.PARENT) {
				const parentUsers = await this.database
					.select()
					.from(parents)
					.where(eq(parents.parentId, sub))
					.limit(1);
					
				if (parentUsers.length > 0 && parentUsers[0]) {
					const parent = parentUsers[0];
					user = { 
						id: parent.parentId,
						email: parent.email,
						role: Role.PARENT
					};
				}
			} else if (role === Role.ADMIN) {
				const adminUsers = await this.database
					.select()
					.from(admin)
					.where(eq(admin.adminId, sub))
					.limit(1);
					
				if (adminUsers.length > 0 && adminUsers[0]) {
					const adminUser = adminUsers[0];
					user = { 
						id: adminUser.adminId,
						email: adminUser.email,
						role: Role.ADMIN
					};
				}
			}

			if (!user) {
				throw new UnauthorizedException("User not found");
			}

			return this.generateTokens(user);
		} catch (error) {
			if (error instanceof InvalidatedRefreshTokenError) {
				// This is a known error that happens when a token is invalidated
				throw new UnauthorizedException("Refresh token has been invalidated");
			}
			throw new UnauthorizedException("Invalid refresh token");
		}
	}

	private async signToken<T>(
		userId: number,
		expiresIn: number,
		payload?: T
	): Promise<string> {
		return await this.jwtService.signAsync(
			{
				...(payload ?? {}),
				sub: userId,
			},
			{
				secret: this.jwtConfiguration.secret,
				expiresIn,
			}
		);
	}

	async forgotPassword(email: string) {
		try {
			// Check if user exists in any of the tables
			let userExists = false;

			// Check tutors table
			const tutorUsers = await this.database
				.select()
				.from(tutors)
				.where(eq(tutors.email, email))
				.limit(1);

			if (tutorUsers.length > 0) {
				userExists = true;
			}

			// Check parents table if not found
			if (!userExists) {
				const parentUsers = await this.database
					.select()
					.from(parents)
					.where(eq(parents.email, email))
					.limit(1);

				if (parentUsers.length > 0) {
					userExists = true;
				}
			}

			// Check admin table if not found
			if (!userExists) {
				const adminUsers = await this.database
					.select()
					.from(admin)
					.where(eq(admin.email, email))
					.limit(1);

				if (adminUsers.length > 0) {
					userExists = true;
				}
			}

			if (!userExists) {
				// For security reasons, don't reveal whether the email exists or not
				// Just return success message anyway
				return { message: "If your email exists in our system, you will receive a password reset link." };
			}

			// Generate a secure random token
			const token = randomBytes(32).toString('hex');
			
			// Set expiration time (1 hour from now)
			const expiresAt = new Date();
			expiresAt.setHours(expiresAt.getHours() + 1);

			// Delete any existing tokens for this email
			await this.database
				.delete(passwordResetTokens)
				.where(eq(passwordResetTokens.email, email));

			// Store the token in the database
			await this.database
				.insert(passwordResetTokens)
				.values({
					email,
					token,
					expiresAt,
				});

			// Get the frontend URL from environment variables or use a default
			const frontendUrl = this.configService.get('FRONTEND_URL') || 'http://localhost:3000';

			// Send the password reset email
			try {
				await this.mailerService.sendPasswordResetEmail(email, token, frontendUrl);
				console.log(`Password reset email sent to ${email}`);
			} catch (emailError) {
				console.error('Failed to send password reset email:', emailError);
				// We don't want to expose this error to the user, so we'll just log it
			}

			return { 
				message: "If your email exists in our system, you will receive a password reset link.",
				// In development environment, return the token for testing
				...(process.env.NODE_ENV !== 'production' ? { token } : {})
			};
		} catch (error) {
			console.error("Error during forgot password:", error);
			throw new InternalServerErrorException(
				"An error occurred while processing your request. Please try again later."
			);
		}
	}

	async signOut(userId: number) {
		try {
			// Invalidate all refresh tokens for the user
			await this.database
				.delete(refreshTokens)
				.where(eq(refreshTokens.userId, userId));

			return { message: "Successfully signed out" };
		} catch (error) {
			console.error("Error during sign out:", error);
			throw new InternalServerErrorException(
				"An error occurred while signing out. Please try again later."
			);
		}
	}

	async resetPassword(token: string, newPassword: string) {
		try {
			// Find the token in the database
			const tokenRecords = await this.database
				.select()
				.from(passwordResetTokens)
				.where(eq(passwordResetTokens.token, token))
				.limit(1);

			if (tokenRecords.length === 0 || !tokenRecords[0]) {
				throw new NotFoundException("Invalid or expired password reset token");
			}

			const tokenRecord = tokenRecords[0];

			// Check if token is expired
			if (new Date() > new Date(tokenRecord.expiresAt)) {
				// Delete the expired token
				await this.database
					.delete(passwordResetTokens)
					.where(eq(passwordResetTokens.id, tokenRecord.id));

				throw new BadRequestException("Password reset token has expired");
			}

			// Hash the new password
			const hashedPassword = await this.hashingService.hash(newPassword);

			// Update the user's password in the appropriate table
			const email = tokenRecord.email;
			let updated = false;

			// Try updating in tutors table
			const tutorUpdateResult = await this.database
				.update(tutors)
				.set({ password: hashedPassword })
				.where(eq(tutors.email, email))
				.returning();

			if (tutorUpdateResult.length > 0) {
				updated = true;
			}

			// Try updating in parents table if not updated
			if (!updated) {
				const parentUpdateResult = await this.database
					.update(parents)
					.set({ password: hashedPassword })
					.where(eq(parents.email, email))
					.returning();

				if (parentUpdateResult.length > 0) {
					updated = true;
				}
			}

			// Try updating in admin table if not updated
			if (!updated) {
				const adminUpdateResult = await this.database
					.update(admin)
					.set({ password: hashedPassword })
					.where(eq(admin.email, email))
					.returning();

				if (adminUpdateResult.length > 0) {
					updated = true;
				}
			}

			if (!updated) {
				throw new NotFoundException("User not found");
			}

			// Delete the used token
			await this.database
				.delete(passwordResetTokens)
				.where(eq(passwordResetTokens.id, tokenRecord.id));

			return { message: "Password has been successfully reset" };
		} catch (error) {
			if (
				error instanceof NotFoundException ||
				error instanceof BadRequestException
			) {
				throw error;
			}
			console.error("Error during password reset:", error);
			throw new InternalServerErrorException(
				"An error occurred while resetting your password. Please try again later."
			);
		}
	}
}
