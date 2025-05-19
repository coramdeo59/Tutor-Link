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
import { ParentService } from './parent.service';

@Controller('users/parent')
export class ParentController {
  constructor(private readonly parentService: ParentService) {}

  @Get()
  async findAll() {
    return this.parentService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.parentService.findOne(id);
  }

  @Post()
  async create(@Body() createParentDto: any) {
    return this.parentService.create(createParentDto);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateParentDto: any
  ) {
    return this.parentService.update(id, updateParentDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.parentService.remove(id);
  }
} 