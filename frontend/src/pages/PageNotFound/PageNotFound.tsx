import { Link as LinkIcon } from "lucide-react";
import { Link } from 'react-router-dom';

const PageNotFound = () => {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center p-4">
      <h1 className="text-8xl font-bold text-gray-200 mb-6">404</h1>

      <h2 className="text-4xl font-bold mb-6">
        Omae wa mou shindeiru!
      </h2>

      <p className="text-gray-500 mb-8 max-w-md">
        Unfortunately, this is only a 404 page. You may have mistyped the address, or the page has been moved to another URL.
      </p>
      <Link className="inline-flex items-center gap-2 text-blue-500 hover:text-blue-600 transition-colors" to={'/'}>
        <LinkIcon size={20} />
        Take me back to home page
      </Link>
    </div>
  );
};

export default PageNotFound;
