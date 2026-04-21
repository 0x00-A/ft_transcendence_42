import { Swords } from 'lucide-react';
import { useGetData } from '@/api/apiHooks';
import { User } from '@/types/apiTypes';
import { useEffect, useState } from 'react';
import { GameState } from '@/types/types';

const PlayerMatchupBannerSkeleton = () => {
  return (
    <div className="ml-auto mr-auto w-[662px] bg-gray-900 text-white py-4 px-5 flex items-center justify-between border rounded-full border-red-500 animate-pulse">
      {/* Player 1 Section */}
      <div className="flex items-center gap-3 space-x-3">
        <div className="w-16 h-16 rounded-full border-2 border-green-500 bg-gray-700 animate-pulse"></div>
        <div className="flex flex-col">
          <div className="h-6 w-24 bg-gray-700 rounded mb-2"></div>
          <div className="h-4 w-16 bg-gray-700 rounded"></div>
        </div>
      </div>

      {/* VS Section */}
      <div className="flex items-center">
        <Swords className="text-red-500/50" size={24} />
      </div>

      {/* Player 2 Section */}
      <div className="flex items-center gap-3 space-x-3 flex-row-reverse text-right">
        <div className="w-16 h-16 rounded-full border-2 border-red-500 bg-gray-700 animate-pulse"></div>
        <div className="flex flex-col items-end">
          <div className="h-6 w-24 bg-gray-700 rounded mb-2"></div>
          <div className="h-4 w-16 bg-gray-700 rounded"></div>
        </div>
      </div>
    </div>
  );
};

const MatchTimer = ({ gameState }: { gameState: GameState }) => {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (gameState != 'started') return;
    const intervalId = setInterval(() => {
      setSeconds((prevSeconds) => prevSeconds + 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [gameState]);

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return <div className="font-mono text-2xl">{formatTime(seconds)}</div>;
};

const PlayerMatchupBanner = ({
  p1_id,
  p2_id,
  player,
  gameState,
}: {
  p1_id: number;
  p2_id: number;
  player: string;
  gameState: GameState;
}) => {
  // const players = {
  //   player1: {
  //     username: "CyberPaddler87",
  //     rank: "Gold",
  //     avatar: "https://picsum.photos/200"
  //   },
  //   player2: {
  //     username: "QuantumPong",
  //     rank: "Platinum",
  //     avatar: "https://picsum.photos/200"
  //   }
  // };

  const {
    data: player1,
    isLoading: p1_isLoading,
    error: p1_error,
  } = useGetData<User>(`users/${p1_id}`);
  const {
    data: player2,
    isLoading: p2_isLoading,
    error: p2_error,
  } = useGetData<User>(`users/${p2_id}`);

  if (p1_isLoading || p2_isLoading || p1_error || p2_error) {
    return <PlayerMatchupBannerSkeleton />;
  }

  return (
    <div className="ml-auto mr-auto w-[662px] bg-gray-900 text-white py-4 px-5 flex items-center justify-between border rounded-full border-red-500">
      {/* Player 1 Section */}
      <div className="flex items-center gap-3 space-x-3">
        <div className="w-16 h-16 rounded-full border-2 border-green-500 overflow-hidden">
          <img
            src={
              player === 'player1'
                ? player1?.profile.avatar
                : player2?.profile.avatar
            }
            alt={player === 'player1' ? player1?.username : player2?.username}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex flex-col">
          <span className="font-semibold text-lg">
            {player === 'player1' ? player1?.username : player2?.username}
          </span>
          <div className="flex items-center space-x-1 mt-0.5">
            {/* <Trophy className="text-yellow-400" size={14} /> */}
            {/* <Shield size={16} className="text-green-500" /> */}
            <img
              src={
                player === 'player1'
                  ? player1?.profile.badge.icon
                  : player2?.profile.badge.icon
              }
              className="h-8 w-8"
              alt=""
            />
            <span className="text-base text-gray-400">
              {player === 'player1'
                ? player1?.profile.badge.name
                : player2?.profile.badge.name}
            </span>
          </div>
        </div>
      </div>

      {/* VS Section */}
      <div className="flex items-center justify-center flex-col gap-1">
        <Swords className="text-red-500/50 animate-pulse" size={24} />
        <MatchTimer gameState={gameState} />
      </div>

      {/* Player 2 Section */}
      <div className="flex items-center gap-3 space-x-3 flex-row-reverse text-right">
        <div className="w-16 h-16 rounded-full border-2 border-red-500 overflow-hidden">
          <img
            src={
              player === 'player2'
                ? player1?.profile.avatar
                : player2?.profile.avatar
            }
            alt={player === 'player2' ? player1?.username : player2?.username}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex flex-col items-end">
          <span className="font-semibold text-lg">
            {player === 'player2' ? player1?.username : player2?.username}
          </span>
          <div className="flex items-center space-x-1 mt-0.5">
            <span className="text-base text-gray-400">
              {player === 'player2'
                ? player1?.profile.badge.name
                : player2?.profile.badge.name}
            </span>
            {/* <Trophy className="text-yellow-400" size={14} /> */}
            {/* <Shield size={16} className="text-red-500" /> */}
            <img
              src={
                player === 'player1'
                  ? player1?.profile.badge.icon
                  : player2?.profile.badge.icon
              }
              className="h-8 w-8"
              alt=""
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerMatchupBanner;
