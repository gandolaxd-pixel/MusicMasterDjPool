interface EmptyStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="py-16 text-center border border-dashed border-white/10 rounded-2xl bg-white/[0.02]">
      <p className="text-gray-300 font-black uppercase tracking-[0.2em] text-xs">{title}</p>
      {description && (
        <p className="mt-3 text-xs text-gray-500">{description}</p>
      )}
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-6 px-4 py-2 rounded-full border border-white/10 text-[10px] font-black uppercase tracking-widest text-gray-300 hover:text-white hover:border-white/30 transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
