import { useGetData } from '@/api/apiHooks';
import { User } from '@/types/apiTypes';
import PlayerCardSkeleton from './PlayerCardSkeleton';
import { useTranslation } from 'react-i18next';



const PlayerCard = ({
  layout = 'vertical',
  score,
  against,
  p_id,
  countEnded,
}: {
  layout?: 'vertical' | 'horizontal';
  score: number;
  against: number;
  p_id: number | null;
  countEnded: boolean;
}) => {
  const { t } = useTranslation();
  // const player = {
  //   username: "GamerPro123",
  //   score: 1250,
  //   against: 980,
  //   avatarUrl: "https://picsum.photos/200"
  // };

  // Determine if we should use column or row layout
  const isVertical = layout === 'vertical';

  // if (!p_id)
  //   return <PlayerCardSkeleton layout={layout} />;

  const { data: player, isLoading, error } = useGetData<User>(`users/${p_id}`);

  if (isLoading || error || !countEnded) {
    return <PlayerCardSkeleton layout={layout} />;
  }

  return (
    <div
      className={` border border-white-500 shadow-sm p-2 ${isVertical ? 'max-w-xs' : 'max-w-xs'}`}
    >
      {/* Container that changes between column and row */}
      <div
        className={`flex ${isVertical ? 'flex-col' : 'flex-row items-center justify-between'}`}
      >
        {/* Player info section */}
        <div
          className={`flex flex-col items-center ${isVertical ? 'mb-1' : 'mr-4'}`}
        >
          <div className="mb-1 rounded-full border-2 border-green-300">
            <img
              src={player?.profile.avatar}
              alt="Player avatar"
              className="w-12 h-12 rounded-full"
            />
          </div>
          <h3 className="text-base font-medium text-white">
            {player?.username}
          </h3>
        </div>

        {/* Scores section */}
        <div
          className={`
          grid grid-cols-2 gap-1
          ${isVertical ? 'border-t pt-3 w-full' : 'border-l pl-4'}
        `}
        >
          <div className="text-center">
            <p className="text-sm text-gray-500">
              {t('game.multipleGame.PlayerCard.Score')}
            </p>
            <p className="text-lg font-semibold text-green-300">{score}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500">
              {t('game.multipleGame.PlayerCard.Against')}
            </p>
            <p className="text-lg font-semibold text-red-300">{against}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerCard;