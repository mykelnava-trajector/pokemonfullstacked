import React, { useState, useEffect } from 'react'
import { Pokemon } from '../interfaces/PokemonSmallInterface'
import Spinner from './Spinner'
import { useNavigate } from 'react-router-dom'

const ChoosePokemon: React.FC = () => {
  const [pokemons, setPokemons] = useState<Pokemon[]>([])
  const [selectedPokemon, setSelectedPokemon] = useState<Pokemon | null>(null)
  const [error, setError] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [hasPokemon, setHasPokemon] = useState<boolean>(false)
  const navigate = useNavigate()
  useEffect(()=>{
    const pokemonmusic = new Audio(`/music/who's-that-pokemon.mp3`)
    pokemonmusic.play()
    return() =>{
      pokemonmusic.pause()
      pokemonmusic.currentTime = 0
    }
  })
  useEffect(() => {
    const checkExistingPokemon = async () => {
      try {
        const response = await fetch('http://localhost:3000/checkpokemon')
        const data = await response.json()
        setHasPokemon(data.hasPokemon)
        if (data.hasPokemon) {
          setSelectedPokemon(data.pokemon)
        }
      } catch (error) {
        setError('Error checking existing Pokémon.')
      }
    }
    checkExistingPokemon()
  }, [])

  const fetchPokemons = async () => {
    setError('')
    setIsLoading(true)
    try {
      const response = await fetch('http://localhost:3000/getyourpokemon')
      if (!response.ok) throw new Error('Network response was not ok')
      const data: Pokemon[] = await response.json()
      setPokemons(data)
    } catch {
      setError('Error fetching Pokémon.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectPokemon = (pokemon: Pokemon) => {
    setSelectedPokemon(pokemon)
  }

  const saveSelectedPokemon = async () => {
    if (selectedPokemon) {
      try {
        const response = await fetch('http://localhost:3000/savepokemon', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(selectedPokemon),
        })
        if (response.status === 409) {
          throw new Error('Pokémon already exists.')
        }
        if (!response.ok) throw new Error('Network response was not ok')
        await response.json()
      } catch (error) {
        setError(`Error.`)
      }
    }
  }

  const deleteSelectedPokemon = async () => {
    if (selectedPokemon) {
      try {
        const response = await fetch('http://localhost:3000/deletepokemon', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name: selectedPokemon.name }),
        })
        if (!response.ok) throw new Error('Network response was not ok')
        setSelectedPokemon(null)
        setHasPokemon(false)
        setError('')
      } catch (error) {
        setError('Error deleting Pokémon.')
      }
    }
  }
  const startBattle = () => {
    saveSelectedPokemon()
    if (selectedPokemon) {
      navigate('/OfficialBattle', { state: { selectedPokemon } })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-500 to-blue-700 p-4 relative">
      <div className="bg-black/50 max-w-lg mx-auto p-4 rounded-lg backdrop-blur-sm text-center flex flex-col">
        <h1 className="text-3xl font-bold text-yellow-300 mb-2">Select Your Pokémon</h1>
        <button
          onClick={fetchPokemons}
          className="px-3 py-1 mb-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
        >
          {isLoading ? <Spinner /> : 'Fetch Pokémon'}
        </button>
        {error && <p className="text-red-500 mt-2">{error}</p>}
        {hasPokemon && selectedPokemon ? (
          <div className="text-center">
            <h2 className="text-lg font-semibold">You already have a Pokémon: {selectedPokemon.name}</h2>
            <button
              onClick={deleteSelectedPokemon}
              className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
            >
              Delete Pokémon
            </button>
          </div>
        ) : (
          <div className="flex justify-center space-x-4 mt-2">
            {pokemons.map((pokemon) => (
              <div
                key={pokemon.name}
                className="p-2 bg-white border border-gray-300 rounded cursor-pointer hover:bg-gray-100 transition text-center"
                onClick={() => handleSelectPokemon(pokemon)}
              >
                <h2 className="text-lg font-semibold">{pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}</h2>
                <strong className="block text-md text-gray-600 mb-1">Image:</strong>
                <img src={pokemon.sprites} alt={pokemon.name} className="w-28 h-28 mx-auto mb-1 rounded-lg" />
                <p><strong>Health:</strong> {pokemon.health}</p>
                <p><strong>Attack:</strong> {pokemon.attack}</p>
                <p><strong>Moves:</strong></p>
                <ul className="list-disc list-inside">
                  {pokemon.moves.map((move, index) => (
                    <li key={index}>
                      {move.name} (Damage: {move.damage})
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
      {selectedPokemon && (
        <div className="absolute right-4 bottom-4 w-64 p-4 border border-gray-300 rounded bg-yellow-300 text-center">
          <h2 className="text-lg font-semibold">Selected Pokémon: {selectedPokemon.name.charAt(0).toUpperCase() + selectedPokemon.name.slice(1)}</h2>
          <strong className="block text-md text-gray-600 mb-1">Image:</strong>
          <img src={selectedPokemon.sprites} alt={selectedPokemon.name} className="w-30 h-30 mx-auto mb-1 rounded-lg" />
          <p><strong>Health:</strong> {selectedPokemon.health}</p>
          <p><strong>Attack:</strong> {selectedPokemon.attack}</p>
          <p><strong>Moves:</strong></p>
          <ul className="list-disc list-inside">
            {selectedPokemon.moves.map((move, index) => (
              <li key={index}>
                {move.name} (Damage: {move.damage})
              </li>
            ))}
          </ul>
          <button
            onClick={startBattle}
            className="mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
          >
            Start Battle
          </button>
        </div>
      )}
    </div>
  )
}

export default ChoosePokemon
