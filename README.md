# ReadAloud

**`Read Aloud`** is a simple Chrome extension to read aloud selected text.

## Usage

- Tripple click to read a paragraph
- Press **`Ctrl+Space`** to read selected text
- Use the toolbar icon to start or stop reading selected text
- `Right-click` then **`Read Aloud > Voices`** to change reading voice
- `Right-click` then **`Read Aloud > Speed`** to change reading rate
- `Right-click` then **`Read Aloud > Pitch`** to change reading pitch
- `Right-click` then **`Read Aloud > Reset to Default`** to set default options

## Installation

- Make sure you have Git, Node.js, and Npm installed on your computer
- Clone this repository on your computer and navigate to it

```bash
git clone https://github.com/mystilleef/ReadAloud/
cd ReadAloud
```

- Build the extension

```bash
npm i
npm run dist
```

- The unpacked extension will be built in the **`dist`** folder
- Open Chrome and navigate to **`chrome://extensions`**
- Enable **`Developer mode`** on the extensions page
- Press **`Load unpacked`** and select the **`dist`** folder you just built
- The **`Read Aloud`** icon should now be present on the Chrome toolbar

## Todo

- [x] Add UI to change language voice
- [x] Add UI to change speaking rate
- [ ] Make extension easy to install for normal users
- [ ] Distribute to Chrome Store

## Caveats

- This extension is a work in progress
- Non-English text, language and locales has not been tested
