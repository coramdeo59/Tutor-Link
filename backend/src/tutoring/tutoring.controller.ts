import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Query,
  ParseIntPipe,
  Body,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
  DefaultValuePipe,
} from '@nestjs/common';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateProgressDto } from './dto/update-progress.dto';
import { RecordLearningHoursDto } from './dto/record-learning-hours.dto';
import { DashboardSettingsDto } from './dto/dashboard-settings.dto';
import { TutoringService } from './tutoring.service';
import { Auth } from 'src/auth/authentication/decorators/auth-decorator';
import { AuthType } from 'src/auth/authentication/enums/auth-type.enum';
import { ActiveUser } from 'src/auth/Decorators/active-user.decorator';
import { ActiveUserData } from 'src/auth/interfaces/active-user-data.interface';
import { Role } from 'src/users/enums/role-enums';
import { UpdateSessionDto } from './dto/update-session.dto';

@Auth(AuthType.Bearer) // Requires authentication
@Controller('tutoring')
export class TutoringController {
  constructor(private readonly tutoringService: TutoringService) {}

  /**
   * Get dashboard data for a child
   * Aggregates all the necessary data for the child dashboard
   */
  @Get('dashboard')
  async getChildDashboard(@ActiveUser() activeUser: ActiveUserData) {
    if (!activeUser || !activeUser.sub) {
      throw new UnauthorizedException('Authentication required');
    }

    // Ensure user is a child account
    if (activeUser.role !== Role.Child) {
      throw new UnauthorizedException(
        'Only child accounts can access this dashboard',
      );
    }

    const childId = Number(activeUser.sub);

    // Get upcoming sessions
    const upcomingSessions =
      await this.tutoringService.getUpcomingSessions(childId);

    // Get learning hours
    const learningHours =
      await this.tutoringService.getWeeklyLearningHoursSummary(childId);

    // Get subjects
    const subjects = await this.tutoringService.getChildSubjects(childId);

    // Get progress summary
    const progressSummary =
      await this.tutoringService.getProgressSummary(childId);

    // Get recent achievements
    const recentAchievements =
      await this.tutoringService.getRecentAchievements(childId);

    // Calculate next session (the first upcoming session)
    const nextSession =
      upcomingSessions.length > 0 ? upcomingSessions[0] : null;

    // Format the welcome message
    const name = activeUser.username ? activeUser.username : 'Student';
    const welcomeMessage = `Welcome back, ${name}!`;
    const sessionCountMessage = `You have ${upcomingSessions.length} upcoming sessions this week`;

    return {
      welcome: {
        message: welcomeMessage,
        sessionCount: sessionCountMessage,
      },
      stats: {
        upcomingSessionsCount: upcomingSessions.length,
        learningHours: learningHours.totalHours,
        subjectsCount: subjects.length,
      },
      upcomingSessions,
      learningHours,
      subjects,
      progressSummary,
      recentAchievements,
      nextSession,
    };
  }

  /**
   * Get upcoming sessions for a child
   */
  @Get('sessions/upcoming')
  async getUpcomingSessions(@ActiveUser() activeUser: ActiveUserData) {
    if (!activeUser || !activeUser.sub) {
      throw new UnauthorizedException('Authentication required');
    }

    // Ensure user is a child account or parent
    if (activeUser.role !== Role.Child && activeUser.role !== Role.Parent) {
      throw new UnauthorizedException(
        'Only child or parent accounts can access this data',
      );
    }

    const childId = Number(activeUser.sub);
    return this.tutoringService.getUpcomingSessions(childId);
  }

