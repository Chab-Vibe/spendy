import type { Category } from '../types'

export const CATEGORIES: { id: Category; label: string; icon: string; color: string }[] = [
  { id: 'élelmiszer', label: 'Élelmiszer', icon: '🛒', color: '#22C55E' },
  { id: 'rezsi', label: 'Rezsi', icon: '💡', color: '#F59E0B' },
  { id: 'lakás', label: 'Lakás', icon: '🏠', color: '#6366F1' },
  { id: 'közlekedés', label: 'Közlekedés', icon: '🚗', color: '#3B82F6' },
  { id: 'egészség', label: 'Egészség', icon: '❤️', color: '#EC4899' },
  { id: 'szórakozás', label: 'Szórakozás', icon: '🎬', color: '#F97316' },
  { id: 'ruha', label: 'Ruha', icon: '👕', color: '#8B5CF6' },
  { id: 'egyéb', label: 'Egyéb', icon: '📦', color: '#94A3B8' },
]

export function getCategoryInfo(id: Category) {
  return CATEGORIES.find(c => c.id === id) ?? CATEGORIES[CATEGORIES.length - 1]
}
