import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DATABASE_CONNECTION } from '../../database/database-connection';
import * as schema from './schema';
import { CreateAddressDto, UpdateAddressDto } from './dtos/address.dto';
import { eq } from 'drizzle-orm';

@Injectable()
export class AddresService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private db: NodePgDatabase<typeof schema>,
  ) {}

  async createAddress(createAddressDto: CreateAddressDto) {
    const [address] = await this.db
      .insert(schema.Address)
      .values(createAddressDto)
      .returning();
    return address;
  }

  async findAllAddresses() {
    return this.db.select().from(schema.Address);
  }

  async findAddressById(id: number) {
    const address = await this.db
      .select()
      .from(schema.Address)
      .where(eq(schema.Address.id, id))
      .limit(1);

    if (!address || address.length === 0) {
      throw new NotFoundException(`Address with id ${id} not found`);
    }

    return address[0];
  }

  async updateAddress(id: number, updateAddressDto: UpdateAddressDto) {
    const [updatedAddress] = await this.db
      .update(schema.Address)
      .set(updateAddressDto)
      .where(eq(schema.Address.id, id))
      .returning();

    if (!updatedAddress) {
      throw new NotFoundException(`Address with id ${id} not found`);
    }

    return updatedAddress;
  }

  async removeAddress(id: number) {
    const [deletedAddress] = await this.db
      .delete(schema.Address)
      .where(eq(schema.Address.id, id))
      .returning();

    if (!deletedAddress) {
      throw new NotFoundException(`Address with id ${id} not found`);
    }

    return deletedAddress;
  }
}
