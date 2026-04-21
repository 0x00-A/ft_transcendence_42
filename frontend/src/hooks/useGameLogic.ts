import { useState, useRef } from 'react';

interface PaddleState {
  x: number;
  y: number;
  width: number;
  height: number;
  vy: number;
}

interface BallState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
}

export const useGameLogic = (canvasWidth: number, canvasHeight: number) => {
  const paddleWidth = 10;
  const paddleHeight = 100;
  const ballRadius = 10;

  const [paddle1, setPaddle1] = useState<PaddleState>({
    x: 0,
    y: canvasHeight / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    vy: 0,
  });

  const [paddle2, setPaddle2] = useState<PaddleState>({
    x: canvasWidth - paddleWidth,
    y: canvasHeight / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    vy: 0,
  });

  const [ball, setBall] = useState<BallState>({
    x: canvasWidth / 2,
    y: canvasHeight / 2,
    vx: 3,
    vy: 3,
    radius: ballRadius,
    color: 'white',
  });

  const [score1, setScore1] = useState(0);
  const [score2, setScore2] = useState(0);

  const smokeParticles = useRef<any[]>([]);
  const explosionParticles = useRef<any[]>([]);

  // Move Ball
  const moveBall = () => {
    setBall((prev) => {
      let { x, y, vx, vy } = prev;

      x += vx;
      y += vy;

      // Check wall collisions
      if (y + prev.radius > canvasHeight || y - prev.radius < 0) {
        vy *= -1;
        createExplosion(x, y);
      }

      // Check paddle collisions
      if (ballHitsPaddle(paddle1) || ballHitsPaddle(paddle2)) {
        vx *= -1;
        createExplosion(x, y);
      }

      // Scoring logic
      if (x + prev.radius > canvasWidth) {
        setScore1((prevScore) => prevScore + 1);
        resetBall();
      } else if (x - prev.radius < 0) {
        setScore2((prevScore) => prevScore + 1);
        resetBall();
      }

      createSmoke(x, y);
      return { ...prev, x, y, vx, vy };
    });
  };

  // Check if ball hits paddle
  const ballHitsPaddle = (paddle: PaddleState) => {
    return (
      ball.x - ball.radius < paddle.x + paddle.width &&
      ball.x + ball.radius > paddle.x &&
      ball.y > paddle.y &&
      ball.y < paddle.y + paddle.height
    );
  };

  // Reset ball position
  const resetBall = () => {
    setBall((prev) => ({
      ...prev,
      x: canvasWidth / 2,
      y: canvasHeight / 2,
      vx: prev.vx * -1,
      vy: (Math.random() - 0.5) * 6,
    }));
  };

  // Move paddles
  const movePaddle = (
    paddle: 'paddle1' | 'paddle2',
    direction: 'up' | 'down'
  ) => {
    if (paddle === 'paddle1') {
      setPaddle1((prev) => ({
        ...prev,
        vy: direction === 'up' ? -5 : 5,
      }));
    } else {
      setPaddle2((prev) => ({
        ...prev,
        vy: direction === 'up' ? -5 : 5,
      }));
    }
  };

  const stopPaddle = (paddle: 'paddle1' | 'paddle2') => {
    if (paddle === 'paddle1') {
      setPaddle1((prev) => ({ ...prev, vy: 0 }));
    } else {
      setPaddle2((prev) => ({ ...prev, vy: 0 }));
    }
  };

  // Create smoke particles
  const createSmoke = (x: number, y: number) => {
    smokeParticles.current.push({
      x,
      y,
      opacity: 1,
      radius: Math.random() * 5 + 2,
    });
  };

  // Create explosion particles
  const createExplosion = (x: number, y: number) => {
    for (let i = 0; i < 10; i++) {
      explosionParticles.current.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        radius: Math.random() * 5 + 2,
        life: 50,
      });
    }
  };

  return {
    paddle1,
    paddle2,
    ball,
    score1,
    score2,
    smokeParticles: smokeParticles.current,
    explosionParticles: explosionParticles.current,
    movePaddle,
    stopPaddle,
    moveBall,
  };
};
