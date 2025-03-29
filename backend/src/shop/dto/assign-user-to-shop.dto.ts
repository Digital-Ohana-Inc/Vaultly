import { IsUUID, IsEnum } from 'class-validator';
import { Role } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class AssignUserToShopDto {
  @ApiProperty({
    example: 'user-uuid-here',
    description: 'UUID of the user to assign',
  })
  @IsUUID()
  userId: string;

  @ApiProperty({
    example: 'shop-uuid-here',
    description: 'UUID of the shop to assign the user to',
  })
  @IsUUID()
  shopId: string;

  @ApiProperty({
    enum: Role,
    example: Role.USER,
    description: 'Role of the user in the shop',
  })
  @IsEnum(Role)
  role: Role;
}
