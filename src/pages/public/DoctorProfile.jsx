import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  FaStar, FaStarHalfAlt, FaRegStar,
  FaUser, FaStethoscope, FaBriefcase, 
  FaCalendarAlt, FaClock, FaCheckCircle,
  FaQuoteLeft, FaArrowLeft, FaSpinner,
  FaEnvelope, FaPhone, FaMapMarkerAlt,
  FaGraduationCap, FaFileMedical
} from 'react-icons/fa'
import { doctorsApi } from '../../api/doctors.api'
import { reviewsApi } from '../../api/reviews.api'
import toast from 'react-hot-toast'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: 'easeOut' },
  }),
}

const DoctorProfile = () => {
  const { id } = useParams()
  const [doctor, setDoctor] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [reviewStats, setReviewStats] = useState({ average: 0, total: 0, distribution: {} })

  useEffect(() => {
    if (id) {
      fetchDoctor()
      fetchReviews()
    }
  }, [id])

  const fetchDoctor = async () => {
    setLoading(true)
    try {
      const response = await doctorsApi.getById(id)
    
      setDoctor(response.data.doctor)
    } catch (error) {
      
      toast.error('Failed to load doctor profile')
    } finally {
      setLoading(false)
    }
  }

  const fetchReviews = async () => {
    try {
      const response = await reviewsApi.getDoctorReviews(id, { limit: 5 })
      
      setReviews(response.data.reviews || [])
      setReviewStats({
        average: response.data.stats?.averageRating || 0,
        total: response.data.stats?.totalReviews || 0,
        distribution: response.data.stats?.ratingDistribution || {}
      })
    } catch (error) {
      toast.error(error)
    }
  }

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0)
    
    return (
      <div className="flex items-center gap-0.5">
        {[...Array(fullStars)].map((_, i) => (
          <FaStar key={`full-${i}`} className="text-yellow-400" size={16} />
        ))}
        {hasHalfStar && <FaStarHalfAlt className="text-yellow-400" size={16} />}
        {[...Array(emptyStars)].map((_, i) => (
          <FaRegStar key={`empty-${i}`} className="text-gray-300" size={16} />
        ))}
      </div>
    )
  }

  const formatDate = (date) => {
    if (!date) return 'Recent'
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getInitials = (name) => {
    if (!name) return 'D'
    const parts = name.split(' ')
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-emerald-600 mx-auto" />
          <p className="mt-4 text-gray-500 text-sm">Loading doctor profile...</p>
        </div>
      </div>
    )
  }

  if (!doctor) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-4">👨‍⚕️</div>
          <h2 className="text-2xl font-semibold text-gray-800">Doctor not found</h2>
          <p className="text-gray-500 mt-2">The doctor you're looking for doesn't exist.</p>
          <Link to="/doctors" className="mt-4 inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700">
            <FaArrowLeft /> Back to Doctors
          </Link>
        </div>
      </div>
    )
  }

  const userData = doctor.user || {}
  const doctorData = doctor

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Back Button */}
        <Link 
          to="/doctors" 
          className="inline-flex items-center gap-2 text-gray-600 hover:text-emerald-600 transition-colors mb-6"
        >
          <FaArrowLeft size={14} /> Back to Doctors
        </Link>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Profile - Takes 2/3 of the space */}
          <div className="lg:col-span-2">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
            >
              {/* Cover & Avatar Section */}
              <div className="relative">
                {/* Cover Image */}
                <div className="h-32 bg-gradient-to-r from-emerald-600 to-teal-600"></div>
                
                {/* Avatar */}
                <div className="absolute -bottom-12 left-6 md:left-8">
                  {userData.profileImage ? (
                    <img 
                      src={userData.profileImage} 
                      alt={`Dr. ${userData.firstName}`}
                      className="w-24 h-24 rounded-full border-4 border-white shadow-lg object-cover"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-white rounded-full border-4 border-white shadow-lg flex items-center justify-center text-3xl font-bold text-emerald-600">
                      {getInitials(`${userData.firstName} ${userData.lastName}`)}
                    </div>
                  )}
                </div>

                {/* Status Badge */}
                <div className="absolute top-4 right-4">
                  <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${
                    doctorData.isAvailableForConsultation 
                      ? 'bg-emerald-100 text-emerald-700 border-emerald-200' 
                      : 'bg-red-100 text-red-700 border-red-200'
                  }`}>
                    <FaCheckCircle className={doctorData.isAvailableForConsultation ? 'text-emerald-600' : 'text-red-600'} size={14} />
                    {doctorData.isAvailableForConsultation ? 'Available' : 'Unavailable'}
                  </span>
                </div>
              </div>

              {/* Profile Info */}
              <div className="pt-16 pb-6 px-6 md:px-8">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Dr. {userData.firstName} {userData.lastName}
                    </h2>
                    <div className="flex flex-wrap items-center gap-3 mt-1">
                      <span className="text-emerald-600 font-medium text-sm flex items-center gap-1.5">
                        <FaStethoscope size={14} /> {doctorData.specialization || 'General'}
                      </span>
                      <span className="text-gray-300">|</span>
                      <span className="text-gray-500 text-sm flex items-center gap-1">
                        <FaBriefcase size={14} /> {doctorData.yearsOfExperience || 0} years experience
                      </span>
                      <span className="text-gray-300">|</span>
                      <span className="text-yellow-500 text-sm flex items-center gap-1">
                        <FaStar size={14} /> {reviewStats.average?.toFixed(1) || '0.0'} ({reviewStats.total || 0} reviews)
                      </span>
                    </div>
                  </div>
                  <Link
                    to="/patient/appointments/new?doctor=${id}"
                    className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors text-center shadow-sm"
                  >
                    Book Appointment
                  </Link>
                </div>
              </div>

              {/* Details Grid */}
              <div className="border-t border-gray-100 px-6 md:px-8 py-6">
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Left Column - Personal & Contact */}
                  <div className="space-y-5">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <FaUser className="text-emerald-600" size={14} /> Personal Information
                      </h3>
                      <div className="space-y-2.5">
                        <div className="flex items-center gap-3 text-sm">
                          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500">
                            <FaEnvelope size={14} />
                          </div>
                          <div>
                            <p className="text-gray-400 text-xs">Email</p>
                            <p className="font-medium text-gray-800">{userData.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500">
                            <FaPhone size={14} />
                          </div>
                          <div>
                            <p className="text-gray-400 text-xs">Phone</p>
                            <p className="font-medium text-gray-800">{userData.phone || 'Not provided'}</p>
                          </div>
                        </div>
                        {userData.address && (
                          <div className="flex items-center gap-3 text-sm">
                            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500">
                              <FaMapMarkerAlt size={14} />
                            </div>
                            <div>
                              <p className="text-gray-400 text-xs">Location</p>
                              <p className="font-medium text-gray-800">
                                {userData.address.city}, {userData.address.state}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {doctorData.bio && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-2">
                          <FaFileMedical className="text-emerald-600" size={14} /> About
                        </h3>
                        <p className="text-gray-600 text-sm leading-relaxed">{doctorData.bio}</p>
                      </div>
                    )}
                  </div>

                  {/* Right Column - Professional Info */}
                  <div className="space-y-5">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <FaStethoscope className="text-emerald-600" size={14} /> Professional Details
                      </h3>
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between text-sm border-b border-gray-100 pb-2">
                          <span className="text-gray-500">Specialization</span>
                          <span className="font-medium text-gray-800">{doctorData.specialization || 'N/A'}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm border-b border-gray-100 pb-2">
                          <span className="text-gray-500">License Number</span>
                          <span className="font-medium text-gray-800">{doctorData.licenseNumber || 'N/A'}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm border-b border-gray-100 pb-2">
                          <span className="text-gray-500">Consultation Fee</span>
                          <span className="font-medium text-emerald-700">GHS {doctorData.consultationFee || '0.00'}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Experience</span>
                          <span className="font-medium text-gray-800">{doctorData.yearsOfExperience || 0} years</span>
                        </div>
                      </div>
                    </div>

                    {doctorData.qualifications?.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-2">
                          <FaGraduationCap className="text-emerald-600" size={14} /> Qualifications
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {doctorData.qualifications.map((qual, i) => (
                            <span key={i} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
                              {qual}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Reviews Sidebar - Takes 1/3 of the space */}
          <div className="lg:col-span-1 space-y-6">
            {/* Rating Summary Card */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5"
            >
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4 flex items-center gap-2">
                <FaStar className="text-yellow-400" size={14} /> Rating Summary
              </h3>
              
              <div className="text-center mb-4">
                <div className="text-4xl font-bold text-gray-900">{reviewStats.average?.toFixed(1) || '0.0'}</div>
                <div className="flex justify-center mt-1">
                  {renderStars(reviewStats.average || 0)}
                </div>
                <p className="text-sm text-gray-500 mt-1">{reviewStats.total || 0} reviews</p>
              </div>

              <div className="space-y-1">
                {[5, 4, 3, 2, 1].map(rating => {
                  const count = reviewStats.distribution[rating] || 0
                  const maxCount = Math.max(...Object.values(reviewStats.distribution), 1)
                  const percentage = (count / maxCount) * 100
                  return (
                    <div key={rating} className="flex items-center gap-2">
                      <span className="text-xs text-gray-600 w-4">{rating}</span>
                      <FaStar className="text-yellow-400 text-xs" />
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-yellow-400 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 w-8">{count}</span>
                    </div>
                  )
                })}
              </div>
            </motion.div>

            {/* Recent Reviews */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                  <FaQuoteLeft className="text-emerald-500" size={14} /> Recent Reviews
                </h3>
              </div>

              {reviews.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-gray-400 text-sm">No reviews yet</p>
                  <p className="text-gray-400 text-xs mt-1">Be the first to review</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
                  {reviews.map((review, index) => (
                    <div key={review._id || index} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {review.avatar ? (
                            <img 
                              src={review.avatar} 
                              alt={review.name}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold text-gray-600">
                              {review.name?.[0] || 'P'}
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-medium text-gray-800">{review.name || 'Anonymous'}</p>
                            <div className="flex items-center gap-1">
                              {renderStars(review.rating || 0)}
                            </div>
                          </div>
                        </div>
                        <span className="text-xs text-gray-400">{formatDate(review.createdAt)}</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        "{review.content || 'Great experience!'}"
                      </p>
                      {review.isVerified && (
                        <span className="text-xs text-emerald-600 font-medium flex items-center gap-1 mt-1">
                          <FaCheckCircle size={10} /> Verified Patient
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DoctorProfile