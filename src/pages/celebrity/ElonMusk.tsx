import React from "react";
import { CelebrityProfile } from "@/components/CelebrityProfile";
import { featuredCelebrities } from "@/data/celebrities";

const ElonMusk: React.FC = () => {
  const celebrity = featuredCelebrities.find(c => c.slug === "elon-musk")!;
  return <CelebrityProfile celebrity={celebrity} />;
};

export default ElonMusk;
