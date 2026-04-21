import { useState, useEffect } from 'react';
import { Crosshair, Zap, Gamepad2, RadarIcon } from 'lucide-react';
import { useGetData } from '@/api/apiHooks';
import { useTranslation } from 'react-i18next';


const MatchmakingScreen = ({onClick} : {onClick: () => void;}) => {
  const [matchmakingProgress, setMatchmakingProgress] = useState(0);
  const [connectionQuality, setConnectionQuality] = useState(4);
  const { t } = useTranslation();

  useEffect(() => {
    // Simulate matchmaking progress
    const progressInterval = setInterval(() => {
      setMatchmakingProgress(prev =>
        prev >= 100 ? 0 : prev + Math.floor(Math.random() * 15)
      );

      // Randomly fluctuate connection quality
      setConnectionQuality(Math.floor(Math.random() * 5) + 1);
    }, 1000);

    return () => clearInterval(progressInterval);
  }, []);

  const renderConnectionBars = () => {
    return Array.from({ length: 5 }, (_, index) => (
      <div
        key={index}
        className={`h-2 w-4 rounded-sm transition-colors ${
          index < connectionQuality
            ? 'bg-green-500'
            : 'bg-gray-700'
        }`}
      />
    ));
  };


  const {data} = useGetData<{'online_players': number}>('users/online');


  return (
    <div className="m-auto text-white flex items-center justify-center p-4 overflow-hidden w-[350px]">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/30 to-purple-900/30 opacity-50 pointer-events-none" />

      <div className="relative z-10 w-full bg-gray-900/70 backdrop-blur-lg rounded-2xl border border-white/10 p-8 shadow-2xl">
        <div className="absolute top-4 right-4 flex space-x-2">
          {renderConnectionBars()}
        </div>

        <div className="flex justify-center mb-6">
          <div className="relative">
            <RadarIcon
              className="text-red-500 animate-ping absolute inset-0 opacity-50"
              size={120}
            />
            <Crosshair
              className="text-red-400 relative z-10"
              size={120}
            />
          </div>
        </div>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-red-400 mb-2">
            {t('game.remoteGame.matchmakingScreen.matchmakingInProgress')}
          </h2>
          <p className="text-gray-400">{t('game.remoteGame.matchmakingScreen.searchingForOpponent')}</p>
        </div>

        <div className="w-full bg-gray-800 rounded-full h-2.5 mb-4">
          <div
            className="bg-red-500 h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(matchmakingProgress, 100)}%` }}
          />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-800/50 rounded-lg p-4 text-center">
            <Gamepad2 className="mx-auto mb-2 text-red-400" size={32} />
            <span className="text-xs text-gray-400">{t('game.remoteGame.matchmakingScreen.playersOnline')}</span>
            <div className="font-bold text-lg text-red-400">{data?.online_players || 0}</div>
          </div>

          <div className="bg-gray-800/50 rounded-lg p-4 text-center">
            <Zap className="mx-auto mb-2 text-yellow-400" size={32} />
            <span className="text-xs text-gray-400">{t('game.remoteGame.matchmakingScreen.skillMatch')}</span>
            <div className="font-bold text-lg text-yellow-300">{t('game.remoteGame.matchmakingScreen.highSkillMatch')}</div>
          </div>
        </div>

        <button
          onClick={onClick}
          className="w-full py-3 bg-red-600 hover:bg-red-700 rounded-lg
                     transition-colors text-white flex items-center justify-center space-x-2"
        >
          <span>{t('game.remoteGame.matchmakingScreen.cancelMatchmaking')}</span>
        </button>
      </div>

      {/* Background Effect */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(8,145,178,0.2) 0%, transparent 70%)',
          backgroundPosition: 'center',
          backgroundSize: '200% 200%',
          animation: 'pulse 5s infinite alternate'
        }}
      />
    </div>
  );
};

export default MatchmakingScreen;