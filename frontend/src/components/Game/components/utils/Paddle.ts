class Paddle {
  public x: number;
  public y: number;
  public width: number;
  public height: number;
  public speed: number; // Speed of movement
  public dy: number = 0; // Vertical velocity (for moving up and down)
  public score: number = 0;
  public paddleHitPoint;

  constructor(
    x: number,
    y: number,
    width: number,
    height: number,
    speed: number
  ) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.speed = speed;
    this.paddleHitPoint = this.height / 4;
  }

  // Method to start moving the paddle in a direction
  moveUp() {
    this.dy = -this.speed;
  }

  moveDown() {
    this.dy = this.speed;
  }

  // Method to stop moving the paddle
  stop() {
    this.dy = 0;
  }
}

export default Paddle;
