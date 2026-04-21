const NotificationSkeleton = () => (
    <div className="animate-pulse">
      {[1, 2, 3, 4].map((index) => (
        <div key={index} className="px-4 py-3 border-b border-gray-600 last:border-b-0">
          <div className="flex justify-between items-start gap-4">
            <div className="h-6 bg-gray-600 rounded w-3/4"></div>
            <div className="h-3 bg-gray-600 rounded w-16"></div>
          </div>
          <div className="mt-2 space-y-2">
            <div className="h-4 bg-gray-600 rounded w-full"></div>
            <div className="h-4 bg-gray-600 rounded w-2/3"></div>
          </div>
        </div>
      ))}
    </div>
  );
  
  export default NotificationSkeleton;