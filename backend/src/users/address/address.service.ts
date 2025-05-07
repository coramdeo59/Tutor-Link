import {
  Injectable,
  Inject,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from './schema';
import { CreateAddressDto } from './dtos/create-address.dto'; // Import CreateAddressDto
import { DATABASE_CONNECTION } from 'src/core/database-connection';
import { eq, and } from 'drizzle-orm'; // Import 'and' for combined queries
import { StateDto } from './dtos/state.dto';
import { CountryWithStatesDto } from './dtos/country-with-states.dto';

@Injectable()
export class AddressService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly database: NodePgDatabase<typeof schema>,
  ) {}

  private async findOrCreateCountry(countryName: string): Promise<number> {
    const existingCountry = await this.database.query.countries.findFirst({
      where: eq(schema.countries.name, countryName),
    });
    if (existingCountry) {
      return existingCountry.id;
    }
    const [newCountry] = await this.database
      .insert(schema.countries)
      .values({ name: countryName })
      .returning({ id: schema.countries.id });
    if (!newCountry) {
      throw new InternalServerErrorException('Failed to create country');
    }
    return newCountry.id;
  }

  private async findOrCreateState(
    stateName: string,
    countryId: number,
  ): Promise<number> {
    const existingState = await this.database.query.states.findFirst({
      where: and(
        eq(schema.states.name, stateName),
        eq(schema.states.countryId, countryId),
      ),
    });
    if (existingState) {
      return existingState.id;
    }
    const [newState] = await this.database
      .insert(schema.states)
      .values({ name: stateName, countryId })
      .returning({ id: schema.states.id });
    if (!newState) {
      throw new InternalServerErrorException('Failed to create state');
    }
    return newState.id;
  }

  async createAddress(createAddressDto: CreateAddressDto): Promise<number> {
    const {
      countryName,
      stateName,
      cityName,
      addressLine1,
      addressLine2,
      postalCode,
      phoneNumber,
    } = createAddressDto;

    const countryId = await this.findOrCreateCountry(countryName);

    let stateId: number | undefined = undefined; // Ensure stateId can be undefined if stateName is not provided
    if (stateName) {
      // Only create or find state if stateName is provided
      stateId = await this.findOrCreateState(stateName, countryId);
    }

    const [newAddress] = await this.database
      .insert(schema.addresses)
      .values({
        countryId,
        stateId,
        city: cityName,
        addressLine1,
        addressLine2,
        postalCode,
        phoneNumber,
      })
      .returning({ id: schema.addresses.id });

    if (!newAddress) {
      throw new InternalServerErrorException('Failed to create address');
    }
    return newAddress.id;
  }

  async getStatesByCountryName(countryName: string): Promise<StateDto[]> {
    const country = await this.database.query.countries.findFirst({
      where: eq(schema.countries.name, countryName),
      with: {
        states: true,
      },
    });

    if (!country) {
      throw new NotFoundException(
        `Country with name "${countryName}" not found.`,
      );
    }

    if (!country.states || country.states.length === 0) {
      // Or return an empty array if that's preferred & controller handles message
      // For now, let's adhere to "meaningful message if ... has no states" by throwing
      // However, the prompt also says "return all corresponding states".
      // An empty array is a valid representation of "all states" if there are none.
      // The controller can then decide to return a 204 No Content or a 200 OK with an empty array.
      // Let's return an empty array from the service.
      return [];
    }

    return country.states.map((state) => ({
      id: state.id,
      name: state.name,
    }));
  }

  async getAllCountriesWithStates(): Promise<CountryWithStatesDto[]> {
    const countriesWithStates = await this.database.query.countries.findMany({
      with: {
        states: true,
      },
    });

    return countriesWithStates.map((country) => ({
      id: country.id,
      name: country.name,
      states: country.states.map((state) => ({
        id: state.id,
        name: state.name,
      })),
    }));
  }
}
