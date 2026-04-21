import React from "react";

const SearchFriendsSkeleton: React.FC = () => {
  return (
    <div className="w-full flex items-center p-4 rounded-lg mb-4 animate-pulse">
      <div className="relative">
        <div className="w-20 h-20 rounded-full bg-gray-700"></div>
      </div>

      <div className="flex flex-col flex-1 ml-4">
        <div className="flex justify-between items-center">
          <div className="h-6 w-40 bg-gray-700 rounded-md"></div>
        </div>
      </div>
    </div>
  );
};

export default SearchFriendsSkeleton;
