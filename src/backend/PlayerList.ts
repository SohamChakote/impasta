// This defines the "compound" structure you asked for
export type Player = {
  name: string;
  isImposter: boolean;
  points: number;
};

export class PlayerList {
  players: Player[];
  numPlayers: number;
  category: string;

  // You mentioned creating a backend object with a specific number of players
  constructor(numberOfPlayers: number) {
      this.numPlayers = numberOfPlayers;
      this.players = new Array<Player>(numberOfPlayers);
      this.category = "";
    // (Logic to initialize the array will go here)
  }

  // Shell methods you will likely need to implement later:
  addPlayerName(index: number, name: string): void {
    // Logic to set a name
      this.players[index].name = name;
  }

  assignImposter(): void {
    // Logic to pick an imposter
      let randomIdx = Math.floor(Math.random() * this.numPlayers);
      this.players[randomIdx].isImposter = true;
  }
}
