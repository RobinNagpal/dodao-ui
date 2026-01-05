// Slide types
export type SlideType = "title" | "bullets" | "paragraphs" | "image";

// Base slide properties
interface BaseSlide {
  id: string; // "001", "002"...
  type: SlideType;
  narration: string; // text to convert to speech
}

// Title slide - centered title and subtitle on background image
export interface TitleSlide extends BaseSlide {
  type: "title";
  title: string;
  subtitle?: string;
}

// Bullet slide - heading with bullet points
export interface BulletSlide extends BaseSlide {
  type: "bullets";
  title: string;
  titleAccent?: string; // optional accent colored part of title
  bullets: string[];
  bulletAccents?: string[]; // optional accent text within each bullet
}

// Paragraph slide - heading with paragraphs
export interface ParagraphSlide extends BaseSlide {
  type: "paragraphs";
  title: string;
  titleAccent?: string;
  paragraphs: string[];
  paragraphAccents?: string[]; // optional accent/underlined text per paragraph
  footer?: string; // optional footer text like a URL
}

// Image slide - heading with bullets and image on right
export interface ImageSlide extends BaseSlide {
  type: "image";
  title: string;
  titleAccent?: string;
  bullets: string[];
  bulletAccents?: string[];
  imageUrl: string; // URL or path to image
}

export type Slide = TitleSlide | BulletSlide | ParagraphSlide | ImageSlide;

