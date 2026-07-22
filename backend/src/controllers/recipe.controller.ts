import { injectable, inject } from 'inversify';
import { Request, Response } from 'express';
import { TYPES } from '../types/inversify.types';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/AppError';
import { ISpoonacularClient, SearchRecipesParams } from '../interfaces/spoonacular-client.interface';
import { ISavedRecipeRepository } from '../interfaces/saved-recipe-repository.interface';

@injectable()
export class RecipeController {
  constructor(
    @inject(TYPES.SpoonacularClient) private readonly _spoonacularClient: ISpoonacularClient,
    @inject(TYPES.SavedRecipeRepository)
    private readonly _savedRecipeRepository: ISavedRecipeRepository
  ) { }

  search = asyncHandler(async (req: Request, res: Response) => {
    const q = req.query as unknown as SearchRecipesParams;
    const result = await this._spoonacularClient.searchRecipes(q);
    res.status(200).json({ status: 'success', data: result });
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const recipe = await this._spoonacularClient.getRecipeDetails(id);
    res.status(200).json({ status: 'success', data: recipe });
  });

  saveRecipe = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw AppError.unauthorized();
    const saved = await this._savedRecipeRepository.save(req.user.id, req.body);
    res.status(201).json({ status: 'success', data: saved });
  });

  listSaved = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw AppError.unauthorized();
    const { page, limit } = req.query as unknown as { page: number; limit: number };
    const result = await this._savedRecipeRepository.listForUser(req.user.id, page, limit);
    res.status(200).json({ status: 'success', data: result });
  });

  removeSaved = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw AppError.unauthorized();
    await this._savedRecipeRepository.delete(req.user.id, req.params.id);
    res.status(200).json({ status: 'success', data: null });
  });
}
