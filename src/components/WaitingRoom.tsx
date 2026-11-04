export default function WaitingRoom() {
  return (
    <div className="flex h-dvh flex-col items-center justify-center gap-4 bg-gray-100">
      <div className="h-16 w-16 animate-spin rounded-full border-4 border-gray-300 border-t-sky-500" />
      <p className="text-lg font-medium text-gray-700">Waiting for the host to admit you...</p>
    </div>
  )
}
