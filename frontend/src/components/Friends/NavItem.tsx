import React from 'react';
import css from './SideNav.module.css';

interface NavItemProps {
  icon: JSX.Element;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({
  icon,
  label,
  isActive,
  onClick,
}) => {
  return (
    <li
      className={`${css.navItem} ${isActive ? css.active : ''}`}
      onClick={onClick}
    >
      <span className={css.icon}>{icon}</span>
      {label}
    </li>
  );
};

export default NavItem;
