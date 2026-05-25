const CATEGORY_OPTIONS = ["Boys", "Girls", "Others"];

const normalizeCategory = (category = "") => {
  const value = category.trim().toLowerCase();

  if (value === "men" || value === "boys") {
    return "Boys";
  }

  if (value === "women" || value === "girls") {
    return "Girls";
  }

  if (value === "kids" || value === "others") {
    return "Others";
  }

  return category;
};

const isValidCategory = (category) => CATEGORY_OPTIONS.includes(normalizeCategory(category));

export { CATEGORY_OPTIONS, normalizeCategory, isValidCategory };
