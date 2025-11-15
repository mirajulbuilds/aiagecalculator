import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { Shield, Copy, Check, Download } from "lucide-react";
import QRCode from "react-qr-code";

const ALLOWED_DOMAINS = ['https://aiagecalculator.lovable.app'];

const TwoFactorEnrollment = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [verifyingCode, setVerifyingCode] = useState(false);
  const [qrCodeUri, setQrCodeUri] = useState("");
  const [secret, setSecret] = useState("");
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [verificationCode, setVerificationCode] = useState("");
  const [step, setStep] = useState<"generate" | "verify" | "backup">("generate");
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [copiedCodes, setCopiedCodes] = useState(false);

  useEffect(() => {
    const currentDomain = window.location.origin;
    if (!ALLOWED_DOMAINS.includes(currentDomain)) {
      toast.error('2FA enrollment is not allowed from this domain');
      window.location.href = 'https://aiagecalculator.lovable.app/2fa-enrollment';
      return;
    }
    checkEnrollmentStatus();
  }, []);

  const checkEnrollmentStatus = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth-gateway-key-a1b2c3");
        return;
      }

      const { data, error } = await supabase.functions.invoke('check-2fa-status');
      
      if (error) {
        console.error('Error checking 2FA status:', error);
        toast.error('Failed to check enrollment status');
        return;
      }

      if (!data.is_admin) {
        navigate("/");
        return;
      }

      if (data.is_enrolled) {
        // Already enrolled, redirect to admin panel
        navigate("/system-control-panel-x4y5z6");
        return;
      }

      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  const handleGenerateSecret = async () => {
    setEnrolling(true);
    try {
      const { data, error } = await supabase.functions.invoke('enroll-2fa');
      
      if (error) {
        toast.error('Failed to generate 2FA secret');
        return;
      }

      setQrCodeUri(data.qr_code_uri);
      setSecret(data.secret);
      setRecoveryCodes(data.recovery_codes);
      setStep("verify");
      toast.success('2FA secret generated');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to generate 2FA secret');
    } finally {
      setEnrolling(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast.error('Please enter a 6-digit code');
      return;
    }

    setVerifyingCode(true);
    try {
      const { data, error } = await supabase.functions.invoke('verify-2fa', {
        body: { code: verificationCode, isEnrollment: true }
      });
      
      if (error || !data.valid) {
        toast.error('Invalid verification code. Please try again.');
        setVerificationCode("");
        return;
      }

      toast.success('2FA successfully enrolled!');
      setStep("backup");
    } catch (error) {
      console.error('Error:', error);
      toast.error('Verification failed');
    } finally {
      setVerifyingCode(false);
    }
  };

  const copyToClipboard = async (text: string, type: 'secret' | 'codes') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'secret') {
        setCopiedSecret(true);
        setTimeout(() => setCopiedSecret(false), 2000);
      } else {
        setCopiedCodes(true);
        setTimeout(() => setCopiedCodes(false), 2000);
      }
      toast.success('Copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy');
    }
  };

  const downloadRecoveryCodes = () => {
    const text = `AgeCalculator Admin 2FA Recovery Codes\n\nSave these codes in a secure location. Each code can only be used once.\n\n${recoveryCodes.join('\n')}`;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '2fa-recovery-codes.txt';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Recovery codes downloaded');
  };

  const handleComplete = () => {
    navigate("/system-control-panel-x4y5z6");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-primary" />
            <CardTitle className="text-2xl">Two-Factor Authentication Setup</CardTitle>
          </div>
          <CardDescription>
            Mandatory 2FA enrollment for admin accounts. This adds an extra layer of security to protect privileged operations.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {step === "generate" && (
            <div className="space-y-4">
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  As an admin user, you must enable two-factor authentication to access admin features.
                  This ensures the highest level of security for privileged operations.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <h3 className="font-semibold">What you'll need:</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>An authenticator app (Google Authenticator, Authy, 1Password, etc.)</li>
                  <li>A secure place to store recovery codes</li>
                </ul>
              </div>

              <Button 
                onClick={handleGenerateSecret} 
                disabled={enrolling}
                className="w-full"
                size="lg"
              >
                {enrolling ? "Generating..." : "Begin 2FA Setup"}
              </Button>
            </div>
          )}

          {step === "verify" && (
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex flex-col items-center space-y-4">
                  <h3 className="font-semibold">Step 1: Scan QR Code</h3>
                  <div className="bg-white p-4 rounded-lg">
                    <QRCode value={qrCodeUri} size={200} />
                  </div>
                  <p className="text-sm text-muted-foreground text-center">
                    Scan this QR code with your authenticator app
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Or enter this code manually:</Label>
                  <div className="flex gap-2">
                    <Input 
                      value={secret} 
                      readOnly 
                      className="font-mono"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard(secret, 'secret')}
                    >
                      {copiedSecret ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Step 2: Verify Setup</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Enter the 6-digit code from your authenticator app
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="code">Verification Code</Label>
                  <Input
                    id="code"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="000000"
                    className="text-center text-2xl tracking-widest font-mono"
                  />
                </div>

                <Button 
                  onClick={handleVerifyCode}
                  disabled={verifyingCode || verificationCode.length !== 6}
                  className="w-full"
                  size="lg"
                >
                  {verifyingCode ? "Verifying..." : "Verify and Enable 2FA"}
                </Button>
              </div>
            </div>
          )}

          {step === "backup" && (
            <div className="space-y-6">
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  <strong>Important!</strong> Save these recovery codes in a secure location. 
                  You can use them to access your account if you lose your authenticator device.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Recovery Codes</h3>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(recoveryCodes.join('\n'), 'codes')}
                    >
                      {copiedCodes ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                      Copy All
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={downloadRecoveryCodes}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>

                <Card>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                      {recoveryCodes.map((code, idx) => (
                        <div key={idx} className="p-2 bg-muted rounded text-center">
                          {code}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <p className="text-sm text-muted-foreground">
                  Each recovery code can only be used once. Store them securely - you won't be able to see them again.
                </p>
              </div>

              <Button 
                onClick={handleComplete}
                className="w-full"
                size="lg"
              >
                Complete Setup and Continue to Admin Panel
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TwoFactorEnrollment;