import { Controller, Post, Body, Param, ParseIntPipe } from '@nestjs/common';
import { ParentService } from './parent.service';
import { CreateChildDto } from './dtos/create-child.dto';
import { ChildLoginDto } from './dtos/child-login.dto'; // Import ChildLoginDto
import { AuthType } from 'src/auth/authentication/enums/auth-type.enum';
import { Auth } from 'src/auth/authentication/decorators/auth-decorator';

@Auth(AuthType.Bearer) // Requires authentication for parent operations
@Controller('parents')
export class ParentController {
  constructor(private readonly parentService: ParentService) {}

  /**
   * Add a child to a parent's profile with direct login credentials
   * This creates a child record and links it to the parent
   */
  @Post(':parentId/children')
  async addChild(
    @Param('parentId', ParseIntPipe) parentId: number,
    @Body() createChildDto: CreateChildDto,
  ) {
    // Ensure the user is adding a child to their own profile
    // if (user.userId !== parentId) {
    //   throw new UnauthorizedException('You can only add children to your own profile');
    // }

    // Set the parentId in the DTO
    createChildDto.parentId = parentId;

    return this.parentService.addChild(createChildDto);
  }

  /**
   * Login as a child using username and password
   */
  @Post('children/login')
  @Auth(AuthType.None)
  async loginChild(@Body() childLoginDto: ChildLoginDto) {
    // Updated to use ChildLoginDto
    // Validation for username and password presence is handled by class-validator in ChildLoginDto
    return this.parentService.loginChild(childLoginDto);
  }
}
