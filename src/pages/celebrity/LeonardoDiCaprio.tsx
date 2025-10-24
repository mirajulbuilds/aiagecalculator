import React from "react";
import { CelebrityProfile } from "@/components/CelebrityProfile";
import { featuredCelebrities } from "@/data/celebrities";

const LeonardoDiCaprio: React.FC = () => {
  const celebrity = featuredCelebrities.find(c => c.slug === "leonardo-dicaprio")!;
  return <CelebrityProfile celebrity={celebrity} />;
};

export default LeonardoDiCaprio;
