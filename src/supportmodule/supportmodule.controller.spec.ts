import { Test, TestingModule } from '@nestjs/testing';
import { SupportmoduleController } from './supportmodule.controller';
import { SupportmoduleService } from './supportmodule.service';

describe('SupportmoduleController', () => {
  let controller: SupportmoduleController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SupportmoduleController],
      providers: [SupportmoduleService],
    }).compile();

    controller = module.get<SupportmoduleController>(SupportmoduleController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
