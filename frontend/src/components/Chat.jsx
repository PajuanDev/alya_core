
import React, { useState } from 'react'

export default function Chat() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')

  const send = async () => {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: input, history: [] }),
    })
    const data = await res.json()
    setMessages([...messages, { role: 'user', content: input }, { role: 'assistant', content: data.reply }])
    setInput('')
  }

  return (
    <div className="w-full max-w-xl">
      <div className="border p-2 h-96 overflow-y-scroll">
        {messages.map((m, idx) => (
          <p key={idx} className={m.role === 'user' ? 'text-right' : 'text-left'}>
            <b>{m.role === 'user' ? 'Vous' : 'Alya'}:</b> {m.content}
          </p>
        ))}
      </div>
      <div className="flex mt-2">
        <input className="flex-1 border p-2" value={input} onChange={e => setInput(e.target.value)} />
        <button className="px-4 bg-gray-200" onClick={send}>Envoyer</button>
      </div>
    </div>
  )
}
