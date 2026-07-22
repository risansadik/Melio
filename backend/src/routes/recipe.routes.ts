import { Router } from 'express';
import { container } from '../container';
import { TYPES } from '../types/inversify.types';
import { RecipeController } from '../controllers/recipe.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import {
  listSavedRecipesSchema,
  recipeIdParamSchema,
  saveRecipeSchema,
  savedRecipeIdParamSchema,
  searchRecipesSchema,
} from '../validators/recipe.validator';

const router = Router();
const recipeController = container.get<RecipeController>(TYPES.RecipeController);

router.get('/search', validate(searchRecipesSchema), recipeController.search);
router.get('/:id', validate(recipeIdParamSchema), recipeController.getById);

router.get('/saved/me', requireAuth, validate(listSavedRecipesSchema), recipeController.listSaved);
router.post('/saved', requireAuth, validate(saveRecipeSchema), recipeController.saveRecipe);
router.delete('/saved/:id', requireAuth, validate(savedRecipeIdParamSchema), recipeController.removeSaved);

export default router;