  /**
   * Get basic learning hours summary for a child
   * @deprecated Use the authenticated method with @Auth decorator instead
   */
  @Get('learning-hours/basic')
  async getBasicLearningHours(@ActiveUser() activeUser: ActiveUserData) {
    if (!activeUser || !activeUser.sub) {
      throw new UnauthorizedException('Authentication required');
    }

    // Ensure user is a child account or parent
    if (activeUser.role !== Role.Child && activeUser.role !== Role.Parent) {
      throw new UnauthorizedException(
        'Only child or parent accounts can access this data',
      );
    }

    const childId = Number(activeUser.sub);
    return this.tutoringService.getWeeklyLearningHoursSummary(childId);
  }

  /**
   * Get subjects for a child
   */
  @Get('subjects')
  async getChildSubjects(@ActiveUser() activeUser: ActiveUserData) {
    if (!activeUser || !activeUser.sub) {
      throw new UnauthorizedException('Authentication required');
    }

    // Ensure user is a child account or parent
    if (activeUser.role !== Role.Child && activeUser.role !== Role.Parent) {
      throw new UnauthorizedException(
        'Only child or parent accounts can access this data',
      );
    }

    const childId = Number(activeUser.sub);
    return this.tutoringService.getChildSubjects(childId);
  }

  /**
   * Get basic progress summary for a child
   */
  @Get('progress/basic')
  async getBasicProgressSummary(@ActiveUser() activeUser: ActiveUserData) {
    if (!activeUser || !activeUser.sub) {
      throw new UnauthorizedException('Authentication required');
    }

    // Ensure user is a child account or parent
    if (activeUser.role !== Role.Child && activeUser.role !== Role.Parent) {
      throw new UnauthorizedException(
        'Only child or parent accounts can access this data',
      );
    }

    const childId = Number(activeUser.sub);
    return this.tutoringService.getProgressSummary(childId);
  }

  /**
   * Get detailed progress summary for a child
   * This provides comprehensive progress data with sessions and subject information
   */
  @Get('progress/detailed')
  async getDetailedProgressSummary(@ActiveUser() activeUser: ActiveUserData) {
    if (!activeUser || !activeUser.sub) {
      throw new UnauthorizedException('Authentication required');
    }

    // Ensure user is a child account or parent
    if (activeUser.role !== Role.Child && activeUser.role !== Role.Parent) {
      throw new UnauthorizedException(
        'Only child or parent accounts can access this data',
      );
    }

    const childId = Number(activeUser.sub);
    return this.tutoringService.getDetailedProgressSummary(childId);
  }

  /**
   * Get detailed progress summary for a specific child (used by parents/tutors)
   */
  @Get('children/:childId/progress/detailed')
  @Auth(AuthType.Bearer)
  async getChildDetailedProgress(
    @Param('childId', ParseIntPipe) childId: number,
    @ActiveUser() activeUser: ActiveUserData,
  ) {
    if (!activeUser || !activeUser.sub) {
      throw new UnauthorizedException('Authentication required');
    }

    // Ensure user is a parent or tutor
    if (activeUser.role !== Role.Parent && activeUser.role !== Role.Regular) {
      throw new UnauthorizedException(
        'Only parent or tutor accounts can access this data',
      );
    }

    // If user is a parent, verify they are the parent of this child
    // This would be implemented in a real application
    // if (activeUser.role === Role.Parent) {
    //   const parentId = Number(activeUser.sub);
    //   await verifyChildBelongsToParent(parentId, childId);
    // }

    return this.tutoringService.getDetailedProgressSummary(childId);
  }

  /**
   * Get dashboard settings for the authenticated child
   */
  @Get('dashboard/settings')
  @Auth(AuthType.Bearer)
  async getDashboardSettings(@ActiveUser() activeUser: ActiveUserData) {
    if (!activeUser || !activeUser.sub) {
      throw new UnauthorizedException('Authentication required');
    }

    // Ensure user is a child account
    if (activeUser.role !== Role.Child) {
      throw new UnauthorizedException(
        'Only child accounts can access their dashboard settings',
      );
    }

    const childId = Number(activeUser.sub);
    return this.tutoringService.getDashboardSettings(childId);
  }

