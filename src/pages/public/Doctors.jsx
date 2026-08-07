import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FiSearch, FiUser, FiStar, FiMapPin, FiClock,
  FiFilter, FiChevronDown, FiX, FiAward,
  FiPhone, FiMail, FiCheckCircle,
  FiXCircle, FiUserCheck
} from 'react-icons/fi'
import { doctorsApi } from '../../api/doctors.api'
import { reviewsApi } from '../../api/reviews.api'
import toast from 'react-hot-toast'

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.08, ease: 'easeOut' },
  }),
}

const Doctors = () => {
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSpecialization, setSelectedSpecialization] = useState('')
  const [specializations, setSpecializations] = useState([])
  const [pagination, setPagination] = useState({ page: 1, limit: 8, total: 0, pages: 0 })
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    fetchDoctors()
    fetchSpecializations()
  }, [searchTerm, selectedSpecialization, pagination.page])

  const fetchDoctors = async () => {
    setLoading(true)
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit
      }
      if (searchTerm) params.search = searchTerm
      if (selectedSpecialization) params.specialization = selectedSpecialization

      const response = await doctorsApi.getAll(params)
      setDoctors(response.data.doctors || [])
      setPagination(response.data.pagination || { page: 1, limit: 8, total: 0, pages: 0 })
    } catch (error) {
      toast.error('Failed to load doctors')
    } finally {
      setLoading(false)
    }
  }

  const fetchSpecializations = async () => {
    try {
      const response = await doctorsApi.getSpecializations()
      setSpecializations(response.data.specializations || [])
    } catch (error) {
      toast.error("failed to fecth specialization")
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setPagination(prev => ({ ...prev, page: 1 }))
    fetchDoctors()
  }

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedSpecialization('')
    setPagination(prev => ({ ...prev, page: 1 }))
    fetchDoctors()
  }

  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <FiStar
            key={star}
            className={`${star <= Math.round(rating || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
            size={14}
          />
        ))}
      </div>
    )
  }

  if (loading && doctors.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading doctors...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-6">
        {/* ============================================================ */}
        {/* HERO SECTION */}
        {/* ============================================================ */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <span className="text-green-600 font-semibold text-sm uppercase tracking-wider">
            Our Team
          </span>
          <h1 className="mt-3 text-4xl md:text-5xl font-bold text-gray-900">
            Our <span className="text-green-600">Doctors</span>
          </h1>
          <div className="w-24 h-1 bg-green-600 mx-auto mt-4 rounded-full" />
          <p className="mt-4 text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Our team of highly qualified and experienced medical professionals is dedicated to providing exceptional care with compassion and expertise.
          </p>
        </motion.div>

        {/* ============================================================ */}
        {/* SEARCH & FILTERS */}
        {/* ============================================================ */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-10">
          <div className="flex flex-col md:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex-1 relative">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or specialization..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition"
              />
            </form>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-6 py-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <FiFilter /> Filters
              <FiChevronDown className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
            {(searchTerm || selectedSpecialization) && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 px-4 py-3 rounded-xl text-sm text-green-600 hover:bg-green-50 transition-colors"
              >
                <FiX /> Clear
              </button>
            )}
          </div>

          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Specialization
                  </label>
                  <select
                    value={selectedSpecialization}
                    onChange={(e) => setSelectedSpecialization(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition"
                  >
                    <option value="">All Specializations</option>
                    {specializations.map((spec) => (
                      <option key={spec} value={spec}>{spec}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ============================================================ */}
        {/* RESULTS COUNT */}
        {/* ============================================================ */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-gray-500">
            {pagination.total > 0 ? (
              <>Showing {((pagination.page - 1) * pagination.limit) + 1}-
                {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} doctors</>
            ) : (
              'No doctors found'
            )}
          </p>
        </div>

        {/* ============================================================ */}
        {/* DOCTORS GRID - Professional Card Layout */}
        {/* ============================================================ */}
        {doctors.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 shadow-sm">
            <div className="text-6xl mb-4">👨‍⚕️</div>
            <h3 className="text-xl font-medium text-gray-800 mb-2">No doctors found</h3>
            <p className="text-gray-500">Try adjusting your search or filters.</p>
            <button
              onClick={clearFilters}
              className="mt-4 text-green-600 hover:text-green-700 font-medium"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {doctors.map((doctor, index) => {
              const doctorId = doctor.user?._id || doctor._id
              const firstName = doctor.user?.firstName || 'N/A'
              const lastName = doctor.user?.lastName || ''
              const specialization = doctor.specialization || 'General'
              const yearsOfExperience = doctor.yearsOfExperience || 0
              const consultationFee = doctor.consultationFee || 0
              const rating = doctor.rating || 0
              const totalReviews = doctor.totalReviews || 0
              const isAvailable = doctor.isAvailableForConsultation !== false
              const bio = doctor.bio || 'Experienced medical professional dedicated to providing quality healthcare.'
              const profileImage = doctor.user?.profileImage

              return (
                <motion.div
                  key={doctor._id}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.3 }}
                  variants={fadeUp}
                  custom={index}
                  className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 group overflow-hidden"
                >
                  {/* Image Section - FIXED */}
                  <Link to={`/doctors/${doctorId}`} className="block">
                    <div className="aspect-[4/4] bg-gradient-to-br from-green-50 to-blue-50 overflow-hidden relative">
                      {profileImage ? (
                        <img
                          src={profileImage}
                          alt={`${firstName} ${lastName}`}
                          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                          onError={(e) => {
                            // If image fails to load, show fallback
                            e.target.style.display = 'none'
                            // Show fallback icon
                            const parent = e.target.parentElement
                            const fallback = document.createElement('div')
                            fallback.className = 'w-full h-full flex items-center justify-center text-6xl text-green-300'
                            fallback.innerHTML = '<svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" height="60" width="60" xmlns="http://www.w3.org/2000/svg"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>'
                            parent.appendChild(fallback)
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-6xl text-green-300">
                          <FiUser />
                        </div>
                      )}

                      {/* Availability Badge */}
                      <div className="absolute top-3 right-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border backdrop-blur-sm ${isAvailable
                            ? 'bg-green-50/90 border-green-200 text-green-700'
                            : 'bg-red-50/90 border-red-200 text-red-700'
                          }`}>
                          {isAvailable ? (
                            <><FiCheckCircle className="inline mr-1" size={12} /> Available</>
                          ) : (
                            <><FiXCircle className="inline mr-1" size={12} /> Unavailable</>
                          )}
                        </span>
                      </div>

                      {/* Rating Badge */}
                      {rating > 0 && (
                        <div className="absolute bottom-3 left-3 px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm text-xs font-medium text-gray-700 flex items-center gap-1 border border-gray-100">
                          <FiStar className="text-yellow-400 fill-yellow-400" size={12} />
                          {rating.toFixed(1)}
                          <span className="text-gray-400 text-[10px]">({totalReviews})</span>
                        </div>
                      )}

                      {/* Experience Badge */}
                      <div className="absolute bottom-3 right-3 px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm text-xs font-medium text-gray-700 border border-gray-100">
                        <FiAward className="inline mr-1 text-green-500" size={12} />
                        {yearsOfExperience} yrs
                      </div>
                    </div>
                  </Link>

                  {/* Content */}
                  <div className="p-5">
                    <Link to={`/doctors/${doctorId}`}>
                      <h3 className="font-semibold text-lg text-gray-900 group-hover:text-green-700 transition-colors">
                        Dr. {firstName} {lastName}
                      </h3>
                    </Link>
                    <p className="text-green-600 text-sm font-medium mt-0.5">{specialization}</p>

                    {/* Bio */}
                    <p className="text-gray-500 text-sm mt-3 line-clamp-2 leading-relaxed">
                      {bio}
                    </p>

                    {/* Rating */}
                    <div className="mt-3 flex items-center gap-1">
                      {renderStars(rating)}
                      <span className="text-xs text-gray-400 ml-1">({totalReviews})</span>
                    </div>

                    {/* Contact & Fee */}
                    <div className="mt-3 flex items-center justify-between text-sm">
                      <span className="text-gray-500">
                        Fee: <span className="font-medium text-gray-700">GHS {consultationFee}</span>
                      </span>
                      <span className="flex items-center gap-1 text-gray-400">
                        <FiPhone size={12} /> {doctor.user?.phone || 'N/A'}
                      </span>
                    </div>

                    {/* Book Appointment Button */}
                    <Link
                      to={`/doctors/${doctorId}`}
                      className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 transition-colors shadow-sm group-hover:shadow-md"
                    >
                      <FiClock size={16} /> View Profile
                    </Link>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}

        {/* ============================================================ */}
        {/* PAGINATION */}
        {/* ============================================================ */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10">
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              disabled={pagination.page === 1}
              className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              ← Previous
            </button>
            <span className="px-4 py-2 text-sm text-gray-600">
              Page {pagination.page} of {pagination.pages}
            </span>
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page === pagination.pages}
              className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Doctors