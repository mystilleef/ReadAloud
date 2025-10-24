/**
 * Service Account Authentication Module
 *
 * This module handles authentication using Google Cloud Service Accounts
 * for Chrome Web Store API access. This approach works with accounts that
 * have Advanced Protection Program enabled.
 */

import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { GoogleAuth } from "google-auth-library";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Chrome Web Store API scope
const SCOPES = ["https://www.googleapis.com/auth/chromewebstore"];

interface ServiceAccountConfig {
  type: "service_account";
  publisherId: string;
  extensionId: string;
  serviceAccountKeyPath: string;
}

/**
 * Load service account configuration
 */
export function loadServiceAccountConfig(): ServiceAccountConfig {
  const configPath = resolve(
    __dirname,
    "../secrets/service-account-config.json",
  );

  try {
    const configContent = readFileSync(configPath, "utf-8");
    return JSON.parse(configContent);
  } catch (error) {
    throw new Error(
      `Failed to load service account config from ${configPath}.\n` +
        "Please create the file with your service account details.\n" +
        "See docs/service-account-setup.md for instructions.\n" +
        `Error: ${error}`,
    );
  }
}

/**
 * Get an access token using service account authentication
 *
 * This is the main function to use for service account authentication.
 * It uses Google's official auth library to handle JWT creation and token exchange.
 *
 * @returns Access token for Chrome Web Store API
 */
export async function getServiceAccountToken(): Promise<string> {
  const config = loadServiceAccountConfig();
  const keyPath = resolve(__dirname, "..", config.serviceAccountKeyPath);

  // Create auth client using the service account key file
  const auth = new GoogleAuth({
    keyFile: keyPath,
    scopes: SCOPES,
  });

  // Get the access token
  const client = await auth.getClient();
  const tokenResponse = await client.getAccessToken();

  if (!tokenResponse.token) {
    throw new Error("Failed to obtain access token from service account");
  }

  return tokenResponse.token;
}

/**
 * Get service account configuration including token
 *
 * This returns everything needed to use chrome-webstore-upload with a service account.
 * The library expects a token, which we generate from the service account.
 */
export async function getServiceAccountCredentials() {
  const config = loadServiceAccountConfig();
  const token = await getServiceAccountToken();

  return {
    extensionId: config.extensionId,
    publisherId: config.publisherId,
    token,
  };
}

/**
 * Verify that service account authentication is working
 */
export async function verifyServiceAccountAuth(): Promise<boolean> {
  try {
    console.log("\n🔐 Service Account Authentication Test\n");
    console.log("=".repeat(50));

    const config = loadServiceAccountConfig();
    console.log("\n✅ Configuration loaded:");
    console.log(`   Extension ID: ${config.extensionId}`);
    console.log(`   Publisher ID: ${config.publisherId}`);
    console.log(`   Key file: ${config.serviceAccountKeyPath}`);

    console.log("\n🔄 Requesting access token...");
    const token = await getServiceAccountToken();

    console.log("\n✅ Successfully obtained access token!");
    console.log(`   Token (first 30 chars): ${token.substring(0, 30)}...`);
    console.log(`   Token length: ${token.length} characters`);

    console.log(`\n${"=".repeat(50)}`);
    console.log("✅ Service account authentication is working!\n");

    return true;
  } catch (error) {
    console.error(`\n${"=".repeat(50)}`);
    console.error("❌ Service account authentication failed!\n");
    console.error("Error:", error);
    console.error(`\n${"=".repeat(50)}`);
    console.error("\n💡 Troubleshooting steps:");
    console.error("   1. Verify service account key file exists");
    console.error("   2. Check that Chrome Web Store API is enabled");
    console.error(
      "   3. Ensure service account is linked in Chrome Web Store Dashboard",
    );
    console.error(
      "   4. See docs/service-account-setup.md for setup instructions\n",
    );

    return false;
  }
}

// CLI usage: ts-node scripts/service-account-auth.ts
if (import.meta.url === `file://${process.argv[1]}`) {
  verifyServiceAccountAuth()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error("Unexpected error:", error);
      process.exit(1);
    });
}