  /**
   * Get dashboard settings for a specific child (used by parents/tutors)
   */
  @Get('children/:childId/dashboard/settings')
  @Auth(AuthType.Bearer)
  async getChildDashboardSettings(
    @Param('childId', ParseIntPipe) childId: number,
    @ActiveUser() activeUser: ActiveUserData,
  ) {
    if (!activeUser || !activeUser.sub) {
      throw new UnauthorizedException('Authentication required');
    }

    // Ensure user is a parent or tutor
    if (activeUser.role !== Role.Parent && activeUser.role !== Role.Regular) {
      throw new UnauthorizedException(
        'Only parent or tutor accounts can access this data',
      );
    }

    // If user is a parent, verify they are the parent of this child
    // This would be implemented in a real application
    // if (activeUser.role === Role.Parent) {
    //   // const parentId = Number(activeUser.sub);
    //   // await verifyChildBelongsToParent(parentId, childId);
    // }

    return this.tutoringService.getDashboardSettings(childId);
  }

  /**
   * Update dashboard settings
   */
  @Put('dashboard/settings')
  @Auth(AuthType.Bearer)
  async updateDashboardSettings(
    @Body() dashboardSettingsDto: DashboardSettingsDto,
    @ActiveUser() activeUser: ActiveUserData,
  ) {
    if (!activeUser || !activeUser.sub) {
      throw new UnauthorizedException('Authentication required');
    }

    // If user is a child, they can only update their own settings
    if (activeUser.role === Role.Child) {
      const childId = Number(activeUser.sub);
      if (dashboardSettingsDto.childId !== childId) {
        throw new UnauthorizedException(
          'You can only update your own dashboard settings',
        );
      }
    }

    // If user is a parent, verify they are the parent of this child
    // This would be implemented in a real application
    if (activeUser.role === Role.Parent) {
      // const parentId = Number(activeUser.sub);
      // In a real app, verify parent-child relationship
      // await verifyChildBelongsToParent(parentId, dashboardSettingsDto.childId);
    }

    // Ensure user is authorized to update settings (child, parent, admin)
    if (
      activeUser.role !== Role.Child &&
      activeUser.role !== Role.Parent &&
      activeUser.role !== Role.Admin
    ) {
      throw new UnauthorizedException(
        'Only children, parents, or admins can update dashboard settings',
      );
    }

    return this.tutoringService.updateDashboardSettings(dashboardSettingsDto);
  }

  /**
   * Update a child's progress in a subject
   * This can be called after a session is completed
   */
  @Put('progress')
  @Auth(AuthType.Bearer)
  async updateProgress(
    @Body() updateProgressDto: UpdateProgressDto,
    @ActiveUser() activeUser: ActiveUserData,
  ) {
    if (!activeUser || !activeUser.sub) {
      throw new UnauthorizedException('Authentication required');
    }

    // Ensure user is authorized to update progress (tutor, parent, or system admin)
    if (
      activeUser.role !== Role.Regular &&
      activeUser.role !== Role.Parent &&
      activeUser.role !== Role.Admin
    ) {
      throw new UnauthorizedException(
        'Only tutors, parents, or admins can update progress',
      );
    }

    // For tutors, verify they are associated with the specified session if provided
    if (activeUser.role === Role.Regular && updateProgressDto.sessionId) {
      const tutorId = Number(activeUser.sub);
      const session = await this.tutoringService.getSessionById(
        updateProgressDto.sessionId,
      );

      if (!session || session.tutorId !== tutorId) {
        throw new UnauthorizedException(
          'Tutors can only update progress for their own sessions',
        );
      }
    }

    // For parents, verify they are the parent of the child
    if (activeUser.role === Role.Parent) {
      // const parentId = Number(activeUser.sub);
      // In a real app, verify parent-child relationship
      // await verifyChildBelongsToParent(parentId, updateProgressDto.childId);
      // Commented out parentId since it's currently unused but will be used in the future
    }

    return this.tutoringService.updateProgress(updateProgressDto);
  }

