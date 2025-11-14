export interface Pet {
  id: string;
  name: string;
  petType: 'Dog' | 'Cat';
  dogSize?: 'Small' | 'Medium' | 'Large';
  birthDate: string;
  addedAt: string;
}

export interface PetAgeResult {
  actualAge: string;
  humanAge: number;
  lifeStage: string;
  summary_text: string;
}

export interface SavedPetWithAge extends Pet {
  ageResult?: PetAgeResult;
}
