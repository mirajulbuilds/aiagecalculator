import { useState } from "react";
import { SEOHead } from "@/components/SEOHead";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, Send, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import PageTransition from "@/components/PageTransition";

const Contact = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    // Build mailto link as simple contact method
    const subject = encodeURIComponent(`[AiAgeCalc] ${category || "General"} Inquiry from ${name}`);
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\nCategory: ${category || "General"}\n\nMessage:\n${message}`);
    window.location.href = `mailto:contact@aiagecalc.com?subject=${subject}&body=${body}`;

    setSubmitted(true);
    toast.success("Opening your email client...");
  };

  return (
    <PageTransition>
      <SEOHead
        title="Contact Us"
        description="Get in touch with the AiAgeCalc team. Send us your questions, feedback, or suggestions about our free AI-powered age calculators and birthday tools."
        type="website"
      />
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <main className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto space-y-8">

            {/* Header */}
            <div className="text-center">
              <Mail className="w-12 h-12 text-primary mx-auto mb-4" />
              <h1 className="text-4xl font-bold text-foreground mb-2">Contact Us</h1>
              <p className="text-muted-foreground text-lg">
                We'd love to hear from you! Send us your questions, feedback, or suggestions.
              </p>
            </div>

            {submitted ? (
              <Card className="border-2">
                <CardContent className="py-12 text-center">
                  <CheckCircle className="w-16 h-16 text-primary mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-foreground mb-2">Thank You!</h2>
                  <p className="text-muted-foreground">
                    Your email client should have opened with the message pre-filled. If it didn't, you can email us directly at{" "}
                    <a href="mailto:contact@aiagecalc.com" className="text-primary hover:underline font-medium">
                      contact@aiagecalc.com
                    </a>
                  </p>
                  <Button className="mt-6" onClick={() => setSubmitted(false)}>
                    Send Another Message
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="text-2xl">Send a Message</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name <span className="text-destructive">*</span></Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your name"
                        maxLength={100}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email <span className="text-destructive">*</span></Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        maxLength={255}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">General Inquiry</SelectItem>
                          <SelectItem value="feedback">Feedback</SelectItem>
                          <SelectItem value="bug">Bug Report</SelectItem>
                          <SelectItem value="feature">Feature Request</SelectItem>
                          <SelectItem value="partnership">Partnership / Business</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Message <span className="text-destructive">*</span></Label>
                      <Textarea
                        id="message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="How can we help you?"
                        rows={5}
                        maxLength={2000}
                        required
                      />
                    </div>

                    <Button type="submit" className="w-full" size="lg">
                      <Send className="w-4 h-4 mr-2" />
                      Send Message
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Direct Email */}
            <div className="text-center text-muted-foreground text-sm">
              <p>
                You can also reach us directly at{" "}
                <a href="mailto:contact@aiagecalc.com" className="text-primary hover:underline font-medium">
                  contact@aiagecalc.com
                </a>
              </p>
            </div>

          </div>
        </main>
      </div>
    </PageTransition>
  );
};

export default Contact;
