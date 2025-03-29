import {
    Controller,
    Patch,
    Body,
    Param,
    UseGuards,
  } from '@nestjs/common';
  import { ShopService } from './shop.service';
  import { UpdateShopDto } from './dto/update-shop.dto';
  import { AuthGuard } from '@nestjs/passport';
  import { CurrentUser } from 'src/common/decorators/current-user.decorator';
  import {
    ApiBearerAuth,
    ApiOkResponse,
    ApiOperation,
    ApiResponse,
    ApiTags,
  } from '@nestjs/swagger';
  
  @ApiTags('shop')
  @Controller('shop')
  export class ShopController {
    constructor(private readonly shopService: ShopService) {}
  
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
  }
  