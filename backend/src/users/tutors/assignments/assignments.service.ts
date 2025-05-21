import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentSubmissionDto } from './dto/update-assignment-submission.dto';
import { assignmentStatus, submissionStatus } from './schema/assignments.schema';

// Define interfaces for assignment objects
export interface Assignment {
  id: number;
  tutorId: number;
  title: string;
  description: string;
  instructions: string;
  subjectId?: number;
  gradeLevel?: string;
  dueDate: Date;
  status: typeof assignmentStatus[number];
  resourceUrls?: string[];
  maxScore?: number;
  estimatedTimeMinutes?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Submission {
  id: number;
  assignmentId: number;
  childId: number;
  status: typeof submissionStatus[number];
  score?: number;
  comments?: string;
  submissionText?: string;
  fileUrl?: string;
  assignedAt: Date;
  submittedAt?: Date;
  gradedAt?: Date;
}

@Injectable()
export class AssignmentsService {
  // In-memory storage (temporary until DB integration)
  private assignments: Assignment[] = [];
  private submissions: Submission[] = [];
  private nextAssignmentId = 1;
  private nextSubmissionId = 1;

  // Create a new assignment and assign it to a child
  async createAssignment(tutorId: number, createAssignmentDto: CreateAssignmentDto) {
    const { childId, ...assignmentData } = createAssignmentDto;

    // Create the assignment with proper typing
    const newAssignment: Assignment = {
      id: this.nextAssignmentId++,
      tutorId,
      title: assignmentData.title,
      description: assignmentData.description,
      instructions: assignmentData.instructions,
      subjectId: assignmentData.subjectId,
      dueDate: new Date(assignmentData.dueDate), // Convert string to Date
      status: 'assigned' as typeof assignmentStatus[number], // Add status
      maxScore: assignmentData.maxScore,
      estimatedTimeMinutes: assignmentData.estimatedTimeMinutes,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.assignments.push(newAssignment);

    // Create a submission record to track this child's progress
    const newSubmission: Submission = {
      id: this.nextSubmissionId++,
      assignmentId: newAssignment.id,
      childId,
      status: 'not_started' as typeof submissionStatus[number],
      assignedAt: new Date()
    };
    this.submissions.push(newSubmission);

    return { assignment: newAssignment, submission: newSubmission };
  }

  // Get all assignments created by a tutor
  async getAssignmentsByTutor(tutorId: number) {
    return this.assignments.filter(a => a.tutorId === tutorId);
  }

  // Get assignment by ID
  async getAssignmentById(id: number) {
    const assignment = this.assignments.find(a => a.id === id);
    if (!assignment) {
      throw new NotFoundException(`Assignment with ID ${id} not found`);
    }
    return assignment;
  }

  // Get all submissions for an assignment
  async getSubmissionsForAssignment(assignmentId: number, tutorId: number) {
    const assignment = await this.getAssignmentById(assignmentId);
    
    // Ensure the tutor is the creator of this assignment
    if (assignment.tutorId !== tutorId) {
      throw new BadRequestException('You can only view submissions for your own assignments');
    }
    
    return this.submissions.filter(s => s.assignmentId === assignmentId);
  }

  // Get all assignments for a specific child
  async getAssignmentsForChild(childId: number) {
    // Get all submissions for this child
    const childSubmissions = this.submissions.filter(s => s.childId === childId);
    
    // Get the corresponding assignments
    const assignmentIds = childSubmissions.map(s => s.assignmentId);
    const childAssignments = this.assignments.filter(a => assignmentIds.includes(a.id));
    
    // Combine assignment and submission data
    return childAssignments.map(assignment => {
      const submission = childSubmissions.find(s => s.assignmentId === assignment.id);
      return {
        ...assignment,
        submission: submission ? {
          status: submission.status,
          score: submission.score,
          submittedAt: submission.submittedAt,
          gradedAt: submission.gradedAt
        } : null
      };
    });
  }

  // Update a submission (by tutor - for grading)
  async updateSubmission(submissionId: number, tutorId: number, updateData: UpdateAssignmentSubmissionDto) {
    const submissionIndex = this.submissions.findIndex(s => s.id === submissionId);
    if (submissionIndex === -1) {
      throw new NotFoundException(`Submission with ID ${submissionId} not found`);
    }
    
    // Since we've confirmed submissionIndex is valid, we can safely access the submission
    const existingSubmission = this.submissions[submissionIndex];
    // Double-check to satisfy TypeScript
    if (!existingSubmission) {
      throw new NotFoundException(`Submission with ID ${submissionId} not found`);
    }
    
    // Get the associated assignment to verify the tutor
    const assignment = this.assignments.find(a => 
      a.id === existingSubmission.assignmentId
    );
    
    if (!assignment || assignment.tutorId !== tutorId) {
      throw new BadRequestException('You can only update submissions for your own assignments');
    }
    
    // Explicitly create a new submission with all required fields
    const updatedSubmission: Submission = {
      id: existingSubmission.id,
      assignmentId: existingSubmission.assignmentId,
      childId: existingSubmission.childId,
      status: existingSubmission.status,
      assignedAt: existingSubmission.assignedAt,
      // Optional fields need null checks
      submittedAt: existingSubmission.submittedAt || undefined,
      gradedAt: existingSubmission.gradedAt || undefined,
      score: existingSubmission.score || undefined,
      comments: existingSubmission.comments || undefined,
      submissionText: existingSubmission.submissionText || undefined,
      fileUrl: existingSubmission.fileUrl || undefined
    };
    
    // Apply updates from the DTO with proper typing
    if (updateData.status) {
      updatedSubmission.status = updateData.status as typeof submissionStatus[number];
      // If status is being set to 'graded', set the gradedAt timestamp
      if (updateData.status === 'graded') {
        updatedSubmission.gradedAt = new Date();
      }
    }
    
    if (updateData.score !== undefined) {
      updatedSubmission.score = updateData.score;
    }
    
    if (updateData.comments !== undefined) {
      updatedSubmission.comments = updateData.comments;
    }
    
    if (updateData.submissionText !== undefined) {
      updatedSubmission.submissionText = updateData.submissionText;
    }
    
    if (updateData.fileUrl !== undefined) {
      updatedSubmission.fileUrl = updateData.fileUrl;
    }
    
    // Update the submission in the array
    this.submissions[submissionIndex] = updatedSubmission;
    
    return this.submissions[submissionIndex];
  }

  // Delete an assignment (and its submissions)
  async deleteAssignment(id: number, tutorId: number) {
    const assignmentIndex = this.assignments.findIndex(a => a.id === id);
    if (assignmentIndex === -1) {
      throw new NotFoundException(`Assignment with ID ${id} not found`);
    }
    
    const assignment = this.assignments[assignmentIndex];
    if (!assignment) {
      throw new NotFoundException(`Assignment with ID ${id} not found`);
    }
    
    // Verify the tutor is the creator
    if (assignment.tutorId !== tutorId) {
      throw new BadRequestException('You can only delete your own assignments');
    }
    
    // Remove the assignment
    this.assignments.splice(assignmentIndex, 1);
    
    // Remove all associated submissions
    this.submissions = this.submissions.filter(s => s.assignmentId !== id);
    
    return { success: true, id };
  }

  // Quick assign homework to a student (simplified version)
  async quickAssign(tutorId: number, quickAssignmentData: any) {
    // Validate the child exists (in a real app, this would have DB validation)
    const { childId, title, description, subjectId, dueDate, notes } = quickAssignmentData;
    
    if (!childId || !title || !subjectId || !dueDate) {
      throw new BadRequestException('Missing required fields for quick assignment');
    }
    
    // Create a simplified assignment
    const newAssignment: Assignment = {
      id: this.nextAssignmentId++,
      tutorId,
      title,
      description,
      instructions: notes || description, // Use notes as instructions if provided
      subjectId,
      dueDate: new Date(dueDate),
      status: 'assigned' as typeof assignmentStatus[number],
      maxScore: 100, // Default score
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.assignments.push(newAssignment);
    
    // Create submission record
    const newSubmission: Submission = {
      id: this.nextSubmissionId++,
      assignmentId: newAssignment.id,
      childId,
      status: 'not_started' as typeof submissionStatus[number],
      assignedAt: new Date()
    };
    
    this.submissions.push(newSubmission);
    
    return { 
      success: true,
      assignment: newAssignment, 
      submission: newSubmission,
      message: `Assignment "${title}" successfully assigned to student`
    };
  }
}
