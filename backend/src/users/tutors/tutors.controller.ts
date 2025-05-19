import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  UseGuards,
  ParseIntPipe,
  ForbiddenException,
} from '@nestjs/common';
import { TutorsService } from './tutors.service';
import { AccessTokenGuard } from '../../auth/authentication/guards/access-token/access-token.guard';
import { RolesGuard } from '../../auth/authentication/guards/roles/roles.guard';
import { Roles } from '../../auth/authentication/decorators/roles.decorator';
import { Role } from '../../auth/authentication/enums/roles-type-enum';
import { Auth } from '../../auth/authentication/decorators/auth.decorator';
import { AuthType } from '../../auth/authentication/enums/auth-type.enum';
import { ActiveUser } from '../../auth/authentication/decorators/active-user.decorator';
import { ActiveUserData } from '../../auth/interfaces/active-user.data.interface';
import { AddSubjectsDto } from './dto/subject.dto';
import { AddGradesDto } from './dto/grade.dto';
import { AddAvailabilityDto } from './dto/availability.dto';
import { TutorVerificationDto } from './dto/verification.dto';

@Controller('users/tutors')
export class TutorsController {
  constructor(
    private readonly tutorsService: TutorsService
  ) {}

  // Public route - no authentication required
  @Get()
  findAll() {
    return this.tutorsService.findAll();
  }

  // Profile endpoints - specific routes must come before parameterized routes
  @UseGuards(AccessTokenGuard)
  @Get('profile/me')
  getMyProfile(@ActiveUser() user: ActiveUserData) {
    if (!user || !user.sub) {
      throw new ForbiddenException('User not authenticated');
    }
    
    return this.tutorsService.findOne(user.sub);
  }

  // Subjects endpoints - non-parameterized routes
  @Post('subjects')
  @Auth(AuthType.Bearer)
  @Roles(Role.TUTOR, Role.ADMIN)
  async addSubjects(
    @Body() addSubjectsDto: AddSubjectsDto,
    @ActiveUser() user: ActiveUserData
  ) {
    if (!user || !user.sub) {
      throw new ForbiddenException('User not authenticated');
    }
    
    return this.tutorsService.addSubjects(user.sub, addSubjectsDto.subjects);
  }
  
  @Post('subjects/me')
  @Auth(AuthType.Bearer)
  @Roles(Role.TUTOR)
  async addMySubjects(
    @Body() addSubjectsDto: AddSubjectsDto,
    @ActiveUser() user: ActiveUserData
  ) {
    if (!user || !user.sub) {
      throw new ForbiddenException('User not authenticated');
    }
    
    return this.tutorsService.addSubjects(user.sub, addSubjectsDto.subjects);
  }
  
  @Get('subjects/me')
  @Auth(AuthType.Bearer)
  @Roles(Role.TUTOR)
  async getMySubjects(@ActiveUser() user: ActiveUserData) {
    if (!user || !user.sub) {
      throw new ForbiddenException('User not authenticated');
    }
    
    return this.tutorsService.getSubjects(user.sub);
  }
  
  // Grades endpoints - non-parameterized routes
  @Post('grades/me')
  @Auth(AuthType.Bearer)
  @Roles(Role.TUTOR)
  async addMyGrades(
    @Body() addGradesDto: AddGradesDto,
    @ActiveUser() user: ActiveUserData
  ) {
    if (!user || !user.sub) {
      throw new ForbiddenException('User not authenticated');
    }
    
    return this.tutorsService.addGrades(user.sub, addGradesDto.grades);
  }
  
  @Get('grades/me')
  @Auth(AuthType.Bearer)
  @Roles(Role.TUTOR)
  async getMyGrades(@ActiveUser() user: ActiveUserData) {
    if (!user || !user.sub) {
      throw new ForbiddenException('User not authenticated');
    }
    
    return this.tutorsService.getGrades(user.sub);
  }
  
