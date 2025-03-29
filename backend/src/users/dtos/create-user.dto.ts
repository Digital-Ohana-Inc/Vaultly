import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
    @ApiProperty({ example: 'user@example.com' })
    @IsEmail()
    email: string;
    
    @ApiProperty({ example: 'Jane Doe' })
    @IsNotEmpty()
    name: string;
    
    @ApiProperty({ example: 'StrongPassword123' })
    @MinLength(6)
    password: string;
}
