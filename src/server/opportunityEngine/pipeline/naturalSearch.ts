/**
 * Global Search & Natural Language Query Parser
 * Interprets natural language queries like:
 * - "AI internships in Europe"
 * - "Fully funded opportunities for computer science students"
 * - "AI startups in Pakistan"
 * - "Research opportunities in robotics"
 * - "Accelerators in Asia"
 */

import {
  StructuredOpportunity,
  StructuredOrganization,
  StructuredPersona,
  GlobalSearchQuery,
  GlobalSearchResult,
  OpportunityType,
} from '../types.ts';

// Region & country dictionary
const REGION_MAP: Record<string, string[]> = {
  europe: ['europe', 'eu', 'germany', 'france', 'united kingdom', 'uk', 'switzerland', 'netherlands', 'sweden'],
  asia: ['asia', 'pakistan', 'india', 'japan', 'singapore', 'china', 'south korea', 'taiwan'],
  'north america': ['north america', 'usa', 'united states', 'canada', 'us'],
  pakistan: ['pakistan', 'islamabad', 'lahore', 'karachi'],
  germany: ['germany', 'berlin', 'munich'],
  france: ['france', 'paris'],
  'united kingdom': ['united kingdom', 'uk', 'london', 'oxford', 'cambridge'],
};

// Opportunity Type synonyms
const TYPE_SYNONYMS: Record<string, OpportunityType[]> = {
  internship: ['INTERNSHIP'],
  internships: ['INTERNSHIP'],
  job: ['JOB', 'INTERNSHIP'],
  jobs: ['JOB', 'INTERNSHIP'],
  grant: ['GRANT'],
  grants: ['GRANT'],
  funding: ['GRANT', 'VENTURE_FUNDING', 'ACCELERATOR'],
  fellowship: ['FELLOWSHIP', 'RESEARCH_PROGRAM'],
  fellowships: ['FELLOWSHIP', 'RESEARCH_PROGRAM'],
  scholarship: ['SCHOLARSHIP'],
  scholarships: ['SCHOLARSHIP'],
  accelerator: ['ACCELERATOR', 'STARTUP_PROGRAM'],
  accelerators: ['ACCELERATOR', 'STARTUP_PROGRAM'],
  incubator: ['INCUBATOR', 'STARTUP_PROGRAM'],
  incubators: ['INCUBATOR', 'STARTUP_PROGRAM'],
  startup: ['STARTUP_PROGRAM', 'ACCELERATOR', 'VENTURE_FUNDING'],
  startups: ['STARTUP_PROGRAM', 'ACCELERATOR', 'VENTURE_FUNDING'],
  hackathon: ['HACKATHON', 'COMPETITION'],
  hackathons: ['HACKATHON', 'COMPETITION'],
  competition: ['COMPETITION', 'HACKATHON'],
  research: ['RESEARCH_PROGRAM', 'FELLOWSHIP'],
};

export function parseNaturalLanguageQuery(queryStr: string): {
  normalizedQuery: string;
  detectedRegion?: string;
  detectedTypes?: OpportunityType[];
  keywords: string[];
  requiresFunding?: boolean;
  studentAudience?: boolean;
} {
  const q = queryStr.toLowerCase().trim();
  const words = q.split(/\s+/).filter(Boolean);

  let detectedRegion: string | undefined;
  for (const [reg, aliases] of Object.entries(REGION_MAP)) {
    if (aliases.some((alias) => q.includes(alias))) {
      detectedRegion = reg;
      break;
    }
  }

  const detectedTypesSet = new Set<OpportunityType>();
  words.forEach((word) => {
    const matched = TYPE_SYNONYMS[word];
    if (matched) {
      matched.forEach((t) => detectedTypesSet.add(t));
    }
  });

  const requiresFunding = q.includes('fully funded') || q.includes('funded') || q.includes('stipend');
  const studentAudience = q.includes('student') || q.includes('undergraduate') || q.includes('phd');

  // Filter out stop words for core semantic keywords
  const stopWords = new Set(['in', 'for', 'of', 'and', 'the', 'a', 'to', 'with', 'opportunities', 'opportunity']);
  const keywords = words.filter((w) => !stopWords.has(w));

  return {
    normalizedQuery: q,
    detectedRegion,
    detectedTypes: detectedTypesSet.size > 0 ? Array.from(detectedTypesSet) : undefined,
    keywords,
    requiresFunding,
    studentAudience,
  };
}

