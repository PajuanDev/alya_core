
import React, { useState } from 'react'

export default function IntegrationsButton() {
  const [open, setOpen] = useState(false)
  const toggle = () => setOpen(!open)
  return (
    <div className="fixed bottom-4 right-4">
      <button onClick={toggle} className="p-3 rounded-full bg-blue-600 text-white shadow-lg">APIs</button>
      {open && (
        <div className="absolute bottom-16 right-0 bg-white border shadow p-4">
          <h3 className="font-bold mb-2">Intégrations</h3>
          <ul>
            <li>HubSpot: <span className="text-green-600">connecté</span></li>
            <li>Trello: <span className="text-red-600">déconnecté</span></li>
            <li>Slack: <span className="text-red-600">déconnecté</span></li>
            <li>Gmail: <span className="text-red-600">déconnecté</span></li>
          </ul>
        </div>
      )}
    </div>
  )
}
