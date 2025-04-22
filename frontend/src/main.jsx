import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import { msalInstance } from "./LoginButton"

;(async () => {
  try {
    // Initialiser MSAL avant de rendre l'application
    await msalInstance.initialize()
  } catch (e) {
    console.warn("MSAL.initialize() warning:", e)
  }

  ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
})()
