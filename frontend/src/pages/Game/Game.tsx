import styles from './Game.module.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Trophy, Globe, ArrowRight, Gamepad2 } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import RemoteGame from '../../components/Game/RemoteGame/RemoteGame';
import getWebSocketUrl from '../../utils/getWebSocketUrl';
import TournamentList from '../../components/Tournament/components/TournamentList/TournamentList';
import { useGetData } from '../../api/apiHooks';
import {
  TournamentState,
  Tournament as TournmentType,
} from '../../types/apiTypes';
import RemoteTournament from '../../components/Tournament/RemoteTournament/RemoteTournament';
import CreateTournamentModal from '../../components/Tournament/components/CreateTournamentModal/CreateTournamentModal';
import 'react-toastify/dist/ReactToastify.css';
import LocalGame from '../../components/Game/LocalGame/LocalGame';
import ArcadeLoader from '../../components/Game/components/ArcadeLoader/ArcadeLoader';
import Tournament from '../../components/Tournament/Tournament/Tournament';
import { toast } from 'react-toastify';
import ErrorMessage from '@/components/Game/components/ErrorMessage/ErrorMessage';
import NoTournamentIcon from '../../components/Tournament/components/NoTournament/NoTournamnet';
import { useUser } from '@/contexts/UserContext';
import { useGameInvite } from '@/contexts/GameInviteContext';
import { formatDate } from '@/utils/helpers';
// import MatchmakingScreen from '@/components/Game/components/MatchmakingScreen/MatchmakingScreen';
import MultipleGame from '@/components/Game/MultipleGame/MultipleGame';
import { useTranslation } from 'react-i18next';
import RefreshButton from './RefreshButton';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';


