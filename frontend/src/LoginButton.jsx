import React from "react";
import { PublicClientApplication } from "@azure/msal-browser";

// ── Config MSAL B2C ─────────────────────────────────
const msalConfig = {
  auth: {
    clientId: import.meta.env.VITE_B2C_CLIENT_ID,                                      // ID d’application de ta SPA
    authority: `https://${import.meta.env.VITE_B2C_TENANT}.b2clogin.com/${import.meta.env.VITE_B2C_TENANT}.onmicrosoft.com/${import.meta.env.VITE_B2C_POLICY}`,
    knownAuthorities: [
      `${import.meta.env.VITE_B2C_TENANT}.b2clogin.com`
    ],
    redirectUri: window.location.origin
  },
  cache: {
    cacheLocation: "localStorage",  // garder la session au reload
    storeAuthStateInCookie: false
  }
};

// Instance MSAL publique
export const msalInstance = new PublicClientApplication(msalConfig);

// Scope pour communiquer avec ton API backend
export const apiScope = `${import.meta.env.VITE_B2C_BACKEND_APP_ID}/user_impersonation`;

export default function LoginButton() {
  const handleLogin = async () => {
    // initialise le client MSAL (v2+)
    await msalInstance.initialize();
    // lance le flux redirect vers Azure B2C
    await msalInstance.loginRedirect({
      scopes: ["openid", "profile", apiScope]
    });
  };

  return (
    <button
      onClick={handleLogin}
      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
    >
      Se connecter
    </button>
  );
}

