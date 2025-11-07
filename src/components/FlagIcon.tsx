import React from "react";

interface FlagIconProps {
  countryCode: string;
  className?: string;
  alt?: string;
}

export const FlagIcon: React.FC<FlagIconProps> = ({ countryCode, className = "w-5 h-4", alt }) => {
  // Using flagcdn.com for flag images
  const flagUrl = `https://flagcdn.com/w40/${countryCode.toLowerCase()}.png`;
  
  return (
    <img 
      src={flagUrl} 
      alt={alt || `${countryCode} flag`}
      className={`inline-block object-cover rounded-sm ${className}`}
      loading="lazy"
      onError={(e) => {
        // Fallback to a default if flag fails to load
        e.currentTarget.style.display = 'none';
      }}
    />
  );
};
