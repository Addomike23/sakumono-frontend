import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  FaSearch, FaTrash, FaSpinner, FaEnvelope,
  FaUser, FaCalendarAlt, FaCheckCircle, FaTimesCircle,
  FaDownload, FaPlus
} from 'react-icons/fa'
import { subscriptionApi } from '../../api/subscriptionApi'
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

const AdminSubscribers = () => {
  const { user } = useAuth()
  const [subscribers, setSubscribers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [stats, setStats] = useState({})
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 })

  useEffect(() => {
    fetchSubscribers()
    fetchStats()
  }, [pagination.page])

  const fetchSubscribers = async () => {
    setLoading(true)
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit
      }
      
      const response = await subscriptionApi.getAll(params)
      setSubscribers(response.data.subscribers || [])
      setPagination(response.data.pagination || { page: 1, limit: 20, total: 0, pages: 0 })
    } catch (error) {
      toast.error('Failed to load subscribers')
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await subscriptionApi.getStats()
      setStats(response.data.stats || {})
    } catch (error) {
      toast.error('Failed to load stats')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to remove this subscriber?')) return
    try {
      await subscriptionApi.unsubscribe(id)
      toast.success('Subscriber removed')
      fetchSubscribers()
    } catch (error) {
      toast.error('Failed to remove subscriber')
    }
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

  const filteredSubscribers = subscribers.filter(sub => {
    if (!search) return true
    const email = sub.email?.toLowerCase() || ''
    const name = sub.name?.toLowerCase() || ''
    return email.includes(search.toLowerCase()) || name.includes(search.toLowerCase())
  })

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Subscribers</h1>
            <p className="text-sm text-gray-500 mt-1">
              {stats.total || 0} total • {stats.active || 0} active
            </p>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors">
              <FaDownload /> Export
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 transition-colors shadow-sm">
              <FaPlus /> Add Bulk
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-3 text-center">
            <p className="text-xl font-bold text-gray-800">{stats.total || 0}</p>
            <p className="text-[10px] text-gray-500">Total</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-3 text-center">
            <p className="text-xl font-bold text-green-600">{stats.active || 0}</p>
            <p className="text-[10px] text-gray-500">Active</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-3 text-center">
            <p className="text-xl font-bold text-red-600">{stats.inactive || 0}</p>
            <p className="text-[10px] text-gray-500">Inactive</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-3 text-center">
            <p className="text-xl font-bold text-blue-600">{stats.verified || 0}</p>
            <p className="text-[10px] text-gray-500">Verified</p>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-6">
          <div className="relative flex-1">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search subscribers by email or name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500/30"
            />
          </div>
        </div>

        {filteredSubscribers.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="text-5xl mb-4">📧</div>
            <p className="text-gray-500 text-sm">No subscribers found</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subscriber</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredSubscribers.map((sub, index) => (
                    <motion.tr
                      key={sub._id}
                      initial="hidden"
                      animate="visible"
                      custom={index}
                      variants={fadeUp}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-sm font-semibold">
                            {sub.name?.[0] || 'S'}
                          </div>
                          <span className="text-sm font-medium text-gray-900">{sub.name || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{sub.email}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          sub.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {sub.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{formatDate(sub.createdAt)}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleDelete(sub._id)}
                          className="text-red-600 hover:text-red-800"
                          title="Remove"
                        >
                          <FaTrash size={15} />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
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

export default AdminSubscribers