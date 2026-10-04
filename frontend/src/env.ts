import { z } from "zod";

/**
 * Server-only environment variables schema.
 * These variables are never exposed to the client browser.
 */
const serverSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  BACKEND_URL: z
    .string()
    .url("BACKEND_URL must be a valid HTTP/HTTPS URL")
    .default("http://localhost:8080"),
  CSP_MODE: z.enum(["report-only", "enforce"]).default("report-only"),
});

/**
 * Client-exposed environment variables schema.
 * All public variables must be prefixed with NEXT_PUBLIC_.
 */
const clientSchema = z.object({
  NEXT_PUBLIC_APP_URL: z
    .string()
    .url("NEXT_PUBLIC_APP_URL must be a valid HTTP/HTTPS URL")
    .default("http://localhost:3000"),
  NEXT_PUBLIC_API_BASE_URL: z
    .string()
    .url("NEXT_PUBLIC_API_BASE_URL must be a valid HTTP/HTTPS URL")
    .default("http://localhost:8080/api"),
  NEXT_PUBLIC_MAPBOX_TOKEN: z
    .string()
    .min(1, "NEXT_PUBLIC_MAPBOX_TOKEN is required")
    .default("pk.mock_development_token_for_local_testing"),
  NEXT_PUBLIC_STORAGE_URL: z
    .string()
    .url("NEXT_PUBLIC_STORAGE_URL must be a valid HTTP/HTTPS URL")
    .default("http://localhost:9000/public"),
});

export type ServerEnv = z.infer<typeof serverSchema>;
export type ClientEnv = z.infer<typeof clientSchema>;
export type Env = ServerEnv & ClientEnv;

/**
 * Helper to validate environment variables with clear diagnostics.
 * @param customProcessEnv Custom environment record for testing
 * @param isServer Explicitly specify server vs client execution context
 */
export function validateEnv(
  customProcessEnv: Record<string, string | undefined> = process.env,
  isServer: boolean = typeof window === "undefined" || process.env.NODE_ENV === "test"
): Env {
  const rawClientEnv = {
    NEXT_PUBLIC_APP_URL: customProcessEnv.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_API_BASE_URL: customProcessEnv.NEXT_PUBLIC_API_BASE_URL,
    NEXT_PUBLIC_MAPBOX_TOKEN: customProcessEnv.NEXT_PUBLIC_MAPBOX_TOKEN,
    NEXT_PUBLIC_STORAGE_URL: customProcessEnv.NEXT_PUBLIC_STORAGE_URL,
  };

  const clientResult = clientSchema.safeParse(rawClientEnv);
  if (!clientResult.success) {
    throw new Error(
      `Invalid client environment variables: ${JSON.stringify(clientResult.error.format(), null, 2)}`
    );
  }

  if (!isServer) {
    // Return typed mock/empty server values for client-side bundle safety
    return {
      NODE_ENV: (customProcessEnv.NODE_ENV as ServerEnv["NODE_ENV"]) || "development",
      BACKEND_URL: "",
      CSP_MODE: "report-only",
      ...clientResult.data,
    };
  }

  const rawServerEnv = {
    NODE_ENV: customProcessEnv.NODE_ENV,
    BACKEND_URL: customProcessEnv.BACKEND_URL,
    CSP_MODE: customProcessEnv.CSP_MODE,
  };

  const serverResult = serverSchema.safeParse(rawServerEnv);
  if (!serverResult.success) {
    throw new Error(
      `Invalid server environment variables: ${JSON.stringify(serverResult.error.format(), null, 2)}`
    );
  }

  return {
    ...serverResult.data,
    ...clientResult.data,
  };
}

/**
 * Validated environment object for use across the application.
 */
export const env: Env = validateEnv();
