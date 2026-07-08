import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { deleteSavedRecipeRequest, listSavedRecipesRequest } from '../api/recipes.api';
import { getApiErrorMessage } from '../api/client';
import { RecipeCard } from '../components/recipes/RecipeCard';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { EmptyState } from '../components/common/EmptyState';

const PAGE_SIZE = 12;

export const SavedRecipesPage = () => {
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['saved-recipes', page],
    queryFn: () => listSavedRecipesRequest(page, PAGE_SIZE),
  });

  const removeMutation = useMutation({
    mutationFn: (savedRecipeId: string) => deleteSavedRecipeRequest(savedRecipeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-recipes'] });
    },
  });

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-semibold text-pantry-900">Your Saved Recipes</h1>
        <p className="mt-2 text-pantry-700">Recipes you&apos;ve favorited for later.</p>
      </div>

      {isLoading && <LoadingSpinner label="Loading your saved recipes…" size="lg" />}

      {isError && (
        <ErrorMessage
          message={getApiErrorMessage(error, 'Could not load your saved recipes.')}
          onRetry={() => refetch()}
        />
      )}

      {!isLoading && !isError && data?.items.length === 0 && (
        <EmptyState
          title="No saved recipes yet"
          message="Browse recipes and tap “Save Recipe” to build your collection."
          action={{ label: 'Browse recipes', onClick: () => {} }}
        />
      )}

      {!isLoading && !isError && data && data.items.length > 0 && (
        <>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {data.items.map((item) => (
              <RecipeCard
                key={item.id}
                id={item.spoonacularId}
                title={item.title}
                image={item.image}
                action={
                  <button
                    type="button"
                    className="btn-secondary w-full"
                    disabled={removeMutation.isPending}
                    onClick={() => removeMutation.mutate(item.id)}
                  >
                    Remove
                  </button>
                }
              />
            ))}
          </div>

          {data.pagination.totalPages > 1 && (
            <nav className="flex items-center justify-center gap-4" aria-label="Pagination">
              <button
                type="button"
                className="btn-secondary"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                ← Previous
              </button>
              <span className="text-sm text-pantry-700">
                Page {data.pagination.page} of {data.pagination.totalPages}
              </span>
              <button
                type="button"
                className="btn-secondary"
                disabled={page >= data.pagination.totalPages}
                onClick={() => setPage((p) => Math.min(data.pagination.totalPages, p + 1))}
              >
                Next →
              </button>
            </nav>
          )}
        </>
      )}

      <Link to="/" className="text-center text-sm font-medium text-clay-600 hover:underline">
        ← Back to search
      </Link>
    </div>
  );
};
