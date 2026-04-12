import { useState, useEffect } from 'react'

const KEY = 'dse-favorites'

function load() {
  try { return JSON.parse(localStorage.getItem(KEY)) ?? [] }
  catch { return [] }
}

export function useFavorites() {
  const [favorites, setFavorites] = useState(load)

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(favorites))
  }, [favorites])

  function addFavorite(item) {
    setFavorites(prev => prev.some(f => f.id === item.id) ? prev : [item, ...prev])
  }

  function removeFavorite(id) {
    setFavorites(prev => prev.filter(f => f.id !== id))
  }

  function toggleFavorite(item) {
    favorites.some(f => f.id === item.id) ? removeFavorite(item.id) : addFavorite(item)
  }

  function isFavorite(id) {
    return favorites.some(f => f.id === id)
  }

  return { favorites, toggleFavorite, isFavorite, removeFavorite }
}
