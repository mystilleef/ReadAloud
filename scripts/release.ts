// scripts/release.ts

import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import chalk from "chalk";
import { execa } from "execa";
import semver from "semver";

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = resolve(__filename, "..");

const packageJsonPath = resolve(__dirname, "../package.json");

interface PackageJson {
  name: string;
  version: string;
  description?: string;
  // Add other properties if needed
}

async function run() {
  console.log(chalk.blue("🚀 Starting release script..."));

  // --- 1. Argument Parsing ---
  const args = process.argv.slice(2);
  const bumpType = args[0] as semver.ReleaseType;
  const isDryRun = args.includes("--dry-run");
  const isPrerelease = args.includes("--prerelease");

  if (!bumpType || !["major", "minor", "patch"].includes(bumpType)) {
    console.error(chalk.red("❌ Invalid or missing version bump type."));
    console.log(
      chalk.yellow(
        "Usage: npm run release -- <major|minor|patch> [--dry-run] [--prerelease]",
      ),
    );
    process.exit(1);
  }

  if (isDryRun) {
    console.log(
      chalk.yellow("ℹ️ Running in dry-run mode. No changes will be made."),
    );
  }

  // --- 2. Pre-flight Checks ---
  console.log(chalk.blue("🔍 Performing pre-flight checks..."));
  try {
    await checkGitStatus();
    await checkCurrentBranch();
    await checkTools();
    await checkGhAuth();
    await syncWithRemote();
    console.log(chalk.green("✅ All pre-flight checks passed."));
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(chalk.red(`❌ Pre-flight check failed: ${errorMessage}`));
    process.exit(1);
  }

  // --- 3. Core Release Logic ---
  console.log(chalk.blue("⚙️ Calculating new version..."));

  const packageJson: PackageJson = JSON.parse(
    readFileSync(packageJsonPath, "utf-8"),
  );
  const currentVersion = packageJson.version;
  const newVersion = semver.inc(currentVersion, bumpType, isPrerelease);

  if (!newVersion) {
    console.error(
      chalk.red(
        `❌ Could not determine new version from ${currentVersion} and bump type ${bumpType}.`,
      ),
    );
    process.exit(1);
  }

  console.log(`  - Current version: ${chalk.yellow(currentVersion)}`);
  console.log(`  - New version:     ${chalk.green(newVersion)}`);

  if (isDryRun) {
    console.log(
      chalk.yellow("\nℹ️ DRY RUN: The following actions would be taken:"),
    );
    console.log(`  - Update package.json to version ${newVersion}`);
    console.log(`  - Run: git add package.json`);
    console.log(
      `  - Run: git commit -m "chore(release): bump version to v${newVersion}"`,
    );
    console.log(`  - Run: git tag v${newVersion}`);
  } else {
    console.log(chalk.blue("\n⚙️ Applying changes..."));

    // Update package.json
    packageJson.version = newVersion;
    writeFileSync(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`);
    console.log(chalk.green("  - Updated package.json"));

    // Build the extension
    console.log(chalk.blue("\nBuilding extension..."));
    await execa("npm", ["run", "build"]);
    console.log(chalk.green("  - Extension built successfully"));

    // Git commands
    await execa("git", ["add", "package.json", "package-lock.json"]);
    console.log(chalk.green("  - Staged package.json and package-lock.json"));

    await execa("git", [
      "commit",
      "-m",
      `chore(release): bump version to v${newVersion}`,
    ]);
    console.log(chalk.green("  - Committed version bump"));

    await execa("git", [
      "tag",
      "-a",
      `v${newVersion}`,
      "-m",
      `Release v${newVersion}`,
    ]);
    console.log(chalk.green(`  - Created git tag v${newVersion}`));
  }

  // --- 4. GitHub Release Creation ---
  if (isDryRun) {
    console.log(
      chalk.yellow("\nℹ️ DRY RUN: The following final actions would be taken:"),
    );
    console.log(`  - Run: git push origin main --follow-tags`);
    console.log(
      `  - Run: gh release create v${newVersion} --title "Release v${newVersion}" --generate-notes`,
    );
  } else {
    console.log(
      chalk.blue("\n🚀 Pushing to remote and creating GitHub Release..."),
    );

    // Push commit and tag
    await execa("git", ["push", "origin", "main", "--follow-tags"]);
    console.log(chalk.green("  - Pushed commit and tags to origin"));

    // Create GitHub Release
    await execa("gh", [
      "release",
      "create",
      `v${newVersion}`,
      "--title",
      `Release v${newVersion}`,
      "--generate-notes",
      "--notes",
      "",
    ]);
    console.log(chalk.green("  - Created GitHub Release"));

    console.log(
      chalk.green(
        `\n🎉 Successfully created and published release v${newVersion}!`,
      ),
    );
  }

  console.log(chalk.blue("🎉 Release script finished."));
}

// --- Helper Functions for Pre-flight Checks ---

async function checkGitStatus() {
  const { stdout } = await execa("git", ["status", "--porcelain"]);
  if (stdout.length > 0) {
    throw new Error(
      "Working directory is not clean. Please commit or stash changes.",
    );
  }
  console.log(chalk.green("  - Git status is clean."));
}

async function checkCurrentBranch() {
  const { stdout } = await execa("git", ["rev-parse", "--abbrev-ref", "HEAD"]);
  if (stdout !== "main") {
    throw new Error(`Not on 'main' branch. Current branch: ${stdout}`);
  }
  console.log(chalk.green("  - On main branch."));
}

async function checkTools() {
  try {
    await execa("git", ["--version"]);
    await execa("gh", ["--version"]);
  } catch (_error) {
    throw new Error(
      "Required tools (git or gh CLI) are not installed or not in PATH.",
    );
  }
  console.log(chalk.green("  - Git and gh CLI are installed."));
}

async function checkGhAuth() {
  try {
    await execa("gh", ["auth", "status"], { stdio: "ignore" });
  } catch (_error) {
    throw new Error("gh CLI is not authenticated. Please run `gh auth login`.");
  }
  console.log(chalk.green("  - gh CLI is authenticated."));
}

async function syncWithRemote() {
  await execa("git", ["fetch", "origin", "main"]);
  const { stdout: localSha } = await execa("git", ["rev-parse", "HEAD"]);
  const { stdout: remoteSha } = await execa("git", [
    "rev-parse",
    "origin/main",
  ]);

  if (localSha !== remoteSha) {
    throw new Error(
      "Local main branch is not in sync with origin/main. Please pull latest changes.",
    );
  }
  console.log(chalk.green("  - Local main branch is in sync with remote."));
}

run().catch((error) => {
  console.error(
    chalk.red(`
Unhandled error: ${error.message}`),
  );
  process.exit(1);
});
