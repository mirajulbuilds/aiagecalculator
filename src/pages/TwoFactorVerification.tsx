import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Shield, KeyRound } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ALLOWED_DOMAINS = ['https://aiagecalculator.lovable.app'];

const TwoFactorVerification = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [verificationCode, setVerificationCode] = useState("");
  const [recoveryCode, setRecoveryCode] = useState("");
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    const currentDomain = window.location.origin;
    if (!ALLOWED_DOMAINS.includes(currentDomain)) {
      toast.error('2FA verification is not allowed from this domain');
      handleLogout();
    }
  }, []);

  const handleVerifyCode = async (useRecovery: boolean = false) => {
    const code = useRecovery ? recoveryCode : verificationCode;
    
    if (!code) {
      toast.error('Please enter a code');
      return;
    }

    if (!useRecovery && code.length !== 6) {
      toast.error('Verification code must be 6 digits');
      return;
    }

    setVerifying(true);
    try {
      const { data, error } = await supabase.functions.invoke('verify-2fa', {
        body: useRecovery 
          ? { recoveryCode: code, isEnrollment: false }
          : { code, isEnrollment: false }
      });
      
      if (error || !data.valid) {
        toast.error(useRecovery ? 'Invalid recovery code' : 'Invalid verification code');
        return;
      }

      toast.success('Verification successful');
      
      // Store verification timestamp in session
      sessionStorage.setItem('2fa_verified', Date.now().toString());
      
      // Redirect to intended destination or admin panel
      const from = location.state?.from || "/system-control-panel-x4y5z6";
      navigate(from, { replace: true });
      
    } catch (error) {
      console.error('Error:', error);
      toast.error('Verification failed');
    } finally {
      setVerifying(false);
    }
  };

  const handleLogout = async () => {
    // Clear 2FA verification from session
    sessionStorage.removeItem('2fa_verified');
    await supabase.auth.signOut();
    navigate("/auth-gateway-key-a1b2c3");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-primary" />
            <CardTitle className="text-2xl">Two-Factor Authentication</CardTitle>
          </div>
          <CardDescription>
            Enter your authentication code to continue
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="code" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="code">Authenticator Code</TabsTrigger>
              <TabsTrigger value="recovery">Recovery Code</TabsTrigger>
            </TabsList>

            <TabsContent value="code" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="verification-code">6-Digit Code</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Open your authenticator app and enter the code
                </p>
                <Input
                  id="verification-code"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="text-center text-2xl tracking-widest font-mono"
                  autoFocus
                />
              </div>

              <Button 
                onClick={() => handleVerifyCode(false)}
                disabled={verifying || verificationCode.length !== 6}
                className="w-full"
                size="lg"
              >
                {verifying ? "Verifying..." : "Verify"}
              </Button>
            </TabsContent>

            <TabsContent value="recovery" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="recovery-code">
                  <div className="flex items-center gap-2">
                    <KeyRound className="w-4 h-4" />
                    Recovery Code
                  </div>
                </Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Enter one of your backup recovery codes
                </p>
                <Input
                  id="recovery-code"
                  type="text"
                  value={recoveryCode}
                  onChange={(e) => setRecoveryCode(e.target.value.toUpperCase())}
                  placeholder="XXXX-XXXX-XXXX"
                  className="text-center font-mono"
                  autoFocus
                />
              </div>

              <Button 
                onClick={() => handleVerifyCode(true)}
                disabled={verifying || !recoveryCode}
                className="w-full"
                size="lg"
              >
                {verifying ? "Verifying..." : "Verify with Recovery Code"}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                Recovery codes can only be used once
              </p>
            </TabsContent>
          </Tabs>

          <div className="mt-6">
            <Button 
              variant="ghost" 
              onClick={handleLogout}
              className="w-full"
            >
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TwoFactorVerification;