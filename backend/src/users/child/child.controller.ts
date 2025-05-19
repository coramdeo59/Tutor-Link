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
      return await this.childService.findByParent(user.sub);
    } catch (error) {
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
}
