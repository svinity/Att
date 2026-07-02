import { HardHat, Plus } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({
  title = 'Nothing here yet',
  description = 'Add some items or adjust your filters to get started.',
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 bg-white rounded-xl border border-dashed border-gray-200 shadow-sm space-y-4">
      <div className="p-4 bg-gray-50 rounded-full text-gray-400">
        <HardHat className="w-12 h-12 stroke-[1.5]" />
      </div>
      <div className="space-y-1">
        <h3 className="text-base font-semibold text-gray-900">{title}</h3>
        <p className="text-xs text-gray-500 max-w-[240px] mx-auto">{description}</p>
      </div>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="flex items-center gap-2 h-12 px-6 bg-[#1a56db] hover:bg-[#1a56db]/90 text-white font-medium text-sm rounded-lg shadow-sm transition-all duration-200 active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{actionLabel}</span>
        </button>
      )}
    </div>
  );
}
