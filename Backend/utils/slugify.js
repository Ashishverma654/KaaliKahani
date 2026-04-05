const slugifyLib = require('slugify');

/**
 * Generates an SEO friendly slug.
 * Supports multiple languages implicitly via slugify standard maps.
 */
const generateSlug = (text) => {
  return slugifyLib(text, {
    replacement: '-',
    remove: /[*+~.()'"!:@]/g,
    lower: true,
    strict: true,
    trim: true
  });
};

module.exports = generateSlug;
