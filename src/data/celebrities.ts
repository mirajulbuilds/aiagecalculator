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
    photoUrl: "/celebrities/tom-hanks.jpg",
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
    photoUrl: "/celebrities/taylor-swift.jpg",
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
    photoUrl: "/celebrities/elon-musk.jpg",
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
    photoUrl: "/celebrities/leonardo-dicaprio.jpg",
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
    photoUrl: "/celebrities/selena-gomez.jpg",
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
    photoUrl: "/celebrities/cristiano-ronaldo.jpg",
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
    photoUrl: "/celebrities/beyonce.jpg",
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
    photoUrl: "/celebrities/bill-gates.jpg",
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
    photoUrl: "/celebrities/dwayne-johnson.jpg",
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
    photoUrl: "/celebrities/emma-watson.jpg",
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
  },
  {
    id: "11",
    slug: "ariana-grande",
    name: "Ariana Grande",
    dateOfBirth: "1993-06-26",
    placeOfBirth: "Boca Raton, Florida, USA",
    profession: "Singer, Songwriter, Actress",
    zodiacSign: "Cancer",
    photoUrl: "/src/assets/celebrities/ariana-grande.jpg",
    biography: `Ariana Grande-Butera is an American singer, songwriter, and actress who has become one of the most successful pop artists of her generation. Born in Boca Raton, Florida, Grande began her career in theater before landing a role on the Nickelodeon series "Victorious" in 2010. Her powerful four-octave vocal range, inspired by Mariah Carey and Whitney Houston, quickly distinguished her from other young pop stars. After "Victorious" ended, she transitioned to music full-time, releasing her debut album "Yours Truly" in 2013, which debuted at number one on the Billboard 200.

Grande's subsequent albums, including "My Everything" (2014), "Dangerous Woman" (2016), "Sweetener" (2018), "Thank U, Next" (2019), and "Positions" (2020), have showcased her artistic evolution and cemented her status as a pop icon. She has become known for her incredible vocal ability, signature high ponytail, and honest songwriting about relationships, mental health, and personal growth. Her music has earned her numerous awards, including two Grammy Awards, and she has broken multiple streaming and chart records.

Beyond music, Grande has been recognized for her activism and philanthropy, particularly following the tragic Manchester Arena bombing at her concert in 2017. Her response to the tragedy, including organizing the "One Love Manchester" benefit concert, demonstrated her resilience and compassion. She continues to use her platform to advocate for mental health awareness, LGBTQ+ rights, and social justice causes.`,
    careerHighlights: [
      "Two-time Grammy Award winner",
      "Six number-one albums on Billboard 200",
      "Most streamed female artist on Spotify",
      "Billboard's Woman of the Year 2018",
      "Time's 100 Most Influential People",
      "Multiple American Music Awards and MTV VMAs",
      "Organized One Love Manchester benefit concert"
    ],
    metaDescription: "Ariana Grande - American singer and actress. Born June 26, 1993. Grammy winner known for powerful vocals and hits like 'Thank U, Next' and '7 Rings'."
  },
  {
    id: "12",
    slug: "lebron-james",
    name: "LeBron James",
    dateOfBirth: "1984-12-30",
    placeOfBirth: "Akron, Ohio, USA",
    profession: "Professional Basketball Player, Producer",
    zodiacSign: "Capricorn",
    photoUrl: "/src/assets/celebrities/lebron-james.jpg",
    biography: `LeBron Raymone James is an American professional basketball player widely considered one of the greatest players in NBA history. Born in Akron, Ohio, James overcame a difficult childhood to become a basketball prodigy at St. Vincent-St. Mary High School, where he gained national attention and appeared on the cover of Sports Illustrated as "The Chosen One" at age 17. He was selected first overall by the Cleveland Cavaliers in the 2003 NBA Draft, immediately living up to the enormous expectations placed upon him.

James' career has been marked by sustained excellence over two decades. He has won four NBA championships with three different teams (Miami Heat, Cleveland Cavaliers, and Los Angeles Lakers), earned four NBA MVP awards, and made 19 All-Star appearances. In 2016, he fulfilled his promise to bring a championship to Cleveland, leading the Cavaliers back from a 3-1 deficit against the Golden State Warriors in one of the greatest NBA Finals performances ever. In 2023, he became the NBA's all-time leading scorer, surpassing Kareem Abdul-Jabbar's long-standing record.

Beyond basketball, James has built a media and business empire. He founded SpringHill Entertainment, which produces films and television shows, and has appeared in movies including "Trainwreck" and "Space Jam: A New Legacy." His business ventures include Blaze Pizza, Liverpool F.C. ownership stake, and various endorsement deals. Most importantly, through his LeBron James Family Foundation, he has invested millions in education, including opening the I PROMISE School in Akron for at-risk children. His commitment to social justice and activism has made him one of sports' most influential voices.`,
    careerHighlights: [
      "Four-time NBA champion",
      "Four-time NBA MVP",
      "NBA all-time leading scorer",
      "19-time NBA All-Star",
      "Olympic gold medalist (2008, 2012)",
      "Opened I PROMISE School for at-risk youth",
      "Sports Illustrated Sportsperson of the Year"
    ],
    metaDescription: "LeBron James - American basketball player. Born December 30, 1984. Four-time NBA champion and all-time leading scorer known for dominance and activism."
  },
  {
    id: "13",
    slug: "lionel-messi",
    name: "Lionel Messi",
    dateOfBirth: "1987-06-24",
    placeOfBirth: "Rosario, Argentina",
    profession: "Professional Footballer",
    zodiacSign: "Cancer",
    photoUrl: "/src/assets/celebrities/lionel-messi.jpg",
    biography: `Lionel Andrés Messi is an Argentine professional footballer widely regarded as one of the greatest players in the history of the sport. Born in Rosario, Argentina, Messi was diagnosed with a growth hormone deficiency at age 10, which threatened his football career. FC Barcelona's youth academy, La Masia, agreed to pay for his medical treatment if he moved to Spain, a decision that changed football history. Messi joined Barcelona's youth system at age 13 and made his first-team debut at 17.

During 17 seasons with Barcelona, Messi became the club's all-time leading scorer and won an unprecedented 35 trophies, including 10 La Liga titles and four UEFA Champions League titles. His close ball control, vision, passing ability, and prolific goal-scoring made him virtually unstoppable. He won a record eight Ballon d'Or awards, cementing his place among football's immortals. His rivalry with Cristiano Ronaldo defined an era of football, with both players pushing each other to incredible heights.

In 2021, financial constraints forced Barcelona to release Messi, and he joined Paris Saint-Germain before moving to Inter Miami in 2023. His greatest achievement came in 2022 when he led Argentina to victory in the FIFA World Cup in Qatar, the one major trophy that had eluded him. The World Cup triumph solidified his legacy as perhaps the greatest player ever. Off the field, Messi is known for his humility and philanthropy through the Leo Messi Foundation, which supports access to health care and education for vulnerable children.`,
    careerHighlights: [
      "Record eight-time Ballon d'Or winner",
      "2022 FIFA World Cup champion with Argentina",
      "Barcelona's all-time leading scorer",
      "Four UEFA Champions League titles",
      "Olympic gold medalist (2008)",
      "Copa América winner (2021)",
      "Over 800 career goals for club and country"
    ],
    metaDescription: "Lionel Messi - Argentine footballer. Born June 24, 1987. Record eight-time Ballon d'Or winner and 2022 World Cup champion."
  },
  {
    id: "14",
    slug: "oprah-winfrey",
    name: "Oprah Winfrey",
    dateOfBirth: "1954-01-29",
    placeOfBirth: "Kosciusko, Mississippi, USA",
    profession: "Media Executive, Talk Show Host, Producer, Philanthropist",
    zodiacSign: "Aquarius",
    photoUrl: "/src/assets/celebrities/oprah-winfrey.jpg",
    biography: `Oprah Gail Winfrey is an American media executive, talk show host, actress, producer, and philanthropist who became one of the most influential women in the world. Born into poverty in rural Mississippi and raised in difficult circumstances, Winfrey's early life was marked by hardship and abuse. Despite these challenges, she excelled in school and won a scholarship to Tennessee State University. She began her broadcasting career in local radio and television in Nashville before moving to Chicago in 1984 to host "AM Chicago," a struggling morning show that she transformed into the highest-rated talk show in the city.

"The Oprah Winfrey Show" debuted nationally in 1986 and ran for 25 years, becoming the highest-rated television program of its kind in history. Winfrey's empathetic interview style, willingness to discuss difficult topics, and genuine connection with her audience made the show a cultural phenomenon. She expanded beyond traditional talk show topics to create a platform for important discussions about literature, spirituality, health, and social issues. Her book club selections could turn unknown authors into bestsellers, demonstrating her enormous cultural influence.

Winfrey leveraged her success to build a media empire. She founded Harpo Productions, becoming the first Black woman to own a production company. She launched O, The Oprah Magazine, co-founded the Oprah Winfrey Network (OWN), and has produced numerous films and television shows. As an actress, she received critical acclaim for roles in "The Color Purple" and "Selma." Her business acumen made her the first Black female billionaire in the United States and one of the wealthiest self-made women in America.

Her philanthropy has been equally impressive, with hundreds of millions donated to educational causes. She established the Oprah Winfrey Leadership Academy for Girls in South Africa and has funded numerous scholarships and educational initiatives. Winfrey has used her platform and resources to empower others, particularly women and girls, making her not just a media mogul but a transformative force in American culture.`,
    careerHighlights: [
      "Host of highest-rated talk show in television history",
      "First Black female billionaire in the United States",
      "Presidential Medal of Freedom recipient",
      "Founded Harpo Productions and OWN network",
      "Established Oprah Winfrey Leadership Academy for Girls",
      "Multiple Emmy Awards and honorary doctorate degrees",
      "Time's 100 Most Influential People multiple times"
    ],
    metaDescription: "Oprah Winfrey - Media executive and philanthropist. Born January 29, 1954. Talk show icon, first Black female billionaire, and cultural influencer."
  },
  {
    id: "15",
    slug: "rihanna",
    name: "Rihanna",
    dateOfBirth: "1988-02-20",
    placeOfBirth: "Saint Michael, Barbados",
    profession: "Singer, Entrepreneur, Actress",
    zodiacSign: "Pisces",
    photoUrl: "/src/assets/celebrities/rihanna.jpg",
    biography: `Robyn Rihanna Fenty is a Barbadian singer, businesswoman, and actress who has become one of the most influential and successful entertainers in the world. Born in Saint Michael, Barbados, Rihanna grew up in a modest household and began singing at a young age. At 16, she auditioned for American record producer Evan Rogers, who helped her record a demo that reached Jay-Z at Def Jam Recordings. After an audition where she sang for Jay-Z and other executives, she was signed to the label the same day.

Rihanna released her debut album "Music of the Sun" in 2005, and her career quickly accelerated. Her third album "Good Girl Gone Bad" (2007) marked her transformation into a global superstar, with hits like "Umbrella" establishing her as a pop and R&B force. Over the following years, albums including "Rated R" (2009), "Loud" (2010), "Talk That Talk" (2011), and "Anti" (2016) showcased her musical evolution and willingness to experiment with different genres. She has sold over 250 million records worldwide, making her one of the best-selling music artists of all time.

Beyond music, Rihanna has built a successful business empire that has arguably eclipsed her music career. In 2017, she launched Fenty Beauty, a cosmetics line celebrated for its inclusive range of foundation shades for all skin tones, revolutionizing the beauty industry's approach to diversity. The brand was an immediate success, valued at over $2 billion. She followed with Savage X Fenty, a lingerie line that champions body positivity and inclusivity, which went public in 2021. These ventures, along with her partnership with LVMH for the Fenty fashion house, have made her one of the wealthiest female musicians in the world.

Rihanna's influence extends beyond entertainment and business. She has been recognized for her humanitarian work, particularly through her Clara Lionel Foundation, which supports education and emergency response programs globally. In 2018, she was appointed as an ambassador by the Barbadian government to promote education, tourism, and investment. Her impact on music, fashion, beauty, and culture has made her a defining figure of 21st-century popular culture.`,
    careerHighlights: [
      "Nine Grammy Awards winner",
      "Over 250 million records sold worldwide",
      "Founded Fenty Beauty and Savage X Fenty",
      "Youngest artist to achieve 14 number-one singles on Billboard Hot 100",
      "Named world's richest female musician by Forbes",
      "National Hero of Barbados designation",
      "Performed at Super Bowl LVII Halftime Show"
    ],
    metaDescription: "Rihanna - Barbadian singer and entrepreneur. Born February 20, 1988. Grammy winner and founder of Fenty Beauty, world's richest female musician."
  },
  {
    id: "16",
    slug: "tom-cruise",
    name: "Tom Cruise",
    dateOfBirth: "1962-07-03",
    placeOfBirth: "Syracuse, New York, USA",
    profession: "Actor, Producer",
    zodiacSign: "Cancer",
    photoUrl: "/src/assets/celebrities/tom-cruise.jpg",
    biography: `Thomas Cruise Mapother IV, known as Tom Cruise, is an American actor and producer who has been one of Hollywood's most successful and enduring movie stars for over four decades. Born in Syracuse, New York, Cruise had a difficult childhood, moving frequently and dealing with dyslexia. He discovered acting in high school and moved to New York City at age 18 to pursue an acting career. His breakthrough came quickly with roles in "Risky Business" (1983) and "Top Gun" (1986), which made him a global superstar.

Throughout the 1980s and 1990s, Cruise established himself as both a box office draw and a serious actor. He worked with acclaimed directors like Martin Scorsese ("The Color of Money"), Oliver Stone ("Born on the Fourth of July," earning his first Oscar nomination), and Stanley Kubrick ("Eyes Wide Shut"). His role in "Jerry Maguire" (1996) showcased his range in romantic comedy-drama, while "Magnolia" (1999) earned him critical acclaim and his third Oscar nomination.

The "Mission: Impossible" franchise, beginning in 1996, has defined much of Cruise's later career. As both star and producer, he has made the series increasingly ambitious, performing his own dangerous stunts including climbing Dubai's Burj Khalifa, hanging from the side of a flying airplane, and performing a HALO jump. These death-defying stunts, done at an age when most action stars have long since retired from such work, have become his trademark and demonstrate his commitment to practical filmmaking over CGI.

Cruise's dedication to cinema and his craft is legendary in Hollywood. He continues to champion the theatrical experience and has been vocal about the importance of seeing films in theaters. Despite controversies surrounding his personal life and religious beliefs, his professionalism and box office appeal remain undeniable. With films consistently grossing hundreds of millions worldwide well into his 60s, Cruise represents a rare breed of movie star whose appeal has transcended generations.`,
    careerHighlights: [
      "Three-time Academy Award nominee",
      "Mission: Impossible franchise star and producer",
      "Films have grossed over $11 billion worldwide",
      "Known for performing dangerous stunts himself",
      "Three Golden Globe Awards",
      "Honored with David di Donatello Award for lifetime achievement",
      "Top Gun: Maverick became highest-grossing film of 2022"
    ],
    metaDescription: "Tom Cruise - American actor and producer. Born July 3, 1962. Mission: Impossible star known for performing death-defying stunts and box office success."
  },
  {
    id: "17",
    slug: "lady-gaga",
    name: "Lady Gaga",
    dateOfBirth: "1986-03-28",
    placeOfBirth: "New York City, New York, USA",
    profession: "Singer, Songwriter, Actress",
    zodiacSign: "Aries",
    photoUrl: "/src/assets/celebrities/lady-gaga.jpg",
    biography: `Stefani Joanne Angelina Germanotta, known professionally as Lady Gaga, is an American singer, songwriter, and actress who has become one of the most influential and innovative pop artists of the 21st century. Born and raised in New York City, Gaga showed musical talent from an early age, learning piano at age four and performing at open mic nights as a teenager. She attended NYU's Tisch School of the Arts but left to pursue her music career, performing in clubs in the Lower East Side and eventually signing with Interscope Records.

Lady Gaga burst onto the music scene in 2008 with her debut album "The Fame," featuring the international hits "Just Dance" and "Poker Face." Her unique blend of electronic pop music, provocative lyrics, and outrageous fashion choices immediately set her apart. The follow-up EP "The Fame Monster" (2009) and subsequent albums "Born This Way" (2011), "ARTPOP" (2013), and "Joanne" (2016) showcased her artistic evolution while maintaining commercial success. Her ability to constantly reinvent herself while addressing themes of identity, sexuality, and empowerment has resonated with millions of fans worldwide, known as "Little Monsters."

Beyond pop music, Gaga has explored jazz with Tony Bennett on two collaborative albums, demonstrating her vocal versatility and respect for musical tradition. Her venture into acting proved equally successful, earning critical acclaim and an Oscar nomination for "A Star Is Born" (2018), in which she also co-wrote the Oscar-winning song "Shallow." Her performance in "House of Gucci" (2021) further established her as a serious actress.

Gaga is known for her activism, particularly for LGBTQ+ rights and mental health awareness. She founded the Born This Way Foundation with her mother to support youth mental health and wellness. Her openness about her own struggles with mental health, fibromyalgia, and PTSD from sexual assault has helped reduce stigma and encouraged others to seek help. Through her music, fashion, and advocacy, Lady Gaga has become a cultural icon who champions authenticity and empowerment.`,
    careerHighlights: [
      "13 Grammy Awards winner",
      "Academy Award winner for Best Original Song ('Shallow')",
      "Over 170 million records sold worldwide",
      "First woman to have four singles each sell over 10 million copies",
      "Founded Born This Way Foundation",
      "Time's 100 Most Influential People",
      "Performed at Super Bowl LI Halftime Show"
    ],
    metaDescription: "Lady Gaga - American singer and actress. Born March 28, 1986. Grammy and Oscar winner known for 'Born This Way' and 'A Star Is Born'."
  },
  {
    id: "18",
    slug: "will-smith",
    name: "Will Smith",
    dateOfBirth: "1968-09-25",
    placeOfBirth: "Philadelphia, Pennsylvania, USA",
    profession: "Actor, Producer, Rapper",
    zodiacSign: "Libra",
    photoUrl: "/src/assets/celebrities/will-smith.jpg",
    biography: `Willard Carroll Smith II, known as Will Smith, is an American actor, producer, and rapper who has become one of the most bankable and beloved entertainers in the world. Born and raised in West Philadelphia, Smith began his career as a rapper under the name "The Fresh Prince," forming a duo with DJ Jazzy Jeff. Their lighthearted, narrative-driven hip-hop earned them the first-ever Grammy Award for Best Rap Performance in 1989 for "Parents Just Don't Understand."

Smith's transition to acting came with the NBC sitcom "The Fresh Prince of Bel-Air" (1990-1996), which became a cultural phenomenon and showcased his natural charisma and comedic timing. The show's success opened doors to film, and Smith strategically built his movie career by choosing crowd-pleasing blockbusters. His roles in "Bad Boys" (1995), "Independence Day" (1996), and "Men in Black" (1997) established him as a major movie star capable of carrying big-budget films. He became known for his summer blockbuster streak, with films consistently opening at number one.

Throughout the 2000s, Smith demonstrated his range as an actor, taking on dramatic roles in films like "Ali" (2001), for which he gained 35 pounds of muscle and earned his first Oscar nomination, and "The Pursuit of Happyness" (2006), earning his second Oscar nomination. He continued to star in successful films including "I Am Legend," "Hancock," and "Suicide Squad," while also serving as a producer on numerous projects. His role in "King Richard" (2021) finally earned him the Academy Award for Best Actor, portraying Richard Williams, father of tennis champions Venus and Serena Williams.

Smith's influence extends beyond entertainment. He has been active in philanthropy and social causes, and his social media presence, particularly on YouTube and Instagram, has made him one of the most followed celebrities online. His positive attitude, motivational content, and willingness to be vulnerable about his struggles have endeared him to new generations. Despite recent controversies, his impact on hip-hop, television, and film remains undeniable, representing a successful crossover from music to becoming one of Hollywood's most reliable stars.`,
    careerHighlights: [
      "Academy Award winner for Best Actor (King Richard)",
      "Two-time Oscar nominee",
      "Grammy Award winner for rap",
      "Star of The Fresh Prince of Bel-Air",
      "Men in Black and Bad Boys franchises",
      "Films have grossed over $9 billion worldwide",
      "One of most followed celebrities on social media"
    ],
    metaDescription: "Will Smith - American actor and rapper. Born September 25, 1968. Oscar winner known for Men in Black, Fresh Prince, and King Richard."
  },
  {
    id: "19",
    slug: "serena-williams",
    name: "Serena Williams",
    dateOfBirth: "1981-09-26",
    placeOfBirth: "Saginaw, Michigan, USA",
    profession: "Professional Tennis Player",
    zodiacSign: "Libra",
    photoUrl: "/src/assets/celebrities/serena-williams.jpg",
    biography: `Serena Jameka Williams is an American former professional tennis player widely regarded as one of the greatest athletes of all time. Born in Saginaw, Michigan, and raised in Compton, California, Williams learned tennis on public courts under the guidance of her father Richard Williams. Along with her sister Venus, Serena showed exceptional talent from a young age. The family moved to Florida when Serena was nine so both sisters could attend a tennis academy, though Richard ultimately chose to continue coaching them himself.

Williams turned professional in 1995 at age 14 and won her first Grand Slam singles title at the 1999 U.S. Open at age 17. This victory announced her arrival as a force in women's tennis. Over the next two decades, she dominated the sport in a way few athletes have in any discipline. She won 23 Grand Slam singles titles, the most by any player in the Open Era, and held the world No. 1 ranking for 319 weeks, including a record-tying 186 consecutive weeks. Her powerful serve, aggressive baseline play, and competitive intensity revolutionized women's tennis.

Beyond her singles success, Williams won 14 Grand Slam doubles titles with her sister Venus and four Olympic gold medals. She completed the "Serena Slam" (holding all four Grand Slam titles simultaneously) twice, in 2002-2003 and 2014-2015. Her longevity at the top level was remarkable, winning major titles across three decades and remaining competitive into her 40s. In 2017, she won the Australian Open while eight weeks pregnant, a testament to her extraordinary athleticism.

Williams' impact extends far beyond tennis. As a Black woman dominating a predominantly white sport, she faced racism and discrimination throughout her career but responded by using her platform to advocate for equality and social justice. She has been a powerful voice for women's rights, equal pay, and racial justice. Off the court, she has pursued business ventures including her fashion line S by Serena and venture capital firm Serena Ventures. Her influence on sports, fashion, and culture has made her one of the most important athletes of her generation, inspiring countless young people, particularly young Black women, to pursue their dreams regardless of barriers.`,
    careerHighlights: [
      "23 Grand Slam singles titles (Open Era record)",
      "Four Olympic gold medals",
      "Held world No. 1 ranking for 319 weeks",
      "14 Grand Slam doubles titles with sister Venus",
      "Sports Illustrated Sportsperson of the Year",
      "Founded Serena Ventures investment firm",
      "Time's 100 Most Influential People multiple times"
    ],
    metaDescription: "Serena Williams - American tennis champion. Born September 26, 1981. 23-time Grand Slam winner and one of the greatest athletes of all time."
  },
  {
    id: "20",
    slug: "ed-sheeran",
    name: "Ed Sheeran",
    dateOfBirth: "1991-02-17",
    placeOfBirth: "Halifax, West Yorkshire, England",
    profession: "Singer-Songwriter",
    zodiacSign: "Aquarius",
    photoUrl: "/src/assets/celebrities/ed-sheeran.jpg",
    biography: `Edward Christopher Sheeran is an English singer-songwriter who has become one of the world's best-selling music artists through his heartfelt songwriting and intimate acoustic performances. Born in Halifax and raised in Framlingham, Suffolk, Sheeran began writing songs and playing guitar as a child. He moved to London at age 16 to pursue his music career, performing at small venues and building a grassroots following. His persistence and distinctive loop pedal performances caught the attention of actor Jamie Foxx, who invited him to perform on his radio show and offered him free recording time.

Sheeran's breakthrough came with his debut album "+" (Plus) in 2011, featuring the hit single "The A Team," which earned him Grammy nominations and established his signature style of combining folk, pop, and hip-hop influences. His second album "x" (Multiply) in 2014 featured global hits "Thinking Out Loud" and "Photograph," with "Thinking Out Loud" winning two Grammy Awards. The album's success made him one of the most popular artists in the world and a sought-after collaborator for other musicians.

His third album "÷" (Divide) in 2017 became one of the best-selling albums of all time, with "Shape of You" becoming the most-streamed song on Spotify and one of the best-selling digital singles ever. The album's massive success led to a record-breaking world tour that became the highest-grossing of all time. Subsequent albums "No.6 Collaborations Project" (2019) and "=" (Equals) (2021) continued his commercial dominance. His ability to craft universally relatable songs about love, heartbreak, and life experiences has resonated with audiences worldwide.

Despite his massive success, Sheeran has maintained a down-to-earth persona and continues to perform with just his guitar and loop pedal, even in stadium settings. His songwriting talents extend beyond his own work, having written hits for artists including Justin Bieber, Taylor Swift, and One Direction. His influence on modern pop music and his ability to fill stadiums with minimal production has made him one of the defining artists of his generation.`,
    careerHighlights: [
      "Four Grammy Awards winner",
      "Highest-grossing concert tour of all time (÷ Tour)",
      "Most-streamed artist on Spotify multiple years",
      "'Shape of You' is one of most-streamed songs ever",
      "Over 150 million records sold worldwide",
      "Performed at Queen Elizabeth II's Diamond Jubilee",
      "Member of the Order of the British Empire (MBE)"
    ],
    metaDescription: "Ed Sheeran - English singer-songwriter. Born February 17, 1991. Grammy winner known for 'Shape of You' and highest-grossing concert tour of all time."
  },
  {
    id: "21",
    slug: "zendaya",
    name: "Zendaya",
    dateOfBirth: "1996-09-01",
    placeOfBirth: "Oakland, California, USA",
    profession: "Actress, Singer",
    zodiacSign: "Virgo",
    photoUrl: "/src/assets/celebrities/zendaya.jpg",
    biography: `Zendaya Maree Stoermer Coleman, known mononymously as Zendaya, is an American actress and singer who has become one of the most influential young stars in entertainment. Born and raised in Oakland, California, Zendaya began her career as a child model and backup dancer before landing her breakthrough role as Rocky Blue on the Disney Channel series "Shake It Up" (2010-2013). Her time at Disney established her as a role model for young audiences and showcased her talents in both acting and dancing.

After leaving Disney, Zendaya strategically transitioned to more mature roles, distinguishing herself from other former child stars. Her portrayal of Rue Bennett, a teenager struggling with addiction, in HBO's "Euphoria" (2019-present) earned her critical acclaim and made her the youngest woman to win the Primetime Emmy Award for Outstanding Lead Actress in a Drama Series at age 24, a record she broke again with her second win in 2022. The role showcased her dramatic range and willingness to tackle complex, challenging material.

Zendaya's film career has been equally impressive. She joined the Marvel Cinematic Universe as MJ in the "Spider-Man" franchise, bringing depth and charm to the role in "Spider-Man: Homecoming" (2017), "Far From Home" (2019), and "No Way Home" (2021). Her performance in "The Greatest Showman" (2017) highlighted her singing abilities, while "Malcolm & Marie" (2021) and Denis Villeneuve's epic "Dune" (2021) and "Dune: Part Two" (2024) demonstrated her versatility across genres.

Beyond acting, Zendaya has become a fashion icon, known for her bold and sophisticated red carpet choices in collaboration with stylist Law Roach. She has been recognized by Time as one of the world's most influential people and uses her platform to advocate for diversity and representation in entertainment. Her ability to balance blockbuster franchises with critically acclaimed dramatic work, while maintaining authenticity and using her voice for positive change, has made her one of the most important young stars of her generation.`,
    careerHighlights: [
      "Two-time Emmy Award winner for Euphoria",
      "Youngest Emmy winner for Lead Actress in a Drama",
      "Star of Spider-Man and Dune franchises",
      "Time's 100 Most Influential People",
      "Fashion icon and trendsetter",
      "Advocate for diversity and representation",
      "Released music debut album in 2013"
    ],
    metaDescription: "Zendaya - American actress and singer. Born September 1, 1996. Two-time Emmy winner known for Euphoria, Spider-Man, and Dune."
  },
  {
    id: "22",
    slug: "drake",
    name: "Drake",
    dateOfBirth: "1986-10-24",
    placeOfBirth: "Toronto, Ontario, Canada",
    profession: "Rapper, Singer, Songwriter, Producer",
    zodiacSign: "Scorpio",
    photoUrl: "/src/assets/celebrities/drake.jpg",
    biography: `Aubrey Drake Graham, known professionally as Drake, is a Canadian rapper, singer, songwriter, and producer who has become one of the most commercially successful and influential artists in contemporary music. Born in Toronto to a Jewish-Canadian mother and African-American father, Drake began his career as an actor, playing Jimmy Brooks on the Canadian teen drama series "Degrassi: The Next Generation" (2001-2009). However, his true passion was music, and he began releasing mixtapes while still acting.

Drake's breakthrough came with his 2009 mixtape "So Far Gone," which featured the hit singles "Best I Ever Had" and "Successful." The mixtape's success led to a bidding war among record labels, with Drake ultimately signing to Lil Wayne's Young Money Entertainment. His debut studio album "Thank Me Later" (2010) debuted at number one, and subsequent albums including "Take Care" (2011), "Nothing Was the Same" (2013), "Views" (2016), and "Scorpion" (2018) have all achieved massive commercial success while pushing the boundaries of hip-hop and R&B fusion.

Drake's music is characterized by its emotional vulnerability, introspective lyrics, and melodic hooks, often blending rap with R&B and pop influences. This approach, initially criticized by some hip-hop purists, has become incredibly influential, shaping the sound of modern hip-hop. He has broken numerous streaming and chart records, including having the most charted songs on the Billboard Hot 100 of any artist in history. His singles "One Dance," "God's Plan," and "In My Feelings" have all topped charts worldwide.

Beyond music, Drake has built a business empire. He founded the OVO (October's Very Own) record label and clothing brand, invested in various businesses, and became a global ambassador for the Toronto Raptors, helping raise the NBA team's profile. His influence on Toronto's cultural identity and the city's emergence as a music hub cannot be overstated. Drake's ability to consistently dominate charts, influence musical trends, and remain culturally relevant for over a decade has cemented his status as one of the defining artists of the streaming era.`,
    careerHighlights: [
      "Five Grammy Awards winner",
      "Most charted songs on Billboard Hot 100 in history",
      "Multiple diamond-certified albums",
      "Founded OVO Sound record label",
      "Billboard's Artist of the Decade (2010s)",
      "Most streamed artist on Spotify (multiple years)",
      "Successful actor turned global music superstar"
    ],
    metaDescription: "Drake - Canadian rapper and singer. Born October 24, 1986. Five-time Grammy winner with most charted songs in Billboard Hot 100 history."
  },
  {
    id: "23",
    slug: "scarlett-johansson",
    name: "Scarlett Johansson",
    dateOfBirth: "1984-11-22",
    placeOfBirth: "New York City, New York, USA",
    profession: "Actress",
    zodiacSign: "Sagittarius",
    photoUrl: "/src/assets/celebrities/scarlett-johansson.jpg",
    biography: `Scarlett Ingrid Johansson is an American actress who has become one of the world's highest-grossing and most acclaimed performers. Born in New York City to a Danish father and American mother, Johansson showed interest in acting from a young age, appearing in theater productions before making her film debut at age nine. She gained early recognition for her mature performances in films like "The Horse Whisperer" (1998) and "Ghost World" (2001), but it was her breakthrough role in "Lost in Translation" (2003) opposite Bill Murray that established her as a serious actress at age 18.

Throughout the 2000s, Johansson demonstrated remarkable versatility, taking on challenging roles in films like "Girl with a Pearl Earring" (2003), "Match Point" (2005), and "Vicky Cristina Barcelona" (2008). She also showed her range by appearing in diverse projects from Woody Allen dramas to big-budget action films. Her distinctive voice led to her being cast as the operating system in Spike Jonze's "Her" (2013), a role that earned her critical praise despite never appearing on screen.

Johansson's career reached new commercial heights when she joined the Marvel Cinematic Universe as Natasha Romanoff/Black Widow in "Iron Man 2" (2010). She reprised the role in multiple Marvel films, becoming the first female Avenger and cementing her status as an action star. The standalone film "Black Widow" (2021) finally gave her character a full spotlight. Her Marvel work made her one of the highest-grossing actors of all time, with her films collectively earning over $14 billion worldwide.

Beyond blockbusters, Johansson has maintained her commitment to dramatic roles in films like "Under the Skin" (2013), "Lucy" (2014), "Marriage Story" (2019), and "Jojo Rabbit" (2019), the latter two earning her simultaneous Oscar nominations for Best Actress and Best Supporting Actress. She has also ventured into music and Broadway. Her intelligence, talent, and ability to balance commercial success with artistic integrity have made her one of the most respected actresses of her generation.`,
    careerHighlights: [
      "Highest-grossing actress of all time ($14.5+ billion)",
      "Two Oscar nominations in same year (Marriage Story, Jojo Rabbit)",
      "Star of Marvel's Black Widow",
      "BAFTA Film Award winner",
      "Tony Award winner for theater work",
      "Named one of world's most influential people by Time",
      "Appeared in multiple Woody Allen films"
    ],
    metaDescription: "Scarlett Johansson - American actress. Born November 22, 1984. Highest-grossing actress known for Black Widow and critically acclaimed dramatic roles."
  },
  {
    id: "24",
    slug: "bruno-mars",
    name: "Bruno Mars",
    dateOfBirth: "1985-10-08",
    placeOfBirth: "Honolulu, Hawaii, USA",
    profession: "Singer, Songwriter, Record Producer",
    zodiacSign: "Libra",
    photoUrl: "/src/assets/celebrities/bruno-mars.jpg",
    biography: `Peter Gene Hernandez, known professionally as Bruno Mars, is an American singer, songwriter, and record producer who has become one of the best-selling music artists of all time. Born and raised in Honolulu, Hawaii, Mars came from a musical family and was exposed to a wide variety of music genres from an early age. He performed in his family's band as a young child, impersonating Elvis Presley and becoming known as "Little Elvis." At age 17, he moved to Los Angeles to pursue a music career, initially struggling to find success.

Mars began his career as a songwriter and producer, co-writing hits for other artists including "Right Round" by Flo Rida, "Wavin' Flag" by K'naan, and "Fuck You" by CeeLo Green. His songwriting talents caught the attention of Atlantic Records, and he was signed as a solo artist. His debut album "Doo-Wops & Hooligans" (2010) was a massive success, featuring hit singles "Just the Way You Are" and "Grenade." The album showcased his ability to blend pop, R&B, reggae, and soul influences into accessible, radio-friendly hits.

Mars' subsequent albums "Unorthodox Jukebox" (2012) and "24K Magic" (2016) solidified his status as a pop superstar. "24K Magic" won seven Grammy Awards, including Album of the Year, Record of the Year, and Song of the Year for the title track. His music draws heavily from 1970s and 1980s funk, soul, and R&B, giving modern pop a retro feel that appeals to multiple generations. His electrifying stage presence and choreography have made him one of the best live performers in contemporary music.

Mars is known for his showmanship, having performed at multiple Super Bowl halftime shows, the highest-rated in history. His collaboration with Anderson .Paak as Silk Sonic produced the Grammy-winning album "An Evening with Silk Sonic" (2021), further showcasing his versatility. With multiple diamond-certified songs, over 130 million records sold worldwide, and numerous awards, Mars has established himself as one of the defining pop artists of the 2010s and 2020s.`,
    careerHighlights: [
      "15 Grammy Awards winner",
      "Over 130 million records sold worldwide",
      "Super Bowl halftime performer (twice)",
      "Multiple diamond-certified singles",
      "Won Album, Record, and Song of the Year Grammy in same year",
      "Silk Sonic collaboration with Anderson .Paak",
      "One of best-selling artists of all time"
    ],
    metaDescription: "Bruno Mars - American singer and producer. Born October 8, 1985. 15-time Grammy winner known for '24K Magic' and electrifying performances."
  },
  {
    id: "25",
    slug: "jennifer-lawrence",
    name: "Jennifer Lawrence",
    dateOfBirth: "1990-08-15",
    placeOfBirth: "Indian Hills, Kentucky, USA",
    profession: "Actress",
    zodiacSign: "Leo",
    photoUrl: "/src/assets/celebrities/jennifer-lawrence.jpg",
    biography: `Jennifer Shrader Lawrence is an American actress who became one of Hollywood's most sought-after stars through a combination of critically acclaimed performances and blockbuster success. Born in Indian Hills, Kentucky, Lawrence showed an interest in acting from a young age but didn't pursue it seriously until age 14 when she was discovered by a talent scout in New York City. She moved to Los Angeles with her family and quickly began booking television roles before transitioning to film.

Lawrence's breakthrough came with her performance in the independent film "Winter's Bone" (2010), playing a poverty-stricken teenager caring for her family in the Ozarks. Her raw, powerful performance earned her an Academy Award nomination at age 20, making her one of the youngest Best Actress nominees in history. This recognition led to higher-profile roles, including Mystique in "X-Men: First Class" (2011), which introduced her to mainstream audiences.

Her career skyrocketed when she was cast as Katniss Everdeen in "The Hunger Games" franchise (2012-2015). The films became a global phenomenon, and Lawrence's portrayal of the strong, complex heroine made her one of the world's biggest movie stars. Remarkably, during this period of commercial success, she also won the Academy Award for Best Actress for "Silver Linings Playbook" (2012) at age 22, becoming the second-youngest Best Actress winner ever. She followed this with another Oscar nomination for "American Hustle" (2013) and a third for "Joy" (2015), solidifying her reputation as a serious actress.

Lawrence is known for her down-to-earth personality and candid, often humorous interviews, which have made her relatable despite her fame. She took a break from acting in 2019 to focus on activism and her personal life, returning with films like "Don't Look Up" (2021). Throughout her career, she has been an advocate for equal pay in Hollywood and has spoken openly about the gender wage gap. Her combination of box office appeal, critical acclaim, and authentic public persona has made her one of the most influential actresses of her generation.`,
    careerHighlights: [
      "Academy Award winner for Silver Linings Playbook",
      "Four Oscar nominations by age 25",
      "Star of The Hunger Games franchise",
      "Golden Globe winner (multiple times)",
      "Youngest actress to accrue four Oscar nominations",
      "Advocate for equal pay in Hollywood",
      "One of highest-paid actresses in the world"
    ],
    metaDescription: "Jennifer Lawrence - American actress. Born August 15, 1990. Oscar winner known for The Hunger Games, Silver Linings Playbook, and advocacy."
  },
  {
    id: "26",
    slug: "chris-hemsworth",
    name: "Chris Hemsworth",
    dateOfBirth: "1983-08-11",
    placeOfBirth: "Melbourne, Victoria, Australia",
    profession: "Actor",
    zodiacSign: "Leo",
    photoUrl: "/src/assets/celebrities/chris-hemsworth.jpg",
    biography: `Christopher Hemsworth is an Australian actor who rose to international fame playing Thor in the Marvel Cinematic Universe. Born in Melbourne and raised in the Australian Outback, Hemsworth comes from an acting family; his younger brother Liam Hemsworth is also a well-known actor. Chris began his career in Australian television, most notably appearing in the soap opera "Home and Away" from 2004 to 2007. After gaining recognition in Australia, he moved to the United States to pursue Hollywood opportunities.

Hemsworth's breakthrough role came in 2011 when he was cast as Thor, the God of Thunder, in the Marvel Cinematic Universe. His portrayal combined physical prowess with charm and humor, making Thor one of the MCU's most beloved characters. He has reprised the role in multiple films including "The Avengers" series and standalone Thor movies, with "Thor: Ragnarok" (2017) and "Thor: Love and Thunder" (2022) showcasing his comedic abilities alongside the action. His work in the MCU has made him one of the world's highest-paid actors.

Beyond Marvel, Hemsworth has demonstrated his versatility in various genres. He appeared in the horror film "The Cabin in the Woods" (2011), the Formula One drama "Rush" (2013) where he played legendary driver James Hunt, the cyber thriller "Blackhat" (2015), and the action-thriller "Extraction" (2020) which became one of Netflix's most-watched films. His physicality and screen presence have made him a natural fit for action roles, but he has also shown his range in dramatic and comedic performances.

Off-screen, Hemsworth is known for his dedication to fitness, often sharing workout routines that prepare him for his physically demanding roles. He is also a devoted family man, living with his wife, actress Elsa Pataky, and their three children in Byron Bay, Australia. He uses his platform to support various charitable causes, particularly those related to children's health and the environment. His combination of blockbuster success, likability, and commitment to maintaining a balanced life has made him one of Hollywood's most popular leading men.`,
    careerHighlights: [
      "Star of Marvel's Thor franchise",
      "Appeared in multiple Avengers films",
      "Star of Netflix's Extraction franchise",
      "Played James Hunt in Rush",
      "Named Sexiest Man Alive by People magazine",
      "One of highest-paid actors in Hollywood",
      "Tourism ambassador for Australia"
    ],
    metaDescription: "Chris Hemsworth - Australian actor. Born August 11, 1983. Marvel's Thor known for action roles and one of Hollywood's highest-paid actors."
  },
  {
    id: "27",
    slug: "adele",
    name: "Adele",
    dateOfBirth: "1988-05-05",
    placeOfBirth: "Tottenham, London, England",
    profession: "Singer-Songwriter",
    zodiacSign: "Taurus",
    photoUrl: "/src/assets/celebrities/adele.jpg",
    biography: `Adele Laurie Blue Adkins, known simply as Adele, is an English singer-songwriter who has become one of the world's best-selling music artists through her powerful voice and emotionally resonant ballads. Born in Tottenham, London, Adele showed musical talent from a young age and was influenced by artists like Etta James and Ella Fitzgerald. She attended the BRIT School for Performing Arts & Technology, where she refined her skills. A friend posted her demo on Myspace, which led to her being signed by XL Recordings shortly after graduation.

Adele's debut album "19" (2008), named after her age at the time of writing, was a critical and commercial success, featuring hits like "Chasing Pavements" and "Hometown Glory." The album showcased her rich, soulful voice and mature songwriting, earning her two Grammy Awards including Best New Artist. However, it was her second album "21" (2011) that catapulted her to global superstardom. Fueled by heartbreak, the album included massive hits "Rolling in the Deep," "Someone Like You," and "Set Fire to the Rain." "21" became one of the best-selling albums of all time, winning six Grammy Awards including Album of the Year.

After taking time off to have a child and recover from vocal cord surgery, Adele returned with "25" (2015), which broke first-week sales records and included the record-breaking single "Hello." The album won five Grammy Awards, including Album and Record of the Year. Her fourth album "30" (2021), inspired by her divorce, continued her tradition of deeply personal, emotionally powerful music. Each of her studio albums has been certified diamond in multiple countries, a rare achievement in the modern music industry.

Adele is known for her down-to-earth personality, powerful live performances, and refusal to be dictated by industry trends. She rarely gives interviews, doesn't tour extensively, and maintains a relatively private personal life, making her releases major events in pop culture. Her voice, often compared to classic soul singers, combined with her honest, relatable songwriting about love and heartbreak, has resonated with audiences worldwide across all demographics. She represents a rare artist who achieves both massive commercial success and critical acclaim while maintaining artistic integrity.`,
    careerHighlights: [
      "16 Grammy Awards winner",
      "Best-selling album of the 21st century ('21')",
      "Academy Award for Best Original Song ('Skyfall')",
      "All studio albums certified diamond",
      "First artist to have three diamond-certified albums",
      "One of world's best-selling music artists",
      "Brit Awards for British Album of the Year (four times)"
    ],
    metaDescription: "Adele - English singer-songwriter. Born May 5, 1988. 16-time Grammy winner known for powerful voice and albums '21' and '25'."
  },
  {
    id: "28",
    slug: "robert-downey-jr",
    name: "Robert Downey Jr.",
    dateOfBirth: "1965-04-04",
    placeOfBirth: "New York City, New York, USA",
    profession: "Actor, Producer",
    zodiacSign: "Aries",
    photoUrl: "/src/assets/celebrities/robert-downey-jr.jpg",
    biography: `Robert John Downey Jr. is an American actor who has become one of the highest-paid and most bankable stars in Hollywood, known primarily for his role as Tony Stark/Iron Man in the Marvel Cinematic Universe. Born in New York City to filmmaker Robert Downey Sr., he was exposed to the entertainment industry from birth, making his acting debut at age five in his father's film. He rose to prominence in the 1980s with roles in films like "Less Than Zero" (1987) and joined the cast of "Saturday Night Live" for one season.

The early to mid-1990s saw Downey deliver critically acclaimed performances, most notably his portrayal of Charlie Chaplin in "Chaplin" (1992), which earned him an Academy Award nomination and a BAFTA Award. However, his career was derailed by substance abuse issues that led to arrests, rehab stints, and time in prison. Throughout the late 1990s and early 2000s, his personal problems overshadowed his talent, and he became nearly uninsurable for film productions. His career appeared to be over, with many considering him one of Hollywood's greatest cautionary tales.

Downey's remarkable comeback began in the mid-2000s. After getting sober and rebuilding trust within the industry, he landed a role in "Kiss Kiss Bang Bang" (2005) and gave a critically acclaimed performance in "Zodiac" (2007). His career transformation reached its peak when Marvel took a chance on him, casting him as Tony Stark in "Iron Man" (2008). The film's massive success launched the MCU and made Downey one of the world's biggest movie stars. He went on to appear in multiple Marvel films, with his performances becoming increasingly iconic. His final appearance as Iron Man in "Avengers: Endgame" (2019) was an emotional culmination of the character's journey and the MCU's Infinity Saga.

Beyond Marvel, Downey starred in Guy Ritchie's "Sherlock Holmes" films and "Oppenheimer" (2023), for which he won the Academy Award for Best Supporting Actor. His story is one of Hollywood's greatest comebacks, demonstrating personal redemption and professional resurgence. He has been open about his struggles with addiction, using his platform to inspire others facing similar challenges. His wit, charisma, and dramatic range have made him not just a blockbuster star but a respected actor who overcame incredible adversity to reach the pinnacle of his profession.`,
    careerHighlights: [
      "Academy Award winner for Oppenheimer",
      "Star of Marvel's Iron Man and Avengers franchises",
      "Third highest-grossing actor of all time",
      "Golden Globe winner (three times)",
      "Star of Sherlock Holmes films",
      "Overcame addiction to achieve career resurgence",
      "Ranked among highest-paid actors in Hollywood"
    ],
    metaDescription: "Robert Downey Jr. - American actor. Born April 4, 1965. Oscar winner and Iron Man star known for remarkable career comeback and MCU success."
  },
  {
    id: "29",
    slug: "katy-perry",
    name: "Katy Perry",
    dateOfBirth: "1984-10-25",
    placeOfBirth: "Santa Barbara, California, USA",
    profession: "Singer, Songwriter",
    zodiacSign: "Scorpio",
    photoUrl: "/src/assets/celebrities/katy-perry.jpg",
    biography: `Katheryn Elizabeth Hudson, known professionally as Katy Perry, is an American singer, songwriter, and television personality who has become one of the best-selling music artists of all time. Born in Santa Barbara, California, to Pentecostal pastor parents, Perry grew up in a conservative household where she was only allowed to listen to gospel music. She pursued a career in gospel music as a teenager, releasing an unsuccessful gospel album under her birth name in 2001 before moving to Los Angeles to work with different songwriters and producers.

Perry's mainstream breakthrough came with her 2008 single "I Kissed a Girl," which topped charts worldwide and sparked both commercial success and controversy. Her second album "One of the Boys" (2008) established her as a pop force, but it was her third album "Teenage Dream" (2010) that made her a global superstar. The album produced five number-one singles on the Billboard Hot 100, making Perry the first female artist to achieve this feat from one album (a record previously held only by Michael Jackson's "Bad"). Hits like "California Gurls," "Teenage Dream," "Firework," and "Last Friday Night" dominated radio and became cultural phenomena.

Her subsequent album "Prism" (2013) continued her commercial dominance with hits like "Roar" and "Dark Horse," both reaching number one. Perry's colorful, theatrical visual style, often featuring candy-themed imagery and whimsical costumes, became her trademark. She performed at the Super Bowl XLIX halftime show in 2015, which became the most-watched halftime show in history at the time. Her "Witness" album (2017) and "Smile" (2020) saw her experimenting with different sounds and more personal themes.

Beyond music, Perry has been a judge on "American Idol" since 2018 and has ventured into various business endeavors including fragrances and shoe lines. She has used her platform for activism, particularly supporting LGBTQ+ rights, and has been a UNICEF Goodwill Ambassador. With over 143 million records sold worldwide, nine U.S. number-one singles, and numerous awards, Perry has established herself as one of the defining pop stars of the 2010s. Her ability to create catchy, anthemic pop songs has made her music ubiquitous in popular culture.`,
    careerHighlights: [
      "Over 143 million records sold worldwide",
      "Nine number-one singles on Billboard Hot 100",
      "First female artist with five number-one singles from one album",
      "Most-watched Super Bowl halftime show (at the time)",
      "Judge on American Idol",
      "UNICEF Goodwill Ambassador",
      "Multiple MTV Video Music Awards and People's Choice Awards"
    ],
    metaDescription: "Katy Perry - American singer. Born October 25, 1984. Pop icon known for 'Firework,' 'Roar,' and five number-one singles from 'Teenage Dream'."
  },
  {
    id: "30",
    slug: "morgan-freeman",
    name: "Morgan Freeman",
    dateOfBirth: "1937-06-01",
    placeOfBirth: "Memphis, Tennessee, USA",
    profession: "Actor, Director, Narrator",
    zodiacSign: "Gemini",
    photoUrl: "/src/assets/celebrities/morgan-freeman.jpg",
    biography: `Morgan Freeman is an American actor, director, and narrator widely regarded as one of the greatest actors in film history. Born in Memphis, Tennessee, Freeman grew up in poverty in Mississippi. He showed an interest in acting from a young age, making his stage debut at age nine. After serving in the United States Air Force, he moved to Los Angeles in the early 1960s and then to New York City, where he studied acting and performed in theater, including a stint on the children's television show "The Electric Company" in the 1970s.

Freeman's film career began relatively late compared to other actors. He earned his first Oscar nomination at age 50 for "Street Smart" (1987), playing a violent pimp in a role that showcased his dramatic range. His breakthrough to mainstream stardom came with his role as Hoke Colburn, a chauffeur, in "Driving Miss Daisy" (1989), which earned him his second Oscar nomination. Throughout the 1990s, he established himself as one of Hollywood's most dependable and respected actors with memorable performances in films like "Glory," "The Shawshank Redemption," "Seven," and "Amistad."

Freeman won the Academy Award for Best Supporting Actor for his performance in "Million Dollar Baby" (2004), directed by Clint Eastwood, with whom he has collaborated multiple times. He has received five Oscar nominations throughout his career and is known for his gravitas, distinctive voice, and ability to bring depth to every role, whether playing God in "Bruce Almighty," Nelson Mandela in "Invictus," or a wise mentor in countless films. His roles often embody wisdom, integrity, and authority, making him one of cinema's most iconic father-figure characters.

Beyond acting, Freeman's distinctive, authoritative voice has made him one of the most sought-after narrators in the world. He has narrated numerous documentaries, most notably the science documentary series "Through the Wormhole," which he also produced. He co-founded the film production company Revelations Entertainment and has been involved in various humanitarian efforts, particularly related to education and disaster relief. His longevity, versatility, and consistently excellent work have made him a living legend in Hollywood, respected by audiences and peers alike.`,
    careerHighlights: [
      "Academy Award winner for Million Dollar Baby",
      "Five Oscar nominations throughout career",
      "Star of The Shawshank Redemption",
      "Golden Globe winner (multiple times)",
      "SAG Life Achievement Award recipient",
      "Iconic narrator for documentaries and films",
      "Kennedy Center Honors recipient"
    ],
    metaDescription: "Morgan Freeman - American actor and narrator. Born June 1, 1937. Oscar winner known for distinctive voice and roles in Shawshank Redemption."
  }
];

