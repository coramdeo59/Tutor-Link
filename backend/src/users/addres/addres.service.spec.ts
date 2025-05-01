import { Test, TestingModule } from '@nestjs/testing';
import { AddresService } from './addres.service';

describe('AddresService', () => {
  let service: AddresService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AddresService],
    }).compile();

    service = module.get<AddresService>(AddresService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
