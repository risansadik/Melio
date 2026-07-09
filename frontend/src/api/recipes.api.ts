import { apiClient } from './client';
import {
  PaginatedSavedRecipes,
  RecipeDetails,
  SavedRecipe,
  SearchFilters,
  SearchRecipesResult,
} from '../types';

export const searchRecipesRequest = async (
  filters: SearchFilters,
  offset: number,
  number = 12
): Promise<SearchRecipesResult> => {
  const { data } = await apiClient.get('/recipes/search', {
    params: { ...filters, offset, number },
  });
  return data.data;
};

export const getRecipeDetailsRequest = async (id: number): Promise<RecipeDetails> => {
  const { data } = await apiClient.get(`/recipes/${id}`);
  return data.data;
};

export const saveRecipeRequest = async (recipe: {
  spoonacularId: number;
  title: string;
  image?: string;
}): Promise<SavedRecipe> => {
  const { data } = await apiClient.post('/recipes/saved', recipe);
  return data.data;
};

export const listSavedRecipesRequest = async (
  page: number,
  limit = 12
): Promise<PaginatedSavedRecipes> => {
  const { data } = await apiClient.get('/recipes/saved/me', { params: { page, limit } });
  return data.data;
};

export const deleteSavedRecipeRequest = async (savedRecipeId: string): Promise<void> => {
  await apiClient.delete(`/recipes/saved/${savedRecipeId}`);
};
