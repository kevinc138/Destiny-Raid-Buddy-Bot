module.exports = class RPSUser {

  username;
  userRecords = [];
  totalWins = 0;
  totalLosses = 0;
  totalTies = 0;

  constructor(username, totalWins, totalLosses, totalTies) {
    this.username = username;
    this.totalWins = totalWins;
    this.totalLosses = totalLosses;
    this.totalTies = totalTies;
  }

  get username() {
    return this.username;
  }

  set username(username) {
    this.username = username;
  }

}