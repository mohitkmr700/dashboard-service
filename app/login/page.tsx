"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Label } from "../../components/ui/label"
import { Input } from "../../components/ui/input"
import { Button } from "../../components/ui/button"
import { ThemeToggle } from "../../components/theme-toggle"
import { useToast } from "../../components/ui/use-toast"
import { Eye, EyeOff } from "lucide-react"
import Script from "next/script"
import { useLoginMutation } from "../../lib/api/authSlice"
import { clearTokenCache } from "../../lib/token-api"
import { store } from "../../lib/store"
import { api } from "../../lib/api/apiSlice"
import { authApi } from "../../lib/api/authSlice"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const { theme } = useTheme()

  // RTK Query login mutation
  const [login, { isLoading: isLoggingIn }] = useLoginMutation()

  // Define Lottie animation URLs for different themes
  const lightThemeAnimation = "https://lottie.host/embed/981e2235-19ca-4891-a2bf-ba8606b0b85e/cRjSFR2lVY.lottie"
  const darkThemeAnimation = "https://lottie.host/c5c78691-0854-426f-b995-5189caecd495/9QKJ7zFavh.lottie"

  // Handle hydration
  useEffect(() => {
    setMounted(true)
  }, [])

  // Memoize the animation component to prevent unnecessary re-renders
  const AnimationComponent = useMemo(() => {
    if (!mounted) return null
    
    if (theme === "light") {
      return (
        <div className="flex items-center justify-center w-full">
          <embed
            src={lightThemeAnimation}
            type="application/json"
            className="w-full max-w-md h-96"
            style={{
              background: 'transparent',
              border: 'none',
              backgroundColor: 'transparent'
            }}
          />
        </div>
      )
    } else {
      return (
        <div className="flex items-center w-full" style={{ marginLeft: 0 }}>
          <div
            dangerouslySetInnerHTML={{
              __html: `<dotlottie-player src="${darkThemeAnimation}" background="transparent" speed="1" style="width: 400px; height: 400px; margin-left: 0;" direction="1" playMode="forward" loop autoplay></dotlottie-player>`
            }}
          />
        </div>
      )
    }
  }, [mounted, theme, lightThemeAnimation, darkThemeAnimation])

  // Clear any cached data on login page load
  useEffect(() => {
    clearTokenCache()
    // Clear RTK Query cache
    store.dispatch(api.util.resetApiState());
    store.dispatch(authApi.util.resetApiState());
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      await login({ email, password }).unwrap()
      
      // Clear any cached data before navigation
      clearTokenCache();
      
      // Navigate to dashboard
      router.replace("/dashboard")
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'data' in error 
        ? (error.data as { error?: string })?.error 
        : error instanceof Error 
          ? error.message 
          : "Authentication failed";
      toast({
        title: "Error",
        description: errorMessage || "Authentication failed",
        variant: "destructive",
      })
    }
  }

  return (
    <>
      <Script 
        src="https://unpkg.com/@dotlottie/player-component@2.7.12/dist/dotlottie-player.mjs" 
        type="module"
      />
      <div className="flex h-screen relative">
        <div className="hidden w-1/2 bg-background lg:block">
          <div className="flex h-full flex-col justify-between p-8">
            <div>
              <h1 className="text-4xl font-bold">Welcome Back</h1>
              <p className="mt-4 text-lg text-muted-foreground">
                {"The only way to do great work is to love what you do."}
              </p>
            </div>
            
            {/* Lottie Animation in Center */}
            <div className="flex-1 flex items-center relative">
              {AnimationComponent}
            </div>
            
            <p className="text-sm text-muted-foreground">- Mohit Kumar</p>
          </div>
        </div>
        <div className="flex w-full items-center justify-center lg:w-1/2">
          <Card className="w-full max-w-md">
            <CardHeader className="space-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">Login</CardTitle>
                  <CardDescription>
                    Enter your credentials to access your account
                  </CardDescription>
                </div>
                <ThemeToggle />
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoggingIn}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={isLoggingIn}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoggingIn}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoggingIn}
                >
                  Login
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
} 