import React from "react";
import { CelebrityProfile } from "@/components/CelebrityProfile";
import { featuredCelebrities } from "@/data/celebrities";

const Beyonce: React.FC = () => {
  const celebrity = featuredCelebrities.find(c => c.slug === "beyonce")!;
  return <CelebrityProfile celebrity={celebrity} />;
};

export default Beyonce;
