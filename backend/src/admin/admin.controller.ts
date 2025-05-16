import { Controller, Get, Post, Param, Body, ParseIntPipe } from '@nestjs/common';
import { AdminService } from './admin.service';
import { Auth } from '../auth/authentication/decorators/auth-decorator';
import { AuthType } from '../auth/authentication/enums/auth-type.enum';
import { ActiveUser } from '../auth/Decorators/active-user.decorator';
import { ActiveUserData } from '../auth/interfaces/active-user-data.interface';
import { Role } from '../users/enums/role-enums';
import { UnauthorizedException } from '@nestjs/common';
import { RejectTutorDto, DashboardStatsDto, PendingTutorDto, PlatformAnalyticsDto } from './dto/admin.dto';

@Auth(AuthType.Bearer)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  /**
   * Get dashboard statistics for the admin
   * @returns Dashboard statistics including user counts, approvals, revenue, and sessions
   */
  @Get('dashboard')
  async getDashboard(@ActiveUser() activeUser: ActiveUserData): Promise<DashboardStatsDto> {
    // Ensure the user is an admin
    if (activeUser.role !== Role.Admin) {
      throw new UnauthorizedException('Only admin users can access this endpoint');
    }

    return this.adminService.getDashboardStats();
  }

  /**
   * Get pending tutor approval requests
   * @returns List of tutors awaiting approval with their details
   */
  @Get('tutors/pending')
  async getPendingTutorApprovals(@ActiveUser() activeUser: ActiveUserData): Promise<PendingTutorDto[]> {
    // Ensure the user is an admin
    if (activeUser.role !== Role.Admin) {
      throw new UnauthorizedException('Only admin users can access this endpoint');
    }

    return this.adminService.getPendingTutorApprovals();
  }

  /**
   * Approve a tutor application
   * @param tutorId The ID of the tutor to approve
   * @returns The updated tutor record
   */
  @Post('tutors/:tutorId/approve')
  async approveTutor(
    @ActiveUser() activeUser: ActiveUserData,
    @Param('tutorId', ParseIntPipe) tutorId: number,
  ) {
    // Ensure the user is an admin
    if (activeUser.role !== Role.Admin) {
      throw new UnauthorizedException('Only admin users can access this endpoint');
    }

    return this.adminService.approveTutor(tutorId);
  }

  /**
   * Reject a tutor application
   * @param tutorId The ID of the tutor to reject
   * @param body Optional body with rejection reason
   * @returns Confirmation of rejection
   */
  @Post('tutors/:tutorId/reject')
  async rejectTutor(
    @ActiveUser() activeUser: ActiveUserData,
    @Param('tutorId', ParseIntPipe) tutorId: number,
    @Body() body: RejectTutorDto,
  ) {
    // Ensure the user is an admin
    if (activeUser.role !== Role.Admin) {
      throw new UnauthorizedException('Only admin users can access this endpoint');
    }

    return this.adminService.rejectTutor(tutorId, body?.reason);
  }

  /**
   * Get detailed platform analytics
   * @returns Platform analytics including user metrics, session metrics, and support tickets
   */
  @Get('analytics')
  async getPlatformAnalytics(@ActiveUser() activeUser: ActiveUserData): Promise<PlatformAnalyticsDto> {
    // Ensure the user is an admin
    if (activeUser.role !== Role.Admin) {
      throw new UnauthorizedException('Only admin users can access this endpoint');
    }

    return this.adminService.getPlatformAnalytics();
  }
}
