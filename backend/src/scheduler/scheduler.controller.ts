import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  ForbiddenException,
} from '@nestjs/common';
import { SchedulerService } from './scheduler.service';
import { Auth } from 'src/auth/authentication/decorators/auth.decorator';
import { AuthType } from 'src/auth/authentication/enums/auth-type.enum';
import { ActiveUser } from 'src/auth/authentication/decorators/active-user.decorator';
import { ActiveUserData } from 'src/auth/interfaces/active-user.data.interface';
import { CreateSessionDto, UpdateSessionDto, CancelSessionDto } from './dto/session.dto';
import { CreateAvailabilitySlotDto, CreateUnavailableDateDto, UpdateAvailabilitySlotDto } from './dto/availability.dto';

@Auth(AuthType.Bearer)
@Controller('scheduler')
export class SchedulerController {
  constructor(private readonly schedulerService: SchedulerService) {}

  // ============ SESSION ENDPOINTS ============

  /**
   * Create a new tutoring session (Parent only)
   */
  @Post('sessions')
  async createSession(
    @Body() createSessionDto: CreateSessionDto,
    @ActiveUser() user: ActiveUserData
  ) {
    // Only parents can create sessions
    if (user.role !== 'parent') {
      throw new ForbiddenException('Only parents can create tutoring sessions');
    }

    return this.schedulerService.createSession(createSessionDto, user.sub);
  }

  /**
   * Get a tutoring session by ID
   */
  @Get('sessions/:id')
  getSessionById(@Param('id', ParseIntPipe) id: number) {
    return this.schedulerService.getSessionById(id);
  }

  /**
   * Get all sessions for the authenticated tutor
   */
  @Get('tutor/sessions')
  getMyTutorSessions(@ActiveUser() user: ActiveUserData) {
    if (user.role !== 'tutor') {
      throw new ForbiddenException('Access denied');
    }
    
    return this.schedulerService.getSessionsByTutor(user.sub);
  }

  /**
   * Get all sessions for a specific tutor by ID (Admin only)
   */
  @Get('tutors/:tutorId/sessions')
  getTutorSessions(
    @Param('tutorId', ParseIntPipe) tutorId: number,
    @ActiveUser() user: ActiveUserData
  ) {
    if (user.role !== 'admin') {
      throw new ForbiddenException('Access denied');
    }
    
    return this.schedulerService.getSessionsByTutor(tutorId);
  }

  /**
   * Get all sessions for a specific child
   */
  @Get('children/:childId/sessions')
  getChildSessions(
    @Param('childId', ParseIntPipe) childId: number,
    @ActiveUser() user: ActiveUserData
  ) {
    // Parent can only view their own children's sessions
    if (user.role === 'parent') {
      // The service will verify if the child belongs to this parent
      return this.schedulerService.getSessionsByChild(childId);
    } 
    // Admin can view any child's sessions
    else if (user.role === 'admin') {
      return this.schedulerService.getSessionsByChild(childId);
    }
    // Otherwise, deny access
    else {
      throw new ForbiddenException('Access denied');
    }
  }

  /**
   * Get all sessions for the authenticated parent
   */
  @Get('parent/sessions')
  getMyParentSessions(@ActiveUser() user: ActiveUserData) {
    if (user.role !== 'parent') {
      throw new ForbiddenException('Access denied');
    }
    
    return this.schedulerService.getSessionsByParent(user.sub);
  }

  /**
   * Update a tutoring session
   */
  @Put('sessions/:id')
  updateSession(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSessionDto: UpdateSessionDto,
    @ActiveUser() user: ActiveUserData
  ) {
    // First fetch the session to check permissions
    return this.schedulerService.updateSession(id, updateSessionDto);
  }

  /**
   * Cancel a tutoring session
   */
  @Put('sessions/:id/cancel')
  cancelSession(
    @Param('id', ParseIntPipe) id: number,
    @Body() cancelSessionDto: CancelSessionDto,
    @ActiveUser() user: ActiveUserData
  ) {
    return this.schedulerService.cancelSession(id, cancelSessionDto, user.sub);
  }

  // ============ AVAILABILITY ENDPOINTS ============

