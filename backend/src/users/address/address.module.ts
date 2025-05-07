import { Module } from '@nestjs/common';
import { AddressService } from './address.service';
import { AddressController } from './addres.controller';

@Module({
  controllers: [AddressController],
  providers: [AddressService],
  exports: [AddressService],
})
export class AddressModule {}
