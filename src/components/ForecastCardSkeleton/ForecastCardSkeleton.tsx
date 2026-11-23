import styles from './ForecastCardSkeleton.module.scss'

const DAYS = 7
const HOURS = 12

export function ForecastCardSkeleton() {
  return (
    <div className={styles.card} aria-hidden>
      <div className={styles.days}>
        {Array.from({ length: DAYS }, (_, i) => (
          <div key={i} className={styles.day}>
            <div className={styles.dayLabel} />
            <div className={styles.dayIcon} />
            <div className={styles.dayTemps} />
            <div className={styles.dayPrecip} />
          </div>
        ))}
      </div>

      <div className={styles.hourly}>
        <div className={styles.heading} />
        <div className={styles.chart} />
        <div className={styles.hours}>
          {Array.from({ length: HOURS }, (_, i) => (
            <div key={i} className={styles.hour}>
              <div className={styles.hourTime} />
              <div className={styles.hourIcon} />
              <div className={styles.hourTemp} />
              <div className={styles.hourPrecip} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
