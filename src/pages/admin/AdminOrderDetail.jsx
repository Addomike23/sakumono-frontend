import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FaArrowLeft, FaSpinner, FaSave, FaPrint,
  FaBox, FaTruck, FaCheckCircle, FaTimesCircle,
  FaClock, FaUser, FaCalendarAlt, FaMapMarkerAlt,
  FaPhone, FaEnvelope, FaTag, FaDollarSign,
  FaShoppingCart, FaPrescription, FaFileInvoice
} from 'react-icons/fa'
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

const AdminOrderDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [staffNotes, setStaffNotes] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')

  const statusOptions = [
    { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-700' },
    { value: 'confirmed', label: 'Confirmed', color: 'bg-blue-100 text-blue-700' },
    { value: 'processing', label: 'Processing', color: 'bg-purple-100 text-purple-700' },
    { value: 'shipped', label: 'Shipped', color: 'bg-indigo-100 text-indigo-700' },
    { value: 'delivered', label: 'Delivered', color: 'bg-green-100 text-green-700' },
    { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-700' },
    { value: 'refunded', label: 'Refunded', color: 'bg-gray-100 text-gray-700' }
  ]

  useEffect(() => {
    fetchOrder()
  }, [id])

  const fetchOrder = async () => {
    setLoading(true)
    try {
      const response = await shopApi.getOrderById(id)
      setOrder(response.data.order)
      setSelectedStatus(response.data.order.status)
      setStaffNotes(response.data.order.staffNotes || '')
    } catch (error) {
      toast.error('Failed to load order')
      navigate('/admin/orders')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async () => {
    if (!selectedStatus) {
      toast.error('Please select a status')
      return
    }

    setUpdating(true)
    try {
      await shopApi.updateOrderStatus(id, {
        status: selectedStatus,
        staffNotes: staffNotes
      })
      toast.success(`Order status updated to ${selectedStatus}`)
      fetchOrder() // Refresh order data
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update order status')
    } finally {
      setUpdating(false)
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-700',
      'confirmed': 'bg-blue-100 text-blue-700',
      'processing': 'bg-purple-100 text-purple-700',
      'shipped': 'bg-indigo-100 text-indigo-700',
      'delivered': 'bg-green-100 text-green-700',
      'cancelled': 'bg-red-100 text-red-700',
      'refunded': 'bg-gray-100 text-gray-700'
    }
    return colors[status] || 'bg-gray-100 text-gray-700'
  }

  const getStatusIcon = (status) => {
    if (status === 'delivered') return <FaCheckCircle className="text-green-600" size={16} />
    if (status === 'cancelled') return <FaTimesCircle className="text-red-600" size={16} />
    if (status === 'shipped') return <FaTruck className="text-indigo-600" size={16} />
    if (status === 'processing') return <FaBox className="text-purple-600" size={16} />
    return <FaClock className="text-yellow-600" size={16} />
  }

  const formatDate = (date) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusTimeline = () => {
    const timeline = []
    const statuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered']
    const currentIndex = statuses.indexOf(order?.status)
    
    statuses.forEach((status, index) => {
      timeline.push({
        status,
        completed: index <= currentIndex,
        active: index === currentIndex,
        label: status.charAt(0).toUpperCase() + status.slice(1),
        date: order?.status === status ? order?.updatedAt : null
      })
    })
    
    // Add cancelled if applicable
    if (order?.status === 'cancelled' || order?.status === 'refunded') {
      timeline.push({
        status: order?.status,
        completed: true,
        active: true,
        label: order?.status.charAt(0).toUpperCase() + order?.status.slice(1),
        date: order?.updatedAt
      })
    }
    
    return timeline
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <FaSpinner className="animate-spin text-3xl text-emerald-600" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">Order not found</p>
        <Link to="/admin/orders" className="text-emerald-600 hover:text-emerald-700 mt-2 inline-block">
          Back to Orders
        </Link>
      </div>
    )
  }

  const timeline = getStatusTimeline()

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <Link to="/admin/orders" className="text-gray-600 hover:text-gray-800">
              <FaArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Order #{order.orderNumber}
              </h1>
              <p className="text-sm text-gray-500">
                Placed on {formatDate(order.createdAt)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <FaPrint size={14} /> Print
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* ============================================================ */}
          {/* Main Content */}
          {/* ============================================================ */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status Timeline */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="bg-white rounded-xl border border-gray-200 shadow-sm p-6"
            >
              <h2 className="font-semibold text-gray-900 mb-4">Order Status</h2>
              <div className="relative">
                {timeline.map((item, index) => (
                  <div key={item.status} className="flex items-start gap-4 mb-4 last:mb-0">
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        item.completed 
                          ? item.active 
                            ? 'bg-emerald-600 text-white' 
                            : 'bg-emerald-100 text-emerald-600'
                          : 'bg-gray-200 text-gray-400'
                      }`}>
                        {item.completed ? <FaCheckCircle size={16} /> : <FaClock size={16} />}
                      </div>
                      {index < timeline.length - 1 && (
                        <div className={`w-0.5 h-8 ${
                          item.completed && timeline[index + 1].completed 
                            ? 'bg-emerald-400' 
                            : 'bg-gray-200'
                        }`} />
                      )}
                    </div>
                    <div className="flex-1 pt-1">
                      <p className={`font-medium ${
                        item.active ? 'text-emerald-600' : 'text-gray-700'
                      }`}>
                        {item.label}
                      </p>
                      {item.date && (
                        <p className="text-xs text-gray-400">{formatDate(item.date)}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Order Items */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="bg-white rounded-xl border border-gray-200 shadow-sm p-6"
            >
              <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FaShoppingCart className="text-emerald-600" /> Order Items
              </h2>
              <div className="space-y-3">
                {order.items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <div className="flex items-center gap-3">
                      {item.product?.featuredImage ? (
                        <img
                          src={item.product.featuredImage}
                          alt={item.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                          <FaBox size={20} />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{item.name}</p>
                        <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900 font-['IBM_Plex_Mono'] text-sm">
                        GHS {(item.price * item.quantity).toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-400">GHS {item.price.toFixed(2)} each</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-['IBM_Plex_Mono'] font-medium text-gray-900">
                    GHS {order.subtotal?.toFixed(2) || '0.00'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Tax (5%)</span>
                  <span className="font-['IBM_Plex_Mono'] font-medium text-gray-900">
                    GHS {order.tax?.toFixed(2) || '0.00'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Delivery Fee</span>
                  <span className="font-['IBM_Plex_Mono'] font-medium text-gray-900">
                    GHS {order.deliveryFee?.toFixed(2) || '0.00'}
                  </span>
                </div>
                <div className="flex justify-between text-base font-semibold pt-2 border-t border-gray-200">
                  <span className="text-gray-900">Total</span>
                  <span className="font-['IBM_Plex_Mono'] text-emerald-600">
                    GHS {order.total?.toFixed(2) || '0.00'}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* ============================================================ */}
          {/* Sidebar */}
          {/* ============================================================ */}
          <div className="lg:col-span-1 space-y-6">
            {/* Status Update */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="bg-white rounded-xl border border-gray-200 shadow-sm p-6"
            >
              <h2 className="font-semibold text-gray-900 mb-4">Update Status</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Status
                  </label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
                  >
                    {statusOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Staff Notes
                  </label>
                  <textarea
                    value={staffNotes}
                    onChange={(e) => setStaffNotes(e.target.value)}
                    rows="3"
                    placeholder="Add notes about this update..."
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
                  />
                </div>

                <button
                  onClick={handleStatusUpdate}
                  disabled={updating}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50"
                >
                  {updating ? <FaSpinner className="animate-spin" /> : <FaSave />}
                  Update Status
                </button>

                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <FaClock size={12} />
                  Last updated: {formatDate(order.updatedAt)}
                </div>
              </div>
            </motion.div>

            {/* Patient Info */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="bg-white rounded-xl border border-gray-200 shadow-sm p-6"
            >
              <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FaUser className="text-emerald-600" /> Patient Info
              </h2>
              <div className="space-y-3">
                <p className="font-medium text-gray-900">
                  {order.patient?.firstName} {order.patient?.lastName}
                </p>
                <p className="flex items-center gap-2 text-sm text-gray-600">
                  <FaEnvelope size={14} className="text-gray-400" />
                  {order.patient?.email || 'N/A'}
                </p>
                <p className="flex items-center gap-2 text-sm text-gray-600">
                  <FaPhone size={14} className="text-gray-400" />
                  {order.patient?.phone || 'N/A'}
                </p>
              </div>
            </motion.div>

            {/* Delivery Address */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="bg-white rounded-xl border border-gray-200 shadow-sm p-6"
            >
              <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FaMapMarkerAlt className="text-emerald-600" /> Delivery Address
              </h2>
              {order.deliveryAddress ? (
                <div className="space-y-1 text-sm text-gray-600">
                  <p>{order.deliveryAddress.street}</p>
                  <p>{order.deliveryAddress.city}, {order.deliveryAddress.state}</p>
                  <p>{order.deliveryAddress.pincode}</p>
                  <p>{order.deliveryAddress.country}</p>
                  {order.deliveryInstructions && (
                    <p className="text-xs text-gray-400 mt-2">
                      Instructions: {order.deliveryInstructions}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-400">No delivery address provided</p>
              )}
            </motion.div>

            {/* Payment Info */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="bg-white rounded-xl border border-gray-200 shadow-sm p-6"
            >
              <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FaDollarSign className="text-emerald-600" /> Payment Info
              </h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Method</span>
                  <span className="text-gray-900 font-medium">
                    {order.paymentMethod || 'Cash'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Status</span>
                  <span className={`font-medium ${
                    order.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'
                  }`}>
                    {order.paymentStatus || 'pending'}
                  </span>
                </div>
                {order.prescriptionImage && (
                  <div className="mt-2 pt-2 border-t border-gray-100">
                    <p className="text-xs text-gray-400 mb-1">Prescription</p>
                    <a
                      href={order.prescriptionImage}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-600 hover:text-emerald-700 text-sm flex items-center gap-1"
                    >
                      <FaPrescription size={14} /> View Prescription
                    </a>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Staff Notes Display */}
            {order.staffNotes && (
              <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                className="bg-gray-50 rounded-xl border border-gray-200 p-6"
              >
                <h2 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <FaFileInvoice className="text-emerald-600" /> Staff Notes
                </h2>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{order.staffNotes}</p>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminOrderDetail