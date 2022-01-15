import type { ManifestV3 } from "rollup-plugin-chrome-extension";

export const manifest: ManifestV3 = {
  "manifest_version": 3,
  "background": { "service_worker": "background.ts" },
  "permissions": ["activeTab"],
  "content_scripts": [
    {
      "all_frames": true,
      "js": ["content.ts"],
      // "matches": ["<all_urls>"]
      "matches": ["https://*/*", "http://*/*"]
    }
  ],
  "action": {
    "default_title": "Read aloud selected text",
    "default_icon": {
      "16": "images/default16.png",
      "32": "images/default32.png",
      "48": "images/default48.png",
      "128": "images/default128.png"
    }
  },
  "commands": {
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
  "web_accessible_resources": [
    {
      "resources": ["images/default.svg", "images/stop.svg"],
      "matches": ["<all_urls>"]
    }
  ]
};
