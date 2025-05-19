import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  ParseIntPipe,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { AdminService } from './admin.service';

@Controller('users/admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get()
  async findAll() {
    return this.adminService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.findOne(id);
  }

  @Post()
  async create(@Body() createAdminDto: any) {
    return this.adminService.create(createAdminDto);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAdminDto: any
  ) {
    return this.adminService.update(id, updateAdminDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.remove(id);
  }
} 