/**
 * AI Heaven - Geospatial Vector Cartography & Tech Hub Definitions
 * High-precision Equirectangular (Plate Carrée) SVG vector coordinates.
 * Normalized to 2000 x 1000 coordinate space for ultra-sharp 4K rendering.
 */

export interface TechHub {
  id: string;
  name: string;
  region: 'North America' | 'Europe' | 'Asia-Pacific' | 'Middle East' | 'Other';
  country: string;
  lat: number;
  lng: number;
  description: string;
  nodeCount: number;
  highlightedEntitySlugs: string[];
}

// Convert geographic latitude (-90 to +90) and longitude (-180 to +180) to canvas (2000 x 1000)
export function geoToCanvas(lat: number, lng: number): { x: number; y: number } {
  const x = ((lng + 180) / 360) * 2000;
  const y = ((90 - lat) / 180) * 1000;
  return { x, y };
}

// Pre-calculated major tech hubs
export const GLOBAL_TECH_HUBS: TechHub[] = [
  {
    id: 'hub_silicon_valley',
    name: 'Silicon Valley & SF Bay',
    region: 'North America',
    country: 'United States',
    lat: 37.7749,
    lng: -122.4194,
    description: 'Global epicenter of generative frontier models and foundational venture funding.',
    nodeCount: 14,
    highlightedEntitySlugs: ['openai', 'anthropic', 'meta-fair', 'ollama', 'vllm'],
  },
  {
    id: 'hub_seattle',
    name: 'Seattle / Redmond',
    region: 'North America',
    country: 'United States',
    lat: 47.6062,
    lng: -122.3321,
    description: 'Cloud hyper-scale infrastructure, Azure AI, and Amazon Bedrock clusters.',
    nodeCount: 4,
    highlightedEntitySlugs: ['microsoft-azure', 'aws-bedrock'],
  },
  {
    id: 'hub_nyc',
    name: 'New York (Silicon Alley)',
    region: 'North America',
    country: 'United States',
    lat: 40.7128,
    lng: -74.006,
    description: 'Open source model repositories, enterprise fintech AI, and Hugging Face headquarters.',
    nodeCount: 5,
    highlightedEntitySlugs: ['hugging-face', 'transformers-repo'],
  },
  {
    id: 'hub_toronto',
    name: 'Toronto AI Corridor',
    region: 'North America',
    country: 'Canada',
    lat: 43.6532,
    lng: -79.3832,
    description: 'Foundational deep learning research, Vector Institute, and enterprise LLM pioneers.',
    nodeCount: 3,
    highlightedEntitySlugs: ['cohere', 'vector-institute'],
  },
  {
    id: 'hub_london',
    name: 'London Deep Tech',
    region: 'Europe',
    country: 'United Kingdom',
    lat: 51.5074,
    lng: -0.1278,
    description: 'Google DeepMind headquarters, Turing Institute, and frontier scientific AI.',
    nodeCount: 6,
    highlightedEntitySlugs: ['google-deepmind', 'gemini-1-5-pro'],
  },
  {
    id: 'hub_paris',
    name: 'Paris AI Station F Hub',
    region: 'Europe',
    country: 'France',
    lat: 48.8566,
    lng: 2.3522,
    description: 'European open weights stronghold, Mistral AI headquarters, and Kyutai research lab.',
    nodeCount: 6,
    highlightedEntitySlugs: ['mistral-ai', 'fineweb-dataset'],
  },
  {
    id: 'hub_berlin',
    name: 'Berlin Tech Ecosystem',
    region: 'Europe',
    country: 'Germany',
    lat: 52.52,
    lng: 13.405,
    description: 'High-performance vector retrieval, Qdrant headquarters, and open multimodal software.',
    nodeCount: 3,
    highlightedEntitySlugs: ['qdrant'],
  },
  {
    id: 'hub_zurich',
    name: 'Zurich AI Hub',
    region: 'Europe',
    country: 'Switzerland',
    lat: 47.3769,
    lng: 8.5417,
    description: 'ETH Zurich AI center, robotic autonomy, and Google EMEA engineering center.',
    nodeCount: 2,
    highlightedEntitySlugs: ['eth-zurich'],
  },
  {
    id: 'hub_tokyo',
    name: 'Tokyo Robotics & AI Hub',
    region: 'Asia-Pacific',
    country: 'Japan',
    lat: 35.6762,
    lng: 139.6503,
    description: 'Embodied intelligence, supercomputing clusters (ABCI), and Sakana AI.',
    nodeCount: 3,
    highlightedEntitySlugs: ['sakana-ai'],
  },
  {
    id: 'hub_beijing',
    name: 'Beijing Zhongguancun',
    region: 'Asia-Pacific',
    country: 'China',
    lat: 39.9042,
    lng: 116.4074,
    description: 'Major national research laboratories, Tsinghua AI Institute, and frontier LLM labs.',
    nodeCount: 5,
    highlightedEntitySlugs: ['tsinghua-ai'],
  },
  {
    id: 'hub_hangzhou',
    name: 'Hangzhou Innovation Corridor',
    region: 'Asia-Pacific',
    country: 'China',
    lat: 30.2741,
    lng: 120.1551,
    description: 'DeepSeek research campus, Alibaba DAMO Academy, and ultra-efficient MLA architectures.',
    nodeCount: 4,
    highlightedEntitySlugs: ['deepseek-ai', 'deepseek-v3'],
  },
  {
    id: 'hub_singapore',
    name: 'Singapore One-North Hub',
    region: 'Asia-Pacific',
    country: 'Singapore',
    lat: 1.3521,
    lng: 103.8198,
    description: 'Southeast Asian AI gateway, AI Singapore Sea-Lion LLM, and sovereign AI compute.',
    nodeCount: 2,
    highlightedEntitySlugs: ['ai-singapore'],
  },
  {
    id: 'hub_tel_aviv',
    name: 'Tel Aviv Silicon Wadi',
    region: 'Middle East',
    country: 'Israel',
    lat: 32.0853,
    lng: 34.7818,
    description: 'AI cybersecurity, hardware acceleration accelerators, and AI21 Labs.',
    nodeCount: 3,
    highlightedEntitySlugs: ['ai21-labs'],
  },
  {
    id: 'hub_sydney',
    name: 'Sydney Tech Central',
    region: 'Asia-Pacific',
    country: 'Australia',
    lat: -33.8688,
    lng: 151.2093,
    description: 'Australasian machine learning research, CSIRO Data61, and enterprise AI delivery.',
    nodeCount: 2,
    highlightedEntitySlugs: ['data61'],
  },
];

