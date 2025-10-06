// named export
export const slugify = (text) => {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')          // Replace spaces with hyphens
    .replace(/[^a-z0-9\-&]/g, '')  // Remove special characters except hyphens & ampersands
    .replace(/-+/g, '-')           // Replace multiple hyphens with single
    .replace(/^-+|-+$/g, '');      // Trim leading/trailing hyphens
};