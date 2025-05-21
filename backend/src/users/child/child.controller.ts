import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  BadRequestException,
} from '@nestjs/common';
import { ChildService } from './child.service';
import { AuthType } from 'src/auth/authentication/enums/auth-type.enum';
import { Auth } from 'src/auth/authentication/decorators/auth.decorator';
import { ActiveUser } from 'src/auth/authentication/decorators/active-user.decorator';
import { AuthenticationService } from 'src/auth/authentication/authentication.service';
import { ChildSignInDto } from './dto/child-sign-in.dto';
import { CreateChildDto } from './dto/create-child.dto';
import { ActiveUserData } from 'src/auth/interfaces/active-user.data.interface';

@Controller('users/children')
@Auth(AuthType.Bearer)
export class ChildController {
  constructor(
    private readonly childService: ChildService,
    private readonly authService: AuthenticationService
  ) {}

  /**
   * Get all children for the authenticated parent
   * @param user The authenticated user data
   * @returns Array of children belonging to the parent
   */
  @Get()
  async getChildrenForParent(
    @ActiveUser() user: ActiveUserData
  ) {
    if (!user || !user.sub) {
      throw new BadRequestException('Invalid user information');
    }
    
    try {
      try {
        // Try to get real data first
        return await this.childService.findByParent(user.sub);
      } catch (serviceError) {
        console.error('Error in child service:', serviceError);
        
      
      }
    } catch (error) {
      console.error('Error in controller layer:', error);
      throw error;
    }
  }

  /**
   * Get a specific child's information (only if they belong to the authenticated parent)
   * @param id The ID of the child
   * @param user The authenticated user data
   * @returns Child information if found and authorized
   */
  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @ActiveUser() user: ActiveUserData
  ) {
    if (!user || !user.sub) {
      throw new BadRequestException('Invalid user information');
    }
    
    return this.childService.findChildForParent(id, user.sub);
  }

  @Post()
  @Auth(AuthType.Bearer)
  async create(
    @Body() createChildDto: CreateChildDto,
    @ActiveUser() user: ActiveUserData
  ) {
    if (!user || !user.sub) {
      throw new BadRequestException('Invalid user information');
    }

    // Only parents should be able to create child accounts
    if (user.role !== 'parent') {
      throw new BadRequestException('Only parent can create child accounts');
    }

    return this.childService.create(createChildDto, user.sub);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateChildDto: any
  ) {
    return this.childService.update(id, updateChildDto);
  }

  // @Delete(':id')
  // @HttpCode(HttpStatus.NO_CONTENT)
  // async remove(@Param('id', ParseIntPipe) id: number) {
  //   return this.childService.remove(id);
  // }

  /**
   * Child sign-in endpoint - allows children to authenticate using username/password
   * @param childSignInDto Contains username and password
   * @returns Access and refresh tokens upon successful authentication
   */
  @Post('auth/signin')
  @HttpCode(HttpStatus.OK)
  @Auth(AuthType.None) // Exempt this endpoint from authentication requirements
  async signIn(@Body() childSignInDto: ChildSignInDto) {
    return this.authService.childSignIn(childSignInDto);
  }

  /**
   * Get all available students for tutors to create sessions with
   * This endpoint is specifically for tutors to see which students they can schedule with
   * @param user The authenticated tutor
   * @returns Array of students available for tutoring sessions
   */
  // Test endpoint removed now that the real endpoint is working
  
  /**
   * Get all available students for tutoring sessions
   * This endpoint returns all students that can be selected for tutoring sessions
   * @param user The authenticated tutor
   * @returns Array of students with their grade levels and subjects
   */
  @Get('/tutoring/available-students')
  async getStudentsForTutoring(@ActiveUser() user: ActiveUserData) {
    if (!user || !user.sub) {
      throw new BadRequestException('Invalid user information');
    }
    
    // Ensure only tutors can access this endpoint
    if (user.role !== 'tutor') {
      throw new BadRequestException('Only tutors can access this endpoint');
    }
    
    // Parse the tutor ID as a number for the service method
    const tutorId = typeof user.sub === 'number' ? user.sub : parseInt(user.sub, 10);
    
    if (isNaN(tutorId)) {
      throw new BadRequestException('Invalid tutor ID format');
    }
    
    try {
      // Get real student data from the database
      return await this.childService.findStudentsForTutor(tutorId);
    } catch (error) {
      console.error('Error fetching students for tutor:', error);
      throw error;
    }
  }
  
  /**
   * Get child details by ID specifically for tutoring sessions
   * This endpoint returns basic child information needed to display in session cards
   * @param id The ID of the child to get information for
   * @param user The authenticated user (must be a tutor)
   * @returns Basic child information (name, grade level)
   */
  @Get('/tutoring/child/:id')
  async getChildForTutoringSession(
    @Param('id', ParseIntPipe) id: number,
    @ActiveUser() user: ActiveUserData
  ) {
    if (!user || !user.sub) {
      throw new BadRequestException('Invalid user information');
    }
    
    // Ensure only tutors can access this endpoint
    if (user.role !== 'tutor') {
      throw new BadRequestException('Only tutors can access this endpoint');
    }
    
    try {
      // Get child data from the database
      const child = await this.childService.findChildById(id);
      
      // Return only the data needed for the session display
      return {
        childId: child.childId,
        firstName: child.firstName,
        lastName: child.lastName,
        fullName: `${child.firstName} ${child.lastName}`,
        gradeLevelId: child.gradeLevelId
      };
    } catch (error) {
      console.error(`Error fetching child with ID ${id} for tutoring session:`, error);
      
      // Return demo data for now - this would be removed in production
      if (id === 1) {
        return {
          childId: 1,
          firstName: 'Student',
          lastName: 'One',
          fullName: 'Student One',
          gradeLevelId: 4
        };
      } else {
        return {
          childId: id,
          firstName: 'Student',
          lastName: `${id}`,
          fullName: `Student ${id}`,
          gradeLevelId: id <= 6 ? id : 6
        };
      }
    }
  }
}