export function executeGlobalSearch(
  query: GlobalSearchQuery,
  opportunities: StructuredOpportunity[],
  organizations: StructuredOrganization[],
  personas: StructuredPersona[]
): GlobalSearchResult {
  const queryStr = query.query?.trim() || '';
  const parsed = queryStr ? parseNaturalLanguageQuery(queryStr) : null;

  // 1. Filter & Score Opportunities
  const matchedOpportunities = opportunities
    .map((opp) => {
      let score = 0;

      // Type Filter
      if (query.opportunityType && opp.opportunityType !== query.opportunityType) {
        return { opp, score: -1 };
      }
      if (parsed?.detectedTypes && parsed.detectedTypes.length > 0) {
        if (parsed.detectedTypes.includes(opp.opportunityType)) {
          score += 40;
        }
      }

      // Region / Location Filter
      if (query.country && opp.location.country.toLowerCase() !== query.country.toLowerCase()) {
        return { opp, score: -1 };
      }
      if (parsed?.detectedRegion) {
        const oppLoc = `${opp.location.country} ${opp.location.region} ${opp.location.city}`.toLowerCase();
        if (oppLoc.includes(parsed.detectedRegion)) {
          score += 35;
        } else if (parsed.detectedRegion === 'europe' && opp.location.region.toLowerCase().includes('europe')) {
          score += 35;
        } else if (parsed.detectedRegion === 'asia' && opp.location.region.toLowerCase().includes('asia')) {
          score += 35;
        } else if (opp.workMode === 'REMOTE') {
          score += 15; // Remote is partially compatible with regional search
        }
      }

      // Funding Filter
      if (parsed?.requiresFunding) {
        if (opp.fundingAmount || opp.prize || opp.salary) {
          score += 25;
        }
      }

      // Student Audience
      if (parsed?.studentAudience) {
        if (
          opp.eligibility.toLowerCase().includes('student') ||
          opp.educationRequirements.some((e) => e.toLowerCase().includes('student') || e.toLowerCase().includes('degree'))
        ) {
          score += 20;
        }
      }

      // Text keywords matching across fields
      if (parsed && parsed.keywords.length > 0) {
        const textCorpus = `${opp.title} ${opp.organizationName} ${opp.category} ${opp.industry} ${opp.sector} ${opp.description} ${opp.tags.join(' ')}`.toLowerCase();
        parsed.keywords.forEach((kw) => {
          if (textCorpus.includes(kw)) {
            score += 15;
          }
        });
      }

      // Baseline score if no query text provided
      if (!queryStr) score = 10;

      return { opp, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((item) => item.opp);

  // 2. Filter & Score Organizations
  const matchedOrgs = organizations
    .filter((org) => {
      if (query.businessType && !org.businessTypes.includes(query.businessType as any)) {
        return false;
      }
      if (!queryStr) return true;
      const q = queryStr.toLowerCase();
      return (
        org.name.toLowerCase().includes(q) ||
        org.industry.toLowerCase().includes(q) ||
        org.sector.toLowerCase().includes(q) ||
        org.headquarters.country.toLowerCase().includes(q) ||
        org.headquarters.city.toLowerCase().includes(q) ||
        org.businessTypes.some((b) => b.toLowerCase().includes(q))
      );
    })
    .slice(0, 20);

  // 3. Filter & Score Personas
  const matchedPersonas = personas
    .filter((p) => {
      if (query.personaType && p.personaType !== query.personaType) {
        return false;
      }
      if (!queryStr) return true;
      const q = queryStr.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.roleTitle.toLowerCase().includes(q) ||
        p.organizationName.toLowerCase().includes(q) ||
        p.personaType.toLowerCase().includes(q)
      );
    })
    .slice(0, 20);

  const limit = query.limit || 50;
  const offset = query.offset || 0;
  const paginatedOpps = matchedOpportunities.slice(offset, offset + limit);

  return {
    query: queryStr,
    parsedTokens: parsed
      ? {
          location: parsed.detectedRegion,
          opportunityTypes: parsed.detectedTypes,
          topics: parsed.keywords,
          fundingRequirement: parsed.requiresFunding,
        }
      : undefined,
    opportunities: paginatedOpps,
    organizations: matchedOrgs,
    personas: matchedPersonas,
    totalMatches: matchedOpportunities.length + matchedOrgs.length + matchedPersonas.length,
  };
}
