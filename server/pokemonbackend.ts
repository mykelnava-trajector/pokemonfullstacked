import express from 'express'
import cors from 'cors'
import { Pokemon } from '../src/interfaces/PokemonSmallInterface'
import { config } from 'dotenv'
import connectToDB from './mongodb'
import { CaughtPokemonModel, PokemonModel } from './pokemondatabase'

const app = express()
const port = 3000
config()
app.use(cors())
app.use(express.json()) 

app.listen(port, () => {
  connectToDB(process.env.MONGO_URI || "").then(() => {
    console.log("Connected to ", process.env.MONGO_URI || "")
  })
  console.log("Server is up @ " + port)
})

app.get(`/getyourpokemon`, async (req, res) => {
  try {
    let yourPokemonRandom: Pokemon[] = []
    for (let i = 0; i < 3; i++) {
      const maxPokemonId = 898
      const randomId = Math.floor(Math.random() * maxPokemonId) + 1
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${randomId}`)

      if (!response.ok) {
        throw new Error('Network response was not ok')
      }

      const pokemonData = await response.json()
      if (!pokemonData || !pokemonData.sprites) {
        throw new Error('Incomplete Pokémon data received')
      }

      const frontDefaultSprite = pokemonData.sprites.front_default
      const moves = pokemonData.moves.map((move: any) => ({
        name: move.move.name,
        damage: Math.floor(Math.random() * 40) + 20,
      }))
      const pokeData: Pokemon = {
        name: pokemonData.name,
        health: pokemonData.stats[0].base_stat,
        sprites: frontDefaultSprite,
        moves: moves.slice(0, 4),
        attack: moves.damage,
      }
      yourPokemonRandom.push(pokeData)
    }
    res.json(yourPokemonRandom)
  } catch (error) {
    console.error(`Error fetching Pokémon: ${error.message}`)
    res.status(400).json({ message: `Error fetching Pokémon: ${error.message}` })
  }
})
app.post('/savepokemon', async (req, res) => {
  try {
    const selectedPokemon = req.body
    const existingPokemon = await PokemonModel.findOne({ _id: selectedPokemon._id })
    
    if (existingPokemon) {
      return res.status(409).json({ message: 'Pokémon already exists.' })
    }
    
    await PokemonModel.create(selectedPokemon)
    res.status(201).json({ message: 'Pokémon saved successfully' })
  } catch (error) {
    console.error(`Error saving Pokémon: ${error.message}`)
    res.status(400).json({ message: `Error saving Pokémon: ${error.message}` })
  }
})

app.get(`/checkpokemon`, async (req, res) => {
  try {
    const existingPokemon = await PokemonModel.findOne()
    if (existingPokemon) {
      res.json({ hasPokemon: true, pokemon: existingPokemon })
    } else {
      res.json({ hasPokemon: false })
    }
  } catch (error) {
    console.error(`Error checking Pokémon: ${error.message}`)
    res.status(400).json({ message: `Error checking Pokémon: ${error.message}` })
  }
})
app.delete('/deletepokemon', async (req, res) => {
  try {
    const { name } = req.body
    await PokemonModel.deleteOne({ name })
    res.status(200).json({ message: 'Pokémon deleted successfully' })
  } catch (error) {
    console.error(`Error deleting Pokémon: ${error.message}`)
    res.status(400).json({ message: `Error deleting Pokémon: ${error.message}` })
  }
})


app.get('/encounter', async (req, res) => {
  try {
    const locationArea = 'https://pokeapi.co/api/v2/location-area/168/'
    const response = await fetch(locationArea)

    if (!response.ok) {
      throw new Error('Network response was not ok')
    }
    const data = await response.json()
    const encounters = data.pokemon_encounters
    const randomEncounter = encounters[Math.floor(Math.random() * encounters.length)]
    const pokemonResponse = await fetch(randomEncounter.pokemon.url)

    if (!pokemonResponse.ok) {
      throw new Error('Network response was not ok')
    }
    const pokemonData = await pokemonResponse.json()
    if (!pokemonData || !pokemonData.sprites) {
      throw new Error('Incomplete Pokémon data received')
    }

    const frontDefaultSprite = pokemonData.sprites.front_default
    const moves = pokemonData.moves.map((move: any) => ({
      name: move.move.name,
      damage: Math.floor(Math.random() * 40) + 20,
    }))
    const pokemon: Pokemon = {
      name: pokemonData.name,
      health: pokemonData.stats[0].base_stat,
      sprites: frontDefaultSprite,
      moves: moves.slice(0, 4),
      attack: moves.damage,
    }
    res.json(pokemon)
  } catch (error) {
    console.error(`Error fetching encounter: ${error.message}`)
    res.status(500).json({ error: `Failed to fetch encounter: ${error.message}` })
  }
})

app.post('/catch', async (req, res) => {
  const { pokemon } = req.body
  if (!pokemon) {
    return res.status(400).json({ success: false, message: 'No Pokémon specified.' })
  }
  const catchSuccess = Math.random() < 0.45
  if (catchSuccess) {
    try {
      const existingPokemon = await CaughtPokemonModel.findOne({ name: pokemon.name })
      if (existingPokemon) {
        return res.json({ success: false, message: `${pokemon.name} is already caught.` })
      }
      await CaughtPokemonModel.insertMany(pokemon)
      res.json({ success: true, message: `You caught ${pokemon.name}!` })
    } catch (error) {
      console.error(`Error saving caught Pokémon: ${error.message}`)
      res.status(500).json({ error: `Error saving caught Pokémon: ${error.message}` })
    }
  } else {
    res.json({ success: false, message: `Failed to catch ${pokemon.name}.` })
  }
})

app.get('/caught', async (req, res) => {
  const page = Number(req.query.page) || 1
  const limit = Number(req.query.limit) || 2
  const skip = (page - 1) * limit

  try {
    const caughtPokemon = await CaughtPokemonModel.find().skip(skip).limit(limit)
    const total = await CaughtPokemonModel.countDocuments()
    const totalPages = Math.ceil(total / limit)

    res.json({
      caughtPokemon,
      totalPages,
      currentPage: page
    })
  } catch (error) {
    console.error(`Error fetching caught Pokémon: ${error.message}`)
    res.status(500).json({ error: `Failed to fetch caught Pokémon: ${error.message}` })
  }
})
