import React, { useEffect, useRef, useState } from 'react';
import Paddle from '../utils/Paddle';
import Ball from '../utils/Ball';
import {
  isCollidingWithPaddle,
  handlePaddleCollision,
} from '../utils/GameLogic';
import css from './Pong.module.css';
import { Controller, GameScreens } from '../../../../types/types';
import { FaPause, FaPlay } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

const initialAngle = (Math.random() * Math.PI) / 2 - Math.PI / 4;
const ballRaduis = 8;
const pW = 20;
const pH = 80;

interface GameProps {
  controlMode?: 'keyboard' | 'mouse';
  setIsGameOver: React.Dispatch<React.SetStateAction<boolean>>;
  isGameOver: boolean;
  setIsWinner: React.Dispatch<React.SetStateAction<boolean>>;
  isOnePlayerMode: boolean;
  onNext: (nextScreen: GameScreens) => void;
  sound: boolean;
  paddleSpeed: number;
  ballSpeed: number;
  controller: Controller;
  winningScore: number;
  paused: boolean;
  setPaused: React.Dispatch<React.SetStateAction<boolean>>;
}

const Pong: React.FC<GameProps> = ({
  isGameOver,
  setIsGameOver,
  setIsWinner,
  isOnePlayerMode,
  onNext,
  sound,
  paddleSpeed,
  ballSpeed,
  controller,
  winningScore,
  paused,
  setPaused,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [score1, setScore1] = useState(0);
  const [score2, setScore2] = useState(0);
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

  // const [hitWallSound] = useSound('../../sounds/wall-hit-1.mp3');

  // useEffect(() => {
  //   if (isGameOver) return;
  //   const resizeCanvas = () => {
  //     const rect = (
  //       canvasRef.current?.parentNode as Element
  //     )?.getBoundingClientRect();

  //     // Get the computed styles of the parent to calculate border width
  //     const computedStyle = window.getComputedStyle(
  //       canvasRef.current?.parentNode as Element
  //     );
  //     const borderLeft = parseFloat(computedStyle.borderLeftWidth);
  //     const borderRight = parseFloat(computedStyle.borderRightWidth);
  //     const borderTop = parseFloat(computedStyle.borderTopWidth);
  //     const borderBottom = parseFloat(computedStyle.borderBottomWidth);

  //     // Set canvas width and height by subtracting borders from parent width and height
  //     if (canvasRef.current) {
  //       canvasRef.current.width = rect.width - borderLeft - borderRight;
  //       canvasRef.current.height = rect.height - borderTop - borderBottom;
  //     }

  //     const pixelRatio = window.devicePixelRatio || 1;

  //     // Set transformation
  //     //   ctx.setTransform(
  //     //     (canvas.width / coordinateWidth) * pixelRatio,
  //     //     0,
  //     //     0,
  //     //     (canvas.height / coordinateHeight) * pixelRatio,
  //     //     0,
  //     //     0
  //     //   );
  //   };

  //   resizeCanvas();

  //   window.addEventListener('resize', () => {
  //     resizeCanvas();
  //   });

  //   return window.removeEventListener('resize', () => {
  //     resizeCanvas();
  //   });
  // }, [isGameOver]);

  const togglePause = () => {
    setPaused(!paused);
  };

  useEffect(() => {
    hitWallSound.current.preload = 'auto';
    hitWallSound.current.load(); // Preload the audio into the browser's memory
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

    function getRandomValue(paddleHeight: number): number {
      return Math.floor(
        Math.random() * ((3 * paddleHeight) / 4 - paddleHeight / 4) +
          paddleHeight / 4
      );
    }

    const resetBall = () => {
      ball.x = ball.dx > 0 ? 3 * (canvas.width / 4) : canvas.width / 4;
      ball.y = canvas.height / 2;
      ball.angle = (Math.random() * Math.PI) / 2 - Math.PI / 4;
      ball.speed = ballSpeed;
      const serveDirection = ball.dx > 0 ? -1 : 1;
      ball.dx = serveDirection * ballSpeed * Math.cos(ball.angle);
      ball.dy = ballSpeed * Math.sin(ball.angle);
    };

    const updateScore = (isPlayer: boolean = false) => {
      // left and right collision
      // ball.dx *= -1;
      isPlayer ? setScore1((s) => s + 1) : setScore2((s) => s + 1);
      if (isPlayer ? score1 + 1 >= winningScore : score2 + 1 >= winningScore) {
        setIsGameOver(true);
        isPlayer ? setIsWinner(true) : setIsWinner(false);
        onNext('end');
      }
      resetBall();
    };

    const checkCollision = () => {
      // next move top and bottom collision
      let newX = ball.x + ball.dx + (ball.dx > 0 ? ball.radius : -ball.radius);
      let newY = ball.y + ball.dy + (ball.dy > 0 ? ball.radius : -ball.radius);

      // reverse the ball direction
      if (newY >= canvas.height || newY <= 0) {
        // hitWallSound.load();
        // paddleHitSound.load();
        sound && hitWallSound.current.play();

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

        sound && paddleHitSound.current.play();
        handlePaddleCollision(ball, paddle1);
        paddle1.paddleHitPoint = getRandomValue(paddle1.height);
      } else if (isCollidingWithPaddle(ball, paddle2)) {
        sound && paddleHitSound.current.play();
        handlePaddleCollision(ball, paddle2);
        paddle2.paddleHitPoint = getRandomValue(paddle2.height);
      } else if (newX >= canvas.width) {
        updateScore(true);
      } else if (newX <= 0) {
        updateScore(false);
      }
    };

    const drawDashedLine = () => {
      ctx.setLineDash([15, 7.1]); // [dash length, gap length]
      ctx.strokeStyle = '#f8f3e3';
      ctx.lineWidth = 3;

      ctx.beginPath();
      ctx.moveTo(canvas.width / 2, 10); // Start at the top of the canvas
      ctx.lineTo(canvas.width / 2, canvas.height - 10); // Draw to the bottom of the canvas
      ctx.stroke();
      ctx.setLineDash([]); // Reset the line dash to solid for other drawings
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect(); // Get the canvas's position and size
      // const mouseX = e.clientX - rect.left; // X coordinate inside the canvas
      const mouseY = e.clientY - rect.top; // Y coordinate inside the canvas
      // console.log(`Mouse X: ${mouseX}, Mouse Y: ${mouseY}`);
      if (controller === 'mouse') {
        if (
          mouseY >= paddle1.height / 2 &&
          mouseY <= canvas.height - paddle1.height / 2
        )
          paddle1.y = mouseY - paddle1.height / 2;
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'w' || e.key === 'W') paddle1.dy = -paddle1.speed;
      if (e.key === 's' || e.key === 'S') paddle1.dy = paddle1.speed;
      if (e.key === 'ArrowUp') paddle2.dy = -paddle2.speed;
      if (e.key === 'ArrowDown') paddle2.dy = paddle2.speed;
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
      paddle.y += paddle.dy;

      // Prevent the paddle from going off the canvas
      if (paddle.y < 0) {
        paddle.y = 0;
      } else if (paddle.y + paddle.height > ctx.canvas.height) {
        paddle.y = ctx.canvas.height - paddle.height;
      }
    };

    const paddle2bot = () => {
      if (ball.dx > 0) {
        if (ball.y < paddle2.y + paddle2.paddleHitPoint)
          paddle2.y -= paddle2.speed;
        if (paddle2.y <= 0) paddle2.y = 0;

        if (ball.y > paddle2.y + paddle2.paddleHitPoint)
          paddle2.y += paddle2.speed;
        if (paddle2.y + paddle2.height >= ctx.canvas.height)
          paddle2.y = ctx.canvas.height - paddle2.height;
      }
    };

    let animationFrameId: number;
    const animate = () => {
      if (isGameOver) return;
      if (!paused) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        drawDashedLine();
        checkCollision();
        ball.move();
        if (controller !== 'mouse') movePaddle(paddle1);
        isOnePlayerMode ? paddle2bot() : movePaddle(paddle2);
        drawBall();
        drawPaddle(paddle1);
        drawPaddle(paddle2);
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    window.addEventListener('keydown', (e) => handleKeyDown(e));
    window.addEventListener('keyup', (e) => handleKeyUp(e));
    canvas.addEventListener('mousemove', (e) => handleMouseMove(e));

    animate();

    return () => {
      window.removeEventListener('keydown', (e) => handleKeyDown(e));
      window.removeEventListener('keyup', (e) => handleKeyUp(e));
      canvas.removeEventListener('mousemove', (e) => handleMouseMove(e));
      cancelAnimationFrame(animationFrameId);
    };
  }, [isGameOver, score1, score2, paused]);

  return (
    <div id="gameScreen" className={css.gameScreenDiv}>
      <div className={css.scoreWrapper}>
        <div className={css.player1Score}>{score1}</div>
        <div className={css.player2Score}>{score2}</div>
      </div>
      <canvas width="650" height="480" id={css.gameCanvas} ref={canvasRef} />
      {paused && (
        <div className={css.pauseDiv}>{t('game.localGame.paused')}</div>
      )}
      <button className={css.pauseButton} onClick={togglePause}>
        {paused ? <FaPlay color="black" /> : <FaPause color="black" />}
      </button>
    </div>
  );
};

export default Pong;
