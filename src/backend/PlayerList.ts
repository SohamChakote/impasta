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
  imposterIdx: number;

  constructor(categoryName: string) {
      this.numPlayers = 0;
      this.players = [];
      this.category = categoryName;
      this.imposterIdx = -1;
  }

  // Shell methods you will likely need to implement later:
  addPlayer(name: string): void {
    // Logic to set a name
      this.players.push({name: name, isImposter: false, points: 0});
      this.numPlayers++;
  }

  addPlayers(playerNames: string[]): void {
      for (const name of playerNames) {
          this.players.push({name: name, isImposter: false, points: 0});
          this.numPlayers++;
      }
  }

  assignImposter(): void {
    // Logic to pick an imposter
      let randomIdx = Math.floor(Math.random() * this.numPlayers);
      this.players[randomIdx].isImposter = true;
      this.imposterIdx = randomIdx;
  }

  getPlayers(): Player[] {
      return this.players;
  }

  getPlayerNames(): string[] {
      let ret:string[] = [];
      for (const player of this.players) {
          ret.push(player.name);
      }
      return ret;
  }

  getImposter(): string {
      return this.players[this.imposterIdx].name;
  }

  getImposterIdx(): number {
      return this.imposterIdx;
  }
}