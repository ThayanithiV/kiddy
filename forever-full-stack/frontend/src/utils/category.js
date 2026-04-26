export const normalizeCategory = (category) => {
  const value = (category || '').trim().toLowerCase()

  if (value === 'Boys' || value === 'boys') {
    return 'Boys'
  }

  if (value === 'Girls' || value === 'girls') {
    return 'Girls'
  }

  if (value === 'Others' || value === 'others') {
    return 'Others'
  }

  return category || ''
}

export const matchesCategory = (productCategory, selectedCategory) =>
  normalizeCategory(productCategory) === normalizeCategory(selectedCategory)
