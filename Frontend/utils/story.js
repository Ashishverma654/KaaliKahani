import { resolveImageUrl } from './image';

export const getText = (value) => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  return value.en || value.hi || '';
};

export const getSlug = (value) => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  return value.en || value.hi || '';
};

export const getCoverImage = (story) => {
  const url = story?.coverImage 
    ? resolveImageUrl(story.coverImage) 
    : (Array.isArray(story?.images) && story.images.length > 0) 
      ? resolveImageUrl(story.images[0]) 
      : '';
  return url;
};

export const CATEGORY_LABELS = {
  'real-horror': 'Real Horror',
  'paranormal': 'Paranormal',
  'haunted-places': 'Haunted Places',
  'urban-legends': 'Urban Legends',
  'general-horror': 'General Horror'
};
