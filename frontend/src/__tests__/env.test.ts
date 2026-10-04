import { describe, it, expect } from "vitest";
import { env, validateEnv } from "../env";

describe("Environment Variables Validation (src/env.ts)", () => {
  it("should have valid default environment variables", () => {
    expect(env).toBeDefined();
    expect(env.BACKEND_URL).toBe("http://localhost:8080");
    expect(env.NEXT_PUBLIC_APP_URL).toBe("http://localhost:3000");
    expect(env.NEXT_PUBLIC_API_BASE_URL).toBe("http://localhost:8080/api");
    expect(env.NEXT_PUBLIC_MAPBOX_TOKEN).toBe("pk.mock_development_token_for_local_testing");
    expect(env.NEXT_PUBLIC_STORAGE_URL).toBe("http://localhost:9000/public");
    expect(env.CSP_MODE).toBe("report-only");
  });

  it("should validate and parse custom valid environment variables", () => {
    const customEnv = validateEnv({
      NODE_ENV: "production",
      BACKEND_URL: "https://api.homestay.vn",
      CSP_MODE: "enforce",
      NEXT_PUBLIC_APP_URL: "https://homestay.vn",
      NEXT_PUBLIC_API_BASE_URL: "https://api.homestay.vn/api",
      NEXT_PUBLIC_MAPBOX_TOKEN: "pk.custom_mapbox_token_production",
      NEXT_PUBLIC_STORAGE_URL: "https://storage.homestay.vn/public",
    });

    expect(customEnv.NODE_ENV).toBe("production");
    expect(customEnv.BACKEND_URL).toBe("https://api.homestay.vn");
    expect(customEnv.CSP_MODE).toBe("enforce");
    expect(customEnv.NEXT_PUBLIC_APP_URL).toBe("https://homestay.vn");
  });

  it("should throw error when BACKEND_URL is invalid", () => {
    expect(() => {
      validateEnv({
        BACKEND_URL: "not-a-valid-url",
      });
    }).toThrow("Invalid server environment variables");
  });

  it("should throw error when NEXT_PUBLIC_APP_URL is invalid", () => {
    expect(() => {
      validateEnv({
        NEXT_PUBLIC_APP_URL: "not-a-valid-url",
      });
    }).toThrow("Invalid client environment variables");
  });
});
