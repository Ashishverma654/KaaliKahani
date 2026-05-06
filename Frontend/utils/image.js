export const resolveImageUrl = (path) => {
  if (!path || typeof path !== 'string' || path === 'null' || path === 'undefined') return '';
  
  // If it's already a full URL map
  if (path.startsWith('http')) return path;
  
  // If it's a relative path map map
  const backendUrl = process.env.NEXT_PUBLIC_API_URL 
    ? process.env.NEXT_PUBLIC_API_URL.split('/api')[0] 
    : 'http://127.0.0.1:5000';
    
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${backendUrl}${normalizedPath}`;
};
