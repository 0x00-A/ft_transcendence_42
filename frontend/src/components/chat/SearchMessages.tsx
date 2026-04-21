import { useState, useEffect, useRef } from 'react';
import css from './SearchMessages.module.css';
import { FiSearch } from 'react-icons/fi';
import { HiArrowLeft } from 'react-icons/hi';

interface SearchMessagesProps {
  onSelectedSearch: (selectedSearch: boolean) => void;
  query: string;
  setQuery: React.Dispatch<React.SetStateAction<string>>;
}

const SearchMessages: React.FC<SearchMessagesProps> = ({
  onSelectedSearch,
  query,
  setQuery,
}) => {
  const [showIcon, setShowIcon] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleInputClick = () => {
    setShowIcon(true);
    onSelectedSearch(true);
  };

  const handleIconClick = () => {
    onSelectedSearch(false);
    setShowIcon(false);
    setQuery('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    // onSearch(value);
  };

  const handleClickOutside = (e: MouseEvent) => {
    if (
      containerRef.current &&
      !containerRef.current.contains(e.target as Node)
    ) {
      setShowIcon(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  return (
    <div ref={containerRef} className={css.searchContainer}>
      <div className={`${css.searchBar} ${showIcon ? css.showIcon : ''}`}>
        {showIcon && (
          <HiArrowLeft className={css.arrowIcon} onClick={handleIconClick} />
        )}
        <FiSearch
          className={`${css.searchIcon} ${showIcon ? css.searchInSide : ''}`}
        />
        <input
          type="text"
          placeholder="Search Friends"
          value={query}
          onChange={handleInputChange}
          onClick={handleInputClick}
          className={`${css.searchInput} ${showIcon ? css.shrinkWidth : ''}`}
        />
      </div>
    </div>
  );
};

export default SearchMessages;
