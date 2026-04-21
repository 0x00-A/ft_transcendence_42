export interface Post {
  id: number;
  title: string;
  body: string;
  userId: number;
}

export interface NewPostData {
  title: string;
  body: string;
  userId: number;
}

interface PerformanceDataEntry {
  [day: string]: number; // Each day (e.g., "Mon") maps to a duration
}


export interface Badge {
  name: string;
  icon: string;
  level_required: number;
  xp_reward: number;
}

export interface Stats {
  games_played: number;
  wins: number;
  losses: number;
  highest_score: number;
  best_rank: number;
  win_streak: number;
  performanceData: PerformanceDataEntry[];
}

export interface Profile {
  user: number;
  avatar: string;
  age: number | null;
  level: number | null;
  score: number | null;
  rank: number | null;
  badge: Badge;
  played_games: number;
  wins: number;
  losses: number;
  win_rate: number;
  lose_rate: number;
  stats: Stats;
  is_online: boolean;
}

export interface User {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  is_password_set: boolean;
  is2fa_active: boolean;
  profile: Profile;
  friend_request_status?: "accepted" | "pending" | "Add Friend" | "cancel";
}

interface Match {
    match_id: number;
    player1: string | null;
    player2: string | null;
    p1_score: number;
    p2_score: number;
    status: string;
    winner: string | null;
    player1_ready: boolean;
    player2_ready: boolean;
}

interface Rounds {
    "1": Match[];
    "2": Match[];
    "3"?: Match[];
}

export interface TournamentState {
    tournament_id: number;
    name: string;
    status: string;
    created_at: string; // formatted date string
    players: string[];
    winner: string | null;
    rounds: Rounds;
}
export interface Tournament {
  id: number;
  name: string;
  creator: User;
  created_at: Date; // Use `Date` if you plan to parse it into a Date object
  participants_count: number;
  number_of_players: number;
  user_id: number;
  players: number[];
  status: string;
  winner: User;
  state: TournamentState;
}

export interface MessageProps {
  id: number;
  conversation: number;
  sender: number;
  receiver: number;
  content: string;
  timestamp: string;
  seen?: boolean;
}


export interface conversationProps {
  id: number;
  last_seen: string;
  user_id: number;
  avatar: string;
  name: string;
  lastMessage: string;
  time: string;
  unreadCount?: number;
  status: boolean;
  block_status: string,
  block_status_display: string,
}


export interface EditProfileFormData {
    avatar: File | null;
    username: string;
    first_name: string;
    last_name: string;
    password: string;
}

export interface LastGames {
  id: number;
  opponent_avatar: string;
  opponent_username: string;
  start_time: string;
  result: string;
  my_score: number;
  opponent_score: number;
  xp_gained: number;
  game_duration: number;
}

interface FriendProfile {
    avatar: string;
    is_online: boolean;
    level: number;
}

export interface Friends {
  id: number;
  username: string;
  profile: FriendProfile;
}

export interface MutualFriend {
  mutual_friends: Friends[];
  mutual_friends_count: number;
}

////////////////////////
// Mahdi's interfaces //
////////////////////////

export interface SignupFormData {
  username: string;
  email: string;
  password: string;
  password2: string;
}

export interface LoginFormData {
  username: string;
  password: string;
}

export interface ResetPasswordForm {
  token: string;
  new_password: string;
  confirm_password: string;
}

export interface ChangePasswordForm {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export interface SetPasswordForm {
  password: string;
  password2: string;
}

export interface UsernameFormData {
  username: string;
}

export interface Achievement {
    name: string;
    description: string;
    image: string;
    condition_name: string;
    name_trans: string;
    condition: {
        [key: string]: number;
    };
    progress: number;
    reward_points: number;
}

export interface UserAchievements {
    achievement: Achievement;
    progress: {
        [Key: string]: number;
    };
    is_unlocked: boolean;
    unlocked_at: string;
}

export interface LeaderBoard {
    rank: number;
    avatar: string;
    username: string;
    played_games: number;
    win_rate: number;
    lose_rate: number;
    score: number;
}

export interface OtherProfile {
  avatar: string;
  level: number;
  played_games: number;
  wins: number;
  loses: number;
  badge: Badge;
  score: number;
  rank: number;
}

export interface OtherUser {
  username: string;
  first_name: string;
  last_name: string;
  profile: OtherProfile;

  friend_status: string;
  is_password_set: boolean;
  is2fa_active: boolean;
  friend_request_status?: "accepted" | "pending" | "Add Friend" | "cancel";
}

export interface PasswordForm {
  password: string;
}