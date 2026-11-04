import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { VideoQuality, type Participant } from '@zoom/videosdk'
import { Headphones, MicOff, VideoOff } from 'lucide-react'
import type { Client } from '../types'

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'video-player-container': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>
    }
  }
}

interface VideoProps {
  client: Client
  version: number
  children?: React.ReactNode
}

const GRID_COLS: Record<number, string> = { 1: 'grid-cols-1', 2: 'grid-cols-2', 3: 'grid-cols-3' }

interface TileProps {
  client: Client
  user: Participant
  isActive: boolean
  aspect: string
  quality: VideoQuality
  refreshKey: number
}

const VideoTile = ({ client, user, isActive, aspect, quality, refreshKey }: TileProps) => {
  const videoRef = useRef<HTMLDivElement>(null)
  // attachVideo/detachVideo are keyed by userId, so overlapping calls from re-runs must not interleave.
  const queueRef = useRef<Promise<unknown>>(Promise.resolve())

  useEffect(() => {
    const el = videoRef.current
    if (!el || !user.bVideoOn) return
    const stream = client.getMediaStream()
    let cancelled = false
    let attached = false

    queueRef.current = queueRef.current.then(async () => {
      if (cancelled) return
      try {
        const player = await stream.attachVideo(user.userId, quality)
        attached = true
        if (!cancelled && player) el.replaceChildren(player as unknown as Node)
      } catch (error) {
        console.error(error)
      }
    })

    return () => {
      cancelled = true
      el.replaceChildren()
      queueRef.current = queueRef.current.then(async () => {
        if (!attached || !client.getSessionInfo()?.isInMeeting) return
        try {
          await stream.detachVideo(user.userId)
        } catch (error) {
          console.error(error)
        }
      })
    }
  }, [client, user.userId, user.bVideoOn, quality, refreshKey])

  const tileClass = [
    'relative flex items-center justify-center overflow-hidden rounded-lg',
    aspect,
    !user.bVideoOn && 'bg-black',
    isActive && 'border-2 border-green-500',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={tileClass}>
      {user.bVideoOn ? (
        <div ref={videoRef} className="absolute inset-0" />
      ) : (
        <span className="line-clamp-3 px-2 text-center text-xl font-semibold text-white">{user.displayName}</span>
      )}
      <div className="absolute bottom-2 left-2 max-w-[calc(100%-1rem)]">
        <div className="flex w-fit max-w-full items-center space-x-1 rounded-[10px] bg-black/50 px-2 py-1 text-white">
          {user.audio === '' && <Headphones size={16} className="shrink-0 text-red-500" />}
          {user.muted === true && <MicOff size={16} className="shrink-0 fill-red-500 text-red-500" />}
          {!user.bVideoOn && <VideoOff size={16} className="shrink-0 fill-red-500 text-red-500" />}
          <span className="truncate pl-1">{user.displayName}</span>
        </div>
      </div>
    </div>
  )
}

const Video = ({ client, version, children }: VideoProps) => {
  const mainRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ width: 0, height: 0 })
  const [users, setUsers] = useState<Participant[]>(() => client.getAllUser().filter((u) => !u.isOnHold))
  const [activeId, setActiveId] = useState<number>()

  useEffect(() => {
    const refresh = () => setUsers(client.getAllUser().filter((u) => !u.isOnHold))
    const onActiveSpeaker = (payload: { userId: number }[]) => setActiveId(payload[0]?.userId)
    const events = ['user-added', 'user-removed', 'user-updated', 'peer-video-state-change']
    events.forEach((e) => client.on(e, refresh))
    client.on('active-speaker', onActiveSpeaker)
    refresh()
    return () => {
      events.forEach((e) => client.off(e, refresh))
      client.off('active-speaker', onActiveSpeaker)
    }
  }, [client, version])

  useLayoutEffect(() => {
    const el = mainRef.current
    if (!el) return
    const observer = new ResizeObserver(([entry]) => {
      setSize({ width: entry.contentRect.width, height: entry.contentRect.height })
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const portrait = size.height > size.width
  const count = users.length

  let width: number
  let height: number
  if (portrait) {
    height = size.height * 0.8
    width = Math.min((height / 4) * 3 - 16, size.width - 16)
  } else {
    height = size.height
    width = Math.min((height / 9) * 16 - 16, size.width - 16)
  }
  const cols = portrait ? (count <= 1 ? 1 : 2) : count <= 1 ? 1 : count <= 4 ? 2 : 3
  const aspect = portrait ? 'aspect-[3/4]' : 'aspect-video'
  const quality = count <= 1 ? VideoQuality.Video_720P : VideoQuality.Video_360P

  return (
    <>
      <div ref={mainRef} className="flex min-h-0 w-full flex-1 items-center justify-center">
        {size.width > 0 && (
          <video-player-container style={{ width, height }}>
            <div className={`grid h-full w-full content-center justify-center gap-2 overflow-hidden p-2 ${GRID_COLS[cols]}`}>
              {users.map((user) => (
                <VideoTile
                  key={user.userId}
                  client={client}
                  user={user}
                  isActive={user.userId === activeId && count > 1}
                  aspect={aspect}
                  quality={quality}
                  // Re-attach own video after start/stop completes; the state event can fire before the stream is ready.
                  refreshKey={user.userId === client.getCurrentUserInfo()?.userId ? version : 0}
                />
              ))}
            </div>
          </video-player-container>
        )}
      </div>
      <footer className="border-t border-gray-200 bg-white px-4 py-2 shadow-lg">
        <div className="mx-auto flex items-center justify-evenly" style={{ width: width > 0 ? width : '100%' }}>
          {children}
        </div>
      </footer>
    </>
  )
}

export default Video
