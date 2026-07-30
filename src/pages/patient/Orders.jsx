import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  FiPackage, FiEye, FiSearch, FiFilter,
  FiChevronDown, FiX, FiCalendar, FiClock,
  FiCheckCircle, FiXCircle, FiClock as FiClockIcon,
  FiTruck, FiBox, FiShoppingBag,
  FiDownload, FiPrinter, FiFileText
} from 'react-icons/fi'
import { shopApi } from '../../api/shop.api'
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

const Orders = () => {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    processing: 0,
    delivered: 0,
    cancelled: 0
  })
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 })

  useEffect(() => {
    fetchOrders()
  }, [statusFilter, pagination.page])

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit
      }
      if (statusFilter) params.status = statusFilter
      
      const response = await shopApi.getMyOrders(params)
      setOrders(response.data.orders || [])
      setStats({
        total: response.data.stats?.total || 0,
        pending: response.data.stats?.pending || 0,
        processing: response.data.stats?.processing || 0,
        delivered: response.data.stats?.delivered || 0,
        cancelled: response.data.stats?.cancelled || 0
      })
      setPagination(response.data.pagination || { page: 1, limit: 10, total: 0, pages: 0 })
    } catch (error) {
      toast.error('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  const getStatusConfig = (status) => {
    const configs = {
      'pending': { 
        label: 'Pending', 
        color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        icon: FiClockIcon,
        description: 'Order received, waiting for confirmation'
      },
      'confirmed': { 
        label: 'Confirmed', 
        color: 'bg-blue-100 text-blue-700 border-blue-200',
        icon: FiCheckCircle,
        description: 'Order confirmed by pharmacy'
      },
      'processing': { 
        label: 'Processing', 
        color: 'bg-purple-100 text-purple-700 border-purple-200',
        icon: FiBox,
        description: 'Preparing your order'
      },
      'shipped': { 
        label: 'Shipped', 
        color: 'bg-indigo-100 text-indigo-700 border-indigo-200',
        icon: FiTruck,
        description: 'Your order is on the way'
      },
      'delivered': { 
        label: 'Delivered', 
        color: 'bg-green-100 text-green-700 border-green-200',
        icon: FiCheckCircle,
        description: 'Order delivered successfully'
      },
      'cancelled': { 
        label: 'Cancelled', 
        color: 'bg-red-100 text-red-700 border-red-200',
        icon: FiXCircle,
        description: 'Order cancelled'
      },
      'refunded': { 
        label: 'Refunded', 
        color: 'bg-gray-100 text-gray-700 border-gray-200',
        icon: FiXCircle,
        description: 'Amount refunded'
      }
    }
    return configs[status] || configs['pending']
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading && orders.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading orders...</p>
        </div>
      </div>
    )
  }

  const filteredOrders = orders.filter(order => {
    if (!search) return true
    const orderNumber = order.orderNumber?.toLowerCase() || ''
    const items = order.items?.map(item => item.name?.toLowerCase() || '').join(' ')
    return orderNumber.includes(search.toLowerCase()) || items.includes(search.toLowerCase())
  })

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">My Orders</h1>
            <p className="text-sm text-gray-500 mt-1">
              {stats.total} total order{stats.total !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors">
              <FiPrinter size={16} /> Print
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors">
              <FiDownload size={16} /> Export
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-3 text-center">
            <p className="text-xl font-bold text-gray-800">{stats.total}</p>
            <p className="text-[10px] text-gray-500">Total</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-3 text-center">
            <p className="text-xl font-bold text-yellow-600">{stats.pending}</p>
            <p className="text-[10px] text-gray-500">Pending</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-3 text-center">
            <p className="text-xl font-bold text-purple-600">{stats.processing}</p>
            <p className="text-[10px] text-gray-500">Processing</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-3 text-center">
            <p className="text-xl font-bold text-green-600">{stats.delivered}</p>
            <p className="text-[10px] text-gray-500">Delivered</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-3 text-center">
            <p className="text-xl font-bold text-red-600">{stats.cancelled}</p>
            <p className="text-[10px] text-gray-500">Cancelled</p>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by order number or product..."
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
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="text-5xl mb-4">📦</div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">No orders found</h3>
            <p className="text-gray-500 text-sm">
              {search || statusFilter ? 'Try adjusting your filters.' : 'Start shopping to place your first order.'}
            </p>
            {!search && !statusFilter && (
              <Link
                to="/shop"
                className="mt-4 inline-block text-green-600 hover:text-green-700 font-medium text-sm"
              >
                Browse pharmacy →
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order, index) => {
              const StatusConfig = getStatusConfig(order.status)
              const StatusIcon = StatusConfig.icon
              const itemCount = order.items?.length || 0

              return (
                <motion.div
                  key={order._id}
                  initial="hidden"
                  animate="visible"
                  custom={index}
                  variants={fadeUp}
                  className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                >
                  {/* Order Header */}
                  <div className="p-4 bg-gray-50 border-b border-gray-100 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <FiPackage className="text-gray-400" />
                      <span className="font-medium text-gray-900">#{order.orderNumber}</span>
                      <span className="text-sm text-gray-500">
                        {formatDate(order.createdAt)} at {formatTime(order.createdAt)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${StatusConfig.color}`}>
                        <StatusIcon size={12} /> {StatusConfig.label}
                      </span>
                      <span className="text-sm font-bold text-gray-900">
                        GHS {order.total?.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Order Body */}
                  <div className="p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      {/* Items */}
                      <div className="flex-1 min-w-[200px]">
                        <div className="space-y-1">
                          {order.items?.slice(0, 3).map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between text-sm">
                              <span className="text-gray-700">
                                {item.name} <span className="text-gray-400">x{item.quantity}</span>
                              </span>
                              <span className="text-gray-900 font-medium">
                                GHS {(item.price * item.quantity).toFixed(2)}
                              </span>
                            </div>
                          ))}
                          {itemCount > 3 && (
                            <p className="text-sm text-gray-400">+ {itemCount - 3} more items</p>
                          )}
                        </div>

                        {order.deliveryAddress && (
                          <p className="text-sm text-gray-500 mt-2 flex items-center gap-1">
                            <FiTruck size={14} />
                            Deliver to: {order.deliveryAddress.street}, {order.deliveryAddress.city}
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Link
                          to={`/patient/orders/${order._id}`}
                          className="flex items-center gap-1 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm"
                        >
                          <FiEye size={14} /> View Details
                        </Link>
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

export default Orders