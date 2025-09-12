import { Test, TestingModule } from '@nestjs/testing';
import { SupportmoduleService } from './supportmodule.service';

describe('SupportmoduleService', () => {
  let service: SupportmoduleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SupportmoduleService],
    }).compile();

    service = module.get<SupportmoduleService>(SupportmoduleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
