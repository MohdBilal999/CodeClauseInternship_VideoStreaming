/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"

interface User {
  id: string
  email: string
  name: string
  avatar?: string
}

interface AuthContextType {
  user: User | null
  signIn: (email: string, password: string) => Promise<boolean>
  signUp: (email: string, password: string, name: string) => Promise<boolean>
  signOut: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem("streamhub_user")
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setLoading(false)
  }, [])

  const signIn = async (email: string, password: string): Promise<boolean> => {
    // Mock authentication - in real app, this would call your auth service
    const users = JSON.parse(localStorage.getItem("streamhub_users") || "[]")
    const foundUser = users.find((u: any) => u.email === email && u.password === password)

    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser
      setUser(userWithoutPassword)
      localStorage.setItem("streamhub_user", JSON.stringify(userWithoutPassword))
      return true
    }
    return false
  }

  const signUp = async (email: string, password: string, name: string): Promise<boolean> => {
    const users = JSON.parse(localStorage.getItem("streamhub_users") || "[]")

    // Check if user already exists
    if (users.find((u: any) => u.email === email)) {
      return false
    }

    const newUser = {
      id: crypto.randomUUID(),
      email,
      password,
      name,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
    }

    users.push(newUser)
    localStorage.setItem("streamhub_users", JSON.stringify(users))

    const { password: _, ...userWithoutPassword } = newUser
    setUser(userWithoutPassword)
    localStorage.setItem("streamhub_user", JSON.stringify(userWithoutPassword))
    return true
  }

  const signOut = () => {
    setUser(null)
    localStorage.removeItem("streamhub_user")
  }

  return <AuthContext.Provider value={{ user, signIn, signUp, signOut, loading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
