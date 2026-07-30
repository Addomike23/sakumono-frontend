import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  FaArrowLeft, FaSpinner, FaSave, FaTimes,
  FaPlus, FaTrash, FaImage, FaUpload,
  FaTag, FaCheckCircle, FaClock, FaBookOpen,
  FaUser, FaCalendarAlt, FaXbox
} from 'react-icons/fa'
import { blogsApi } from '../../api/blogs.api'
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

const BlogForm = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    category: '',
    tags: [],
    status: 'draft'
  })
  const [tagInput, setTagInput] = useState('')
  const [featuredImage, setFeaturedImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [existingImage, setExistingImage] = useState(null)

  const categories = [
    'Health Tips', 'Medical News', 'Hospital Updates', 'Wellness',
    'Disease Prevention', 'Mental Health', 'Nutrition', 'Fitness',
    'Patient Stories', 'Events'
  ]

  const isEdit = !!id

  useEffect(() => {
    if (isEdit) {
      fetchBlog()
    }
  }, [id])

  const fetchBlog = async () => {
    setLoading(true)
    try {
      const response = await blogsApi.getById(id)
      const blog = response.data.blog
      setFormData({
        title: blog.title || '',
        content: blog.content || '',
        excerpt: blog.excerpt || '',
        category: blog.category || '',
        tags: blog.tags || [],
        status: blog.status || 'draft'
      })
      setExistingImage(blog.featuredImage || null)
      if (blog.featuredImage) {
        setImagePreview(blog.featuredImage)
      }
    } catch (error) {
      toast.error('Failed to load blog post')
      navigate('/admin/blogs')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
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

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setFeaturedImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setFeaturedImage(null)
    setImagePreview(null)
    setExistingImage(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.title || !formData.content || !formData.excerpt || !formData.category) {
      toast.error('Please fill in all required fields')
      return
    }

    setSaving(true)
    try {
      const data = new FormData()
      data.append('title', formData.title)
      data.append('content', formData.content)
      data.append('excerpt', formData.excerpt)
      data.append('category', formData.category)
      
      // Send tags as array - NOT JSON stringified
      formData.tags.forEach(tag => {
        data.append('tags[]', tag)
      })
      
      data.append('status', formData.status)
      
      if (featuredImage) {
        data.append('featuredImage', featuredImage)
      }

      let response
      if (isEdit) {
        response = await blogsApi.update(id, data)
        toast.success('Blog post updated successfully!')
      } else {
        response = await blogsApi.create(data)
        toast.success('Blog post created successfully!')
      }
      navigate('/admin/blogs')
    } catch (error) {
      
      toast.error(error.response?.data?.message || 'Failed to save blog post')
    } finally {
      setSaving(false)
    }
  }

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
          <Link to="/admin/blogs" className="text-gray-600 hover:text-gray-800">
            <FaArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-semibold text-gray-900">
            {isEdit ? 'Edit Blog Post' : 'Create New Blog Post'}
          </h1>
          <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${
            formData.status === 'published' 
              ? 'bg-emerald-100 text-emerald-700' 
              : 'bg-amber-100 text-amber-700'
          }`}>
            {formData.status === 'published' ? <FaCheckCircle size={12} /> : <FaClock size={12} />}
            {formData.status}
          </span>
        </div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="bg-white rounded-xl border border-gray-200 shadow-sm p-6"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter blog title..."
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
                required
              />
            </div>

            {/* Category & Status */}
            <div className="grid md:grid-cols-2 gap-4">
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
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>

            {/* Featured Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Featured Image
              </label>
              <div className="flex items-center gap-4">
                {imagePreview ? (
                  <div className="relative w-40 h-40 rounded-lg overflow-hidden border border-gray-200 group">
                    <img src={imagePreview} alt="Featured" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <FaTimes size={14} />
                    </button>
                  </div>
                ) : (
                  <label className="w-40 h-40 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-emerald-400 transition-colors">
                    <FaImage className="text-gray-400 text-3xl mb-2" />
                    <span className="text-xs text-gray-400">Upload Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                )}
                <div className="text-xs text-gray-400">
                  <p>Recommended: 1200x800px</p>
                  <p>JPG, PNG, WebP</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Content *
              </label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                rows="12"
                placeholder="Write your blog content here..."
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition font-mono"
                required
              />
              <p className="text-xs text-gray-400 mt-1">Markdown supported</p>
            </div>

            {/* Excerpt */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Excerpt *
              </label>
              <textarea
                name="excerpt"
                value={formData.excerpt}
                onChange={handleChange}
                rows="3"
                placeholder="Brief summary of the blog post..."
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
                required
              />
              <p className="text-xs text-gray-400">{formData.excerpt.length}/300 characters</p>
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
                      <FaXbox size={12} />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Author Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 flex items-center gap-2">
                <FaUser size={14} />
                Author: {user?.firstName} {user?.lastName}
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
                {isEdit ? 'Update Blog Post' : 'Create Blog Post'}
              </button>
              <Link
                to="/admin/blogs"
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

export default BlogForm