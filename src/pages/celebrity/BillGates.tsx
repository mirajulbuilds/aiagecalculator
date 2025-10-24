import React from "react";
import { CelebrityProfile } from "@/components/CelebrityProfile";
import { featuredCelebrities } from "@/data/celebrities";

const BillGates: React.FC = () => {
  const celebrity = featuredCelebrities.find(c => c.slug === "bill-gates")!;
  return <CelebrityProfile celebrity={celebrity} />;
};

export default BillGates;
