import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  FaBell, FaCalendarCheck, FaEnvelope, FaInfoCircle,
  FaCheckCircle, FaTimesCircle, FaSpinner, FaTrash,
  FaCheckDouble, FaEye, FaClock, FaUserMd,
  FaPrescription, FaShoppingBag, FaStar
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

const PatientNotifications = () => {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)
  const [filter, setFilter] = useState('all')
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 })

  useEffect(() => {
    fetchNotifications()
  }, [pagination.page, filter])

  const fetchNotifications = async () => {
    setLoading(true)
    try {
      const params = { page: pagination.page, limit: pagination.limit }
      if (filter === 'unread') params.isRead = false
      if (filter === 'read') params.isRead = true
      
      const response = await notificationsApi.getAll(params)
      setNotifications(response.data.notifications || [])
      setUnreadCount(response.data.unreadCount || 0)
      setPagination(response.data.pagination || { page: 1, limit: 20, total: 0, pages: 0 })
    } catch (error) {
      toast.error('Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = async (id) => {
    try {
      await notificationsApi.markAsRead({ notificationIds: [id] })
      fetchNotifications()
    } catch (error) {
      toast.error('Failed to mark as read')
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsApi.markAsRead({ markAll: true })
      toast.success('All notifications marked as read')
      fetchNotifications()
    } catch (error) {
      toast.error('Failed to mark all as read')
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

  const getTypeIcon = (type) => {
    const icons = {
      'appointment': FaCalendarCheck,
      'reminder': FaClock,
      'message': FaEnvelope,
      'system': FaInfoCircle,
      'prescription': FaPrescription,
      'order': FaShoppingBag,
      'review': FaStar,
    }
    const Icon = icons[type] || FaBell
    return <Icon className="text-blue-500" size={16} />
  }

  const getTypeBg = (type) => {
    const colors = {
      'appointment': 'bg-blue-50',
      'reminder': 'bg-yellow-50',
      'message': 'bg-green-50',
      'system': 'bg-purple-50',
      'prescription': 'bg-indigo-50',
      'order': 'bg-orange-50',
      'review': 'bg-pink-50',
    }
    return colors[type] || 'bg-gray-50'
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
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
              <FaBell className="text-yellow-500" /> Notifications
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors shadow-sm text-sm"
            >
              <FaCheckDouble /> Mark All as Read
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { value: 'all', label: 'All', count: pagination.total },
            { value: 'unread', label: 'Unread', count: unreadCount },
            { value: 'read', label: 'Read', count: pagination.total - unreadCount },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setFilter(option.value)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filter === option.value
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {option.label} ({option.count})
            </button>
          ))}
        </div>

        {/* Notifications List */}
        {notifications.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="text-5xl mb-4">🔔</div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">All caught up!</h3>
            <p className="text-gray-500 text-sm">No notifications to show.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification, index) => {
              const isUnread = !notification.isRead
              return (
                <motion.div
                  key={notification._id}
                  initial="hidden"
                  animate="visible"
                  custom={index}
                  variants={fadeUp}
                  className={`bg-white rounded-xl border shadow-sm hover:shadow-md transition-all ${
                    isUnread ? 'border-l-4 border-l-green-500' : 'border-gray-200'
                  } p-4`}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`p-2.5 rounded-full ${getTypeBg(notification.type)} flex-shrink-0`}>
                      {getTypeIcon(notification.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {notification.title}
                            {isUnread && (
                              <span className="ml-2 inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                            )}
                          </h4>
                          <p className="text-sm text-gray-600 mt-0.5">{notification.message}</p>
                        </div>
                        <span className="text-xs text-gray-400 whitespace-nowrap">
                          {formatTime(notification.createdAt)}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap gap-3 mt-3">
                        {notification.data?.link && (
                          <Link
                            to={notification.data.link}
                            className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                          >
                            <FaEye size={12} /> View Details
                          </Link>
                        )}
                        {isUnread && (
                          <button
                            onClick={() => handleMarkAsRead(notification._id)}
                            className="text-xs text-green-600 hover:text-green-700 font-medium flex items-center gap-1"
                          >
                            <FaCheckCircle size={12} /> Mark as Read
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(notification._id)}
                          className="text-xs text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
                        >
                          <FaTrash size={12} /> Delete
                        </button>
                      </div>
                    </div>
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

export default PatientNotifications