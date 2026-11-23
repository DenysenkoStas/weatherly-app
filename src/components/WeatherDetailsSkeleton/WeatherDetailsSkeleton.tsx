import styles from './WeatherDetailsSkeleton.module.scss'

interface WeatherDetailsSkeletonProps {
  variant?: 'inline' | 'card'
}

export function WeatherDetailsSkeleton({ variant = 'inline' }: WeatherDetailsSkeletonProps) {
  return (
    <div className={variant === 'card' ? styles.card : styles.inline}>
      <div className={styles.details}>
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className={styles.detail}>
            <div className={styles.detailIcon} />
            <div className={styles.label} />
            <div className={styles.value} />
            <div className={styles.hint} />
          </div>
        ))}
      </div>

      <div className={styles.sun} />
    </div>
  )
}
