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

  const getContainerClass = () => {
    switch (format) {
      case 'vertical':
        return 'w-[300px] min-w-[300px]';
      case 'square':
        return 'w-[300px] min-w-[300px]';
      case 'large-horizontal':
        return 'w-full max-w-5xl min-w-[300px]';
      default:
        return 'w-full max-w-4xl min-w-[300px]';
    }
  };

  const getAdStyle = () => {
    switch (format) {
      case 'vertical':
        return { display: 'block', minWidth: '300px', minHeight: '600px' };
      case 'square':
        return { display: 'block', minWidth: '300px', minHeight: '250px' };
      case 'large-horizontal':
        return { display: 'block', minWidth: '300px', minHeight: '90px' };
      default:
        return { display: 'block', minWidth: '300px', minHeight: '90px' };
    }
  };

  return (
    <div className={`flex items-center justify-center ${className}`} aria-label="Advertisement">
      <div className={getContainerClass()}>
        <ins
          ref={adRef}
          className="adsbygoogle"
          style={getAdStyle()}
          data-ad-client="ca-pub-5207285694789831"
          data-ad-slot={adSlot}
          data-ad-format="auto"
          data-full-width-responsive="true"
          data-adtest="on"
        />
      </div>
    </div>
  );
};
