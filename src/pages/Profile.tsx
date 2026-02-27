import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Helmet } from "react-helmet-async";
import PageTransition from "@/components/PageTransition";
import { CelebrityCard } from "@/components/CelebrityCard";
import { User, Calendar, Globe, Save, LogOut, Trash2, Edit, Clock, Star, Cake, Heart } from "lucide-react";
import { differenceInYears, differenceInMonths, differenceInDays, differenceInHours, differenceInMinutes, differenceInSeconds, format } from "date-fns";

const Profile = () => {
  const { user, profile, isLoading, isProfileComplete, updateProfile, signOut } = useAuth();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [country, setCountry] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sharedBirthdays, setSharedBirthdays] = useState<any[]>([]);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/auth", { replace: true });
    }
  }, [user, isLoading, navigate]);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || "");
      setDateOfBirth(profile.date_of_birth || "");
      setGender(profile.gender || "");
      setCountry(profile.country || "");
    }
  }, [profile]);

  // Live-updating timer
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch shared birthdays
  useEffect(() => {
    if (dateOfBirth) {
      const dob = new Date(dateOfBirth);
      const month = dob.getMonth() + 1;
      const day = dob.getDate();
      supabase
        .rpc("get_celebrities_by_birthday", { birth_month: month, birth_day: day })
        .then(({ data }) => {
          if (data) setSharedBirthdays(data.slice(0, 6));
        });
    }
  }, [dateOfBirth]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateProfile({
        display_name: displayName || null,
        date_of_birth: dateOfBirth || null,
        gender: gender || null,
        country: country || null,
      });
      toast({ title: "Profile updated!" });
      setIsEditing(false);
      // If this was the first-time setup, redirect to home
      if (!isProfileComplete && dateOfBirth) {
        toast({ title: "🎉 Welcome!", description: "Your profile is set up. Enjoy personalized calculations!" });
        navigate("/");
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
    setIsSaving(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No session");

      const res = await supabase.functions.invoke("delete-account", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (res.error) throw new Error(res.error.message);

      toast({ title: "Account deleted", description: "Your account has been permanently removed." });
      await signOut();
      navigate("/");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
    setIsDeleting(false);
    setDeleteDialogOpen(false);
  };

  if (isLoading || !user) return null;

  // Greeting
  const hour = now.getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";
  const firstName = displayName?.split(" ")[0] || "there";

  // Age calculations
  const dob = dateOfBirth ? new Date(dateOfBirth) : null;
  const age = dob ? differenceInYears(now, dob) : null;
  const totalMonths = dob ? differenceInMonths(now, dob) : null;
  const totalDays = dob ? differenceInDays(now, dob) : null;
  const totalHours = dob ? differenceInHours(now, dob) : null;
  const totalMinutes = dob ? differenceInMinutes(now, dob) : null;
  const totalSeconds = dob ? differenceInSeconds(now, dob) : null;

  const nextBirthday = dob ? (() => {
    const thisYearBday = new Date(now.getFullYear(), dob.getMonth(), dob.getDate());
    if (thisYearBday <= now) thisYearBday.setFullYear(now.getFullYear() + 1);
    return differenceInDays(thisYearBday, now);
  })() : null;

  const zodiacSign = dob ? (() => {
    const month = dob.getMonth() + 1;
    const day = dob.getDate();
    const signs = [
      { sign: "Capricorn ♑", start: [1, 1], end: [1, 19] },
      { sign: "Aquarius ♒", start: [1, 20], end: [2, 18] },
      { sign: "Pisces ♓", start: [2, 19], end: [3, 20] },
      { sign: "Aries ♈", start: [3, 21], end: [4, 19] },
      { sign: "Taurus ♉", start: [4, 20], end: [5, 20] },
      { sign: "Gemini ♊", start: [5, 21], end: [6, 20] },
      { sign: "Cancer ♋", start: [6, 21], end: [7, 22] },
      { sign: "Leo ♌", start: [7, 23], end: [8, 22] },
      { sign: "Virgo ♍", start: [8, 23], end: [9, 22] },
      { sign: "Libra ♎", start: [9, 23], end: [10, 22] },
      { sign: "Scorpio ♏", start: [10, 23], end: [11, 21] },
      { sign: "Sagittarius ♐", start: [11, 22], end: [12, 21] },
      { sign: "Capricorn ♑", start: [12, 22], end: [12, 31] },
    ];
    return signs.find(s => (month > s.start[0] || (month === s.start[0] && day >= s.start[1])) && (month < s.end[0] || (month === s.end[0] && day <= s.end[1])))?.sign || "Unknown";
  })() : null;

  // Show profile completion or edit form
  const needsCompletion = !isProfileComplete;
  const showForm = needsCompletion || isEditing;

  return (
    <PageTransition>
      <Helmet>
        <title>My Dashboard | AI Age Calculator</title>
        <meta name="description" content="Your personalized birthday dashboard with age stats and more." />
      </Helmet>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Dynamic Greeting */}
        <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          {greeting}, {firstName}!
        </h1>
        <p className="text-muted-foreground mb-8">
          {needsCompletion ? "Complete your profile to unlock personalized insights." : "Here's your personalized birthday dashboard."}
        </p>

        {/* Profile Completion / Edit Form */}
        {showForm && (
          <Card className="mb-8 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                {needsCompletion ? "Complete Your Profile" : "Edit Profile"}
              </CardTitle>
              <CardDescription>
                {needsCompletion
                  ? "Add your details to get personalized age calculations across all tools."
                  : "Update your profile information."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="display-name">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input id="display-name" placeholder="Your name" value={displayName} onChange={e => setDisplayName(e.target.value)} className="pl-10" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dob">Date of Birth {needsCompletion && <span className="text-destructive">*</span>}</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input id="dob" type="date" value={dateOfBirth} onChange={e => setDateOfBirth(e.target.value)} className="pl-10" required={needsCompletion} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select value={gender} onValueChange={setGender}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input id="country" placeholder="Your country" value={country} onChange={e => setCountry(e.target.value)} className="pl-10" />
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button type="submit" disabled={isSaving}>
                    <Save className="mr-2 h-4 w-4" />
                    {isSaving ? "Saving..." : needsCompletion ? "Save & Explore" : "Save Changes"}
                  </Button>
                  {!needsCompletion && (
                    <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Dashboard content - only show when profile has DOB */}
        {dob && !needsCompletion && (
          <>
            {/* Profile Card */}
            <Card className="mb-8">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
                    {(displayName || user.email || "?").charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-foreground">{displayName || "User"}</h2>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    <p className="text-xs text-muted-foreground">Member since {format(new Date(user.created_at), "MMMM yyyy")}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                    <Edit className="mr-1 h-3 w-3" /> Edit Profile
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleSignOut}>
                    <LogOut className="mr-1 h-3 w-3" /> Log Out
                  </Button>
                  <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="text-destructive border-destructive/30 hover:bg-destructive/10">
                        <Trash2 className="mr-1 h-3 w-3" /> Delete Account
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Delete Account</DialogTitle>
                        <DialogDescription>
                          This action is permanent. All your data will be deleted and cannot be recovered. Are you sure?
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleDeleteAccount} disabled={isDeleting}>
                          {isDeleting ? "Deleting..." : "Yes, Delete My Account"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>

            {/* Age Stats Grid */}
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" /> Your Age in Numbers
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
              {[
                { label: "Years", value: age?.toLocaleString() },
                { label: "Months", value: totalMonths?.toLocaleString() },
                { label: "Days", value: totalDays?.toLocaleString() },
                { label: "Hours", value: totalHours?.toLocaleString() },
                { label: "Minutes", value: totalMinutes?.toLocaleString() },
                { label: "Seconds", value: totalSeconds?.toLocaleString() },
              ].map((stat) => (
                <Card key={stat.label}>
                  <CardContent className="pt-4 pb-4 text-center">
                    <p className="text-xl md:text-2xl font-bold text-primary tabular-nums">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Birthday Countdown & Zodiac */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <Card>
                <CardContent className="pt-6 text-center">
                  <Cake className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-4xl font-bold text-primary">{nextBirthday}</p>
                  <p className="text-sm text-muted-foreground">Days Until Your Next Birthday</p>
                  {nextBirthday === 0 && <p className="text-lg font-semibold text-primary mt-2">🎉 Happy Birthday!</p>}
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <Star className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-2xl font-bold text-primary">{zodiacSign}</p>
                  <p className="text-sm text-muted-foreground">Your Zodiac Sign</p>
                </CardContent>
              </Card>
            </div>

            {/* Shared Birthdays */}
            {sharedBirthdays.length > 0 && (
              <>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Heart className="h-5 w-5 text-primary" /> Celebrities Who Share Your Birthday
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
                  {sharedBirthdays.map((celeb: any) => (
                    <CelebrityCard key={celeb.id} celebrity={celeb} />
                  ))}
                </div>
              </>
            )}

            {/* Completion hint */}
            {(!gender || !country) && (
              <Card className="border-dashed border-primary/30 bg-primary/5 mb-8">
                <CardContent className="pt-4 pb-4 flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Add your {!gender && "gender"}{!gender && !country && " and "}{!country && "country"} for even more personalized insights.
                  </p>
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                    Complete Profile
                  </Button>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </PageTransition>
  );
};

export default Profile;
