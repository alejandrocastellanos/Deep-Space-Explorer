import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Explorer from './pages/Explorer'
import ArtemisSection from './pages/ArtemisSection'
import AsteroidRadar from './pages/AsteroidRadar'
import ISSTracker from './pages/ISSTracker'
import Favorites from './pages/Favorites'
import APODPage from './pages/APODPage'
import { useFavorites } from './hooks/useFavorites'

export default function App() {
  const favCtx = useFavorites()

  return (
    <Routes>
      <Route path="/" element={<Layout favCtx={favCtx} />}>
        <Route index element={<Home />} />
        <Route path="explorer" element={<Explorer favCtx={favCtx} />} />
        <Route path="artemis" element={<ArtemisSection favCtx={favCtx} />} />
        <Route path="asteroids" element={<AsteroidRadar />} />
        <Route path="iss" element={<ISSTracker />} />
        <Route path="apod" element={<APODPage />} />
        <Route path="favorites" element={<Favorites favCtx={favCtx} />} />
      </Route>
    </Routes>
  )
}
