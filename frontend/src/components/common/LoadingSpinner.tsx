interface LoadingSpinnerProps {
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'h-4 w-4 border-2',
  md: 'h-8 w-8 border-2',
  lg: 'h-12 w-12 border-[3px]',
};

export const LoadingSpinner = ({ label = 'Loading…', size = 'md' }: LoadingSpinnerProps) => {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-10" role="status">
      <span
        className={`${sizeClasses[size]} animate-spin rounded-full border-pantry-700/20 border-t-clay-500`}
      />
      <span className="text-sm text-pantry-700">{label}</span>
    </div>
  );
};
