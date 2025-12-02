import { ReactNode } from "react";

interface ParallaxSectionProps {
  children: ReactNode;
  speed?: number;
  className?: string;
}

const ParallaxSection = ({ children, speed = 0.5, className = "" }: ParallaxSectionProps) => {
  // CSS-only parallax using background-attachment: fixed equivalent
  // This avoids JavaScript layout queries that cause forced reflows
  return (
    <div className={className}>
      <div
        style={{
          transform: "translateZ(0)", // GPU acceleration without reflow
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default ParallaxSection;
