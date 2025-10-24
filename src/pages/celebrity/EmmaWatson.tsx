import React from "react";
import { CelebrityProfile } from "@/components/CelebrityProfile";
import { featuredCelebrities } from "@/data/celebrities";

const EmmaWatson: React.FC = () => {
  const celebrity = featuredCelebrities.find(c => c.slug === "emma-watson")!;
  return <CelebrityProfile celebrity={celebrity} />;
};

export default EmmaWatson;
