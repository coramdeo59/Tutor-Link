import { Controller, Get, Param } from '@nestjs/common';
import { AuthType } from 'src/auth/authentication/enums/auth-type.enum';
import { Auth } from 'src/auth/authentication/decorators/auth-decorator';
import { AddressService } from './address.service';
import { StateDto } from './dtos/state.dto';
import { CountryWithStatesDto } from './dtos/country-with-states.dto';

@Auth(AuthType.None)
@Controller('address')
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Get('countries-with-states')
  async getAllCountriesWithStates(): Promise<CountryWithStatesDto[]> {
    return this.addressService.getAllCountriesWithStates();
  }

  @Get('states/:countryName')
  async getStatesByCountryName(
    @Param('countryName') countryName: string,
  ): Promise<StateDto[]> {
    const states =
      await this.addressService.getStatesByCountryName(countryName);
    return states;
  }
}