  /**
   * Record learning hours for a child
   * This can be used to log study time for a specific subject
   */
  @Post('learning-hours')
  @Auth(AuthType.Bearer)
  async recordLearningHours(
    @Body() recordLearningHoursDto: RecordLearningHoursDto,
    @ActiveUser() activeUser: ActiveUserData,
  ) {
    if (!activeUser || !activeUser.sub) {
      throw new UnauthorizedException('Authentication required');
    }

    // Ensure user is authorized to record learning hours (child, tutor, parent, or admin)
    if (
      activeUser.role !== Role.Child &&
      activeUser.role !== Role.Regular &&
      activeUser.role !== Role.Parent &&
      activeUser.role !== Role.Admin
    ) {
      throw new UnauthorizedException(
        'Not authorized to record learning hours',
      );
    }

    // If user is a child, they can only record hours for themselves
    if (activeUser.role === Role.Child) {
      const childId = Number(activeUser.sub);
      if (recordLearningHoursDto.childId !== childId) {
        throw new UnauthorizedException(
          'You can only record learning hours for yourself',
        );
      }
    }

    // For tutors, verify they are associated with the specified session if provided
    if (activeUser.role === Role.Regular && recordLearningHoursDto.sessionId) {
      const tutorId = Number(activeUser.sub);
      const session = await this.tutoringService.getSessionById(
        recordLearningHoursDto.sessionId,
      );

      if (!session || session.tutorId !== tutorId) {
        throw new UnauthorizedException(
          'Tutors can only record hours for their own sessions',
        );
      }
    }

    // For parents, verify they are the parent of the child
    if (activeUser.role === Role.Parent) {
      // const parentId = Number(activeUser.sub);
      // In a real app, verify parent-child relationship
      // await verifyChildBelongsToParent(parentId, recordLearningHoursDto.childId);
      // Commented out parentId since it's currently unused but will be used in the future
    }

    return this.tutoringService.recordLearningHours(recordLearningHoursDto);
  }

  /**
   * Get learning hours for the authenticated child
   * Optionally filtered by subject ID
   */
  @Get('learning-hours')
  @Auth(AuthType.Bearer)
  async getLearningHours(
    @Query('subjectId') subjectId: number,
    @ActiveUser() activeUser: ActiveUserData,
  ) {
    if (!activeUser || !activeUser.sub) {
      throw new UnauthorizedException('Authentication required');
    }

    // Ensure user is a child account
    if (activeUser.role !== Role.Child) {
      throw new UnauthorizedException(
        'Only child accounts can access their learning hours directly',
      );
    }

    const childId = Number(activeUser.sub);
    return this.tutoringService.getLearningHours(childId, subjectId);
  }

  /**
   * Get learning hours for a specific child (used by parents/tutors)
   */
  @Get('children/:childId/learning-hours')
  @Auth(AuthType.Bearer)
  async getChildLearningHours(
    @Param('childId', ParseIntPipe) childId: number,
    @Query('subjectId') subjectId: number,
    @ActiveUser() activeUser: ActiveUserData,
  ) {
    if (!activeUser || !activeUser.sub) {
      throw new UnauthorizedException('Authentication required');
    }

    // Ensure user is a parent, tutor, or admin
    if (
      activeUser.role !== Role.Parent &&
      activeUser.role !== Role.Regular &&
      activeUser.role !== Role.Admin
    ) {
      throw new UnauthorizedException(
        'Only parents, tutors, or admins can access child learning hours',
      );
    }

    // If user is a parent, verify they are the parent of this child
    if (activeUser.role === Role.Parent) {
      // const parentId = Number(activeUser.sub);
      // In a real app, verify parent-child relationship
      // await verifyChildBelongsToParent(parentId, childId);
    }

    // If user is a tutor, verify they tutor this child
    if (activeUser.role === Role.Regular) {
      // const tutorId = Number(activeUser.sub);
      // In a real app, verify tutor-child relationship
      // await verifyTutorTeachesChild(tutorId, childId);
      // Commented out tutorId since it's currently unused but will be used in the future
    }

    return this.tutoringService.getLearningHours(childId, subjectId);
  }

