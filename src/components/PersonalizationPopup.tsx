import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { lovable } from "@/integrations/lovable/index";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Mail } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const STORAGE_KEY = "personalization_popup_dismissed";
const DELAY_MS = 7000;

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
    <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.997 8.997 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 2.58 9 3.58Z" fill="#EA4335"/>
  </svg>
);

const AppleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
    <path d="M13.71 14.34c-.63.93-1.32 1.86-2.34 1.88-1.03.02-1.36-.61-2.53-.61-1.18 0-1.54.59-2.51.63-1.01.04-1.78-1.01-2.42-1.93C2.58 12.3 1.62 8.93 2.99 6.65c.68-1.13 1.9-1.85 3.22-1.87 1-.02 1.93.67 2.54.67.61 0 1.74-.83 2.94-.71.5.02 1.9.2 2.8 1.52-.07.05-1.67 .98-1.65 2.91.02 2.31 2.03 3.08 2.05 3.09-.02.05-.32 1.1-1.18 2.08ZM11.03 3.28c.53-.64.88-1.53.79-2.42-.76.03-1.68.51-2.22 1.14-.49.56-.92 1.47-.8 2.33.84.07 1.7-.43 2.23-1.05Z" fill="currentColor"/>
  </svg>
);

const PersonalizationPopup = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isAppleLoading, setIsAppleLoading] = useState(false);
  const dismissedThisSession = useRef(false);

  useEffect(() => {
    if (isLoading) return;
    if (user) {
      setOpen(false);
      return;
    }
    if (dismissedThisSession.current) return;
    if (localStorage.getItem(STORAGE_KEY)) return;

    const timer = setTimeout(() => setOpen(true), DELAY_MS);
    return () => clearTimeout(timer);
  }, [user, isLoading]);

  const handleDismiss = () => {
    setOpen(false);
    dismissedThisSession.current = true;
    localStorage.setItem(STORAGE_KEY, "1");
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    const { error } = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (error) {
      toast({ title: "Google sign-in failed", description: String(error), variant: "destructive" });
      setIsGoogleLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    setIsAppleLoading(true);
    const { error } = await lovable.auth.signInWithOAuth("apple", {
      redirect_uri: window.location.origin,
    });
    if (error) {
      toast({ title: "Apple sign-in failed", description: String(error), variant: "destructive" });
      setIsAppleLoading(false);
    }
  };

  const handleEmailSignUp = () => {
    handleDismiss();
    navigate("/auth");
  };

  if (user) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleDismiss(); }}>
      <DialogContent className="sm:max-w-md bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-gray-200 dark:border-slate-700 shadow-2xl rounded-2xl p-0 overflow-hidden">
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="p-6 space-y-5"
            >
              <div className="text-center space-y-2">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-2">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">
                  Unlock Your Personalized AI Experience! 🚀
                </DialogTitle>
                <DialogDescription className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                  Sign in to instantly see your age gap with celebrities, track your astrological matches, and save your results automatically.
                </DialogDescription>
              </div>

              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full h-12 text-base font-medium bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-slate-700"
                  onClick={handleGoogleSignIn}
                  disabled={isGoogleLoading}
                >
                  <GoogleIcon />
                  {isGoogleLoading ? "Redirecting..." : "Continue with Google"}
                </Button>

                <Button
                  variant="outline"
                  className="w-full h-12 text-base font-medium bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-slate-700"
                  onClick={handleAppleSignIn}
                  disabled={isAppleLoading}
                >
                  <AppleIcon />
                  {isAppleLoading ? "Redirecting..." : "Continue with Apple"}
                </Button>

                <Button
                  variant="default"
                  className="w-full h-11 bg-primary text-white hover:bg-primary/90"
                  onClick={handleEmailSignUp}
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Sign up with Email
                </Button>
              </div>

              <button
                onClick={handleDismiss}
                className="w-full text-center text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors pt-1"
              >
                Maybe Later
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};

export default PersonalizationPopup;
