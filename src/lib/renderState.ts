import { useEffect, useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";

type State = "pending" | "ready" | "error";

function mark(state: State, route: string) {
  if (typeof document === "undefined" || !document.body) return;
  document.body.setAttribute("data-render-state", state);
  document.body.setAttribute("data-render-route", route);
}

// এই route-এ কয়টা async পেজ "আমি ডেটা আনছি" দাবি করেছে
let claims = 0;

/**
 * যেসব পেজ async ডেটা আনে সেগুলোতে বসাও:
 *   useRenderState(loading, notFound);
 */
export function useRenderState(loading: boolean, failed = false) {
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    claims++;
    return () => { claims--; };
  }, []);

  useEffect(() => {
    if (loading) mark("pending", pathname);
    else mark(failed ? "error" : "ready", pathname);
  }, [loading, failed, pathname]);
}

/**
 * App.tsx-এ <Routes> এর ঠিক আগে একবার বসাও।
 * route বদলালেই pending; কোনো পেজ দাবি না করলে (static পেজ) নিজেই ready।
 */
export function RenderStateTracker() {
  const { pathname } = useLocation();

  useLayoutEffect(() => { mark("pending", pathname); }, [pathname]);

  useEffect(() => {
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        if (claims === 0) mark("ready", pathname);
      });
    });
    return () => { cancelAnimationFrame(raf1); cancelAnimationFrame(raf2); };
  }, [pathname]);

  return null;
}