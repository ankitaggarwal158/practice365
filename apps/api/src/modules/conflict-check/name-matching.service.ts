export function cleanToken(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]/g, "");
}

/**
 * Computes token-based string similarity score between 0.0 and 1.0.
 */
export function computeSimilarity(strA: string, strB: string): number {
  if (!strA || !strB) return 0.0;

  const tokensA = strA.split(/\s+/).map(cleanToken).filter(Boolean);
  const tokensB = strB.split(/\s+/).map(cleanToken).filter(Boolean);

  if (tokensA.length === 0 || tokensB.length === 0) return 0.0;

  // Exact comparison
  if (strA.trim().toLowerCase() === strB.trim().toLowerCase()) {
    return 1.0;
  }

  let matches = 0;
  for (const tA of tokensA) {
    if (tokensB.includes(tA)) {
      matches++;
    }
  }

  // Jaccard-like matching index
  return (2 * matches) / (tokensA.length + tokensB.length);
}
