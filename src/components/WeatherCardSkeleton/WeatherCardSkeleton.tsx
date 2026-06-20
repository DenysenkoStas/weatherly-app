import styles from './WeatherCardSkeleton.module.scss'

export function WeatherCardSkeleton() {
  return (
    <div className={styles.card}>
      <div className={styles.top}>
        <div className={styles.city} />
        <div className={styles.description} />
      </div>

      <div className={styles.icon} />
      <div className={styles.temp} />

      <div className={styles.details}>
        <div className={styles.detail}>
          <div className={styles.label} />
          <div className={styles.value} />
        </div>
        <div className={styles.detail}>
          <div className={styles.label} />
          <div className={styles.value} />
        </div>
        <div className={styles.detail}>
          <div className={styles.label} />
          <div className={styles.value} />
        </div>
      </div>
    </div>
  )
}
