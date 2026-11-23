import styles from './AirQualityCardSkeleton.module.scss'

export function AirQualityCardSkeleton() {
  return (
    <div className={styles.card} aria-hidden>
      <div className={styles.title} />

      <div className={styles.body}>
        <div className={styles.summary}>
          <div className={styles.index} />
          <div className={styles.scale} />
        </div>

        <div className={styles.pollutants}>
          {Array.from({ length: 2 }, (_, i) => (
            <div key={i} className={styles.pollutant}>
              <div className={styles.label} />
              <div className={styles.value} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
