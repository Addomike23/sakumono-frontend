import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt,
  FaEdit, FaSpinner, FaStar, FaStarHalfAlt, FaRegStar,
  FaAward, FaCalendarAlt, FaClock, FaStethoscope,
  FaGraduationCap, FaFileMedical, FaUsers,
  FaCheckCircle, FaTimesCircle, FaBriefcase,
  FaHospitalAlt, FaClipboardList, FaArrowRight,
  FaGlobe, FaBuilding, FaLocationArrow,
  FaQuoteLeft, FaThumbsUp, FaHeart
} from 'react-icons/fa'
import { doctorsApi } from '../../api/doctors.api'
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

const DoctorProfile = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [doctor, setDoctor] = useState(null)
  const [userData, setUserData] = useState(null)
  const [stats, setStats] = useState({})
  const [reviews, setReviews] = useState([])
  const [reviewStats, setReviewStats] = useState({ average: 0, total: 0, distribution: {} })

  // Get the doctor ID from user object - handle both id and _id
  const doctorId = user?.id || user?._id

  useEffect(() => {
    if (doctorId) {
      fetchProfile()
      fetchReviews()
    } else {
      console.error('No doctor ID found in user object')
      setLoading(false)
    }
  }, [doctorId])

  const fetchProfile = async () => {
    setLoading(true)
    try {
      const response = await doctorsApi.getMyProfile()
      console.log('Profile response:', response.data)
      
      setDoctor(response.data.doctor)
      setUserData(response.data.user)
      setStats(response.data.doctor?.stats || {})
    } catch (error) {
      console.error('Fetch profile error:', error)
      toast.error('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const fetchReviews = async () => {
    try {
      // Use the doctorId from user object
      if (!doctorId) {
        console.warn('No doctor ID available for fetching reviews')
        return
      }
      
      console.log('Fetching reviews for doctor ID:', doctorId)
      const response = await reviewsApi.getDoctorReviews(doctorId, { limit: 5 })
      console.log('Reviews response:', response.data)
      
      setReviews(response.data.reviews || [])
      
      // Update review stats with proper distribution
      const distribution = response.data.stats?.ratingDistribution || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
      setReviewStats({
        average: response.data.stats?.averageRating || 0,
        total: response.data.stats?.totalReviews || 0,
        distribution: distribution
      })
      
      console.log('Review stats set:', {
        average: response.data.stats?.averageRating || 0,
        total: response.data.stats?.totalReviews || 0,
        distribution: distribution
      })
    } catch (error) {
      console.error('Fetch reviews error:', error)
    }
  }

  const getStatusColor = (isAvailable) => {
    return isAvailable 
      ? 'bg-emerald-100 text-emerald-700 border-emerald-200' 
      : 'bg-red-100 text-red-700 border-red-200'
  }

  const getStatusIcon = (isAvailable) => {
    return isAvailable 
      ? <FaCheckCircle className="text-emerald-600" size={14} /> 
      : <FaTimesCircle className="text-red-600" size={14} />
  }

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0)
    
    return (
      <div className="flex items-center gap-0.5">
        {[...Array(fullStars)].map((_, i) => (
          <FaStar key={`full-${i}`} className="text-yellow-400" size={14} />
        ))}
        {hasHalfStar && <FaStarHalfAlt className="text-yellow-400" size={14} />}
        {[...Array(emptyStars)].map((_, i) => (
          <FaRegStar key={`empty-${i}`} className="text-gray-300" size={14} />
        ))}
      </div>
    )
  }

  const renderRatingBars = () => {
    // Get the distribution values
    const distribution = reviewStats.distribution || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    const values = Object.values(distribution)
    const maxCount = Math.max(...values, 1) // Use 1 as minimum to avoid division by zero
    
    console.log('Distribution for bars:', distribution)
    console.log('Max count:', maxCount)
    
    return [5, 4, 3, 2, 1].map(rating => {
      const count = distribution[rating] || 0
      const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0
      
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
    })
  }

  const formatDate = (date) => {
    if (!date) return 'Recent'
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-emerald-600 mx-auto" />
          <p className="mt-4 text-gray-500 text-sm">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">My Profile</h1>
            <p className="text-sm text-gray-500 mt-0.5">Manage your professional information</p>
          </div>
          <Link
            to="/doctor/profile/edit"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors shadow-sm"
          >
            <FaEdit size={14} /> Edit Profile
          </Link>
        </div>

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
                  {userData?.profileImage ? (
                    <img 
                      src={userData.profileImage} 
                      alt="Profile"
                      className="w-24 h-24 rounded-full border-4 border-white shadow-lg object-cover"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-white rounded-full border-4 border-white shadow-lg flex items-center justify-center text-3xl font-bold text-emerald-600">
                      {userData?.firstName?.[0]}{userData?.lastName?.[0]}
                    </div>
                  )}
                </div>

                {/* Status Badge */}
                <div className="absolute top-4 right-4">
                  <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${getStatusColor(doctor?.isAvailableForConsultation)}`}>
                    {getStatusIcon(doctor?.isAvailableForConsultation)}
                    {doctor?.isAvailableForConsultation ? 'Available' : 'Unavailable'}
                  </span>
                </div>
              </div>

              {/* Profile Info */}
              <div className="pt-16 pb-6 px-6 md:px-8">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Dr. {userData?.firstName} {userData?.lastName}
                    </h2>
                    <div className="flex flex-wrap items-center gap-3 mt-1">
                      <span className="text-emerald-600 font-medium text-sm flex items-center gap-1.5">
                        <FaStethoscope size={14} /> {doctor?.specialization || 'General'}
                      </span>
                      <span className="text-gray-300">|</span>
                      <span className="text-gray-500 text-sm flex items-center gap-1">
                        <FaBriefcase size={14} /> {doctor?.yearsOfExperience || 0} years experience
                      </span>
                      <span className="text-gray-300">|</span>
                      <span className="text-yellow-500 text-sm flex items-center gap-1">
                        <FaStar size={14} /> {reviewStats.average?.toFixed(1) || '0.0'} ({reviewStats.total || 0} reviews)
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 w-full md:w-auto">
                    <Link
                      to="/doctor/appointments"
                      className="flex-1 md:flex-none px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors text-center"
                    >
                      <FaClipboardList className="inline mr-1.5" size={12} /> Appointments
                    </Link>
                    <Link
                      to="/doctor/availability"
                      className="flex-1 md:flex-none px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors text-center"
                    >
                      <FaClock className="inline mr-1.5" size={12} /> Availability
                    </Link>
                  </div>
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
                            <p className="font-medium text-gray-800">{userData?.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500">
                            <FaPhone size={14} />
                          </div>
                          <div>
                            <p className="text-gray-400 text-xs">Phone</p>
                            <p className="font-medium text-gray-800">{userData?.phone || 'Not provided'}</p>
                          </div>
                        </div>
                        {userData?.address && (
                          <div className="flex items-center gap-3 text-sm">
                            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500">
                              <FaLocationArrow size={14} />
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

                    {doctor?.bio && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-2">
                          <FaFileMedical className="text-emerald-600" size={14} /> About
                        </h3>
                        <p className="text-gray-600 text-sm leading-relaxed">{doctor.bio}</p>
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
                          <span className="font-medium text-gray-800">{doctor?.specialization || 'N/A'}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm border-b border-gray-100 pb-2">
                          <span className="text-gray-500">License Number</span>
                          <span className="font-medium text-gray-800">{doctor?.licenseNumber || 'N/A'}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm border-b border-gray-100 pb-2">
                          <span className="text-gray-500">Consultation Fee</span>
                          <span className="font-medium text-emerald-700">GHS {doctor?.consultationFee || '0.00'}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Status</span>
                          <span className={`font-medium ${doctor?.isAvailableForConsultation ? 'text-emerald-600' : 'text-red-600'}`}>
                            {doctor?.isAvailableForConsultation ? 'Available' : 'Unavailable'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {doctor?.qualifications?.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-2">
                          <FaGraduationCap className="text-emerald-600" size={14} /> Qualifications
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {doctor.qualifications.map((qual, i) => (
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

              {/* Stats Row */}
              <div className="border-t border-gray-100 bg-gray-50 px-6 md:px-8 py-5">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-800">{stats.totalAppointments || 0}</p>
                    <p className="text-xs text-gray-500">Total Patients</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-emerald-600">{stats.completedAppointments || 0}</p>
                    <p className="text-xs text-gray-500">Completed</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-amber-600">{stats.pendingAppointments || 0}</p>
                    <p className="text-xs text-gray-500">Pending</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-yellow-500">{reviewStats.average?.toFixed(1) || '0.0'}</p>
                    <p className="text-xs text-gray-500">Rating</p>
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
                {renderRatingBars()}
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
                {reviewStats.total > 5 && (
                  <Link to="/reviews" className="text-xs text-emerald-600 hover:text-emerald-700 font-medium">
                    View All
                  </Link>
                )}
              </div>

              {reviews.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-gray-400 text-sm">No reviews yet</p>
                  <p className="text-gray-400 text-xs mt-1">Be the first to review</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
                  {reviews.slice(0, 5).map((review, index) => (
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

            {/* Quick Stats Card */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-2xl p-5 text-white"
            >
              <h3 className="text-sm font-semibold text-white/90 uppercase tracking-wider mb-3">Quick Stats</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-white/80">Total Patients</span>
                  <span className="font-bold">{stats.totalAppointments || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/80">Completed</span>
                  <span className="font-bold text-emerald-200">{stats.completedAppointments || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/80">Pending</span>
                  <span className="font-bold text-yellow-200">{stats.pendingAppointments || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/80">Reviews</span>
                  <span className="font-bold">{reviewStats.total || 0}</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DoctorProfile