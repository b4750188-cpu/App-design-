/**
 * Business-Specific Website Needs & Industry Taxonomy Engine
 * Maps real business types into standard industry classifications and identifies
 * tailored functional requirements (e.g. Menu & Online Ordering for restaurants,
 * Online Booking for dentists, Portfolio & Quotes for contractors).
 */

export interface IndustryDefinition {
  code: string;
  name: string;
  keywords: string[];
  types: string[]; // Google Places types
  recommendedWebsiteTypes: string[];
  essentialFeatures: string[];
  optionalFeatures: string[];
  rationale: string;
}

export const INDUSTRY_TAXONOMY: Record<string, IndustryDefinition> = {
  restaurant: {
    code: 'restaurant',
    name: 'Food & Drink (Restaurants & Cafes)',
    keywords: ['restaurant', 'cafe', 'bakery', 'bar', 'food', 'pizza', 'diner', 'bistro', 'eatery', 'coffee'],
    types: ['restaurant', 'cafe', 'bakery', 'bar', 'meal_takeaway', 'meal_delivery'],
    recommendedWebsiteTypes: ['Restaurant Website', 'Menu Website', 'Online Ordering & Reservation Portal'],
    essentialFeatures: ['Digital Menu', 'Operating Hours', 'Location & Directions', 'Contact Number', 'Mobile-Friendly Layout'],
    optionalFeatures: ['Table Reservation System', 'Direct Online Ordering', 'Delivery Info', 'Food Photography Gallery'],
    rationale: 'Dining customers primarily search on mobile devices for food options, opening hours, menus, and reservation or takeout availability.',
  },
  dental_medical: {
    code: 'dental_medical',
    name: 'Healthcare & Dental',
    keywords: ['dentist', 'dental', 'clinic', 'doctor', 'hospital', 'orthodontist', 'physician', 'pediatrician', 'medical'],
    types: ['dentist', 'doctor', 'hospital', 'health', 'physiotherapist'],
    recommendedWebsiteTypes: ['Healthcare Practice Website', 'Appointment Booking Portal'],
    essentialFeatures: ['Practice Areas & Treatments', 'Practitioner Credentials', 'Opening Hours & Location', 'Appointment Request Form', 'Emergency Contact'],
    optionalFeatures: ['Real-Time Calendar Booking', 'Patient Intake Forms', 'Insurance & Payment Policies', 'Patient Testimonials'],
    rationale: 'Patients seek verified clinical credentials, accessible scheduling, and insurance coverage information.',
  },
  legal: {
    code: 'legal',
    name: 'Legal Services',
    keywords: ['lawyer', 'attorney', 'law firm', 'legal', 'solicitor', 'advocate', 'counsel'],
    types: ['lawyer'],
    recommendedWebsiteTypes: ['Legal Practice Website', 'Consultation Lead Generation'],
    essentialFeatures: ['Practice Areas', 'Attorney Biographies', 'Consultation Request Form', 'Office Locations', 'Confidential Contact Methods'],
    optionalFeatures: ['Case Studies & Track Record', 'Legal FAQ / Articles', 'Direct Chat Integration'],
    rationale: 'Legal clients require reassurance of expertise, clear practice focus, and direct, private channels to request a case consultation.',
  },
  hospitality: {
    code: 'hospitality',
    name: 'Hospitality & Hotels',
    keywords: ['hotel', 'resort', 'motel', 'inn', 'hostel', 'guest house', 'lodging', 'bed and breakfast'],
    types: ['lodging', 'hotel'],
    recommendedWebsiteTypes: ['Hospitality Booking Website', 'Hotel Showcase'],
    essentialFeatures: ['Room Types & Rates', 'Room Photos & Virtual Tours', 'Amenities List', 'Direct Booking Engine', 'Check-in Policies & Map'],
    optionalFeatures: ['Package Deals', 'Local Attractions Guide', 'Airport Transfer Booking', 'Multi-Language Support'],
    rationale: 'Direct website bookings save hotel operators high commission fees from third-party travel aggregators.',
  },
  real_estate: {
    code: 'real_estate',
    name: 'Real Estate & Properties',
    keywords: ['real estate', 'property', 'realtor', 'broker', 'apartments', 'housing'],
    types: ['real_estate_agency'],
    recommendedWebsiteTypes: ['Property Listing Portal', 'Agent Portfolio'],
    essentialFeatures: ['Property Listings with Filters', 'High-Res Galleries & Floorplans', 'Agent Profiles', 'Viewing Request Forms', 'Neighborhood Guides'],
    optionalFeatures: ['Mortgage Calculator', 'Virtual Video Tours', 'Seller Valuation Request'],
    rationale: 'Real estate clients expect responsive property search with rich imagery and immediate viewing coordination.',
  },
  construction_trade: {
    code: 'construction_trade',
    name: 'Construction & Home Services',
    keywords: ['plumber', 'electrician', 'contractor', 'roofing', 'hvac', 'painter', 'builder', 'carpenter', 'remodeling'],
    types: ['roofing_contractor', 'plumber', 'electrician', 'general_contractor', 'painter'],
    recommendedWebsiteTypes: ['Trade Service Website', 'Lead Generation & Quote Portal'],
    essentialFeatures: ['Detailed Services List', 'Coverage & Service Areas', 'Click-to-Call Phone', 'Free Quote Request Form', 'Past Project Portfolio'],
    optionalFeatures: ['Emergency 24/7 Call Button', 'WhatsApp Direct Chat', 'Customer Reviews & Licensure Badges'],
    rationale: 'Homeowners need fast contact access during emergencies and verifiable proof of previous high-quality workmanship.',
  },
  beauty_wellness: {
    code: 'beauty_wellness',
    name: 'Beauty, Salon & Wellness',
    keywords: ['salon', 'spa', 'barber', 'hair', 'nails', 'massage', 'cosmetics', 'esthetician'],
    types: ['hair_care', 'beauty_salon', 'spa'],
    recommendedWebsiteTypes: ['Salon Portfolio & Booking Website'],
    essentialFeatures: ['Service Menu with Pricing', 'Work Gallery / Lookbook', 'Online Appointment Scheduling', 'Staff Profiles', 'Location & Hours'],
    optionalFeatures: ['Product Sales / E-commerce', 'Gift Cards', 'Instagram Live Feed'],
    rationale: 'Clients look for visual quality through recent hairstyle/nail photos and prefer self-service online appointment booking.',
  },
  fitness_sports: {
    code: 'fitness_sports',
    name: 'Fitness & Gyms',
    keywords: ['gym', 'fitness', 'crossfit', 'yoga', 'pilates', 'martial arts', 'personal trainer'],
    types: ['gym'],
    recommendedWebsiteTypes: ['Membership Website', 'Class Schedule & Trial Booking'],
    essentialFeatures: ['Membership Options & Pricing', 'Class Timetable', 'Trainer Profiles', 'Free Trial Pass Form', 'Facility Amenities Photos'],
    optionalFeatures: ['Member Portal', 'Online Class Booking', 'Nutrition Blog'],
    rationale: 'Prospective gym members want transparent membership pricing, class schedules, and a simple way to book an introductory session.',
  },
  automotive: {
    code: 'automotive',
    name: 'Automotive & Repair',
    keywords: ['auto repair', 'car repair', 'mechanic', 'car dealer', 'tires', 'oil change', 'body shop'],
    types: ['car_repair', 'car_dealer', 'car_wash'],
    recommendedWebsiteTypes: ['Automotive Service Website', 'Inventory & Booking Portal'],
    essentialFeatures: ['Repair Services Offered', 'Quote / Estimate Request', 'Service Appointment Booking', 'Vehicle Inventory (if dealer)', 'Location & Emergency Towing'],
    optionalFeatures: ['Maintenance Checklist', 'Warranty Information', 'Customer Reviews'],
    rationale: 'Car owners require trusted estimates, clear service offerings, and quick appointment setting.',
  },
  retail_ecommerce: {
    code: 'retail_ecommerce',
    name: 'Retail & Specialty Stores',
    keywords: ['store', 'shop', 'boutique', 'market', 'florist', 'bookstore', 'clothing', 'jewelry'],
    types: ['store', 'clothing_store', 'jewelry_store', 'florist', 'book_store'],
    recommendedWebsiteTypes: ['E-Commerce Store', 'Retail Catalog & Storefront Website'],
    essentialFeatures: ['Product Catalog with Search', 'Store Locations & Hours', 'In-Store Pickup / Shipping Info', 'Clear Contact Details'],
    optionalFeatures: ['Online Checkout & Payment Gateway', 'Customer Reviews', 'Inventory Availability Checker'],
    rationale: 'Local retail stores expand their customer reach exponentially by offering online catalogs and click-and-collect options.',
  },
  professional_services: {
    code: 'professional_services',
    name: 'Professional Consulting & Finance',
    keywords: ['consulting', 'accounting', 'cpa', 'tax', 'financial advisor', 'marketing agency', 'architect'],
    types: ['accounting', 'finance'],
    recommendedWebsiteTypes: ['Corporate Service Website', 'Consultancy Portfolio'],
    essentialFeatures: ['Services Breakdown', 'Case Studies / Client Results', 'About Company & Leadership', 'Consultation Request Form'],
    optionalFeatures: ['Whitepapers / Insights Blog', 'Interactive ROI / Tax Calculator'],
    rationale: 'B2B clients require strong authority signals, demonstrated case outcomes, and clear avenues to book strategy consultations.',
  },
  education: {
    code: 'education',
    name: 'Education & Training',
    keywords: ['school', 'academy', 'tutoring', 'college', 'training', 'institute', 'dance school', 'music lessons'],
    types: ['school', 'university'],
    recommendedWebsiteTypes: ['Educational Institution Website', 'Course Enrollment Portal'],
    essentialFeatures: ['Curriculum & Programs', 'Admissions Information', 'Faculty Profiles', 'Campus Tour / Facilities', 'Inquiry & Application Form'],
    optionalFeatures: ['Student Portal', 'Event Calendar', 'Tuition Fees Breakdown'],
    rationale: 'Students and parents look for transparent curricula, accreditation credentials, and simple application workflows.',
  },
};