// Category-based organization
export const categorizedCelebrities = {
  actors: ["tom-hanks", "leonardo-dicaprio", "dwayne-johnson", "emma-watson", "tom-cruise", "will-smith", "scarlett-johansson", "jennifer-lawrence", "chris-hemsworth", "robert-downey-jr", "morgan-freeman", "zendaya"],
  musicians: ["taylor-swift", "beyonce", "selena-gomez", "ariana-grande", "rihanna", "lady-gaga", "ed-sheeran", "drake", "bruno-mars", "adele", "katy-perry"],
  athletes: ["cristiano-ronaldo", "lebron-james", "lionel-messi", "serena-williams"],
  techInnovators: ["elon-musk", "bill-gates"],
  worldLeaders: ["oprah-winfrey"],
  artists: [],
  scientists: [],
  internetPersonalities: []
};

// Month-based organization
export const monthCelebrities = {
  january: ["oprah-winfrey"],
  february: ["cristiano-ronaldo", "rihanna", "ed-sheeran"],
  march: ["lady-gaga"],
  april: ["emma-watson", "robert-downey-jr"],
  may: ["dwayne-johnson", "adele"],
  june: ["elon-musk", "ariana-grande", "lionel-messi", "morgan-freeman"],
  july: ["tom-hanks", "selena-gomez", "tom-cruise"],
  august: ["jennifer-lawrence", "chris-hemsworth"],
  september: ["beyonce", "will-smith", "serena-williams", "zendaya"],
  october: ["bill-gates", "drake", "bruno-mars", "katy-perry"],
  november: ["leonardo-dicaprio", "scarlett-johansson"],
  december: ["taylor-swift", "lebron-james"]
};
