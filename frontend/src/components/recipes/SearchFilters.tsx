import { FormEvent, useState } from 'react';
import { SearchFilters as SearchFiltersType } from '../../types';

interface SearchFiltersProps {
  initialFilters: SearchFiltersType;
  onSearch: (filters: SearchFiltersType) => void;
  isSearching: boolean;
}

const DIET_OPTIONS = [
  { value: '', label: 'Any diet' },
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'pescetarian', label: 'Pescetarian' },
  { value: 'gluten free', label: 'Gluten Free' },
  { value: 'grain free', label: 'Grain Free' },
  { value: 'dairy free', label: 'Dairy Free' },
  { value: 'ketogenic', label: 'Ketogenic' },
  { value: 'paleo', label: 'Paleo' },
  { value: 'whole 30', label: 'Whole30' },
];

const SORT_OPTIONS = [
  { value: '', label: 'Most relevant' },
  { value: 'popularity', label: 'Most popular' },
  { value: 'calories', label: 'Calories' },
  { value: 'random', label: 'Random' },
];

export const SearchFilters = ({ initialFilters, onSearch, isSearching }: SearchFiltersProps) => {
  const [filters, setFilters] = useState<SearchFiltersType>(initialFilters);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSearch(filters);
  };

  const updateField = (field: keyof SearchFiltersType, value: string) => {
    setFilters((prev) => ({ ...prev, [field]: value || undefined }));
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          value={filters.query ?? ''}
          onChange={(e) => updateField('query', e.target.value)}
          placeholder="Search recipes, e.g. “garlic pasta”"
          aria-label="Search recipes"
          className="input-field flex-1"
        />
        <button type="submit" className="btn-primary whitespace-nowrap" disabled={isSearching}>
          {isSearching ? 'Searching…' : 'Search'}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <input
          type="text"
          value={filters.cuisine ?? ''}
          onChange={(e) => updateField('cuisine', e.target.value)}
          placeholder="Cuisine (e.g. italian)"
          aria-label="Cuisine"
          className="input-field"
        />
        <input
          type="text"
          value={filters.type ?? ''}
          onChange={(e) => updateField('type', e.target.value)}
          placeholder="Meal type (e.g. dessert)"
          aria-label="Meal type"
          className="input-field"
        />
        <select
          value={filters.diet ?? ''}
          onChange={(e) => updateField('diet', e.target.value)}
          aria-label="Diet"
          className="input-field"
        >
          {DIET_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <select
          value={filters.sort ?? ''}
          onChange={(e) => updateField('sort', e.target.value)}
          aria-label="Sort by"
          className="input-field"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </form>
  );
};
