'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { apiService } from '../lib/api'
import { getAuthToken } from '../utils/localStorage'

// simple slugify (or import from ../lib/slugify if you already have it)
const slugify = (text: string) =>
  (text || '')
    .toLowerCase()
    .trim()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')

type Category = {
  _id: string
  name_en: string
  name_hi?: string
  slug: string
  image?: string
  metaTitle_en?: string
  metaTitle_hi?: string
  metaDescription_en?: string
  metaDescription_hi?: string
  createdAt?: string
}

// const TITLE_MAX = 60
// const DESC_MAX = 160

export default function CategoryManagementComponent() {
  const router = useRouter()

  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)

  const [form, setForm] = useState({
    name_en: '',
    name_hi: '',
    image: '',
    metaTitle_en: '',
    metaTitle_hi: '',
    metaDescription_en: '',
    metaDescription_hi: '',
  })

  // Auth guard
  useEffect(() => {
    const token = getAuthToken()
    if (!token) {
      toast.error('Please login to access admin categories')
      router.push('/cms/login')
    }
  }, [router])

  // Load categories
  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const res = await apiService.getCategories()
      const data =
        (res as any)?.data ??
        (res as any)?.categories ??
        []
      setCategories(Array.isArray(data) ? data : [])
    } catch (e) {
      console.error('Error fetching categories:', e)
      toast.error('Failed to load categories')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setEditingCategory(null)
    setForm({
      name_en: '',
      name_hi: '',
      image: '',
      metaTitle_en: '',
      metaTitle_hi: '',
      metaDescription_en: '',
      metaDescription_hi: '',
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (!form.name_en.trim()) {
        toast.error('English category name is required')
        return
      }

      const payload = {
        name_en: form.name_en.trim(),
        name_hi: form.name_hi?.trim() || '',
        slug: slugify(form.name_en),
        image: form.image?.trim() || '',
        metaTitle_en: form.metaTitle_en?.trim() || '',
        metaTitle_hi: form.metaTitle_hi?.trim() || '',
        metaDescription_en: form.metaDescription_en?.trim() || '',
        metaDescription_hi: form.metaDescription_hi?.trim() || '',
      }

      if (editingCategory?._id) {
        await apiService.updateCategory(editingCategory._id, payload)
        toast.success('Category updated successfully')
      } else {
        await apiService.createCategory(payload)
        toast.success('Category created successfully')
      }

      resetForm()
      fetchCategories()
    } catch (e: any) {
      console.error('Error saving category:', e)
      const msg =
        e?.response?.data?.message ||
        e?.message ||
        'Failed to save category'
      toast.error(msg)
    }
  }

  const handleEdit = (cat: Category) => {
    setEditingCategory(cat)
    setForm({
      name_en: cat.name_en || '',
      name_hi: cat.name_hi || '',
      image: cat.image || '',
      metaTitle_en: cat.metaTitle_en || '',
      metaTitle_hi: cat.metaTitle_hi || '',
      metaDescription_en: cat.metaDescription_en || '',
      metaDescription_hi: cat.metaDescription_hi || '',
    })
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this category?')) return
    try {
      await apiService.deleteCategory(id)
      toast.success('Category deleted')
      if (editingCategory?._id === id) resetForm()
      fetchCategories()
    } catch (e) {
      console.error('Error deleting category:', e)
      toast.error('Failed to delete category')
    }
  }

  const handleImageUpload = async (file: File) => {
    if (!file) return
    setUploadingImage(true)
    const formData = new FormData()
    formData.append('image', file)
    try {
      const res = await apiService.uploadCategoryImage(formData)
      setForm({ ...form, image: res.data.imageUrl })
      toast.success('Image uploaded successfully')
    } catch (e: any) {
      console.error('Error uploading image:', e)
      toast.error('Failed to upload image')
    } finally {
      setUploadingImage(false)
    }
  }

  // const titleCount = (v: string) => `${(v || '').length} / ${TITLE_MAX}`
  // const descCount = (v: string) => `${(v || '').length} / ${DESC_MAX}`

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-6" />
        <div className="h-64 bg-gray-200 rounded" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Card wrapper (like deployed) */}
      <div className="rounded-xl border bg-white dark:bg-gray-800">
        <div className="px-6 py-4 border-b dark:border-gray-700">
          <h2 className="text-xl font-semibold">Category Management</h2>
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Add / Edit form */}
          <div className="rounded-lg border p-5 dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-4">
              {editingCategory ? 'Edit Category' : 'Add New Category'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* English section */}
              <div className="space-y-3">
                <h4 className="font-semibold">English</h4>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Category Name (English) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.name_en}
                    onChange={(e) => setForm({ ...form, name_en: e.target.value })}
                    className="w-full rounded-md border px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="e.g., Health & Wellness"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Slug: <span className="font-mono">{slugify(form.name_en)}</span>
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Meta Title (English)
                  </label>
                  <input
                    type="text"
                    // maxLength={TITLE_MAX}
                    value={form.metaTitle_en}
                    onChange={(e) => setForm({ ...form, metaTitle_en: e.target.value })}
                    className="w-full rounded-md border px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Up to 60 characters"
                  />
                  {/* <p className="text-xs text-gray-500 mt-1">{titleCount(form.metaTitle_en)}</p> */}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Meta Description (English)
                  </label>
                  <textarea
                    rows={4}
                    // maxLength={DESC_MAX}
                    value={form.metaDescription_en}
                    onChange={(e) => setForm({ ...form, metaDescription_en: e.target.value })}
                    className="w-full rounded-md border px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Up to 160 characters"
                  />
                  {/* <p className="text-xs text-gray-500 mt-1">{descCount(form.metaDescription_en)}</p> */}
                </div>
              </div>

              {/* Hindi section */}
              <div className="space-y-3">
                <h4 className="font-semibold">Hindi</h4>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Category Name (Hindi)
                  </label>
                  <input
                    type="text"
                    value={form.name_hi}
                    onChange={(e) => setForm({ ...form, name_hi: e.target.value })}
                    className="w-full rounded-md border px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="e.g., स्वास्थ्य और कल्याण"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Category Image
                  </label>
                  <input
                    type="text"
                    value={form.image}
                    onChange={(e) => setForm({ ...form, image: e.target.value })}
                    className="w-full rounded-md border px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Paste Image URL or upload below"
                  />
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleImageUpload(file)
                      }}
                      className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      disabled={uploadingImage}
                    />
                    {uploadingImage && (
                      <div className="text-sm text-blue-600">Uploading...</div>
                    )}
                  </div>
                  {form.image && (
                    <div className="mt-2">
                      <img src={form.image} alt="Category Preview" className="max-h-32 object-contain rounded-md shadow-md" />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Meta Title (Hindi)
                  </label>
                  <input
                    type="text"
                    // maxLength={TITLE_MAX}
                    value={form.metaTitle_hi}
                    onChange={(e) => setForm({ ...form, metaTitle_hi: e.target.value })}
                    className="w-full rounded-md border px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Up to 60 characters"
                  />
                  {/* <p className="text-xs text-gray-500 mt-1">{titleCount(form.metaTitle_hi)}</p> */}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Meta Description (Hindi)
                  </label>
                  <textarea
                    rows={4}
                    // maxLength={DESC_MAX}
                    value={form.metaDescription_hi}
                    onChange={(e) => setForm({ ...form, metaDescription_hi: e.target.value })}
                    className="w-full rounded-md border px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Up to 160 characters"
                  />
                  {/* <p className="text-xs text-gray-500 mt-1">{descCount(form.metaDescription_hi)}</p> */}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
                >
                  {editingCategory ? 'Update Category' : 'Add Category'}
                </button>
                {editingCategory && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md font-medium"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Existing categories list */}
          <div className="rounded-lg border p-5 dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-4">Existing Categories</h3>

            {categories.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">No categories yet.</p>
            ) : (
              <ul className="divide-y dark:divide-gray-700">
                {categories.map((cat) => (
                  <li key={cat._id} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {cat.name_en}
                      </p>
                      {cat.name_hi ? (
                        <p className="text-sm text-gray-500 dark:text-gray-400">{cat.name_hi}</p>
                      ) : null}
                    </div>
                    <div className="flex items-center gap-4">
                      <button
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        onClick={() => handleEdit(cat)}
                      >
                        Edit
                      </button>
                      <button
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                        onClick={() => handleDelete(cat._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
