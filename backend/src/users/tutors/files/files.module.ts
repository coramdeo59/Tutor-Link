import { Module } from '@nestjs/common';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { CloudinaryModule } from '../../../cloudinary/cloudinary.module';
import { AuthModule } from '../../../auth/auth.module';

@Module({
  imports: [CloudinaryModule, AuthModule],
  providers: [FilesService],
  controllers: [FilesController],
  exports: [FilesService],
})
export class FilesModule {}
