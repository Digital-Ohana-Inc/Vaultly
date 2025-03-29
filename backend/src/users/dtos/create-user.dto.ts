import { IsEmail, IsNotEmpty, MinLength, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client'; 

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

    @ApiProperty({ enum: Role, default: Role.USER })
    @IsEnum(Role)
    role?: Role = Role.USER
}
