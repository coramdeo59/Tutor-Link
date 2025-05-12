import {
  Injectable,
  Inject,
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as addressSchema from '../schema/Address-schema';
import { UpsertAddressDto } from './dtos/upsert-address.dto';
import { DATABASE_CONNECTION } from 'src/core/database-connection';
import { SQL, eq, and, like } from 'drizzle-orm';
import { SearchAddressQueryDto } from './dtos/search-address-query.dto';
import { AddressResponseDto } from './dtos/address-response.dto';
import { AddressDto } from './dtos/address.dto';

// Define the address record type from the database schema
type AddressRecord = typeof addressSchema.addresses.$inferSelect;

@Injectable()
export class AddressService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly database: NodePgDatabase<{
      addresses: typeof addressSchema.addresses;
    }>,
  ) {}

  /**
   * Maps a database address record to the response DTO
   */
  private mapToAddressDto(address: AddressRecord): AddressResponseDto | null {
    if (!address) return null;

    return {
      id: address.id,
      userId: address.userId,
      location: address.location,
      state: address.state,
      city: address.city,
      phoneNumber: address.phoneNumber,
      street: address.street,
    };
  }

  /**
   * Find an address by its ID
   */
  async findById(id: number): Promise<AddressResponseDto> {
    const address = await this.database.query.addresses.findFirst({
      where: eq(addressSchema.addresses.id, id),
    });

    if (!address) {
      throw new NotFoundException(`Address with ID ${id} not found`);
    }

    // Cast the result to the expected type
    const addressDto = this.mapToAddressDto(address as AddressRecord);
    if (!addressDto) {
      throw new InternalServerErrorException('Failed to process address data');
    }
    return addressDto;
  }

  /**
   * Find an address by user ID
   */
  async findByUserId(userId: number): Promise<AddressResponseDto | null> {
    const address = await this.database.query.addresses.findFirst({
      where: eq(addressSchema.addresses.userId, userId),
    });

    // Explicitly handle potential undefined result and cast to correct type
    return address ? this.mapToAddressDto(address as AddressRecord) : null;
  }

  /**
   * Create a new address
   */
  async create(
    userId: number,
    addressData: AddressDto,
  ): Promise<AddressResponseDto> {
    const { location, state, city, phoneNumber, street } = addressData;

    // Validation
    if (!userId) {
      throw new Error('User ID is required to create an address.');
    }

    if (!location) {
      throw new Error('Location is required to create an address.');
    }

    const existingAddress = await this.findByUserId(userId);
    if (existingAddress) {
      throw new ConflictException(
        `User with ID ${userId} already has an address.`,
      );
    }

    // Insert new address
    const result = await this.database
      .insert(addressSchema.addresses)
      .values({
        userId, // Use userId from parameter
        location,
        state: state || null,
        city: city || null,
        phoneNumber: phoneNumber || null,
        street: street || null,
      })
      .returning();

    if (!result[0]) {
      throw new Error('Failed to create address.');
    }

    // Cast the database result to AddressResponseDto
    const addressDto = this.mapToAddressDto(result[0] as AddressRecord);
    if (!addressDto) {
      throw new Error('Failed to map created address to DTO.');
    }
    return addressDto;
  }

  /**
   * Update an existing address
   */
  async update(
    id: number,
    addressData: Partial<UpsertAddressDto>,
  ): Promise<AddressResponseDto> {
    // Check if address exists
    const existingAddress = await this.database.query.addresses.findFirst({
      where: eq(addressSchema.addresses.id, id),
    });

    if (!existingAddress) {
      throw new NotFoundException(`Address with ID ${id} not found`);
    }

    const { location, state, city, phoneNumber, street } = addressData;

    // Only update fields that were provided
    const updateData: Record<string, any> = {};

    if (location !== undefined) updateData.location = location;
    if (state !== undefined) updateData.state = state;
    if (city !== undefined) updateData.city = city;
    if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
    if (street !== undefined) updateData.street = street;

    // If no fields to update, return existing address
    if (Object.keys(updateData).length === 0) {
      const addressDto = this.mapToAddressDto(existingAddress as AddressRecord);
      if (!addressDto) {
        throw new InternalServerErrorException(
          'Failed to process address data',
        );
      }
      return addressDto;
    }

    // Update the address
    const result = await this.database
      .update(addressSchema.addresses)
      .set(updateData)
      .where(eq(addressSchema.addresses.id, id))
      .returning();

    if (!result[0]) {
      throw new InternalServerErrorException('Failed to update address');
    }

    // Cast the database result to AddressResponseDto
    const addressDto = this.mapToAddressDto(result[0] as AddressRecord);
    if (!addressDto) {
      throw new InternalServerErrorException('Failed to process address data');
    }
    return addressDto;
  }

  /**
   * Delete an address by ID
   */
  async delete(id: number): Promise<boolean> {
    // Check if address exists
    const existingAddress = await this.database.query.addresses.findFirst({
      where: eq(addressSchema.addresses.id, id),
    });

    if (!existingAddress) {
      throw new NotFoundException(`Address with ID ${id} not found`);
    }

    // Delete the address
    const result = await this.database
      .delete(addressSchema.addresses)
      .where(eq(addressSchema.addresses.id, id))
      .returning({ id: addressSchema.addresses.id });

    // Check if a row was affected by the delete operation
    return Array.isArray(result) && result.length > 0;
  }

  /**
   * Delete an address by user ID
   */
  async deleteByUserId(userId: number): Promise<boolean> {
    const result = await this.database
      .delete(addressSchema.addresses)
      .where(eq(addressSchema.addresses.userId, userId))
      .returning({ id: addressSchema.addresses.id });

    // Check if a row was affected by the delete operation
    return Array.isArray(result) && result.length > 0;
  }

  /**
   * Upsert (create or update) an address for a user
   */
  async upsert(
    userId: number,
    addressData: UpsertAddressDto,
  ): Promise<AddressResponseDto> {
    const { location, state, city, phoneNumber, street } = addressData;

    if (!location) {
      throw new BadRequestException('Location is required');
    }

    // Find existing address for user
    const existingAddress = await this.findByUserId(userId);

    if (existingAddress) {
      // Update existing address
      return this.update(existingAddress.id, addressData);
    } else {
      // Create new address with AddressDto
      const newAddressData: AddressDto = {
        userId,
        location,
        state,
        city,
        phoneNumber,
        street,
      };
      return this.create(userId, newAddressData);
    }
  }

  /**
   * Search for addresses by criteria
   */
  async search(query: SearchAddressQueryDto): Promise<AddressResponseDto[]> {
    const conditions: SQL[] = [];

    if (query.location) {
      conditions.push(
        like(addressSchema.addresses.location, `%${query.location}%`),
      );
    }

    if (query.state) {
      conditions.push(like(addressSchema.addresses.state, `%${query.state}%`));
    }

    if (query.street) {
      conditions.push(
        like(addressSchema.addresses.street, `%${query.street}%`),
      );
    }

    // If no conditions, return empty array
    if (conditions.length === 0) {
      return [];
    }

    // Query addresses
    const result = await this.database
      .select()
      .from(addressSchema.addresses)
      .where(and(...conditions));

    // Map to DTOs and filter out nulls
    return result
      .map((record) => this.mapToAddressDto(record as AddressRecord))
      .filter((dto): dto is AddressResponseDto => dto !== null);
  }
}
