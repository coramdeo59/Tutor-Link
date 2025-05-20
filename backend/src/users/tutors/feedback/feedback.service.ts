import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { feedbackTypes } from './schema/feedback.schema';

// Define interface for the feedback object
export interface Feedback {
  id: number;
  tutorId: number;
  childId: number;
  parentId?: number;
  title: string;
  content: string;
  feedbackType: typeof feedbackTypes[number];
  sessionId?: number;
  subjectId?: number;
  assignmentId?: number;
  isPrivate: boolean;
  isAcknowledged: boolean;
  acknowledgedAt?: Date;
  acknowledgedBy?: number;
  rating?: number;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class FeedbackService {
  // In-memory storage for feedback (temporary until DB integration)
  private feedbacks: Feedback[] = [];
  private nextId = 1;

  // Create new feedback
  createFeedback(createFeedbackDto: CreateFeedbackDto, tutorId: number): Feedback {
    const feedback: Feedback = {
      id: this.nextId++,
      tutorId,
      childId: createFeedbackDto.childId,
      title: createFeedbackDto.title,
      content: createFeedbackDto.content,
      feedbackType: createFeedbackDto.feedbackType as typeof feedbackTypes[number],
      parentId: createFeedbackDto.parentId,
      sessionId: createFeedbackDto.sessionId,
      subjectId: createFeedbackDto.subjectId,
      assignmentId: createFeedbackDto.assignmentId,
      isPrivate: createFeedbackDto.isPrivate ?? false, // Default to false if undefined
      isAcknowledged: false,
      acknowledgedAt: undefined,
      acknowledgedBy: undefined,
      rating: createFeedbackDto.rating,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.feedbacks.push(feedback);
    return feedback;
  }

  // Get all feedback for a child
  async getFeedbackForChild(childId: number) {
    return this.feedbacks.filter(feedback => feedback.childId === childId);
  }

  // Get all feedback created by a tutor
  async getFeedbackByTutor(tutorId: number) {
    return this.feedbacks.filter(feedback => feedback.tutorId === tutorId);
  }

  // Find feedback by ID
  findFeedbackById(id: number): Feedback {
    const feedback = this.feedbacks.find(f => f.id === id);
    if (!feedback) {
      throw new NotFoundException(`Feedback with ID ${id} not found`);
    }
    return feedback;
  }

  // Update existing feedback
  async updateFeedback(id: number, tutorId: number, updateData: Partial<CreateFeedbackDto>) {
    const feedbackIndex = this.feedbacks.findIndex(f => f.id === id);
    if (feedbackIndex === -1) {
      throw new NotFoundException(`Feedback with ID ${id} not found`);
    }

    const feedback = this.feedbacks[feedbackIndex];
    if (!feedback) {
      throw new NotFoundException(`Feedback with ID ${id} not found`);
    }

    // Verify the tutor is the owner of this feedback
    if (feedback.tutorId !== tutorId) {
      throw new BadRequestException('You can only update your own feedback');
    }

    // Update the feedback
    this.feedbacks[feedbackIndex] = {
      ...feedback,
      ...updateData,
      updatedAt: new Date()
    } as Feedback;

    return this.feedbacks[feedbackIndex];
  }

  // Delete feedback
  async deleteFeedback(id: number, tutorId: number) {
    const feedbackIndex = this.feedbacks.findIndex(f => f.id === id);
    if (feedbackIndex === -1) {
      throw new NotFoundException(`Feedback with ID ${id} not found`);
    }

    const feedback = this.feedbacks[feedbackIndex];
    if (!feedback) {
      throw new NotFoundException(`Feedback with ID ${id} not found`);
    }

    // Verify the tutor is the owner of this feedback
    if (feedback.tutorId !== tutorId) {
      throw new BadRequestException('You can only delete your own feedback');
    }

    // Remove the feedback
    this.feedbacks.splice(feedbackIndex, 1);
    return { success: true, id };
  }
}
