import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { UploadFileDto } from './dto/upload-file.dto';
import { fileTypes } from './schema/files.schema';
import { CloudinaryService } from '../../../cloudinary/cloudinary.service';

// Define interface for file objects
export interface TutorFile {
  id: number;
  tutorId: number;
  childId: number;
  fileName: string;
  fileType: typeof fileTypes[number];
  fileSize: number;
  mimeType: string;
  cloudinaryUrl: string;
  cloudinaryPublicId: string;
  subjectId?: number;
  assignmentId?: number;
  sessionId?: number;
  description?: string;
  category?: string;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class FilesService {
  // In-memory storage (temporary until DB integration)
  private files: TutorFile[] = [];
  private nextId = 1;

  constructor(private readonly cloudinaryService: CloudinaryService) {}

  // Upload/store a new file
  async uploadFile(tutorId: number, uploadFileDto: UploadFileDto, file: Express.Multer.File) {
    // First upload the file to Cloudinary
    const cloudinaryData = await this.cloudinaryService.uploadFile(file);

    // Create file metadata record
    const newFile: TutorFile = {
      id: this.nextId++,
      tutorId,
      childId: uploadFileDto.childId,
      fileName: file.originalname,
      fileType: uploadFileDto.fileType as typeof fileTypes[number],
      fileSize: file.size,
      mimeType: file.mimetype,
      description: uploadFileDto.description,
      assignmentId: uploadFileDto.assignmentId,
      sessionId: uploadFileDto.sessionId,
      subjectId: uploadFileDto.subjectId,
      cloudinaryUrl: cloudinaryData.secure_url,
      cloudinaryPublicId: cloudinaryData.public_id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.files.push(newFile);
    return newFile;
  }

  // Get all files uploaded by a tutor
  async getFilesByTutor(tutorId: number) {
    return this.files.filter(file => file.tutorId === tutorId);
  }

  // Get all files for a specific child
  async getFilesForChild(childId: number) {
    return this.files.filter(file => file.childId === childId);
  }

  // Get a specific file by ID
  async getFileById(id: number) {
    const file = this.files.find(f => f.id === id);
    if (!file) {
      throw new NotFoundException(`File with ID ${id} not found`);
    }
    return file;
  }

  // Get files related to a specific assignment
  async getFilesByAssignment(assignmentId: number) {
    return this.files.filter(file => file.assignmentId === assignmentId);
  }

  // Get files related to a specific session
  async getFilesBySession(sessionId: number) {
    return this.files.filter(file => file.sessionId === sessionId);
  }

  // Get files related to a specific subject for a child
  async getFilesBySubject(childId: number, subjectId: number) {
    return this.files.filter(file => 
      file.childId === childId && file.subjectId === subjectId
    );
  }

  // Delete a file
  async deleteFile(id: number, tutorId: number) {
    const fileIndex = this.files.findIndex(f => f.id === id);
    if (fileIndex === -1) {
      throw new NotFoundException(`File with ID ${id} not found`);
    }
    
    const file = this.files[fileIndex];
    if (!file) {
      throw new NotFoundException(`File with ID ${id} not found`);
    }
    
    // Ensure the tutor is the one who uploaded this file
    if (file.tutorId !== tutorId) {
      throw new BadRequestException('You can only delete files you uploaded');
    }
    
    try {
      // Delete from Cloudinary first
      await this.cloudinaryService.deleteFile(file.cloudinaryPublicId);
      
      // If successful, remove the file record
      this.files.splice(fileIndex, 1);
      
      return { success: true, id };
    } catch (error) {
      throw new BadRequestException(`Failed to delete file from storage: ${error.message}`);
    }
  }
}
