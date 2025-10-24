import React from "react";
import { CelebrityProfile } from "@/components/CelebrityProfile";
import { featuredCelebrities } from "@/data/celebrities";

const DwayneJohnson: React.FC = () => {
  const celebrity = featuredCelebrities.find(c => c.slug === "dwayne-johnson")!;
  return <CelebrityProfile celebrity={celebrity} />;
};

export default DwayneJohnson;
