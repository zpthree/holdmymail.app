import { ConvexHttpClient } from "convex/dist/esm/browser/index-node.js";
import { api } from "../convex/_generated/api";

const convexUrl = process.env.CONVEX_URL;
if (!convexUrl) {
  throw new Error("CONVEX_URL environment variable is required");
}

export const convex = new ConvexHttpClient(convexUrl);

const deployKey = process.env.CONVEX_DEPLOY_KEY;
if (!deployKey) {
  console.warn(
    "CONVEX_DEPLOY_KEY is not set. Convex requests may fail with missing access token.",
  );
} else {
  convex.setAdminAuth(deployKey);
}

export { api };
