import React, { useEffect, useRef, useState } from 'react';
import css from './Tournament.module.css';
import Paddle from '../../Game/components/utils/Paddle';
import Ball from '../../Game/components/utils/Ball';
import {
  isCollidingWithPaddle,
  handlePaddleCollision,
} from '../../Game/components/utils/GameLogic';
import TournamentHeader from '../components/TournamentHeader/TournamentHeader';
import WinnerOverlay from '../components/WinnerOverlay/WinnerOverlay';
import TournamentForm from '../components/TournamentForm/TournamentForm';
import { FaPause, FaPlay } from 'react-icons/fa';
import ReturnBack from '../../Game/components/ReturnBack/ReturnBack';
import { useTranslation } from 'react-i18next';

const initialAngle = (Math.random() * Math.PI) / 2 - Math.PI / 4;
const ballRaduis = 8;
const pW = 20;
const pH = 80;

function IconLabelButtons({ onClick }: { onClick: () => void }) {
  // const { t } = useTranslation();

  return (
    <button onClick={onClick} className={`${css.playButton}`}>
      start
    </button>
  );
}

const Match = ({
  matchNumber,
  player1,
  player2,
  winner,
  activeMatch,
  onClick,
}: {
  matchNumber: Number;
  player1: string;
  player2: string;
  winner: Number;
  activeMatch: Number;
  onClick: () => void;
}) => {
  return (
    <div className={css.matchup}>
      <div className={css.participants}>
        <div className={`${css.participant} ${winner === 1 ? css.winner : ''}`}>
          <span>{player1}</span>
        </div>
        <div className={`${css.participant} ${winner === 2 ? css.winner : ''}`}>
          <span>{player2}</span>
        </div>
      </div>
      {matchNumber === activeMatch && <IconLabelButtons onClick={onClick} />}
      <div></div>
    </div>
  );
};

const Connector = () => {
  return (
    <div className={css.connector}>
      <div className={css.merger}></div>
      <div className={css.line}></div>
    </div>
  );
};

interface GameProps {
  sound?: boolean;
  paddleSpeed?: number;
  ballSpeed?: number;
  winningScore?: number;
  roundIndex: number;
  matchIndex: number;
  updateWinner: (
    roundIndex: number,
    matchIndex: number,
    newWinner: number
  ) => void;
  player1?: string;
  player2?: string;
}

