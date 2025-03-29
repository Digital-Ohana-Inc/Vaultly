import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { CreateUserDto } from '../users/dtos/create-user.dto';
import { UsersService } from '../users/users.service';
import { ConfigService } from '@nestjs/config';
import { Role, ShopRole } from '@prisma/client';
import { UpdateUserDto } from 'src/users/dtos/update-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private usersService: UsersService,
    private configService: ConfigService
  ) {}

  private generateTokens(userId: string, email: string, role: Role) {
    const payload = { id: userId, email, roles: [role] };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_SECRET'),
      expiresIn: '1h',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('REFRESH_SECRET'),
      expiresIn: '7d',
    });

    return { accessToken, refreshToken };
  }

  private async getOwnedShopIds(userId: string): Promise<string[]> {
    const shopUsers = await this.prisma.shopUser.findMany({
      where: {
        userId,
        role: ShopRole.OWNER,
      },
      select: { shopId: true },
    });

    return shopUsers.map((s) => s.shopId);
  }

  async refreshUserToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('REFRESH_SECRET'),
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.id },
      });

      if (!user) throw new NotFoundException('User not found.');

      return this.generateTokens(user.id, user.email, user.role);
    } catch (error) {
      throw new BadRequestException('Invalid or expired refresh token.');
    }
  }

  async register(dto: CreateUserDto) {
    const user = await this.usersService.create(dto);
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
  }

  async loginUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new NotFoundException('User not found');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new BadRequestException('Invalid credentials');

    return this.generateTokens(user.id, user.email, user.role);
  }

  async getProfile(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        shopUsers: {
          include: {
            shop: true,
          },
        },
      },
    });
  }

  async updateProfile(userId: string, dto: UpdateUserDto) {
    const dataToUpdate: any = { ...dto };

    if (dto.password) {
      dataToUpdate.password = await bcrypt.hash(dto.password, 10);
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        ...dataToUpdate,
        updatedAt: new Date(),
      },
      include: {
        shopUsers: {
          include: {
            shop: true,
          },
        },
      },
    });
  }

  async deleteProfile(userId: string) {
    const ownedShopIds = await this.getOwnedShopIds(userId);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        deletedAt: new Date(),
      },
    });

    if (ownedShopIds.length > 0) {
      await this.prisma.shop.updateMany({
        where: { id: { in: ownedShopIds } },
        data: { deletedAt: new Date() },
      });
    }

    return { message: 'Account and owned shops marked for deletion' };
  }

  async cancelDeletion(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user || !user.deletedAt) {
      throw new BadRequestException('No deletion scheduled for this account.');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        deletedAt: null,
        updatedAt: new Date(),
      },
      include: {
        shopUsers: {
          include: {
            shop: true,
          },
        },
      },
    });

    const ownedShopIds = await this.getOwnedShopIds(userId);
    if (ownedShopIds.length > 0) {
      await this.prisma.shop.updateMany({
        where: { id: { in: ownedShopIds } },
        data: { deletedAt: null, updatedAt: new Date() },
      });
    }

    return updatedUser;
  }

  async hardDeleteUser(userId: string) {
    const ownedShopIds = await this.getOwnedShopIds(userId);

    if (ownedShopIds.length > 0) {
      await this.prisma.shopUser.deleteMany({
        where: { shopId: { in: ownedShopIds } },
      });

      await this.prisma.shop.deleteMany({
        where: { id: { in: ownedShopIds } },
      });
    }

    await this.prisma.shopUser.deleteMany({
      where: { userId },
    });

    await this.prisma.user.delete({
      where: { id: userId },
    });

    return { message: 'User and all owned shops permanently deleted' };
  }
}
