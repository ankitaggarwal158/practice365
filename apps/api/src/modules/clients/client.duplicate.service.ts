import { Client } from "./schemas/client.schema.js";
import { computeSimilarity } from "../conflict-check/name-matching.service.js";
import { Types } from "mongoose";

function cleanPhone(num?: string): string {
  if (!num) return "";
  return num.replace(/\D/g, "");
}

export interface DuplicateMatch {
  clientId: string;
  clientNumber: string;
  name: string;
  matchedField: string;
  matchedValue: string;
  similarityScore: number;
}

export async function findDuplicates(
  firmId: string,
  criteria: {
    firstName?: string;
    lastName?: string;
    companyName?: string;
    email?: string;
    phone?: string;
  }
): Promise<DuplicateMatch[]> {
  if (!Types.ObjectId.isValid(firmId)) return [];

  // Find active or inactive clients (exclude archived/merged ones)
  const activeClients = await Client.find({
    firmId: new Types.ObjectId(firmId),
    status: { $ne: "ARCHIVED" },
  });

  const matches: DuplicateMatch[] = [];

  const searchFirstName = criteria.firstName?.trim() || "";
  const searchLastName = criteria.lastName?.trim() || "";
  const searchFullName = `${searchFirstName} ${searchLastName}`.trim();
  const searchOrg = criteria.companyName?.trim();
  const searchEmail = criteria.email?.trim().toLowerCase();
  const searchPhone = cleanPhone(criteria.phone);

  for (const client of activeClients) {
    const clientName = client.clientType === "INDIVIDUAL"
      ? `${client.firstName} ${client.lastName}`
      : client.companyName || "";

    const clientEmail = client.email?.trim().toLowerCase() || "";
    const clientPhone = cleanPhone(client.phone);

    // 1. Email exact check
    if (searchEmail && clientEmail && searchEmail === clientEmail) {
      matches.push({
        clientId: client._id.toString(),
        clientNumber: client.clientNumber,
        name: clientName,
        matchedField: "Email Address",
        matchedValue: client.email || "",
        similarityScore: 1.0,
      });
      continue; // Skip further checks if exact email match found
    }

    // 2. Phone exact check
    if (searchPhone && clientPhone && searchPhone === clientPhone) {
      matches.push({
        clientId: client._id.toString(),
        clientNumber: client.clientNumber,
        name: clientName,
        matchedField: "Phone Number",
        matchedValue: client.phone || "",
        similarityScore: 1.0,
      });
      continue; // Skip further checks if exact phone match found
    }

    // 3. Name check (Individual name similarity)
    if (searchFullName && client.clientType === "INDIVIDUAL") {
      const dbFullName = `${client.firstName} ${client.lastName}`;
      const score = computeSimilarity(searchFullName, dbFullName);
      if (score >= 0.6) {
        matches.push({
          clientId: client._id.toString(),
          clientNumber: client.clientNumber,
          name: clientName,
          matchedField: "Individual Name",
          matchedValue: dbFullName,
          similarityScore: score,
        });
        continue;
      }
    }

    // 4. Company Name check (Organization similarity)
    if (searchOrg && client.clientType === "ORGANIZATION" && client.companyName) {
      const score = computeSimilarity(searchOrg, client.companyName);
      if (score >= 0.6) {
        matches.push({
          clientId: client._id.toString(),
          clientNumber: client.clientNumber,
          name: clientName,
          matchedField: "Company Name",
          matchedValue: client.companyName,
          similarityScore: score,
        });
      }
    }
  }

  // Sort by similarity descending
  return matches.sort((a, b) => b.similarityScore - a.similarityScore);
}
