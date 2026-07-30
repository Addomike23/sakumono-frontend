import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  FiCalendar, FiClock, FiMapPin, 
  FiVideo, FiPhone, FiSearch, FiFilter,
  FiChevronDown, FiX, FiEye, FiClock as FiClockIcon,
  FiCheckCircle, FiXCircle, FiCalendar as FiCalendarIcon,
  FiPlus
} from 'react-icons/fi'
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

const Appointments = () => {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [stats, setStats] = useState({
    total: 0,
    upcoming: 0,
    completed: 0,
    cancelled: 0,
    pending: 0
  })
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 })

  useEffect(() => {
    fetchAppointments()
  }, [statusFilter, pagination.page])

  const fetchAppointments = async () => {
    setLoading(true)
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit
      }
      if (statusFilter) params.status = statusFilter
      
      // Using getMine from appointmentsApi
      const response = await appointmentsApi.getMine(params)
      setAppointments(response.data.appointments || [])
      setStats({
        total: response.data.pagination?.total || 0,
        upcoming: response.data.upcomingCount || 0,
        completed: response.data.appointments?.filter(a => a.status === 'completed').length || 0,
        cancelled: response.data.appointments?.filter(a => a.status === 'cancelled').length || 0,
        pending: response.data.appointments?.filter(a => a.status === 'pending' || a.status === 'confirmed').length || 0
      })
      setPagination(response.data.pagination || { page: 1, limit: 10, total: 0, pages: 0 })
    } catch (error) {
      toast.error('Failed to load appointments')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async (id) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) return
    
    try {
      // Using cancel from appointmentsApi
      await appointmentsApi.cancel(id, 'Cancelled by patient')
      toast.success('Appointment cancelled')
      fetchAppointments()
    } catch (error) {
      toast.error('Failed to cancel appointment')
    }
  }

  const getStatusConfig = (status) => {
    const configs = {
      'pending': { 
        label: 'Pending', 
        color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        icon: FiClockIcon
      },
      'confirmed': { 
        label: 'Confirmed', 
        color: 'bg-green-100 text-green-700 border-green-200',
        icon: FiCheckCircle
      },
      'in-progress': { 
        label: 'In Progress', 
        color: 'bg-blue-100 text-blue-700 border-blue-200',
        icon: FiClockIcon
      },
      'completed': { 
        label: 'Completed', 
        color: 'bg-purple-100 text-purple-700 border-purple-200',
        icon: FiCheckCircle
      },
      'cancelled': { 
        label: 'Cancelled', 
        color: 'bg-red-100 text-red-700 border-red-200',
        icon: FiXCircle
      },
      'no-show': { 
        label: 'No Show', 
        color: 'bg-gray-100 text-gray-700 border-gray-200',
        icon: FiXCircle
      }
    }
    return configs[status] || configs['pending']
  }

  const getTypeIcon = (type) => {
    if (type === 'video') return <FiVideo className="text-blue-500" />
    if (type === 'phone') return <FiPhone className="text-green-500" />
    return <FiMapPin className="text-purple-500" />
  }

  const getTypeLabel = (type) => {
    if (type === 'video') return 'Video Call'
    if (type === 'phone') return 'Phone Call'
    return 'In-Person'
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const isUpcoming = (appointment) => {
    return appointment.status === 'pending' || appointment.status === 'confirmed'
  }

  if (loading && appointments.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading appointments...</p>
        </div>
      </div>
    )
  }

  const filteredAppointments = appointments.filter(apt => {
    if (!search) return true
    const doctorName = `${apt.doctor?.firstName || ''} ${apt.doctor?.lastName || ''}`.toLowerCase()
    return doctorName.includes(search.toLowerCase()) || 
           apt.reason?.toLowerCase().includes(search.toLowerCase())
  })

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">My Appointments</h1>
            <p className="text-sm text-gray-500 mt-1">
              {stats.upcoming} upcoming appointment{stats.upcoming !== 1 ? 's' : ''}
            </p>
          </div>
          <Link
            to="/patient/appointments/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors shadow-sm"
          >
            <FiPlus /> Book New
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 text-center">
            <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
            <p className="text-xs text-gray-500">Total</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{stats.upcoming}</p>
            <p className="text-xs text-gray-500">Upcoming</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 text-center">
            <p className="text-2xl font-bold text-purple-600">{stats.completed}</p>
            <p className="text-xs text-gray-500">Completed</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 text-center">
            <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
            <p className="text-xs text-gray-500">Cancelled</p>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by doctor or reason..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <FiFilter /> Filters
              <FiChevronDown className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
            {(search || statusFilter) && (
              <button
                onClick={() => {
                  setSearch('')
                  setStatusFilter('')
                  setPagination(prev => ({ ...prev, page: 1 }))
                }}
                className="flex items-center gap-1 px-3 py-2 text-sm text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              >
                <FiX /> Clear
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
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="in-progress">In Progress</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Appointments List */}
        {filteredAppointments.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="text-5xl mb-4">📅</div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">No appointments found</h3>
            <p className="text-gray-500 text-sm">
              {search || statusFilter ? 'Try adjusting your filters.' : 'Book your first appointment today.'}
            </p>
            {!search && !statusFilter && (
              <Link
                to="/patient/appointments/new"
                className="mt-4 inline-block text-green-600 hover:text-green-700 font-medium text-sm"
              >
                Book an appointment →
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAppointments.map((apt, index) => {
              const StatusConfig = getStatusConfig(apt.status)
              const StatusIcon = StatusConfig.icon
              const isUpcomingApt = isUpcoming(apt)

              return (
                <motion.div
                  key={apt._id}
                  initial="hidden"
                  animate="visible"
                  custom={index}
                  variants={fadeUp}
                  className={`bg-white rounded-xl border shadow-sm hover:shadow-md transition-shadow ${
                    isUpcomingApt ? 'border-l-4 border-l-green-500' : 'border-gray-200'
                  }`}
                >
                  <div className="p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      {/* Left - Doctor Info */}
                      <div className="flex-1 min-w-[200px]">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-semibold text-sm">
                            {apt.doctor?.firstName?.[0] || 'D'}{apt.doctor?.lastName?.[0] || ''}
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">
                              Dr. {apt.doctor?.firstName} {apt.doctor?.lastName}
                            </h3>
                            <p className="text-sm text-gray-500">{apt.doctor?.specialization || 'General'}</p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <FiCalendarIcon size={14} /> {formatDate(apt.date)}
                          </span>
                          <span className="flex items-center gap-1">
                            <FiClock size={14} /> {apt.timeSlot}
                          </span>
                          <span className="flex items-center gap-1 text-gray-400">
                            {getTypeIcon(apt.type)} {getTypeLabel(apt.type)}
                          </span>
                        </div>

                        <p className="text-sm text-gray-600 mt-1 line-clamp-1">
                          <span className="font-medium">Reason:</span> {apt.reason}
                        </p>
                      </div>

                      {/* Right - Status & Actions */}
                      <div className="flex flex-col items-end gap-2">
                        <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${StatusConfig.color}`}>
                          <StatusIcon size={12} /> {StatusConfig.label}
                        </span>

                        <div className="flex gap-2">
                          <Link
                            to={`/patient/appointments/${apt._id}`}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <FiEye size={16} />
                          </Link>
                          {isUpcomingApt && (
                            <>
                              <Link
                                to={`/patient/appointments/${apt._id}/reschedule`}
                                className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                                title="Reschedule"
                              >
                                <FiClockIcon size={16} />
                              </Link>
                              <button
                                onClick={() => handleCancel(apt._id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Cancel"
                              >
                                <FiXCircle size={16} />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Prescription indicator */}
                    {apt.prescription?.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
                          💊 Prescription available
                        </span>
                      </div>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              disabled={pagination.page === 1}
              className="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-sm text-gray-600">
              Page {pagination.page} of {pagination.pages}
            </span>
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page === pagination.pages}
              className="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Appointments