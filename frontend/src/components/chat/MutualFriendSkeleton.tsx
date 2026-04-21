import React from "react";

const MutualFriendSkeleton: React.FC = () => {
    return (
    <div className="w-full flex items-center justify-between p-4   animate-pulse">
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-gray-700"></div>
        </div>

        <div className="flex flex-col gap-4 mb-2">
          <div className="h-6 w-40 bg-gray-700 rounded-md"></div>
        </div>
      </div>
    </div>
  );
};

export default MutualFriendSkeleton;