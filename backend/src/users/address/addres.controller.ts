import {
  Post,
  Get,
  Body,
  Controller,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { AuthType } from 'src/auth/authentication/enums/auth-type.enum';
import { Auth } from 'src/auth/authentication/decorators/auth-decorator';
import { AddressService } from './address.service';
import { CreateStateDto } from './dtos/create-state.dto';
import { CreateCityDto } from './dtos/create-city.dto';

@Auth(AuthType.None)
@Controller('address')
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  /**
   * Create a new state
   */
  @Post('states')
  async createState(@Body() createStateDto: CreateStateDto) {
    return this.addressService.createState(createStateDto);
  }

  /**
   * Create a new city
   */
  @Post('cities')
  async createCity(@Body() createCityDto: CreateCityDto) {
    return this.addressService.createCity(createCityDto);
  }

  /**
   * Get all states
   */
  @Get('states')
  async getAllStates() {
    return this.addressService.getAllStates();
  }

  /**
   * Get cities for a specific state
   */
  @Get('states/:stateId/cities')
  async getCitiesByState(@Param('stateId', ParseIntPipe) stateId: number) {
    return this.addressService.getCitiesByState(stateId);
  }
}
