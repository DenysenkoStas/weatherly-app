import { WeatherDetailsSkeleton } from '../WeatherDetailsSkeleton'
import styles from './WeatherCardSkeleton.module.scss'

interface WeatherCardSkeletonProps {
  showDetails?: boolean
}

export function WeatherCardSkeleton({ showDetails = true }: WeatherCardSkeletonProps) {
  return (
    <div className={`${styles.card}${showDetails ? '' : ` ${styles.cardCompact}`}`}>
      <div className={styles.favorite} />
      <div className={styles.share} />
      <div className={styles.refresh} />
      <div className={styles.top}>
        <div className={styles.city} />
        <div className={styles.description} />
      </div>

      <div className={styles.icon} />
      <div className={styles.tempBlock}>
        <div className={styles.temp} />
        <div className={styles.comparison}>
          <div className={styles.comparisonSummary} />
          <div className={styles.comparisonDetail} />
        </div>
      </div>

      {showDetails && <WeatherDetailsSkeleton />}

      <div className={styles.updatedAt} />
    </div>
  )
}
