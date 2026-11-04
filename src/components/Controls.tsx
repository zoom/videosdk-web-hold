import { useState } from 'react'
import { Headphones, Loader, LogOut, MoreHorizontal, Mic, MicOff, Video, VideoOff } from 'lucide-react'
import { AdmitParticipantsModal, ParticipantsModal } from './HostPanels'
import type { Client } from '../types'

interface ControlsProps {
  client: Client
  isHost: boolean
  leaveSession: (end: boolean) => void
  onMediaChange: () => void
}

const controlClass =
  'flex h-10 w-10 items-center justify-center rounded-full border border-transparent text-gray-700 transition-colors duration-200 hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50'

const menuClass =
  'absolute bottom-full left-1/2 z-20 mb-2 w-[200px] -translate-x-1/2 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl'

const Controls = ({ client, isHost, leaveSession, onMediaChange }: ControlsProps) => {
  const [isVideoOn, setIsVideoOn] = useState(false)
  const [videoLoading, setVideoLoading] = useState(false)
  const [isAudioStarted, setIsAudioStarted] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [audioLoading, setAudioLoading] = useState(false)
  const [showLeaveMenu, setShowLeaveMenu] = useState(false)
  const [showMore, setShowMore] = useState(false)
  const [panel, setPanel] = useState<'participants' | 'admit' | null>(null)

  const toggleVideo = async () => {
    const stream = client.getMediaStream()
    setVideoLoading(true)
    try {
      if (client.getCurrentUserInfo().bVideoOn) await stream.stopVideo()
      else await stream.startVideo({})
      setIsVideoOn(client.getCurrentUserInfo().bVideoOn)
      onMediaChange()
    } catch (error) {
      console.error(error)
    } finally {
      setVideoLoading(false)
    }
  }

  const toggleAudio = async () => {
    const stream = client.getMediaStream()
    setAudioLoading(true)
    try {
      if (!client.getCurrentUserInfo().audio) await stream.startAudio({})
      else if (client.getCurrentUserInfo().muted) await stream.unmuteAudio()
      else await stream.muteAudio()
      const current = client.getCurrentUserInfo()
      setIsAudioStarted(Boolean(current.audio))
      setIsMuted(current.muted ?? false)
    } catch (error) {
      console.error(error)
    } finally {
      setAudioLoading(false)
    }
  }

  const leave = (end: boolean) => {
    setShowLeaveMenu(false)
    leaveSession(end)
  }

  return (
    <>
      <button
        type="button"
        className={controlClass}
        title={!isAudioStarted ? 'Join audio' : isMuted ? 'Unmute' : 'Mute'}
        onClick={toggleAudio}
        disabled={audioLoading}
      >
        {audioLoading ? (
          <Loader size={20} className="animate-spin" />
        ) : !isAudioStarted ? (
          <Headphones size={20} />
        ) : isMuted ? (
          <MicOff size={20} />
        ) : (
          <Mic size={20} />
        )}
      </button>
      <button
        type="button"
        className={controlClass}
        title={isVideoOn ? 'Stop video' : 'Start video'}
        onClick={toggleVideo}
        disabled={videoLoading}
      >
        {videoLoading ? (
          <Loader size={20} className="animate-spin" />
        ) : isVideoOn ? (
          <Video size={20} />
        ) : (
          <VideoOff size={20} />
        )}
      </button>

      {isHost && (
        <div className="relative">
          {showMore && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowMore(false)} />
              <div className={menuClass}>
                {([['participants', 'Participants'], ['admit', 'Admit Participants']] as const).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    className="w-full px-4 py-2 text-left transition-colors duration-200 hover:bg-gray-100"
                    onClick={() => {
                      setShowMore(false)
                      setPanel(key)
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </>
          )}
          <button
            type="button"
            aria-label="More"
            title="More"
            className={controlClass}
            onClick={() => setShowMore((open) => !open)}
          >
            <MoreHorizontal size={20} />
          </button>
        </div>
      )}
      {panel === 'participants' && <ParticipantsModal client={client} onClose={() => setPanel(null)} />}
      {panel === 'admit' && <AdmitParticipantsModal client={client} onClose={() => setPanel(null)} />}

      <div className="relative">
        {showLeaveMenu && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setShowLeaveMenu(false)} />
            <div className={menuClass}>
              <button
                type="button"
                className="w-full bg-red-500 px-4 py-2 text-left text-white transition-colors duration-200 hover:bg-red-600"
                onClick={() => leave(true)}
              >
                End Session
              </button>
              <button
                type="button"
                className="w-full px-4 py-2 text-left text-red-500 transition-colors duration-200 hover:bg-gray-100"
                onClick={() => leave(false)}
              >
                Leave Session
              </button>
            </div>
          </>
        )}
        <button
          type="button"
          aria-label="Leave"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-red-500 shadow-md transition-all duration-200 hover:bg-red-600 hover:shadow-lg active:bg-red-800 active:shadow-inner"
          onClick={() => (isHost ? setShowLeaveMenu((open) => !open) : leave(false))}
        >
          <LogOut size={24} className="text-white" />
        </button>
      </div>
    </>
  )
}

export default Controls
