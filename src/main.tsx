import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Register service worker for offline caching and performance
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('Service Worker registered:', registration.scope);
      })
      .catch((error) => {
        console.log('Service Worker registration failed:', error);
      });
  });
}

// Interactive gradient background logic with optimized performance
document.addEventListener('DOMContentLoaded', function() {
  const root = document.documentElement;
  let rafId: number | null = null;
  let pendingX: number | null = null;
  let pendingY: number | null = null;

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
      pendingX = x;
      pendingY = y;
      
      // Use requestAnimationFrame to batch updates and prevent forced reflows
      if (rafId === null) {
        rafId = requestAnimationFrame(() => {
          if (pendingX !== null && pendingY !== null) {
            root.style.setProperty('--x', pendingX + 'px');
            root.style.setProperty('--y', pendingY + 'px');
          }
          rafId = null;
        });
      }
    }
  }

  // Add event listeners for both mouse and touch
  window.addEventListener('mousemove', updateGradient);
  window.addEventListener('touchstart', updateGradient);
  window.addEventListener('touchmove', updateGradient);
});

createRoot(document.getElementById("root")!).render(<App />);
