import { Lead } from "../leads/schemas/lead.schema.js";
import { computeSimilarity, cleanToken } from "./name-matching.service.js";
import { MatchRecord, ConflictEngineResult } from "./conflict-check.types.js";
import { Types } from "mongoose";

function cleanPhone(num?: string): string {
  if (!num) return "";
  return num.replace(/\D/g, "");
}

// Structured Mock Entities for Clients, Matters, and Opposing Parties
// since these modules are not yet implemented in the codebase
const SIMULATED_CLIENTS = [
  { id: "c1", name: "John Smith", company: "Smith Holdings Inc", email: "john@smithinc.com", phone: "+15551234567" },
  { id: "c2", name: "Bruce Wayne", company: "Wayne Enterprises", email: "bruce@waynecorp.com", phone: "+15559998888" },
  { id: "c3", name: "Peter Parker", company: "Parker Photography", email: "peter@dailybugle.com", phone: "+15553334444" },
];

const SIMULATED_OPPOSING_PARTIES = [
  { id: "op1", name: "Lex Luthor", company: "LexCorp", email: "lex@lexcorp.com", phone: "+15556667777" },
  { id: "op2", name: "Smith & Associates", company: "Smith & Associates", email: "admin@smithassociates.com", phone: "+15557778888" },
  { id: "op3", name: "Obadiah Stane", company: "Stane Industries", email: "obadiah@stane.com", phone: "+15558880000" },
];

const SIMULATED_MATTERS = [
  { id: "m1", title: "Wayne Enterprises IP Acquisition", opposingParty: "Lex Luthor" },
  { id: "m2", title: "Smith Family Divorce Mediation", opposingParty: "Smith & Associates" },
];

export interface SearchCriteria {
  personName?: string;
  organizationName?: string;
  email?: string;
  phone?: string;
}

