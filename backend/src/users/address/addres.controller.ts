import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthType } from 'src/auth/authentication/enums/auth-type.enum';
import { Auth } from 'src/auth/authentication/decorators/auth-decorator';
import { AddressService } from './address.service';
import { ActiveUser } from 'src/auth/Decorators/active-user.decorator';
import { ActiveUserData } from 'src/auth/interfaces/active-user-data.interface';
import { UpsertAddressDto } from './dtos/upsert-address.dto';
import { SearchAddressQueryDto } from './dtos/search-address-query.dto';
import { AddressResponseDto } from './dtos/address-response.dto';
import { AddressDto } from './dtos/address.dto';

@Auth(AuthType.Bearer) // Changed to AuthType.Bearer to ensure ActiveUser is populated
@Controller('address')
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  /**
   * Create a new address for the authenticated user
   */
  @Post()
  async createAddress(
    @ActiveUser() user: ActiveUserData, // Get user from ActiveUser decorator
    @Body() addressDto: AddressDto,
  ): Promise<AddressResponseDto> {
    return this.addressService.create(user.sub, addressDto); // Pass userId and DTO
  }

  /**
   * Get address by ID
   */
  @Get(':id')
  async getAddressById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<AddressResponseDto> {
    return this.addressService.findById(id);
  }

  /**
   * Update address by ID
   */
  @Put(':id')
  async updateAddress(
    @Param('id', ParseIntPipe) id: number,
    @Body() addressDto: Partial<UpsertAddressDto>,
  ): Promise<AddressResponseDto> {
    return this.addressService.update(id, addressDto);
  }

  /**
   * Delete address by ID
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAddress(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.addressService.delete(id);
  }

  /**
   * Get current user's address
   */
  @Get('me')
  async getCurrentUserAddress(
    @ActiveUser() user: ActiveUserData,
  ): Promise<AddressResponseDto | null> {
    return this.addressService.findByUserId(user.sub);
  }

  /**
   * Create or update current user's address
   */
  @Post('me')
  async upsertCurrentUserAddress(
    @ActiveUser() user: ActiveUserData,
    @Body() addressDto: UpsertAddressDto,
  ): Promise<AddressResponseDto> {
    return this.addressService.upsert(user.sub, addressDto);
  }

  /**
   * Delete current user's address
   */
  @Delete('me')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteCurrentUserAddress(
    @ActiveUser() user: ActiveUserData,
  ): Promise<void> {
    await this.addressService.deleteByUserId(user.sub);
  }

  /**
   * Get address by user ID
   */
  @Get('user/:userId')
  async getAddressByUserId(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<AddressResponseDto | null> {
    return this.addressService.findByUserId(userId);
  }

  /**
   * Search addresses by criteria
   */
  @Get('search')
  async searchAddresses(
    @Query() query: SearchAddressQueryDto,
  ): Promise<AddressResponseDto[]> {
    return this.addressService.search(query);
  }
}
