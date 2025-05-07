import { Test, TestingModule } from '@nestjs/testing';
import { AddresController } from './addres.controller';
import { AddresService } from './addres.service';

describe('AddresController', () => {
  let controller: AddresController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AddresController],
      providers: [AddresService],
    }).compile();

    controller = module.get<AddresController>(AddresController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
