import { IsNotEmpty, IsString, IsArray, IsDateString } from 'class-validator';


export class AddAvailabilitySlotDto {
  
  @IsNotEmpty()
  @IsString()
  dayOfWeek: string;


  @IsNotEmpty()
  @IsDateString()
  startTime: string;

 
  @IsNotEmpty()
  @IsDateString()
  endTime: string;
}

export class AddAvailabilityDto {

  @IsArray()
  @IsNotEmpty()
  availabilitySlots: AddAvailabilitySlotDto[];
} 