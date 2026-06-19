import { useRef, useEffect, useState } from 'react'
import { X } from 'lucide-react'

interface Props {
  onCapture: (file: File) => void
  onClose: () => void
}

export default function CameraCapture({ onCapture, onClose }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [ready, setReady] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    // Magas felbontás kérése — blokk apró betűi miatt fontos.
    // Az `ideal` nem dob hibát, ha a kamera ennél kevesebbet tud.
    navigator.mediaDevices
      .getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 3840 },
          height: { ideal: 2160 },
        },
        audio: false,
      })
      .then((stream) => {
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
        setReady(true)
      })
      .catch(() => setError('Kamera nem elérhető. Válassz képet a galériából.'))

    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop())
    }
  }, [])

  function stopStream() {
    streamRef.current?.getTracks().forEach((t) => t.stop())
  }

  async function capture() {
    if (busy) return
    setBusy(true)
    const track = streamRef.current?.getVideoTracks()[0]

    // 1) Teljes fotó-felbontás ImageCapture-rel (Chrome/Edge Android) — sokkal
    //    élesebb, mint a videó-képkocka.
    if (track && 'ImageCapture' in window) {
      try {
        const blob = await new ImageCapture(track).takePhoto()
        stopStream()
        onCapture(new File([blob], 'photo.jpg', { type: blob.type || 'image/jpeg' }))
        return
      } catch {
        // nem támogatott / sikertelen → videó-képkocka fallback
      }
    }

    // 2) Fallback: aktuális videó-képkocka canvas-ra
    const video = videoRef.current
    if (!video || !video.videoWidth || !video.videoHeight) {
      setError('A kamera képe még nem töltött be. Várj egy pillanatot, majd próbáld újra.')
      setBusy(false)
      return
    }
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d')?.drawImage(video, 0, 0)
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setError('Nem sikerült elkészíteni a fotót. Próbáld újra.')
          setBusy(false)
          return
        }
        stopStream()
        onCapture(new File([blob], 'photo.jpg', { type: 'image/jpeg' }))
      },
      'image/jpeg',
      0.92,
    )
  }

  return (
    <div className="fixed inset-0 z-[60] bg-black flex flex-col">
      {error ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 px-8 text-center">
          <p className="text-white/70 text-sm">{error}</p>
          <button onClick={onClose} className="px-6 py-3 rounded-2xl text-white text-sm font-medium" style={{ background: 'rgba(255,255,255,0.15)' }}>
            Vissza
          </button>
        </div>
      ) : (
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="flex-1 object-cover w-full"
          />
          <div className="flex justify-between items-center px-10 py-10 bg-black/60">
            <button onClick={onClose} className="w-12 h-12 flex items-center justify-center">
              <X size={24} className="text-white" />
            </button>
            <button
              onClick={capture}
              disabled={!ready || busy}
              className="w-18 h-18 rounded-full border-4 border-white active:scale-95 transition-transform disabled:opacity-40"
              style={{ width: 72, height: 72, background: 'rgba(255,255,255,0.9)' }}
            />
            <div className="w-12" />
          </div>
        </>
      )}
    </div>
  )
}
