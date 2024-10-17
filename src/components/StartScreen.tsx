import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
const StartScreen: React.FC = () => {
  const navigate = useNavigate()
  useEffect(() => {
    const pokemonMusic = new Audio('/music/pokemon-theme.mp3')
    pokemonMusic.loop = true 
    pokemonMusic.play()
    pokemonMusic.volume = 0.3
    return () => {
      pokemonMusic.pause()
      pokemonMusic.currentTime = 0
    }
  }, [])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen 
                    bg-gradient-to-r from-blue-500 to-blue-700">
      <div className="bg-black/50 p-8 rounded-lg backdrop-blur-sm">
        <h1 className="text-5xl font-bold text-yellow-300 mb-8 animate-pulse">
          Pokémon Battle
        </h1>
        <p className="text-xl text-white mb-8 text-center">
          Choose your path, trainer!
        </p>
        <div className="flex flex-col space-y-4">
          <button
            onClick={() => navigate('/ChoosePokemon')}
            className="px-6 py-3 bg-red-500 text-white font-semibold rounded-lg 
                     shadow-lg hover:bg-red-600 transition-all duration-300 
                     transform hover:-translate-y-1 hover:shadow-xl"
          >
            Select Pokémon
          </button>
          <button
            onClick={() => navigate('/Pokedex')}
            className="px-6 py-3 bg-green-500 text-white font-semibold rounded-lg 
                     shadow-lg hover:bg-green-600 transition-all duration-300 
                     transform hover:-translate-y-1 hover:shadow-xl"
          >
            Pokédex
          </button>
        </div>
      </div>
    </div>
  )
}

export default StartScreen
