import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { UsageStatsDisplay } from "@/components/UsageStatsDisplay";

const UsageStats = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/system-control-panel-x4y5z6')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        <h1 className="text-3xl font-bold text-foreground">Usage Statistics</h1>
        <p className="text-muted-foreground mt-2">
          View application usage and API consumption
        </p>
      </div>

      <UsageStatsDisplay />
    </div>
  );
};

export default UsageStats;
