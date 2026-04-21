import css from './TournamentList.module.css';

import ArcadeLoader from '../../../Game/components/ArcadeLoader/ArcadeLoader';
import ErrorMessage from '../../../Game/components/ErrorMessage/ErrorMessage';
import { Tournament } from '../../../../types/apiTypes';
import NoTournamentIcon from '@/components/Tournament/components/NoTournament/NoTournamnet';
import { formatDate } from '@/utils/helpers';
import { useTranslation } from 'react-i18next';

const TournamentList = ({
  handleJoin,
  // handleView,
  tournaments,
  error,
  isLoading,
}: {
  handleJoin: (tournamentId: number) => void;
  // handleView: () => void;
  tournaments: Tournament[] | undefined;
  error: Error | null;
  isLoading: boolean;
}) => {
  // const [tournaments, setTournaments] = useState([]);
  const { t } = useTranslation();

  // useEffect(() => {
  //     const fetchTournaments = async () => {
  //         try {
  //             const response = await axios.get('/api/matchmaker/tournaments/');
  //             setTournaments(response.data);
  //         } catch (error) {
  //             console.error('Error fetching tournaments:', error);
  //         }
  //     };

  //     fetchTournaments();
  // }, []);

  // function isInTournament(players: number[], player_id: number) {
  //   return players.some((id) => id === player_id);
  // }

  // if (error) return <p>error</p>

  return (
    <div className={css.container}>
      {/* Header Row */}
      <div className={css.header}>
        <div className={`${css.col} ${css.id}`}>{t('game.openTournaments.header.id')}</div>
        <div className={`${css.col} ${css.name}`}>{t('game.openTournaments.header.name')}</div>
        <div className={`${css.col} ${css.creator}`}>{t('game.openTournaments.header.creator')}</div>
        <div className={`${css.col} ${css.date}`}>{t('game.openTournaments.header.creationDate')}</div>
        <div className={`${css.col} ${css.players}`}>{t('game.openTournaments.header.players')}</div>
        <div className={`${css.col} ${css.action}`}>{t('game.openTournaments.header.action')}</div>
      </div>

      {/* List of Tournaments */}

      <div className={css.tournamentList}>
        {!error &&
          tournaments?.map((tournament) => (
            <div key={tournament.id} className={`${css.row}`}>
              <div className={`${css.col} ${css.id}`}>{tournament.id}</div>
              <div className={`${css.col} ${css.name}`}>
                {tournament.name.slice(0, 15)}
                {tournament.name.length >= 15 ? '...' : ''}
              </div>
              <div className={`${css.col} ${css.creator}`}>
                {tournament.creator.username}
              </div>
              <div className={`${css.col} ${css.date}`}>
                {formatDate(tournament.created_at, t('lang'))}
              </div>
              <div className={`${css.col} ${css.players}`}>
                {tournament.participants_count}/{tournament.number_of_players}
              </div>
              <div className={`${css.col} ${css.action}`}>
                  <button onClick={() => handleJoin(tournament.id)}>
                    {t('game.openTournaments.joinButton')}
                  </button>
                {/* {!isInTournament(tournament.players, tournament.user_id) ? (
                ) : (
                  <button onClick={handleView}>View</button>
                )} */}
              </div>
            </div>
          ))}
        {!error && !isLoading && !tournaments?.length && (
          <div className={css.noTournaments}>
            <NoTournamentIcon size={58} />
            <p>{t('game.openTournaments.noTournaments')}</p>
          </div>
        )}
        {error && (
          <div className={css.errorWrapper}>
            <ErrorMessage />
          </div>
        )}
        {!error && isLoading && (
          <div className={css.loaderWrapper}>
            <ArcadeLoader />
          </div>
        )}
      </div>
    </div>
  );
};

export default TournamentList;
