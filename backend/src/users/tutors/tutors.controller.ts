import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { TutorsService } from './tutors.service';
import { CreateTutorDto } from './dto/create-tutor.dto';
import { UpdateTutorDto } from './dto/update-tutor.dto';
import { ActiveUser } from '../../auth/Decorators/active-user.decorator'; // Import ActiveUser
import { ActiveUserData } from '../../auth/interfaces/active-user-data.interface'; // Import ActiveUserData

@Controller('tutors')
export class TutorsController {
  constructor(private readonly tutorsService: TutorsService) {}

  @Post()
  create(
    @Body() createTutorDto: CreateTutorDto,
    @ActiveUser() user: ActiveUserData, // Inject ActiveUser
  ) {
    // Pass the userId from the active user to the service
    return this.tutorsService.create(createTutorDto, user.sub);
  }

  @Get()
  findAll() {
    return this.tutorsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tutorsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTutorDto: UpdateTutorDto) {
    return this.tutorsService.update(+id, updateTutorDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tutorsService.remove(+id);
  }
}
