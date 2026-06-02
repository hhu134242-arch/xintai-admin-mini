/**
 * Format a date string to a readable format.
 *
 * @param dateStr - ISO date string or timestamp
 * @param format - 'full' | 'date' | 'time' | 'short'
 * @returns Formatted date string
 */
export function formatDate(
  dateStr: string | number | Date,
  format: 'full' | 'date' | 'time' | 'short' = 'full'
): string {
  if (!dateStr) return '-'

  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return '-'

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')

  switch (format) {
    case 'date':
      return `${year}-${month}-${day}`
    case 'time':
      return `${hours}:${minutes}:${seconds}`
    case 'short':
      return `${month}-${day} ${hours}:${minutes}`
    case 'full':
    default:
      return `${year}-${month}-${day} ${hours}:${minutes}`
  }
}

/**
 * Format price with currency symbol.
 *
 * @param price - Price value
 * @param currency - Currency symbol (default: '$')
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted price string
 */
export function formatPrice(
  price: number | string | null | undefined,
  currency = '$',
  decimals = 2
): string {
  if (price === null || price === undefined || price === '') return '-'

  const num = typeof price === 'string' ? parseFloat(price) : price
  if (isNaN(num)) return '-'

  // Format with thousands separators
  const formatted = num.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })

  return `${currency}${formatted}`
}

/**
 * Format a number with comma separators.
 */
export function formatNumber(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === '') return '-'
  const num = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(num)) return '-'
  return num.toLocaleString('en-US')
}

/**
 * Truncate text to a maximum length.
 */
export function truncateText(text: string, maxLength: number): string {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

/**
 * Get status label and color for inquiry status.
 */
export function getStatusInfo(status: string): { label: string; color: string } {
  const statusMap: Record<string, { label: string; color: string }> = {
    new: { label: 'New', color: '#409EFF' },
    read: { label: 'Read', color: '#E6A23C' },
    replied: { label: 'Replied', color: '#67C23A' },
    archived: { label: 'Archived', color: '#909399' },
  }
  return statusMap[status] || { label: status, color: '#909399' }
}
