import { Test, TestingModule } from '@nestjs/testing';
import { AuthenticationController } from './authentication.controller';
import { AuthenticationService } from './authentication.service';
import { SignUpDto } from './dto/sign-up.dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto/sign-in.dto';
import { HttpStatus } from '@nestjs/common';

describe('AuthenticationController', () => {
  let controller: AuthenticationController;
  let authService: AuthenticationService;

  // Mock service responses
  const mockSignupResponse = {
    id: 'test-user-id',
    name: 'Test User',
    email: 'test@example.com',
    createdAt: new Date(),
  };

  const mockSigninResponse = {
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
    user: {
      id: 'test-user-id',
      name: 'Test User',
      email: 'test@example.com',
    },
  };

  beforeEach(async () => {
    const mockAuthService = {
      signUp: jest.fn().mockResolvedValue(mockSignupResponse),
      signIn: jest.fn().mockResolvedValue(mockSigninResponse),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthenticationController],
      providers: [
        {
          provide: AuthenticationService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthenticationController>(AuthenticationController);
    authService = module.get<AuthenticationService>(AuthenticationService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('signUp', () => {
    it('should create a new user account', async () => {
      // Sample sign-up request object
      const signUpDto: SignUpDto = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'securePassword123',
      };

      const result = await controller.signUp(signUpDto);

      // Verify that service method was called with correct parameters
      expect(authService.signUp).toHaveBeenCalledWith(signUpDto);

      // Verify the response
      expect(result).toEqual(mockSignupResponse);
      expect(result.name).toBe(signUpDto.name);
      expect(result.email).toBe(signUpDto.email);
    });
  });

  describe('signIn', () => {
    it('should authenticate a user and return tokens', async () => {
      // Sample sign-in request object
      const signInDto: SignInDto = {
        email: 'test@example.com',
        password: 'securePassword123',
      };

      const result = await controller.signIn(signInDto);

      // Verify that service method was called with correct parameters
      expect(authService.signIn).toHaveBeenCalledWith(signInDto);

      // Verify the response
      expect(result).toEqual(mockSigninResponse);
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(result.user.email).toBe(signInDto.email);
    });
  });
});
