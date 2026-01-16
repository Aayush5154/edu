import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import translations from '../translations'

const LanguageContext = createContext(null)

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    const saved = localStorage.getItem('eduflex-language')
    return saved || 'en'
  })

  useEffect(() => {
    localStorage.setItem('eduflex-language', language)
    // Set the lang attribute on the html element
    document.documentElement.setAttribute('lang', language)
  }, [language])

  const setLanguage = useCallback((lang) => {
    if (translations[lang]) {
      setLanguageState(lang)
    } else {
      console.warn(`Language '${lang}' not supported. Falling back to English.`)
      setLanguageState('en')
    }
  }, [])

  // Translation function - returns translated string for a key
  const t = useCallback((key) => {
    const currentTranslations = translations[language] || translations.en
    return currentTranslations[key] || translations.en[key] || key
  }, [language])

  // Get all available languages
  const availableLanguages = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिंदी' },
    { code: 'es', name: 'Spanish', nativeName: 'Español' }
  ]

  return (
    <LanguageContext.Provider value={{ 
      language, 
      setLanguage, 
      t, 
      availableLanguages 
    }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
