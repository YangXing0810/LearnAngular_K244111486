//Cái này bắt buộc có trong mọi file, thi cki và cả project cuối kì
// classes/SlugHelper.ts
// Function to generate a Slug (Used for both creating links and displaying)
export function createSlug(name: string, id: number): string {
  const sanitizedName = name
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Remove Vietnamese accents
    .replace(/[^a-z0-9]+/g, '-') // Replace special characters with hyphens
    .replace(/(^-|-$)+/g, '');   // Trim hyphens from the start and end
  return `${sanitizedName}-p${id}`; // Format: product-name-p1
} //copy từ dòng 4-10 và 12-18 --> ghi nhận doanh số trong marketer, cookies trong .. ngày

// Function to extract ID from a Slug (Used when parsing the URL)
export function extractIdFromSlug(slug: string): number | null {
  // Find the digits located at the end of the string following the letter 'p'
  const match = slug.match(/-p(\d+)$/);
  return match ? parseInt(match[1], 10) : null;
}

// Function to determine the identifier type provided by the user
export function getIdentityType(identity: string): 'ID' | 'SLUG_WITH_ID' | 'PURE_SLUG' {
  // 1. Check if it is a pure number (e.g., "1")
  if (!isNaN(Number(identity))) {
    return 'ID';
  }
  // 2. Check if it contains the pID format (e.g., "iphone-69-pro-max-p1")
  if (identity.includes('-p')) {
    const parts = identity.split('-p');
    const lastPart = parts[parts.length - 1];
    if (!isNaN(Number(lastPart))) {
      return 'SLUG_WITH_ID';
    }
  }
  // 3. Otherwise, treat it as a pure text slug (e.g., "iphone-69-pro-max")
  return 'PURE_SLUG';
}