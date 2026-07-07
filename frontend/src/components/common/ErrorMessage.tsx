interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export const ErrorMessage = ({ title = 'Something went wrong', message, onRetry }: ErrorMessageProps) => {
  return (
    <div
      role="alert"
      className="mx-auto flex max-w-md flex-col items-center gap-3 rounded-card border border-clay-500/40 bg-clay-400/10 px-6 py-8 text-center"
    >
      <h3 className="text-lg font-semibold text-pantry-900">{title}</h3>
      <p className="text-sm text-pantry-700">{message}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="btn-secondary mt-1">
          Try again
        </button>
      )}
    </div>
  );
};
