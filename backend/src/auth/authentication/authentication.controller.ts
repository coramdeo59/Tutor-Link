import { Body, Controller, HttpCode, HttpStatus, Post, UseInterceptors, UploadedFile, ParseFilePipeBuilder } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { SignInDto } from './dto/sign-in.dto/sign-in.dto';
import { Auth } from './decorators/auth-decorator';
import { AuthType } from './enums/auth-type.enum';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { SignUpDto } from './dto/sign-up.dto/sign-up.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService, UploadType } from '../../upload/upload.service';

@Auth(AuthType.None)
@Controller('auth')
export class AuthenticationController {
  constructor(
    private readonly authService: AuthenticationService,
    private readonly uploadService: UploadService
  ) {}

  @Post('sign-up')
  async signUp(@Body() signUpDto: SignUpDto): Promise<any> {
    return this.authService.signUp(signUpDto);
  }
  
  /**
   * Enhanced sign-up endpoint that supports profile photo upload
   * This endpoint accepts multipart/form-data with a JSON signUpDto and an optional profile photo
   */
  @Post('sign-up-with-photo')
  @UseInterceptors(FileInterceptor('profilePhoto', {
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB
    },
  }))
  async signUpWithPhoto(
    @Body() signUpDto: SignUpDto,
    @UploadedFile(new ParseFilePipeBuilder()
      .addFileTypeValidator({ fileType: /(jpg|jpeg|png|gif|webp)$/ })
      .build({
        fileIsRequired: false,
      })
    ) profilePhoto?: Express.Multer.File,
  ): Promise<any> {
    // Handle the profile photo upload if a file was provided
    if (profilePhoto) {
      const uploadedFile = await this.uploadService.processUploadedFile(profilePhoto, UploadType.PROFILE_PICTURE);
      // Set the photo URL in the DTO
      signUpDto.photo = uploadedFile.secureUrl;
    }
    
    // Now proceed with normal sign-up process
    return this.authService.signUp(signUpDto);
  }
  @HttpCode(HttpStatus.OK)
  @Post('sign-in')
  async signIn(@Body() signInDto: SignInDto): Promise<any> {
    return this.authService.signIn(signInDto);
  }
  @HttpCode(HttpStatus.OK)
  @Post('refresh-tokens')
  async refreshTokens(@Body() refreshTokenDto: RefreshTokenDto): Promise<any> {
    return this.authService.refreshTokens(refreshTokenDto);
  }
}
