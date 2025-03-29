import { ApiProperty } from '@nestjs/swagger';
import { Role, ShopRole } from '@prisma/client';

class ShopProfileDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  address: string;

  @ApiProperty()
  contactInfo: string;

  @ApiProperty({ required: false, nullable: true })
  logo?: string | null;

  @ApiProperty({ required: false, nullable: true })
  hours?: string | null;

  @ApiProperty({ required: false, nullable: true })
  location?: string | null;

  @ApiProperty({ required: false, nullable: true })
  policies?: string | null;

  @ApiProperty({ required: false, nullable: true })
  planId?: string | null;
}

export class ShopAssignmentDto {
  @ApiProperty({ example: 'shop_123456' })
  shopId: string;

  @ApiProperty({ example: 'Vaultly Card Shop' })
  shopName: string;

  @ApiProperty({ enum: ShopRole, example: ShopRole.SALES_REP })
  role: ShopRole;
}

export class UserProfileResponseDto {
  @ApiProperty({ example: 'user_abc123' })
  id: string;

  @ApiProperty({ example: 'johndoe@example.com' })
  email: string;

  @ApiProperty({ example: 'John Doe' })
  name: string;

  @ApiProperty({ enum: Role, example: Role.USER })
  role: Role;

  @ApiProperty({ type: [ShopAssignmentDto] })
  shopUsers: ShopAssignmentDto[];
}
