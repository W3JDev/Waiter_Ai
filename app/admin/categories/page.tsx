"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "@/components/ui/use-toast"
import { Plus, Search, MoreHorizontal, Pencil, Trash2, MoveUp, MoveDown, Upload } from "lucide-react"
import { MenuAPI } from "@/lib/api"
import type { MenuCategory } from "@/types"
import Image from "next/image"

// Restaurant ID
const RESTAURANT_ID = "67e9cb4c1c391af2322ce9ef"

export default function CategoriesPage() {
  const [categories, setCategories] = useState<MenuCategory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false)
  const [isEditCategoryOpen, setIsEditCategoryOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<MenuCategory | null>(null)
  const [newCategory, setNewCategory] = useState<Partial<MenuCategory>>({
    name: "",
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true)
      try {
        const categoriesData = await MenuAPI.getCategories(RESTAURANT_ID)
        setCategories(categoriesData)
      } catch (error) {
        console.error("Error fetching categories:", error)
        toast({
          title: "Error",
          description: "Failed to load categories. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchCategories()
  }, [])

  // Filter categories based on search query
  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Handle image upload
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)

      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Add new category
  const handleAddCategory = async () => {
    if (!newCategory.name) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    try {
      // Upload image if selected
      if (imageFile) {
        // In a real app, you would upload the image and get the URL
        newCategory.image_url = URL.createObjectURL(imageFile)
      }

      const createdCategory = await MenuAPI.createCategory(newCategory as Omit<MenuCategory, "id">)
      setCategories((prev) => [...prev, createdCategory])
      setIsAddCategoryOpen(false)
      setNewCategory({
        name: "",
      })
      setImageFile(null)
      setImagePreview(null)

      toast({
        title: "Success",
        description: "Category added successfully.",
      })
    } catch (error) {
      console.error("Error adding category:", error)
      toast({
        title: "Error",
        description: "Failed to add category. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Edit category
  const handleEditCategory = async () => {
    if (!selectedCategory || !selectedCategory.name) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    try {
      // Upload image if selected
      if (imageFile) {
        // In a real app, you would upload the image and get the URL
        selectedCategory.image_url = URL.createObjectURL(imageFile)
      }

      const updatedCategory = await MenuAPI.updateCategory(selectedCategory.id, selectedCategory)
      setCategories((prev) => prev.map((cat) => (cat.id === updatedCategory.id ? updatedCategory : cat)))
      setIsEditCategoryOpen(false)
      setSelectedCategory(null)
      setImageFile(null)
      setImagePreview(null)

      toast({
        title: "Success",
        description: "Category updated successfully.",
      })
    } catch (error) {
      console.error("Error updating category:", error)
      toast({
        title: "Error",
        description: "Failed to update category. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Delete category
  const handleDeleteCategory = async (categoryId: string) => {
    try {
      await MenuAPI.deleteCategory(categoryId)
      setCategories((prev) => prev.filter((cat) => cat.id !== categoryId))

      toast({
        title: "Success",
        description: "Category deleted successfully.",
      })
    } catch (error) {
      console.error("Error deleting category:", error)
      toast({
        title: "Error",
        description: "Failed to delete category. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Move category up in order (disabled - no order field in schema)
  const handleMoveUp = async (index: number) => {
    // Reordering not implemented - requires order field in MenuCategory
    toast({
      title: "Info",
      description: "Category reordering is not available in this version.",
    })
  }

  // Move category down in order (disabled - no order field in schema)
  const handleMoveDown = async (index: number) => {
    // Reordering not implemented - requires order field in MenuCategory
    toast({
      title: "Info", 
      description: "Category reordering is not available in this version.",
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-5rem)]">
        <div className="glass-card p-8 rounded-lg">
          <h2 className="text-xl font-bold">Loading categories...</h2>
          <div className="mt-4 flex space-x-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-bounce" />
            <div className="w-2 h-2 rounded-full bg-primary animate-bounce delay-75" />
            <div className="w-2 h-2 rounded-full bg-primary animate-bounce delay-150" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <h2 className="text-3xl font-bold">Menu Categories</h2>
        <Dialog open={isAddCategoryOpen} onOpenChange={setIsAddCategoryOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Category</DialogTitle>
              <DialogDescription>Add a new category to organize your menu items.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  placeholder="Category name"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory((prev) => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Category Image</Label>
                <div className="flex flex-col items-center justify-center">
                  <div className="relative w-full h-32 rounded-lg overflow-hidden border-2 border-dashed border-border flex items-center justify-center">
                    {imagePreview ? (
                      <Image src={imagePreview || "/placeholder.svg"} alt="Preview" fill className="object-cover" />
                    ) : (
                      <div className="text-center p-4">
                        <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                        <p className="mt-2 text-sm text-muted-foreground">Upload Category Image</p>
                      </div>
                    )}
                  </div>

                  <Input id="image" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                  <Label
                    htmlFor="image"
                    className="mt-4 cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 h-10 py-2 px-4"
                  >
                    {imagePreview ? "Change Image" : "Upload Image"}
                  </Label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddCategoryOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddCategory}>Add Category</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Categories</CardTitle>
          <CardDescription>Manage and organize your menu categories.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCategories.length > 0 ? (
                filteredCategories.map((category, index) => (
                  <TableRow key={category.id}>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleMoveUp(index)}
                          disabled={index === 0}
                          className="h-8 w-8"
                        >
                          <MoveUp className="h-4 w-4" />
                        </Button>
                        <span className="text-sm text-muted-foreground">#{index + 1}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleMoveDown(index)}
                          disabled={index === filteredCategories.length - 1}
                          className="h-8 w-8"
                        >
                          <MoveDown className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="relative h-10 w-10 rounded-md overflow-hidden">
                        <Image
                          src={category.image_url || "/placeholder.svg?height=40&width=40"}
                          alt={category.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedCategory(category)
                              setImagePreview(category.image_url || null)
                              setIsEditCategoryOpen(true)
                            }}
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-500" onClick={() => handleDeleteCategory(category.id)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <div className="flex flex-col items-center justify-center">
                      <h3 className="text-lg font-medium">No categories found</h3>
                      <p className="text-muted-foreground mt-1">
                        {searchQuery ? "Try adjusting your search query." : "Add a category to get started."}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Category Dialog */}
      <Dialog open={isEditCategoryOpen} onOpenChange={setIsEditCategoryOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>Update the category details.</DialogDescription>
          </DialogHeader>
          {selectedCategory && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Name *</Label>
                <Input
                  id="edit-name"
                  placeholder="Category name"
                  value={selectedCategory.name}
                  onChange={(e) => setSelectedCategory({ ...selectedCategory, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Category Image</Label>
                <div className="flex flex-col items-center justify-center">
                  <div className="relative w-full h-32 rounded-lg overflow-hidden border-2 border-dashed border-border flex items-center justify-center">
                    {imagePreview ? (
                      <Image src={imagePreview || "/placeholder.svg"} alt="Preview" fill className="object-cover" />
                    ) : (
                      <div className="text-center p-4">
                        <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                        <p className="mt-2 text-sm text-muted-foreground">Upload Category Image</p>
                      </div>
                    )}
                  </div>

                  <Input id="edit-image" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                  <Label
                    htmlFor="edit-image"
                    className="mt-4 cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 h-10 py-2 px-4"
                  >
                    {imagePreview ? "Change Image" : "Upload Image"}
                  </Label>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditCategoryOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditCategory}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

