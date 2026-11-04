import { useState } from 'react'
import JoinForm from './components/JoinForm'
import Session from './components/Session'

export interface JoinInfo {
  sessionName: string
  password: string
  token: string
}

export default function App() {
  const [joinInfo, setJoinInfo] = useState<JoinInfo | null>(null)

  if (!joinInfo) return <JoinForm onJoin={setJoinInfo} />
  return <Session {...joinInfo} onLeave={() => setJoinInfo(null)} />
}