/**
 * Detailed, crisp multi-polygon paths for continents, landmasses, peninsulas and major islands.
 * Normalized to 2000 x 1000 canvas.
 */
export const HIGH_PRECISION_WORLD_LAND: { id: string; name: string; d: string }[] = [
  {
    id: 'north_america_main',
    name: 'North America',
    d: `
      M 310,130 
      L 345,115 L 390,110 L 460,95 L 530,95 L 565,110 L 590,120 L 610,105 L 640,110 
      L 670,135 L 685,160 L 670,185 L 645,195 L 620,190 L 595,205 L 590,230 L 605,250 
      L 625,245 L 655,270 L 640,300 L 600,290 L 575,275 L 555,290 L 550,335 L 560,370 
      L 540,385 L 520,380 L 490,425 L 485,465 L 470,490 L 440,515 L 415,550 L 400,580 
      L 380,595 L 375,560 L 370,520 L 350,470 L 330,440 L 320,390 L 335,360 L 330,310 
      L 310,270 L 290,240 L 275,200 L 260,175 L 285,150 Z
    `,
  },
  {
    id: 'florida_baja',
    name: 'Baja & Florida details',
    d: `
      M 330,440 L 340,490 L 335,530 L 325,520 L 325,470 Z
      M 545,395 L 560,430 L 550,450 L 540,425 Z
    `,
  },
  {
    id: 'alaska_aleutians',
    name: 'Alaska & North Pacific',
    d: `
      M 160,150 L 220,140 L 260,150 L 275,180 L 250,205 L 210,210 L 175,200 L 150,180 Z
      M 110,210 L 140,205 L 160,200 L 130,215 Z
    `,
  },
  {
    id: 'greenland',
    name: 'Greenland',
    d: `
      M 750,75 L 810,65 L 860,80 L 890,120 L 860,165 L 820,195 L 775,190 L 755,145 Z
    `,
  },
  {
    id: 'south_america',
    name: 'South America',
    d: `
      M 435,545 L 480,535 L 530,545 L 570,570 L 610,600 L 640,645 L 645,690 L 620,725 
      L 580,770 L 550,820 L 525,870 L 500,920 L 490,950 L 475,930 L 475,880 L 490,830 
      L 480,780 L 460,730 L 440,670 L 420,620 L 420,575 Z
    `,
  },
  {
    id: 'europe_main',
    name: 'Continental Europe',
    d: `
      M 970,190 L 1020,180 L 1060,185 L 1100,195 L 1140,205 L 1180,210 L 1210,240 
      L 1220,280 L 1195,305 L 1170,330 L 1130,345 L 1100,340 L 1060,355 L 1040,380 
      L 1000,385 L 970,375 L 945,350 L 950,300 L 935,270 L 945,230 L 960,205 Z
    `,
  },
  {
    id: 'scandinavia',
    name: 'Scandinavia',
    d: `
      M 1030,110 L 1070,95 L 1110,110 L 1130,140 L 1110,175 L 1075,185 L 1050,170 
      L 1030,135 Z
    `,
  },
  {
    id: 'british_isles',
    name: 'British Isles & Ireland',
    d: `
      M 945,210 L 965,200 L 975,225 L 960,250 L 940,245 Z
      M 915,220 L 935,215 L 935,240 L 920,245 Z
    `,
  },
  {
    id: 'iberia_italy',
    name: 'Iberian Peninsula & Italy',
    d: `
      M 935,360 L 970,355 L 980,385 L 950,410 L 930,395 Z
      M 1050,365 L 1070,385 L 1080,415 L 1065,420 L 1045,385 Z
    `,
  },
  {
    id: 'africa_main',
    name: 'Africa',
    d: `
      M 940,430 L 1000,410 L 1060,420 L 1120,415 L 1160,430 L 1200,470 L 1225,510 
      L 1250,560 L 1230,620 L 1200,670 L 1175,730 L 1145,800 L 1110,845 L 1075,860 
      L 1040,820 L 1030,760 L 1000,700 L 980,630 L 960,570 L 910,540 L 890,490 
      L 905,455 Z
    `,
  },
  {
    id: 'madagascar',
    name: 'Madagascar',
    d: `
      M 1250,710 L 1270,730 L 1260,780 L 1240,795 L 1235,745 Z
    `,
  },
  {
    id: 'middle_east',
    name: 'Middle East & Arabian Peninsula',
    d: `
      M 1170,370 L 1220,360 L 1260,390 L 1290,430 L 1270,480 L 1230,500 L 1195,480 
      L 1180,430 Z
    `,
  },
  {
    id: 'asia_russia',
    name: 'Northern Asia & Siberia',
    d: `
      M 1220,110 L 1320,95 L 1440,90 L 1560,95 L 1680,105 L 1780,115 L 1830,135 
      L 1820,170 L 1750,210 L 1680,240 L 1580,260 L 1480,265 L 1360,250 L 1270,225 
      L 1230,170 Z
    `,
  },
  {
    id: 'asia_central_south',
    name: 'Central, South & East Asia',
    d: `
      M 1250,260 L 1350,260 L 1450,270 L 1560,290 L 1630,320 L 1690,360 L 1710,400 
      L 1680,440 L 1630,470 L 1570,480 L 1510,520 L 1470,570 L 1440,610 L 1410,580 
      L 1380,510 L 1350,450 L 1310,410 L 1280,360 L 1260,310 Z
    `,
  },
  {
    id: 'japan',
    name: 'Japan Archipelago',
    d: `
      M 1740,310 L 1770,330 L 1780,360 L 1750,385 L 1730,370 L 1745,340 Z
    `,
  },
  {
    id: 'southeast_asia_indonesia',
    name: 'Southeast Asia & Indonesia',
    d: `
      M 1520,530 L 1560,560 L 1550,600 L 1525,605 L 1515,565 Z
      M 1580,610 L 1630,620 L 1670,625 L 1620,640 L 1570,630 Z
      M 1670,580 L 1710,590 L 1710,640 L 1660,630 Z
    `,
  },
  {
    id: 'australia',
    name: 'Australia & Oceania',
    d: `
      M 1630,680 L 1710,660 L 1770,690 L 1800,740 L 1790,800 L 1750,850 L 1680,860 
      L 1610,830 L 1580,780 L 1585,725 Z
    `,
  },
  {
    id: 'new_zealand',
    name: 'New Zealand',
    d: `
      M 1880,830 L 1910,850 L 1890,885 L 1870,865 Z
      M 1860,890 L 1880,915 L 1865,940 L 1845,920 Z
    `,
  },
];

// Major geopolitical graticules
export const LATITUDE_GRATICULES = [
  { lat: 66.5, label: '66.5° N ARCTIC CIRCLE', y: 130 },
  { lat: 45.0, label: '45.0° N', y: 250 },
  { lat: 23.5, label: '23.5° N TROPIC OF CANCER', y: 369 },
  { lat: 0.0, label: '0.0° EQUATOR', y: 500, highlight: true },
  { lat: -23.5, label: '23.5° S TROPIC OF CAPRICORN', y: 631 },
  { lat: -45.0, label: '45.0° S', y: 750 },
  { lat: -66.5, label: '66.5° S ANTARCTIC CIRCLE', y: 870 },
];

export const LONGITUDE_GRATICULES = [
  { lng: -120, label: '120° W', x: 333 },
  { lng: -60, label: '60° W', x: 666 },
  { lng: 0, label: '0° PRIME MERIDIAN', x: 1000, highlight: true },
  { lng: 60, label: '60° E', x: 1333 },
  { lng: 120, label: '120° E', x: 1666 },
];
