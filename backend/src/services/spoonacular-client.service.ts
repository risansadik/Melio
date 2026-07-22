import { injectable } from 'inversify';
import axios, { AxiosInstance, AxiosError } from 'axios';
import { env } from '../config/env';
import { AppError } from '../utils/AppError';
import {
  ISpoonacularClient,
  SearchRecipesParams,
  SearchRecipesResult,
} from '../interfaces/spoonacular-client.interface';

@injectable()
export class SpoonacularClient implements ISpoonacularClient {
  private readonly http: AxiosInstance;

  constructor() {
    this.http = axios.create({
      baseURL: env.SPOONACULAR_BASE_URL,
      timeout: 10_000,
      params: { apiKey: env.SPOONACULAR_API_KEY },
    });
  }

  private handleError(err: unknown): never {
    if (err instanceof AxiosError) {
      const status = err.response?.status;

      if (status === 401 || status === 403) {
        throw AppError.badGateway(
          'Recipe provider rejected our API key. Check SPOONACULAR_API_KEY.'
        );
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
  }

  async searchRecipes(params: SearchRecipesParams): Promise<SearchRecipesResult> {
    try {
      const { data } = await this.http.get('/recipes/complexSearch', {
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
      return this.handleError(err);
    }
  }

  async getRecipeDetails(id: number): Promise<unknown> {
    try {
      const { data } = await this.http.get(`/recipes/${id}/information`, {
        params: { includeNutrition: true },
      });
      return data;
    } catch (err) {
      return this.handleError(err);
    }
  }
}