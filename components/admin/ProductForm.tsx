"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import ImageUpload from '@/components/admin/ImageUpload'

interface Category {
  id: number
  name: string
  slug: string
}

interface ProductFormProps {
  onSubmit?: (data: any) => void
  initialData?: any
}

export default function ProductForm({ onSubmit, initialData }: ProductFormProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [images, setImages] = useState<string[]>(initialData?.images || [])
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    price: initialData?.price || '',
    inventory: initialData?.inventory || '0',
    category_id: initialData?.category_id || '',
    is_active: initialData?.is_active ?? true,
    is_featured: initialData?.is_featured ?? false,
  })

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories")
      const data = await response.json()
      if (data.success) {
        setCategories(data.data.categories)
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      alert("Product name is required")
      return
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      alert("Valid price is required")
      return
    }

    if (!formData.category_id) {
      alert("Category is required")
      return
    }

    if (images.length === 0) {
      alert("At least one image is required")
      return
    }

    const productData = {
      name: formData.name.trim(),
      description: formData.description.trim() || null,
      price_cents: Math.round(parseFloat(formData.price) * 100),
      inventory: parseInt(formData.inventory),
      category_id: parseInt(formData.category_id),
      images: images,
      is_active: formData.is_active,
      is_featured: formData.is_featured,
    }

    if (onSubmit) {
      onSubmit(productData)
    } else {
      console.log('Product data:', productData)
      // Default submission to API
      try {
        const response = await fetch('/api/products', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(productData),
        })

        const result = await response.json()
        if (result.success) {
          alert('Product created successfully!')
          // Reset form
          setFormData({
            name: '',
            description: '',
            price: '',
            inventory: '0',
            category_id: '',
            is_active: true,
            is_featured: false,
          })
          setImages([])
        } else {
          alert(result.error || 'Failed to create product')
        }
      } catch (error) {
        console.error('Submit error:', error)
        alert('Failed to create product')
      }
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">
        {initialData ? 'Edit Product' : 'Add New Product'}
      </h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Product Name *
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <select
              id="category"
              value={formData.category_id}
              onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
              Price (₹) *
            </label>
            <input
              type="number"
              id="price"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              step="0.01"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="inventory" className="block text-sm font-medium text-gray-700 mb-2">
              Inventory Stock
            </label>
            <input
              type="number"
              id="inventory"
              value={formData.inventory}
              onChange={(e) => setFormData({ ...formData, inventory: e.target.value })}
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Product Images *
          </label>
          <ImageUpload
            value={images}
            onChange={setImages}
            maxImages={5}
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Product Settings</h3>
          
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Active (visible in store)</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.is_featured}
                onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Featured product</span>
            </label>
          </div>
        </div>

        <Button 
          type="submit" 
          className="w-full"
          disabled={images.length === 0}
        >
          {initialData ? 'Update Product' : 'Create Product'}
        </Button>
      </form>
    </div>
  )
}