/**
 * Classify a business into an industry group based on its name, category, and provider types
 */
export function classifyBusinessIndustry(
  name: string,
  primaryType?: string,
  allTypes: string[] = []
): IndustryDefinition {
  const normalizedName = (name || '').toLowerCase();
  const normalizedTypes = [primaryType || '', ...allTypes].map((t) => t.toLowerCase());

  // 1. Direct type matching
  for (const ind of Object.values(INDUSTRY_TAXONOMY)) {
    if (normalizedTypes.some((t) => ind.types.includes(t))) {
      return ind;
    }
  }

  // 2. Keyword matching in name or types
  for (const ind of Object.values(INDUSTRY_TAXONOMY)) {
    const matched = ind.keywords.some(
      (kw) => normalizedName.includes(kw) || normalizedTypes.some((t) => t.includes(kw))
    );
    if (matched) {
      return ind;
    }
  }

  // Default fallback: General Business
  return {
    code: 'general_business',
    name: 'General Business & Commercial Services',
    keywords: [],
    types: [],
    recommendedWebsiteTypes: ['Modern Business Website', 'Lead Generation & Service Showcase'],
    essentialFeatures: ['About Us & Core Mission', 'Services & Value Proposition', 'Contact Form & Location', 'Opening Hours'],
    optionalFeatures: ['Customer Testimonials', 'Direct Messaging Link', 'Google Maps Embed'],
    rationale: 'A modern, accessible digital presence establishes legitimacy, answers customer inquiries, and drives new client acquisition.',
  };
}
