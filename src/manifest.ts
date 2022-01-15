import { manifest as manifestv2 } from "./manifestv2";
import { manifest as manifestv3 } from "./manifestv3";

const verison = 2;
const manifest = verison === 2 ? manifestv2 : manifestv3;

export default manifest;
