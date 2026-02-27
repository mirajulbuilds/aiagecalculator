import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { Helmet } from "react-helmet-async";
import { useEffect } from "react";
import PageTransition from "@/components/PageTransition";
import { Mail, Lock, User, ArrowRight } from "lucide-react";

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

const Auth = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isAppleLoading, setIsAppleLoading] = useState(false);

  // Sign In state
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");

  // Sign Up state
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [signUpName, setSignUpName] = useState("");

  // Forgot password state
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");

  useEffect(() => {
    if (user) navigate("/profile", { replace: true });
  }, [user, navigate]);

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

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: signInEmail,
      password: signInPassword,
    });
    setIsSubmitting(false);

    if (error) {
      toast({ title: "Sign in failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Welcome back!" });
      navigate("/");
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const { error } = await supabase.auth.signUp({
      email: signUpEmail,
      password: signUpPassword,
      options: {
        emailRedirectTo: window.location.origin,
        data: { display_name: signUpName },
      },
    });
    setIsSubmitting(false);

    if (error) {
      toast({ title: "Sign up failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Check your email", description: "We've sent you a verification link. Please verify your email to sign in." });
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setIsSubmitting(false);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Check your email", description: "We've sent a password reset link to your email." });
      setShowForgotPassword(false);
    }
  };

  if (user) return null;

  const GoogleButton = ({ label = "Continue with Google" }: { label?: string }) => (
    <Button
      type="button"
      variant="outline"
      className="w-full h-12 text-base font-medium border-border/50 bg-background/50 hover:bg-accent/50 transition-all"
      onClick={handleGoogleSignIn}
      disabled={isGoogleLoading}
    >
      <GoogleIcon />
      {isGoogleLoading ? "Redirecting..." : label}
    </Button>
  );

  const AppleButton = ({ label = "Continue with Apple" }: { label?: string }) => (
    <Button
      type="button"
      variant="outline"
      className="w-full h-12 text-base font-medium border-border/50 bg-background/50 hover:bg-accent/50 transition-all"
      onClick={handleAppleSignIn}
      disabled={isAppleLoading}
    >
      <AppleIcon />
      {isAppleLoading ? "Redirecting..." : label}
    </Button>
  );

  const Divider = () => (
    <div className="relative my-2">
      <div className="absolute inset-0 flex items-center">
        <span className="w-full border-t border-border/40" />
      </div>
      <div className="relative flex justify-center text-xs uppercase">
        <span className="bg-background/80 px-3 text-muted-foreground backdrop-blur-sm">or continue with email</span>
      </div>
    </div>
  );

  return (
    <PageTransition>
      <Helmet>
        <title>Sign In | AI Age Calculator</title>
        <meta name="description" content="Sign in or create an account to get personalized age calculations across all tools." />
      </Helmet>

      <div className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[70vh]">
        <Card className="w-full max-w-md bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-gray-200 dark:border-gray-700 shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
              {showForgotPassword ? "Reset Password" : "Welcome"}
            </CardTitle>
            <CardDescription>
              {showForgotPassword
                ? "Enter your email to receive a reset link"
                : "Sign in for a personalized experience across all tools"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {showForgotPassword ? (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reset-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="reset-email" type="email" placeholder="you@example.com" value={resetEmail} onChange={e => setResetEmail(e.target.value)} className="!pl-11" required />
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Sending..." : "Send Reset Link"}
                </Button>
                <Button type="button" variant="ghost" className="w-full" onClick={() => setShowForgotPassword(false)}>
                  Back to Sign In
                </Button>
              </form>
            ) : (
              <Tabs defaultValue="signin" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="signin">Sign In</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>

                <TabsContent value="signin">
                  <div className="mt-4 space-y-4">
                    <div className="space-y-3">
                      <GoogleButton />
                      <AppleButton />
                    </div>
                    <Divider />
                    <form onSubmit={handleSignIn} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="signin-email">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input id="signin-email" type="email" placeholder="you@example.com" value={signInEmail} onChange={e => setSignInEmail(e.target.value)} className="!pl-11" required />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signin-password">Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input id="signin-password" type="password" placeholder="••••••••" value={signInPassword} onChange={e => setSignInPassword(e.target.value)} className="!pl-11" required />
                        </div>
                      </div>
                      <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? "Signing in..." : "Sign In"}
                        {!isSubmitting && <ArrowRight className="ml-2 h-4 w-4" />}
                      </Button>
                      <Button type="button" variant="link" className="w-full text-sm" onClick={() => setShowForgotPassword(true)}>
                        Forgot your password?
                      </Button>
                    </form>
                  </div>
                </TabsContent>

                <TabsContent value="signup">
                  <div className="mt-4 space-y-4">
                    <div className="space-y-3">
                      <GoogleButton label="Sign up with Google" />
                      <AppleButton label="Sign up with Apple" />
                    </div>
                    <Divider />
                    <form onSubmit={handleSignUp} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="signup-name">Display Name</Label>
                        <div className="relative">
                          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input id="signup-name" type="text" placeholder="Your name" value={signUpName} onChange={e => setSignUpName(e.target.value)} className="!pl-11" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-email">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input id="signup-email" type="email" placeholder="you@example.com" value={signUpEmail} onChange={e => setSignUpEmail(e.target.value)} className="!pl-11" required />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-password">Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input id="signup-password" type="password" placeholder="••••••••" value={signUpPassword} onChange={e => setSignUpPassword(e.target.value)} className="!pl-11" required minLength={6} />
                        </div>
                      </div>
                      <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? "Creating account..." : "Create Account"}
                        {!isSubmitting && <ArrowRight className="ml-2 h-4 w-4" />}
                      </Button>
                    </form>
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
};

export default Auth;
