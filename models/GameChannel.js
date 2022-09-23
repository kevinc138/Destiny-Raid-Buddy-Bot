module.exports = class GameChannel {

  subscribers = [];

  constructor(name, guildId, subscribers) {
    this.name = name;
    this.guildId = guildId
    this.subscribers = subscribers;
  }
}