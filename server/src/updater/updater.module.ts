import { Module } from '@nestjs/common';
import { UpdaterController } from './updater.controller.js';

@Module({
  controllers: [UpdaterController],
})
export class UpdaterModule {}
