/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useEffect, useState } from "react"
import { Navbar } from "@/components/navbar"
import { VideoGrid } from "@/components/video-grid"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Clock, Eye } from "lucide-react"
import { useAuth } from "@/components/auth-provider"

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

export default function HomePage() {
  const { user } = useAuth()
  const [videos, setVideos] = useState<Video[]>([])
  const [filteredVideos, setFilteredVideos] = useState<Video[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("newest")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadVideos()
  }, [user])

  useEffect(() => {
    filterAndSortVideos()
  }, [videos, searchQuery, sortBy])

  const loadVideos = () => {
    const allVideos = JSON.parse(localStorage.getItem("streamhub_videos") || "[]")
    const users = JSON.parse(localStorage.getItem("streamhub_users") || "[]")

    // Show public videos to everyone, and private videos only to their owners
    const visibleVideos = allVideos
      .filter((video: Video) => {
        if (video.privacy === "public") return true
        return user && video.userId === user.id
      })
      .map((video: Video) => {
        const videoUser = users.find((u: any) => u.id === video.userId)
        return {
          ...video,
          userName: videoUser?.name || "Unknown User",
          userAvatar: videoUser?.avatar,
        }
      })

    setVideos(visibleVideos)
    setLoading(false)
  }

  const filterAndSortVideos = () => {
    let filtered = videos

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (video) =>
          video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          video.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          video.userName.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Sort videos
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case "most-viewed":
          return b.views - a.views
        case "least-viewed":
          return a.views - b.views
        default:
          return 0
      }
    })

    setFilteredVideos(filtered)
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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">Discover Amazing Videos</h1>
          <p className="text-xl text-muted-foreground mb-8">Watch, upload, and share videos with the world</p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search videos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  Newest First
                </div>
              </SelectItem>
              <SelectItem value="oldest">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  Oldest First
                </div>
              </SelectItem>
              <SelectItem value="most-viewed">
                <div className="flex items-center">
                  <Eye className="h-4 w-4 mr-2" />
                  Most Viewed
                </div>
              </SelectItem>
              <SelectItem value="least-viewed">
                <div className="flex items-center">
                  <Eye className="h-4 w-4 mr-2" />
                  Least Viewed
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Video Grid */}
        <VideoGrid
          videos={filteredVideos}
          emptyMessage={searchQuery ? "No videos match your search" : "No videos available"}
        />
      </main>
    </div>
  )
}
