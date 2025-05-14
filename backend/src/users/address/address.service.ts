import {
  Injectable,
  Inject,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as addressSchema from '../schema/Address-schema';
import { DATABASE_CONNECTION } from 'src/core/database-connection';
import { CreateStateDto } from './dtos/create-state.dto';
import { CreateCityDto } from './dtos/create-city.dto';
import { eq, and } from 'drizzle-orm';

// Define the record types from the database schema
type StateRecord = typeof addressSchema.states.$inferSelect;
type CityRecord = typeof addressSchema.cities.$inferSelect;

@Injectable()
export class AddressService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly database: NodePgDatabase<{
      states: typeof addressSchema.states;
      cities: typeof addressSchema.cities;
    }>,
  ) {}

  /**
   * Create a new state
   */
  async createState(createStateDto: CreateStateDto): Promise<StateRecord> {
    const { name } = createStateDto;

    try {
      // Check if state with the same name already exists
      const existingState = await this.database
        .select()
        .from(addressSchema.states)
        .where(eq(addressSchema.states.name, name))
        .limit(1);

      if (existingState.length > 0) {
        throw new ConflictException(`State with name '${name}' already exists`);
      }

      // Create the state
      const result = await this.database
        .insert(addressSchema.states)
        .values({ name })
        .returning();

      if (!result || result.length === 0) {
        throw new InternalServerErrorException('Failed to create state');
      }

      return result[0] as StateRecord;
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }

      console.error('Error creating state:', error);
      throw new InternalServerErrorException(
        `Failed to create state: ${error.message}`,
      );
    }
  }

  /**
   * Create a new city with state name (creates state if it doesn't exist)
   */
  async createCity(createCityDto: CreateCityDto): Promise<CityRecord> {
    const { name, stateName } = createCityDto;

    try {
      // Check if state exists by name
      let stateId: number;
      let stateRecord: StateRecord | null = null;

      const existingState = await this.database
        .select()
        .from(addressSchema.states)
        .where(eq(addressSchema.states.name, stateName))
        .limit(1);

      if (existingState.length > 0) {
        // Use existing state
        stateRecord = existingState[0] as StateRecord;
        stateId = stateRecord.id;
      } else {
        // Create new state
        console.log(`State '${stateName}' doesn't exist. Creating it...`);
        stateRecord = await this.createState({ name: stateName });
        stateId = stateRecord.id;
      }

      // Check if city with the same name already exists in this state
      const existingCity = await this.database
        .select()
        .from(addressSchema.cities)
        .where(
          and(
            eq(addressSchema.cities.name, name),
            eq(addressSchema.cities.stateId, stateId),
          ),
        )
        .limit(1);

      if (existingCity.length > 0) {
        throw new ConflictException(
          `City with name '${name}' already exists in state '${stateName}'`,
        );
      }

      // Create the city
      const result = await this.database
        .insert(addressSchema.cities)
        .values({ name, stateId })
        .returning();

      if (!result || result.length === 0) {
        throw new InternalServerErrorException('Failed to create city');
      }

      // Prepare enriched response including state info
      const cityRecord = result[0] as CityRecord;
      return {
        ...cityRecord,
        // Include extra info for response (these are not part of the DB record)
        stateName,
      } as CityRecord & { stateName: string };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }

      console.error('Error creating city:', error);
      throw new InternalServerErrorException(
        `Failed to create city: ${error.message}`,
      );
    }
  }

  /**
   * Get all states
   */
  async getAllStates() {
    return this.database.select().from(addressSchema.states);
  }

  /**
   * Get cities by state ID
   */
  async getCitiesByState(stateId: number) {
    // Verify state exists
    const stateExists = await this.database
      .select()
      .from(addressSchema.states)
      .where(eq(addressSchema.states.id, stateId))
      .limit(1);

    if (stateExists.length === 0) {
      throw new NotFoundException(`State with ID ${stateId} not found`);
    }

    return this.database
      .select()
      .from(addressSchema.cities)
      .where(eq(addressSchema.cities.stateId, stateId));
  }

  /**
   * Get all cities with their state information
   */
  async getAllCitiesWithStates() {
    // Get all cities
    const cities = await this.database.select().from(addressSchema.cities);

    // Define the type for cities with state info
    type EnrichedCity = CityRecord & { stateName: string | null };

    // Enrich cities with state information
    const enrichedCities: EnrichedCity[] = [];

    for (const city of cities) {
      // Get state information for each city
      const stateResult = await this.database
        .select()
        .from(addressSchema.states)
        .where(eq(addressSchema.states.id, city.stateId))
        .limit(1);

      if (stateResult.length > 0) {
        const state = stateResult[0] as StateRecord;

        // Add city with state information
        enrichedCities.push({
          ...city,
          stateName: state.name,
        });
      } else {
        // If state not found (shouldn't happen due to foreign key constraints), include city without state name
        enrichedCities.push({
          ...city,
          stateName: null,
        });
      }
    }

    return enrichedCities;
  }
}
