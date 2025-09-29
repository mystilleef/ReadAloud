import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import chromeWebstoreUpload from "chrome-webstore-upload";

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let manifest: { version: string };
try {
  const manifestContent = fs.readFileSync(
    path.resolve(__dirname, "../manifest.json"),
    "utf-8",
  );
  manifest = JSON.parse(manifestContent);
} catch (error) {
  console.error("Error reading or parsing manifest.json:", error);
  process.exit(1);
}

// Define the path to your secrets file
const secretsFilePath = path.resolve(
  __dirname,
  "../secrets/readaloud-deployment-secret.json",
);

// Read and parse the secrets file
let secrets: {
  client_id: string;
  client_secret: string;
  refresh_token: string;
  extensionId: string;
};
try {
  const secretsContent = fs.readFileSync(secretsFilePath, "utf-8");
  secrets = JSON.parse(secretsContent);
} catch (error) {
  console.error("Error reading or parsing secrets file:", error);
  process.exit(1);
}

const extensionId = secrets.extensionId;

const webstore = chromeWebstoreUpload({
  extensionId,
  clientId: secrets.client_id,
  clientSecret: secrets.client_secret,
  refreshToken: secrets.refresh_token,
});

async function deploy() {
  try {
    console.log("Building extension...");
    // Construct the zip file name using the version from manifest.json
    const PACKAGE_NAME = `readaloud-${manifest.version}.zip`;
    const zipFilePath = path.resolve(__dirname, "../releases", PACKAGE_NAME);

    // Ensure the zip file exists
    if (!fs.existsSync(zipFilePath)) {
      console.error(
        `Error: Extension zip file not found at ${zipFilePath}. Please run 'npm run build' first.`,
      );
      process.exit(1);
    }

    console.log(`Uploading extension from ${zipFilePath}...`);
    const uploadResult = await webstore.uploadExisting(
      fs.createReadStream(zipFilePath),
    );
    console.log("Upload result:", uploadResult);

    if (uploadResult.uploadState === "SUCCESS") {
      console.log("Extension uploaded successfully!");

      const isDryRun = process.argv.includes("--dry-run");
      if (isDryRun) {
        console.log("--dry-run flag detected. Skipping publish step.");
        return;
      }

      console.log("Publishing...");
      const publishResult = await webstore.publish();
      console.log("Publish result:", publishResult);
      if (publishResult.status[0] === "OK") {
        console.log("Extension published successfully!");
      } else {
        console.error("Error publishing extension:", publishResult);
      }
    } else {
      console.error("Error uploading extension:", uploadResult);
    }
  } catch (error) {
    console.error("Deployment failed:", error);
    process.exit(1);
  }
}

deploy();
