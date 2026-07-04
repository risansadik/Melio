import { z } from 'zod';

const numericString = (max: number, fallback: number) =>
  z
    .string()
    .optional()
    .transform((val) => {
      if (val === undefined || val === '') return fallback;
      const n = Number(val);
      return Number.isFinite(n) ? n : fallback;
    })
    .pipe(z.number().int().min(0).max(max));

export const searchRecipesSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}).optional(),
  query: z.object({
    query: z.string().trim().max(200).optional(),
    cuisine: z.string().trim().max(100).optional(),
    diet: z.string().trim().max(100).optional(),
    intolerances: z.string().trim().max(200).optional(),
    type: z.string().trim().max(100).optional(),
    sort: z.string().trim().max(50).optional(),
    number: numericString(100, 12),
    offset: numericString(900, 0),
  }),
});

export const recipeIdParamSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({}).optional(),
  params: z.object({
    id: z
      .string()
      .regex(/^\d+$/, 'Recipe id must be numeric'),
  }),
});

export const savedRecipeIdParamSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({}).optional(),
  params: z.object({
    id: z.string().uuid('Saved recipe id must be a valid UUID'),
  }),
});

export const saveRecipeSchema = z.object({
  query: z.object({}).optional(),
  params: z.object({}).optional(),
  body: z.object({
    spoonacularId: z.number().int().positive(),
    title: z.string().trim().min(1).max(300),
    image: z.string().trim().url().optional().or(z.literal('')).optional(),
  }),
});

export const listSavedRecipesSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}).optional(),
  query: z.object({
    page: numericString(10000, 1),
    limit: numericString(50, 12),
  }),
});
