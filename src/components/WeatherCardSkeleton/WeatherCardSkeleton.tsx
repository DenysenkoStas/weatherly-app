import styles from './WeatherCardSkeleton.module.scss'

export function WeatherCardSkeleton() {
  return (
    <div className={styles.card}>
      <div className={styles.favorite} />
      <div className={styles.refresh} />
      <div className={styles.top}>
        <div className={styles.city} />
        <div className={styles.description} />
      </div>

      <div className={styles.icon} />
      <div className={styles.temp} />

      <div className={styles.details}>
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className={styles.detail}>
            <div className={styles.detailIcon} />
            <div className={styles.label} />
            <div className={styles.value} />
          </div>
        ))}
      </div>

      <div className={styles.sun} />

      <div className={styles.updatedAt} />
    </div>
  )
}