  /**
   * Get recent achievements for a child
   */
  @Get('achievements/recent')
  async getRecentAchievements(@ActiveUser() activeUser: ActiveUserData) {
    if (!activeUser || !activeUser.sub) {
      throw new UnauthorizedException('Authentication required');
    }

    // Ensure user is a child account
    if (activeUser.role !== Role.Child) {
      throw new UnauthorizedException(
        'Only child accounts can access their achievements',
      );
    }

    const childId = Number(activeUser.sub);
    return this.tutoringService.getRecentAchievements(childId);
  }

  /**
   * Get achievement statistics and count by category for a child
   */
  @Get('achievements/stats')
  async getAchievementStats(@ActiveUser() activeUser: ActiveUserData) {
    if (!activeUser || !activeUser.sub) {
      throw new UnauthorizedException('Authentication required');
    }

    // Ensure user is a child account
    if (activeUser.role !== Role.Child) {
      throw new UnauthorizedException(
        'Only child accounts can access their achievement stats',
      );
    }

    const childId = Number(activeUser.sub);
    return this.tutoringService.getAchievementStats(childId);
  }

  /**
   * Get achievement statistics for a specific child (used by parents/tutors)
   */
  @Get('children/:childId/achievements/stats')
  @Auth(AuthType.Bearer)
  async getChildAchievementStats(
    @Param('childId', ParseIntPipe) childId: number,
    @ActiveUser() activeUser: ActiveUserData,
  ) {
    if (!activeUser || !activeUser.sub) {
      throw new UnauthorizedException('Authentication required');
    }

    // Ensure user is a parent, tutor, or admin
    if (
      activeUser.role !== Role.Parent &&
      activeUser.role !== Role.Regular &&
      activeUser.role !== Role.Admin
    ) {
      throw new UnauthorizedException(
        'Only parents, tutors, or admins can access child achievement stats',
      );
    }

    // If user is a parent, verify they are the parent of this child
    if (activeUser.role === Role.Parent) {
      // const parentId = Number(activeUser.sub);
      // In a real app, verify parent-child relationship
      // await verifyChildBelongsToParent(parentId, childId);
    }

    return this.tutoringService.getAchievementStats(childId);
  }

