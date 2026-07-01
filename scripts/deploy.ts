import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import chromeWebstoreUpload from "chrome-webstore-upload";
import {
  getServiceAccountToken,
  loadServiceAccountConfig,
} from "./service-account-auth.ts";

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let packageJson: { version: string };
try {
  const packageContent = fs.readFileSync(
    path.resolve(__dirname, "../package.json"),
    "utf-8",
  );
  packageJson = JSON.parse(packageContent);
} catch (error) {
  console.error("Error reading or parsing package.json:", error);
  process.exit(1);
}

async function deploy() {
  try {
    console.log("\n🚀 Chrome Web Store Deployment (Service Account)\n");
    console.log("=".repeat(50));

    // Load service account config
    console.log("\n📝 Loading service account configuration...");
    const config = loadServiceAccountConfig();

    // Get access token from service account
    console.log("🔐 Authenticating with service account...");
    const token = await getServiceAccountToken();
    console.log("✅ Successfully authenticated!");

    // Initialize webstore client
    const webstore = chromeWebstoreUpload({
      extensionId: config.extensionId,
      publisherId: config.publisherId,
      clientId: "not-used-with-service-account",
      clientSecret: "not-used-with-service-account",
      refreshToken: "not-used-with-service-account",
    });

    // Build zip file path
    const PACKAGE_NAME = `readaloud-${packageJson.version}.zip`;
    const zipFilePath = path.resolve(__dirname, "../releases", PACKAGE_NAME);

    // Ensure the zip file exists
    if (!fs.existsSync(zipFilePath)) {
      console.error(
        `\n❌ Error: Extension zip file not found at ${zipFilePath}`,
      );
      console.error("Please run 'npm run build' first.\n");
      process.exit(1);
    }

    console.log(`\n📦 Uploading extension from ${zipFilePath}...`);
    const uploadResult = await webstore.uploadExisting(
      fs.createReadStream(zipFilePath),
      token, // Use service account token
    );
    console.log("\n📊 Upload result:", uploadResult);

    if (uploadResult.uploadState === "SUCCEEDED") {
      console.log("\n✅ Extension uploaded successfully!");

      const isDryRun = process.argv.includes("--dry-run");
      if (isDryRun) {
        console.log("\n⚠️  --dry-run flag detected. Skipping publish step.");
        console.log("=".repeat(50), "\n");
        return;
      }

      console.log("Publishing...");
      const publishResult = await webstore.publish("default", token);
      console.log("\n📊 Publish result:", publishResult);
      if (publishResult.state === "PUBLISHED") {
        console.log(`\n${"=".repeat(50)}`);
        console.log("✅ Extension published successfully!");
        console.log("=".repeat(50), "\n");
      } else if (publishResult.state === "PENDING_REVIEW") {
        console.log(`\n${"=".repeat(50)}`);
        console.log("✅ Extension submitted and is pending manual review!");
        console.log("=".repeat(50), "\n");
      } else {
        console.error(`\n${"=".repeat(50)}`);
        console.error("❌ Error publishing extension");
        console.error("=".repeat(50));
        console.error(publishResult);
        console.error();
        process.exit(1);
      }
    } else {
      console.error(`\n${"=".repeat(50)}`);
      console.error("❌ Error uploading extension");
      console.error("=".repeat(50));
      console.error(uploadResult);
      console.error();
      process.exit(1);
    }
  } catch (error) {
    console.error(`\n${"=".repeat(50)}`);
    console.error("❌ Deployment failed");
    console.error("=".repeat(50));
    console.error(error);
    console.error();
    process.exit(1);
  }
}

deploy();
