import { NavLink, useLocation } from 'react-router-dom';
import css from './SidebarMenu.module.css';
import Menus from '../../SidebarData';
import { useEffect, useState } from 'react';
import SideBarTooltip from '../../SideBarTooltip';


export const SidebarMenu = ({ open }: { open: boolean | null }) => {
  const location = useLocation();
  const [activeLink, setActiveLink] = useState(location.pathname);
  const MenusList = Menus();

  useEffect(() => {
    setActiveLink(location.pathname);
  }, [location]);

  return (
    <ul className={css.menu}>
      {MenusList.map((item) => (
        <li
          key={item.id}
          onClick={() => setActiveLink(item.path)}
        >
          <NavLink
            className={`${activeLink === item.path ? css.activeTab : ''}`}
            to={item.path}
            data-tooltip-id={`${open ? '' : item.title}`}
          >
            {activeLink === item.path ? item.activeIcon : item.icon}
            <p>{item.title}</p>
            {!open && <SideBarTooltip id={item.title} content={item.title}/>}
          </NavLink>
        </li>
      ))}
    </ul>
  );
};