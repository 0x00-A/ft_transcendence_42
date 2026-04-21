import { User, Users, MessageSquareText, Gamepad2, LayoutDashboard } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  MENU_ACTIVE_ICON_COLOR,
  MENU_ICON_COLOR,
  MENU_ICON_SIZE,
} from '../../config/constants';
import { MdOutlineLeaderboard } from 'react-icons/md';

const Menus = () => {
  const { t } = useTranslation();

  return [
    {
      id: 0,
      path: '/',
      title: t('sidebar.dashboard'),
      icon: <LayoutDashboard size={MENU_ICON_SIZE} color={MENU_ICON_COLOR} />,
      activeIcon: <LayoutDashboard size={MENU_ICON_SIZE} color={MENU_ACTIVE_ICON_COLOR} />,
    },
    {
      id: 1,
      path: '/play',
      title: t('sidebar.game'),
      icon: <Gamepad2 size={MENU_ICON_SIZE} color={MENU_ICON_COLOR} />,
      activeIcon: <Gamepad2 size={MENU_ICON_SIZE} color={MENU_ACTIVE_ICON_COLOR} />,
    },
    {
      id: 2,
      path: '/chat',
      title: t('sidebar.chat'),
      icon: <MessageSquareText size={MENU_ICON_SIZE} color={MENU_ICON_COLOR} />,
      activeIcon: <MessageSquareText size={MENU_ICON_SIZE} color={MENU_ACTIVE_ICON_COLOR} />,
    },
    {
      id: 3,
      path: '/friends',
      title: t('sidebar.friends'),
      icon: <Users size={MENU_ICON_SIZE} color={MENU_ICON_COLOR} />,
      activeIcon: <Users size={MENU_ICON_SIZE} color={MENU_ACTIVE_ICON_COLOR} />,
    },
    {
      id: 4,
      path: '/leaderboard',
      title: t('sidebar.leaderboard'),
      icon: <MdOutlineLeaderboard size={MENU_ICON_SIZE} color={MENU_ICON_COLOR} />,
      activeIcon: <MdOutlineLeaderboard size={MENU_ICON_SIZE} color={MENU_ACTIVE_ICON_COLOR} />,
    },
    {
      id: 5,
      path: '/profile',
      title: t('sidebar.profile'),
      icon: <User size={MENU_ICON_SIZE} color={MENU_ICON_COLOR} />,
      activeIcon: <User size={MENU_ICON_SIZE} color={MENU_ACTIVE_ICON_COLOR} />,
    },
  ];
};

export default Menus;
