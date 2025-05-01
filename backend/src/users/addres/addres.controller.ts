import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { AddresService } from './addres.service';
import { CreateAddressDto, UpdateAddressDto } from './dtos/address.dto';

@Controller('addresses')
export class AddresController {
  constructor(private readonly addresService: AddresService) {}

  @Post()
  async create(@Body() createAddressDto: CreateAddressDto) {
    return this.addresService.createAddress(createAddressDto);
  }

  @Get()
  async findAll() {
    return this.addresService.findAllAddresses();
  }

  @Get(':id')
  async findOne(@Param('id', new ParseIntPipe()) id: number) {
    return this.addresService.findAddressById(id);
  }

  @Put(':id')
  async update(
    @Param('id', new ParseIntPipe()) id: number,
    @Body() updateAddressDto: UpdateAddressDto,
  ) {
    return this.addresService.updateAddress(id, updateAddressDto);
  }

  @Delete(':id')
  async remove(@Param('id', new ParseIntPipe()) id: number) {
    return this.addresService.removeAddress(id);
  }
}
