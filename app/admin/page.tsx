"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRestaurantStore } from "@/store/restaurant-store"
import { useMenuStore } from "@/store/menu-store"
import { RestaurantAPI, MenuAPI } from "@/lib/api"
import { Store, MenuIcon, Globe, ExternalLink, Plus, ArrowRight, Eye } from "lucide-react"

// Restaurant ID
const RESTAURANT_ID = "67e5935b23a0f201833a3012"

export default function AdminDashboard() {
  const { restaurant, setRestaurant, setLoading } = useRestaurantStore()
  const { items, setItems, categories, setCategories } = useMenuStore()

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        // Fetch restaurant data
        const restaurantData = await RestaurantAPI.getRestaurant(RESTAURANT_ID)
        setRestaurant(restaurantData)

        // Fetch menu categories
        const categoriesData = await MenuAPI.getCategories(RESTAURANT_ID)
        setCategories(categoriesData)

        // Fetch menu items
        const itemsData = await MenuAPI.getMenuItems(RESTAURANT_ID)
        setItems(itemsData)
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [setRestaurant, setCategories, setItems, setLoading])

  // Calculate stats
  const totalItems = items.length
  const availableItems = items.filter((item) => item.available).length
  const featuredItems = items.filter((item) => item.featured).length
  const totalCategories = categories.length
  const languages = ["EN", "ZH", "VI", "MS", "MY", "TA"]

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Button asChild>
          <Link href="/" target="_blank">
            <Eye className="mr-2 h-4 w-4" />
            View Live Menu
          </Link>
        </Button>
      </div>

      {/* Welcome Card */}
      <Card className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold">Welcome back, Restaurant Admin</h2>
          <p className="mt-2 text-blue-100">
            Manage your restaurant details, menu items, and more from this dashboard.
          </p>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Menu Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalItems}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {availableItems} available / {totalItems} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Menu Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalCategories}</div>
            <p className="text-xs text-muted-foreground mt-1">Complete menu organization</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Featured Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{featuredItems}</div>
            <p className="text-xs text-muted-foreground mt-1">Highlighted on your menu</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Available Languages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{languages.length}</div>
            <p className="text-xs text-muted-foreground mt-1">{languages.join(", ")}</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <h2 className="text-xl font-semibold mt-8">Quick Actions</h2>
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="bg-white dark:bg-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5 text-blue-600" />
              Restaurant Profile
            </CardTitle>
            <CardDescription>Manage restaurant details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <ul className="space-y-1 text-sm">
              <li className="flex items-center gap-1">
                <span className="text-muted-foreground">•</span>
                Update basic information
              </li>
              <li className="flex items-center gap-1">
                <span className="text-muted-foreground">•</span>
                Set operating hours
              </li>
              <li className="flex items-center gap-1">
                <span className="text-muted-foreground">•</span>
                Manage contact details
              </li>
            </ul>
            <Button variant="link" className="px-0" asChild>
              <Link href="/admin/restaurant" className="flex items-center gap-1">
                View Details
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MenuIcon className="h-5 w-5 text-blue-600" />
              Menu Management
            </CardTitle>
            <CardDescription>Create and edit menu items</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <ul className="space-y-1 text-sm">
              <li className="flex items-center gap-1">
                <span className="text-muted-foreground">•</span>
                Add new menu items
              </li>
              <li className="flex items-center gap-1">
                <span className="text-muted-foreground">•</span>
                Organize categories
              </li>
              <li className="flex items-center gap-1">
                <span className="text-muted-foreground">•</span>
                Update prices and availability
              </li>
            </ul>
            <div className="flex items-center justify-between">
              <Button variant="link" className="px-0" asChild>
                <Link href="/admin/menu" className="flex items-center gap-1">
                  View All
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/admin/menu/new">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Item
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-blue-600" />
              Translations
            </CardTitle>
            <CardDescription>Multi-language support</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <ul className="space-y-1 text-sm">
              <li className="flex items-center gap-1">
                <span className="text-muted-foreground">•</span>
                Translate menu items
              </li>
              <li className="flex items-center gap-1">
                <span className="text-muted-foreground">•</span>
                Support 6 languages
              </li>
              <li className="flex items-center gap-1">
                <span className="text-muted-foreground">•</span>
                AI-assisted translation
              </li>
            </ul>
            <Button variant="link" className="px-0" asChild>
              <Link href="/admin/translations" className="flex items-center gap-1">
                Manage Translations
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* View Live Menu Button */}
      <div className="flex justify-center mt-8">
        <Button size="lg" variant="outline" asChild>
          <Link href="/" target="_blank" className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            View Live Menu
            <ExternalLink className="h-4 w-4 ml-1" />
          </Link>
        </Button>
      </div>
    </div>
  )
}

