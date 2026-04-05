/**
 * Calculates estimated read time (defaults to ~200 words per minute)
 */
const calculateReadTime = (contentObject) => {
  // Extract text from the primary language (fallback to en)
  const text = contentObject.en || contentObject.hi || '';
  const words = text.trim().split(/\s+/).length;
  const time = Math.ceil(words / 200);
  return time > 0 ? time : 1;
};

module.exports = calculateReadTime;
