import {
    ForbiddenException,
    Injectable,
    NotFoundException,
  } from '@nestjs/common';
  import { UpdateShopDto } from './dto/update-shop.dto';
  import { CreateShopDto } from './dto/create-shop.dto';
  import { PrismaService } from 'src/prisma/prisma.service';
  
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
          users: {
            connect: { id: userId }, // Link user to shop
          },
        },
      });
  
      // Set user's shop_id (1-to-1 reference)
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          shop_id: shop.id,
        },
      });
  
      return shop;
    }
  
    async updateShop(userId: string, shopId: string, dto: UpdateShopDto) {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { role: true, shop_id: true },
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
  
      // Optional security: restrict editing to assigned shop
      if (user.shop_id !== shopId) {
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
  }
  