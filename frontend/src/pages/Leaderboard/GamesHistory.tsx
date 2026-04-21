// Styles
import css from './GamesHistory.module.css'

import { useNavigate } from 'react-router-dom';
import { IoGameControllerOutline } from "react-icons/io5";
import { useGetData } from '@/api/apiHooks';

// Api
import { LastGames } from '@/types/apiTypes';
import { API_GET_PLAYED_GAMES_URL } from '@/api/apiConfig';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { formatDate } from '@/utils/helpers';


const GamesHistory = () => {

  const navigate = useNavigate();
  const { t } = useTranslation();
  // const [isBtnActive, setBtnActive] = useState(true);
  const { data: playedGames, isLoading, error } = useGetData<LastGames[]>(API_GET_PLAYED_GAMES_URL);

  const gameHistoryFields = useMemo(
    () => [
      t('Profile.gameHistory.fields.dateTime'),
      t('Profile.gameHistory.fields.name'),
      t('Profile.gameHistory.fields.result'),
      t('Profile.gameHistory.fields.score'),
      t('Profile.gameHistory.fields.duration'),
      t('Profile.gameHistory.fields.rematch')
    ],
    [t]
  );
  const getResultTranslation = (result: string) => {
    switch (result) {
      case 'Win':
        return t('Profile.gameHistory.results.win');
      case 'Lose':
        return t('Profile.gameHistory.results.lose');
      default:
        return result;
    }
  };

  const formatGameDuration = (rawTime: number) => {
    if (rawTime < 1) {
        return `${rawTime.toFixed(2)}s`;
    } else {
        return `${rawTime.toFixed(2)}m`;
    }
}


  return (
    <div className={css.gameHistoryContainer}>
        {/* <div className={css.gameHistoryHeader}>
          <div className={css.gameHistTitle}>
            <History size={30} color='#f8c25c' />
            <h3>{t('Profile.gameHistory.title')}</h3>
          </div>
          <div className={css.buttonsGrp}>
            <button onClick={() => setBtnActive(true)}
                className={`${css.button} ${isBtnActive  ? css.buttonActive : ''}`}>
                {t('Profile.gameHistory.buttons.game')}
            </button>
            <button onClick={() => setBtnActive(false)}
                className={`${css.button} ${!isBtnActive ? css.buttonActive : ''}`}>
                {t('Profile.gameHistory.buttons.tournament')}
            </button>
          </div>
        </div> */}
        {error && <div className="text-red-500">{error.message}</div>}
        { isLoading ?
        <div className="flex w-[100%] h-[80px] items-center justify-between gap-4 p-5 bg-gray-800 rounded-md animate-pulse">
          <div className="flex flex-col w-1/6">
            <div className="h-4 w-20 bg-gray-600 rounded-md mb-2"></div>
            <div className="h-4 w-12 bg-gray-600 rounded-md"></div>
          </div>
          <div className="flex items-center gap-2 w-1/4">
            <div className="h-8 w-8 bg-gray-600 rounded-full"></div>
            <div className="h-4 w-24 bg-gray-600 rounded-md"></div>
          </div>
          <div className="w-1/6">
            <div className="h-4 w-12 bg-gray-600 rounded-md"></div>
          </div>
          <div className="w-1/6">
            <div className="h-4 w-10 bg-gray-600 rounded-md"></div>
          </div>
          <div className="w-1/6">
            <div className="h-4 w-16 bg-gray-600 rounded-md"></div>
          </div>
          <div className="w-1/6">
            <div className="h-8 w-20 bg-gray-600 rounded-md"></div>
          </div>
        </div> :
          <div className={css.gamesList}>
            <div className={css.tableHeader}>
              { gameHistoryFields.map((field, index) => (
                <span key={index} className={css.headerField}>{field}</span>
              ))}
            </div>
            { playedGames && playedGames.length == 0 && <div className={css.noGames}>
                <span className={css.noHistoryTitle}>{t('Profile.gameHistory.noGames.message')}</span>
                <button className={css.playBtn} onClick={() => navigate('/play')}>
                    <IoGameControllerOutline className={css.playIcon}/>
                    <span>{t('Profile.gameHistory.noGames.playNow')}</span>
                </button>
            </div>}
            { playedGames && playedGames.length > 0 && playedGames?.map((game: LastGames) => (
                <div key={game.id} className={css.tableRow}>
                    <div className={css.dateTimeGame}>
                      <span className={css.historyField}>{formatDate(new Date(game?.start_time), t('lang'))}</span>
                    </div>
                    <div className={css.player}>
                        <img src={game.opponent_avatar} alt={game?.opponent_username} className={css.avatar} />
                        <span className={css.name}>{game.opponent_username}</span>
                    </div>
                    <span className={`${game.result === 'Win' ? css.win : css.lose}`}>{getResultTranslation(game.result)}</span>
                    <span className={css.historyField}>{game.my_score} - {game.opponent_score}</span>
                    {/* <span className={css.historyField}>One to One</span> */}
                    <span className={css.historyField}>{formatGameDuration(game.game_duration)}</span>
                    <button className={css.inviteBtn}>{t('Profile.gameHistory.invite')}</button>
                </div>
            ))}
          </div>}
    </div>
  )
}

export default GamesHistory
