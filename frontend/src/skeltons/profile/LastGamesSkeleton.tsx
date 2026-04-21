

const LastGamesSkeleton = () => {
  return (
    <div className="flex flex-col gap-3 animate-pulse">
        <div className="flex items-center gap-4 p-4 bg-gray-800 rounded-md relative">
            <div className="w-12 h-12 rounded-full bg-gray-700"></div>
            <div className="flex flex-col flex-grow">
                <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-700 rounded w-1/2"></div>
            </div>
            <div className="flex flex-grow justify-center">
                <div className="h-6 w-8 bg-gray-700 rounded"></div>
                <span className="text-white mx-2">:</span>
                <div className="h-6 w-8 bg-gray-700 rounded"></div>
            </div>
            <div className="flex items-center gap-2 bg-gray-700 p-2 rounded-md">
                <div className="h-4 w-6 bg-gray-600 rounded"></div>
                <div className="h-4 w-4 bg-gray-600 rounded"></div>
            </div>
        </div>
    </div>
  )
}

export default LastGamesSkeleton
