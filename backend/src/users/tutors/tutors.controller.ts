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
  

  // Availability endpoints - non-parameterized routes
  @Post('tutor/availability')
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
  
  @Get('tutor/availability')
  @Auth(AuthType.Bearer)
  @Roles(Role.TUTOR)
  async getMyAvailability(@ActiveUser() user: ActiveUserData) {
    if (!user || !user.sub) {
      throw new ForbiddenException('User not authenticated');
    }
    
    return this.tutorsService.getAvailability(user.sub);
  }
  
  // Verification endpoints - non-parameterized routes
  @Post('tutor/verification')
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
  
  @Get('tutor/verification')
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