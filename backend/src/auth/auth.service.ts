import { Injectable } from '@nestjs/common';
import { CreateUserDto } from '../users/dtos/create-user.dto';
import { UsersService } from '../users/users.service';
import { UserResponseDto } from 'src/users/dtos/user-response.dto';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async register(dto: CreateUserDto): Promise<UserResponseDto> {
    const user = await this.usersService.create(dto);
    const { id, email, name, role } = user;
    return { id, email, name, role }
  }
}
