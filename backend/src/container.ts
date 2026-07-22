import 'reflect-metadata';
import { Container } from 'inversify';
import { PrismaClient } from '@prisma/client';
import { TYPES } from './types/inversify.types';
import { prisma } from './lib/prisma';

import { IAuthService } from './interfaces/auth-service.interface';
import { AuthService } from './services/auth.service';

import { ISpoonacularClient } from './interfaces/spoonacular-client.interface';
import { SpoonacularClient } from './services/spoonacular-client.service';

import { ISavedRecipeRepository } from './interfaces/saved-recipe-repository.interface';
import { SavedRecipeRepository } from './repositories/saved-recipe.repository';

import { AuthController } from './controllers/auth.controller';
import { RecipeController } from './controllers/recipe.controller';

const container = new Container();

container.bind<PrismaClient>(TYPES.PrismaClient).toConstantValue(prisma);
container.bind<IAuthService>(TYPES.AuthService).to(AuthService).inSingletonScope();
container
  .bind<ISpoonacularClient>(TYPES.SpoonacularClient)
  .to(SpoonacularClient)
  .inSingletonScope();
container
  .bind<ISavedRecipeRepository>(TYPES.SavedRecipeRepository)
  .to(SavedRecipeRepository)
  .inSingletonScope();

container.bind<AuthController>(TYPES.AuthController).to(AuthController).inSingletonScope();
container.bind<RecipeController>(TYPES.RecipeController).to(RecipeController).inSingletonScope();

export { container };
