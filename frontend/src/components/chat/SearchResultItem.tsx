import React from 'react';
import css from './SearchResultItem.module.css';

interface SearchResultItemProps {
  avatar: string;
  name: string;
  onClick: () => void;
}

const SearchResultItem: React.FC<SearchResultItemProps> = ({
  avatar,
  name,
  onClick,
}) => {

  // console.log(">>>>>>>>>>>>search friends>>>>>>");
  return (
    <div className={css.searchResultItem} onClick={onClick}>
      <img src={avatar} alt={name} className={css.avatar} />
      <span className={css.name}>{name}</span>
    </div>
  );
};

export default SearchResultItem;
