import { getCategoryInfo } from '../../utils/categories'
import type { Category } from '../../types'

interface Props {
  category: Category
  size?: 'sm' | 'md' | 'lg'
}

const sizes = {
  sm: 'w-8 h-8 text-base',
  md: 'w-10 h-10 text-xl',
  lg: 'w-12 h-12 text-2xl',
}

export default function CategoryIcon({ category, size = 'md' }: Props) {
  const cat = getCategoryInfo(category)
  return (
    <div
      className={`${sizes[size]} rounded-full flex items-center justify-center flex-shrink-0`}
      style={{ background: cat.color + '20' }}
    >
      <span>{cat.icon}</span>
    </div>
  )
}
