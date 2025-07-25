"use client"

import { VideoCard } from "@/components/video-card"

interface Video {
  id: string
  title: string
  description: string
  thumbnail: string
  videoUrl: string
  userId: string
  userName: string
  userAvatar?: string
  privacy: "public" | "private"
  views: number
  createdAt: string
  duration?: string
}

interface VideoGridProps {
  videos: Video[]
  emptyMessage?: string
}

export function VideoGrid({ videos, emptyMessage = "No videos found" }: VideoGridProps) {
  if (videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-muted p-6 mb-4">
          <svg className="h-12 w-12 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold mb-2">No videos yet</h3>
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {videos.map((video) => (
        <VideoCard key={video.id} video={video} />
      ))}
    </div>
  )
}