  // Availability endpoints - non-parameterized routes
  @Post('availability/me')
  @Auth(AuthType.Bearer)
  @Roles(Role.TUTOR)
  async addMyAvailability(
    @Body() addAvailabilityDto: AddAvailabilityDto,
    @ActiveUser() user: ActiveUserData
  ) {
    if (!user || !user.sub) {
      throw new ForbiddenException('User not authenticated');
    }
    
    const slots = addAvailabilityDto.availabilitySlots.map(slot => ({
      dayOfWeek: slot.dayOfWeek,
      startTime: new Date(slot.startTime),
      endTime: new Date(slot.endTime)
    }));
    
    return this.tutorsService.addAvailability(user.sub, slots);
  }
  
  @Get('availability/me')
  @Auth(AuthType.Bearer)
  @Roles(Role.TUTOR)
  async getMyAvailability(@ActiveUser() user: ActiveUserData) {
    if (!user || !user.sub) {
      throw new ForbiddenException('User not authenticated');
    }
    
    return this.tutorsService.getAvailability(user.sub);
  }
  
  // Verification endpoints - non-parameterized routes
  @Post('verification/me')
  @Auth(AuthType.Bearer)
  @Roles(Role.TUTOR)
  async addMyVerification(
    @Body() verificationDto: TutorVerificationDto,
    @ActiveUser() user: ActiveUserData
  ) {
    if (!user || !user.sub) {
      throw new ForbiddenException('User not authenticated');
    }
    
    return this.tutorsService.addVerification(user.sub, verificationDto);
  }
  
  @Get('verification/me')
  @Auth(AuthType.Bearer)
  @Roles(Role.TUTOR)
  async getMyVerification(@ActiveUser() user: ActiveUserData) {
    if (!user || !user.sub) {
      throw new ForbiddenException('User not authenticated');
    }
    
    return this.tutorsService.getVerification(user.sub);
  }

  // Protected route - requires admin role
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post()
  create(@Body() createTutorDto: any) {
    return this.tutorsService.create(createTutorDto);
  }

