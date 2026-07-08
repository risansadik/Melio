import { useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getRecipeDetailsRequest, saveRecipeRequest, listSavedRecipesRequest, deleteSavedRecipeRequest } from '../api/recipes.api';
import { getApiErrorMessage } from '../api/client';
import { useAuth } from '../hooks/useAuth';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorMessage } from '../components/common/ErrorMessage';

const stripHtml = (html: string): string => html.replace(/<[^>]*>/g, '');

export const RecipeDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const recipeId = Number(id);
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [saveError, setSaveError] = useState<string | null>(null);

  const {
    data: recipe,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['recipe', recipeId],
    queryFn: () => getRecipeDetailsRequest(recipeId),
    enabled: Number.isFinite(recipeId),
  });

  const { data: savedData } = useQuery({
    queryKey: ['saved-recipes', 'all-for-lookup'],
    queryFn: () => listSavedRecipesRequest(1, 100),
    enabled: isAuthenticated,
  });

  const existingSavedRecipe = useMemo(
    () => savedData?.items.find((item) => item.spoonacularId === recipeId),
    [savedData, recipeId]
  );

  const saveMutation = useMutation({
    mutationFn: () =>
      saveRecipeRequest({
        spoonacularId: recipeId,
        title: recipe?.title ?? '',
        image: recipe?.image,
      }),
    onSuccess: () => {
      setSaveError(null);
      queryClient.invalidateQueries({ queryKey: ['saved-recipes'] });
    },
    onError: (err) => setSaveError(getApiErrorMessage(err, 'Could not save this recipe.')),
  });

  const unsaveMutation = useMutation({
    mutationFn: (savedRecipeId: string) => deleteSavedRecipeRequest(savedRecipeId),
    onSuccess: () => {
      setSaveError(null);
      queryClient.invalidateQueries({ queryKey: ['saved-recipes'] });
    },
    onError: (err) => setSaveError(getApiErrorMessage(err, 'Could not remove this recipe.')),
  });

  if (isLoading) return <LoadingSpinner label="Loading recipe…" size="lg" />;

  if (isError || !recipe) {
    return (
      <ErrorMessage
        message={getApiErrorMessage(error, 'Could not load this recipe.')}
        onRetry={() => refetch()}
      />
    );
  }

  const instructionSteps = recipe.analyzedInstructions[0]?.steps ?? [];
  const keyNutrients = (recipe.nutrition?.nutrients ?? []).filter((n) =>
    ['Calories', 'Protein', 'Fat', 'Carbohydrates'].includes(n.name)
  );

  return (
    <article className="flex flex-col gap-8">
      <Link to="/" className="text-sm font-medium text-pantry-700 hover:text-clay-600">
        ← Back to search
      </Link>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="aspect-[4/3] overflow-hidden rounded-card bg-pantry-100">
          {recipe.image ? (
            <img src={recipe.image} alt={recipe.title} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-pantry-700/60">
              No image available
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <h1 className="text-3xl font-semibold text-pantry-900">{recipe.title}</h1>

          <div className="flex flex-wrap gap-3 text-sm text-pantry-700">
            <span className="rounded-full bg-pantry-100 px-3 py-1">
              ⏱ {recipe.readyInMinutes} min
            </span>
            <span className="rounded-full bg-pantry-100 px-3 py-1">
              🍽 {recipe.servings} servings
            </span>
            {recipe.diets?.map((diet) => (
              <span key={diet} className="rounded-full bg-pantry-100 px-3 py-1 capitalize">
                {diet}
              </span>
            ))}
          </div>

          <p className="text-pantry-800">{stripHtml(recipe.summary).slice(0, 400)}…</p>

          {isAuthenticated ? (
            existingSavedRecipe ? (
              <button
                type="button"
                className="btn-secondary w-fit"
                disabled={unsaveMutation.isPending}
                onClick={() => unsaveMutation.mutate(existingSavedRecipe.id)}
              >
                {unsaveMutation.isPending ? 'Removing…' : '★ Remove from Saved'}
              </button>
            ) : (
              <button
                type="button"
                className="btn-primary w-fit"
                disabled={saveMutation.isPending}
                onClick={() => saveMutation.mutate()}
              >
                {saveMutation.isPending ? 'Saving…' : '☆ Save Recipe'}
              </button>
            )
          ) : (
            <p className="text-sm text-pantry-700">
              <Link to="/login" className="font-medium text-clay-600 hover:underline">
                Log in
              </Link>{' '}
              to save this recipe to your favorites.
            </p>
          )}

          {saveError && <p className="text-sm text-red-700">{saveError}</p>}
        </div>
      </div>

      {keyNutrients.length > 0 && (
        <section>
          <h2 className="mb-3 text-xl font-semibold text-pantry-900">Nutrition</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {keyNutrients.map((n) => (
              <div key={n.name} className="rounded-card border border-pantry-700/10 bg-white p-4 text-center">
                <div className="text-lg font-semibold text-pantry-900">
                  {Math.round(n.amount)}
                  {n.unit}
                </div>
                <div className="text-xs text-pantry-700">{n.name}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-3 text-xl font-semibold text-pantry-900">Ingredients</h2>
        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {recipe.extendedIngredients.map((ingredient) => (
            <li
              key={ingredient.id}
              className="rounded-card border border-pantry-700/10 bg-white px-4 py-2 text-sm text-pantry-800"
            >
              {ingredient.original}
            </li>
          ))}
        </ul>
      </section>

      {instructionSteps.length > 0 && (
        <section>
          <h2 className="mb-3 text-xl font-semibold text-pantry-900">Instructions</h2>
          <ol className="flex flex-col gap-3">
            {instructionSteps.map((step) => (
              <li key={step.number} className="flex gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-pantry-800 text-sm font-semibold text-pantry-50">
                  {step.number}
                </span>
                <p className="pt-1 text-pantry-800">{step.step}</p>
              </li>
            ))}
          </ol>
        </section>
      )}

      {recipe.sourceUrl && (
        <a
          href={recipe.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-clay-600 hover:underline"
        >
          View original recipe source →
        </a>
      )}
    </article>
  );
};
