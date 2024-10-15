import React, { useEffect, useState } from "react"
import { Pokemon } from "../interfaces/PokemonSmallInterface"
import { useNavigate } from 'react-router-dom'

const Pokedex: React.FC = () => {
  const [caughtPokemon, setCaughtPokemon] = useState<Pokemon[]>([])
  const [error, setError] = useState<string>('')
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [totalPages, setTotalPages] = useState<number>(1)
  const navigate = useNavigate()

  const fetchCaughtPokemon = async (page: number) => {
    try {
      const response = await fetch(`http://localhost:3000/caught?page=${page}&limit=2`)
      if (!response.ok) throw new Error('Network response was not ok')
      const data = await response.json()
      setCaughtPokemon(data.caughtPokemon)
      setTotalPages(data.totalPages)
      setCurrentPage(data.currentPage)
    } catch (error) {
      setError('Error fetching caught Pokémon.')
      console.error('Error fetching caught Pokémon:', error)
    }
  }

  useEffect(() => {
    fetchCaughtPokemon(currentPage)
  }, [currentPage])

  const goToHomePage = () => {
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-500 to-blue-700 p-4 relative">
      <div className="bg-black/50 max-w-lg mx-auto p-4 rounded-lg backdrop-blur-sm text-center flex flex-col">
        <h1 className="text-3xl font-bold text-yellow-300 mb-2">Caught Pokémon</h1>
        {error && <p className="text-red-500">{error}</p>}
        <div className="grid grid-cols-1 gap-4">
          {caughtPokemon.map((pokemon, index) => (
            <div key={index} className="bg-gray-800 p-4 rounded-lg text-white">
              <h2 className="text-lg font-semibold">{pokemon.name}</h2>
              <img src={pokemon.sprites} alt={`${pokemon.name} sprite`} className="w-24 h-24 mx-auto mb-2" />
              <strong className="block text-md text-gray-400 mb-1">Health:</strong>
              <p>{pokemon.health}</p>
              <strong className="block text-md text-gray-400 mb-1">Moves:</strong>
              <ul className="list-disc list-inside">
                {pokemon.moves.map((move, moveIndex) => (
                  <li key={moveIndex}>{move.name} (Damage: {move.damage})</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="flex justify-between items-center mt-4">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          >
            Previous
          </button>
          <span className="text-white mx-auto">{`Page ${currentPage} of ${totalPages}`}</span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          >
            Next
          </button>
        </div>
        <button
          onClick={goToHomePage}
          className="mt-4 px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition"
        >
          Go to Homepage
        </button>
      </div>
    </div>
  )
}

export default Pokedex
