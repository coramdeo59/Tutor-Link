import { Controller, Post, Param, ParseIntPipe, Get, UnauthorizedException, Body, Patch, Query } from '@nestjs/common';
import { ParentService } from './parent.service';
import { AuthType } from 'src/auth/authentication/enums/auth-type.enum';
import { Auth } from 'src/auth/authentication/decorators/auth-decorator';
import { ActiveUser } from 'src/auth/Decorators/active-user.decorator';
import { ActiveUserData } from 'src/auth/interfaces/active-user-data.interface';
import { Role } from 'src/users/enums/role-enums';
import { UpdateChildInfoDto, UpdateChildCredentialsDto, ChildSessionsQueryDto } from './dtos/update-child.dto';
import { HashingService } from 'src/auth/hashing/hashing.service';

@Auth(AuthType.Bearer) // Requires authentication for parent operations
@Controller('parents')
export class ParentController {
  constructor(
    private readonly parentService: ParentService,
    private readonly hashingService: HashingService
  ) {}

  /**
   * Ensure a parent record exists for a user
   * This helps fix data integrity issues where parent users existed without parent records
   */
  @Post('ensure-record/:userId')
  async ensureParentRecord(@Param('userId', ParseIntPipe) userId: number) {
    const recordCreated = await this.parentService.createParentRecord(userId);
    return { success: recordCreated };
  }
  
  /**
   * Get the authenticated parent's dashboard
   * Includes children list, tutors, sessions, payment info, and progress data
   */
  @Get('dashboard')
  async getParentDashboard(@ActiveUser() activeUser: ActiveUserData) {
    // Verify user is a parent
    if (activeUser.role !== Role.Parent) {
      throw new UnauthorizedException('Only parent accounts can access parent dashboard');
    }
    
    const parentId = Number(activeUser.sub);
    return this.parentService.getParentDashboard(parentId);
  }
  
  /**
   * Get the list of children for the authenticated parent
   */
  @Get('children')
  async getParentChildren(@ActiveUser() activeUser: ActiveUserData) {
    // Verify user is a parent
    if (activeUser.role !== Role.Parent) {
      throw new UnauthorizedException('Only parent accounts can access children lists');
    }
    
    const parentId = Number(activeUser.sub);
    return this.parentService.getParentChildren(parentId);
  }
  
  /**
   * Get detailed information about a specific child
   */
  @Get('children/:childId')
  async getChildDetails(
    @ActiveUser() activeUser: ActiveUserData,
    @Param('childId', ParseIntPipe) childId: number
  ) {
    // Verify user is a parent
    if (activeUser.role !== Role.Parent) {
      throw new UnauthorizedException('Only parent accounts can access child details');
    }
    
    const parentId = Number(activeUser.sub);
    return this.parentService.getChildDetails(parentId, childId);
  }
  
  /**
   * Update a child's basic information
   */
  @Patch('children/:childId')
  async updateChildInfo(
    @ActiveUser() activeUser: ActiveUserData,
    @Param('childId', ParseIntPipe) childId: number,
    @Body() updateChildDto: UpdateChildInfoDto
  ) {
    // Verify user is a parent
    if (activeUser.role !== Role.Parent) {
      throw new UnauthorizedException('Only parent accounts can update child information');
    }
    
    const parentId = Number(activeUser.sub);
    
    // Create a new object for the service with the correct types
    const updateData: any = { ...updateChildDto };
    
    // Pass the string date directly to the service
    // The service will handle the conversion if needed
    
    return this.parentService.updateChildInfo(parentId, childId, updateData);
  }
  
  /**
   * Update a child's login credentials (username and/or password)
   */
  @Patch('children/:childId/credentials')
  async updateChildCredentials(
    @ActiveUser() activeUser: ActiveUserData,
    @Param('childId', ParseIntPipe) childId: number,
    @Body() updateCredentialsDto: UpdateChildCredentialsDto
  ) {
    // Verify user is a parent
    if (activeUser.role !== Role.Parent) {
      throw new UnauthorizedException('Only parent accounts can update child credentials');
    }
    
    const parentId = Number(activeUser.sub);
    return this.parentService.updateChildCredentials(
      parentId, 
      childId, 
      updateCredentialsDto,
      this.hashingService
    );
  }
  
  /**
   * Get all tutoring sessions for all children of the authenticated parent
   * Can be filtered by upcoming/past and by specific child
   */
  @Get('sessions')
  async getAllChildrenSessions(
    @ActiveUser() activeUser: ActiveUserData,
    @Query() queryParams: ChildSessionsQueryDto
  ) {
    // Verify user is a parent
    if (activeUser.role !== Role.Parent) {
      throw new UnauthorizedException('Only parent accounts can view child sessions');
    }
    
    const parentId = Number(activeUser.sub);
    return this.parentService.getAllChildrenSessions(parentId, queryParams);
  }
  
  /**
   * Get a summary of active tutors for the authenticated parent's children
   */
  @Get('tutors/active')
  async getParentActiveTutors(@ActiveUser() activeUser: ActiveUserData) {
    // Verify user is a parent
    if (activeUser.role !== Role.Parent) {
      throw new UnauthorizedException('Only parent accounts can access tutor information');
    }
    
    const parentId = Number(activeUser.sub);
    return this.parentService.getParentActiveTutors(parentId);
  }
  
  /**
   * Get a summary of upcoming sessions for the authenticated parent's children
   */
  @Get('sessions/upcoming')
  async getParentUpcomingSessions(@ActiveUser() activeUser: ActiveUserData) {
    // Verify user is a parent
    if (activeUser.role !== Role.Parent) {
      throw new UnauthorizedException('Only parent accounts can access session information');
    }
    
    const parentId = Number(activeUser.sub);
    return this.parentService.getParentUpcomingSessions(parentId);
  }
  
  /**
   * Get a summary of payment and spending for the authenticated parent
   */
  @Get('payments/summary')
  async getParentPaymentSummary(@ActiveUser() activeUser: ActiveUserData) {
    // Verify user is a parent
    if (activeUser.role !== Role.Parent) {
      throw new UnauthorizedException('Only parent accounts can access payment information');
    }
    
    const parentId = Number(activeUser.sub);
    return this.parentService.getParentPaymentSummary(parentId);
  }
  
  /**
   * Get detailed progress information for all children of the authenticated parent
   */
  @Get('children/progress')
  async getChildrenProgress(@ActiveUser() activeUser: ActiveUserData) {
    // Verify user is a parent
    if (activeUser.role !== Role.Parent) {
      throw new UnauthorizedException('Only parent accounts can access children progress');
    }
    
    const parentId = Number(activeUser.sub);
    return this.parentService.getChildrenProgress(parentId);
  }
  
  /**
   * Verify if a child belongs to the authenticated parent
   * This is a utility endpoint that can be used by the frontend to verify access rights
   */
  @Get('verify-child/:childId')
  async verifyParentChild(
    @ActiveUser() activeUser: ActiveUserData,
    @Param('childId', ParseIntPipe) childId: number
  ) {
    // Verify user is a parent
    if (activeUser.role !== Role.Parent) {
      throw new UnauthorizedException('Only parent accounts can verify child relationships');
    }
    
    const parentId = Number(activeUser.sub);
    const isParentOfChild = await this.parentService.verifyParentChild(parentId, childId);
    
    return { 
      verified: isParentOfChild,
      childId,
      parentId
    };
  }
}
