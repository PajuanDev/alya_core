import React from "react";

export default function LoginButton() {
  const handleLogin = async () => {
    const email = prompt("Email ?");
    const password = prompt("Mot de passe ?");
    const res = await fetch("/auth/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ username: email, password }),
    });
    if (res.ok) {
      const data = await res.json();
      localStorage.setItem("token", data.access_token);
      alert("Connecté !");
    } else {
      alert("Erreur de connexion");
    }
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
