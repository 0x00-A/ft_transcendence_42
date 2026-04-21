const PlayerCardSkeleton = ({ layout = 'vertical' }) => {
  const isVertical = layout === 'vertical';

  return (
    <div className={`rounded-lg border border-gray-300 shadow-sm p-2 animate-pulse ${isVertical ? 'max-w-xs' : 'max-w-xs'}`}>
      <div className={`flex ${isVertical ? 'flex-col' : 'flex-row items-center justify-between'}`}>
        {/* Player info skeleton */}
        <div className={`flex flex-col items-center ${isVertical ? 'mb-1' : 'mr-4'}`}>
          <div className="mb-1 rounded-full bg-gray-300 w-12 h-12"></div>
          <div className="h-4 w-20 bg-gray-300 rounded mt-2"></div>
        </div>

        {/* Scores skeleton */}
        <div className={`
          grid grid-cols-2 gap-1
          ${isVertical ? 'border-t pt-3 w-full' : 'border-l pl-4'}
        `}>
          <div className="text-center">
            <div className="h-3 w-12 bg-gray-300 rounded mx-auto mb-1"></div>
            <div className="h-5 w-16 bg-gray-300 rounded mx-auto"></div>
          </div>
          <div className="text-center">
            <div className="h-3 w-12 bg-gray-300 rounded mx-auto mb-1"></div>
            <div className="h-5 w-16 bg-gray-300 rounded mx-auto"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerCardSkeleton