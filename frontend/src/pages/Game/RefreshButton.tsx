import { RefreshCw } from 'lucide-react';

const RefreshButton = ({ onClick, isLoading = false }: {onClick: () => void, isLoading?: boolean}) => {
  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className={`p-2 rounded-full hover:scale-125 disabled:opacity-50 ${isLoading ? 'animate-spin' : ''}`}
      aria-label="Refresh data"
    >
      <RefreshCw className="w-5 h-5" />
    </button>
  );
};

export default RefreshButton;