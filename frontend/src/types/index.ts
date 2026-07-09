export interface User {
  id: string;
  name: string;
  email: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}

export interface RecipeSummary {
  id: number;
  title: string;
  image?: string;
  imageType?: string;
}

export interface SearchRecipesResult {
  results: RecipeSummary[];
  totalResults: number;
  offset: number;
  number: number;
}

export interface RecipeIngredient {
  id: number;
  name: string;
  amount: number;
  unit: string;
  original: string;
}

export interface RecipeNutrient {
  name: string;
  amount: number;
  unit: string;
}

export interface RecipeDetails {
  id: number;
  title: string;
  image?: string;
  summary: string;
  readyInMinutes: number;
  servings: number;
  sourceUrl?: string;
  extendedIngredients: RecipeIngredient[];
  analyzedInstructions: {
    name: string;
    steps: { number: number; step: string }[];
  }[];
  nutrition?: {
    nutrients: RecipeNutrient[];
  };
  diets?: string[];
  cuisines?: string[];
}

export interface SavedRecipe {
  id: string;
  spoonacularId: number;
  title: string;
  image?: string | null;
  createdAt: string;
}

export interface PaginatedSavedRecipes {
  items: SavedRecipe[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface SearchFilters {
  query?: string;
  cuisine?: string;
  diet?: string;
  intolerances?: string;
  type?: string;
  sort?: string;
}

export interface ApiErrorBody {
  status: 'error';
  message: string;
  errors?: Record<string, string[]> | unknown;
}
