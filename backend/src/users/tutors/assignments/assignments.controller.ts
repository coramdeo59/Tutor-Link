import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards, ParseIntPipe } from '@nestjs/common';
import { AssignmentsService, Assignment, Submission } from './assignments.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentSubmissionDto } from './dto/update-assignment-submission.dto';
import { ActiveUser } from '../../../auth/authentication/decorators/active-user.decorator';
import { ActiveUserData } from '../../../auth/interfaces/active-user.data.interface';
import { AccessTokenGuard } from '../../../auth/authentication/guards/access-token/access-token.guard';
import { RolesGuard } from '../../../auth/authentication/guards/roles/roles.guard';
import { Roles } from '../../../auth/authentication/decorators/roles.decorator';
import { Role } from '../../../users/enums/role.enum';

@Controller('tutors/assignments')
@UseGuards(AccessTokenGuard, RolesGuard)
export class AssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  // Create new assignment and assign to a child
  @Post()
  @Roles(Role.TUTOR)
  async createAssignment(
    @Body() createAssignmentDto: CreateAssignmentDto,
    @ActiveUser() user: ActiveUserData
  ): Promise<{assignment: Assignment, submission: Submission}> {
    return this.assignmentsService.createAssignment(user.sub, createAssignmentDto);
  }

  // Get all assignments created by the current tutor
  @Get('my-assignments')
  @Roles(Role.TUTOR)
  async getMyAssignments(@ActiveUser() user: ActiveUserData): Promise<Assignment[]> {
    return this.assignmentsService.getAssignmentsByTutor(user.sub);
  }

  // Get a specific assignment by ID
  @Get(':id')
  @Roles(Role.TUTOR, Role.PARENT, Role.CHILD)
  async getAssignmentById(@Param('id', ParseIntPipe) id: number): Promise<Assignment> {
    return this.assignmentsService.getAssignmentById(id);
  }

  // Get all submissions for a specific assignment
  @Get(':id/submissions')
  @Roles(Role.TUTOR)
  async getSubmissionsForAssignment(
    @Param('id', ParseIntPipe) id: number,
    @ActiveUser() user: ActiveUserData
  ): Promise<Submission[]> {
    return this.assignmentsService.getSubmissionsForAssignment(id, user.sub);
  }

  // Get all assignments for a specific child
  @Get('child/:childId')
  @Roles(Role.TUTOR, Role.PARENT, Role.CHILD)
  async getAssignmentsForChild(@Param('childId', ParseIntPipe) childId: number): Promise<Assignment[]> {
    return this.assignmentsService.getAssignmentsForChild(childId);
  }

  // Update a submission (grading by tutor)
  @Put('submissions/:id')
  @Roles(Role.TUTOR)
  async updateSubmission(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateData: UpdateAssignmentSubmissionDto,
    @ActiveUser() user: ActiveUserData
  ): Promise<Submission> {
    return this.assignmentsService.updateSubmission(id, user.sub, updateData);
  }

  // Delete an assignment
  @Delete(':id')
  @Roles(Role.TUTOR)
  async deleteAssignment(
    @Param('id', ParseIntPipe) id: number,
    @ActiveUser() user: ActiveUserData
  ): Promise<{ success: boolean; id: number }> {
    return this.assignmentsService.deleteAssignment(id, user.sub);
  }
}
