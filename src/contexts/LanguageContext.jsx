import { createContext, useContext, useState } from 'react'

const LanguageContext = createContext()

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('dse-lang') || 'es')

  function toggle() {
    setLang(l => {
      const next = l === 'es' ? 'en' : 'es'
      localStorage.setItem('dse-lang', next)
      return next
    })
  }

  return (
    <LanguageContext.Provider value={{ lang, toggle }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}
