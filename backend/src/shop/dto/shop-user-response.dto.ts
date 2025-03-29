import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';

class UserDto {
  @ApiProperty({ example: 'user_abc123' })
  id: string;

  @ApiProperty({ example: 'johndoe@example.com' })
  email: string;

  @ApiProperty({ example: 'John Doe' })
  name: string;
}

class ShopDto {
  @ApiProperty({ example: 'shop_xyz789' })
  id: string;

  @ApiProperty({ example: 'Vaultly Card Shop' })
  name: string;

  @ApiProperty({ example: '123 Card St, Las Vegas, NV' })
  address: string;
}

export class ShopUserResponseDto {
  @ApiProperty({ example: 'shusr_123456' })
  id: string;

  @ApiProperty({ enum: Role, example: Role.USER })
  role: Role;

  @ApiProperty({ example: '2025-03-29T01:23:45.000Z' })
  assignedAt: Date;

  @ApiProperty({ type: UserDto })
  user: UserDto;

  @ApiProperty({ type: ShopDto })
  shop: ShopDto;
}
