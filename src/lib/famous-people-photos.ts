// Import all celebrity photos
import albertEinstein from "@/assets/famous-people/albert-einstein.jpg";
import beyonce from "@/assets/famous-people/beyonce.jpg";
import elonMusk from "@/assets/famous-people/elon-musk.jpg";
import barackObama from "@/assets/famous-people/barack-obama.jpg";
import taylorSwift from "@/assets/famous-people/taylor-swift.jpg";
import cristianoRonaldo from "@/assets/famous-people/cristiano-ronaldo.jpg";
import lionelMessi from "@/assets/famous-people/lionel-messi.jpg";
import arianaGrande from "@/assets/famous-people/ariana-grande.jpg";
import billGates from "@/assets/famous-people/bill-gates.jpg";
import oprahWinfrey from "@/assets/famous-people/oprah-winfrey.jpg";
import lebronJames from "@/assets/famous-people/lebron-james.jpg";
import rihanna from "@/assets/famous-people/rihanna.jpg";
import drake from "@/assets/famous-people/drake.jpg";
import markZuckerberg from "@/assets/famous-people/mark-zuckerberg.jpg";
import kimKardashian from "@/assets/famous-people/kim-kardashian.jpg";
import dwayneJohnson from "@/assets/famous-people/dwayne-johnson.jpg";
import emmaChamberlain from "@/assets/famous-people/emma-chamberlain.jpg";
import jeffBezos from "@/assets/famous-people/jeff-bezos.jpg";
import leonardoDiCaprio from "@/assets/famous-people/leonardo-dicaprio.jpg";
import serenaWilliams from "@/assets/famous-people/serena-williams.jpg";

// Map celebrity names to their photos
export const famousPeoplePhotos: Record<string, string> = {
  "Albert Einstein": albertEinstein,
  "Beyoncé": beyonce,
  "Elon Musk": elonMusk,
  "Barack Obama": barackObama,
  "Taylor Swift": taylorSwift,
  "Cristiano Ronaldo": cristianoRonaldo,
  "Lionel Messi": lionelMessi,
  "Ariana Grande": arianaGrande,
  "Bill Gates": billGates,
  "Oprah Winfrey": oprahWinfrey,
  "LeBron James": lebronJames,
  "Rihanna": rihanna,
  "Drake": drake,
  "Mark Zuckerberg": markZuckerberg,
  "Kim Kardashian": kimKardashian,
  "Dwayne Johnson": dwayneJohnson,
  "Emma Chamberlain": emmaChamberlain,
  "Jeff Bezos": jeffBezos,
  "Leonardo DiCaprio": leonardoDiCaprio,
  "Serena Williams": serenaWilliams,
};

// Helper function to get photo URL for a celebrity
export const getCelebrityPhoto = (name: string): string | null => {
  return famousPeoplePhotos[name] || null;
};
