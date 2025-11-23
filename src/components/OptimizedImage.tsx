import { ImgHTMLAttributes, useState } from 'react';

interface OptimizedImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src: string;
  alt: string;
  fallbackSrc?: string;
  priority?: boolean;
}

/**
 * Optimized image component that serves WebP with fallbacks
 * Automatically adds loading attributes for performance
 */
export const OptimizedImage = ({ 
  src, 
  alt, 
  fallbackSrc,
  priority = false,
  className = '',
  ...props 
}: OptimizedImageProps) => {
  const [imgError, setImgError] = useState(false);
  const [format, setFormat] = useState<'webp' | 'fallback'>('webp');

  // Convert image URL to WebP if it's a supported format
  const getWebPUrl = (url: string) => {
    if (!url) return url;
    
    // Check if URL is already WebP
    if (url.toLowerCase().endsWith('.webp')) {
      return url;
    }

    // For external URLs (like Supabase storage), try to use WebP
    if (url.includes('supabase.co/storage')) {
      // Supabase supports format transformation via query params
      const separator = url.includes('?') ? '&' : '?';
      return `${url}${separator}format=webp&quality=85`;
    }

    // For local images, assume WebP version exists
    const webpUrl = url.replace(/\.(jpg|jpeg|png)$/i, '.webp');
    return webpUrl;
  };

  const handleError = () => {
    if (format === 'webp') {
      // Try fallback to original format
      setFormat('fallback');
      setImgError(false);
    } else if (fallbackSrc && !imgError) {
      // Try provided fallback image
      setImgError(true);
    }
  };

  const finalSrc = imgError && fallbackSrc 
    ? fallbackSrc 
    : format === 'webp' 
      ? getWebPUrl(src) 
      : src;

  return (
    <picture>
      {/* WebP source for modern browsers */}
      {format === 'webp' && !imgError && (
        <source srcSet={getWebPUrl(src)} type="image/webp" />
      )}
      
      {/* Fallback to original format */}
      <img
        src={finalSrc}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        onError={handleError}
        className={className}
        {...props}
      />
    </picture>
  );
};
