import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { 
  FaArrowLeft, FaStar, FaUser, FaSpinner, 
  FaCheckCircle, FaCamera, FaUpload, FaTimes
} from 'react-icons/fa'
import { reviewsApi } from '../../api/reviews.api'
import { doctorsApi } from '../../api/doctors.api'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

const WriteReview = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [doctors, setDoctors] = useState([])
  const [selectedDoctor, setSelectedDoctor] = useState('')
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [content, setContent] = useState('')
  const [avatar, setAvatar] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)

  useEffect(() => {
    fetchDoctors()
  }, [])

  const fetchDoctors = async () => {
    setLoading(true)
    try {
      const response = await doctorsApi.getAll({ isAvailable: true })
      setDoctors(response.data.doctors || [])
    } catch (error) {
      toast.error('Failed to load doctors')
    } finally {
      setLoading(false)
    }
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB')
        e.target.value = ''
        return
      }
      
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
      if (!allowedTypes.includes(file.type)) {
        toast.error('Please upload a valid image (JPEG, PNG, WEBP, GIF)')
        e.target.value = ''
        return
      }
      
      setAvatar(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveAvatar = () => {
    setAvatar(null)
    setAvatarPreview(null)
    const fileInput = document.getElementById('avatar-upload')
    if (fileInput) fileInput.value = ''
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!selectedDoctor) {
      toast.error('Please select a doctor')
      return
    }
    if (rating === 0) {
      toast.error('Please select a rating')
      return
    }
    if (!content.trim()) {
      toast.error('Please write a review')
      return
    }

    setSubmitting(true)
    try {
      // ✅ Use FormData just like AddDoctor
      const formData = new FormData()
      formData.append('doctorId', selectedDoctor)
      formData.append('rating', rating)
      formData.append('content', content)
      formData.append('isPublic', 'true')
      
      if (avatar) {
        formData.append('avatar', avatar)
        console.log('Avatar file attached:', { 
          name: avatar.name, 
          type: avatar.type, 
          size: avatar.size 
        })
      }

      // ✅ Use fetch directly like AddDoctor does
      const token = localStorage.getItem('sch_token')
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/reviews`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      const data = await response.json()
      console.log('Review response:', data)
      
      if (data.success) {
        toast.success('Review submitted successfully!')
        navigate('/patient/reviews')
      } else {
        toast.error(data.message || 'Failed to submit review')
      }
    } catch (error) {
      console.error('Submit error:', error)
      toast.error('Failed to submit review')
    } finally {
      setSubmitting(false)
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
      <div className="max-w-3xl mx-auto px-4">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/patient/reviews" className="text-gray-600 hover:text-gray-800">
            <FaArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-semibold text-gray-900">Write a Review</h1>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <form onSubmit={handleSubmit}>
            {/* Avatar Upload */}
            <div className="mb-6 text-center">
              {avatarPreview ? (
                <div className="relative inline-block">
                  <div className="w-20 h-20 mx-auto rounded-full overflow-hidden border-2 border-emerald-200">
                    <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                  >
                    <FaTimes size={12} />
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer">
                  <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center overflow-hidden hover:bg-gray-200 transition-colors border-2 border-dashed border-gray-300 hover:border-emerald-400">
                    <div className="text-3xl text-gray-400">
                      <FaCamera />
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Upload photo (optional)</p>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Select Doctor */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Select Doctor *
              </label>
              <select
                value={selectedDoctor}
                onChange={(e) => setSelectedDoctor(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
                required
              >
                <option value="">Select a doctor</option>
                {doctors.map((doctor) => {
                  const doctorId = doctor.user?._id || doctor._id
                  const firstName = doctor.user?.firstName || doctor.firstName || 'Unknown'
                  const lastName = doctor.user?.lastName || doctor.lastName || ''
                  return (
                    <option key={doctorId} value={doctorId}>
                      Dr. {firstName} {lastName} - {doctor.specialization || 'General'}
                    </option>
                  )
                })}
              </select>
            </div>

            {/* Rating */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Rating *
              </label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="text-3xl transition-transform hover:scale-110 focus:outline-none"
                  >
                    <FaStar
                      className={
                        (hoverRating || rating) >= star
                          ? 'text-yellow-400'
                          : 'text-gray-300'
                      }
                    />
                  </button>
                ))}
                <span className="ml-3 text-sm font-medium text-gray-600">
                  {rating > 0 ? `${rating}.0 / 5.0` : 'Select rating'}
                </span>
              </div>
            </div>

            {/* Review Content */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Your Review *
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows="5"
                placeholder="Share your experience with the doctor..."
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
                required
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50"
              >
                {submitting ? <FaSpinner className="animate-spin" /> : <FaCheckCircle />}
                Submit Review
              </button>
              <Link
                to="/patient/reviews"
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default WriteReview