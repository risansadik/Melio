import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/AppError';
import * as recipeService from '../services/recipe.service';
import { SearchRecipesParams } from '../services/recipe.service';

export const search = asyncHandler(async (req: Request, res: Response) => {
  const q = req.query as unknown as SearchRecipesParams;
  const result = await recipeService.searchRecipes(q);
  res.status(200).json({ status: 'success', data: result });
});

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const recipe = await recipeService.getRecipeDetails(id);
  res.status(200).json({ status: 'success', data: recipe });
});

export const saveRecipe = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw AppError.unauthorized();
  const saved = await recipeService.saveRecipeForUser(req.user.id, req.body);
  res.status(201).json({ status: 'success', data: saved });
});

export const listSaved = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw AppError.unauthorized();
  const { page, limit } = req.query as unknown as { page: number; limit: number };
  const result = await recipeService.listSavedRecipes(req.user.id, page, limit);
  res.status(200).json({ status: 'success', data: result });
});

export const removeSaved = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw AppError.unauthorized();
  await recipeService.deleteSavedRecipe(req.user.id, req.params.id);
  res.status(200).json({ status: 'success', data: null });
});