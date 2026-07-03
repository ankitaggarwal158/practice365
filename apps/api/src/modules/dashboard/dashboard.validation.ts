import { z } from "zod";

// No specific body/query validation is required for the dashboard GET requests right now,
// but we define placeholder schemas for structure conformity.
export const GetDashboardSchema = z.object({
  query: z.object({}).optional(),
});
