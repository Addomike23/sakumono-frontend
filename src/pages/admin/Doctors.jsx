import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  FaSearch, FaUserMd, FaEdit, FaTrash, FaEye,
 FaPlus, FaStar, FaCheckCircle, FaTimesCircle,
  FaFilter, FaChevronDown, FaPhone, FaEnvelope
} from 'react-icons/fa'
import { doctorsApi } from '../../api/doctors.api'
import { usersApi } from '../../api/users.api'
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

const AdminDoctors = () => {
  const { user } = useAuth()
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [specializationFilter, setSpecializationFilter] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [stats, setStats] = useState({ totalDoctors: 0, availableDoctors: 0, unavailableDoctors: 0 })
  const [specializations, setSpecializations] = useState([])
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 })
  const [updating, setUpdating] = useState(null)

  useEffect(() => {
    fetchDoctors()
    fetchSpecializations()
  }, [search, specializationFilter, pagination.page])

  const fetchDoctors = async () => {
    setLoading(true)
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit
      }
      if (search) params.search = search
      if (specializationFilter) params.specialization = specializationFilter
      
      const response = await doctorsApi.getAllAdmin(params)
      
      
      setDoctors(response.data.doctors || [])
      setStats({
        totalDoctors: response.data.stats?.totalDoctors || 0,
        availableDoctors: response.data.stats?.availableDoctors || 0,
        unavailableDoctors: response.data.stats?.unavailableDoctors || 0
      })
      setPagination(response.data.pagination || { page: 1, limit: 20, total: 0, pages: 0 })
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
      toast.error('Failed to load specializations')
    }
  }

  const handleToggleStatus = async (doctorId, currentStatus) => {
    if (updating === doctorId) return
    
    setUpdating(doctorId)
    try {
      await doctorsApi.updateStatus(doctorId, !currentStatus)
      toast.success(`Doctor ${currentStatus ? 'unavailable' : 'available'} successfully`)
      fetchDoctors()
    } catch (error) {
     
      toast.error(error.response?.data?.message || 'Failed to update status')
    } finally {
      setUpdating(null)
    }
  }

  const handleDelete = async (doctorId) => {
    if (!confirm('Are you sure you want to delete this doctor?')) return
    try {
      await usersApi.delete(doctorId)
      toast.success('Doctor deleted')
      fetchDoctors()
    } catch (error) {
     
      toast.error(error.response?.data?.message || 'Failed to delete doctor')
    }
  }

  // Get the doctor ID from the doctor object
  const getDoctorId = (doctor) => {
    return doctor.user?._id || doctor._id || doctor.user?.id || doctor.id
  }

  // Get the doctor name
  const getDoctorName = (doctor) => {
    const firstName = doctor.user?.firstName || doctor.firstName || 'Unknown'
    const lastName = doctor.user?.lastName || doctor.lastName || ''
    return `Dr. ${firstName} ${lastName}`
  }

  // Get the doctor email
  const getDoctorEmail = (doctor) => {
    return doctor.user?.email || doctor.email || 'N/A'
  }

  // Get the doctor phone
  const getDoctorPhone = (doctor) => {
    return doctor.user?.phone || doctor.phone || 'N/A'
  }

  // Get the doctor initials
  const getDoctorInitials = (doctor) => {
    const firstName = doctor.user?.firstName || doctor.firstName || 'D'
    const lastName = doctor.user?.lastName || doctor.lastName || ''
    return `${firstName[0]}${lastName[0] || ''}`
  }

  // Check if doctor is available
  const isDoctorAvailable = (doctor) => {
    return doctor.isAvailableForConsultation !== undefined 
      ? doctor.isAvailableForConsultation 
      : doctor.isAvailable !== undefined 
        ? doctor.isAvailable 
        : false
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <FaStar className="animate-spin text-3xl text-emerald-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Doctors</h1>
            <p className="text-sm text-gray-500 mt-1">
              {stats.totalDoctors} total • {stats.availableDoctors} available
            </p>
          </div>
          <Link
            to="/admin/doctors/add"
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors shadow-sm"
          >
            <FaPlus /> Add Doctor
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-3 text-center">
            <p className="text-xl font-bold text-gray-800">{stats.totalDoctors}</p>
            <p className="text-[10px] text-gray-500">Total Doctors</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-3 text-center">
            <p className="text-xl font-bold text-emerald-600">{stats.availableDoctors}</p>
            <p className="text-[10px] text-gray-500">Available</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-3 text-center">
            <p className="text-xl font-bold text-red-600">{stats.unavailableDoctors}</p>
            <p className="text-[10px] text-gray-500">Unavailable</p>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search doctors..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <FaFilter /> Filters
              <FaChevronDown className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
            {(search || specializationFilter) && (
              <button
                onClick={() => {
                  setSearch('')
                  setSpecializationFilter('')
                }}
                className="flex items-center gap-1 px-3 py-2 text-sm text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
              >
                Clear
              </button>
            )}
          </div>

          {showFilters && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <select
                value={specializationFilter}
                onChange={(e) => setSpecializationFilter(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              >
                <option value="">All Specializations</option>
                {specializations.map((spec) => (
                  <option key={spec} value={spec}>{spec}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {doctors.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="text-5xl mb-4">👨‍⚕️</div>
            <p className="text-gray-500 text-sm">No doctors found</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {doctors.map((doctor, index) => {
              const doctorId = getDoctorId(doctor)
              const isAvailable = isDoctorAvailable(doctor)
              const name = getDoctorName(doctor)
              const email = getDoctorEmail(doctor)
              const phone = getDoctorPhone(doctor)
              const initials = getDoctorInitials(doctor)
              
              return (
                <motion.div
                  key={doctorId || index}
                  initial="hidden"
                  animate="visible"
                  custom={index}
                  variants={fadeUp}
                  className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-5"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-lg">
                        {initials}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {name}
                        </h3>
                        <p className="text-sm text-blue-600">{doctor.specialization || 'General'}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Link 
                        to={`/admin/doctors/${doctorId}`} 
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" 
                        title="View"
                      >
                        <FaEye size={14} />
                      </Link>
                      <button 
                        onClick={() => handleDelete(doctorId)} 
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors" 
                        title="Delete"
                      >
                        <FaTrash size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                    <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                      isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {isAvailable ? <FaCheckCircle size={12} /> : <FaTimesCircle size={12} />}
                      {isAvailable ? 'Available' : 'Unavailable'}
                    </span>
                    <span className="flex items-center gap-1 text-yellow-500">
                      <FaStar size={12} /> {doctor.rating?.toFixed(1) || '0.0'}
                    </span>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-500">{doctor.appointmentCount || 0} patients</span>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><FaPhone size={12} /> {phone}</span>
                    <span className="flex items-center gap-1"><FaEnvelope size={12} /> {email}</span>
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-100 flex gap-2">
                    <button
                      onClick={() => handleToggleStatus(doctorId, isAvailable)}
                      disabled={updating === doctorId}
                      className={`flex-1 text-center px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        isAvailable 
                          ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' 
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      } disabled:opacity-50`}
                    >
                      {updating === doctorId ? 'Updating...' : (isAvailable ? 'Set Unavailable' : 'Set Available')}
                    </button>
                    <Link
                      to={`/admin/doctors/${doctorId}/edit`}
                      className="flex-1 text-center px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium hover:bg-gray-200 transition-colors"
                    >
                      <FaEdit className="inline mr-1" size={12} /> Edit
                    </Link>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}

        {pagination.pages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              disabled={pagination.page === 1}
              className="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-sm text-gray-600">
              Page {pagination.page} of {pagination.pages}
            </span>
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page === pagination.pages}
              className="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminDoctors