import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiShoppingCart, FiTrash2, FiMinus, FiPlus,
  FiArrowLeft, FiLock, FiTruck, FiShield,
  FiChevronRight, FiPackage, FiAlertCircle,
  FiX, FiCreditCard, FiSmartphone, FiHome,
  FiInfo, FiGift
} from 'react-icons/fi'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import { shopApi } from '../../api/shop.api'
import toast from 'react-hot-toast'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay: i * 0.06, ease: 'easeOut' },
  }),
}

const Cart = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    clearCart,
    getSubtotal,
    getTax,
    getDeliveryFee,
    getGrandTotal,
    getCartSummary,
    hasPrescriptionItems,
    getPrescriptionItems,
    isEmpty,
    totalItems
  } = useCart()

  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [deliveryAddress, setDeliveryAddress] = useState({
    street: '',
    city: '',
    state: '',
    pincode: '',
    country: 'Ghana'
  })
  const [deliveryInstructions, setDeliveryInstructions] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [prescriptionImage, setPrescriptionImage] = useState(null)
  const [prescriptionPreview, setPrescriptionPreview] = useState(null)
  const [showAddressForm, setShowAddressForm] = useState(false)

  const subtotal = getSubtotal()
  const tax = getTax()
  const deliveryFee = getDeliveryFee()
  const grandTotal = getGrandTotal()
  const summary = getCartSummary()
  const hasPrescription = hasPrescriptionItems()
  const prescriptionItems = getPrescriptionItems()

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(productId)
    } else {
      updateQuantity(productId, newQuantity)
    }
  }

  const handlePrescriptionUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB')
        return
      }
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file')
        return
      }
      setPrescriptionImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPrescriptionPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCheckout = async () => {
    if (!user) {
      toast.error('Please login to checkout')
      navigate('/login')
      return
    }

    if (cartItems.length === 0) {
      toast.error('Your cart is empty')
      return
    }

    if (!deliveryAddress.street || !deliveryAddress.city || !deliveryAddress.state) {
      toast.error('Please fill in your delivery address')
      setShowAddressForm(true)
      return
    }

    if (hasPrescription && !prescriptionImage) {
      toast.error('Please upload a prescription image for the prescription items')
      return
    }

    setIsCheckingOut(true)
    try {
      const formData = new FormData()
      
      // Build items array properly
      const orderItems = cartItems.map(item => ({
        productId: item._id,
        quantity: item.quantity
      }))
      
      // Send items as array - NOT JSON stringified
      formData.append('items', JSON.stringify(orderItems))
      
      // Add delivery details as JSON strings
      formData.append('deliveryAddress', JSON.stringify(deliveryAddress))
      formData.append('deliveryInstructions', deliveryInstructions)
      formData.append('paymentMethod', paymentMethod)
      formData.append('notes', `Total: GHS ${grandTotal.toFixed(2)}`)

      // Add prescription image if needed
      if (prescriptionImage) {
        formData.append('prescriptionImage', prescriptionImage)
      }

      const response = await shopApi.createOrder(formData)
      
      toast.success('Order placed successfully!')
      clearCart()
      navigate('/patient/orders')
    } catch (error) {
      
      toast.error(error.response?.data?.message || 'Failed to place order')
    } finally {
      setIsCheckingOut(false)
    }
  }

  if (isEmpty) {
    return (
      <div className="min-h-[70vh] bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center mx-auto mb-6">
            <FiShoppingCart size={40} className="text-gray-400" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-6">Browse our products and add items you need to your cart.</p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors"
          >
            <FiArrowLeft /> Start Shopping
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link to="/shop" className="text-sm text-gray-500 hover:text-emerald-600 flex items-center gap-1">
              <FiArrowLeft size={14} /> Continue Shopping
            </Link>
            <h1 className="text-2xl font-semibold text-gray-900 mt-1">Your Cart</h1>
            <p className="text-sm text-gray-500">{totalItems} items</p>
          </div>
          <button
            onClick={clearCart}
            className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700 transition-colors"
          >
            <FiTrash2 size={16} /> Clear Cart
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* ============================================================ */}
          {/* Cart Items */}
          {/* ============================================================ */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item, index) => {
              const itemPrice = item.discountPrice || item.price
              const itemTotal = itemPrice * item.quantity
              const isOutOfStock = item.stockQuantity === 0
              const isLowStock = item.stockQuantity > 0 && item.stockQuantity <= 5

              return (
                <motion.div
                  key={item._id}
                  initial="hidden"
                  animate="visible"
                  variants={fadeUp}
                  custom={index}
                  className="bg-white rounded-2xl border border-gray-200 p-4 hover:shadow-sm transition-shadow"
                >
                  <div className="flex gap-4">
                    {/* Image */}
                    <div className="w-24 h-24 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                      {item.featuredImage ? (
                        <img
                          src={item.featuredImage}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <FiPackage size={32} />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <Link to={`/shop/${item.slug}`}>
                            <h3 className="font-medium text-gray-900 hover:text-emerald-600 transition-colors line-clamp-1">
                              {item.name}
                            </h3>
                          </Link>
                          <p className="text-xs text-gray-400">{item.category}</p>
                          {item.requiresPrescription && (
                            <span className="inline-block text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full mt-1">
                              Rx Required
                            </span>
                          )}
                          {isLowStock && !isOutOfStock && (
                            <span className="inline-block text-xs px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full mt-1 ml-1">
                              Only {item.stockQuantity} left
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => removeFromCart(item._id)}
                          className="text-gray-400 hover:text-red-600 transition-colors p-1"
                        >
                          <FiX size={18} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-3">
                          <span className="font-['IBM_Plex_Mono'] font-semibold text-gray-900">
                            GHS {itemPrice.toFixed(2)}
                          </span>
                          {item.discountPrice && (
                            <span className="text-xs text-gray-400 line-through">
                              GHS {item.price.toFixed(2)}
                            </span>
                          )}
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center border border-gray-200 rounded-lg">
                          <button
                            onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="px-3 py-1.5 hover:bg-gray-50 transition-colors disabled:opacity-40"
                          >
                            <FiMinus size={14} />
                          </button>
                          <span className="w-10 text-center font-['IBM_Plex_Mono'] text-sm">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                            disabled={isOutOfStock || item.quantity >= item.stockQuantity}
                            className="px-3 py-1.5 hover:bg-gray-50 transition-colors disabled:opacity-40"
                          >
                            <FiPlus size={14} />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-50">
                        <span className="text-xs text-gray-400">Item total</span>
                        <span className="font-['IBM_Plex_Mono'] text-sm font-medium text-gray-900">
                          GHS {itemTotal.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}

            {/* Prescription Notice */}
            {hasPrescription && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <FiAlertCircle className="text-amber-600 mt-0.5" size={18} />
                  <div>
                    <p className="text-sm font-medium text-amber-800">Prescription Required</p>
                    <p className="text-sm text-amber-700">
                      The following items require a prescription. Please upload your prescription at checkout.
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {prescriptionItems.map(item => (
                        <span key={item._id} className="text-xs px-2 py-1 bg-white/80 rounded-full text-amber-700">
                          {item.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ============================================================ */}
          {/* Order Summary */}
          {/* ============================================================ */}
          <div className="lg:col-span-1">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="bg-white rounded-2xl border border-gray-200 p-6 sticky top-24"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-['IBM_Plex_Mono'] font-medium text-gray-900">
                    GHS {subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Tax (5%)</span>
                  <span className="font-['IBM_Plex_Mono'] font-medium text-gray-900">
                    GHS {tax.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Delivery Fee</span>
                  <span className="font-['IBM_Plex_Mono'] font-medium text-gray-900">
                    {deliveryFee === 0 ? 'FREE' : `GHS ${deliveryFee.toFixed(2)}`}
                  </span>
                </div>
                {subtotal >= 200 && (
                  <div className="flex items-center gap-1 text-xs text-emerald-600">
                    <FiGift size={12} /> Free delivery applied
                  </div>
                )}
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between text-base font-semibold">
                    <span className="text-gray-900">Total</span>
                    <span className="font-['IBM_Plex_Mono'] text-emerald-600 text-lg">
                      GHS {grandTotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowAddressForm(!showAddressForm)}
                  className="flex items-center justify-between w-full text-sm text-gray-600 hover:text-emerald-600 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <FiHome size={16} />
                    Delivery Address
                  </span>
                  <FiChevronRight className={`transition-transform ${showAddressForm ? 'rotate-90' : ''}`} />
                </button>

                {showAddressForm && (
                  <div className="mt-3 space-y-3">
                    <input
                      type="text"
                      placeholder="Street Address *"
                      value={deliveryAddress.street}
                      onChange={(e) => setDeliveryAddress(prev => ({ ...prev, street: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="City *"
                        value={deliveryAddress.city}
                        onChange={(e) => setDeliveryAddress(prev => ({ ...prev, city: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
                      />
                      <input
                        type="text"
                        placeholder="State/Region *"
                        value={deliveryAddress.state}
                        onChange={(e) => setDeliveryAddress(prev => ({ ...prev, state: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="Pincode"
                      value={deliveryAddress.pincode}
                      onChange={(e) => setDeliveryAddress(prev => ({ ...prev, pincode: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
                    />
                  </div>
                )}
              </div>

              {/* Delivery Instructions */}
              <div className="mt-3">
                <input
                  type="text"
                  placeholder="Delivery instructions (optional)"
                  value={deliveryInstructions}
                  onChange={(e) => setDeliveryInstructions(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
                />
              </div>

              {/* Payment Method */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Payment Method</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setPaymentMethod('cash')}
                    className={`px-3 py-2 rounded-lg border text-sm transition-colors ${
                      paymentMethod === 'cash'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                    }`}
                  >
                    <FiCreditCard className="mx-auto mb-1" size={18} />
                    Cash
                  </button>
                  <button
                    onClick={() => setPaymentMethod('mobile_money')}
                    className={`px-3 py-2 rounded-lg border text-sm transition-colors ${
                      paymentMethod === 'mobile_money'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                    }`}
                  >
                    <FiSmartphone className="mx-auto mb-1" size={18} />
                    Mobile
                  </button>
                  <button
                    onClick={() => setPaymentMethod('card')}
                    className={`px-3 py-2 rounded-lg border text-sm transition-colors ${
                      paymentMethod === 'card'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                    }`}
                  >
                    <FiLock className="mx-auto mb-1" size={18} />
                    Card
                  </button>
                </div>
              </div>

              {/* Prescription Upload */}
              {hasPrescription && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Prescription Upload *
                  </label>
                  {prescriptionPreview ? (
                    <div className="relative">
                      <img
                        src={prescriptionPreview}
                        alt="Prescription"
                        className="w-full h-32 object-cover rounded-lg border border-gray-200"
                      />
                      <button
                        onClick={() => {
                          setPrescriptionImage(null)
                          setPrescriptionPreview(null)
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                      >
                        <FiX size={14} />
                      </button>
                    </div>
                  ) : (
                    <label className="block w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-center cursor-pointer hover:border-emerald-400 transition-colors">
                      <FiUpload className="mx-auto text-gray-400 mb-1" size={24} />
                      <span className="text-xs text-gray-500">Upload prescription image</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePrescriptionUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                  <p className="text-xs text-gray-400 mt-1">JPG, PNG (Max 5MB)</p>
                </div>
              )}

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                disabled={isCheckingOut || cartItems.length === 0}
                className="w-full mt-6 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isCheckingOut ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <FiLock size={18} />
                    Place Order • GHS {grandTotal.toFixed(2)}
                  </>
                )}
              </button>

              {/* Trust badges */}
              <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs text-gray-400">
                <div className="flex flex-col items-center">
                  <FiShield size={16} className="mb-1" />
                  <span>Secure</span>
                </div>
                <div className="flex flex-col items-center">
                  <FiTruck size={16} className="mb-1" />
                  <span>Delivery</span>
                </div>
                <div className="flex flex-col items-center">
                  <FiPackage size={16} className="mb-1" />
                  <span>Authentic</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cart