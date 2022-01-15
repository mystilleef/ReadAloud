import { manifest as manifestv2 } from "./manifestv2";
import { manifest as manifestv3 } from "./manifestv3";

const verison = 2;
const manifest = getManifest();

function getManifest() {
  if (verison === 2) return manifestv2;
  return manifestv3;
}

export default manifest;
