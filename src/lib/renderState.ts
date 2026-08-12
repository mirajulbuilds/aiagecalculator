import { useEffect, useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";

type State = "pending" | "ready" | "error";

function norm(p: string) {
  return (p || "/").replace(/\/+$/, "") || "/";
}

function mark(state: State, route: string) {
  if (typeof document === "undefined" || !document.body) return;
  document.body.setAttribute("data-render-state", state);
  document.body.setAttribute("data-render-route", norm(route));
}

let claims = 0;

export function useRenderState(loading: boolean, failed = false) {
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    claims++;
    mark("pending", pathname);
    return () => { claims--; };
  }, [pathname]);

  useEffect(() => {
    if (loading) mark("pending", pathname);
    else mark(failed ? "error" : "ready", pathname);
  }, [loading, failed, pathname]);
}

export function RenderStateTracker() {
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    mark("pending", pathname);
  }, [pathname]);

  useEffect(() => {
    if (claims === 0) mark("ready", pathname);
  }, [pathname]);

  return null;
}