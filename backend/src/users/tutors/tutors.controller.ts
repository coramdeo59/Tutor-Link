import {
  Controller,
  Post,
  Body,
  Param,
  ParseIntPipe,
  Get,
  HttpCode,
  HttpStatus,
  ForbiddenException, // Uncommented
} from '@nestjs/common';
import {  TutorAvailabilitySlot, TutorsService } from './tutors.service';
import { CreateTutorProfileDto } from './dto/create-tutor-profile.dto';
import { CreateVerificationDetailsDto } from './dto/create-verification-details.dto'; // Added import
import { ActiveUser } from '../../auth/Decorators/active-user.decorator'; // Uncommented
import { ActiveUserData } from '../../auth/interfaces/active-user-data.interface'; // Uncommented
// import { Roles } from '../../auth/authorization/decorators/roles.decorator'; // For role-based access
import { Role } from '../enums/role-enums'; // Assuming Role enum is here
// import { Auth } from '../../auth/authentication/decorators/auth.decorator'; // Combined auth guard
// import { AuthType } from '../../auth/authentication/enums/auth-type.enum'; // For specifying auth type


@Controller('users/tutor-profile') // MODIFIED: Added :userId here
export class TutorsController {
  constructor(private readonly tutorsService: TutorsService) {}

  /**
   * Creates a tutor profile for a given user.
   * The userId is taken from the path parameter.
   */
  @Post() // Now correctly mounted at 'users/:userId/tutor-profile'
  @HttpCode(HttpStatus.CREATED)
  // @Auth(AuthType.Bearer) // Example: Protect this route
  async createTutorProfile(
    @ActiveUser() activeUser: ActiveUserData,
    @Body() createTutorProfileDto: CreateTutorProfileDto,
  ) {
    // Only the user themselves or an admin can create their profile.
    if (activeUser.role !== Role.Admin && activeUser.sub !== activeUser.sub) {
      throw new ForbiddenException('You are not authorized to create this tutor profile.');
    }
    return this.tutorsService.createTutorProfile(activeUser.sub, createTutorProfileDto);
  }

  /**
   * Retrieves a tutor's profile.
   */
  @Get() // Now correctly mounted at 'users/:userId/tutor-profile'
  // @Auth(AuthType.Bearer) // Example: Protect if profile data is sensitive
  async getTutorProfile(
    @Param('userId', ParseIntPipe) userId: number, // This will now correctly get userId from the path
    // @ActiveUser() activeUser: ActiveUserData, // Example
  ) {
    // Optional: Add authorization if needed (e.g., only user or admin can view detailed profile)
    return this.tutorsService.getTutorProfile(userId);
  }

  // --- Verification Details Endpoints --- //

  /**
   * Creates verification details for a tutor.
   * The userId from the path is used as tutorId.
   */
  @Post('verification-details') // Now correctly mounted at 'users/:userId/tutor-profile/verification-details'
  @HttpCode(HttpStatus.CREATED)
  // @Auth(AuthType.Bearer) // Protect this route as needed
  async createVerificationDetails(
    @ActiveUser() activeUser: ActiveUserData, // Use ActiveUser to get tutorId
    @Body() createVerificationDetailsDto: CreateVerificationDetailsDto,
  ) {
    // Use activeUser.sub as tutorId
    return this.tutorsService.createVerificationDetails(activeUser.sub, createVerificationDetailsDto);
  }

  /**
   * Retrieves verification details for a tutor.
   * The userId from the path is used as tutorId.
   */
  @Get('verification-details') // Now correctly mounted at 'users/:userId/tutor-profile/verification-details'
  // @Auth(AuthType.Bearer) // Protect this route as needed
  async getVerificationDetails(
    @ActiveUser() activeUser: ActiveUserData, // Use ActiveUser to get tutorId
  ) {
    // Use activeUser.sub as tutorId
    return this.tutorsService.getVerificationDetails(activeUser.sub);
  }

  // --- Tutor Availability Slots Endpoints --- //

  @Post('availability-slots')
  @HttpCode(HttpStatus.CREATED)
  async createAvailabilitySlot(
    @ActiveUser() activeUser: ActiveUserData,
    @Body() dto: TutorAvailabilitySlot,
  ) {
    return this.tutorsService.createAvailabilitySlot(activeUser.sub, dto);
  }

  @Get('availability-slots')
  async getAvailabilitySlots(
    @ActiveUser() activeUser: ActiveUserData,
  ) {
    return this.tutorsService.getAvailabilitySlots(activeUser.sub);
  }

  @Post('availability-slots/:slotId')
  async updateAvailabilitySlot(
    @ActiveUser() activeUser: ActiveUserData,
    @Param('slotId', ParseIntPipe) slotId: number,
    @Body() dto: TutorAvailabilitySlot,
  ) {
    return this.tutorsService.updateAvailabilitySlot(activeUser.sub, slotId, dto);
  }

  @Post('availability-slots/:slotId/delete')
  async deleteAvailabilitySlot(
    @ActiveUser() activeUser: ActiveUserData,
    @Param('slotId', ParseIntPipe) slotId: number,
  ) {
    await this.tutorsService.deleteAvailabilitySlot(activeUser.sub, slotId);
    return { message: 'Slot deleted' };
  }
}
