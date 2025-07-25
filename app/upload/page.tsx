"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hook/use-toast"
import { Upload, X, Play, ImageIcon } from "lucide-react"

export default function UploadPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const videoInputRef = useRef<HTMLInputElement>(null)
  const thumbnailInputRef = useRef<HTMLInputElement>(null)

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [privacy, setPrivacy] = useState<"public" | "private">("public")
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [videoPreview, setVideoPreview] = useState<string | null>(null)
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  if (!user) {
    router.push("/auth/signin")
    return null
  }

  const handleVideoChange = (file: File) => {
    if (file && file.type.startsWith("video/")) {
      setVideoFile(file)
      const url = URL.createObjectURL(file)
      setVideoPreview(url)

      // Auto-generate thumbnail from video
      generateThumbnail(file)
    } else {
      toast({
        title: "Invalid file type",
        description: "Please select a valid video file.",
        variant: "destructive",
      })
    }
  }

  const handleThumbnailChange = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      setThumbnailFile(file)
      const url = URL.createObjectURL(file)
      setThumbnailPreview(url)
    } else {
      toast({
        title: "Invalid file type",
        description: "Please select a valid image file.",
        variant: "destructive",
      })
    }
  }

  const generateThumbnail = (videoFile: File) => {
    const video = document.createElement("video")
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")

    video.addEventListener("loadedmetadata", () => {
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      video.currentTime = Math.min(5, video.duration / 2) // Seek to 5 seconds or middle
    })

    video.addEventListener("seeked", () => {
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const thumbnailFile = new File([blob], "thumbnail.jpg", { type: "image/jpeg" })
              setThumbnailFile(thumbnailFile)
              setThumbnailPreview(URL.createObjectURL(blob))
            }
          },
          "image/jpeg",
          0.8,
        )
      }
    })

    video.src = URL.createObjectURL(videoFile)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)

    const files = Array.from(e.dataTransfer.files)
    const videoFile = files.find((file) => file.type.startsWith("video/"))

    if (videoFile) {
      handleVideoChange(videoFile)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!videoFile || !title.trim()) {
      toast({
        title: "Missing required fields",
        description: "Please provide a title and select a video file.",
        variant: "destructive",
      })
      return
    }

    setUploading(true)

    try {
      // In a real app, you would upload to a cloud storage service
      // For this demo, we'll use object URLs and store metadata in localStorage

      const videoUrl = URL.createObjectURL(videoFile)
      const thumbnailUrl = thumbnailPreview || "/placeholder.svg?height=360&width=640"

      const newVideo = {
        id: crypto.randomUUID(),
        title: title.trim(),
        description: description.trim(),
        thumbnail: thumbnailUrl,
        videoUrl,
        userId: user.id,
        userName: user.name,
        userAvatar: user.avatar,
        privacy,
        views: 0,
        createdAt: new Date().toISOString(),
        duration: "0:00", // In a real app, you'd calculate this from the video
      }

      // Save to localStorage
      const existingVideos = JSON.parse(localStorage.getItem("streamhub_videos") || "[]")
      existingVideos.push(newVideo)
      localStorage.setItem("streamhub_videos", JSON.stringify(existingVideos))

      toast({
        title: "Upload successful!",
        description: "Your video has been uploaded and is now live.",
      })

      router.push(`/watch/${newVideo.id}`)
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Something went wrong while uploading your video.",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container max-w-4xl py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Upload Video</h1>
          <p className="text-muted-foreground">Share your content with the world</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Video Upload */}
          <Card>
            <CardHeader>
              <CardTitle>Video File</CardTitle>
            </CardHeader>
            <CardContent>
              {!videoFile ? (
                <div
                  className={`upload-dropzone ${dragOver ? "dragover" : ""}`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => videoInputRef.current?.click()}
                >
                  <Upload className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Drag and drop your video here</h3>
                  <p className="text-muted-foreground mb-4">or click to browse files</p>
                  <Button type="button" variant="outline">
                    Select Video
                  </Button>
                  <input
                    ref={videoInputRef}
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleVideoChange(file)
                    }}
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Play className="h-8 w-8 text-primary" />
                      <div>
                        <p className="font-medium">{videoFile.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setVideoFile(null)
                        setVideoPreview(null)
                        setThumbnailFile(null)
                        setThumbnailPreview(null)
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {videoPreview && <video src={videoPreview} controls className="w-full max-w-md rounded-lg" />}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Thumbnail */}
          {videoFile && (
            <Card>
              <CardHeader>
                <CardTitle>Thumbnail</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {thumbnailPreview && (
                    <div className="relative inline-block">
                      <img
                        src={thumbnailPreview || "/placeholder.svg"}
                        alt="Thumbnail preview"
                        className="w-48 h-27 object-cover rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => thumbnailInputRef.current?.click()}
                      >
                        <ImageIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  )}

                  <Button type="button" variant="outline" onClick={() => thumbnailInputRef.current?.click()}>
                    {thumbnailPreview ? "Change Thumbnail" : "Upload Custom Thumbnail"}
                  </Button>

                  <input
                    ref={thumbnailInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleThumbnailChange(file)
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Video Details */}
          <Card>
            <CardHeader>
              <CardTitle>Video Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="Enter video title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Tell viewers about your video"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="privacy">Privacy</Label>
                <Select value={privacy} onValueChange={(value: "public" | "private") => setPrivacy(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public - Anyone can watch</SelectItem>
                    <SelectItem value="private">Private - Only you can watch</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={() => router.push("/")} disabled={uploading}>
              Cancel
            </Button>
            <Button type="submit" disabled={uploading || !videoFile || !title.trim()}>
              {uploading ? "Uploading..." : "Upload Video"}
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}
