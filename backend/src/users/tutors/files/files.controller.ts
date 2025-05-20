import { Controller, Get, Post, Body, Param, Delete, UseGuards, ParseIntPipe, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilesService, TutorFile } from './files.service';
import { UploadFileDto } from './dto/upload-file.dto';
import { ActiveUser } from '../../../auth/authentication/decorators/active-user.decorator';
import { ActiveUserData } from '../../../auth/interfaces/active-user.data.interface';
import { AccessTokenGuard } from '../../../auth/authentication/guards/access-token/access-token.guard';
import { RolesGuard } from '../../../auth/authentication/guards/roles/roles.guard';
import { Roles } from '../../../auth/authentication/decorators/roles.decorator';
import { Role } from '../../../users/enums/role.enum';

// No longer needed as file uploads are handled in the service

@Controller('tutors/files')
@UseGuards(AccessTokenGuard, RolesGuard)
export class FilesController {
  constructor(
    private readonly filesService: FilesService
  ) {}

  // Upload a new file
  @Post('upload')
  @Roles(Role.TUTOR)
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadFileDto: UploadFileDto,
    @ActiveUser() user: ActiveUserData
  ): Promise<TutorFile> {
    // The service now handles the Cloudinary upload internally
    return this.filesService.uploadFile(user.sub, uploadFileDto, file);
  }

  // Get all files uploaded by the current tutor
  @Get('my-files')
  @Roles(Role.TUTOR)
  async getMyFiles(@ActiveUser() user: ActiveUserData): Promise<TutorFile[]> {
    return this.filesService.getFilesByTutor(user.sub);
  }

  // Get a specific file by ID
  @Get(':id')
  @Roles(Role.TUTOR, Role.PARENT, Role.CHILD)
  async getFileById(@Param('id', ParseIntPipe) id: number): Promise<TutorFile> {
    return this.filesService.getFileById(id);
  }

  // Get all files for a specific child
  @Get('child/:childId')
  @Roles(Role.TUTOR, Role.PARENT, Role.CHILD)
  async getFilesForChild(@Param('childId', ParseIntPipe) childId: number): Promise<TutorFile[]> {
    return this.filesService.getFilesForChild(childId);
  }

  // Get files related to a specific assignment
  @Get('assignment/:assignmentId')
  @Roles(Role.TUTOR, Role.PARENT, Role.CHILD)
  async getFilesByAssignment(@Param('assignmentId', ParseIntPipe) assignmentId: number): Promise<TutorFile[]> {
    return this.filesService.getFilesByAssignment(assignmentId);
  }

  // Get files related to a specific session
  @Get('session/:sessionId')
  @Roles(Role.TUTOR, Role.PARENT, Role.CHILD)
  async getFilesBySession(@Param('sessionId', ParseIntPipe) sessionId: number): Promise<TutorFile[]> {
    return this.filesService.getFilesBySession(sessionId);
  }

  // Get files related to a specific subject for a child
  @Get('child/:childId/subject/:subjectId')
  @Roles(Role.TUTOR, Role.PARENT, Role.CHILD)
  async getFilesBySubject(
    @Param('childId', ParseIntPipe) childId: number,
    @Param('subjectId', ParseIntPipe) subjectId: number
  ): Promise<TutorFile[]> {
    return this.filesService.getFilesBySubject(childId, subjectId);
  }

  // Delete a file
  @Delete(':id')
  @Roles(Role.TUTOR)
  async deleteFile(
    @Param('id', ParseIntPipe) id: number,
    @ActiveUser() user: ActiveUserData
  ): Promise<{ success: boolean; id: number }> {
    return this.filesService.deleteFile(id, user.sub);
  }
}
