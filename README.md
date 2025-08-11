## Project File Structure

To ensure the project runs correctly, please maintain the following folder and file layout:

```text
Big5/
│
├── css/
│   └── styles.css
│
├── js/
│   ├── questions.json
│   └── quiz.js
│
└── Big5factor.html

- **css/** contains all styling files (currently `styles.css`).
- **js/** contains the quiz logic (`quiz.js`) and question data (`questions.json`).
- **Big5factor.html** is the main HTML file that links to the CSS and JS files.

⚠️ **Do not rename or move these files**—the relative paths in `Big5factor.html` depend on this structure. This code was partially vibe coded with Chat GPT o3/4o + Gemini 2.5 Pro.
