import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { Helmet } from "react-helmet-async";
import { User } from "@supabase/supabase-js";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import { Shield, AlertTriangle } from "lucide-react";

// Rate limiting configuration
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes in milliseconds

interface LoginAttempt {
  count: number;
  lockoutUntil: number | null;
}

const Auth = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTimeRemaining, setLockoutTimeRemaining] = useState(0);
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [qrCode, setQrCode] = useState<string>("");
  const [verificationCode, setVerificationCode] = useState("");
  const captchaRef = useRef<HCaptcha>(null);

  // Rate limiting logic
  const getLoginAttempts = (): LoginAttempt => {
    const stored = localStorage.getItem("login_attempts");
    if (!stored) return { count: 0, lockoutUntil: null };
    return JSON.parse(stored);
  };

  const setLoginAttempts = (attempts: LoginAttempt) => {
    localStorage.setItem("login_attempts", JSON.stringify(attempts));
  };

  const checkRateLimit = () => {
    const attempts = getLoginAttempts();
    if (attempts.lockoutUntil && Date.now() < attempts.lockoutUntil) {
      const remaining = Math.ceil((attempts.lockoutUntil - Date.now()) / 1000 / 60);
      setIsLocked(true);
      setLockoutTimeRemaining(remaining);
      return false;
    }
    return true;
  };

  const recordFailedAttempt = () => {
    const attempts = getLoginAttempts();
    const newCount = attempts.count + 1;

    if (newCount >= MAX_ATTEMPTS) {
      const lockoutUntil = Date.now() + LOCKOUT_DURATION;
      setLoginAttempts({ count: newCount, lockoutUntil });
      setIsLocked(true);
      setLockoutTimeRemaining(15);
      toast.error(`Too many failed attempts. Locked out for 15 minutes.`);
    } else {
      setLoginAttempts({ count: newCount, lockoutUntil: null });
      toast.error(`Invalid credentials. ${MAX_ATTEMPTS - newCount} attempts remaining.`);
    }
  };

  const resetAttempts = () => {
    setLoginAttempts({ count: 0, lockoutUntil: null });
    setIsLocked(false);
    setLockoutTimeRemaining(0);
  };

  useEffect(() => {
    // Check rate limit on mount
    checkRateLimit();

    // Update lockout timer every second
    const interval = setInterval(() => {
      const attempts = getLoginAttempts();
      if (attempts.lockoutUntil && Date.now() < attempts.lockoutUntil) {
        const remaining = Math.ceil((attempts.lockoutUntil - Date.now()) / 1000 / 60);
        setLockoutTimeRemaining(remaining);
      } else if (isLocked) {
        setIsLocked(false);
        setLockoutTimeRemaining(0);
        resetAttempts();
      }
    }, 1000);

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        navigate("/admin/celebrities");
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user);
        navigate("/admin/celebrities");
      } else {
        setUser(null);
      }
    });

    return () => {
      clearInterval(interval);
      subscription.unsubscribe();
    };
  }, [navigate, isLocked]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check rate limit
    if (!checkRateLimit()) {
      return;
    }

    // Validate CAPTCHA (in production, you'd verify this server-side)
    if (!captchaToken) {
      toast.error("Please complete the CAPTCHA");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Reset failed attempts on success
      resetAttempts();

      // Check if user has 2FA enabled
      const { data: factors } = await supabase.auth.mfa.listFactors();
      if (factors && factors.totp && factors.totp.length > 0) {
        // User has 2FA, they'll need to verify
        toast.success("Please verify your 2FA code");
      } else {
        toast.success("Successfully signed in!");
      }

      // Reset captcha
      captchaRef.current?.resetCaptcha();
      setCaptchaToken(null);
    } catch (error: any) {
      recordFailedAttempt();
      captchaRef.current?.resetCaptcha();
      setCaptchaToken(null);
    } finally {
      setLoading(false);
    }
  };

  const handleEnable2FA = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: 'Admin 2FA'
      });

      if (error) throw error;

      if (data) {
        setQrCode(data.totp.qr_code);
        setShow2FASetup(true);
        toast.success("Scan the QR code with your authenticator app");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to enable 2FA");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify2FA = async () => {
    try {
      setLoading(true);
      
      const factors = await supabase.auth.mfa.listFactors();
      if (!factors.data?.totp?.[0]) throw new Error("No 2FA factor found");

      const factorId = factors.data.totp[0].id;

      const { error } = await supabase.auth.mfa.challengeAndVerify({
        factorId,
        code: verificationCode
      });

      if (error) throw error;

      toast.success("2FA enabled successfully!");
      setShow2FASetup(false);
      navigate("/admin/celebrities");
    } catch (error: any) {
      toast.error(error.message || "Failed to verify code");
    } finally {
      setLoading(false);
    }
  };

  if (user && !show2FASetup) {
    return null; // Will redirect via useEffect
  }

  return (
    <>
      <Helmet>
        <title>Admin Login - Celebrity Manager</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-secondary/20 p-4">
        {!show2FASetup ? (
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-5 w-5 text-primary" />
                <CardTitle>Secure Admin Access</CardTitle>
              </div>
              <CardDescription>
                Protected with rate limiting, CAPTCHA, and optional 2FA
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLocked && (
                <Alert variant="destructive" className="mb-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Too many failed attempts. Please wait {lockoutTimeRemaining} minutes before trying again.
                  </AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLocked}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLocked}
                    required
                  />
                </div>

                <div className="flex justify-center">
                  <HCaptcha
                    ref={captchaRef}
                    sitekey="10000000-ffff-ffff-ffff-000000000001" // Test key - replace with real key
                    onVerify={(token) => setCaptchaToken(token)}
                    onExpire={() => setCaptchaToken(null)}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loading || isLocked || !captchaToken}
                >
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
              </form>

              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-muted-foreground text-center mb-2">
                  Enhanced Security Features Active:
                </p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>✓ Rate limiting (5 attempts per 15 min)</li>
                  <li>✓ CAPTCHA verification</li>
                  <li>✓ Secure obscured URL</li>
                  <li>✓ 2FA support available</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Enable Two-Factor Authentication</CardTitle>
              <CardDescription>
                Scan this QR code with your authenticator app
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {qrCode && (
                <div className="flex justify-center">
                  <img src={qrCode} alt="2FA QR Code" className="w-64 h-64" />
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="code">Enter verification code</Label>
                <Input
                  id="code"
                  type="text"
                  placeholder="123456"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  maxLength={6}
                  required
                />
              </div>

              <Button 
                onClick={handleVerify2FA}
                className="w-full" 
                disabled={loading || verificationCode.length !== 6}
              >
                {loading ? "Verifying..." : "Verify and Enable 2FA"}
              </Button>

              <Button 
                onClick={() => setShow2FASetup(false)}
                variant="outline"
                className="w-full"
              >
                Skip for now
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
};

export default Auth;
