/* eslint-disable camelcase */
import type { ManifestV2 } from "rollup-plugin-chrome-extension";

const manifest: ManifestV2 = {
  manifest_version: 2,
  background: {
    scripts: ["background.ts"],
    persistence: false
  },
  content_scripts: [
    {
      js: ["content.ts"],
      all_frames: true,
      matches: ["<all_urls>"]
    }
  ],
  browser_action: {
    default_title: "Read aloud selected text",
    default_icon: {
      16: "images/default16.png",
      32: "images/default32.png",
      48: "images/default48.png",
      128: "images/default128.png"
    }
  },
  commands: {
    "read-aloud-selected-text": {
      "description": "Read aloud selected text",
      "suggested_key": { "default": "Ctrl+Space" }
    }
  },
  "icons": {
    "16": "images/default16.png",
    "32": "images/default32.png",
    "48": "images/default48.png",
    "128": "images/default128.png"
  },
  web_accessible_resources: ["images/default.svg", "images/stop.svg"]
};

export default manifest;