export async function searchConflict(
  firmId: string,
  criteria: SearchCriteria
): Promise<ConflictEngineResult> {
  const matches: MatchRecord[] = [];

  const searchName = criteria.personName?.trim();
  const searchOrg = criteria.organizationName?.trim();
  const searchEmail = criteria.email?.trim().toLowerCase();
  const searchPhone = cleanPhone(criteria.phone);

  // 1. Scan Database Leads
  if (Types.ObjectId.isValid(firmId)) {
    const leads = await Lead.find({ firmId: new Types.ObjectId(firmId) });
    for (const lead of leads) {
      const leadName = `${lead.firstName} ${lead.lastName}`;
      const leadOrg = lead.companyName || "";
      const leadEmail = lead.email?.trim().toLowerCase() || "";
      const leadPhone = cleanPhone(lead.phone);

      // Name Matching
      if (searchName) {
        const score = computeSimilarity(searchName, leadName);
        if (score >= 0.6) {
          matches.push({
            entityType: "LEAD",
            entityId: lead._id.toString(),
            entityName: leadName,
            matchedField: "Name",
            matchedValue: leadName,
            similarityScore: score,
          });
        }
      }

      // Org Matching
      if (searchOrg && leadOrg) {
        const score = computeSimilarity(searchOrg, leadOrg);
        if (score >= 0.6) {
          matches.push({
            entityType: "LEAD",
            entityId: lead._id.toString(),
            entityName: leadName,
            matchedField: "Company Name",
            matchedValue: leadOrg,
            similarityScore: score,
          });
        }
      }

      // Email Matching
      if (searchEmail && leadEmail && searchEmail === leadEmail) {
        matches.push({
          entityType: "LEAD",
          entityId: lead._id.toString(),
          entityName: leadName,
          matchedField: "Email Address",
          matchedValue: lead.email || "",
          similarityScore: 1.0,
        });
      }

      // Phone Matching
      if (searchPhone && leadPhone && searchPhone === leadPhone) {
        matches.push({
          entityType: "LEAD",
          entityId: lead._id.toString(),
          entityName: leadName,
          matchedField: "Phone Number",
          matchedValue: lead.phone || "",
          similarityScore: 1.0,
        });
      }
    }
  }

  // 2. Scan Simulated Clients
  for (const client of SIMULATED_CLIENTS) {
    if (searchName) {
      const score = computeSimilarity(searchName, client.name);
      if (score >= 0.6) {
        matches.push({
          entityType: "CLIENT",
          entityId: client.id,
          entityName: client.name,
          matchedField: "Name",
          matchedValue: client.name,
          similarityScore: score,
        });
      }
    }
    if (searchOrg && client.company) {
      const score = computeSimilarity(searchOrg, client.company);
      if (score >= 0.6) {
        matches.push({
          entityType: "CLIENT",
          entityId: client.id,
          entityName: client.name,
          matchedField: "Company Name",
          matchedValue: client.company,
          similarityScore: score,
        });
      }
    }
    if (searchEmail && client.email && searchEmail === client.email.toLowerCase()) {
      matches.push({
        entityType: "CLIENT",
        entityId: client.id,
        entityName: client.name,
        matchedField: "Email Address",
        matchedValue: client.email,
        similarityScore: 1.0,
      });
    }
    if (searchPhone && cleanPhone(client.phone) && searchPhone === cleanPhone(client.phone)) {
      matches.push({
        entityType: "CLIENT",
        entityId: client.id,
        entityName: client.name,
        matchedField: "Phone Number",
        matchedValue: client.phone,
        similarityScore: 1.0,
      });
    }
  }

  // 3. Scan Simulated Opposing Parties
  for (const op of SIMULATED_OPPOSING_PARTIES) {
    if (searchName) {
      const score = computeSimilarity(searchName, op.name);
      if (score >= 0.6) {
        matches.push({
          entityType: "OPPOSING_PARTY",
          entityId: op.id,
          entityName: op.name,
          matchedField: "Name",
          matchedValue: op.name,
          similarityScore: score,
        });
      }
    }
    if (searchOrg && op.company) {
      const score = computeSimilarity(searchOrg, op.company);
      if (score >= 0.6) {
        matches.push({
          entityType: "OPPOSING_PARTY",
          entityId: op.id,
          entityName: op.name,
          matchedField: "Company Name",
          matchedValue: op.company,
          similarityScore: score,
        });
      }
    }
    if (searchEmail && op.email && searchEmail === op.email.toLowerCase()) {
      matches.push({
        entityType: "OPPOSING_PARTY",
        entityId: op.id,
        entityName: op.name,
        matchedField: "Email Address",
        matchedValue: op.email,
        similarityScore: 1.0,
      });
    }
    if (searchPhone && cleanPhone(op.phone) && searchPhone === cleanPhone(op.phone)) {
      matches.push({
        entityType: "OPPOSING_PARTY",
        entityId: op.id,
        entityName: op.name,
        matchedField: "Phone Number",
        matchedValue: op.phone,
        similarityScore: 1.0,
      });
    }
  }

  // 4. Scan Simulated Matters
  for (const matter of SIMULATED_MATTERS) {
    if (searchName) {
      const scoreTitle = computeSimilarity(searchName, matter.title);
      const scoreOp = computeSimilarity(searchName, matter.opposingParty);
      if (scoreTitle >= 0.6) {
        matches.push({
          entityType: "MATTER",
          entityId: matter.id,
          entityName: matter.title,
          matchedField: "Matter Title",
          matchedValue: matter.title,
          similarityScore: scoreTitle,
        });
      } else if (scoreOp >= 0.6) {
        matches.push({
          entityType: "MATTER",
          entityId: matter.id,
          entityName: matter.title,
          matchedField: "Opposing Party Name",
          matchedValue: matter.opposingParty,
          similarityScore: scoreOp,
        });
      }
    }
  }

  // Determine overall result
  let overallResult: "NO_CONFLICT" | "POSSIBLE_CONFLICT" | "CONFIRMED_CONFLICT" = "NO_CONFLICT";
  if (matches.length > 0) {
    const hasHighMatch = matches.some((m) => m.similarityScore >= 0.95);
    overallResult = hasHighMatch ? "CONFIRMED_CONFLICT" : "POSSIBLE_CONFLICT";
  }

  return {
    overallResult,
    matches,
  };
}
