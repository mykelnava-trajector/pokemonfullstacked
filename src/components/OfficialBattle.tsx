import React, { useEffect, useState } from "react"
import { Pokemon } from "../interfaces/PokemonSmallInterface"
import { useLocation, useNavigate } from 'react-router-dom'

const OfficialBattle: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { selectedPokemon } = location.state || {}
  const [EnemyData, setEnemyData] = useState<Pokemon | null>(null)
  const [YourHP, setYourHP] = useState<number>(selectedPokemon?.health || 0)
  const [EnemyHP, setEnemyHP] = useState<number>(0)
  const [Turn, setTurn] = useState<'yours' | 'not'>('yours')
  const [BattleLog, setBattleLog] = useState<string[]>([])
  const [Caught, setCaught] = useState<boolean>(false)
  const [battleStarted, setBattleStarted] = useState<boolean>(false)
  const [attemptedCatch, setAttemptedCatch] = useState<boolean>(false)

  const handleSearchEnemy = async () => {
    try {
      const response = await fetch(`http://localhost:3000/encounter`)
      if (!response.ok) throw new Error('Network response was not ok')
      const fetchEnemyData = await response.json()
      setEnemyData(fetchEnemyData)
      setEnemyHP(fetchEnemyData.health)
      setCaught(false)
      setAttemptedCatch(false)
      setYourHP(selectedPokemon?.health || 0)
      setBattleLog([])
      setBattleStarted(true)
    } catch (error) {
      throw new Error('Error fetching enemy Pokémon')
    }
  }

  const YourAttack = (move: { name: string, damage: number }) => {
    if (Turn === 'yours' && EnemyHP > 0 && YourHP > 0 && !Caught) {
      setEnemyHP((prev) => Math.max(prev - move.damage, 0))
      setBattleLog((prev) => [...prev, `You attacked ${EnemyData?.name} for ${move.damage}`])
      setTurn('not')
    }
  }

  const EnemyAttack = () => {
    if (Turn === 'not' && EnemyData && EnemyHP > 0 && YourHP > 0) {
      const EnemyMove = EnemyData.moves[Math.floor(Math.random() * EnemyData.moves.length)]
      setYourHP((prev) => Math.max(prev - EnemyMove.damage, 0))
      setBattleLog((prev) => [...prev, `${EnemyData.name} attacked you for ${EnemyMove.damage}`])
      setTurn('yours')
    }
  }

  const EnemyCaught = async () => {
    if (EnemyHP > 0 && !Caught) {
      setAttemptedCatch(true)
      const CatchChance = Math.random()
      const SuccessRate = 0.45
      if (CatchChance < SuccessRate) {
        setCaught(true)
        setBattleLog((prev) => [...prev, `You've successfully caught ${EnemyData?.name}`])
        try {
          const response = await fetch(`http://localhost:3000/catch`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ pokemon: EnemyData }),
          })
          const data = await response.json()
          if (!data.success) {
            throw new Error(data.message)
          }
        } catch (error) {
          throw new Error('Error saving caught Pokémon')
        }
      } else {
        setBattleLog((prev) => [...prev, `You have failed to capture ${EnemyData?.name}`])
      }
    } else {
      setBattleLog((prev) => [...prev, `You can't catch a dead Pokémon or a Pokémon you've already caught.`])
    }
  }

  useEffect(() => {
    if (battleStarted) {
      EnemyAttack()
    }
  }, [Turn, battleStarted])

  useEffect(() => {
    if (YourHP <= 0 || EnemyHP <= 0) {
      setBattleLog((prev) => [...prev, "Battle ended."])
      setYourHP(selectedPokemon?.health || 0)
      setBattleStarted(false)
    }
  }, [YourHP, EnemyHP])

  const goToHomePage = () => {
    navigate('/')
  }

  const HPBar = ({ currentHP, maxHP }: { currentHP: number, maxHP: number }) => {
    const hpPercentage = (currentHP / maxHP) * 100
    return (
      <div className="w-full bg-gray-200 rounded-full h-4">
        <div
          className="bg-green-500 h-4 rounded-full"
          style={{ width: `${hpPercentage}%` }}
        ></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-500 to-blue-700 p-4 relative">
      <div className="bg-black/50 max-w-lg mx-auto p-4 rounded-lg backdrop-blur-sm text-center flex flex-col">
        <h1 className="text-3xl font-bold text-yellow-300 mb-2">Battle!</h1>
        <button
          onClick={handleSearchEnemy}
          className="px-4 py-2 bg-yellow-500 text-white rounded mb-4 hover:bg-yellow-600 transition"
        >
          Search for another Pokémon
        </button>
        <div className="flex justify-between mb-4">
          <div className="bg-yellow-300 p-4 rounded-lg w-1/2 mx-2">
            <h2 className="text-lg font-semibold">Your Pokémon: {selectedPokemon.name}</h2>
            <img src={selectedPokemon.sprites} alt={`${selectedPokemon.name} sprite`} className="w-24 h-24 mx-auto mb-2" />
            <strong className="block text-md text-gray-600 mb-1">Health:</strong>
            <HPBar currentHP={YourHP} maxHP={selectedPokemon.health} />
            <p>{YourHP} / {selectedPokemon.health}</p>
          </div>
          <div className="bg-red-300 p-4 rounded-lg w-1/2 mx-2">
            <h2 className="text-lg font-semibold">Enemy Pokémon: {EnemyData?.name}</h2>
            {EnemyData && <img src={EnemyData.sprites} alt={`${EnemyData.name} sprite`} className="w-24 h-24 mx-auto mb-2" />}
            <strong className="block text-md text-gray-600 mb-1">Health:</strong>
            {EnemyData && <HPBar currentHP={EnemyHP} maxHP={EnemyData.health} />}
            <p>{EnemyHP} / {EnemyData?.health}</p>
          </div>
        </div>
        {battleStarted && EnemyData && (
          <div>
            {Turn === 'yours' && (
              <>
                <h3 className="text-lg font-bold mb-2">Select your move:</h3>
                <div className="flex flex-wrap justify-center mb-4">
                  {selectedPokemon.moves.map((move: any, index: any) => (
                    <button
                      key={index}
                      onClick={() => YourAttack(move)}
                      className="px-4 py-2 bg-blue-500 text-white rounded m-1 hover:bg-blue-600 transition"
                    >
                      {move.name} (Damage: {move.damage})
                    </button>
                  ))}
                  <button
                    onClick={EnemyCaught}
                    className="px-4 py-2 bg-green-500 text-white rounded m-1 hover:bg-green-600 transition"
                  >
                    Catch {EnemyData.name}
                  </button>
                </div>
              </>
            )}
            <div className="mt-4">
              <h3 className="text-lg font-bold">Battle Log:</h3>
              <ul className="list-disc list-inside">
                {BattleLog.map((log, index) => (
                  <li key={index} className="text-white">{log}</li>
                ))}
              </ul>
            </div>
            {attemptedCatch && (
              <div>
                {Caught ? (
                  <h2 className="mt-4 text-lg text-green-500">
                    You caught the Pokémon!
                  </h2>
                ) : (
                  <h2 className="mt-4 text-lg text-red-500">
                    Catch Failed.
                  </h2>
                )}
              </div>
            )}
          </div>
        )}
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

export default OfficialBattle
