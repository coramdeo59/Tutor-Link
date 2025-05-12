import { Controller, Post, Body, ParseIntPipe } from '@nestjs/common';
import { ParentService } from './parent.service';

@Controller('tutors')
export class ParentController {
  constructor(private readonly tutorsService: ParentService) {}

  /**
   * Create a new tutor profile for an existing user.
   * The userId is expected to be passed in the body, linking to an existing user.
   */
  @Post()
  createTutor(
    @Body('userId', ParseIntPipe) userId: number, 
    @Body() createTutorDto: CreateTutorDto,
  ) {
    return this.tutorsService.createTutorProfile(userId, createTutorDto);
  }
}
