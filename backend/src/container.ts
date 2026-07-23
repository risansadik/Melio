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

import { IUserRepository } from './interfaces/user-repository.interface';
import { UserRepository } from './repositories/user.repository';

import { IRefreshTokenRepository } from './interfaces/refresh-token-repository.interface';
import { RefreshTokenRepository } from './repositories/refresh-token.repository';

import { AuthController } from './controllers/auth.controller';
import { RecipeController } from './controllers/recipe.controller';

const container = new Container();

// The Prisma client is a pre-built singleton (see lib/prisma.ts), so we
// bind the existing instance rather than letting Inversify construct one.
container.bind<PrismaClient>(TYPES.PrismaClient).toConstantValue(prisma);

// Every service/repository is bound to its INTERFACE, not its concrete
// class. Consumers only ever see the interface type — the concrete
// implementation is purely a container wiring detail. This is enforced
// consistently across BOTH features (auth and recipes): nothing above the
// repository layer ever touches Prisma directly.
container.bind<IUserRepository>(TYPES.UserRepository).to(UserRepository).inSingletonScope();
container
  .bind<IRefreshTokenRepository>(TYPES.RefreshTokenRepository)
  .to(RefreshTokenRepository)
  .inSingletonScope();
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
