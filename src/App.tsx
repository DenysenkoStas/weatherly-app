import { useLanguage } from './hooks/useLanguage'
import styles from './App.module.scss'

function App() {
  const { language, toggleLanguage, t } = useLanguage()

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <h1 className={styles.logo}>{t.appName}</h1>
        <button className={styles.langToggle} onClick={toggleLanguage}>
          {language === 'en' ? 'UA' : 'EN'}
        </button>
      </header>
    </div>
  )
}

export default App
