import axios, { AxiosError } from 'axios';
import { env } from '../config/env';
import { prisma } from '../lib/prisma';
import { AppError } from '../utils/AppError';

const spoonacular = axios.create({
  baseURL: env.SPOONACULAR_BASE_URL,
  timeout: 10_000,
  params: {
    apiKey: env.SPOONACULAR_API_KEY,
  },
});

const handleSpoonacularError = (err: unknown): never => {
  if (err instanceof AxiosError) {
    const status = err.response?.status;

    if (status === 401 || status === 403) {
      throw AppError.badGateway('Recipe provider rejected our API key. Check SPOONACULAR_API_KEY.');
    }

    if (status === 402) {
      throw AppError.badGateway('Recipe provider daily quota exceeded. Try again tomorrow.');
    }

    if (status === 404) {
      throw AppError.notFound('Recipe not found');
    }

    throw AppError.badGateway(
      `Recipe provider request failed${status ? ` (status ${status})` : ''}`
    );
  }

  throw AppError.badGateway('Unexpected error contacting recipe provider');
};

export interface SearchRecipesParams {
  query?: string;
  cuisine?: string;
  diet?: string;
  intolerances?: string;
  type?: string;
  sort?: string;
  number: number;
  offset: number;
}

export const searchRecipes = async (params: SearchRecipesParams) => {
  try {
    const { data } = await spoonacular.get('/recipes/complexSearch', {
      params: {
        query: params.query,
        cuisine: params.cuisine,
        diet: params.diet,
        intolerances: params.intolerances,
        type: params.type,
        sort: params.sort,
        number: params.number,
        offset: params.offset,
        addRecipeInformation: false,
      },
    });

    return {
      results: data.results ?? [],
      totalResults: data.totalResults ?? 0,
      offset: data.offset ?? params.offset,
      number: data.number ?? params.number,
    };
  } catch (err) {
    return handleSpoonacularError(err);
  }
};

export const getRecipeDetails = async (id: number) => {
  try {
    const { data } = await spoonacular.get(`/recipes/${id}/information`, {
      params: { includeNutrition: true },
    });
    return data;
  } catch (err) {
    return handleSpoonacularError(err);
  }
};

export const saveRecipeForUser = async (
  userId: string,
  recipe: { spoonacularId: number; title: string; image?: string }
) => {
  const existing = await prisma.savedRecipe.findUnique({
    where: {
      userId_spoonacularId: {
        userId,
        spoonacularId: recipe.spoonacularId,
      },
    },
  });

  if (existing) {
    throw AppError.conflict('Recipe is already saved');
  }

  return prisma.savedRecipe.create({
    data: {
      userId,
      spoonacularId: recipe.spoonacularId,
      title: recipe.title,
      image: recipe.image,
    },
  });
};

export const listSavedRecipes = async (userId: string, page: number, limit: number) => {
  const skip = (page - 1) * limit;

  const [items, total] = await prisma.$transaction([
    prisma.savedRecipe.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.savedRecipe.count({ where: { userId } }),
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
};

export const deleteSavedRecipe = async (userId: string, savedRecipeId: string) => {
  const recipe = await prisma.savedRecipe.findUnique({ where: { id: savedRecipeId } });

  if (!recipe || recipe.userId !== userId) {
    throw AppError.notFound('Saved recipe not found');
  }

  await prisma.savedRecipe.delete({ where: { id: savedRecipeId } });
};
