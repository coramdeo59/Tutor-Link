import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class TokenDto {
  @IsString()
  @IsUUID(4, { message: 'Token ID must be a valid UUID v4' })
  @IsNotEmpty({ message: 'Token ID is required' })
  tokenId: string;
}
