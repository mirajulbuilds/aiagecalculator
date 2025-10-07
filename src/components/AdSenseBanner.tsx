import { useEffect, useRef } from 'react';

interface AdSenseBannerProps {
  format?: 'horizontal' | 'vertical' | 'square' | 'large-horizontal';
  className?: string;
  adSlot?: string;
}

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

export const AdSenseBanner = ({ 
  format = 'horizontal', 
  className = '',
  adSlot = '9484660939'
}: AdSenseBannerProps) => {
  const adRef = useRef<HTMLModElement>(null);

  useEffect(() => {
    try {
      if (adRef.current && window.adsbygoogle) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (err) {
      console.error('AdSense error:', err);
    }
  }, []);

  const getAdStyle = () => {
    switch (format) {
      case 'vertical':
        return { display: 'block', width: '300px', height: '600px' };
      case 'square':
        return { display: 'block', width: '300px', height: '250px' };
      case 'large-horizontal':
        return { display: 'block' };
      default:
        return { display: 'block' };
    }
  };

  return (
    <div className={`flex items-center justify-center ${className}`} aria-label="Advertisement">
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={getAdStyle()}
        data-ad-client="ca-pub-5207285694789831"
        data-ad-slot={adSlot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
};
