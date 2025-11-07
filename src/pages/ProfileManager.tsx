import { CelebrityProfileManager } from "@/components/CelebrityProfileManager";
import { Helmet } from "react-helmet-async";

const ProfileManager = () => {
  return (
    <>
      <Helmet>
        <title>Profile Manager - Admin Dashboard</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        <div className="container mx-auto max-w-6xl py-8">
          <CelebrityProfileManager />
        </div>
      </div>
    </>
  );
};

export default ProfileManager;
