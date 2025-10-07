interface AdSenseBannerProps {
  format?: 'horizontal' | 'vertical' | 'square' | 'large-horizontal';
  className?: string;
}

export const AdSenseBanner = ({ format = 'horizontal', className = '' }: AdSenseBannerProps) => {
  const isVertical = format === 'vertical';
  const isSquare = format === 'square';
  const isLargeHorizontal = format === 'large-horizontal';

  return (
    <div className={`flex items-center justify-center ${className}`} aria-label="Advertisement">
      <div 
        className={`
          bg-background border border-border/40 rounded-md
          ${isVertical ? 'w-full max-w-[300px] min-h-[600px]' : ''}
          ${isSquare ? 'w-full max-w-[300px] min-h-[250px]' : ''}
          ${isLargeHorizontal ? 'w-full min-h-[120px] max-w-5xl' : ''}
          ${!isVertical && !isSquare && !isLargeHorizontal ? 'w-full min-h-[90px] max-w-4xl' : ''}
          p-4 relative
        `}
      >
        {/* Ad Badge */}
        <div className="absolute top-2 left-2 px-2 py-0.5 bg-muted/80 rounded text-[10px] font-medium text-muted-foreground">
          Ad
        </div>

        {/* Content */}
        <div className="flex flex-col justify-center h-full pt-6">
          <h3 className="text-base font-semibold text-foreground mb-1">
            Google AdSense
          </h3>
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            Monetize your website with targeted ads that match your content and audience
          </p>
          <a 
            href="#" 
            className="text-sm text-blue-600 hover:underline inline-flex items-center gap-1"
            onClick={(e) => e.preventDefault()}
          >
            Learn more
          </a>
        </div>

        {/* Bottom branding */}
        <div className="absolute bottom-2 right-2 flex items-center gap-1 text-[10px] text-muted-foreground/50">
          <span>Google</span>
        </div>
      </div>
    </div>
  );
};
