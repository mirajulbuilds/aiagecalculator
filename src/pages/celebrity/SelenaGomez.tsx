import React from "react";
import { CelebrityProfile } from "@/components/CelebrityProfile";
import { featuredCelebrities } from "@/data/celebrities";

const SelenaGomez: React.FC = () => {
  const celebrity = featuredCelebrities.find(c => c.slug === "selena-gomez")!;
  return <CelebrityProfile celebrity={celebrity} />;
};

export default SelenaGomez;
