import {
    Controller,
    Patch,
    Body,
    Param,
    UseGuards,
    Post,
    ForbiddenException,
  } from '@nestjs/common';
  import { ShopService } from './shop.service';
  import { UpdateShopDto } from './dto/update-shop.dto';
  import { AuthGuard } from '@nestjs/passport';
  import { CurrentUser } from 'src/common/decorators/current-user.decorator';
  import {
    ApiBearerAuth,
    ApiBody,
    ApiOkResponse,
    ApiOperation,
    ApiResponse,
    ApiTags,
  } from '@nestjs/swagger';
import { CreateShopDto } from './dto/create-shop.dto';
import { AssignUserToShopDto } from './dto/assign-user-to-shop.dto';
import { ShopUserResponseDto } from './dto/shop-user-response.dto';
  
  @ApiTags('shop')
  @Controller('shop')
  export class ShopController {
    constructor(private readonly shopService: ShopService) {}

    @Post()
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: 'Create a shop (admin only)' })
    @ApiResponse({ status: 201, description: 'Shop created successfully' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    async createShop(
      @CurrentUser() user: any,
      @Body() dto: CreateShopDto,
    ) {
      if (user.role !== 'ADMIN') {
        throw new ForbiddenException('Only admins can create shops.');
      }
  
      return this.shopService.createShop(user.id, dto);
    }
  
    @Patch(':id')
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: 'Update a shop (admin only)' })
    @ApiOkResponse({ description: 'Updated shop data' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    async updateShop(
      @Param('id') shopId: string,
      @CurrentUser() user: any,
      @Body() dto: UpdateShopDto,
    ) {
      return this.shopService.updateShop(user.id, shopId, dto);
    }

    @Post('assign-user')
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: 'Admin assigns user to a shop' })
    @ApiBody({ type: AssignUserToShopDto })
    @ApiOkResponse({ description: 'User assigned successfully', type: ShopUserResponseDto })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    async assignUserToShop(
      @CurrentUser() user: any,
      @Body() dto: AssignUserToShopDto,
    ): Promise<ShopUserResponseDto> {
      return this.shopService.assignUserToShop(user.id, dto);
    }

  }
  