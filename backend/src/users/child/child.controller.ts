import {
  Controller,
  Post,
  Get,
  Param,
  ParseIntPipe,
  Body,
  UnauthorizedException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ChildService } from './child.service';
import { CreateChildDto } from '../parent/dtos/create-child.dto';
import { ChildLoginDto } from '../parent/dtos/child-login.dto';
import { AuthType } from 'src/auth/authentication/enums/auth-type.enum';
import { Auth } from 'src/auth/authentication/decorators/auth-decorator';
import { ActiveUser } from 'src/auth/Decorators/active-user.decorator';
import { ActiveUserData } from 'src/auth/interfaces/active-user-data.interface';
import { Role } from 'src/users/enums/role-enums';

@Controller('children')
export class ChildController {
  constructor(private readonly childService: ChildService) {}

  /**
   * Add a child to a parent's profile with direct login credentials
   * This creates a child record and links it to the parent
   */
  @Auth(AuthType.Bearer) // Requires authentication for parent operations
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async addChild(
    @ActiveUser() activeUser: ActiveUserData,
    @Body() createChildDto: CreateChildDto,
  ) {
    if (!activeUser || !activeUser.sub) {
      throw new UnauthorizedException('Authentication required');
    }

    // Set the parentId in the DTO using the authenticated user's ID
    // Ensure it's set as a number
    createChildDto.parentId = Number(activeUser.sub);

    // Log for debugging
    console.log('Adding child with parentId:', createChildDto.parentId);
    console.log('Active user data:', activeUser);

    return this.childService.addChild(createChildDto);
  }

  /**
   * Login as a child using username and password
   */
  @Post('login')
  @Auth(AuthType.None)
  async loginChild(@Body() childLoginDto: ChildLoginDto) {
    return this.childService.loginChild(childLoginDto);
  }

  /**
   * Get a child's profile with upcoming tutoring sessions
   * This is used for the child dashboard
   */
  @Get('profile')
  @Auth(AuthType.Bearer)
  async getChildProfile(@ActiveUser() activeUser: ActiveUserData) {
    if (!activeUser || !activeUser.sub) {
      throw new UnauthorizedException('Authentication required');
    }

    // Ensure user is a child account
    if (activeUser.role !== Role.Child) {
      throw new UnauthorizedException(
        'Only child accounts can access this endpoint',
      );
    }

    const childId = Number(activeUser.sub);
    return this.childService.getChildProfile(childId);
  }

  /**
   * Get the complete dashboard for the authenticated child
   * Includes profile, upcoming sessions, learning hours, progress, and achievements
   */
  @Get('dashboard')
  @Auth(AuthType.Bearer)
  async getChildDashboard(@ActiveUser() activeUser: ActiveUserData) {
    if (!activeUser || !activeUser.sub) {
      throw new UnauthorizedException('Authentication required');
    }

    // Ensure user is a child account
    if (activeUser.role !== Role.Child) {
      throw new UnauthorizedException(
        'Only child accounts can access this endpoint',
      );
    }

    const childId = Number(activeUser.sub);
    return this.childService.getChildDashboard(childId);
  }

  /**
   * Get a specific child's profile (for parent access)
   */
  @Get(':childId/profile')
  @Auth(AuthType.Bearer)
  async getSpecificChildProfile(
    @Param('childId', ParseIntPipe) childId: number,
    @ActiveUser() activeUser: ActiveUserData,
  ) {
    if (!activeUser || !activeUser.sub) {
      throw new UnauthorizedException('Authentication required');
    }

    // Ensure user is a parent
    if (activeUser.role !== Role.Parent) {
      throw new UnauthorizedException(
        'Only parent accounts can access this endpoint',
      );
    }

    // In a real application, you would verify that this child belongs to this parent
    // For now, we'll just return the child profile
    return this.childService.getChildProfile(childId);
  }

  /**
   * Get the complete dashboard for a specific child (for parent access)
   * Includes profile, upcoming sessions, learning hours, progress, and achievements
   */
  @Get(':childId/dashboard')
  @Auth(AuthType.Bearer)
  async getSpecificChildDashboard(
    @Param('childId', ParseIntPipe) childId: number,
    @ActiveUser() activeUser: ActiveUserData,
  ) {
    if (!activeUser || !activeUser.sub) {
      throw new UnauthorizedException('Authentication required');
    }

    // Ensure user is a parent
    if (activeUser.role !== Role.Parent) {
      throw new UnauthorizedException(
        'Only parent accounts can access this endpoint',
      );
    }

    // In a real application, you would verify that this child belongs to this parent
    return this.childService.getChildDashboard(childId);
  }

  /**
   * Get upcoming tutoring sessions for the authenticated child
   */
  @Get('sessions/upcoming')
  @Auth(AuthType.Bearer)
  async getUpcomingSessions(@ActiveUser() activeUser: ActiveUserData) {
    if (!activeUser || !activeUser.sub) {
      throw new UnauthorizedException('Authentication required');
    }

    // Ensure user is a child account
    if (activeUser.role !== Role.Child) {
      throw new UnauthorizedException(
        'Only child accounts can access this endpoint',
      );
    }

    const childId = Number(activeUser.sub);
    return this.childService.getUpcomingSessions(childId);
  }

