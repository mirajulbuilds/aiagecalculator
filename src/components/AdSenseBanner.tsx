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
        return 'w-full md:w-[300px] md:min-w-[300px] min-h-[180px] md:min-h-[420px] bg-muted/30 border border-border/50 rounded-lg p-2';
      case 'square':
        return 'w-full md:w-[300px] md:min-w-[300px] min-h-[180px] bg-muted/30 border border-border/50 rounded-lg p-2';
      case 'large-horizontal':
        return 'w-full min-w-0 min-h-[70px] md:min-h-[90px] bg-muted/30 border border-border/50 rounded-lg p-2';
      default:
        return 'w-full min-w-0 min-h-[60px] bg-muted/30 border border-border/50 rounded-lg p-2';
    }
  };

  const getAdStyle = () => {
    return { display: 'block', width: '100%', minHeight: '50px' };
  };

  return (
    <div className={`flex items-center justify-center w-full ${className}`} aria-label="Advertisement">
      <div className={`${getContainerClass()} relative`}>
        <div className="absolute top-2 left-2 text-[10px] text-muted-foreground bg-background px-2 py-0.5 rounded z-10">
          Advertisement
        </div>
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
