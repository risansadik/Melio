interface EmptyStateProps {
  title: string;
  message: string;
  action?: { label: string; onClick: () => void };
}

export const EmptyState = ({ title, message, action }: EmptyStateProps) => {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-3 py-16 text-center">
      <h3 className="text-xl font-semibold text-pantry-900">{title}</h3>
      <p className="text-sm text-pantry-700">{message}</p>
      {action && (
        <button type="button" onClick={action.onClick} className="btn-primary mt-2">
          {action.label}
        </button>
      )}
    </div>
  );
};
