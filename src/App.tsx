import { useLanguage } from './hooks/useLanguage'
import './App.css'

function App() {
  const { language, toggleLanguage, t } = useLanguage()

  return (
    <div className="app">
      <header className="header">
        <h1 className="logo">{t.appName}</h1>
        <button className="lang-toggle" onClick={toggleLanguage}>
          {language === 'en' ? 'UA' : 'EN'}
        </button>
      </header>
    </div>
  )
}

export default App
