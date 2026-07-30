import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  FaSearch, FaEye, FaReply, FaTrash, FaSpinner,
  FaFilter, FaChevronDown, FaUser,
  FaEnvelope, FaPhone, FaCalendarAlt, FaTag
} from 'react-icons/fa'
import { contactApi } from '../../api/contact.api'
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

const AdminContacts = () => {
  const { user } = useAuth()
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [stats, setStats] = useState({})
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 })

  useEffect(() => {
    fetchContacts()
    fetchStats()
  }, [statusFilter, pagination.page])

  const fetchContacts = async () => {
    setLoading(true)
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit
      }
      if (statusFilter) params.status = statusFilter
      
      const response = await contactApi.getAll(params)
      setContacts(response.data.contacts || [])
      setPagination(response.data.pagination || { page: 1, limit: 20, total: 0, pages: 0 })
    } catch (error) {
      toast.error('Failed to load messages')
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await contactApi.getStats()
      setStats(response.data.stats || {})
    } catch (error) {
      toast.error('Failed to load stats')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this message?')) return
    try {
      await contactApi.delete(id)
      toast.success('Message deleted')
      fetchContacts()
    } catch (error) {
      toast.error('Failed to delete message')
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-700',
      'read': 'bg-blue-100 text-blue-700',
      'replied': 'bg-green-100 text-green-700',
      'resolved': 'bg-gray-100 text-gray-700'
    }
    return colors[status] || 'bg-gray-100 text-gray-700'
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

  const filteredContacts = contacts.filter(contact => {
    if (!search) return true
    const name = contact.name?.toLowerCase() || ''
    const email = contact.email?.toLowerCase() || ''
    const subject = contact.subject?.toLowerCase() || ''
    const term = search.toLowerCase()
    return name.includes(term) || email.includes(term) || subject.includes(term)
  })

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Messages</h1>
            <p className="text-sm text-gray-500 mt-1">
              {stats.total || 0} total • {stats.pending || 0} pending
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-3 text-center">
            <p className="text-xl font-bold text-gray-800">{stats.total || 0}</p>
            <p className="text-[10px] text-gray-500">Total</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-3 text-center">
            <p className="text-xl font-bold text-yellow-600">{stats.pending || 0}</p>
            <p className="text-[10px] text-gray-500">Pending</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-3 text-center">
            <p className="text-xl font-bold text-blue-600">{stats.read || 0}</p>
            <p className="text-[10px] text-gray-500">Read</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-3 text-center">
            <p className="text-xl font-bold text-green-600">{stats.replied || 0}</p>
            <p className="text-[10px] text-gray-500">Replied</p>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, or subject..."
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
            {(search || statusFilter) && (
              <button
                onClick={() => {
                  setSearch('')
                  setStatusFilter('')
                }}
                className="flex items-center gap-1 px-3 py-2 text-sm text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              >
                <FaX /> Clear
              </button>
            )}
          </div>

          {showFilters && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500/30"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="read">Read</option>
                <option value="replied">Replied</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
          )}
        </div>

        {filteredContacts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="text-5xl mb-4">📧</div>
            <p className="text-gray-500 text-sm">No messages found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredContacts.map((contact, index) => (
              <motion.div
                key={contact._id}
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
                        {contact.name?.[0] || 'U'}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{contact.name}</h3>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <FaEnvelope size={12} /> {contact.email}
                          </span>
                          {contact.phone && (
                            <span className="flex items-center gap-1">
                              <FaPhone size={12} /> {contact.phone}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-2">
                      <p className="text-sm font-medium text-gray-700">{contact.subject}</p>
                      <p className="text-sm text-gray-600 line-clamp-2">{contact.message}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <FaTag size={12} /> {contact.category}
                      </span>
                      <span className="flex items-center gap-1">
                        <FaCalendarAlt size={12} /> {formatDate(contact.createdAt)}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(contact.status)}`}>
                      {contact.status}
                    </span>

                    <Link
                      to={`/admin/contacts/${contact._id}`}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View"
                    >
                      <FaEye size={15} />
                    </Link>
                    <Link
                      to={`/admin/contacts/${contact._id}/reply`}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Reply"
                    >
                      <FaReply size={15} />
                    </Link>
                    <button
                      onClick={() => handleDelete(contact._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <FaTrash size={15} />
                    </button>
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

export default AdminContacts