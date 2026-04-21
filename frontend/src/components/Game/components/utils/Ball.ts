// Ball.tsx

class Ball {
  public x: number;
  public y: number;
  public radius: number;
  public angle: number;
  public dx: number;
  public dy: number;
  public speed: number;

  constructor(
    x: number,
    y: number,
    radius: number,
    ballSpeed: number,
    angle: number
  ) {
    const serveDirection = Math.random() < 0.5 ? 1 : -1;
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.angle = angle;
    this.dx = serveDirection * ballSpeed * Math.cos(this.angle);
    this.dy = ballSpeed * Math.sin(this.angle);
    this.speed = ballSpeed;
  }

  move() {
    this.x += this.dx;
    this.y += this.dy;
  }
}

export default Ball;
