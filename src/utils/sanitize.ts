const entityMap: { [key: string]: string } = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;'
};

export const sanitizeHtml = (str: string): string => {
  return String(str).replace(/[&<>"'`=\/]/g, (s) => entityMap[s]);
};

export const sanitizeMessage = (message: string): string => {
  // Remove any HTML/script tags
  const noTags = message.replace(/<[^>]*>?/gm, '');
  
  // Sanitize any remaining HTML entities
  const sanitized = sanitizeHtml(noTags);
  
  // Trim whitespace and limit length
  return sanitized.trim().slice(0, 1000);
};