import {
  Controller,
  Get,
  Put,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { Auth } from '../auth/authentication/decorators/auth-decorator';
import { AuthType } from '../auth/authentication/enums/auth-type.enum';
import { Roles } from '../auth/authorization/decorators/roles.decorator';
import { Role } from '../users/enums/role-enums';
import { RolesGuard } from '../auth/authentication/guards/roles/roles.guard';

@Controller('admin')
@UseGuards(RolesGuard)
@Auth(AuthType.Bearer) // Corrected to AuthType.Bearer
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  @Roles(Role.Admin)
  listUsers() {
    return this.adminService.listAllUsers();
  }

  @Get('tutors/pending')
  @Roles(Role.Admin)
  listPendingTutors() {
    return this.adminService.listPendingTutors();
  }

  @Get('tutors/:id')
  @Roles(Role.Admin)
  getTutorDetails(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.getTutorDetails(id);
  }

  @Put('tutors/:id/verify')
  @Roles(Role.Admin)
  verifyTutor(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.verifyTutor(id);
  }
}
