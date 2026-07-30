import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  FaArrowLeft, FaStar, FaUser, FaCalendarAlt,
  FaSpinner, FaCheckCircle, FaQuoteLeft,
  FaShareAlt, FaThumbsUp, FaHeart
} from 'react-icons/fa'
import { reviewsApi } from '../../api/reviews.api'
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

const ReviewDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [review, setReview] = useState(null)
  const [loading, setLoading] = useState(true)
  const [liked, setLiked] = useState(false)

  useEffect(() => {
    fetchReview()
  }, [id])

  const fetchReview = async () => {
    setLoading(true)
    try {
      const response = await reviewsApi.getById(id)
      console.log('Review detail:', response.data)
      setReview(response.data.review)
    } catch (error) {
      console.error('Fetch review error:', error)
      toast.error('Failed to load review')
      navigate('/reviews')
    } finally {
      setLoading(false)
    }
  }

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0)
    
    return (
      <div className="flex items-center gap-0.5">
        {[...Array(fullStars)].map((_, i) => (
          <FaStar key={`full-${i}`} className="text-yellow-400" size={20} />
        ))}
        {hasHalfStar && <FaStarHalfAlt className="text-yellow-400" size={20} />}
        {[...Array(emptyStars)].map((_, i) => (
          <FaRegStar key={`empty-${i}`} className="text-gray-300" size={20} />
        ))}
      </div>
    )
  }

  const formatDate = (date) => {
    if (!date) return 'Recent'
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getInitials = (name) => {
    if (!name) return 'U'
    const parts = name.split(' ')
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
  }

  const getAvatarColor = (name) => {
    const colors = [
      'bg-blue-100 text-blue-600',
      'bg-green-100 text-green-600',
      'bg-purple-100 text-purple-600',
      'bg-pink-100 text-pink-600',
      'bg-indigo-100 text-indigo-600',
      'bg-teal-100 text-teal-600',
      'bg-orange-100 text-orange-600',
      'bg-rose-100 text-rose-600'
    ]
    const index = name ? name.length % colors.length : 0
    return colors[index]
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-emerald-600 mx-auto" />
          <p className="mt-4 text-gray-500 text-sm">Loading review...</p>
        </div>
      </div>
    )
  }

  if (!review) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-4">📝</div>
          <h2 className="text-2xl font-semibold text-gray-800">Review not found</h2>
          <p className="text-gray-500 mt-2">The review you're looking for doesn't exist.</p>
          <Link to="/patient/reviews" className="mt-4 inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700">
            <FaArrowLeft /> Back to Reviews
          </Link>
        </div>
      </div>
    )
  }

  const reviewerName = review.name || 'Anonymous'
  const reviewerAvatar = review.avatar || null
  const reviewerEmail = review.email || ''

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Back Button */}
        <Link 
          to="/patient/reviews" 
          className="inline-flex items-center gap-2 text-gray-600 hover:text-emerald-600 transition-colors mb-6"
        >
          <FaArrowLeft size={14} /> Back to Reviews
        </Link>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-50 to-green-50 px-6 py-8 border-b border-gray-100">
            <div className="flex items-start gap-4">
              {reviewerAvatar ? (
                <img
                  src={reviewerAvatar}
                  alt={reviewerName}
                  className="w-16 h-16 rounded-full object-cover border-2 border-emerald-200 flex-shrink-0"
                />
              ) : (
                <div className={`w-16 h-16 rounded-full flex items-center justify-center font-semibold text-xl flex-shrink-0 ${getAvatarColor(reviewerName)}`}>
                  {getInitials(reviewerName)}
                </div>
              )}
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900">{reviewerName}</h2>
                {reviewerEmail && (
                  <p className="text-sm text-gray-500">{reviewerEmail}</p>
                )}
                <div className="flex items-center gap-3 mt-2">
                  {renderStars(review.rating || 0)}
                  <span className="text-sm font-medium text-gray-700">{review.rating}.0</span>
                </div>
                <div className="flex items-center gap-3 mt-2 text-sm text-gray-400">
                  <span className="flex items-center gap-1">
                    <FaCalendarAlt size={12} /> {formatDate(review.createdAt)}
                  </span>
                  {review.isVerified && (
                    <span className="flex items-center gap-1 text-emerald-600">
                      <FaCheckCircle size={12} /> Verified Patient
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-8">
            <div className="flex items-start gap-3 mb-4">
              <FaQuoteLeft className="text-emerald-200 text-2xl flex-shrink-0" />
              <p className="text-gray-700 text-lg leading-relaxed">
                {review.content}
              </p>
            </div>

            {/* Doctor Info */}
            {review.doctor && (
              <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-sm font-medium text-gray-700 mb-2">Doctor</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-semibold text-sm">
                    {review.doctor.firstName?.[0]}{review.doctor.lastName?.[0]}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      Dr. {review.doctor.firstName} {review.doctor.lastName}
                    </p>
                    {review.doctor.specialization && (
                      <p className="text-sm text-gray-500">{review.doctor.specialization}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="mt-6 pt-6 border-t border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setLiked(!liked)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    liked ? 'text-red-500 bg-red-50' : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <FaHeart className={liked ? 'fill-red-500' : ''} size={16} />
                  <span>{liked ? 'Liked' : 'Like'}</span>
                </button>
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors">
                  <FaThumbsUp size={16} />
                  <span>Helpful</span>
                </button>
              </div>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href)
                  toast.success('Link copied!')
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors"
              >
                <FaShareAlt size={16} />
                <span>Share</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default ReviewDetail