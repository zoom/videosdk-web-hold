import { useState } from 'react'
import type { JoinInfo } from '../App'

const inputClass = 'w-full rounded-md border border-gray-300 px-3 py-2'
const buttonClass = 'w-full rounded-lg bg-sky-500 px-4 py-2 text-white hover:bg-sky-600'

export default function JoinForm({ onJoin }: { onJoin: (info: JoinInfo) => void }) {
  const [sessionName, setSessionName] = useState('')
  const [password, setPassword] = useState('')
  const [askForToken, setAskForToken] = useState(false)
  const [token, setToken] = useState('')

  return (
    <div className="flex h-dvh flex-col items-center justify-center gap-6 bg-gray-100 px-4">
      <h1 className="text-center text-3xl font-semibold">Video SDK Waiting Room Sample</h1>

      <form
        className="w-full max-w-sm space-y-4 rounded-xl bg-white p-6 shadow"
        onSubmit={(e) => {
          e.preventDefault()
          setAskForToken(true)
        }}
      >
        <input
          required
          placeholder="Session Name"
          aria-label="Session Name"
          value={sessionName}
          onChange={(e) => setSessionName(e.target.value)}
          className={inputClass}
        />
        <input
          type="password"
          placeholder="Session Password (optional)"
          aria-label="Session Password"
          autoComplete="off"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClass}
        />
        <button type="submit" className={buttonClass}>
          Join Session
        </button>
      </form>

      {askForToken && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 px-4">
          <form
            className="w-full max-w-sm space-y-4 rounded-xl bg-white p-6 shadow-xl"
            onSubmit={(e) => {
              e.preventDefault()
              onJoin({ sessionName, password, token: token.trim() })
            }}
          >
            <h2 className="text-lg font-semibold">Enter your JWT</h2>
            <p className="text-sm text-gray-600">
              Generate one with <code>npm run token -- "{sessionName}" 1 0</code> (role 1 = host, 0 = guest; then hold 0, 1, or 2).
            </p>
            <textarea
              required
              autoFocus
              rows={4}
              aria-label="JWT"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className={`${inputClass} break-all`}
            />
            <div className="flex gap-2">
              <button type="button" className="w-full rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-100" onClick={() => setAskForToken(false)}>
                Cancel
              </button>
              <button type="submit" className={buttonClass}>
                Join
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
