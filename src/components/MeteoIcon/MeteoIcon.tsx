import type { ImgHTMLAttributes } from 'react'
import { useShouldAnimate } from '../../hooks/useMotion'
import type { IconSources } from '../../types'

interface MeteoIconProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  icon: IconSources
}

export function MeteoIcon({ icon, alt = '', ...imgProps }: MeteoIconProps) {
  const animate = useShouldAnimate()
  return <img src={animate ? icon.animated : icon.still} alt={alt} {...imgProps} />
}
