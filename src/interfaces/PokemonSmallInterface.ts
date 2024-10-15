export interface Pokemon {
  name: string;
  health: number;
  sprites: string;
  moves : Move[];
  attack : number;
}
export interface Move{
  name: string;
  damage: number;
}
export interface Encounter {
  pokemon: Pokemon;
}

