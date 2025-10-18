import { Music, Film, History, Users, Loader2 } from "lucide-react";

interface BirthdayFactsProps {
  facts: {
    topSong?: string;
    topMovie?: string;
    historicalEvents?: string[];
    famousBirthdays?: string[];
  } | null;
  loading: boolean;
  error?: string;
}

export const BirthdayFacts = ({ facts, loading, error }: BirthdayFactsProps) => {
  if (!loading && !facts && !error) {
    return null;
  }

  return (
    <section 
      className="bg-card rounded-2xl shadow-card p-6 md:p-8 mb-6"
      aria-label="On your birthday information"
    >
      <h2 className="text-2xl md:text-3xl font-bold text-primary mb-6 text-center">
        On Your Birthday
      </h2>

      {loading && (
        <div className="flex flex-col items-center justify-center py-12 gap-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <p className="text-muted-foreground text-center">
            Searching the archives for your special day...
          </p>
        </div>
      )}

      {error && (
        <div className="text-center py-8">
          <p className="text-destructive">{error}</p>
        </div>
      )}

      {!loading && !error && facts && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Top Song */}
          <div className="bg-gradient-to-br from-primary/10 via-accent/20 to-primary/5 rounded-xl p-6 border border-primary/20">
            <div className="flex items-center gap-2 mb-4">
              <Music className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">
                #1 Song
              </h3>
            </div>
            <p className="text-muted-foreground">
              {facts.topSong || "Data not available."}
            </p>
          </div>

          {/* Top Movie */}
          <div className="bg-gradient-to-br from-accent/20 via-primary/10 to-accent/10 rounded-xl p-6 border border-accent/30">
            <div className="flex items-center gap-2 mb-4">
              <Film className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">
                Top Movie
              </h3>
            </div>
            <p className="text-muted-foreground">
              {facts.topMovie || "Data not available."}
            </p>
          </div>

          {/* Historical Events */}
          <div className="bg-gradient-to-br from-primary/10 via-accent/20 to-primary/5 rounded-xl p-6 border border-primary/20">
            <div className="flex items-center gap-2 mb-4">
              <History className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">
                On This Day in History
              </h3>
            </div>
            {facts.historicalEvents && facts.historicalEvents.length > 0 ? (
              <ul className="space-y-2 text-muted-foreground">
                {facts.historicalEvents.map((event, index) => (
                  <li key={index} className="flex gap-2">
                    <span className="text-primary">•</span>
                    <span>{event}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">Data not available.</p>
            )}
          </div>

          {/* Famous Birthdays */}
          <div className="bg-gradient-to-br from-accent/20 via-primary/10 to-accent/10 rounded-xl p-6 border border-accent/30">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">
                You Share a Birthday With
              </h3>
            </div>
            {facts.famousBirthdays && facts.famousBirthdays.length > 0 ? (
              <ul className="space-y-2 text-muted-foreground">
                {facts.famousBirthdays.map((person, index) => (
                  <li key={index} className="flex gap-2">
                    <span className="text-primary">•</span>
                    <span>{person}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">Data not available.</p>
            )}
          </div>
        </div>
      )}
    </section>
  );
};