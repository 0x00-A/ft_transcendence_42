const SkeletonBox = ({
  width = '',
  height = '',
  title = true,
  rows = 3,
  header = true,
  className = '',
}) => {
  return (
    <div
      className={`bg-slate-800 rounded-xl p-6 ${width} ${height} ${className}`}
    >
      {/* Header with title and action button */}
      {header && (
        <div className="w-60 flex justify-between items-center mb-4">
          <div className="h-6 bg-slate-700 rounded w-32 animate-pulse" />
          <div className="h-4 bg-slate-700 rounded w-24 animate-pulse" />
        </div>
      )}

      {/* Title bar */}
      {title && (
        <div className="h-6 bg-slate-700 rounded w-1/3 animate-pulse mb-4" />
      )}

      {/* Content rows */}
      <div className="space-y-3">
        {[...Array(rows)].map((_, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-slate-700 rounded-full animate-pulse" />
              <div className="h-4 bg-slate-700 rounded w-24 animate-pulse" />
            </div>
            <div className="h-4 bg-slate-700 rounded w-16 animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default SkeletonBox;
