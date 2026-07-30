import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  FaBell, FaTrash, FaSpinner, FaEye,
  FaSearch, FaFilter, FaChevronDown,
  FaCalendarAlt, FaUser, FaCheckCircle, FaTimesCircle,
  FaEnvelope, FaClock, FaPlus,
  FaXbox
} from 'react-icons/fa'
import { notificationsApi } from '../../api/notifications.api'
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

const AdminNotifications = () => {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [stats, setStats] = useState({})
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 })

  useEffect(() => {
    fetchNotifications()
    fetchStats()
  }, [typeFilter, pagination.page])

  const fetchNotifications = async () => {
    setLoading(true)
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit
      }
      if (typeFilter) params.type = typeFilter
      
      const response = await notificationsApi.getAllAdmin(params)
      setNotifications(response.data.notifications || [])
      setPagination(response.data.pagination || { page: 1, limit: 20, total: 0, pages: 0 })
    } catch (error) {
      toast.error('Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await notificationsApi.getStats()
      setStats(response.data.stats || {})
    } catch (error) {
      console.error('Failed to load stats')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this notification?')) return
    try {
      await notificationsApi.delete(id)
      toast.success('Notification deleted')
      fetchNotifications()
    } catch (error) {
      toast.error('Failed to delete notification')
    }
  }

  const getTypeBg = (type) => {
    const colors = {
      'appointment': 'bg-blue-50',
      'reminder': 'bg-yellow-50',
      'message': 'bg-green-50',
      'system': 'bg-purple-50',
      'payment': 'bg-orange-50'
    }
    return colors[type] || 'bg-gray-50'
  }

  const getTypeIcon = (type) => {
    if (type === 'appointment') return <FaBell className="text-blue-500" />
    if (type === 'reminder') return <FaClock className="text-yellow-500" />
    if (type === 'message') return <FaEnvelope className="text-green-500" />
    if (type === 'system') return <FaUser className="text-purple-500" />
    return <FaBell className="text-gray-500" />
  }

  const formatTime = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <FaSpinner className="animate-spin text-3xl text-green-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Notifications</h1>
            <p className="text-sm text-gray-500 mt-1">
              {stats.total || 0} total • {stats.unread || 0} unread
            </p>
          </div>
          <Link
            to="/admin/notifications/send"
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors shadow-sm"
          >
            <FaPlus /> Send Notification
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-3 text-center">
            <p className="text-xl font-bold text-gray-800">{stats.total || 0}</p>
            <p className="text-[10px] text-gray-500">Total</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-3 text-center">
            <p className="text-xl font-bold text-yellow-600">{stats.unread || 0}</p>
            <p className="text-[10px] text-gray-500">Unread</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-3 text-center">
            <p className="text-xl font-bold text-green-600">{stats.read || 0}</p>
            <p className="text-[10px] text-gray-500">Read</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-3 text-center">
            <p className="text-xl font-bold text-blue-600">{stats.byType?.length || 0}</p>
            <p className="text-[10px] text-gray-500">Types</p>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search notifications..."
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
            {(search || typeFilter) && (
              <button
                onClick={() => {
                  setSearch('')
                  setTypeFilter('')
                }}
                className="flex items-center gap-1 px-3 py-2 text-sm text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              >
                <FaXbox /> Clear
              </button>
            )}
          </div>

          {showFilters && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500/30"
              >
                <option value="">All Types</option>
                <option value="appointment">Appointment</option>
                <option value="reminder">Reminder</option>
                <option value="message">Message</option>
                <option value="system">System</option>
                <option value="payment">Payment</option>
              </select>
            </div>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="text-5xl mb-4">🔔</div>
            <p className="text-gray-500 text-sm">No notifications found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification, index) => (
              <motion.div
                key={notification._id}
                initial="hidden"
                animate="visible"
                custom={index}
                variants={fadeUp}
                className="bg-white rounded-xl border shadow-sm hover:shadow-md transition-all p-4"
              >
                <div className="flex items-start gap-4">
                  <div className={`p-2.5 rounded-full ${getTypeBg(notification.type)} flex-shrink-0`}>
                    {getTypeIcon(notification.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {notification.title}
                          {!notification.isRead && (
                            <span className="ml-2 inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                          )}
                        </h4>
                        <p className="text-sm text-gray-600 mt-0.5">{notification.message}</p>
                        <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <FaUser size={12} /> {notification.user?.firstName || 'N/A'}
                          </span>
                          <span className="flex items-center gap-1">
                            <FaCalendarAlt size={12} /> {formatTime(notification.createdAt)}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-xs ${
                            notification.isRead ? 'bg-gray-100 text-gray-600' : 'bg-green-100 text-green-700'
                          }`}>
                            {notification.isRead ? 'Read' : 'Unread'}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDelete(notification._id)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete"
                      >
                        <FaTrash size={15} />
                      </button>
                    </div>
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

export default AdminNotifications