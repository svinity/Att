import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  message?: string;
}

export default function LoadingSpinner({ message = 'Updating Prefabshala...' }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-3 bg-white/80 rounded-xl shadow-xs">
      <Loader2 className="w-10 h-10 text-[#1a56db] animate-spin" />
      <span className="text-sm font-medium text-gray-500 animate-pulse">{message}</span>
    </div>
  );
}
