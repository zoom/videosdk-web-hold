import { useEffect, useRef, useState } from 'react'
import ZoomVideo from '@zoom/videosdk'
import Video from './Video'
import Controls from './Controls'
import WaitingRoom from './WaitingRoom'
import type { Client } from '../types'

interface SessionProps {
  sessionName: string
  password: string
  token: string
  onLeave: () => void
}

// The JWT payload carries role_type: 1 = host, 0 = participant.
function isHostToken(token: string) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
    return payload.role_type === 1
  } catch {
    return false
  }
}

export default function Session({ sessionName, password, token, onLeave }: SessionProps) {
  const clientRef = useRef<Client>(null)
  clientRef.current ??= ZoomVideo.createClient()
  const client = clientRef.current

  const isHost = isHostToken(token)
  const [status, setStatus] = useState<'joining' | 'joined' | 'error'>('joining')
  const [error, setError] = useState('')
  const [onHold, setOnHold] = useState(false)
  const [version, setVersion] = useState(0)

  useEffect(() => {
    let cancelled = false
    const onHoldChange = (payload: { isOnHold: boolean }) => setOnHold(payload.isOnHold)

    const join = async () => {
      try {
        await client.init('en-US', 'Global', { patchJsMedia: true })
        client.on('on-hold-change', onHoldChange)
        await client.join(sessionName, token, `${isHost ? 'Host' : 'Guest'}-${Math.floor(Math.random() * 900 + 100)}`, password)
        if (cancelled) return
        // The host turns on the waiting room so new guests are placed on hold until admitted.
        if (isHost) await client.enableHold(true)
        setOnHold(client.isUserOnHold())
        setStatus('joined')
      } catch (e: any) {
        if (cancelled) return
        setError(e?.reason || e?.message || 'Unable to join the session.')
        setStatus('error')
      }
    }
    join()

    return () => {
      cancelled = true
      client.off('on-hold-change', onHoldChange)
      client.leave().catch(() => {})
    }
  }, [client, sessionName, password, token, isHost])

  if (status === 'error') {
    return (
      <div className="flex h-dvh flex-col items-center justify-center gap-4">
        <p className="text-lg">{error}</p>
        <button className="text-sky-600 hover:underline" onClick={onLeave}>
          Back
        </button>
      </div>
    )
  }

  if (status === 'joining') {
    return <div className="flex h-dvh items-center justify-center text-lg">Joining...</div>
  }

  const leaveSession = async (end: boolean) => {
    try {
      await client.leave(end)
    } catch (e) {
      console.error(e)
    }
    onLeave()
  }

  if (onHold) return <WaitingRoom />

  return (
    <div className="relative flex h-dvh w-full flex-col bg-gray-100">
      <Video client={client} version={version}>
        <Controls
          client={client}
          isHost={isHost}
          leaveSession={leaveSession}
          onMediaChange={() => setVersion((v) => v + 1)}
        />
      </Video>
    </div>
  )
}
