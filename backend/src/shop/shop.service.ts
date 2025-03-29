import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UpdateShopDto } from './dto/update-shop.dto';
import { CreateShopDto } from './dto/create-shop.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { AssignUserToShopDto } from './dto/assign-user-to-shop.dto';
import { Role } from '@prisma/client';

@Injectable()
export class ShopService {
  constructor(private prisma: PrismaService) {}

  async createShop(userId: string, dto: CreateShopDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user || user.role !== 'ADMIN') {
      throw new ForbiddenException('Only admins can create shops.');
    }

    const shop = await this.prisma.shop.create({
      data: {
        ...dto,
      },
    });

    // Assign creator to shop via ShopUser
    await this.prisma.shopUser.create({
      data: {
        userId,
        shopId: shop.id,
        role: Role.ADMIN,
      },
    });

    return shop;
  }

  async updateShop(userId: string, shopId: string, dto: UpdateShopDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        shopUsers: {
          where: { shopId },
          select: { role: true },
        },
      },
    });

    if (!user || user.role !== 'ADMIN') {
      throw new ForbiddenException('Only admins can update shops.');
    }

    const shop = await this.prisma.shop.findUnique({
      where: { id: shopId },
    });

    if (!shop) {
      throw new NotFoundException('Shop not found.');
    }

    const isAssignedToShop = user.shopUsers.length > 0;
    if (!isAssignedToShop) {
      throw new ForbiddenException('You do not have access to edit this shop.');
    }

    return this.prisma.shop.update({
      where: { id: shopId },
      data: {
        ...dto,
        updatedAt: new Date(),
      },
    });
  }

  async assignUserToShop(adminId: string, dto: AssignUserToShopDto) {
    const admin = await this.prisma.user.findUnique({
      where: { id: adminId },
    });
  
    if (!admin || admin.role !== 'ADMIN') {
      throw new ForbiddenException('Only admins can assign users to shops.');
    }
  
    const { userId, shopId, role } = dto;
  
    const [user, shop] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: userId } }),
      this.prisma.shop.findUnique({ where: { id: shopId } }),
    ]);
  
    if (!user) throw new NotFoundException('User not found.');
    if (!shop) throw new NotFoundException('Shop not found.');
  
    const existing = await this.prisma.shopUser.findFirst({
      where: { userId, shopId },
    });
  
    if (existing) {
      throw new ForbiddenException('User is already assigned to this shop.');
    }
  
    const shopUser = await this.prisma.shopUser.create({
      data: {
        userId,
        shopId,
        role,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        shop: {
          select: {
            id: true,
            name: true,
            address: true,
          },
        },
      },
    });
  
    return shopUser;
  }
  
}
