export interface Celebrity {
  id: string;
  slug: string;
  name: string;
  dateOfBirth: string;
  placeOfBirth: string;
  profession: string;
  zodiacSign: string;
  photoUrl: string;
  biography: string;
  careerHighlights: string[];
  metaDescription: string;
}

export const featuredCelebrities: Celebrity[] = [
  {
    id: "1",
    slug: "tom-hanks",
    name: "Tom Hanks",
    dateOfBirth: "1956-07-09",
    placeOfBirth: "Concord, California, USA",
    profession: "Actor, Producer, Director",
    zodiacSign: "Cancer",
    photoUrl: "/src/assets/celebrities/tom-hanks.jpg",
    biography: `Tom Hanks is an American actor and filmmaker widely regarded as one of the greatest actors of all time. Known for his compelling performances and remarkable versatility, Hanks has become a cultural icon through his roles in some of cinema's most beloved films. Born in Concord, California, Hanks developed an early interest in acting during his high school years. After studying theater at California State University, Sacramento, he moved to New York City to pursue his acting career professionally.

Hanks first gained national attention with the television sitcom "Bosom Buddies" (1980-1982) and the comedy film "Splash" (1984), which established him as a talented comedic actor. However, it was his dramatic turn in "Philadelphia" (1993) that showcased his dramatic range, earning him his first Academy Award for Best Actor. He won his second consecutive Oscar the following year for his iconic performance in "Forrest Gump" (1994), cementing his status as one of Hollywood's most respected actors.

Throughout his career, Hanks has demonstrated an exceptional ability to portray ordinary people in extraordinary circumstances, bringing authenticity and emotional depth to every role. His collaborations with director Steven Spielberg, including "Saving Private Ryan" (1998), "Catch Me If You Can" (2002), and "Bridge of Spies" (2015), have resulted in some of cinema's most memorable moments. Beyond acting, Hanks has also found success as a producer and director, contributing to numerous acclaimed projects.

Hanks is known not only for his professional achievements but also for his genuine, down-to-earth personality and philanthropic efforts. He has been honored with numerous awards throughout his career, including the Presidential Medal of Freedom, and continues to be one of the most bankable and beloved actors in Hollywood. His enduring appeal comes from his talent for making audiences believe in his characters and connect with their humanity.`,
    careerHighlights: [
      "Two-time Academy Award winner for Best Actor (Philadelphia, Forrest Gump)",
      "Starred in blockbuster hits including Saving Private Ryan, Cast Away, and The Green Mile",
      "Voice of Woody in the beloved Toy Story franchise",
      "Received the Presidential Medal of Freedom in 2016",
      "Golden Globe Cecil B. DeMille Award recipient",
      "Producer of acclaimed series Band of Brothers and The Pacific",
      "Inducted into the California Hall of Fame"
    ],
    metaDescription: "Tom Hanks - American actor, producer, and director. Born July 9, 1956. Two-time Oscar winner known for Forrest Gump, Philadelphia, and Saving Private Ryan."
  },
  {
    id: "2",
    slug: "taylor-swift",
    name: "Taylor Swift",
    dateOfBirth: "1989-12-13",
    placeOfBirth: "West Reading, Pennsylvania, USA",
    profession: "Singer-Songwriter, Producer",
    zodiacSign: "Sagittarius",
    photoUrl: "/src/assets/celebrities/taylor-swift.jpg",
    biography: `Taylor Swift is an American singer-songwriter who has become one of the most influential and successful artists of her generation. Born in West Reading, Pennsylvania, Swift showed an early interest in music and began performing in local talent competitions and events as a child. At age 14, she moved with her family to Nashville, Tennessee, to pursue a career in country music, making her the youngest artist ever signed by Sony/ATV Music publishing house.

Swift released her self-titled debut album in 2006 at age 16, which was met with critical and commercial success. Her ability to write deeply personal, narrative-driven songs resonated with audiences, particularly young women, and established her as a fresh voice in country music. Albums like "Fearless" (2008) and "Speak Now" (2010) cemented her status as a country music star, with "Fearless" winning the Grammy for Album of the Year.

The turning point in Swift's career came with her transition from country to pop music, beginning with the album "Red" (2012) and fully realized with "1989" (2014). This reinvention proved enormously successful, with "1989" becoming one of the best-selling albums of the decade. Swift continued to evolve her sound with subsequent albums including "Reputation" (2017), "Lover" (2019), and the surprise indie-folk albums "Folklore" and "Evermore" (2020), both recorded during the COVID-19 pandemic.

Beyond her musical accomplishments, Swift has become known for her business acumen, particularly her advocacy for artists' rights and her decision to re-record her early albums to maintain ownership of her master recordings. Her "Eras Tour" (2023-2024) became the highest-grossing concert tour of all time. Swift's influence extends beyond music into fashion, philanthropy, and popular culture, making her one of the most powerful figures in the entertainment industry.`,
    careerHighlights: [
      "14-time Grammy Award winner including four Album of the Year awards",
      "Highest-grossing concert tour of all time with The Eras Tour",
      "First artist to occupy entire top 10 of Billboard Hot 100 simultaneously",
      "Named Time Person of the Year 2023",
      "Over 200 million records sold worldwide",
      "Billboard's Woman of the Decade (2010s)",
      "Youngest artist to win Album of the Year Grammy"
    ],
    metaDescription: "Taylor Swift - American singer-songwriter. Born December 13, 1989. 14-time Grammy winner known for albums Fearless, 1989, and Folklore."
  },
  {
    id: "3",
    slug: "elon-musk",
    name: "Elon Musk",
    dateOfBirth: "1971-06-28",
    placeOfBirth: "Pretoria, South Africa",
    profession: "Entrepreneur, Engineer, Inventor",
    zodiacSign: "Cancer",
    photoUrl: "/src/assets/celebrities/elon-musk.jpg",
    biography: `Elon Musk is a business magnate, entrepreneur, and engineer who has become one of the most influential and controversial figures in technology and business. Born in Pretoria, South Africa, Musk displayed an early aptitude for technology and entrepreneurship. At age 12, he created and sold a video game called Blastar. He moved to Canada at age 17 and later to the United States, where he attended the University of Pennsylvania, earning degrees in economics and physics.

Musk's entrepreneurial journey began in the mid-1990s with Zip2, a web software company he co-founded with his brother Kimbal. After selling Zip2, he co-founded X.com, which later became PayPal and was sold to eBay for $1.5 billion in 2002. These early successes provided the capital for Musk's more ambitious ventures. In 2002, he founded SpaceX with the goal of reducing space transportation costs and enabling the colonization of Mars. Despite initial setbacks, SpaceX has achieved numerous milestones, including the first privately funded spacecraft to reach orbit and the development of reusable rockets.

In 2004, Musk joined Tesla Motors (now Tesla, Inc.) as chairman and later became CEO and product architect. Under his leadership, Tesla has revolutionized the automotive industry by making electric vehicles desirable and practical, forcing traditional automakers to accelerate their own electric vehicle programs. Musk has also been involved in other ventures including Neuralink (brain-computer interfaces), The Boring Company (tunnel construction and infrastructure), and the acquisition of Twitter (now X) in 2022.

Musk is known for his ambitious vision of the future, including sustainable energy, space exploration, and artificial intelligence. His management style and public persona have been both praised and criticized, with supporters viewing him as a visionary innovator and critics pointing to his controversial statements and leadership decisions. Regardless of opinion, his impact on multiple industries is undeniable, making him one of the most significant figures of the 21st century.`,
    careerHighlights: [
      "CEO of Tesla and SpaceX",
      "World's wealthiest person (multiple years)",
      "Revolutionized electric vehicle industry with Tesla",
      "First private company to send astronauts to space (SpaceX)",
      "Developed reusable rocket technology",
      "Founded Neuralink and The Boring Company",
      "Acquired Twitter/X in 2022"
    ],
    metaDescription: "Elon Musk - Entrepreneur and CEO of Tesla and SpaceX. Born June 28, 1971. Known for revolutionizing electric vehicles and commercial space travel."
  },
  {
    id: "4",
    slug: "leonardo-dicaprio",
    name: "Leonardo DiCaprio",
    dateOfBirth: "1974-11-11",
    placeOfBirth: "Los Angeles, California, USA",
    profession: "Actor, Producer, Environmental Activist",
    zodiacSign: "Scorpio",
    photoUrl: "/src/assets/celebrities/leonardo-dicaprio.jpg",
    biography: `Leonardo DiCaprio is an American actor and film producer who has become one of the most acclaimed and recognizable actors of his generation. Born in Los Angeles, California, DiCaprio began his career appearing in television commercials and educational films before landing recurring roles on television shows. His breakthrough came with his performance in "This Boy's Life" (1993) alongside Robert De Niro, followed by critical acclaim for "What's Eating Gilbert Grape" (1993), which earned him his first Academy Award nomination at age 19.

DiCaprio achieved global superstardom with his role as Jack Dawson in James Cameron's "Titanic" (1997), which became the highest-grossing film of its time and made him one of the most famous actors in the world. Rather than pursuing typical leading man roles, DiCaprio chose to work with respected directors on challenging projects. His collaborations with Martin Scorsese have been particularly fruitful, including films like "Gangs of New York" (2002), "The Aviator" (2004), "The Departed" (2006), "Shutter Island" (2010), and "The Wolf of Wall Street" (2013).

Throughout his career, DiCaprio has demonstrated remarkable range and commitment to his craft, often undergoing physical transformations and intensive preparation for roles. He has worked with many of cinema's greatest directors including Christopher Nolan ("Inception"), Quentin Tarantino ("Django Unchained," "Once Upon a Time in Hollywood"), and Alejandro González Iñárritu ("The Revenant"), for which he finally won his first Academy Award for Best Actor in 2016.

Beyond acting, DiCaprio is a dedicated environmental activist. He established the Leonardo DiCaprio Foundation in 1998, which has donated millions to environmental causes. He has produced and narrated several environmental documentaries and uses his platform to raise awareness about climate change. His commitment to environmental issues has made him not just a Hollywood icon, but also a prominent voice in the fight against climate change.`,
    careerHighlights: [
      "Academy Award winner for Best Actor (The Revenant)",
      "Six Oscar nominations throughout career",
      "Starred in highest-grossing film of the 1990s (Titanic)",
      "Multiple collaborations with Martin Scorsese",
      "Golden Globe winner (three times)",
      "Established Leonardo DiCaprio Foundation for environmental causes",
      "UN Messenger of Peace with focus on climate change"
    ],
    metaDescription: "Leonardo DiCaprio - American actor and environmental activist. Born November 11, 1974. Oscar winner known for Titanic, The Revenant, and Inception."
  },
  {
    id: "5",
    slug: "selena-gomez",
    name: "Selena Gomez",
    dateOfBirth: "1992-07-22",
    placeOfBirth: "Grand Prairie, Texas, USA",
    profession: "Singer, Actress, Producer, Entrepreneur",
    zodiacSign: "Cancer",
    photoUrl: "/src/assets/celebrities/selena-gomez.jpg",
    biography: `Selena Gomez is an American singer, actress, producer, and businesswoman who has built a multifaceted career spanning music, television, film, and business. Born in Grand Prairie, Texas, Gomez began her entertainment career at a young age, appearing on the children's television series "Barney & Friends" alongside Demi Lovato. Her breakthrough came when Disney Channel cast her as the lead in "Wizards of Waverly Place" (2007-2012), which became one of the network's most successful series and launched her to stardom among young audiences.

While achieving success as an actress, Gomez simultaneously pursued a music career. She formed the band Selena Gomez & the Scene, releasing three albums between 2009 and 2011. As a solo artist, she has released albums including "Stars Dance" (2013), "Revival" (2015), and "Rare" (2020), showcasing her evolution from teen pop to more mature pop and dance music. Her songs have topped charts worldwide, and she has become one of the most-followed people on social media, using her platform to connect with fans and advocate for important causes.

Gomez has been remarkably open about her personal struggles, including her battles with lupus, anxiety, and depression. Her willingness to discuss mental health issues has helped reduce stigma and inspired many of her fans. In 2017, she underwent a kidney transplant due to complications from lupus, bringing further attention to the disease. This openness and vulnerability have endeared her to millions and established her as a role model for young people dealing with similar challenges.

Beyond entertainment, Gomez has expanded into business and production. She launched her cosmetics line, Rare Beauty, in 2020, which has been praised for its inclusive approach and commitment to mental health advocacy. As a producer, she has been involved in projects like "13 Reasons Why" and the acclaimed Hulu series "Only Murders in the Building," in which she also stars. Her entrepreneurial spirit and artistic versatility continue to define her evolving career.`,
    careerHighlights: [
      "Most-followed woman on Instagram (for multiple years)",
      "Billboard Woman of the Year 2017",
      "Multiple platinum albums and singles",
      "Emmy-nominated producer for 13 Reasons Why",
      "Founded Rare Beauty cosmetics line",
      "Star of hit series Only Murders in the Building",
      "UNICEF Ambassador, youngest ever appointed"
    ],
    metaDescription: "Selena Gomez - American singer, actress, and entrepreneur. Born July 22, 1992. Known for Wizards of Waverly Place, music career, and Rare Beauty."
  },
  {
    id: "6",
    slug: "cristiano-ronaldo",
    name: "Cristiano Ronaldo",
    dateOfBirth: "1985-02-05",
    placeOfBirth: "Funchal, Madeira, Portugal",
    profession: "Professional Footballer",
    zodiacSign: "Aquarius",
    photoUrl: "/src/assets/celebrities/cristiano-ronaldo.jpg",
    biography: `Cristiano Ronaldo dos Santos Aveiro is a Portuguese professional footballer widely regarded as one of the greatest players of all time. Born in Funchal, Madeira, Portugal, Ronaldo grew up in a working-class family and showed exceptional football talent from a young age. At age 12, he left his family to join Sporting CP's academy in Lisbon, sacrificing a normal childhood to pursue his football dreams. His dedication and natural ability quickly became evident, and by age 16, he was promoted to Sporting's first team.

Ronaldo's professional career took off when Manchester United signed him in 2003 at age 18. Under the management of Sir Alex Ferguson, he developed from a tricky winger into one of the world's most complete and deadly forwards. During six seasons at Manchester United, he won three Premier League titles, one UEFA Champions League, and his first Ballon d'Or in 2008. His time in England transformed him into a global superstar and established his work ethic and competitive mentality that would define his career.

In 2009, Ronaldo transferred to Real Madrid for a then-world record fee of £80 million. His nine years at Real Madrid were extraordinary, becoming the club's all-time leading scorer with 450 goals in 438 appearances. He won four Champions League titles and four more Ballon d'Or awards, establishing one of football's greatest rivalries with Lionel Messi of Barcelona. After Real Madrid, he joined Juventus in 2018, returned to Manchester United in 2021, and currently plays for Al Nassr in Saudi Arabia while continuing to captain the Portuguese national team.

Beyond his club success, Ronaldo has led Portugal to historic achievements, including winning the UEFA European Championship in 2016 and the UEFA Nations League in 2019. He is the all-time leading international goal scorer in men's football. Off the field, Ronaldo has built a business empire including the CR7 brand, hotels, and various investments. His social media presence is unmatched among athletes, with hundreds of millions of followers across platforms. His dedication to physical fitness and longevity has allowed him to continue performing at the highest level well into his late 30s.`,
    careerHighlights: [
      "Five-time Ballon d'Or winner",
      "All-time leading international goal scorer in men's football",
      "Five UEFA Champions League titles",
      "Led Portugal to Euro 2016 and Nations League 2019 victories",
      "Over 850 career goals for club and country",
      "Most followed person on social media platforms",
      "Multiple league titles in England, Spain, and Italy"
    ],
    metaDescription: "Cristiano Ronaldo - Portuguese professional footballer. Born February 5, 1985. Five-time Ballon d'Or winner and all-time international leading scorer."
  },
  {
    id: "7",
    slug: "beyonce",
    name: "Beyoncé",
    dateOfBirth: "1981-09-04",
    placeOfBirth: "Houston, Texas, USA",
    profession: "Singer, Songwriter, Actress, Producer",
    zodiacSign: "Virgo",
    photoUrl: "/src/assets/celebrities/beyonce.jpg",
    biography: `Beyoncé Giselle Knowles-Carter is an American singer, songwriter, actress, and businesswoman who has become one of the most influential and successful artists in music history. Born in Houston, Texas, Beyoncé displayed singing and dancing talent from an early age, competing in various talent shows as a child. She rose to fame in the late 1990s as the lead singer of Destiny's Child, one of the best-selling girl groups of all time. The group's success provided the foundation for what would become one of the most remarkable solo careers in music.

Beyoncé launched her solo career with the album "Dangerously in Love" (2003), which debuted at number one and won five Grammy Awards. The album established her as a solo superstar and showcased her vocal abilities and artistic vision. She continued to evolve as an artist with subsequent albums including "B'Day" (2006), "I Am... Sasha Fierce" (2008), and "4" (2011), each demonstrating her growth and willingness to experiment with different musical styles while maintaining commercial success.

The visual album "Beyoncé" (2013), released without prior announcement, marked a turning point in her career and the music industry. This innovative release strategy and the album's intimate, complex content showcased Beyoncé as not just a performer but a complete artist with full creative control. She followed this with "Lemonade" (2016), a deeply personal exploration of Black womanhood, betrayal, and empowerment that was accompanied by a groundbreaking visual film. Her subsequent albums "Homecoming" (2019), "Renaissance" (2022), and "Cowboy Carter" (2024) have continued to push artistic boundaries and celebrate Black culture.

Beyond music, Beyoncé has succeeded in film, fashion, and business. She has starred in movies including "Dreamgirls" and "The Lion King," launched successful fashion lines, and built a business empire. Her performances, particularly her headline-making Coachella performance in 2018 (dubbed "Beychella"), have set new standards for live entertainment. She uses her platform to advocate for social justice, particularly issues affecting the Black community and women. Beyoncé's influence extends far beyond music, making her a cultural icon and one of the most important artists of the 21st century.`,
    careerHighlights: [
      "Most Grammy-awarded artist of all time with 32 wins",
      "Over 200 million records sold worldwide",
      "First Black woman to headline Coachella",
      "Groundbreaking visual albums including Lemonade and Beyoncé",
      "Successful fashion lines and business ventures",
      "Time's 100 Most Influential People multiple times",
      "Cultural icon and advocate for Black empowerment"
    ],
    metaDescription: "Beyoncé - American singer, songwriter, and cultural icon. Born September 4, 1981. Most Grammy-awarded artist known for Lemonade and Renaissance."
  },
  {
    id: "8",
    slug: "bill-gates",
    name: "Bill Gates",
    dateOfBirth: "1955-10-28",
    placeOfBirth: "Seattle, Washington, USA",
    profession: "Business Magnate, Software Developer, Philanthropist",
    zodiacSign: "Scorpio",
    photoUrl: "/src/assets/celebrities/bill-gates.jpg",
    biography: `William Henry Gates III, known as Bill Gates, is an American business magnate, software developer, investor, and philanthropist who co-founded Microsoft Corporation and became one of the most influential figures in the personal computer revolution. Born in Seattle, Washington, Gates showed an early aptitude for mathematics and logic. At age 13, he began programming computers and wrote his first software program. He attended Harvard University but dropped out in 1975 to pursue his vision of putting "a computer on every desk and in every home."

In 1975, Gates and his childhood friend Paul Allen founded Microsoft, initially developing software for the Altair 8800, an early personal computer. The company's breakthrough came in 1980 when IBM selected Microsoft to provide an operating system for its first personal computer. Gates bought an existing operating system, modified it, and licensed it to IBM as MS-DOS. Crucially, Microsoft retained the rights to license the system to other manufacturers, a decision that proved instrumental to the company's success as the PC industry exploded.

Under Gates' leadership, Microsoft launched Windows in 1985, which eventually became the dominant operating system worldwide. He served as CEO until 2000 and chairman until 2014, transforming Microsoft into one of the world's most valuable companies. His business strategies, while incredibly successful, were also controversial, leading to antitrust lawsuits. At the height of his success in the late 1990s, Gates became the world's wealthiest person, a position he held for many years. His technical knowledge, business acumen, and competitive drive made him an icon of the technology revolution.

In 2000, Gates and his then-wife Melinda French Gates established the Bill & Melinda Gates Foundation, which has become one of the world's largest private charitable foundations. Since stepping down from day-to-day operations at Microsoft, Gates has focused increasingly on philanthropy, addressing global issues including poverty, disease, and education. The foundation has been particularly active in global health initiatives, contributing billions to fight diseases like malaria, HIV/AIDS, and polio. More recently, Gates has become a prominent voice on climate change and pandemic preparedness, using his resources and platform to fund research and advocate for solutions to these global challenges.`,
    careerHighlights: [
      "Co-founder of Microsoft Corporation",
      "World's wealthiest person (multiple years)",
      "Revolutionized personal computing with Windows operating system",
      "Established Bill & Melinda Gates Foundation with over $50 billion endowment",
      "Presidential Medal of Freedom recipient",
      "Pledged majority of wealth to philanthropy through Giving Pledge",
      "Leading voice on global health and climate change"
    ],
    metaDescription: "Bill Gates - Co-founder of Microsoft and philanthropist. Born October 28, 1955. Known for revolutionizing personal computing and global health initiatives."
  },
  {
    id: "9",
    slug: "dwayne-johnson",
    name: "Dwayne Johnson",
    dateOfBirth: "1972-05-02",
    placeOfBirth: "Hayward, California, USA",
    profession: "Actor, Producer, Former Professional Wrestler",
    zodiacSign: "Taurus",
    photoUrl: "/src/assets/celebrities/dwayne-johnson.jpg",
    biography: `Dwayne Douglas Johnson, also known by his ring name "The Rock," is an American actor, producer, businessman, and former professional wrestler who has become one of the most recognizable and bankable stars in entertainment. Born into a family of wrestlers in Hayward, California, Johnson initially pursued a career in football, playing at the University of Miami where he was part of the 1991 national championship team. After a brief stint in professional football, he followed his family's legacy and entered professional wrestling.

Johnson joined the WWE (then WWF) in 1996 and quickly became one of the most charismatic and popular performers in the company's history. As "The Rock," he won multiple championships and became known for his electrifying persona, catchphrases ("Can you smell what The Rock is cooking?"), and exceptional mic skills. His larger-than-life personality and natural charisma made him a crossover star who transcended wrestling. During his wrestling career from 1996 to 2004 (with occasional returns afterward), he became one of the biggest draws in WWE history and helped usher in the "Attitude Era," the company's most successful period.

Transitioning from wrestling to acting, Johnson appeared in "The Mummy Returns" (2001) and his first starring role in "The Scorpion King" (2002). Despite initial skepticism about wrestlers-turned-actors, Johnson's charm, work ethic, and willingness to showcase his personality on screen won over audiences and critics alike. He built a successful film career with roles in action franchises like "Fast & Furious," family films like "Moana," and blockbusters like "Jumanji: Welcome to the Jungle" and "San Andreas." His versatility in both action and comedy roles has made him one of Hollywood's most consistent box office draws.

Beyond entertainment, Johnson has built a business empire including his production company Seven Bucks Productions, his tequila brand Teremana, and energy drink ZOA. His social media presence is massive, with hundreds of millions of followers across platforms, which he uses to connect with fans and promote his various ventures. Known for his incredible work ethic, often starting his days at 4 AM for workouts, Johnson embodies a motivational, can-do attitude that resonates with people worldwide. He has become not just an entertainer but an inspirational figure who built his success through determination and authenticity.`,
    careerHighlights: [
      "Highest-paid actor in Hollywood (multiple years)",
      "10-time WWE world champion",
      "Star of Fast & Furious franchise",
      "Blockbuster success in Jumanji films",
      "Founded Seven Bucks Productions",
      "One of most followed people on social media",
      "Time's 100 Most Influential People in the World"
    ],
    metaDescription: "Dwayne 'The Rock' Johnson - Actor and former WWE champion. Born May 2, 1972. Hollywood's highest-paid actor known for Fast & Furious and Jumanji."
  },
  {
    id: "10",
    slug: "emma-watson",
    name: "Emma Watson",
    dateOfBirth: "1990-04-15",
    placeOfBirth: "Paris, France",
    profession: "Actress, Activist",
    zodiacSign: "Aries",
    photoUrl: "/src/assets/celebrities/emma-watson.jpg",
    biography: `Emma Charlotte Duerre Watson is a British actress and activist who rose to worldwide fame as Hermione Granger in the Harry Potter film series and has since become a prominent advocate for women's rights and education. Born in Paris to English parents, Watson moved to England at age five. At age nine, with no professional acting experience, she was cast as Hermione Granger after eight auditions, beating thousands of other candidates. Her portrayal of the intelligent, brave, and loyal Hermione defined her childhood and adolescence, as she appeared in all eight Harry Potter films from 2001 to 2011.

Growing up in the spotlight presented unique challenges, but Watson handled the transition from child star to adult actress with grace and intelligence. Despite her acting commitments, she prioritized education, attending Brown University and graduating with a degree in English literature in 2014. This commitment to education even while maintaining a successful acting career demonstrated her determination to remain grounded and intellectually engaged beyond Hollywood.

After Harry Potter concluded, Watson successfully transitioned to more mature roles, appearing in films such as "The Perks of Being a Wallflower" (2012), "The Bling Ring" (2013), and Disney's live-action "Beauty and the Beast" (2017), which became one of the highest-grossing films of the year. She has been selective with her roles, choosing projects that align with her values and offer meaningful artistic challenges. Her performance in "Little Women" (2019) as Meg March showcased her continued growth as an actress.

Perhaps equally important as her acting work is Watson's activism, particularly in feminism and sustainable fashion. In 2014, she was appointed UN Women Goodwill Ambassador and launched the HeForShe campaign, which encourages men to advocate for gender equality. Her powerful speech at the UN garnered global attention and established her as a serious activist. She serves on the board of directors for Kering, a luxury fashion group, promoting sustainable fashion practices. Watson has used her platform and influence to advocate for social justice, education, and environmental causes, proving that celebrity can be leveraged for meaningful change.`,
    careerHighlights: [
      "Starred as Hermione Granger in all Harry Potter films",
      "UN Women Goodwill Ambassador",
      "Launched HeForShe campaign for gender equality",
      "Graduated from Brown University with English literature degree",
      "Starred in live-action Beauty and the Beast ($1.2 billion worldwide)",
      "Board member at Kering for sustainable fashion",
      "Time's 100 Most Influential People in the World"
    ],
    metaDescription: "Emma Watson - British actress and activist. Born April 15, 1990. Known for Harry Potter films, UN Women ambassador, and gender equality advocacy."
  }
];

// Category-based organization
export const categorizedCelebrities = {
  actors: ["tom-hanks", "leonardo-dicaprio", "dwayne-johnson", "emma-watson"],
  musicians: ["taylor-swift", "beyonce", "selena-gomez"],
  athletes: ["cristiano-ronaldo"],
  techInnovators: ["elon-musk", "bill-gates"],
  worldLeaders: [],
  artists: [],
  scientists: [],
  internetPersonalities: []
};

// Month-based organization
export const monthCelebrities = {
  january: [],
  february: ["cristiano-ronaldo"],
  march: [],
  april: ["emma-watson"],
  may: ["dwayne-johnson"],
  june: ["elon-musk"],
  july: ["tom-hanks", "selena-gomez"],
  august: [],
  september: ["beyonce"],
  october: ["bill-gates"],
  november: ["leonardo-dicaprio"],
  december: ["taylor-swift"]
};