const Game = () => {
  const { t } = useTranslation();
  const [hoveredOption, setHoveredOption] = useState<number | null>(null);
  const [selectedMode, setSelectedMode] = useState<number | null>(null);
  const [gameState, setGameState] = useState<
    'startGame' | 'inqueue' | 'startMultiGame' | null
  >(null);
  const [gameAdrress, setGameAdrress] = useState<string | null>(null);
  const [player1_id, setPlayer1_id] = useState<number | null>(null);
  const [player2_id, setPlayer2_id] = useState<number | null>(null);
  const [matchAdrress, setMatchAdrress] = useState(null);
  const ws = useRef<WebSocket | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const tournamentIdRef = useRef<number | null>(null);
  const [matchStarted, setMatchStarted] = useState(false);
  const [tournamentStat, setTournamentStat] = useState<TournamentState | null>(
    null
  );
  const [isSearching, setIsSearching] = useState(false);
  const [timeoutId, setTimeoutId] = useState< NodeJS.Timeout | null>(null);
  const [showTournamentView, setShowTournamentView] = useState(false);
  const [opponentReady, setOpponentReady] = useState(false);
  const navigate = useNavigate();
  const ModesList = useMemo(() => {
      return [
        {
          id: 0,
          title: t('game.localGame.title'),
          icon: Gamepad2,
          description: t('game.localGame.description'),
        },
        {
          id: 1,
          title: t('game.remoteGame.title'),
          icon: Globe,
          description: t('game.remoteGame.description'),
        },
        {
          id: 2,
          title: t('game.remoteTournament.title'),
          icon: Trophy,
          description: t('game.remoteTournament.description'),
        },
        {
          id: 3,
          title: t('game.localTournament.title'),
          icon: Users,
          description: t('game.localTournament.description'),
        },
        {
          id: 4,
          title: t('game.multipleGame.title'),
          icon: Users,
          description: t('game.multipleGame.description'),
        },
      ]
  }, [t])
  const {
    gameAccepted,
    gameInvite,
    setGameAccepted,
    player1_id: p1_id,
    player2_id: p2_id,
  } = useGameInvite();
  const { user } = useUser();

  const getTranslatedStatus = (status: string) => {
    switch (status) {
      case 'waiting':
        return t('game.joinedTournaments.statusGame.waiting');
      case 'ongoing':
        return t('game.joinedTournaments.statusGame.ongoing');
      case 'ended':
        return t('game.joinedTournaments.statusGame.ended');
      case 'aborted':
        return t('game.joinedTournaments.statusGame.aborted');
      default:
        return t('game.joinedTournaments.statusGame.unknown');
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleTournamentSubmit = (name: string) => {
    sendMessage({
      event: 'request_tournament',
      tournament_name: name,
    });
  };

  const refetchData = () => {
    refetchUserTournaments();
    refetchTournaments();
  };

  const {
    data: userTournaments,
    isLoading: userTournamentsIsLoading,
    error: userTournamentsError,
    refetch: refetchUserTournaments,
  } = useGetData<TournmentType[]>('matchmaker/tournaments/user-tournaments');

  const {
    data: tournaments,
    isLoading,
    error,
    refetch: refetchTournaments,
  } = useGetData<TournmentType[]>('matchmaker/tournaments');

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (isSearching) {
      timeout = setTimeout(() => {
        setIsSearching(false);
        sendMessage({
          event: 'remove_from_queue',
        });
        toast.error("Matchmaking timeout!");
      }, 10000);
      setTimeoutId(timeout);
    }


    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [isSearching]);


  useEffect(() => {
      const wsUrl = `${getWebSocketUrl('matchmaking/')}`;
      const socket = new WebSocket(wsUrl);
      ws.current = socket;

      socket.onopen = () => {
      };

      socket.onmessage = (e) => {
        refetchData();
        const data = JSON.parse(e.data);
        // console.log(data);

        if (data.event === 'error') {
          cancelMatchmaking()
          toast.error(data.message);
        }
        if (data.event === 'close_connection') {
          // cancelMatchmaking()
          navigate('/')
        }
        if (data.event === 'success') {
          toast.success(data.message);
        }
        if (data.event === 'match_start') {
          setMatchAdrress(data.match_address);
          setPlayer1_id(data.player1_id);
          setPlayer2_id(data.player2_id);
          setMatchStarted(true);
        }
        // if (data.event === 'in_queue') {
        //   setGameState('inqueue');
        // }
        if (data.event === 'game_address') {
          if (timeoutId)
            clearTimeout(timeoutId);
          setGameAdrress(data.game_address);
          setPlayer1_id(data.player1_id);
          setPlayer2_id(data.player2_id);
          setIsSearching(false);
          setGameState('startGame');
        }
        if (data.event === 'multigame_address') {
          if (timeoutId)
            clearTimeout(timeoutId);
          setGameAdrress(data.game_address);
          setGameState('startMultiGame');
          setIsSearching(false);
        }
        if (data.event === 'tournament_update') {
          setTournamentStat(data.tournament_stat);
        }
        if (data.event === 'opponent_ready') {
          setOpponentReady(true);
        }
        if (data.event === 'opponent_unready') {
          setOpponentReady(false);
        }
      };
      socket.onclose = () => {
        // console.log('Matchmaker Socket disconnected');
      };

    return () => {
      if (ws.current) {
        // console.log('Closing matchmaker websocket ....');
        sendMessage({
          event: 'remove_from_queue',
        });
        setGameState(null);
        ws.current.close();
      }
      setGameAccepted(false);
    };
  }, []);

  const sendMessage = (message: Record<string, any>) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
    }
  };

  const cancelMatchmaking = () => {
    sendMessage({
      event: 'remove_from_queue',
    });
    setIsSearching(false)
    // setGameState(null);
  };

  const requestRemoteGame = () => {
    setGameState(null);
    setIsSearching(true);
    sendMessage({
      event: 'request_remote_game',
    });
  };

  const requestMultipleGame = () => {
    setGameState(null);
    setIsSearching(true);
    sendMessage({
      event: 'request_multiple_game',
    });
  };

  const requestTournament = () => {
    setIsModalOpen(true);
  };

  const handleJoin = (tournamentId: number) => {
    sendMessage({
      event: 'join_tournament',
      tournament_id: tournamentId,
    });
  };

  const handleReturn = () => {
    setGameState(null);
    setSelectedMode(null);
    setShowTournamentView(false);
  };

  if (selectedMode === 0) {
    return <LocalGame onReturn={handleReturn} />;
  }

  if (selectedMode === 1) {
    requestRemoteGame();
    setSelectedMode(null);
  }
  if (selectedMode === 2) {
    requestTournament();
    setSelectedMode(null);
  }

  if (selectedMode === 3) {
    return <Tournament onReturn={handleReturn} />;
  }

  if (selectedMode === 4) {
    requestMultipleGame();
    setSelectedMode(null);
  }

  if (gameAccepted && gameInvite) {
    return (
      <RemoteGame
        key={gameInvite}
        onReturn={() => {
          setGameAccepted(false);
          handleReturn();
        }}
        requestRemoteGame={() => {
          setGameAccepted(false);
          requestRemoteGame();
        }}
        game_address={gameInvite}
        p1_id={p1_id!}
        p2_id={p2_id!}
      />
    );
  }

  if (gameState === 'startMultiGame' && gameAdrress) {
    return (
      <MultipleGame
        requestMultipleGame={requestMultipleGame}
        game_address={gameAdrress}
        onReturn={handleReturn}
      />
    );
  }

  if (gameState === 'startGame' && gameAdrress) {
    return (
      <RemoteGame
        key={gameAdrress}
        onReturn={handleReturn}
        requestRemoteGame={requestRemoteGame}
        game_address={gameAdrress}
        p1_id={player1_id!}
        p2_id={player2_id!}
      />
    );
  }

  if (showTournamentView)
    return (
      <RemoteTournament
        key={tournamentIdRef.current}
        matchAddress={matchAdrress}
        matchStarted={matchStarted}
        setMatchStarted={setMatchStarted}
        tournamentStat={tournamentStat}
        user={user!.username}
        sendMessage={sendMessage}
        onReturn={handleReturn}
        opponentReady={opponentReady}
        setOpponentReady={setOpponentReady}
        p1_id={player1_id!}
        p2_id={player2_id!}
      />
    );

  return (
    <div className={styles.container}>
      {isSearching && !(gameAccepted && gameInvite) && (
        <div className={styles.modalOverlay}>
          {/* <MatchmakingScreen
            onClick={() => {
              sendMessage({
                event: 'remove_from_queue',
              });
              setIsSearching(false)
              setGameState(null);
            }}
          /> */}
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span>Searching for match...</span>
          </div>
          <Button
            onClick={cancelMatchmaking}
            variant="destructive"
            className="px-8 py-4 text-lg"
          >
            Cancel
          </Button>
        </div>
        </div>
      )}
      <div className={styles.topContainer}>
        <div className={styles.left}>
          {ModesList.map((option) => (
            <Card
              key={option.id}
              className={`${styles.item} ${styles.cardMode} ${hoveredOption === option.id ? styles.cardHoveredMode : ''}`}
              onMouseEnter={() => setHoveredOption(option.id)}
              onMouseLeave={() => setHoveredOption(null)}
              onClick={() => setSelectedMode(option.id)}
            >
              <CardContent className={styles.cardContentMode}>
                <option.icon className={styles.iconMode} />
                <CardTitle className={styles.titleMode}>
                  {option.title}
                </CardTitle>
                <p className={styles.descriptionMode}>{option.description}</p>
                <ArrowRight
                  className={`${styles.arrowIconMode} ${hoveredOption === option.id ? styles.arrowIconHoveredMode : ''}`}
                />
              </CardContent>
            </Card>
          ))}
          <CreateTournamentModal
            isOpen={isModalOpen}
            onClose={handleModalClose}
            onSubmit={handleTournamentSubmit}
          />
        </div>

        <div className={styles.right}>
          <Card className={styles.card}>
            <CardHeader>
              <CardTitle className={styles.title}>
                <p>{t('game.joinedTournaments.title')}</p>
                <RefreshButton onClick={() => refetchUserTournaments()} isLoading={userTournamentsIsLoading}/>
              </CardTitle>
            </CardHeader>
            <CardContent className={styles.content}>
              {userTournaments?.map((tournament) => (
                <div
                  key={tournament.id}
                  className={styles.tournamentItem}
                  onClick={() => {
                    setTournamentStat(tournament.state);
                    // setTournamentStatus(tournament.status);
                    setShowTournamentView(true);
                  }}
                >
                  <div>
                    <h3 className={styles.tournamentName}>{tournament.name}</h3>
                    <p className={styles.tournamentPlayerCount}>
                      {t('game.joinedTournaments.players')}{' '}
                      {tournament.players.length}
                    </p>
                  </div>
                  <div className={styles.rightAligned}>
                    <p className={styles.tournamentStatus}>
                      {t('game.joinedTournaments.status')}{' '}
                      {getTranslatedStatus(tournament.status)}
                    </p>
                    <p className={styles.tournamentDate}>
                      {t('game.joinedTournaments.started')}{' '}
                      {formatDate(tournament.created_at, t('lang'))}
                    </p>
                  </div>
                </div>
              ))}
              {!userTournamentsError &&
                !userTournamentsIsLoading &&
                !userTournaments?.length && (
                  <div className={styles.noTournaments}>
                    <NoTournamentIcon size={58} />
                    <p>{t('game.joinedTournaments.noTournament')}</p>
                  </div>
                )}
              {userTournamentsError && (
                <div className={styles.errorWrapper}>
                  <ErrorMessage />
                </div>
              )}
              {!userTournamentsError && userTournamentsIsLoading && (
                <div className={styles.loaderWrapper}>
                  <ArcadeLoader />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className={styles.bottomContainer}>
        <Card className={styles.bottomCard}>
          <CardHeader>
            <CardTitle className={styles.title}>
              <p>{t('game.openTournaments.title')}</p>
              <RefreshButton onClick={() => refetchTournaments()} isLoading={isLoading}/>
            </CardTitle>
          </CardHeader>
          <CardContent className={styles.bottomCardContent}>
            <TournamentList
              handleJoin={handleJoin}
              // handleView={handleView}
              tournaments={tournaments}
              error={error}
              isLoading={isLoading}
            ></TournamentList>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Game;
