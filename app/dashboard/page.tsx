"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hook/use-toast"
import { Eye, Calendar, Edit, Trash2, Plus, Search, Lock, Globe } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"

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

export default function DashboardPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [videos, setVideos] = useState<Video[]>([])
  const [filteredVideos, setFilteredVideos] = useState<Video[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filterBy, setFilterBy] = useState("all")
  const [sortBy, setSortBy] = useState("newest")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      router.push("/auth/signin")
      return
    }
    loadUserVideos()
  }, [user, router])

  useEffect(() => {
    filterAndSortVideos()
  }, [videos, searchQuery, filterBy, sortBy])

  const loadUserVideos = () => {
    if (!user) return

    const allVideos = JSON.parse(localStorage.getItem("streamhub_videos") || "[]")
    const userVideos = allVideos
      .filter((video: Video) => video.userId === user.id)
      .map((video: Video) => ({
        ...video,
        userName: user.name,
        userAvatar: user.avatar,
      }))

    setVideos(userVideos)
    setLoading(false)
  }

  const filterAndSortVideos = () => {
    let filtered = videos

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (video) =>
          video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          video.description.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Filter by privacy
    if (filterBy !== "all") {
      filtered = filtered.filter((video) => video.privacy === filterBy)
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

  const deleteVideo = (videoId: string) => {
    const allVideos = JSON.parse(localStorage.getItem("streamhub_videos") || "[]")
    const updatedVideos = allVideos.filter((video: Video) => video.id !== videoId)
    localStorage.setItem("streamhub_videos", JSON.stringify(updatedVideos))

    setVideos(videos.filter((video) => video.id !== videoId))

    toast({
      title: "Video deleted",
      description: "Your video has been successfully deleted.",
    })
  }

  const getStats = () => {
    const totalViews = videos.reduce((sum, video) => sum + video.views, 0)
    const publicVideos = videos.filter((video) => video.privacy === "public").length
    const privateVideos = videos.filter((video) => video.privacy === "private").length

    return { totalViews, publicVideos, privateVideos, totalVideos: videos.length }
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

  const stats = getStats()

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Videos</h1>
            <p className="text-muted-foreground">Manage your uploaded content</p>
          </div>
          <Button asChild>
            <Link href="/upload">
              <Plus className="h-4 w-4 mr-2" />
              Upload Video
            </Link>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Videos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalVideos}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalViews.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Public Videos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.publicVideos}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Private Videos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.privateVideos}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search your videos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterBy} onValueChange={setFilterBy}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by privacy" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Videos</SelectItem>
              <SelectItem value="public">Public Only</SelectItem>
              <SelectItem value="private">Private Only</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="most-viewed">Most Viewed</SelectItem>
              <SelectItem value="least-viewed">Least Viewed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Videos List */}
        {filteredVideos.length === 0 ? (
          <div className="text-center py-12">
            <div className="rounded-full bg-muted p-6 mb-4 inline-block">
              <svg className="h-12 w-12 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">
              {searchQuery ? "No videos match your search" : "No videos uploaded yet"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery ? "Try adjusting your search terms" : "Start sharing your content with the world"}
            </p>
            {!searchQuery && (
              <Button asChild>
                <Link href="/upload">
                  <Plus className="h-4 w-4 mr-2" />
                  Upload Your First Video
                </Link>
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredVideos.map((video) => (
              <Card key={video.id} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex space-x-4">
                    <div className="relative w-48 aspect-video flex-shrink-0">
                      <img
                        src={video.thumbnail || "/placeholder.svg"}
                        alt={video.title}
                        className="w-full h-full object-cover rounded-lg"
                      />
                      {video.duration && (
                        <Badge className="absolute bottom-2 right-2 bg-black/80 text-white">{video.duration}</Badge>
                      )}
                    </div>

                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <Link
                            href={`/watch/${video.id}`}
                            className="text-lg font-semibold hover:text-primary transition-colors"
                          >
                            {video.title}
                          </Link>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                            <div className="flex items-center space-x-1">
                              <Eye className="h-4 w-4" />
                              <span>{video.views.toLocaleString()} views</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4" />
                              <span>{formatDistanceToNow(new Date(video.createdAt), { addSuffix: true })}</span>
                            </div>
                            <Badge variant={video.privacy === "public" ? "default" : "secondary"}>
                              {video.privacy === "public" ? (
                                <>
                                  <Globe className="h-3 w-3 mr-1" />
                                  Public
                                </>
                              ) : (
                                <>
                                  <Lock className="h-3 w-3 mr-1" />
                                  Private
                                </>
                              )}
                            </Badge>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Video</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete {video.title}? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteVideo(video.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>

                      {video.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">{video.description}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
