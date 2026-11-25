import type { ImgHTMLAttributes } from 'react'
import type { IconSources } from '../../types'

interface MeteoIconProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  icon: IconSources
}

// The icons animate themselves (SMIL), which CSS can't stop: with reduced motion the browser
// picks the still copy. <picture> is `display: contents`, so the <img> keeps its place in the layout.
export function MeteoIcon({ icon, alt = '', ...imgProps }: MeteoIconProps) {
  return (
    <picture>
      <source srcSet={icon.still} media="(prefers-reduced-motion: reduce)" />
      <img src={icon.animated} alt={alt} {...imgProps} />
    </picture>
  )
}
