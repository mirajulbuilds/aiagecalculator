export interface FamousBirthday {
  id: string;
  name: string;
  dob: string; // YYYY-MM-DD format
  birthPlace: string;
  country: string;
  occupation: string;
  bio: string;
  imageUrl: string;
  socialLinks?: {
    instagram?: string;
    twitter?: string;
    youtube?: string;
    facebook?: string;
    website?: string;
  };
  popularityScore: number; // for trending sort (0-100)
  trending?: boolean; // for today's trending badge
}

// Placeholder examples - add your celebrity data here
export const famousBirthdays: FamousBirthday[] = [
  {
    id: "1",
    name: "Emma Watson",
    dob: "1990-04-15",
    birthPlace: "Paris",
    country: "France",
    occupation: "Actress & Activist",
    bio: "Best known for playing Hermione Granger in the Harry Potter film series. She is also a prominent advocate for women's rights and education.",
    imageUrl: "/placeholder.svg",
    socialLinks: {
      instagram: "https://instagram.com/emmawatson",
      twitter: "https://twitter.com/emmawatson"
    },
    popularityScore: 95,
    trending: true
  },
  {
    id: "2",
    name: "Leonardo DiCaprio",
    dob: "1974-11-11",
    birthPlace: "Los Angeles",
    country: "United States",
    occupation: "Actor & Environmental Activist",
    bio: "Academy Award-winning actor known for roles in Titanic, Inception, and The Revenant. He is also a dedicated environmental activist and philanthropist.",
    imageUrl: "/placeholder.svg",
    socialLinks: {
      instagram: "https://instagram.com/leonardodicaprio",
      facebook: "https://facebook.com/leonardodicaprio"
    },
    popularityScore: 98,
    trending: true
  },
  {
    id: "3",
    name: "Taylor Swift",
    dob: "1989-12-13",
    birthPlace: "Reading",
    country: "United States",
    occupation: "Singer-Songwriter",
    bio: "Multi-Grammy Award winning artist known for her narrative songwriting and record-breaking albums including 1989, Folklore, and Midnights.",
    imageUrl: "/placeholder.svg",
    socialLinks: {
      instagram: "https://instagram.com/taylorswift",
      twitter: "https://twitter.com/taylorswift13",
      website: "https://taylorswift.com"
    },
    popularityScore: 100,
    trending: true
  },
  {
    id: "4",
    name: "Dwayne Johnson",
    dob: "1972-05-02",
    birthPlace: "Hayward",
    country: "United States",
    occupation: "Actor & Former Wrestler",
    bio: "Also known as The Rock, he is one of the highest-paid actors in the world, known for action films and his charismatic personality.",
    imageUrl: "/placeholder.svg",
    socialLinks: {
      instagram: "https://instagram.com/therock",
      twitter: "https://twitter.com/therock"
    },
    popularityScore: 97,
    trending: false
  },
  {
    id: "5",
    name: "Beyoncé",
    dob: "1981-09-04",
    birthPlace: "Houston",
    country: "United States",
    occupation: "Singer & Performer",
    bio: "Iconic singer, songwriter, and performer with numerous Grammy Awards. Known as Queen Bey, she has shaped modern pop and R&B music.",
    imageUrl: "/placeholder.svg",
    socialLinks: {
      instagram: "https://instagram.com/beyonce",
      website: "https://beyonce.com"
    },
    popularityScore: 99,
    trending: false
  },
  {
    id: "6",
    name: "Cristiano Ronaldo",
    dob: "1985-02-05",
    birthPlace: "Funchal",
    country: "Portugal",
    occupation: "Professional Footballer",
    bio: "One of the greatest football players of all time, with five Ballon d'Or awards and numerous records across multiple top European leagues.",
    imageUrl: "/placeholder.svg",
    socialLinks: {
      instagram: "https://instagram.com/cristiano",
      twitter: "https://twitter.com/cristiano",
      facebook: "https://facebook.com/cristiano"
    },
    popularityScore: 96,
    trending: false
  }
];
