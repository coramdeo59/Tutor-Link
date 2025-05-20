import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards, ParseIntPipe } from '@nestjs/common';
import { FeedbackService, Feedback } from './feedback.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { ActiveUser } from '../../../auth/authentication/decorators/active-user.decorator';
import { ActiveUserData } from '../../../auth/interfaces/active-user.data.interface';
import { AccessTokenGuard } from '../../../auth/authentication/guards/access-token/access-token.guard';
import { RolesGuard } from '../../../auth/authentication/guards/roles/roles.guard';
import { Roles } from '../../../auth/authentication/decorators/roles.decorator';
import { Role } from '../../../users/enums/role.enum';

@Controller('tutors/feedback')
@UseGuards(AccessTokenGuard, RolesGuard)
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  // Create new feedback (only tutors can create feedback)
  @Post()
  @Roles(Role.TUTOR)
  async createFeedback(
    @Body() createFeedbackDto: CreateFeedbackDto,
    @ActiveUser() user: ActiveUserData
  ): Promise<Feedback> {
    return this.feedbackService.createFeedback(createFeedbackDto, user.sub);
  }

  // Get all feedback created by the current tutor
  @Get('my-feedback')
  @Roles(Role.TUTOR)
  async getMyFeedback(@ActiveUser() user: ActiveUserData): Promise<Feedback[]> {
    return this.feedbackService.getFeedbackByTutor(user.sub);
  }

  // Get all feedback for a specific child
  @Get('child/:childId')
  @Roles(Role.TUTOR, Role.PARENT)
  async getFeedbackForChild(
    @Param('childId', ParseIntPipe) childId: number,
    @ActiveUser() user: ActiveUserData
  ): Promise<Feedback[]> {
    // Note: In a real implementation, you would check if this tutor/parent is authorized to see this child's feedback
    return this.feedbackService.getFeedbackForChild(childId);
  }

  // Get a specific feedback by ID
  @Get(':id')
  @Roles(Role.TUTOR, Role.PARENT, Role.CHILD)
  async getFeedbackById(@Param('id', ParseIntPipe) id: number): Promise<Feedback> {
    return this.feedbackService.findFeedbackById(id);
  }

  // Update existing feedback (only the tutor who created it can update)
  @Put(':id')
  @Roles(Role.TUTOR)
  async updateFeedback(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateData: Partial<CreateFeedbackDto>,
    @ActiveUser() user: ActiveUserData
  ): Promise<Feedback> {
    return this.feedbackService.updateFeedback(id, user.sub, updateData);
  }

  // Delete feedback (only the tutor who created it can delete)
  @Delete(':id')
  @Roles(Role.TUTOR)
  async deleteFeedback(
    @Param('id', ParseIntPipe) id: number,
    @ActiveUser() user: ActiveUserData
  ) {
    return this.feedbackService.deleteFeedback(id, user.sub);
  }
}
