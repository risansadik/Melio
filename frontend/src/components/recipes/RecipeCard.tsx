import { Link } from 'react-router-dom';

interface RecipeCardProps {
  id: number;
  title: string;
  image?: string | null;
  badge?: string;
  action?: React.ReactNode;
}

export const RecipeCard = ({ id, title, image, badge, action }: RecipeCardProps) => {
  return (
    <div className="group flex flex-col overflow-hidden rounded-card border border-pantry-700/10 bg-white shadow-sm transition-shadow hover:shadow-md">
      <Link to={`/recipes/${id}`} className="block">
        <div className="aspect-[4/3] w-full overflow-hidden bg-pantry-100">
          {image ? (
            <img
              src={image}
              alt={title}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm text-pantry-700/60">
              No image available
            </div>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <Link
            to={`/recipes/${id}`}
            className="line-clamp-2 font-display text-base font-semibold text-pantry-900 hover:text-clay-600"
          >
            {title}
          </Link>
          {badge && (
            <span className="shrink-0 rounded-full bg-pantry-100 px-2.5 py-0.5 text-xs font-medium text-pantry-800">
              {badge}
            </span>
          )}
        </div>

        {action && <div className="mt-auto">{action}</div>}
      </div>
    </div>
  );
};