export const SLIDES: Slide[] = [
  {
    id: "001",
    type: "title",
    title: "The Future of Automotive",
    subtitle: "Revolutionizing Transportation Through Innovation",
    narration:
      "Welcome to our exploration of the future of automotive industry. Today we'll discover how innovation is revolutionizing transportation worldwide, from electric vehicles to autonomous driving technology. We'll examine current industry trends, cutting-edge innovations, and the challenges ahead.",
  },
  {
    id: "002",
    type: "bullets",
    title: "Current Automotive Landscape",
    bullets: [
      "The global automotive industry generates over $3 trillion in annual revenue, employing millions worldwide.",
      "Traditional internal combustion engine vehicles still dominate with 95% market share, but electric vehicles are rapidly gaining ground.",
      "Asia leads production with China manufacturing nearly 30% of the world's vehicles, followed by the European Union and North America.",
      "The industry faces unprecedented challenges from supply chain disruptions, semiconductor shortages, and shifting consumer preferences toward sustainability.",
      "Autonomous driving technology is advancing rapidly, with Level 4 autonomy expected to become mainstream by 2030.",
    ],
    bulletAccents: ["$3 trillion", "95%", "30%", "unprecedented challenges", "2030"],
    narration:
      "The automotive industry generates over 3 trillion dollars annually and employs millions worldwide. While traditional vehicles maintain 95% market share, electric vehicles are rapidly gaining ground. China leads production with 30% of global manufacturing, followed by Europe and North America. The industry faces challenges from supply chain disruptions and semiconductor shortages.",
  },
  {
    id: "003",
    type: "paragraphs",
    title: "Electric Vehicle",
    titleAccent: "Revolution",
    paragraphs: [
      "The electric vehicle market has exploded in recent years, with global EV sales reaching 10 million units in 2023 alone. This represents a 35% increase from the previous year, driven by improved battery technology, longer driving ranges, and extensive charging infrastructure development.",
      "Major automakers are investing billions in EV production capacity. Tesla leads the premium segment, while traditional manufacturers like Volkswagen, Toyota, and General Motors are rapidly expanding their electric portfolios. China has emerged as the world's largest EV market, accounting for over 60% of global sales.",
      "Battery technology continues to advance, with solid-state batteries promising 500-mile ranges and faster charging times. However, challenges remain in raw material sourcing, particularly lithium, cobalt, and nickel, which are critical for battery production.",
    ],
    paragraphAccents: ["35% increase", "60%", "500-mile ranges"],
    footer: "Source: International Energy Agency, 2024 Automotive Report",
    narration: "Electric vehicle sales reached 10 million units in 2023, showing 35% growth. Major automakers like Tesla, Volkswagen, and GM are investing billions in EV production. China dominates with 60% of global EV sales. Solid-state batteries promise 500-mile ranges, though challenges remain in sourcing lithium, cobalt, and nickel.",
  },
  {
    id: "004",
    type: "image",
    title: "Autonomous Driving Technology",
    bullets: [
      "Level 1: Basic driver assistance systems",
      "Level 2: Partial automation with adaptive cruise control",
      "Level 3: Conditional automation requiring driver supervision",
      "Level 4: High automation in specific conditions",
      "Level 5: Full automation without human intervention",
    ],
    imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop",
    narration: "Autonomous driving advances through five levels, from basic assistance to full automation. Companies like Waymo, Tesla, and Cruise invest billions in sensors, AI, and machine learning. Level 4 autonomy enables self-driving in specific areas, while Level 5 promises full independence. Challenges include regulations, cybersecurity, and public acceptance.",
  },
  {
    id: "005",
    type: "bullets",
    title: "Connectivity and IoT Integration",
    bullets: [
      "Vehicle-to-Vehicle (V2V) communication enables cars to share real-time traffic and safety data.",
      "Vehicle-to-Infrastructure (V2I) systems connect vehicles with traffic lights, road sensors, and smart city infrastructure.",
      "Over-the-Air (OTA) updates allow manufacturers to improve vehicle software and add new features remotely.",
      "Advanced telematics provide real-time diagnostics, predictive maintenance, and personalized insurance rates.",
      "5G connectivity enables ultra-low latency communication essential for autonomous vehicle coordination.",
    ],
    bulletAccents: ["Vehicle-to-Vehicle", "Vehicle-to-Infrastructure", "Over-the-Air", "Advanced telematics", "5G connectivity"],
    narration:
      "Modern vehicles are becoming sophisticated computing platforms with V2V and V2I communication capabilities. Over-the-air updates enable remote software improvements, while 5G connectivity supports real-time decision-making. Advanced telematics provide diagnostics and predictive maintenance, though cybersecurity and data privacy remain key challenges.",
  },
  {
    id: "006",
    type: "paragraphs",
    title: "Sustainable Manufacturing",
    titleAccent: "Practices",
    paragraphs: [
      "The automotive industry is undergoing a green transformation, with manufacturers committing to carbon neutrality by 2050. This ambitious goal requires fundamental changes in production processes, supply chains, and material usage. Electric vehicles produce zero tailpipe emissions, but their manufacturing process still generates significant carbon footprint.",
      "Circular economy principles are being adopted, with increased focus on recycling, remanufacturing, and using sustainable materials. Lightweight materials like carbon fiber composites and advanced aluminum alloys are replacing traditional steel, reducing vehicle weight and improving fuel efficiency.",
      "Water conservation and renewable energy adoption in manufacturing facilities are becoming standard practice. Major automakers are investing in solar power, wind energy, and advanced water recycling systems to minimize their environmental impact.",
    ],
    paragraphAccents: ["carbon neutrality by 2050", "zero tailpipe emissions", "Circular economy"],
    footer: "United Nations Sustainable Development Goals - Industry Partnership",
    narration: "Manufacturers are committing to carbon neutrality by 2050 through sustainable practices. Circular economy principles emphasize recycling and lightweight materials like carbon fiber and aluminum. Renewable energy adoption and water conservation are becoming standard in manufacturing facilities.",
  },
  {
    id: "007",
    type: "image",
    title: "Shared Mobility Solutions",
    bullets: [
      "Ride-sharing services like Uber and Lyft",
      "Car-sharing platforms such as Zipcar and Turo",
      "Electric scooter and bike-sharing programs",
      "Autonomous taxi fleets in development",
      "Integrated multimodal transportation systems",
    ],
    imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop",
    narration: "Shared mobility solutions like Uber, Lyft, and car-sharing platforms are transforming urban transportation. Electric scooters and bike-sharing provide last-mile connectivity, while autonomous taxi fleets represent the future. These services reduce congestion and parking demands in cities.",
  },
  {
    id: "008",
    type: "bullets",
    title: "Industry Challenges",
    bullets: [
      "Semiconductor chip shortages disrupting production worldwide",
      "Rising raw material costs for batteries and electronics",
      "Intense competition from new market entrants like Tesla",
      "Cybersecurity threats to connected vehicle systems",
      "Infrastructure gaps in charging networks and autonomous testing",
      "Workforce transition as manufacturing becomes more automated",
      "Regulatory uncertainty across different global markets",
    ],
    bulletAccents: ["Semiconductor chip shortages", "Rising raw material costs", "Cybersecurity threats", "Regulatory uncertainty"],
    narration:
      "The industry faces semiconductor shortages disrupting production, rising raw material costs, and intense competition from Tesla. Cybersecurity threats and infrastructure gaps in charging networks pose additional challenges. Regulatory uncertainty and workforce transitions add complexity to global operations.",
  },
  {
    id: "009",
    type: "paragraphs",
    title: "Future Trends",
    titleAccent: "2030 and Beyond",
    paragraphs: [
      "By 2030, electric vehicles are projected to account for 40% of global new car sales, with battery costs dropping below $100 per kilowatt-hour. Autonomous vehicles will begin operating in geofenced areas, and advanced driver assistance systems will become standard equipment across all vehicle segments.",
      "Hydrogen fuel cell vehicles will complement battery electric vehicles, particularly for heavy-duty applications like trucks and buses. Urban air mobility solutions, including electric vertical takeoff and landing aircraft, will emerge in major metropolitan areas.",
      "Artificial intelligence and machine learning will optimize traffic flow, predict maintenance needs, and personalize driving experiences. Blockchain technology will enable secure vehicle identity management and automated insurance claims processing.",
    ],
    paragraphAccents: ["40% of global new car sales", "below $100 per kilowatt-hour", "Urban air mobility"],
    footer: "McKinsey Global Automotive Report 2024",
    narration: "By 2030, electric vehicles will account for 40% of global sales with battery costs below $100 per kilowatt-hour. Autonomous technology will become standard, while hydrogen fuel cells complement EVs for heavy-duty applications. AI and blockchain will optimize operations and enable mobility-as-a-service.",
  },
  {
    id: "010",
    type: "image",
    title: "Regional Market Dynamics",
    bullets: [
      "China: Largest EV market, strong domestic brands",
      "Europe: Strict emissions regulations, premium focus",
      "North America: Tech innovation, autonomous leadership",
      "India: Growing middle class, affordable mobility",
      "Southeast Asia: Emerging markets, two-wheeler dominance",
    ],
    imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop",
    narration: "China leads EV production with comprehensive infrastructure and government support. Europe focuses on sustainability with strict regulations and premium engineering. North America drives autonomous technology innovation, while India emphasizes affordable mobility solutions.",
  },
  {
    id: "011",
    type: "bullets",
    title: "Digital Transformation",
    bullets: [
      "Digital twins for virtual testing and prototyping",
      "AI-powered quality control and defect detection",
      "Robotic process automation in manufacturing",
      "Cloud-based fleet management systems",
      "Augmented reality for maintenance and repair",
      "Big data analytics for predictive maintenance",
      "Digital marketplaces for used vehicle transactions",
    ],
    bulletAccents: ["Digital twins", "AI-powered", "Robotic process automation", "Augmented reality"],
    narration:
      "Digital transformation uses AI for quality control, robotic automation for assembly, and digital twins for virtual testing. Cloud-based systems manage fleets, while augmented reality assists maintenance. IoT connects manufacturing processes and cybersecurity protects digital systems.",
  },
  {
    id: "012",
    type: "paragraphs",
    title: "Workforce of the",
    titleAccent: "Future",
    paragraphs: [
      "The automotive industry is experiencing a skills gap as traditional manufacturing roles evolve toward technology-driven positions. Electric and autonomous vehicle development requires expertise in battery chemistry, software engineering, and artificial intelligence. Manufacturers are investing heavily in retraining programs to upskill existing employees.",
      "New roles are emerging in areas like autonomous vehicle testing, cybersecurity, and data analytics. The industry is partnering with educational institutions to develop specialized training programs. Women and underrepresented groups are being actively recruited to bring diverse perspectives to innovation teams.",
      "Remote work and flexible arrangements are becoming more common, particularly in software development and digital operations. The industry is also exploring four-day workweeks and improved work-life balance initiatives to attract top talent in competitive labor markets.",
    ],
    paragraphAccents: ["skills gap", "artificial intelligence", "diverse perspectives", "four-day workweeks"],
    footer: "World Economic Forum - Future of Jobs in Automotive 2024",
    narration: "The automotive workforce is transitioning from mechanical to technology-driven roles requiring skills in battery chemistry, AI, and software engineering. Companies provide retraining programs and embrace diversity, while new roles emerge in autonomous testing and cybersecurity.",
  },
  {
    id: "013",
    type: "image",
    title: "Advanced Materials Innovation",
    bullets: [
      "Carbon fiber composites for lightweight structures",
      "Advanced high-strength steel alloys",
      "Recyclable thermoplastics and bio-materials",
      "Self-healing coatings and paints",
      "Nanotechnology-enhanced components",
    ],
    imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop",
    narration: "Advanced materials like carbon fiber composites and high-strength steel enable lighter, stronger vehicles. Self-healing coatings and nanotechnology enhance durability, while recyclable materials support sustainability goals and improve fuel efficiency.",
  },
  {
    id: "014",
    type: "bullets",
    title: "Supply Chain Resilience",
    bullets: [
      "Diversification of semiconductor suppliers",
      "Local battery material production facilities",
      "Strategic rare earth mineral partnerships",
      "Digital supply chain visibility platforms",
      "Automated inventory management systems",
      "Risk assessment and contingency planning",
      "Sustainable sourcing certification programs",
    ],
    bulletAccents: ["Diversification", "Local battery material production", "Digital supply chain", "Sustainable sourcing"],
    narration:
      "Manufacturers are diversifying suppliers and investing in local battery material production to build resilient supply chains. Digital platforms provide real-time visibility, while AI optimizes inventory management and blockchain improves traceability.",
  },
  {
    id: "015",
    type: "paragraphs",
    title: "Consumer Behavior",
    titleAccent: "Evolution",
    paragraphs: [
      "Today's consumers are increasingly prioritizing sustainability, safety, and connectivity when purchasing vehicles. Electric vehicles are seen as status symbols in many markets, while younger generations are more open to shared mobility solutions. The average vehicle ownership age has increased, with consumers keeping cars longer due to improved reliability and resale value.",
      "Digital purchasing experiences are becoming essential, with virtual showrooms, online configuration tools, and seamless financing options. Subscription-based models for software features and insurance are gaining popularity. Consumers expect personalized experiences, from customized infotainment to predictive maintenance alerts.",
      "Brand loyalty is shifting toward technology leaders rather than traditional manufacturers. Social media and user reviews heavily influence purchasing decisions. The rise of over-the-air updates means consumers expect continuous improvement and new features throughout the vehicle's lifecycle.",
    ],
    paragraphAccents: ["sustainability, safety, and connectivity", "shared mobility solutions", "Digital purchasing", "continuous improvement"],
    footer: "Nielsen Automotive Consumer Report 2024",
    narration: "Consumers prioritize sustainability and digital experiences when purchasing vehicles. Electric vehicles gain status appeal, while subscription models and over-the-air updates become expected features. Brand loyalty shifts toward technology leaders like Tesla.",
  },
  {
    id: "016",
    type: "image",
    title: "Urban Mobility Solutions",
    bullets: [
      "Micro-mobility: E-scooters and e-bikes",
      "Autonomous shuttles for last-mile connectivity",
      "Integrated public transit systems",
      "Smart parking and traffic management",
      "Electric delivery vehicles and drones",
    ],
    imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop",
    narration: "Cities adopt micro-mobility solutions like e-scooters and e-bikes for last-mile connectivity. Autonomous shuttles, smart parking, and electric delivery vehicles address urban challenges. Integrated systems combine multiple transportation modes through unified platforms.",
  },
  {
    id: "017",
    type: "bullets",
    title: "Regulatory Landscape",
    bullets: [
      "EU Green Deal: Carbon neutrality by 2050",
      "California ZEV mandate: 100% zero-emission sales by 2035",
      "China's NEV credits and phase-out policies",
      "India's electric vehicle adoption targets",
      "Global harmonization of safety standards",
      "Data privacy regulations for connected vehicles",
      "Autonomous vehicle testing and deployment frameworks",
    ],
    bulletAccents: ["Carbon neutrality by 2050", "100% zero-emission sales by 2035", "NEV credits", "Data privacy regulations"],
    narration:
      "The EU's Green Deal targets carbon neutrality by 2050, while California mandates 100% zero-emission sales by 2035. China's NEV policies drive EV adoption, and global standards harmonize safety requirements for autonomous vehicles.",
  },
  {
    id: "018",
    type: "paragraphs",
    title: "Investment and",
    titleAccent: "Innovation Ecosystem",
    paragraphs: [
      "The automotive industry is attracting unprecedented investment, with venture capital funding for mobility startups exceeding $50 billion annually. Traditional automakers are forming partnerships with tech companies, while new entrants are disrupting established business models. Governments are providing subsidies and incentives to accelerate innovation in clean transportation.",
      "Research and development spending has reached record levels, with focus areas including battery technology, autonomous systems, and sustainable materials. Open innovation platforms are enabling collaboration between competitors, suppliers, and startups. Intellectual property sharing and joint ventures are becoming common in the industry.",
      "Startup ecosystems are thriving in automotive hubs like Silicon Valley, Detroit, Stuttgart, and Shanghai. Incubators and accelerators are nurturing innovative solutions for mobility challenges. The industry is also investing in educational partnerships to develop the next generation of automotive engineers and designers.",
    ],
    paragraphAccents: ["$50 billion annually", "unprecedented investment", "Open innovation", "educational partnerships"],
    footer: "CB Insights - Global Mobility Investment Report 2024",
    narration: "Venture capital funding exceeds $50 billion annually for mobility startups. Traditional automakers partner with tech companies, while governments provide subsidies and research funding. Open innovation platforms foster collaboration across the industry.",
  },
  {
    id: "019",
    type: "image",
    title: "Smart Manufacturing 4.0",
    bullets: [
      "Industrial IoT sensors and real-time monitoring",
      "AI-driven predictive maintenance",
      "Collaborative robots and human-machine interfaces",
      "Digital quality assurance systems",
      "Flexible production lines for customization",
    ],
    imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop",
    narration: "IoT sensors enable real-time monitoring and predictive maintenance in manufacturing. Collaborative robots work with humans, while digital quality systems use AI for defect detection. Flexible production lines adapt quickly to market demands.",
  },
  {
    id: "020",
    type: "bullets",
    title: "Key Success Factors",
    bullets: [
      "Strong partnerships between OEMs and tech companies",
      "Investment in research and development",
      "Adaptation to changing consumer preferences",
      "Resilient and diversified supply chains",
      "Commitment to sustainability and ESG goals",
      "Digital transformation and data utilization",
      "Talent development and workforce planning",
      "Regulatory compliance and proactive engagement",
    ],
    bulletAccents: ["Strong partnerships", "Investment in R&D", "sustainability", "Digital transformation"],
    narration:
      "Success requires strong OEM-tech partnerships, substantial R&D investment, and adaptation to consumer preferences. Companies must build resilient supply chains, commit to sustainability, and embrace digital transformation while managing regulatory compliance and risk.",
  },
];
