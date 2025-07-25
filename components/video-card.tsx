"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Eye, Clock, Lock } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface VideoCardProps {
  video: {
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
}

export function VideoCard({ video }: VideoCardProps) {
  return (
    <Link href={`/watch/${video.id}`}>
      <Card className="video-card overflow-hidden border-0 bg-card/50">
        <div className="relative aspect-video overflow-hidden rounded-t-lg">
          <img
            src={video.thumbnail || "/placeholder.svg"}
            alt={video.title}
            className="h-full w-full object-cover transition-transform duration-300 hover:scale-110"
          />
          {video.duration && (
            <Badge className="absolute bottom-2 right-2 bg-black/80 text-white">{video.duration}</Badge>
          )}
          {video.privacy === "private" && (
            <Badge className="absolute top-2 right-2 bg-red-500/90 text-white">
              <Lock className="h-3 w-3 mr-1" />
              Private
            </Badge>
          )}
        </div>
        <CardContent className="p-4">
          <div className="flex space-x-3">
            <Avatar className="h-9 w-9">
              <AvatarImage src={video.userAvatar || "/placeholder.svg"} alt={video.userName} />
              <AvatarFallback>{video.userName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1">
              <h3 className="font-semibold line-clamp-2 text-sm leading-tight">{video.title}</h3>
              <p className="text-sm text-muted-foreground">{video.userName}</p>
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <Eye className="h-3 w-3" />
                  <span>{video.views.toLocaleString()} views</span>
                </div>
                <span>•</span>
                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>{formatDistanceToNow(new Date(video.createdAt), { addSuffix: true })}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
