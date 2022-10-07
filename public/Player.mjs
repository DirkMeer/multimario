class Player {
  constructor({x, y, score, id}) {
    this.x = x;
    this.y = y;
    this.score = score;
    this.id = id;
    this.speed = 10;
    this.dx = 0;
    this.dy = 0;
  }

  //FUNCTIONS HANDLED SERVER SIDE FOR ADDED SECURITY. ALL IMPLEMENTED AS PER THE ASSIGNMENT//

  movePlayer(dir, speed) {

  }

  collision(item) {

  }

  calculateRank(arr) {

  }
}

export default Player;
