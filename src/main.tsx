import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import {BrowserRouter, Routes, Route} from 'react-router-dom'
import ChoosePokemon from './components/ChoosePokemon'
import OfficialBattle from './components/OfficialBattle'
import StartScreen from './components/StartScreen'
import Pokedex from './components/Pokedex'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path = '/' element= {<StartScreen/>}/>
        <Route path = '/ChoosePokemon' element = {<ChoosePokemon/>}/>
        <Route path = '/OfficialBattle' element = {<OfficialBattle/>}/>
        <Route path = '/Pokedex' element = {<Pokedex/>}/>
      </Routes>
    </BrowserRouter>
  </StrictMode>
)
