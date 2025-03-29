import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';

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

export class UserProfileResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ enum: Role })
  role: Role;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ type: ShopProfileDto, required: false, nullable: true })
  shop?: ShopProfileDto | null;
}