const Pong: React.FC<GameProps> = ({
  roundIndex,
  matchIndex,
  updateWinner,
  sound = true,
  paddleSpeed = 5,
  ballSpeed = 3,
  winningScore = 7,
  player1 = 'player 1',
  player2 = 'player 2',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [score1, setScore1] = useState(0);
  const [score2, setScore2] = useState(0);
  const [paused, setPaused] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const { t } = useTranslation();

  const ballRef = useRef<Ball | null>(null);
  const paddle1Ref = useRef<Paddle | null>(null);
  const paddle2Ref = useRef<Paddle | null>(null);

  const hitWallSound = useRef(new Audio('/sounds/wall-hit.mp3'));
  const paddleHitSound = useRef(new Audio('/sounds/paddle-hit.mp3'));

  useEffect(() => {
    ballRef.current = new Ball(
      canvasRef.current!.width / 2,
      canvasRef.current!.height / 2,
      ballRaduis,
      ballSpeed,
      initialAngle
    );

    paddle1Ref.current = new Paddle(
      10,
      canvasRef.current!.height / 2 - pH / 2,
      pW,
      pH,
      paddleSpeed
    );
    paddle2Ref.current = new Paddle(
      canvasRef.current!.width - 10 - pW,
      canvasRef.current!.height / 2 - pH / 2,
      pW,
      pH,
      paddleSpeed
    );
  }, []);

  useEffect(() => {
    hitWallSound.current.preload = 'auto';
    hitWallSound.current.load(); // Preloads the audio into the browser's memory
    paddleHitSound.current.preload = 'auto';
    paddleHitSound.current.load();
  }, [sound]);

  useEffect(() => {
    if (isGameOver) return;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;

    const ball: Ball | null = ballRef.current;
    const paddle1: Paddle | null = paddle1Ref.current;
    const paddle2: Paddle | null = paddle2Ref.current;
    if (!ball || !paddle1 || !paddle2) return;

    const resetBall = () => {
      ball.x = ball.dx > 0 ? 3 * (canvas.width / 4) : canvas.width / 4;
      ball.y = canvas.height / 2;
      ball.angle = (Math.random() * Math.PI) / 2 - Math.PI / 4;
      ball.speed = ballSpeed;
      const serveDirection = ball.dx > 0 ? -1 : 1;
      ball.dx = serveDirection * ballSpeed * Math.cos(ball.angle);
      ball.dy = ballSpeed * Math.sin(ball.angle);
    };

    const updateScore = (player: number) => {
      if (player === 1) {
        setScore1((prevScore) => prevScore + 1);
        if (score1 + 1 >= winningScore) {
          setIsGameOver(true);
          updateWinner(roundIndex, matchIndex, 1);
        }
      } else {
        setScore2((prevScore) => prevScore + 1);
        if (score2 + 1 >= winningScore) {
          setIsGameOver(true);
          updateWinner(roundIndex, matchIndex, 2);
        }
      }
      resetBall();
    };

    const checkCollision = () => {
      // next move top and bottom collision
      let newX = ball.x + ball.dx + (ball.dx > 0 ? ball.radius : -ball.radius);
      let newY = ball.y + ball.dy + (ball.dy > 0 ? ball.radius : -ball.radius);

      // reverse the ball direction
      if (newY >= canvas.height || newY <= 0) {
        if (hitWallSound.current.paused) sound && hitWallSound.current.play();

        ball.dy *= -1;
      }

      if (newY <= 0) {
        // Collision with the top wall
        // ball.dy = -ball.dy; // Reverse Y velocity
        ball.y = ball.radius; // Position just outside the wall
      } else if (newY >= canvas.height) {
        // Collision with the bottom wall
        // ball.dy = -ball.dy; // Reverse Y velocity
        ball.y = canvas.height - ball.radius; // Position just outside the wall
      }
      // if (newX >= canvas.width || newX <= 0) this.dx *= -1;

      // paddle collision
      if (isCollidingWithPaddle(ball, paddle1)) {
        // Handle collision, like reversing the ball's direction
        // ball.vx *= -1; // Reverse horizontal direction on collision

        if (paddleHitSound.current.paused)
          sound && paddleHitSound.current.play();
        handlePaddleCollision(ball, paddle1);
      } else if (isCollidingWithPaddle(ball, paddle2)) {
        if (paddleHitSound.current.paused)
          sound && paddleHitSound.current.play();
        handlePaddleCollision(ball, paddle2);
      } else if (newX >= canvas.width) {
        updateScore(1);
      } else if (newX <= 0) {
        updateScore(2);
      }
    };

    const drawDashedLine = () => {
      ctx.setLineDash([15, 7.1]);
      ctx.strokeStyle = '#f8f3e3';
      ctx.lineWidth = 3;

      ctx.beginPath();
      ctx.moveTo(canvas.width / 2, 10);
      ctx.lineTo(canvas.width / 2, canvas.height - 10);
      ctx.closePath();
      ctx.stroke();
      ctx.setLineDash([]);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'w' || e.key === 'W') paddle1.dy = -paddle1.speed;
      if (e.key === 's' || e.key === 'S') paddle1.dy = paddle1.speed;
      if (e.key === 'ArrowUp') paddle2.dy = -paddle2.speed;
      if (e.key === 'ArrowDown') paddle2.dy = paddle2.speed;
      if (e.key === ' ') togglePause();
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'w' || e.key === 's' || e.key === 'W' || e.key === 'S')
        paddle1.dy = 0;
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') paddle2.dy = 0;
    };

    const drawBall = () => {
      ctx.beginPath();
      // ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = '#f8f3e3';
      // ctx.fill();
      ctx.fillRect(
        ball.x - ball.radius,
        ball.y - ball.radius,
        ball.radius * 2,
        ball.radius * 2
      );
      ctx.closePath();
    };

    const drawPaddle = (paddle: Paddle) => {
      ctx.fillStyle = 'white';
      ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
    };

    const movePaddle = (paddle: Paddle) => {
      // Update the y position by the current dy value
      paddle.y += paddle.dy;

      // Prevent the paddle from going off the canvas
      if (paddle.y < 0) {
        paddle.y = 0;
      } else if (paddle.y + paddle.height > ctx.canvas.height) {
        paddle.y = ctx.canvas.height - paddle.height;
      }
    };

    let animationFrameId: number;
    const animate = () => {
      if (isGameOver) return;
      if (!paused) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        drawDashedLine();
        checkCollision();
        if (gameStarted) ball.move();
        movePaddle(paddle1);
        movePaddle(paddle2);
        drawBall();
        drawPaddle(paddle1);
        drawPaddle(paddle2);
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    window.addEventListener('keydown', (e) => handleKeyDown(e));
    window.addEventListener('keyup', (e) => handleKeyUp(e));
    // window.addEventListener('keypress', (e) => handleKeyPress(e));

    animate();

    return () => {
      window.removeEventListener('keydown', (e) => handleKeyDown(e));
      window.removeEventListener('keyup', (e) => handleKeyUp(e));
      cancelAnimationFrame(animationFrameId);
    };
  }, [isGameOver, score1, score2, paused, gameStarted]);

  const togglePause = () => {
    setPaused(!paused);
  };

  const startCountdown = () => {
    setCountdown(3);
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown !== null && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (countdown === 0) {
      setCountdown(null);
      setGameStarted(true);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  return (
    <div className={css.gameScreenDiv}>
      <div className={css.playerNamesWrapper}>
        <div className={css.player1}>{player1}</div>
        <div className={css.vsDiv}>VS</div>
        <div className={css.player2}>{player2}</div>
      </div>
      <div className={css.canvasDiv}>
        <div className={css.scoreWrapper}>
          <div className={css.player1Score}>{score1}</div>
          <div className={css.player2Score}>{score2}</div>
        </div>
        {!gameStarted && countdown === null && (
          <div className={css.gameOverlay} onClick={startCountdown}>
            <div className={css.gameOverlayContent}>
              <h2>{t('game.localTournament.pong.ClickToStart')}</h2>
            </div>
          </div>
        )}
        {countdown !== null && (
          <div className={css.gameOverlay}>
            <div className={css.gameOverlayContent}>
              <h2>{countdown > 0 ? countdown : 'Start!'}</h2>
            </div>
          </div>
        )}
        <canvas width="650" height="480" id={css.gameCanvas} ref={canvasRef} />
      </div>
      {gameStarted && (
        <button className={css.pauseButton} onClick={togglePause}>
          {paused ? <FaPlay color="black" /> : <FaPause color="black" />}
        </button>
      )}
      {gameStarted && paused && (
        <div className={css.pauseDiv}>
          {t('game.localTournament.pong.paused')}
        </div>
      )}
    </div>
  );
};

// type FormProps = {
//   onSubmit: (players: string[]) => void;
//   players: string[];
//   setPlayers: React.Dispatch<React.SetStateAction<string[]>>;
// };

type Match = {
  player1: string;
  player2: string;
  winner: number;
};

type Rounds = {
  [key: number]: Match[];
};

const Tournament = ({ onReturn }: { onReturn: () => void }) => {
  const [players, setPlayers] = useState<string[]>([]);
  const [activeMatch, setActiveMatch] = useState(1);
  const [showForm, setShowForm] = useState(true);
  const [showPong, setShowPong] = useState(false);
  const [showWinner, setShowWinner] = useState(false);
  const [selectedRound, setSelectedRound] = useState<number>(0);
  const [selectedMatch, setSelectedMatch] = useState<number>(0);
  const [rounds, setRounds] = useState<Rounds>({
    1: [
      { player1: '', player2: '', winner: 0 },
      { player1: '', player2: '', winner: 0 },
    ],
    2: [{ player1: '', player2: '', winner: 0 }],
  });

  const updateWinner = (
    roundIndex: number,
    matchIndex: number,
    newWinner: number
  ) => {
    setRounds((prevRounds) => {
      const updatedRounds = { ...prevRounds };

      const match = updatedRounds[roundIndex][matchIndex];
      match.winner = newWinner;

      if (roundIndex === 1) {
        const winnerName = newWinner === 1 ? match.player1 : match.player2;

        if (matchIndex === 0) {
          updatedRounds[2][0].player1 = winnerName;
        } else {
          updatedRounds[2][0].player2 = winnerName;
        }
      }

      return updatedRounds;
    });
    setActiveMatch((curr) => curr + 1);
    setShowPong(false);
    if (activeMatch === 3) setShowWinner(true);
  };

  const playMatch = (roundIndex: number, matchIndex: number) => {
    setSelectedRound(roundIndex);
    setSelectedMatch(matchIndex);
    setShowPong(true);
  };

  const handleSubmit = () => {
    setPlayers((players) => [...players].sort(() => Math.random() - 0.5));
    setRounds((prevRounds) => {
      let newRounds = { ...prevRounds };
      newRounds[1] = [
        { player1: players[0], player2: players[2], winner: 0 },
        { player1: players[1], player2: players[3], winner: 0 },
      ];
      return newRounds;
    });
    setShowForm(false);
  };

  return (
    <div className={css.container}>
      {showForm && (
        <TournamentForm
          onSubmit={handleSubmit}
          players={players}
          setPlayers={setPlayers}
        />
      )}
      {!showForm && showPong ? (
        <Pong
          roundIndex={selectedRound}
          matchIndex={selectedMatch}
          updateWinner={updateWinner}
          player1={rounds[selectedRound][selectedMatch].player1}
          player2={rounds[selectedRound][selectedMatch].player2}
        />
      ) : (
        !showForm && (
          <div className={css.tournamentBody}>
            <TournamentHeader />
            <div className={css.bracket}>
              <section className={`${css.round} ${css.quarterfinals}`}>
                <div className={css.winners}>
                  <div className={css.matchups}>
                    <Match
                      matchNumber={1}
                      player1={rounds[1][0].player1}
                      player2={rounds[1][0].player2}
                      winner={rounds[1][0].winner}
                      activeMatch={activeMatch}
                      onClick={() => playMatch(1, 0)}
                    />
                    <Match
                      matchNumber={2}
                      player1={rounds[1][1].player1}
                      player2={rounds[1][1].player2}
                      winner={rounds[1][1].winner}
                      activeMatch={activeMatch}
                      onClick={() => playMatch(1, 1)}
                    />
                  </div>
                  <Connector />
                </div>
              </section>

              <section className={`${css.round} ${css.finals}`}>
                <div className={css.winners}>
                  <div className={css.matchups}>
                    <Match
                      matchNumber={3}
                      player1={rounds[2][0].player1}
                      player2={rounds[2][0].player2}
                      winner={rounds[2][0].winner}
                      activeMatch={activeMatch}
                      onClick={() => playMatch(2, 0)}
                    />
                  </div>
                </div>
              </section>
            </div>
          </div>
        )
      )}
      {showWinner && (
        <WinnerOverlay
          winner={
            rounds[2][0].winner === 1
              ? rounds[2][0].player1
              : rounds[2][0].player2
          }
          setShowWinner={setShowWinner}
        />
      )}
      <ReturnBack onClick={onReturn} />
    </div>
  );
};

export default Tournament;
