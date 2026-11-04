import { useEffect, useState } from 'react'
import { type Participant } from '@zoom/videosdk'
import { X } from 'lucide-react'
import type { Client } from '../types'

interface PanelProps {
  client: Client
  onClose: () => void
}

const HOLD_EVENTS = ['on-hold-change', 'user-added', 'user-removed', 'user-updated'] as const

const Modal = ({ title, onClose, headerLeft, children }: {
  title: string
  onClose: () => void
  headerLeft?: React.ReactNode
  children: React.ReactNode
}) => (
  <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4" onClick={onClose}>
    <div
      role="dialog"
      aria-label={title}
      className="flex max-h-[80dvh] w-full max-w-md flex-col rounded-xl bg-white shadow-xl"
      onClick={(event) => event.stopPropagation()}
    >
      <div className="flex items-center justify-between gap-2 border-b border-gray-200 px-4 py-3">
        <div className="flex items-center gap-3">
          {headerLeft}
          <h2 className="text-lg font-semibold">{title}</h2>
        </div>
        <button type="button" aria-label="Close" className="cursor-pointer rounded-full p-1 hover:bg-gray-100" onClick={onClose}>
          <X size={20} />
        </button>
      </div>
      {children}
    </div>
  </div>
)

export const ParticipantsModal = ({ client, onClose }: PanelProps) => {
  const [users, setUsers] = useState<Participant[]>([])

  useEffect(() => {
    const refresh = () => setUsers(client.getAllUser().filter((u) => !u.isOnHold))
    HOLD_EVENTS.forEach((e) => client.on(e, refresh))
    refresh()
    return () => HOLD_EVENTS.forEach((e) => client.off(e, refresh))
  }, [client])

  return (
    <Modal title={`Participants (${users.length})`} onClose={onClose}>
      <ul className="flex-1 divide-y divide-gray-100 overflow-y-auto px-4">
        {users.map((user) => (
          <li key={user.userId} className="py-2">
            {user.displayName}
            {user.isHost && <span className="ml-2 text-sm text-gray-500">(Host)</span>}
          </li>
        ))}
      </ul>
    </Modal>
  )
}

export const AdmitParticipantsModal = ({ client, onClose }: PanelProps) => {
  const [waiting, setWaiting] = useState<Participant[]>([])
  const [holdEnabled, setHoldEnabled] = useState(() => client.isHoldEnabled())

  // on-hold-change plus user events cover users joining or leaving the waiting room.
  useEffect(() => {
    const refresh = () => {
      setWaiting(client.getOnHoldUsers())
      setHoldEnabled(client.isHoldEnabled())
    }
    HOLD_EVENTS.forEach((e) => client.on(e, refresh))
    refresh()
    return () => HOLD_EVENTS.forEach((e) => client.off(e, refresh))
  }, [client])

  const run = async (action: () => Promise<unknown>) => {
    try {
      await action()
      setWaiting(client.getOnHoldUsers())
      setHoldEnabled(client.isHoldEnabled())
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <Modal
      title="Admit Participants"
      onClose={onClose}
      headerLeft={
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={holdEnabled}
            onChange={(event) => run(() => client.enableHold(event.target.checked))}
          />
          Enable Hold
        </label>
      }
    >
      <ul className="min-h-24 flex-1 divide-y divide-gray-100 overflow-y-auto px-4">
        {waiting.length === 0 && <li className="py-4 text-center text-gray-500">No one is waiting.</li>}
        {waiting.map((user) => (
          <li key={user.userId} className="flex items-center justify-between gap-2 py-2">
            <span className="truncate">{user.displayName}</span>
            <button
              type="button"
              className="cursor-pointer rounded-lg bg-sky-500 px-3 py-1 text-white hover:bg-sky-600"
              onClick={() => run(() => client.admit(user.userId))}
            >
              Admit
            </button>
          </li>
        ))}
      </ul>
      <div className="border-t border-gray-200 p-3">
        <button
          type="button"
          disabled={waiting.length === 0}
          className="w-full cursor-pointer rounded-lg bg-sky-500 px-4 py-2 text-white hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-50"
          onClick={() => run(() => client.admitAll())}
        >
          Admit All
        </button>
      </div>
    </Modal>
  )
}
