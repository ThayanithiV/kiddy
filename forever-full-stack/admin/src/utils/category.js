export const normalizeCategory = (category) => {
  const value = (category || '').trim().toLowerCase()

  if (value === 'men' || value === 'boys') {
    return 'Boys'
  }

  if (value === 'women' || value === 'girls') {
    return 'Girls'
  }

  if (value === 'kids' || value === 'others') {
    return 'Others'
  }

  return category || ''
}

export const getCategoryDisplayName = (category) => normalizeCategory(category)
