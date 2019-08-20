# ReadAloud

Read Aloud is a simple Google Chrome extension to read aloud selected text.

## Usage

- Tripple click to read a paragraph
- Press **`Ctrl+Space`** to read selected text
- Use the toolbar icon to start or stop reading selected text

## Installation

- Make sure you have Git, Node.js, and Npm installed on your computer 
- Clone this repository on your computer and navigate to it 

```
git clone https://github.com/mystilleef/ReadAloud/
cd ReadAloud
```

- Build the extension

```
npm i
npm run dist
```

- The unpacked extension will be built in the **`dist`** folder
- Open Chrome and navigate to **`chrome://extensions`**
- Enable **`Developer mode`** on the extensions page
- Click **`Load unpacked`** button and select **`dist`** folder
- The **`Read Aloud`** extension icon should now be present on your Chrome toolbar

## Todo
- [ ] Add UI to change language voice
- [ ] Add UI to change speaking rate
- [ ] Make extension easy to install for normal users
- [ ] Distribute to Chrome Store

## Caveats
- This extension is a work in progress
- Non-English text, language and locales has not been tested
