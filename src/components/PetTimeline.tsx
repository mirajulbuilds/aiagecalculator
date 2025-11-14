import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PawPrint, Heart, Stethoscope, Syringe, Scissors } from "lucide-react";

interface TimelineEvent {
  ageRange: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  type: 'milestone' | 'health';
}

interface PetTimelineProps {
  petType: 'Dog' | 'Cat';
  dogSize?: 'Small' | 'Medium' | 'Large';
  currentAgeYears: number;
}

export const PetTimeline = ({ petType, dogSize, currentAgeYears }: PetTimelineProps) => {
  const getTimelineEvents = (): TimelineEvent[] => {
    if (petType === 'Cat') {
      return [
        {
          ageRange: '0-6 months',
          title: 'Kitten Stage',
          description: 'First vaccinations, deworming, spay/neuter consultation',
          icon: <Syringe className="w-4 h-4" />,
          type: 'health'
        },
        {
          ageRange: '6-12 months',
          title: 'Adolescence',
          description: 'Complete vaccination series, spay/neuter procedure',
          icon: <Scissors className="w-4 h-4" />,
          type: 'health'
        },
        {
          ageRange: '1-3 years',
          title: 'Young Adult',
          description: 'Annual checkups, dental cleaning, maintain healthy weight',
          icon: <Heart className="w-4 h-4" />,
          type: 'milestone'
        },
        {
          ageRange: '3-7 years',
          title: 'Prime Adult',
          description: 'Annual checkups, monitor for dental issues',
          icon: <Stethoscope className="w-4 h-4" />,
          type: 'health'
        },
        {
          ageRange: '7-11 years',
          title: 'Mature',
          description: 'Twice-yearly checkups, blood work, monitor kidney function',
          icon: <Stethoscope className="w-4 h-4" />,
          type: 'health'
        },
        {
          ageRange: '11-14 years',
          title: 'Senior',
          description: 'Regular vet visits, special diet, joint supplements',
          icon: <Heart className="w-4 h-4" />,
          type: 'health'
        },
        {
          ageRange: '15+ years',
          title: 'Geriatric',
          description: 'Frequent monitoring, comfort care, quality of life assessments',
          icon: <PawPrint className="w-4 h-4" />,
          type: 'milestone'
        }
      ];
    } else {
      // Dog timeline varies by size
      const seniorAge = dogSize === 'Small' ? 8 : dogSize === 'Medium' ? 7 : 6;
      return [
        {
          ageRange: '0-6 months',
          title: 'Puppy Stage',
          description: 'Puppy vaccinations, deworming, socialization training',
          icon: <Syringe className="w-4 h-4" />,
          type: 'health'
        },
        {
          ageRange: '6-12 months',
          title: 'Adolescence',
          description: 'Complete vaccination series, spay/neuter, obedience training',
          icon: <Scissors className="w-4 h-4" />,
          type: 'health'
        },
        {
          ageRange: '1-3 years',
          title: 'Young Adult',
          description: 'Annual checkups, heartworm prevention, dental care',
          icon: <Heart className="w-4 h-4" />,
          type: 'milestone'
        },
        {
          ageRange: `3-${seniorAge} years`,
          title: 'Prime Adult',
          description: 'Annual wellness exams, maintain healthy weight and exercise',
          icon: <Stethoscope className="w-4 h-4" />,
          type: 'health'
        },
        {
          ageRange: `${seniorAge}-${seniorAge + 3} years`,
          title: 'Senior',
          description: 'Twice-yearly checkups, joint health monitoring, adjusted diet',
          icon: <Stethoscope className="w-4 h-4" />,
          type: 'health'
        },
        {
          ageRange: `${seniorAge + 3}+ years`,
          title: 'Geriatric',
          description: 'Frequent vet visits, pain management, comfort care focus',
          icon: <PawPrint className="w-4 h-4" />,
          type: 'milestone'
        }
      ];
    }
  };

  const events = getTimelineEvents();
  
  // Determine current stage based on age
  const getCurrentStageIndex = () => {
    if (currentAgeYears < 0.5) return 0;
    if (currentAgeYears < 1) return 1;
    if (currentAgeYears < 3) return 2;
    if (petType === 'Cat') {
      if (currentAgeYears < 7) return 3;
      if (currentAgeYears < 11) return 4;
      if (currentAgeYears < 14) return 5;
      return 6;
    } else {
      const seniorAge = dogSize === 'Small' ? 8 : dogSize === 'Medium' ? 7 : 6;
      if (currentAgeYears < seniorAge) return 3;
      if (currentAgeYears < seniorAge + 3) return 4;
      return 5;
    }
  };

  const currentStageIndex = getCurrentStageIndex();

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PawPrint className="w-5 h-5 text-primary" />
          Life Stage Timeline & Health Milestones
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {events.map((event, index) => (
            <div
              key={index}
              className={`flex gap-4 p-4 rounded-lg border transition-all ${
                index === currentStageIndex
                  ? 'bg-primary/10 border-primary shadow-lg scale-105'
                  : 'bg-background/50 border-border hover:border-primary/30'
              }`}
            >
              <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                index === currentStageIndex
                  ? 'bg-primary text-primary-foreground'
                  : event.type === 'health'
                  ? 'bg-blue-500/20 text-blue-500'
                  : 'bg-purple-500/20 text-purple-500'
              }`}>
                {event.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-baseline gap-2 mb-1">
                  <h4 className="font-semibold text-foreground">{event.title}</h4>
                  <span className="text-xs text-muted-foreground">({event.ageRange})</span>
                  {index === currentStageIndex && (
                    <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                      Current Stage
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{event.description}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
