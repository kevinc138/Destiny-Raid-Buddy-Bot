
module.exports = class RPSRecord {

  wins = 0;
  losses = 0;
  ties = 0;

  constructor(opponent, wins, losses, ties) {
    this.opponent = opponent;
    this.wins = wins;
    this.losses = losses;
    this.ties = ties;
  }
}