// ─────────────────────────────────────────────────────────────────────────────
// src/main.tsx  –  The entry point of the React application.
//
// This is the FIRST file that runs. It:
//   1. Finds the <div id="root"> in index.html
//   2. Creates a React root inside it
//   3. Renders our <App /> component into it
//
// Everything in the browser starts from this file.
// ─────────────────────────────────────────────────────────────────────────────

import { StrictMode }  from "react";            // StrictMode runs extra checks in development
import { createRoot }  from "react-dom/client"; // createRoot mounts React into the HTML page
import "./index.css";                           // import our global CSS (Tailwind + custom styles)
import App             from "./App.tsx";        // import our root component

// document.getElementById("root") finds the <div id="root"> in index.html
// createRoot() tells React to manage that div
// ! at the end tells TypeScript "this will definitely exist, don't warn me"
createRoot(document.getElementById("root")!).render(
  // StrictMode is a development helper – it renders components twice to catch bugs early.
  // It has NO effect in the production build.
  <StrictMode>
    <App /> {/* render the entire TimeSphere app */}
  </StrictMode>
);
