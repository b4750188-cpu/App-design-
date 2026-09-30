/**
 * Opportunity Matching Engine
 * Compares User Profiles against Structured Opportunities with grounded "WHY THIS MATCHES" explanations.
 */

import {
  StructuredOpportunity,
  UserMatchProfile,
  OpportunityMatchResult,
} from '../types.ts';

export function matchUserOpportunities(
  profile: UserMatchProfile,
  opportunities: StructuredOpportunity[]
): OpportunityMatchResult[] {
  const results: OpportunityMatchResult[] = [];

  opportunities.forEach((opp) => {
    const matchingReqs: string[] = [];
    const missingReqs: string[] = [];
    let score = 0;

    // 1. Opportunity Type Matching
    if (profile.opportunityTypes.length > 0) {
      if (profile.opportunityTypes.includes(opp.opportunityType)) {
        score += 25;
        matchingReqs.push(`Target opportunity type matches preferred (${opp.opportunityType})`);
      } else {
        missingReqs.push(`Opportunity type is ${opp.opportunityType}, not in your preferred list`);
      }
    } else {
      score += 10;
    }

    // 2. Location Compatibility
    let locationCompatible = false;
    let locationDetails = '';

    if (opp.workMode === 'REMOTE') {
      locationCompatible = true;
      locationDetails = 'Fully remote opportunity; eligible regardless of physical location';
      score += 25;
      matchingReqs.push(locationDetails);
    } else if (profile.location && opp.location.city.toLowerCase().includes(profile.location.toLowerCase())) {
      locationCompatible = true;
      locationDetails = `Located directly in your city (${opp.location.city}, ${opp.location.country})`;
      score += 25;
      matchingReqs.push(locationDetails);
    } else if (
      profile.preferredCountries &&
      profile.preferredCountries.some((c) => opp.location.country.toLowerCase().includes(c.toLowerCase()))
    ) {
      locationCompatible = true;
      locationDetails = `Located in your preferred country (${opp.location.country})`;
      score += 20;
      matchingReqs.push(locationDetails);
    } else {
      locationDetails = `Requires physical presence in ${opp.location.city}, ${opp.location.country} (${opp.workMode})`;
      missingReqs.push(locationDetails);
    }

    // 3. Skill Compatibility
    const matchedSkills: string[] = [];
    const missingSkills: string[] = [];

    if (opp.skills && opp.skills.length > 0) {
      opp.skills.forEach((skill) => {
        const hasSkill = profile.skills.some((s) => s.toLowerCase() === skill.toLowerCase());
        if (hasSkill) {
          matchedSkills.push(skill);
        } else {
          missingSkills.push(skill);
        }
      });

      const skillRatio = matchedSkills.length / opp.skills.length;
      score += Math.round(skillRatio * 25);

      if (matchedSkills.length > 0) {
        matchingReqs.push(`Matched required skills: ${matchedSkills.join(', ')}`);
      }
      if (missingSkills.length > 0) {
        missingReqs.push(`Missing suggested skills: ${missingSkills.join(', ')}`);
      }
    } else {
      score += 15;
    }

    // 4. Eligibility & Education Compatibility
    let eligibilityCompatible = true;
    let eligibilityDetails = 'Eligibility criteria verified';

    if (profile.educationLevel && opp.educationRequirements.length > 0) {
      const edMatch = opp.educationRequirements.some((req) =>
        profile.educationLevel!.toLowerCase().includes(req.toLowerCase()) ||
        req.toLowerCase().includes(profile.educationLevel!.toLowerCase())
      );

      if (edMatch) {
        score += 15;
        matchingReqs.push(`Education matches requirement (${profile.educationLevel})`);
      } else {
        eligibilityCompatible = false;
        eligibilityDetails = `Opportunity specifies: ${opp.educationRequirements.join(', ')}`;
        missingReqs.push(eligibilityDetails);
      }
    } else {
      score += 10;
    }

    // 5. Deadline Status
    let deadlineStatus = {
      isOpen: true,
      daysRemaining: undefined as number | undefined,
      label: 'Rolling admission',
    };

    if (opp.deadline) {
      const deadlineDate = new Date(opp.deadline).getTime();
      const now = Date.now();
      const diffDays = Math.ceil((deadlineDate - now) / (1000 * 60 * 60 * 24));

      if (diffDays <= 0) {
        deadlineStatus = { isOpen: false, daysRemaining: 0, label: 'Applications closed' };
        score -= 20;
      } else if (diffDays <= 14) {
        deadlineStatus = { isOpen: true, daysRemaining: diffDays, label: `Closing soon (${diffDays} days remaining)` };
        score += 10;
      } else {
        deadlineStatus = { isOpen: true, daysRemaining: diffDays, label: `Open (${diffDays} days remaining)` };
        score += 10;
      }
    }

    // Qualification judgment strictly grounded in data
    const qualifies =
      locationCompatible &&
      (opp.educationRequirements.length === 0 || (profile.educationLevel ? true : false)) &&
      (missingSkills.length <= 1) &&
      deadlineStatus.isOpen;

    // Normalize final score between 0 and 100
    const finalScore = Math.max(5, Math.min(100, score));

    results.push({
      opportunity: opp,
      matchScore: finalScore,
      qualifies,
      whyThisMatches: {
        matchingRequirements: matchingReqs,
        missingRequirements: missingReqs,
        locationCompatibility: {
          compatible: locationCompatible,
          details: locationDetails,
        },
        eligibilityCompatibility: {
          compatible: eligibilityCompatible,
          details: eligibilityDetails,
        },
        skillCompatibility: {
          compatible: matchedSkills.length >= missingSkills.length,
          matchedSkills,
          missingSkills,
        },
        deadlineStatus,
      },
    });
  });

  return results.sort((a, b) => b.matchScore - a.matchScore);
}
