import chromeWebstoreUpload from "chrome-webstore-upload";

interface WebstoreItem {
  extensionId: string;
  publisherId: string;
}

/**
 * Create a Chrome Web Store client for one store item
 *
 * Callers pass a service account token to every request, so the client's
 * refresh-token flow never runs; the library still demands those fields,
 * hence the placeholders.
 */
export function createWebstoreClient({
  extensionId,
  publisherId,
}: WebstoreItem) {
  return chromeWebstoreUpload({
    extensionId,
    publisherId,
    clientId: "not-used-with-service-account",
    clientSecret: "not-used-with-service-account",
    refreshToken: "not-used-with-service-account",
  });
}
