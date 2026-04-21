import React from "react";

const ConversationSkeleton: React.FC = () => {
  return (
    <div className="w-full flex items-center p-4 rounded-lg bg-gray-800 mb-4 animate-pulse">
      <div className="relative">
        <div className="w-24 h-24 rounded-full bg-gray-700"></div>
      </div>

      <div className="flex flex-col flex-1 ml-4">
        <div className="flex justify-between items-center mb-2">
          <div className="h-6 w-24 bg-gray-700 rounded-md"></div>
          <div className="h-6 w-14 bg-gray-700 rounded-md"></div>
        </div>

        <div className="flex justify-between items-center">
          <div className="h-6 w-40 bg-gray-700 rounded-md"></div>
          <div className="h-8 w-8 bg-gray-700 rounded-full"></div>
        </div>
      </div>
    </div>
  );

};

export default ConversationSkeleton;
