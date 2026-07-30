import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  FaSearch, FaEye, FaSpinner, FaCalendarAlt, 
  FaClock, FaUser, FaCheckCircle, FaTimesCircle,
  FaFilter, FaChevronDown, FaClipboardList,
  FaPhone, FaEnvelope, FaVideo, FaMapMarkerAlt
} from 'react-icons/fa'
import { appointmentsApi } from '../../api/appointments.api'
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

const DoctorAppointments = () => {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0
  })
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 })

  useEffect(() => {
    fetchAppointments()
  }, [statusFilter, dateFilter, pagination.page])

  const fetchAppointments = async () => {
    setLoading(true)
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit
      }
      if (statusFilter) params.status = statusFilter
      if (dateFilter) params.date = dateFilter
      
      const response = await appointmentsApi.getForDoctor(params)
      console.log('Appointments response:', response.data)
      setAppointments(response.data.appointments || [])
      setStats({
        total: response.data.pagination?.total || 0,
        pending: response.data.appointments?.filter(a => a.status === 'pending').length || 0,
        confirmed: response.data.appointments?.filter(a => a.status === 'confirmed').length || 0,
        completed: response.data.appointments?.filter(a => a.status === 'completed').length || 0,
        cancelled: response.data.appointments?.filter(a => a.status === 'cancelled').length || 0
      })
      setPagination(response.data.pagination || { page: 1, limit: 10, total: 0, pages: 0 })
    } catch (error) {
      console.error('Fetch appointments error:', error)
      toast.error('Failed to load appointments')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (id, status) => {
    try {
      await appointmentsApi.update(id, { status })
      toast.success(`Appointment ${status}`)
      fetchAppointments()
    } catch (error) {
      console.error('Update status error:', error)
      toast.error('Failed to update appointment')
    }
  }

  const getStatusColor = (status) => {
    if (status === 'confirmed') return 'bg-green-100 text-green-700'
    if (status === 'pending') return 'bg-yellow-100 text-yellow-700'
    if (status === 'in-progress') return 'bg-blue-100 text-blue-700'
    if (status === 'completed') return 'bg-purple-100 text-purple-700'
    if (status === 'cancelled') return 'bg-red-100 text-red-700'
    return 'bg-gray-100 text-gray-700'
  }

  const getTypeIcon = (type) => {
    if (type === 'video') return <FaVideo className="text-blue-500" />
    if (type === 'phone') return <FaPhone className="text-green-500" />
    return <FaMapMarkerAlt className="text-purple-500" />
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <FaSpinner className="animate-spin text-3xl text-green-600" />
      </div>
    )
  }

  const filteredAppointments = appointments.filter(apt => {
    if (!search) return true
    const patientName = `${apt.patient?.firstName || ''} ${apt.patient?.lastName || ''}`.toLowerCase()
    return patientName.includes(search.toLowerCase()) || apt.reason?.toLowerCase().includes(search.toLowerCase())
  })

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">My Appointments</h1>
            <p className="text-sm text-gray-500 mt-1">
              {stats.total} total • {stats.pending} pending • {stats.confirmed} confirmed
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-3 text-center">
            <p className="text-xl font-bold text-gray-800">{stats.total}</p>
            <p className="text-[10px] text-gray-500">Total</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-3 text-center">
            <p className="text-xl font-bold text-yellow-600">{stats.pending}</p>
            <p className="text-[10px] text-gray-500">Pending</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-3 text-center">
            <p className="text-xl font-bold text-green-600">{stats.confirmed}</p>
            <p className="text-[10px] text-gray-500">Confirmed</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-3 text-center">
            <p className="text-xl font-bold text-purple-600">{stats.completed}</p>
            <p className="text-[10px] text-gray-500">Completed</p>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by patient name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500/30"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <FaFilter /> Filters
              <FaChevronDown className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
            {(search || statusFilter || dateFilter) && (
              <button
                onClick={() => {
                  setSearch('')
                  setStatusFilter('')
                  setDateFilter('')
                }}
                className="flex items-center gap-1 px-3 py-2 text-sm text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              >
                <FaX /> Clear
              </button>
            )}
          </div>

          {showFilters && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="flex flex-wrap gap-3">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500/30"
                >
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500/30"
                />
              </div>
            </div>
          )}
        </div>

        {filteredAppointments.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="text-5xl mb-4">📅</div>
            <p className="text-gray-500 text-sm">No appointments found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAppointments.map((apt, index) => (
              <motion.div
                key={apt._id}
                initial="hidden"
                animate="visible"
                custom={index}
                variants={fadeUp}
                className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex-1 min-w-[200px]">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm">
                        {apt.patient?.firstName?.[0] || 'P'}{apt.patient?.lastName?.[0] || ''}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {apt.patient?.firstName} {apt.patient?.lastName}
                        </h3>
                        <p className="text-sm text-gray-500">{apt.reason}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <FaCalendarAlt size={14} /> {formatDate(apt.date)}
                      </span>
                      <span className="flex items-center gap-1">
                        <FaClock size={14} /> {apt.timeSlot}
                      </span>
                      <span className="flex items-center gap-1 text-gray-400">
                        {getTypeIcon(apt.type)} {apt.type}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(apt.status)}`}>
                      {apt.status}
                    </span>

                    {apt.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(apt._id, 'confirmed')}
                          className="px-3 py-1 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700 transition-colors"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(apt._id, 'cancelled')}
                          className="px-3 py-1 bg-red-600 text-white rounded-lg text-xs font-medium hover:bg-red-700 transition-colors"
                        >
                          Cancel
                        </button>
                      </>
                    )}

                    {apt.status === 'confirmed' && (
                      <button
                        onClick={() => handleUpdateStatus(apt._id, 'in-progress')}
                        className="px-3 py-1 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors"
                      >
                        Start
                      </button>
                    )}

                    {apt.status === 'in-progress' && (
                      <button
                        onClick={() => handleUpdateStatus(apt._id, 'completed')}
                        className="px-3 py-1 bg-purple-600 text-white rounded-lg text-xs font-medium hover:bg-purple-700 transition-colors"
                      >
                        Complete
                      </button>
                    )}

                    <Link
                      to={`/doctor/appointments/${apt._id}`}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <FaEye size={16} />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
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

export default DoctorAppointments