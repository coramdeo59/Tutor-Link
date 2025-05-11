import { Controller, Post, Body } from '@nestjs/common';
import { StudentsService } from './students.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { ActiveUser } from '../../auth/Decorators/active-user.decorator';
import { ActiveUserData } from '../../auth/interfaces/active-user-data.interface';

@Controller('students/profile')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Post()
  create(
    @Body() createStudentDto: CreateStudentDto,
    @ActiveUser() user: ActiveUserData,
  ) {
    return this.studentsService.create(createStudentDto, user.sub);
  }

  // You can add other student-specific endpoints here later
  // For example:
  // @Get()
  // findAll() {
  //   return this.studentsService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.studentsService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateStudentDto: any /* Replace with UpdateStudentDto */) {
  //   return this.studentsService.update(+id, updateStudentDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.studentsService.remove(+id);
  // }
}
