import { useCallback, useMemo, useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { searchRecipesRequest } from '../api/recipes.api';
import { getApiErrorMessage } from '../api/client';
import { SearchFilters as SearchFiltersType } from '../types';
import { SearchFilters } from '../components/recipes/SearchFilters';
import { RecipeCard } from '../components/recipes/RecipeCard';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { EmptyState } from '../components/common/EmptyState';
import { InfiniteScrollSentinel } from '../components/common/InfiniteScrollSentinal';

const PAGE_SIZE = 12;

export const HomePage = () => {
  const [filters, setFilters] = useState<SearchFiltersType>({});

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    isError,
    error,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['recipes', 'search', filters],
    queryFn: ({ pageParam = 0 }) => searchRecipesRequest(filters, pageParam, PAGE_SIZE),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      const nextOffset = lastPage.offset + lastPage.number;
      return nextOffset < lastPage.totalResults ? nextOffset : undefined;
    },
  });

  const recipes = useMemo(() => data?.pages.flatMap((page) => page.results) ?? [], [data]);
  const totalResults = data?.pages[0]?.totalResults ?? 0;

  const handleSearch = useCallback((nextFilters: SearchFiltersType) => {
    setFilters(nextFilters);
  }, []);

  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-semibold text-pantry-900 sm:text-4xl">
          Find something good to cook
        </h1>
        <p className="mt-2 text-pantry-700">
          Search thousands of recipes by ingredient, cuisine, or diet.
        </p>
      </div>

      <SearchFilters initialFilters={filters} onSearch={handleSearch} isSearching={isLoading} />

      {isLoading && <LoadingSpinner label="Finding recipes…" size="lg" />}

      {isError && (
        <ErrorMessage message={getApiErrorMessage(error, 'Could not load recipes.')} onRetry={() => refetch()} />
      )}

      {!isLoading && !isError && recipes.length === 0 && (
        <EmptyState
          title="No recipes found"
          message="Try a different search term or loosen your filters."
        />
      )}

      {!isLoading && !isError && recipes.length > 0 && (
        <>
          <p className="text-sm text-pantry-700">
            Showing {recipes.length} of {totalResults} results
          </p>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {recipes.map((recipe) => (
              <RecipeCard key={recipe.id} id={recipe.id} title={recipe.title} image={recipe.image} />
            ))}
          </div>

          {isFetchingNextPage && <LoadingSpinner label="Loading more recipes…" />}
          <InfiniteScrollSentinel onIntersect={loadMore} enabled={Boolean(hasNextPage)} />
        </>
      )}
    </div>
  );
};
