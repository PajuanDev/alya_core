import React from "react";

export default function SignupButton() {
  const handleSignup = async () => {
    const email = prompt("Email ?");
    const password = prompt("Mot de passe ?");
    if (!email || !password) return;
    const res = await fetch("/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    if (res.ok) {
      alert("Inscription réussie ! Vous pouvez maintenant vous connecter.");
    } else {
      const data = await res.json().catch(() => ({}));
      alert(data.detail || "Erreur d'inscription");
    }
  };

  return (
    <button
      onClick={handleSignup}
      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
    >
      S'inscrire
    </button>
  );
}
