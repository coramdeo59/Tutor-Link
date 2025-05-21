import { Controller, Get, Post, Body, Param, Put, Patch, UseGuards, ParseIntPipe } from '@nestjs/common';
import { SessionsService, TutoringSession } from './sessions.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { ActiveUser } from '../../../auth/authentication/decorators/active-user.decorator';
import { ActiveUserData } from '../../../auth/interfaces/active-user.data.interface';
import { AccessTokenGuard } from '../../../auth/authentication/guards/access-token/access-token.guard';
// Import from auth decorators in the appropriate location based on project structure
import { Roles } from '../../../auth/authentication/decorators/roles.decorator';
import { RolesGuard } from '../../../auth/authentication/guards/roles/roles.guard';
import { Role } from '../../../users/enums/role.enum';

@Controller('tutors/sessions')
@UseGuards(AccessTokenGuard, RolesGuard)
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  // Create a new session
  @Post()
  @Roles(Role.TUTOR)
  async createSession(
    @Body() createSessionDto: CreateSessionDto,
    @ActiveUser() user: ActiveUserData
  ): Promise<TutoringSession> {
    return this.sessionsService.createSession(user.sub, createSessionDto);
  }

  // Get all sessions for the current tutor
  @Get('my-sessions')
  @Roles(Role.TUTOR)
  async getMyTutoringSessions(@ActiveUser() user: ActiveUserData): Promise<TutoringSession[]> {
    return this.sessionsService.getSessionsByTutor(user.sub);
  }

  // Get a specific session by ID
  @Get(':id')
  @Roles(Role.TUTOR, Role.PARENT, Role.CHILD)
  async getSessionById(@Param('id', ParseIntPipe) id: number): Promise<TutoringSession> {
    return this.sessionsService.getSessionById(id);
  }

  // Get all sessions for a specific child
  @Get('child/:childId')
  @Roles(Role.TUTOR, Role.PARENT, Role.CHILD)
  async getSessionsForChild(@Param('childId', ParseIntPipe) childId: number): Promise<TutoringSession[]> {
    return this.sessionsService.getSessionsForChild(childId);
  }

  // Update a session (only tutor who created it can update)
  @Put(':id')
  @Roles(Role.TUTOR)
  async updateSession(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSessionDto: UpdateSessionDto,
    @ActiveUser() user: ActiveUserData
  ): Promise<TutoringSession> {
    return this.sessionsService.updateSession(id, user.sub, updateSessionDto);
  }

  // Cancel a session
  @Put(':id/cancel')
  @Roles(Role.TUTOR)
  async cancelSession(
    @Param('id', ParseIntPipe) id: number,
    @ActiveUser() user: ActiveUserData
  ): Promise<TutoringSession> {
    return this.sessionsService.cancelSession(id, user.sub);
  }

  // Complete a session
  @Put(':id/complete')
  @Roles(Role.TUTOR)
  async completeSession(
    @Param('id', ParseIntPipe) id: number,
    @ActiveUser() user: ActiveUserData
  ): Promise<TutoringSession> {
    return this.sessionsService.completeSession(id, user.sub);
  }

  // Update session status
  @Patch(':id/status')
  @Roles(Role.TUTOR)
  async updateSessionStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStatusDto: UpdateStatusDto,
    @ActiveUser() user: ActiveUserData
  ): Promise<TutoringSession> {
    return this.sessionsService.updateSessionStatus(id, user.sub, updateStatusDto.status);
  }
}