  /**
   * Create a new tutoring session
   * This endpoint can be accessed by tutors or parents to schedule sessions
   * If no childId is provided, it will use the active user's ID (for child users)
   * Supports immediate sessions with isImmediate flag
   */
  @Post('sessions')
  @Auth(AuthType.Bearer)
  async createSession(
    @Body() createSessionDto: CreateSessionDto,
    @ActiveUser() activeUser: ActiveUserData,
  ) {
    if (!activeUser || !activeUser.sub) {
      throw new UnauthorizedException('Authentication required');
    }

    // Ensure user is authorized to create sessions (tutor, parent, child, or admin)
    if (
      activeUser.role !== Role.Regular &&
      activeUser.role !== Role.Parent &&
      activeUser.role !== Role.Child &&
      activeUser.role !== Role.Admin
    ) {
      throw new UnauthorizedException(
        'Only tutors, parents, children, or admins can create sessions',
      );
    }

    // Create a copy of the DTO to modify
    const sessionData = { ...createSessionDto };

    // If childId is not provided, use the active user's ID if they are a child
    if (!sessionData.childId) {
      if (activeUser.role === Role.Child) {
        sessionData.childId = Number(activeUser.sub);
      } else {
        throw new BadRequestException(
          'childId is required when not creating a session for yourself',
        );
      }
    }

    // If user is a parent, verify they are the parent of this child
    // This would be implemented in a real application
    if (activeUser.role === Role.Parent && sessionData.childId) {
      // const parentId = Number(activeUser.sub);
      // In a real app, verify parent-child relationship
      // await verifyChildBelongsToParent(parentId, sessionData.childId);
      // Commented out parentId since it's currently unused but will be used in the future
    }

    // If the creator is a tutor, make sure they're creating a session for themselves
    if (activeUser.role === Role.Regular) {
      // The tutorId in the DTO should match the user's ID
      if (sessionData.tutorId !== Number(activeUser.sub)) {
        throw new UnauthorizedException(
          'Tutors can only create sessions for themselves',
        );
      }
    }

    // Handle immediate sessions
    if (sessionData.isImmediate) {
      // Set start time to now
      sessionData.startTime = new Date();

      // If estimated duration is provided, calculate end time
      if (sessionData.estimatedDurationMinutes) {
        const endTime = new Date();
        endTime.setMinutes(
          endTime.getMinutes() + sessionData.estimatedDurationMinutes,
        );
        sessionData.endTime = endTime;
      } else {
        // Default to 60 minutes if no duration specified
        const endTime = new Date();
        endTime.setMinutes(endTime.getMinutes() + 60);
        sessionData.endTime = endTime;
      }
    } else if (!sessionData.startTime || !sessionData.endTime) {
      // For non-immediate sessions without times, set default times
      // Start 1 hour from now, end 2 hours from now
      const startTime = new Date();
      startTime.setHours(startTime.getHours() + 1);
      sessionData.startTime = startTime;

      const endTime = new Date(startTime);
      endTime.setHours(endTime.getHours() + 1);
      sessionData.endTime = endTime;
    }

    return this.tutoringService.createSession(sessionData);
  }

  /**
   * Update a tutoring session
   * This endpoint can be accessed by tutors or parents to update session details
   * or mark sessions as completed or cancelled
   */
  @Put('sessions')
  @Auth(AuthType.Bearer)
  async updateSession(
    @Body() updateSessionDto: UpdateSessionDto,
    @ActiveUser() activeUser: ActiveUserData,
  ) {
    if (!activeUser || !activeUser.sub) {
      throw new UnauthorizedException('Authentication required');
    }

    // Ensure user is authorized to update sessions (tutor, parent, child, or admin)
    if (
      activeUser.role !== Role.Regular &&
      activeUser.role !== Role.Parent &&
      activeUser.role !== Role.Child &&
      activeUser.role !== Role.Admin
    ) {
      throw new UnauthorizedException(
        'Only tutors, parents, children, or admins can update sessions',
      );
    }

    // Get the session to check permissions
    const session = await this.tutoringService.getSessionById(
      updateSessionDto.sessionId,
    );

    if (!session) {
      throw new NotFoundException(
        `Session with ID ${updateSessionDto.sessionId} not found`,
      );
    }

    // For tutors, verify they are associated with this session
    if (activeUser.role === Role.Regular) {
      const tutorId = Number(activeUser.sub);
      if (session.tutorId !== tutorId) {
        throw new UnauthorizedException(
          'Tutors can only update their own sessions',
        );
      }
    }

    // For children, verify they are the child in this session
    if (activeUser.role === Role.Child) {
      const childId = Number(activeUser.sub);
      if (session.childId !== childId) {
        throw new UnauthorizedException(
          'Children can only update their own sessions',
        );
      }
    }

    // For parents, verify they are the parent of the child in this session
    if (activeUser.role === Role.Parent) {
      // const parentId = Number(activeUser.sub);
      // In a real app, verify parent-child relationship
      // await verifyChildBelongsToParent(parentId, session.childId);
      // Commented out parentId since it's currently unused but will be used in the future
    }

    return this.tutoringService.updateSession(updateSessionDto);
  }

