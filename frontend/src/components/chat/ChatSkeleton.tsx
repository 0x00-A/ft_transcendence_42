import React from "react";

const ChatSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col gap-4 p-4">
      {[...Array(12)].map((_, index) => (
        <div
          key={index}
          className={`flex ${index % 2 === 0 ? "justify-start" : "justify-end"}`}
        >
          <div
            className={`flex flex-col items-${index % 2 === 0 ? "start" : "end"} gap-2`}
          >
            <div
              className={`flex ${
                index % 2 === 0 ? "flex-row" : "flex-row-reverse"
              } gap-2`}
            >
              {index % 2 === 0 && <div className="w-16 h-16 rounded-full bg-gray-700 animate-pulse"></div>}
              <div className="flex flex-col gap-2">
                {index % 2 === 0 ? <div className="flex gap-2">
                    <div className="w-28 h-6 bg-gray-700 rounded-lg animate-pulse"></div>
                    <div className="w-20 h-6 bg-gray-700 rounded-lg animate-pulse"></div>
                </div> : <div className="flex gap-2">
                    <div className="w-20 h-6 bg-gray-700 rounded-lg animate-pulse"></div>
                    <div className="w-20 h-6 bg-gray-700 rounded-lg animate-pulse"></div>
                </div> }
                {index % 2 === 0 ? <div className="flex gap-2">
                    <div className="w-36 h-10 bg-gray-700 rounded-lg animate-pulse"></div>
                </div> : <div className="flex justify-end gap-2">
                    <div className="w-36 h-10 bg-gray-700 rounded-lg animate-pulse"></div>
                </div>}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ChatSkeleton;
