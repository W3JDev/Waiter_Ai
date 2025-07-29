"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { RestaurantAPI } from "@/lib/api"
import { useRestaurantStore } from "@/store/restaurant-store"
import type { Restaurant } from "@/types"
import { Loader2, Save, Upload, MapPin, Phone, Globe, Clock, Store } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import Image from "next/image"

// Restaurant ID
const RESTAURANT_ID = "67e5935b23a0f201833a3012"

export default function RestaurantProfilePage() {
  const { restaurant, setRestaurant } = useRestaurantStore()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [bannerFile, setBannerFile] = useState<File | null>(null)
  const [bannerPreview, setBannerPreview] = useState<string | null>(null)

  // Create a copy of restaurant data for editing
  const [formData, setFormData] = useState<Partial<Restaurant>>({
    name: "",
    description: "",
    address: "",
    phone: "",
  })

  // Fetch restaurant data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        // Fetch restaurant data
        const restaurantData = await RestaurantAPI.getRestaurant(RESTAURANT_ID)
        setRestaurant(restaurantData)

        // Transform data to match our form structure  
        setFormData({
          ...restaurantData,
        })

        // Set image previews
        if (restaurantData.logo_url) {
          setLogoPreview(restaurantData.logo_url)
        }
        if (restaurantData.banner_url) {
          setBannerPreview(restaurantData.banner_url)
        }
      } catch (error) {
        console.error("Error fetching restaurant data:", error)
        toast({
          title: "Error",
          description: "Failed to load restaurant data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [setRestaurant])

  // Handle form input changes
  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  // Handle logo upload
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setLogoFile(file)

      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Handle banner upload
  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setBannerFile(file)

      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setBannerPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Save restaurant settings
  const saveSettings = async () => {
    if (!formData.name || !formData.address || !formData.phone) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)
    try {
      // Transform data back to the API format
      const apiData = {
        ...formData,
      }

      // Update restaurant data
      await RestaurantAPI.updateRestaurant(RESTAURANT_ID, apiData)

      // Update restaurant in store
      setRestaurant({ ...restaurant, ...apiData } as Restaurant)

      toast({
        title: "Success",
        description: "Restaurant profile saved successfully.",
      })
    } catch (error) {
      console.error("Error saving restaurant settings:", error)
      toast({
        title: "Error",
        description: "Failed to save restaurant profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-5rem)]">
        <div className="p-8 rounded-lg bg-white dark:bg-slate-800 shadow">
          <h2 className="text-xl font-bold">Loading restaurant profile...</h2>
          <div className="mt-4 flex space-x-2">
            <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" />
            <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce delay-75" />
            <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce delay-150" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <h1 className="text-3xl font-bold">Restaurant Profile</h1>
        <Button onClick={saveSettings} disabled={isSaving} className="gap-2">
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save Profile
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="bg-white dark:bg-slate-800">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="images">Images</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
          <TabsTrigger value="hours">Hours</TabsTrigger>
          <TabsTrigger value="cuisine">Cuisine</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="h-5 w-5 text-blue-600" />
                Basic Information
              </CardTitle>
              <CardDescription>Enter the basic details about your restaurant.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Restaurant Name *</Label>
                <Input
                  id="name"
                  value={formData.name || ""}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="Enter restaurant name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description || ""}
                  onChange={(e) => handleChange("description", e.target.value)}
                  placeholder="Describe your restaurant"
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="images" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-blue-600" />
                Restaurant Images
              </CardTitle>
              <CardDescription>Upload your restaurant logo and banner images.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label>Restaurant Logo</Label>
                <div className="flex flex-col items-center justify-center">
                  <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center">
                    {logoPreview ? (
                      <Image
                        src={logoPreview || "/placeholder.svg?height=128&width=128"}
                        alt="Logo Preview"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="text-center p-4">
                        <Upload className="h-8 w-8 mx-auto text-slate-400" />
                        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Upload Logo</p>
                      </div>
                    )}
                  </div>

                  <Input id="logo" type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
                  <Label
                    htmlFor="logo"
                    className="mt-4 cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 h-10 py-2 px-4"
                  >
                    {logoPreview ? "Change Logo" : "Upload Logo"}
                  </Label>
                </div>
              </div>

              <div className="space-y-4">
                <Label>Banner Image</Label>
                <div className="flex flex-col items-center justify-center">
                  <div className="relative w-full h-48 rounded-lg overflow-hidden border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center">
                    {bannerPreview ? (
                      <Image
                        src={bannerPreview || "/placeholder.svg?height=192&width=768"}
                        alt="Banner Preview"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="text-center p-4">
                        <Upload className="h-8 w-8 mx-auto text-slate-400" />
                        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Upload Banner Image</p>
                      </div>
                    )}
                  </div>

                  <Input id="banner" type="file" accept="image/*" onChange={handleBannerChange} className="hidden" />
                  <Label
                    htmlFor="banner"
                    className="mt-4 cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 h-10 py-2 px-4"
                  >
                    {bannerPreview ? "Change Banner" : "Upload Banner"}
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-blue-600" />
                Contact Information
              </CardTitle>
              <CardDescription>Enter contact details and external links for your restaurant.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    value={formData.phone || ""}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    placeholder="Enter phone number"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp Link</Label>
                <Input
                  id="whatsapp"
                  value={formData.whatsapp_link || ""}
                  onChange={(e) => handleChange("whatsapp_link", e.target.value)}
                  placeholder="https://wa.me/1234567890"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Format: https://wa.me/[your number without + or spaces]
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="booking">Booking Link</Label>
                <Input
                  id="booking"
                  value={formData.booking_link || ""}
                  onChange={(e) => handleChange("booking_link", e.target.value)}
                  placeholder="https://your-booking-system.com/restaurant"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="map">Google Maps Link</Label>
                <Input
                  id="map"
                  value={formData.map_link || ""}
                  onChange={(e) => handleChange("map_link", e.target.value)}
                  placeholder="https://maps.app.goo.gl/your-location"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-blue-600" />
                Address
              </CardTitle>
              <CardDescription>Enter your restaurant's physical address.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="address">Full Address *</Label>
                <Textarea
                  id="address"
                  value={formData.address || ""}
                  onChange={(e) => handleChange("address", e.target.value)}
                  placeholder="Enter complete restaurant address"
                  required
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hours" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-600" />
                Operating Hours
              </CardTitle>
              <CardDescription>Set your restaurant's operating hours.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Operating hours management will be available in the enterprise version.
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Use the existing operating hours display on the home page for now.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cuisine" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-blue-600" />
                Cuisine Types
              </CardTitle>
              <CardDescription>Select the types of cuisine your restaurant offers.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Globe className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Cuisine type management will be available in the enterprise version.
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  This will help categorize your restaurant and improve discoverability.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

