import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Interactive gradient background logic
document.addEventListener('DOMContentLoaded', function() {
  const root = document.documentElement;

  // Function to update the CSS variables for the gradient
  function updateGradient(e: MouseEvent | TouchEvent) {
    let x: number | undefined, y: number | undefined;
    
    if (e.type === 'mousemove') {
      const mouseEvent = e as MouseEvent;
      x = mouseEvent.clientX;
      y = mouseEvent.clientY;
    } else if (e.type === 'touchmove' || e.type === 'touchstart') {
      const touchEvent = e as TouchEvent;
      if (touchEvent.touches.length > 0) {
        x = touchEvent.touches[0].clientX;
        y = touchEvent.touches[0].clientY;
      }
    }
    
    if (x !== undefined && y !== undefined) {
      root.style.setProperty('--x', x + 'px');
      root.style.setProperty('--y', y + 'px');
    }
  }

  // Add event listeners for both mouse and touch
  window.addEventListener('mousemove', updateGradient);
  window.addEventListener('touchstart', updateGradient);
  window.addEventListener('touchmove', updateGradient);
});

createRoot(document.getElementById("root")!).render(<App />);