  /**
   * Mark a session as completed
   * This endpoint allows tutors, parents, children, or admins to mark a session as completed and optionally update progress
   */
  @Put('sessions/:id/complete')
  @Auth(AuthType.Bearer)
  async completeSession(
    @Param('id', ParseIntPipe) sessionId: number,
    @Query('progressPercentage', new DefaultValuePipe(0), ParseIntPipe) progressPercentage: number,
    @ActiveUser() activeUser: ActiveUserData,
  ) {
    if (!activeUser || !activeUser.sub) {
      throw new UnauthorizedException('Authentication required');
    }

    // Ensure user is authorized (tutor, parent, child, or admin)
    if (
      activeUser.role !== Role.Regular &&
      activeUser.role !== Role.Parent &&
      activeUser.role !== Role.Child &&
      activeUser.role !== Role.Admin
    ) {
      throw new UnauthorizedException(
        'Only tutors, parents, children, or admins can complete sessions',
      );
    }

    // Get the session to check permissions
    const session = await this.tutoringService.getSessionById(sessionId);

    if (!session) {
      throw new NotFoundException(`Session with ID ${sessionId} not found`);
    }

    // For tutors, verify they are associated with this session
    if (activeUser.role === Role.Regular) {
      const tutorId = Number(activeUser.sub);
      if (session.tutorId !== tutorId) {
        throw new UnauthorizedException(
          'Tutors can only complete their own sessions',
        );
      }
    }

    // For children, verify they are the child in this session
    if (activeUser.role === Role.Child) {
      const childId = Number(activeUser.sub);
      if (session.childId !== childId) {
        throw new UnauthorizedException(
          'Children can only complete their own sessions',
        );
      }
    }

    // For parents, verify they are the parent of the child in this session
    if (activeUser.role === Role.Parent) {
      // const parentId = Number(activeUser.sub);
      // In a real app, verify parent-child relationship
      // await verifyChildBelongsToParent(parentId, session.childId);
    }

    return this.tutoringService.completeSession(sessionId, progressPercentage);
  }

  /**
   * Cancel a session
   * This endpoint allows tutors, parents, children, or admins to cancel a session
   */
  @Put('sessions/:id/cancel')
  @Auth(AuthType.Bearer)
  async cancelSession(
    @Param('id', ParseIntPipe) sessionId: number,
    @ActiveUser() activeUser: ActiveUserData,
  ) {
    if (!activeUser || !activeUser.sub) {
      throw new UnauthorizedException('Authentication required');
    }

    // Ensure user is authorized (tutor, parent, child, or admin)
    if (
      activeUser.role !== Role.Regular &&
      activeUser.role !== Role.Parent &&
      activeUser.role !== Role.Child &&
      activeUser.role !== Role.Admin
    ) {
      throw new UnauthorizedException(
        'Only tutors, parents, children, or admins can cancel sessions',
      );
    }

    // Get the session to check permissions
    const session = await this.tutoringService.getSessionById(sessionId);

    if (!session) {
      throw new NotFoundException(`Session with ID ${sessionId} not found`);
    }

    // For tutors, verify they are associated with this session
    if (activeUser.role === Role.Regular) {
      const tutorId = Number(activeUser.sub);
      if (session.tutorId !== tutorId) {
        throw new UnauthorizedException(
          'Tutors can only cancel their own sessions',
        );
      }
    }

    // For children, verify they are the child in this session
    if (activeUser.role === Role.Child) {
      const childId = Number(activeUser.sub);
      if (session.childId !== childId) {
        throw new UnauthorizedException(
          'Children can only cancel their own sessions',
        );
      }
    }

    // For parents, verify they are the parent of the child in this session
    if (activeUser.role === Role.Parent) {
      // const parentId = Number(activeUser.sub);
      // In a real app, verify parent-child relationship
      // await verifyChildBelongsToParent(parentId, session.childId);
    }

    return this.tutoringService.cancelSession(sessionId);
  }
}
