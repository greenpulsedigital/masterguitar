import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { VideoPreview } from "@/components/video-preview"

describe("VideoPreview", () => {
  it("should show empty state when no URL provided", () => {
    render(<VideoPreview url={null} />)

    expect(screen.getByText("Aucune vidéo ajoutée")).toBeInTheDocument()
  })

  it("should show empty state for undefined URL", () => {
    render(<VideoPreview url={undefined} />)

    expect(screen.getByText("Aucune vidéo ajoutée")).toBeInTheDocument()
  })

  it("should show empty state for empty string", () => {
    render(<VideoPreview url="" />)

    expect(screen.getByText("Aucune vidéo ajoutée")).toBeInTheDocument()
  })

  it("should show iframe for valid YouTube URL (watch format)", () => {
    const { container } = render(<VideoPreview url="https://www.youtube.com/watch?v=dQw4w9WgXcQ" />)

    const iframe = container.querySelector("iframe")
    expect(iframe).toBeInTheDocument()
    expect(iframe?.src).toContain("youtube.com/embed/dQw4w9WgXcQ")
  })

  it("should show iframe for valid YouTube URL (short format)", () => {
    const { container } = render(<VideoPreview url="https://youtu.be/dQw4w9WgXcQ" />)

    const iframe = container.querySelector("iframe")
    expect(iframe).toBeInTheDocument()
    expect(iframe?.src).toContain("youtube.com/embed/dQw4w9WgXcQ")
  })

  it("should show iframe for valid Vimeo URL", () => {
    const { container } = render(<VideoPreview url="https://vimeo.com/123456789" />)

    const iframe = container.querySelector("iframe")
    expect(iframe).toBeInTheDocument()
    expect(iframe?.src).toContain("player.vimeo.com/video/123456789")
  })

  it("should show invalid state for unparseable URL", () => {
    render(<VideoPreview url="not-a-valid-url" />)

    expect(screen.getByText("URL invalide")).toBeInTheDocument()
  })

  it("should show invalid state for unsupported platform", () => {
    render(<VideoPreview url="https://example.com/video.mp4" />)

    expect(screen.getByText("URL invalide")).toBeInTheDocument()
  })

  it("should have responsive 16:9 aspect ratio container", () => {
    const { container } = render(<VideoPreview url="https://www.youtube.com/watch?v=dQw4w9WgXcQ" />)

    const aspectRatioContainer = container.querySelector('[style*="aspect-ratio"]')
    expect(aspectRatioContainer).toBeInTheDocument()
  })
})
