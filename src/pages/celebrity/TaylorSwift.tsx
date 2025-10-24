import React from "react";
import { CelebrityProfile } from "@/components/CelebrityProfile";
import { featuredCelebrities } from "@/data/celebrities";

const TaylorSwift: React.FC = () => {
  const celebrity = featuredCelebrities.find(c => c.slug === "taylor-swift")!;
  return <CelebrityProfile celebrity={celebrity} />;
};

export default TaylorSwift;
