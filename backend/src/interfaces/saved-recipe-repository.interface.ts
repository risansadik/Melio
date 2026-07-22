import { SavedRecipe } from '.prisma/client';

export interface PaginatedSavedRecipes {
  items: SavedRecipe[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ISavedRecipeRepository {
  save(
    userId: string,
    recipe: { spoonacularId: number; title: string; image?: string }
  ): Promise<SavedRecipe>;
  listForUser(userId: string, page: number, limit: number): Promise<PaginatedSavedRecipes>;
  delete(userId: string, savedRecipeId: string): Promise<void>;
}
