"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { useToast } from "../ui/use-toast"
import { Eye, EyeOff } from "lucide-react"
import { useCreateUserMutation } from '../../lib/api/apiSlice'

interface SignupDialogProps {
  trigger: React.ReactNode
  onUserCreated?: () => void
}

interface SignupFormData {
  email: string
  password: string
  full_name: string
  role: string
  mobile: string
}

export function SignupDialog({ trigger, onUserCreated }: SignupDialogProps) {
  const [open, setOpen] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { toast } = useToast()
  const [formData, setFormData] = useState<SignupFormData>({
    email: "",
    password: "",
    full_name: "",
    role: "",
    mobile: ""
  })
  const [createUser, { isLoading: isSubmitting }] = useCreateUserMutation()

  const handleInputChange = (field: keyof SignupFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Validate required fields
    if (!formData.email || !formData.password || !formData.full_name || !formData.role || !formData.mobile) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Error",
        description: "Please enter a valid email address",
        variant: "destructive",
      })
      return
    }
    // Validate mobile format (basic validation for Indian numbers)
    const mobileRegex = /^\+91[0-9]{10}$/
    if (!mobileRegex.test(formData.mobile)) {
      toast({
        title: "Error",
        description: "Please enter a valid mobile number (+91XXXXXXXXXX)",
        variant: "destructive",
      })
      return
    }
    try {
      await createUser(formData).unwrap()
      toast({
        title: "Success",
        description: "User created successfully",
      })
      setFormData({
        email: "",
        password: "",
        full_name: "",
        role: "",
        mobile: ""
      })
      setOpen(false)
      if (onUserCreated) onUserCreated()
    } catch (err: unknown) {
      const errorMessage = err && typeof err === 'object' && 'data' in err 
        ? (err.data as { error?: string })?.error 
        : err instanceof Error 
          ? err.message 
          : "Failed to create user";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setFormData({
      email: "",
      password: "",
      full_name: "",
      role: "",
      mobile: ""
    })
    setShowPassword(false)
  }

  return (
    <Dialog open={open} onOpenChange={(newOpen: boolean) => {
      setOpen(newOpen)
      if (!newOpen) {
        resetForm()
      }
    }}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New User</DialogTitle>
          <DialogDescription>
            Fill in the details below to create a new user account.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              placeholder="user@example.com"
              value={formData.email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('email', e.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password *</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                value={formData.password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('password', e.target.value)}
                required
                disabled={isSubmitting}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isSubmitting}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name *</Label>
            <Input
              id="full_name"
              type="text"
              placeholder="Enter full name"
              value={formData.full_name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('full_name', e.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role *</Label>
            <Select
              value={formData.role}
              onValueChange={(value) => handleInputChange('role', value)}
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="punisher">Punisher</SelectItem>
                <SelectItem value="customer">Customer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="mobile">Mobile *</Label>
            <Input
              id="mobile"
              type="tel"
              placeholder="+919910597534"
              value={formData.mobile}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('mobile', e.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Create User"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 