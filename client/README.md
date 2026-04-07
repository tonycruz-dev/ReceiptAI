# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is enabled on this template. See [this documentation](https://react.dev/learn/react-compiler) for more information.

Note: This will impact Vite dev & build performances.

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from "eslint-plugin-react-x";
import reactDom from "eslint-plugin-react-dom";

export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs["recommended-typescript"],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```

You are generating documentation for a **client-side project** that works with a backend API called **ReceiptAI.API**.

⚠️ IMPORTANT:

* You MUST create or overwrite a file named **README.md**
* Do NOT create docs.md or any other file
* The output MUST be the full contents of README.md
* Do NOT include explanations or comments outside the file content

---

## Project Context

This is the **client application** for ReceiptAI.

The client:

* Allows users to upload receipts (images or PDFs)
* Sends them to the ReceiptAI.API backend
* Displays extracted data such as:

  * merchant name
  * total amount
  * date
  * line items
* Provides a user-friendly interface for interacting with AI-powered receipt processing

Assume this is a modern frontend app (e.g., React, Angular, or similar).

---

## Your Task

Generate a complete, professional **README.md** file describing the client project.

---

## The README MUST include:

### 1. Title & Overview

* Project name (e.g., ReceiptAI Client)
* Clear explanation of what the client does
* Mention connection to ReceiptAI.API

---

### 2. Features

Include:

* Upload receipt files
* View extracted receipt data
* Clean UI for results
* API integration
* Error handling / loading states

---

### 3. Tech Stack

Infer from the project, but include typical frontend technologies.

---

### 4. Getting Started

Include setup steps such as:

```bash
npm install
npm run dev
```

---

### 5. Configuration

Explain how to configure the API base URL.

Provide an example:

```env
VITE_API_BASE_URL=http://localhost:5000
```

---

### 6. How It Works

Explain:

* User uploads file
* Client sends request to API
* API returns structured data
* Client displays results

---

### 7. API Integration

Mention key endpoint example:

* POST /api/receipts/upload

---

### 8. Folder Structure

Brief explanation of components, services, etc.

---

### 9. Notes

* Ensure backend is running
* Do not commit sensitive configs
