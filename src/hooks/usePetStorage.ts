import { useState, useEffect } from 'react';
import { Pet, SavedPetWithAge } from '@/types/pet';

const STORAGE_KEY = 'saved_pets';

export const usePetStorage = () => {
  const [pets, setPets] = useState<Pet[]>([]);

  // Load pets from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setPets(parsed);
      }
    } catch (error) {
      console.error('Error loading pets from storage:', error);
    }
  }, []);

  // Save pets to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(pets));
    } catch (error) {
      console.error('Error saving pets to storage:', error);
    }
  }, [pets]);

  const addPet = (pet: Omit<Pet, 'id' | 'addedAt'>) => {
    const newPet: Pet = {
      ...pet,
      id: crypto.randomUUID(),
      addedAt: new Date().toISOString(),
    };
    setPets(prev => [...prev, newPet]);
    return newPet;
  };

  const removePet = (id: string) => {
    setPets(prev => prev.filter(p => p.id !== id));
  };

  const updatePet = (id: string, updates: Partial<Pet>) => {
    setPets(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const clearAllPets = () => {
    setPets([]);
  };

  return {
    pets,
    addPet,
    removePet,
    updatePet,
    clearAllPets,
  };
};
