import mongoose from 'mongoose'

const pokemonSchema = new mongoose.Schema({
  name:String,
  health: Number,
  sprites: String,
  moves: Object,
  attack: Number

},{versionKey: false})
const PokemonModel = mongoose.model("Starter", pokemonSchema, "starterpokemon")
const CaughtPokemonModel = mongoose.model("Pokedex", pokemonSchema, "collectedpokemon")
export { PokemonModel, CaughtPokemonModel}