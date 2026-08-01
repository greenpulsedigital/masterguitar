import { Video } from "lucide-react"

interface VideoPreviewProps {
  url: string | null | undefined
}

function parseVideoUrl(url: string): { platform: "youtube" | "vimeo" | null; videoId: string | null } {
  if (!url) {
    return { platform: null, videoId: null }
  }

  // YouTube patterns
  const youtubeRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/
  const youtubeMatch = url.match(youtubeRegex)
  if (youtubeMatch) {
    return { platform: "youtube", videoId: youtubeMatch[1] }
  }

  // Vimeo pattern
  const vimeoRegex = /vimeo\.com\/(\d+)/
  const vimeoMatch = url.match(vimeoRegex)
  if (vimeoMatch) {
    return { platform: "vimeo", videoId: vimeoMatch[1] }
  }

  return { platform: null, videoId: null }
}

export function VideoPreview({ url }: VideoPreviewProps) {
  // Empty state
  if (!url || url.trim() === "") {
    return (
      <div className="flex flex-col items-center justify-center w-full bg-muted rounded-lg p-8 text-muted-foreground" style={{ aspectRatio: "16 / 9" }}>
        <Video className="w-12 h-12 mb-2" />
        <p>Aucune vidéo ajoutée</p>
      </div>
    )
  }

  // Parse URL
  const { platform, videoId } = parseVideoUrl(url)

  // Invalid URL state
  if (!platform || !videoId) {
    return (
      <div className="flex flex-col items-center justify-center w-full bg-muted rounded-lg p-8 text-destructive" style={{ aspectRatio: "16 / 9" }}>
        <Video className="w-12 h-12 mb-2" />
        <p>URL invalide</p>
      </div>
    )
  }

  // Generate embed URL
  let embedUrl = ""
  if (platform === "youtube") {
    embedUrl = `https://www.youtube.com/embed/${videoId}`
  } else if (platform === "vimeo") {
    embedUrl = `https://player.vimeo.com/video/${videoId}`
  }

  // Valid video state
  return (
    <div className="w-full rounded-lg overflow-hidden" style={{ aspectRatio: "16 / 9" }}>
      <iframe
        src={embedUrl}
        title="Video preview"
        className="w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  )
}
