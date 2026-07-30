import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FaArrowLeft, FaSpinner, FaSave, FaTimes,
  FaPlus, FaTrash, FaImage, FaUpload,
  FaTag, FaBox, FaPrescription, FaDollarSign,
  FaList, FaStar
} from 'react-icons/fa'
import { shopApi } from '../../api/shop.api'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: 'easeOut' },
  }),
}

const ProductForm = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    shortDescription: '',
    category: '',
    subCategory: '',
    price: '',
    discountPrice: '',
    stockQuantity: '',
    lowStockThreshold: '10',
    unit: 'Unit',
    dosage: '',
    ingredients: [],
    manufacturer: '',
    requiresPrescription: false,
    expiryDate: '',
    batchNumber: '',
    isFeatured: false,
    tags: []
  })
  const [tagInput, setTagInput] = useState('')
  const [ingredientInput, setIngredientInput] = useState('')
  const [images, setImages] = useState([])
  const [imagePreviews, setImagePreviews] = useState([])
  const [existingImages, setExistingImages] = useState([])

  const categories = [
    'Prescription Drugs', 'Over-the-Counter', 'Vitamins & Supplements',
    'Herbal Medicine', 'Medical Equipment', 'Personal Care', 'Baby Care',
    'First Aid', 'Pain Relief', 'Antibiotics', 'Chronic Care', 'Other'
  ]

  const units = [
    'Tablet', 'Capsule', 'Syrup', 'Injection', 'Cream', 'Ointment',
    'Patch', 'Inhaler', 'Drops', 'Solution', 'Powder', 'Suppository',
    'Spray', 'Unit', 'Pack', 'Bottle', 'Box', 'Strip', 'Other'
  ]

  const isEdit = !!id

  useEffect(() => {
    if (isEdit) {
      fetchProduct()
    }
  }, [id])

  const fetchProduct = async () => {
    setLoading(true)
    try {
      const response = await shopApi.getProductByIdAdmin(id)
      const product = response.data.product
      setFormData({
        name: product.name || '',
        description: product.description || '',
        shortDescription: product.shortDescription || '',
        category: product.category || '',
        subCategory: product.subCategory || '',
        price: product.price || '',
        discountPrice: product.discountPrice || '',
        stockQuantity: product.stockQuantity || '',
        lowStockThreshold: product.lowStockThreshold || '10',
        unit: product.unit || 'Unit',
        dosage: product.dosage || '',
        ingredients: product.ingredients || [],
        manufacturer: product.manufacturer || '',
        requiresPrescription: product.requiresPrescription || false,
        expiryDate: product.expiryDate ? new Date(product.expiryDate).toISOString().split('T')[0] : '',
        batchNumber: product.batchNumber || '',
        isFeatured: product.isFeatured || false,
        tags: product.tags || []
      })
      setExistingImages(product.images || [])
    } catch (error) {
     
      toast.error('Failed to load product')
      navigate('/admin/products')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleAddTag = () => {
    if (!tagInput.trim()) return
    if (formData.tags.includes(tagInput.trim())) {
      toast.error('Tag already exists')
      return
    }
    setFormData(prev => ({
      ...prev,
      tags: [...prev.tags, tagInput.trim()]
    }))
    setTagInput('')
  }

  const handleRemoveTag = (index) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }))
  }

  const handleAddIngredient = () => {
    if (!ingredientInput.trim()) return
    if (formData.ingredients.includes(ingredientInput.trim())) {
      toast.error('Ingredient already exists')
      return
    }
    setFormData(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, ingredientInput.trim()]
    }))
    setIngredientInput('')
  }

  const handleRemoveIngredient = (index) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index)
    }))
  }

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    // Limit to 5 images total
    const totalImages = existingImages.length + images.length + files.length
    if (totalImages > 5) {
      toast.error('Maximum 5 images allowed')
      return
    }

    const previews = files.map(file => URL.createObjectURL(file))
    setImagePreviews(prev => [...prev, ...previews])
    setImages(prev => [...prev, ...files])
  }

  const handleRemoveImage = (index) => {
    const newImages = [...images]
    const newPreviews = [...imagePreviews]
    newImages.splice(index, 1)
    newPreviews.splice(index, 1)
    setImages(newImages)
    setImagePreviews(newPreviews)
  }

  const handleRemoveExistingImage = (index) => {
    const newExisting = [...existingImages]
    newExisting.splice(index, 1)
    setExistingImages(newExisting)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.name || !formData.description || !formData.category || !formData.price || !formData.stockQuantity) {
      toast.error('Please fill in all required fields')
      return
    }

    setSaving(true)
    try {
      const data = new FormData()

      data.append('name', formData.name)
      data.append('description', formData.description)
      data.append('shortDescription', formData.shortDescription || '')
      data.append('category', formData.category)
      data.append('subCategory', formData.subCategory || '')
      data.append('price', formData.price)
      data.append('discountPrice', formData.discountPrice || '')
      data.append('stockQuantity', formData.stockQuantity)
      data.append('lowStockThreshold', formData.lowStockThreshold || '10')
      data.append('unit', formData.unit || 'Unit')
      data.append('dosage', formData.dosage || '')

      // Fix: Send ingredients as array - NOT JSON stringified
      formData.ingredients.forEach(ingredient => {
        data.append('ingredients[]', ingredient)
      })

      data.append('manufacturer', formData.manufacturer || '')
      data.append('requiresPrescription', formData.requiresPrescription ? 'true' : 'false')
      data.append('expiryDate', formData.expiryDate || '')
      data.append('batchNumber', formData.batchNumber || '')
      data.append('isFeatured', formData.isFeatured ? 'true' : 'false')

      // Fix: Send tags as array - NOT JSON stringified
      formData.tags.forEach(tag => {
        data.append('tags[]', tag)
      })

      // Append new images
      images.forEach((image) => {
        data.append('images', image)
      })

      // Send existing images as JSON string
      data.append('existingImages', JSON.stringify(existingImages))

      let response
      if (isEdit) {
        response = await shopApi.updateProduct(id, data)
        toast.success('Product updated successfully!')
      } else {
        response = await shopApi.createProduct(data)
        toast.success('Product created successfully!')
      }
      navigate('/admin/products')
    } catch (error) {
     
      toast.error(error.response?.data?.message || 'Failed to save product')
    } finally {
      setSaving(false)
    }
  }

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      imagePreviews.forEach(url => URL.revokeObjectURL(url))
    }
  }, [imagePreviews])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <FaSpinner className="animate-spin text-3xl text-emerald-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center gap-4 mb-6">
          <Link to="/admin/products" className="text-gray-600 hover:text-gray-800">
            <FaArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-semibold text-gray-900">
            {isEdit ? 'Edit Product' : 'Add New Product'}
          </h1>
        </div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="bg-white rounded-xl border border-gray-200 shadow-sm p-6"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Product Name & Category */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Product Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter product name"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Price & Stock */}
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Price (GHS) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="0.00"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Discount Price
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="discountPrice"
                  value={formData.discountPrice}
                  onChange={handleChange}
                  placeholder="0.00"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Stock Quantity *
                </label>
                <input
                  type="number"
                  name="stockQuantity"
                  value={formData.stockQuantity}
                  onChange={handleChange}
                  placeholder="0"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
                  required
                />
              </div>
            </div>

            {/* Unit & Dosage */}
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Unit
                </label>
                <select
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
                >
                  {units.map(unit => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Dosage
                </label>
                <input
                  type="text"
                  name="dosage"
                  value={formData.dosage}
                  onChange={handleChange}
                  placeholder="500mg"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Low Stock Threshold
                </label>
                <input
                  type="number"
                  name="lowStockThreshold"
                  value={formData.lowStockThreshold}
                  onChange={handleChange}
                  placeholder="10"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
                />
              </div>
            </div>

            {/* Manufacturer & Batch */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Manufacturer
                </label>
                <input
                  type="text"
                  name="manufacturer"
                  value={formData.manufacturer}
                  onChange={handleChange}
                  placeholder="Manufacturer name"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Batch Number
                </label>
                <input
                  type="text"
                  name="batchNumber"
                  value={formData.batchNumber}
                  onChange={handleChange}
                  placeholder="Batch #"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
                />
              </div>
            </div>

            {/* Expiry & Sub-Category */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Expiry Date
                </label>
                <input
                  type="date"
                  name="expiryDate"
                  value={formData.expiryDate}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Sub-Category
                </label>
                <input
                  type="text"
                  name="subCategory"
                  value={formData.subCategory}
                  onChange={handleChange}
                  placeholder="Sub-category"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
                />
              </div>
            </div>

            {/* Checkboxes */}
            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  name="requiresPrescription"
                  checked={formData.requiresPrescription}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                />
                <FaPrescription className="text-yellow-600" /> Requires Prescription
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  name="isFeatured"
                  checked={formData.isFeatured}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                />
                <FaStar className="text-yellow-500" /> Featured Product
              </label>
            </div>

            {/* Short Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Short Description
              </label>
              <input
                type="text"
                name="shortDescription"
                value={formData.shortDescription}
                onChange={handleChange}
                placeholder="Brief description (max 300 chars)"
                maxLength="300"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
              />
              <p className="text-xs text-gray-400 mt-1">
                {formData.shortDescription.length}/300 characters
              </p>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="6"
                placeholder="Detailed product description..."
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
                required
              />
            </div>

            {/* Ingredients */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Ingredients
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={ingredientInput}
                  onChange={(e) => setIngredientInput(e.target.value)}
                  placeholder="Add ingredient"
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddIngredient())}
                />
                <button
                  type="button"
                  onClick={handleAddIngredient}
                  className="px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  <FaPlus size={14} />
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.ingredients.map((ing, index) => (
                  <span key={index} className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
                    <FaList size={12} />
                    {ing}
                    <button
                      type="button"
                      onClick={() => handleRemoveIngredient(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <FaTimes size={12} />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Tags
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Add tag"
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  <FaPlus size={14} />
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map((tag, index) => (
                  <span key={index} className="flex items-center gap-2 bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                    <FaTag size={12} />
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <FaTimes size={12} />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Product Images */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Product Images
              </label>
              <div className="flex flex-wrap gap-3 mb-3">
                {/* Existing Images */}
                {existingImages.map((img, index) => (
                  <div key={`existing-${index}`} className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200 group">
                    <img src={img} alt={`Product ${index}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveExistingImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <FaTimes size={12} />
                    </button>
                  </div>
                ))}

                {/* New Image Previews */}
                {imagePreviews.map((preview, index) => (
                  <div key={`preview-${index}`} className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200 group">
                    <img src={preview} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <FaTimes size={12} />
                    </button>
                  </div>
                ))}

                {/* Upload Button */}
                {(existingImages.length + images.length) < 5 && (
                  <label className="w-24 h-24 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-emerald-400 transition-colors">
                    <FaUpload className="text-gray-400 text-xl mb-1" />
                    <span className="text-xs text-gray-400 text-center">Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              <p className="text-xs text-gray-400">
                {existingImages.length + images.length} / 5 images • JPG, PNG, WebP (Max 5MB each)
              </p>
            </div>

            {/* Author Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 flex items-center gap-2">
                <FaBox size={14} />
                Created by: {user?.firstName} {user?.lastName}
              </p>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50"
              >
                {saving ? <FaSpinner className="animate-spin" /> : <FaSave />}
                {isEdit ? 'Update Product' : 'Create Product'}
              </button>
              <Link
                to="/admin/products"
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                Cancel
              </Link>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  )
}

export default ProductForm