  // Now the parameterized routes
  @UseGuards(AccessTokenGuard)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.tutorsService.findOne(id);
  }

  // Protected route - requires tutor or admin role
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(Role.TUTOR, Role.ADMIN)
  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateTutorDto: any) {
    return this.tutorsService.update(id, updateTutorDto);
  }

  // Protected route - requires admin role only
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.tutorsService.remove(id);
  }
  
  // Reference data endpoints - these return static data (since reference service was removed)
  @Get('reference/subjects')
  @Auth(AuthType.Bearer)
  async getAvailableSubjects() {
    // Return static subject data
    return [
      { id: 1, name: 'Mathematics' },
      { id: 2, name: 'Physics' },
      { id: 3, name: 'Chemistry' },
      { id: 4, name: 'Biology' },
      { id: 5, name: 'English' },
      { id: 6, name: 'History' },
      { id: 7, name: 'Geography' },
      { id: 8, name: 'Computer Science' }
    ];
  }

  @Get('reference/grade-levels')
  @Auth(AuthType.Bearer)
  async getAvailableGradeLevels() {
    // Return static grade level data
    return [
      { id: 1, name: 'Grade 1' },
      { id: 2, name: 'Grade 2' },
      { id: 3, name: 'Grade 3' },
      { id: 4, name: 'Grade 4' },
      { id: 5, name: 'Grade 5' },
      { id: 6, name: 'Grade 6' },
      { id: 7, name: 'Grade 7' },
      { id: 8, name: 'Grade 8' },
      { id: 9, name: 'Grade 9' },
      { id: 10, name: 'Grade 10' },
      { id: 11, name: 'Grade 11' },
      { id: 12, name: 'Grade 12' }
    ];
  }
  
  // Endpoints for selecting subjects and grade levels from reference data
  @Post('select/subjects')
  @Auth(AuthType.Bearer)
  @Roles(Role.TUTOR)
  async selectSubjects(
    @Body() body: { subjectIds: number[] },
    @ActiveUser() user: ActiveUserData
  ) {
    if (!user || !user.sub) {
      throw new ForbiddenException('User not authenticated');
    }
    
    // Get the subjects from our local static data
    const allSubjects = await this.getAvailableSubjects();
    
    // Filter subjects by the provided IDs
    const selectedSubjects = allSubjects.filter(subject => 
      body.subjectIds.includes(subject.id)
    );
    
    // Map to just the names for our simplified DTO
    const subjectsToAdd = selectedSubjects.map(subject => ({
      subjectName: subject.name
    }));
    
    // Add the subjects to the tutor
    return this.tutorsService.addSubjects(user.sub, subjectsToAdd);
  }
  
  @Post('select/grade-levels')
  @Auth(AuthType.Bearer)
  @Roles(Role.TUTOR)
  async selectGradeLevels(
    @Body() body: { gradeLevelIds: number[] },
    @ActiveUser() user: ActiveUserData
  ) {
    if (!user || !user.sub) {
      throw new ForbiddenException('User not authenticated');
    }
    
    // Get the grade levels from our local static data
    const allGradeLevels = await this.getAvailableGradeLevels();
    
    // Filter grade levels by the provided IDs
    const selectedGradeLevels = allGradeLevels.filter(gradeLevel => 
      body.gradeLevelIds.includes(gradeLevel.id)
    );
    
    // Map to just the names for our simplified DTO
    const gradeLevelsToAdd = selectedGradeLevels.map(gradeLevel => ({
      gradeLevelName: gradeLevel.name
    }));
    
    // Add the grade levels to the tutor
    return this.tutorsService.addGrades(user.sub, gradeLevelsToAdd);
  }

  // Parameterized routes for subjects, grades, availability, and verification
  @Get(':id/subjects')
  @Auth(AuthType.Bearer)
  async getSubjects(@Param('id', ParseIntPipe) id: number) {
    return this.tutorsService.getSubjects(id);
  }

  @Post(':id/grades')
  @Auth(AuthType.Bearer)
  @Roles(Role.TUTOR, Role.ADMIN)
  async addGrades(
    @Param('id', ParseIntPipe) id: number,
    @Body() addGradesDto: AddGradesDto,
    @ActiveUser() user: ActiveUserData
  ) {
    // Only allow tutors to modify their own grades, or admins to modify any
    if (user.role === Role.TUTOR && user.sub !== id) {
      throw new ForbiddenException('You can only modify your own grades');
    }
    
    return this.tutorsService.addGrades(id, addGradesDto.grades);
  }

  @Get(':id/grades')
  @Auth(AuthType.Bearer)
  async getGrades(@Param('id', ParseIntPipe) id: number) {
    return this.tutorsService.getGrades(id);
  }

  @Post(':id/availability')
  @Auth(AuthType.Bearer)
  @Roles(Role.TUTOR, Role.ADMIN)
  async addAvailability(
    @Param('id', ParseIntPipe) id: number,
    @Body() addAvailabilityDto: AddAvailabilityDto,
    @ActiveUser() user: ActiveUserData
  ) {
    // Only allow tutors to modify their own availability, or admins to modify any
    if (user.role === Role.TUTOR && user.sub !== id) {
      throw new ForbiddenException('You can only modify your own availability');
    }
    
    const slots = addAvailabilityDto.availabilitySlots.map(slot => ({
      dayOfWeek: slot.dayOfWeek,
      startTime: new Date(slot.startTime),
      endTime: new Date(slot.endTime)
    }));
    
    return this.tutorsService.addAvailability(id, slots);
  }

  @Get(':id/availability')
  @Auth(AuthType.Bearer)
  async getAvailability(@Param('id', ParseIntPipe) id: number) {
    return this.tutorsService.getAvailability(id);
  }

  @Post(':id/verification')
  @Auth(AuthType.Bearer)
  @Roles(Role.TUTOR, Role.ADMIN)
  async addVerification(
    @Param('id', ParseIntPipe) id: number,
    @Body() verificationDto: TutorVerificationDto,
    @ActiveUser() user: ActiveUserData
  ) {
    // Only allow tutors to modify their own verification, or admins to modify any
    if (user.role === Role.TUTOR && user.sub !== id) {
      throw new ForbiddenException('You can only modify your own verification');
    }
    
    return this.tutorsService.addVerification(id, verificationDto);
  }

  @Get(':id/verification')
  @Auth(AuthType.Bearer)
  async getVerification(@Param('id', ParseIntPipe) id: number) {
    return this.tutorsService.getVerification(id);
  }
}