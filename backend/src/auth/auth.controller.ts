import {
  Controller,
  Post,
  Body,
  Get,
  Patch,
  Req,
  Res,
  UseGuards,
  UnauthorizedException,
  Delete,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dtos/create-user.dto';
import { UserResponseDto } from '../users/dtos/user-response.dto';
import { UserProfileResponseDto } from './dtos/user-profile-response.dto';
import { UpdateUserDto } from 'src/users/dtos/update-user.dto';
import { LoginDto } from './dtos/login.dto';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiCreatedResponse({ type: UserResponseDto })
  @ApiOperation({ summary: 'Register a new user' })
  async register(@Body() dto: CreateUserDto): Promise<UserResponseDto> {
    return this.authService.register(dto);
  }

  @Post('login')
  @ApiOperation({ summary: 'User Login' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 400, description: 'Invalid credentials' })
  @ApiBody({ type: LoginDto })
  async login(@Body() dto: LoginDto, @Res() res: Response) {
    const { accessToken, refreshToken } = await this.authService.loginUser(dto.email, dto.password);

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    return res.json({ accessToken });
  }

  @Post('refresh-token')
  @ApiOperation({ summary: 'Refresh Access Token' })
  @ApiResponse({ status: 200, description: 'New access token generated' })
  @ApiResponse({ status: 400, description: 'Invalid or expired refresh token' })
  async refreshToken(@Req() req: Request, @Res() res: Response) {
    const refreshToken = req.cookies['refresh_token'];
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token missing');
    }

    const { accessToken, refreshToken: newRefreshToken } =
      await this.authService.refreshUserToken(refreshToken);

    res.cookie('refresh_token', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    return res.json({ accessToken });
  }

  @Get('profile')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get authenticated user profile' })
  @ApiOkResponse({ type: UserProfileResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getProfile(@CurrentUser() user: any): Promise<UserProfileResponseDto> {
    const dbUser = await this.authService.getProfile(user.id);
  
    if (!dbUser) {
      throw new UnauthorizedException('User not found');
    }
  
    return dbUser;
  }

  @Patch('profile')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Update authenticated user profile' })
  @ApiOkResponse({ type: UserProfileResponseDto })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateProfile(
    @CurrentUser() user: any,
    @Body() dto: UpdateUserDto,
  ): Promise<UserProfileResponseDto> {
    const updatedUser = await this.authService.updateProfile(user.id, dto);
  
    if (!updatedUser) {
      throw new UnauthorizedException('User not found');
    }
  
    return updatedUser;
  }

  @Delete('profile')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Soft delete authenticated user' })
  @ApiResponse({ status: 200, description: 'User soft-deleted and logged out' })
  async deleteProfile(
    @CurrentUser() user: any,
    @Res() res: Response,
  ) {
    await this.authService.deleteProfile(user.id);
  
    res.clearCookie('refresh_token');
    return res.status(200).json({ message: 'Your account has been deleted. You have been logged out.' });
  }

  @UseGuards(AuthGuard('jwt-soft'))
  @Post('cancel-deletion')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Cancel scheduled account deletion' })
  @ApiOkResponse({ type: UserProfileResponseDto })
  @ApiResponse({ status: 400, description: 'No deletion scheduled' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async cancelDeletion(@CurrentUser() user: any): Promise<UserProfileResponseDto> {
    return this.authService.cancelDeletion(user.id);
  }
  
  
    
}
