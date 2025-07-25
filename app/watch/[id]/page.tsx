/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Eye, Calendar, Lock, Share, ThumbsUp, ThumbsDown } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

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

export default function WatchPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [video, setVideo] = useState<Video | null>(null)
  const [relatedVideos, setRelatedVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [hasViewed, setHasViewed] = useState(false)

  useEffect(() => {
    if (params.id) {
      loadVideo(params.id as string)
    }
  }, [params.id, user])

  const loadVideo = (videoId: string) => {
    const allVideos = JSON.parse(localStorage.getItem("streamhub_videos") || "[]")
    const users = JSON.parse(localStorage.getItem("streamhub_users") || "[]")

    const foundVideo = allVideos.find((v: Video) => v.id === videoId)

    if (!foundVideo) {
      router.push("/")
      return
    }

    // Allow public videos for everyone, private videos only for owners
    if (foundVideo.privacy === "private") {
      if (!user || foundVideo.userId !== user.id) {
        router.push("/auth/signin")
        return
      }
    }

    const videoUser = users.find((u: any) => u.id === foundVideo.userId)
    const videoWithUser = {
      ...foundVideo,
      userName: videoUser?.name || "Unknown User",
      userAvatar: videoUser?.avatar,
    }

    setVideo(videoWithUser)

    // Load related videos (only public videos for non-authenticated users)
    const related = allVideos
      .filter((v: Video) => {
        if (v.id === videoId) return false
        if (!user) return v.privacy === "public" // Only public videos for non-authenticated users
        return v.privacy === "public" && (v.userId === foundVideo.userId || Math.random() > 0.5)
      })
      .slice(0, 8)
      .map((v: Video) => {
        const relatedUser = users.find((u: any) => u.id === v.userId)
        return {
          ...v,
          userName: relatedUser?.name || "Unknown User",
          userAvatar: relatedUser?.avatar,
        }
      })

    setRelatedVideos(related)
    setLoading(false)
  }

  const incrementViewCount = () => {
    if (!video || hasViewed) return

    const allVideos = JSON.parse(localStorage.getItem("streamhub_videos") || "[]")
    const updatedVideos = allVideos.map((v: Video) => (v.id === video.id ? { ...v, views: v.views + 1 } : v))

    localStorage.setItem("streamhub_videos", JSON.stringify(updatedVideos))
    setVideo({ ...video, views: video.views + 1 })
    setHasViewed(true)
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: video?.title,
          text: video?.description,
          url: window.location.href,
        })
      } catch (error) {
        // Fallback to clipboard
        navigator.clipboard.writeText(window.location.href)
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!video) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Video not found</h1>
            <Button onClick={() => router.push("/")}>Go Home</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Video Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Player */}
            <div className="aspect-video bg-black rounded-lg overflow-hidden">
              <video
                src={video.videoUrl}
                controls
                className="w-full h-full"
                onPlay={incrementViewCount}
                poster={video.thumbnail}
              >
                Your browser does not support the video tag.
              </video>
            </div>

            {/* Video Info */}
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h1 className="text-2xl font-bold mb-2">{video.title}</h1>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Eye className="h-4 w-4" />
                      <span>{video.views.toLocaleString()} views</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDistanceToNow(new Date(video.createdAt), { addSuffix: true })}</span>
                    </div>
                    {video.privacy === "private" && (
                      <Badge variant="secondary">
                        <Lock className="h-3 w-3 mr-1" />
                        Private
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <ThumbsUp className="h-4 w-4 mr-2" />
                    Like
                  </Button>
                  <Button variant="outline" size="sm">
                    <ThumbsDown className="h-4 w-4 mr-2" />
                    Dislike
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleShare}>
                    <Share className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Channel Info */}
              <div className="flex items-center space-x-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={video.userAvatar || "/placeholder.svg"} alt={video.userName} />
                  <AvatarFallback>{video.userName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-semibold">{video.userName}</h3>
                  <p className="text-sm text-muted-foreground">Content Creator</p>
                </div>
                <Button variant="outline">Subscribe</Button>
              </div>

              {/* Description */}
              {video.description && (
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="whitespace-pre-wrap">{video.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* Related Videos Sidebar */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Related Videos</h2>
            <div className="space-y-4">
              {relatedVideos.map((relatedVideo) => (
                <div
                  key={relatedVideo.id}
                  className="flex space-x-3 cursor-pointer hover:bg-muted/50 p-2 rounded-lg transition-colors"
                  onClick={() => router.push(`/watch/${relatedVideo.id}`)}
                >
                  <div className="relative w-40 aspect-video flex-shrink-0">
                    <img
                      src={relatedVideo.thumbnail || "/placeholder.svg"}
                      alt={relatedVideo.title}
                      className="w-full h-full object-cover rounded"
                    />
                    {relatedVideo.duration && (
                      <Badge className="absolute bottom-1 right-1 bg-black/80 text-white text-xs">
                        {relatedVideo.duration}
                      </Badge>
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <h3 className="font-medium text-sm line-clamp-2 leading-tight">{relatedVideo.title}</h3>
                    <p className="text-xs text-muted-foreground">{relatedVideo.userName}</p>
                    <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                      <span>{relatedVideo.views.toLocaleString()} views</span>
                      <span>•</span>
                      <span>{formatDistanceToNow(new Date(relatedVideo.createdAt), { addSuffix: true })}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
