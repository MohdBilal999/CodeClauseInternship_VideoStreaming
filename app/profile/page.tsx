/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hook/use-toast"
import { Camera, Save, Eye, EyeOff, Trash2 } from "lucide-react"
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

export default function ProfilePage() {
  const { user, signOut } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [name, setName] = useState(user?.name || "")
  const [email, setEmail] = useState(user?.email || "")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPasswords, setShowPasswords] = useState(false)
  const [avatar, setAvatar] = useState(user?.avatar || "")
  const [loading, setLoading] = useState(false)

  if (!user) {
    router.push("/auth/signin")
    return null
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setAvatar(result)
      }
      reader.readAsDataURL(file)
    } else {
      toast({
        title: "Invalid file type",
        description: "Please select a valid image file.",
        variant: "destructive",
      })
    }
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Get current users
      const users = JSON.parse(localStorage.getItem("streamhub_users") || "[]")
      const userIndex = users.findIndex((u: any) => u.id === user.id)

      if (userIndex === -1) {
        throw new Error("User not found")
      }

      // Update user data
      users[userIndex] = {
        ...users[userIndex],
        name: name.trim(),
        email: email.trim(),
        avatar,
      }

      // Save updated users
      localStorage.setItem("streamhub_users", JSON.stringify(users))

      // Update current user session
      const updatedUser = { ...users[userIndex] }
      delete updatedUser.password
      localStorage.setItem("streamhub_user", JSON.stringify(updatedUser))

      // Update videos with new user info
      const videos = JSON.parse(localStorage.getItem("streamhub_videos") || "[]")
      const updatedVideos = videos.map((video: any) =>
        video.userId === user.id
          ? {
              ...video,
              userName: name.trim(),
              userAvatar: avatar,
            }
          : video,
      )
      localStorage.setItem("streamhub_videos", JSON.stringify(updatedVideos))

      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      })

      // Refresh the page to update the auth context
      window.location.reload()
    } catch (error) {
      toast({
        title: "Update failed",
        description: "Something went wrong while updating your profile.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({
        title: "Missing fields",
        description: "Please fill in all password fields.",
        variant: "destructive",
      })
      return
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "New password and confirmation don't match.",
        variant: "destructive",
      })
      return
    }

    if (newPassword.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const users = JSON.parse(localStorage.getItem("streamhub_users") || "[]")
      const userIndex = users.findIndex((u: any) => u.id === user.id)

      if (userIndex === -1 || users[userIndex].password !== currentPassword) {
        toast({
          title: "Invalid password",
          description: "Current password is incorrect.",
          variant: "destructive",
        })
        return
      }

      // Update password
      users[userIndex].password = newPassword
      localStorage.setItem("streamhub_users", JSON.stringify(users))

      // Clear password fields
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")

      toast({
        title: "Password updated",
        description: "Your password has been successfully changed.",
      })
    } catch (error) {
      toast({
        title: "Update failed",
        description: "Something went wrong while updating your password.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    try {
      // Remove user from users list
      const users = JSON.parse(localStorage.getItem("streamhub_users") || "[]")
      const updatedUsers = users.filter((u: any) => u.id !== user.id)
      localStorage.setItem("streamhub_users", JSON.stringify(updatedUsers))

      // Remove user's videos
      const videos = JSON.parse(localStorage.getItem("streamhub_videos") || "[]")
      const updatedVideos = videos.filter((video: any) => video.userId !== user.id)
      localStorage.setItem("streamhub_videos", JSON.stringify(updatedVideos))

      // Sign out and redirect
      signOut()
      router.push("/")

      toast({
        title: "Account deleted",
        description: "Your account and all associated data have been deleted.",
      })
    } catch (error) {
      toast({
        title: "Deletion failed",
        description: "Something went wrong while deleting your account.",
        variant: "destructive",
      })
    }
  }

  const getAccountStats = () => {
    const videos = JSON.parse(localStorage.getItem("streamhub_videos") || "[]")
    const userVideos = videos.filter((video: any) => video.userId === user.id)
    const totalViews = userVideos.reduce((sum: number, video: any) => sum + video.views, 0)

    return {
      totalVideos: userVideos.length,
      totalViews,
      publicVideos: userVideos.filter((video: any) => video.privacy === "public").length,
      privateVideos: userVideos.filter((video: any) => video.privacy === "private").length,
    }
  }

  const stats = getAccountStats()

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container max-w-4xl py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Profile Settings</h1>
          <p className="text-muted-foreground">Manage your account settings and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-2 space-y-8">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your personal information and avatar</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  {/* Avatar */}
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={avatar || "/placeholder.svg"} alt={name} />
                      <AvatarFallback className="text-lg">{name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                        <Camera className="h-4 w-4 mr-2" />
                        Change Avatar
                      </Button>
                      <p className="text-sm text-muted-foreground mt-1">JPG, PNG or GIF (max 5MB)</p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarChange}
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* Name and Email */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your full name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        required
                      />
                    </div>
                  </div>

                  <Button type="submit" disabled={loading}>
                    <Save className="h-4 w-4 mr-2" />
                    {loading ? "Saving..." : "Save Changes"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Password Change */}
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>Update your account password</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showPasswords ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Enter current password"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPasswords(!showPasswords)}
                      >
                        {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input
                        id="newPassword"
                        type={showPasswords ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input
                        id="confirmPassword"
                        type={showPasswords ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                      />
                    </div>
                  </div>

                  <Button type="submit" disabled={loading}>
                    {loading ? "Updating..." : "Update Password"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="text-destructive">Danger Zone</CardTitle>
                <CardDescription>Irreversible and destructive actions</CardDescription>
              </CardHeader>
              <CardContent>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Account
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Account</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete your account? This will permanently delete your profile, all
                        your videos, and cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteAccount}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete Account
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          </div>

          {/* Account Stats Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Videos</span>
                  <span className="font-semibold">{stats.totalVideos}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Views</span>
                  <span className="font-semibold">{stats.totalViews.toLocaleString()}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Public Videos</span>
                  <span className="font-semibold">{stats.publicVideos}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Private Videos</span>
                  <span className="font-semibold">{stats.privateVideos}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Account Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <span className="text-sm text-muted-foreground">Member since</span>
                  <p className="font-semibold">Recently joined</p>
                </div>
                <Separator />
                <div>
                  <span className="text-sm text-muted-foreground">Account Type</span>
                  <p className="font-semibold">Free Account</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
