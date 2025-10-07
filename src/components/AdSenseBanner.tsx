interface AdSenseBannerProps {
  format?: 'horizontal' | 'vertical' | 'square';
  className?: string;
}

export const AdSenseBanner = ({ format = 'horizontal', className = '' }: AdSenseBannerProps) => {
  const dimensions = {
    horizontal: 'h-[90px] md:h-[120px]',
    vertical: 'h-[600px] w-[160px] md:w-[200px]',
    square: 'h-[250px] md:h-[300px]'
  };

  return (
    <div className={`flex items-center justify-center ${className}`} aria-label="Advertisement">
      <div 
        className={`
          ${dimensions[format]} 
          ${format === 'vertical' ? '' : 'w-full max-w-4xl'}
          bg-muted/40 border border-border/50 rounded-lg
          flex flex-col items-center justify-center
          relative overflow-hidden
        `}
      >
        {/* Google AdSense Style Header */}
        <div className="absolute top-2 right-2 text-[10px] text-muted-foreground/60 font-sans">
          Advertisement
        </div>
        
        {/* Mock Ad Content */}
        <div className="flex flex-col items-center justify-center space-y-2 p-4 text-center">
          <div className="w-12 h-12 rounded-full bg-gradient-primary opacity-20" />
          <div className="space-y-1">
            <div className="h-3 w-32 bg-muted-foreground/20 rounded" />
            <div className="h-2 w-24 bg-muted-foreground/10 rounded" />
          </div>
        </div>

        {/* Google AdSense branding footer */}
        <div className="absolute bottom-1 right-2 flex items-center gap-1">
          <svg 
            viewBox="0 0 24 24" 
            className="w-3 h-3 text-muted-foreground/40"
            fill="currentColor"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
          <span className="text-[9px] text-muted-foreground/40 font-sans">AdSense</span>
        </div>
      </div>
    </div>
  );
};