  /**
   * Add new availability slots for the authenticated tutor
   * Supports adding the same time slot for multiple days of the week at once
   */
  @Post('tutor/availability')
  addAvailabilitySlot(
    @Body() createAvailabilityDto: CreateAvailabilitySlotDto,
    @ActiveUser() user: ActiveUserData
  ) {
    if (user.role !== 'tutor') {
      throw new ForbiddenException('Only tutors can manage availability');
    }
    
    return this.schedulerService.addAvailabilitySlot(user.sub, createAvailabilityDto);
  }

  /**
   * Update an availability slot
   */
  @Put('tutor/availability/:id')
  updateAvailabilitySlot(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAvailabilityDto: UpdateAvailabilitySlotDto,
    @ActiveUser() user: ActiveUserData
  ) {
    if (user.role !== 'tutor') {
      throw new ForbiddenException('Only tutors can manage availability');
    }
    
    return this.schedulerService.updateAvailabilitySlot(id, updateAvailabilityDto);
  }

  /**
   * Delete an availability slot
   */
  @Delete('tutor/availability/:id')
  deleteAvailabilitySlot(
    @Param('id', ParseIntPipe) id: number,
    @ActiveUser() user: ActiveUserData
  ) {
    if (user.role !== 'tutor') {
      throw new ForbiddenException('Only tutors can manage availability');
    }
    
    return this.schedulerService.deleteAvailabilitySlot(id);
  }

  /**
   * Get all availability slots for the authenticated tutor
   */
  @Get('tutor/availability')
  getMyAvailability(@ActiveUser() user: ActiveUserData) {
    if (user.role !== 'tutor') {
      throw new ForbiddenException('Access denied');
    }
    
    return this.schedulerService.getAvailabilityByTutor(user.sub);
  }

  /**
   * Get availability for a specific tutor (viewable by parents and admin)
   */
  @Get('tutors/:tutorId/availability')
  getTutorAvailability(
    @Param('tutorId', ParseIntPipe) tutorId: number,
    @ActiveUser() user: ActiveUserData
  ) {
    // Parents and admins can view tutor availability
    if (user.role !== 'parent' && user.role !== 'admin') {
      throw new ForbiddenException('Access denied');
    }
    
    return this.schedulerService.getAvailabilityByTutor(tutorId);
  }

  /**
   * Add a new unavailable date for the authenticated tutor
   */
  @Post('tutor/unavailable-dates')
  addUnavailableDate(
    @Body() createUnavailableDateDto: CreateUnavailableDateDto,
    @ActiveUser() user: ActiveUserData
  ) {
    if (user.role !== 'tutor') {
      throw new ForbiddenException('Only tutors can manage unavailable dates');
    }
    
    return this.schedulerService.addUnavailableDate(user.sub, createUnavailableDateDto);
  }

  /**
   * Delete an unavailable date
   */
  @Delete('tutor/unavailable-dates/:id')
  deleteUnavailableDate(
    @Param('id', ParseIntPipe) id: number,
    @ActiveUser() user: ActiveUserData
  ) {
    if (user.role !== 'tutor') {
      throw new ForbiddenException('Only tutors can manage unavailable dates');
    }
    
    return this.schedulerService.deleteUnavailableDate(id);
  }

  /**
   * Get all unavailable dates for the authenticated tutor
   */
  @Get('tutor/unavailable-dates')
  getMyUnavailableDates(@ActiveUser() user: ActiveUserData) {
    if (user.role !== 'tutor') {
      throw new ForbiddenException('Access denied');
    }
    
    return this.schedulerService.getUnavailableDatesByTutor(user.sub);
  }

  /**
   * Get unavailable dates for a specific tutor
   */
  @Get('tutors/:tutorId/unavailable-dates')
  getTutorUnavailableDates(
    @Param('tutorId', ParseIntPipe) tutorId: number,
    @ActiveUser() user: ActiveUserData
  ) {
    // Parents and admins can view tutor unavailable dates
    if (user.role !== 'parent' && user.role !== 'admin') {
      throw new ForbiddenException('Access denied');
    }
    
    return this.schedulerService.getUnavailableDatesByTutor(tutorId);
  }
}