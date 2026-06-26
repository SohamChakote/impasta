// This defines the "compound" structure you asked for
export type Player = {
  name: string;
  isImposter: boolean;
  points: number;
};

export class PlayerList {
  players: Player[];

  // You mentioned creating a backend object with a specific number of players
  constructor(numberOfPlayers: number) {
    this.players = [];
    // (Logic to initialize the array will go here)
  }

  // Shell methods you will likely need to implement later:
  addPlayerName(index: number, name: string): void {
    // Logic to set a name
  }

  assignImposter(): void {
    // Logic to pick an imposter
  }
}
