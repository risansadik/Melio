import { injectable, inject } from 'inversify';
import { PrismaClient, SavedRecipe } from '.prisma/client';
import { TYPES } from '../types/inversify.types';
import { AppError } from '../utils/AppError';
import {
  ISavedRecipeRepository,
  PaginatedSavedRecipes,
} from '../interfaces/saved-recipe-repository.interface';

@injectable()
export class SavedRecipeRepository implements ISavedRecipeRepository {
  constructor(@inject(TYPES.PrismaClient) private readonly prisma: PrismaClient) {}

  async save(
    userId: string,
    recipe: { spoonacularId: number; title: string; image?: string }
  ): Promise<SavedRecipe> {
    const existing = await this.prisma.savedRecipe.findUnique({
      where: { userId_spoonacularId: { userId, spoonacularId: recipe.spoonacularId } },
    });

    if (existing) {
      throw AppError.conflict('Recipe is already saved');
    }

    return this.prisma.savedRecipe.create({
      data: {
        userId,
        spoonacularId: recipe.spoonacularId,
        title: recipe.title,
        image: recipe.image,
      },
    });
  }

  async listForUser(userId: string, page: number, limit: number): Promise<PaginatedSavedRecipes> {
    const skip = (page - 1) * limit;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.savedRecipe.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.savedRecipe.count({ where: { userId } }),
    ]);

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  }

  async delete(userId: string, savedRecipeId: string): Promise<void> {
    const recipe = await this.prisma.savedRecipe.findUnique({ where: { id: savedRecipeId } });

    if (!recipe || recipe.userId !== userId) {
      throw AppError.notFound('Saved recipe not found');
    }

    await this.prisma.savedRecipe.delete({ where: { id: savedRecipeId } });
  }
}