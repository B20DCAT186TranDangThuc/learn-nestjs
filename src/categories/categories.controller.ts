import {
  Body,
  ClassSerializerInterceptor,
  Controller, Delete, Get, Param, Patch, Post, UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { FindOneParams } from '../utils/findOneParams';
import { JwtAuthenticationGuard } from '../authentication/jwt-authentication.guard';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller('categories')
@UseInterceptors(ClassSerializerInterceptor)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  getAllCategories() {
    return this.categoriesService.getAllCategories();
  }

  @Get(':id')
  getCategoryById(@Param('id') { id }: FindOneParams) {
    return this.categoriesService.getCategoryById(Number(id));
  }

  @Post()
  @UseGuards(JwtAuthenticationGuard)
  async createCategory(@Body() category: CreateCategoryDto) {
    return this.categoriesService.createCategory(category);
  }

  @Patch(':id')
  async updateCategory(@Param() { id }: FindOneParams, @Body() category: UpdateCategoryDto) {
    return this.categoriesService.updateCategory(Number(id), category);
  }

  @Delete(':id')
  async deleteCategory(@Param() { id }: FindOneParams) {
    return this.categoriesService.deleteCategory(Number(id));
  }
}