  /**
   * Get learning hours summary for the authenticated child
   */
  @Get('learning/hours')
  @Auth(AuthType.Bearer)
  async getLearningHours(@ActiveUser() activeUser: ActiveUserData) {
    if (!activeUser || !activeUser.sub) {
      throw new UnauthorizedException('Authentication required');
    }

    // Ensure user is a child account
    if (activeUser.role !== Role.Child) {
      throw new UnauthorizedException(
        'Only child accounts can access this endpoint',
      );
    }

    const childId = Number(activeUser.sub);
    return this.childService.getWeeklyLearningHoursSummary(childId);
  }

  /**
   * Get learning progress for the authenticated child
   */
  @Get('learning/progress')
  @Auth(AuthType.Bearer)
  async getLearningProgress(@ActiveUser() activeUser: ActiveUserData) {
    if (!activeUser || !activeUser.sub) {
      throw new UnauthorizedException('Authentication required');
    }

    // Ensure user is a child account
    if (activeUser.role !== Role.Child) {
      throw new UnauthorizedException(
        'Only child accounts can access this endpoint',
      );
    }

    const childId = Number(activeUser.sub);
    return this.childService.getChildLearningProgress(childId);
  }

  /**
   * Get achievements for the authenticated child
   */
  @Get('achievements')
  @Auth(AuthType.Bearer)
  async getAchievements(@ActiveUser() activeUser: ActiveUserData) {
    if (!activeUser || !activeUser.sub) {
      throw new UnauthorizedException('Authentication required');
    }

    // Ensure user is a child account
    if (activeUser.role !== Role.Child) {
      throw new UnauthorizedException(
        'Only child accounts can access this endpoint',
      );
    }

    const childId = Number(activeUser.sub);
    return this.childService.getChildAchievements(childId);
  }

  /**
   * Get upcoming sessions for a specific child (for parent access)
   */
  @Get(':childId/sessions/upcoming')
  @Auth(AuthType.Bearer)
  async getChildUpcomingSessions(
    @Param('childId', ParseIntPipe) childId: number,
    @ActiveUser() activeUser: ActiveUserData,
  ) {
    if (!activeUser || !activeUser.sub) {
      throw new UnauthorizedException('Authentication required');
    }

    // Ensure user is a parent
    if (activeUser.role !== Role.Parent) {
      throw new UnauthorizedException(
        'Only parent accounts can access this endpoint',
      );
    }

    // In a real application, you would verify that this child belongs to this parent
    return this.childService.getUpcomingSessions(childId);
  }

  /**
   * Get learning hours for a specific child (for parent access)
   */
  @Get(':childId/learning/hours')
  @Auth(AuthType.Bearer)
  async getChildLearningHours(
    @Param('childId', ParseIntPipe) childId: number,
    @ActiveUser() activeUser: ActiveUserData,
  ) {
    if (!activeUser || !activeUser.sub) {
      throw new UnauthorizedException('Authentication required');
    }

    // Ensure user is a parent
    if (activeUser.role !== Role.Parent) {
      throw new UnauthorizedException(
        'Only parent accounts can access this endpoint',
      );
    }

    // In a real application, you would verify that this child belongs to this parent
    return this.childService.getWeeklyLearningHoursSummary(childId);
  }

  /**
   * Get learning progress for a specific child (for parent access)
   */
  @Get(':childId/learning/progress')
  @Auth(AuthType.Bearer)
  async getChildLearningProgress(
    @Param('childId', ParseIntPipe) childId: number,
    @ActiveUser() activeUser: ActiveUserData,
  ) {
    if (!activeUser || !activeUser.sub) {
      throw new UnauthorizedException('Authentication required');
    }

    // Ensure user is a parent
    if (activeUser.role !== Role.Parent) {
      throw new UnauthorizedException(
        'Only parent accounts can access this endpoint',
      );
    }

    // In a real application, you would verify that this child belongs to this parent
    return this.childService.getChildLearningProgress(childId);
  }

  /**
   * Get achievements for a specific child (for parent access)
   */
  @Get(':childId/achievements')
  @Auth(AuthType.Bearer)
  async getChildAchievements(
    @Param('childId', ParseIntPipe) childId: number,
    @ActiveUser() activeUser: ActiveUserData,
  ) {
    if (!activeUser || !activeUser.sub) {
      throw new UnauthorizedException('Authentication required');
    }

    // Ensure user is a parent
    if (activeUser.role !== Role.Parent) {
      throw new UnauthorizedException(
        'Only parent accounts can access this endpoint',
      );
    }

    // In a real application, you would verify that this child belongs to this parent
    return this.childService.getChildAchievements(childId);
  }
}
