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

export interface SearchRecipesResult {
  results: unknown[];
  totalResults: number;
  offset: number;
  number: number;
}

export interface ISpoonacularClient {
  searchRecipes(params: SearchRecipesParams): Promise<SearchRecipesResult>;
  getRecipeDetails(id: number): Promise<unknown>;
}
