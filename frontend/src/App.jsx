import React, { useState } from "react";
import LoginButton from "./LoginButton";
import SignupButton from "./SignupButton";
import { Paperclip, Send, Bot, User } from "lucide-react";

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [conversationId, setConversationId] = useState(
    () => localStorage.getItem("alya_conversation_id")
  );
  const [messages, setMessages] = useState([]);
  const [input, setInput]       = useState("");
  const [sending, setSending]   = useState(false);


  if (!token) {
    return (
      <div className="flex h-screen items-center justify-center bg-neutral-50 gap-4">
        <LoginButton />
        <SignupButton />
      </div>
    );
  }

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { role: "user", content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setSending(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          message: userMsg.content,
          conversation_id: conversationId
        })
      });

      if (res.status === 401) {
        throw new Error("Unauthorized – token invalide ou expiré");
      }

      const { conversation_id, reply } = await res.json();

      // mémoriser ou mettre à jour l’ID de conversation
      if (conversation_id) {
        setConversationId(conversation_id);
        localStorage.setItem("alya_conversation_id", conversation_id);
      }

      setMessages(prev => [
        ...prev,
        { role: "assistant", content: reply }
      ]);
    } catch (e) {
      console.error("Chat error:", e);
      setMessages(prev => [
        ...prev,
        { role: "assistant", content: "[Erreur serveur ou 401]" }
      ]);
    } finally {
      setSending(false);
    }
  };

  const handleKey = e => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col items-center w-full min-h-screen bg-neutral-50 p-4 gap-4">
      <h1 className="text-3xl font-semibold">Alya</h1>
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow flex flex-col h-[75vh]">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`flex items-start gap-1 max-w-[75%] ${m.role === "user" ? "flex-row-reverse" : ""}`}
              >
                {m.role === "user"
                  ? <User className="h-4 w-4 text-blue-600 shrink-0" />
                  : <Bot  className="h-4 w-4 text-green-600 shrink-0" />
                }
                <span
                  className={`px-3 py-2 rounded-xl text-sm whitespace-pre-line ${m.role === "user" ? "bg-blue-100" : "bg-green-100"}`}
                >
                  {m.content}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t p-4 flex items-center gap-2">
          <label className="cursor-pointer text-neutral-500 hover:text-neutral-700">
            <Paperclip className="h-5 w-5" />
            <input type="file" className="hidden" disabled />
          </label>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Écrivez votre message…"
            rows={1}
            className="flex-1 resize-none border rounded-xl p-2 text-sm focus:outline-none focus:ring"
          />
          <button
            onClick={sendMessage}
            disabled={sending}
            className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>

      <button className="fixed bottom-6 right-6 rounded-full h-14 w-14 shadow-xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white flex items-center justify-center">
        APIs
      </button>
    </div>
  );
}



