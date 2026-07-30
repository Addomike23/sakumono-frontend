import React, { createContext, useState, useContext, useEffect } from 'react'
import toast from 'react-hot-toast'

const CartContext = createContext()

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [totalItems, setTotalItems] = useState(0)
  const [totalPrice, setTotalPrice] = useState(0)

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart)
        setCartItems(parsed)
      } catch (error) {
        setCartItems([])
      }
    }
  }, [])

  // Save cart to localStorage and update totals whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems))
    
    // Update totals
    const items = cartItems.reduce((sum, item) => sum + item.quantity, 0)
    const price = cartItems.reduce((sum, item) => {
      const itemPrice = item.discountPrice || item.price
      return sum + (itemPrice * item.quantity)
    }, 0)
    
    setTotalItems(items)
    setTotalPrice(price)
  }, [cartItems])

  /**
   * Add item to cart
   * @param {Object} product - Product to add
   * @param {number} quantity - Quantity to add (default: 1)
   */
  const addToCart = (product, quantity = 1) => {
    if (!product || !product._id) {
      toast.error('Invalid product')
      return false
    }

    if (product.stockQuantity === 0) {
      toast.error('Product is out of stock')
      return false
    }

    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item._id === product._id)
      
      if (existingItem) {
        // Check if adding more exceeds stock
        const newQuantity = existingItem.quantity + quantity
        if (newQuantity > product.stockQuantity) {
          toast.error(`Only ${product.stockQuantity} units available in stock`)
          return prevItems
        }
        
        // Update quantity
        const updated = prevItems.map(item =>
          item._id === product._id
            ? { ...item, quantity: newQuantity }
            : item
        )
        toast.success(`Updated ${product.name} quantity to ${newQuantity}`)
        return updated
      } else {
        // Check if quantity exceeds stock
        if (quantity > product.stockQuantity) {
          toast.error(`Only ${product.stockQuantity} units available in stock`)
          return prevItems
        }
        
        // Add new item
        toast.success(`${product.name} added to cart`)
        return [...prevItems, { 
          ...product, 
          quantity: quantity,
          addedAt: new Date().toISOString()
        }]
      }
    })
    
    return true
  }

  /**
   * Remove item from cart
   * @param {string} productId - ID of product to remove
   */
  const removeFromCart = (productId) => {
    if (!productId) {
      toast.error('Invalid product ID')
      return false
    }

    const item = cartItems.find(item => item._id === productId)
    if (item) {
      setCartItems(prevItems => prevItems.filter(item => item._id !== productId))
      toast.success(`${item.name} removed from cart`)
      return true
    }
    
    toast.error('Item not found in cart')
    return false
  }

  /**
   * Update item quantity
   * @param {string} productId - ID of product to update
   * @param {number} newQuantity - New quantity (must be >= 1)
   */
  const updateQuantity = (productId, newQuantity) => {
    if (!productId) {
      toast.error('Invalid product ID')
      return false
    }

    if (newQuantity < 1) {
      removeFromCart(productId)
      return true
    }

    const item = cartItems.find(item => item._id === productId)
    if (!item) {
      toast.error('Item not found in cart')
      return false
    }

    if (newQuantity > item.stockQuantity) {
      toast.error(`Only ${item.stockQuantity} units available in stock`)
      return false
    }

    setCartItems(prevItems =>
      prevItems.map(item =>
        item._id === productId
          ? { ...item, quantity: newQuantity }
          : item
      )
    )
    
    toast.success(`Updated quantity to ${newQuantity}`)
    return true
  }

  /**
   * Clear entire cart
   */
  const clearCart = () => {
    if (cartItems.length === 0) {
      toast.info('Cart is already empty')
      return false
    }
    
    setCartItems([])
    toast.success('Cart cleared')
    return true
  }

  /**
   * Get quantity of a specific item in cart
   * @param {string} productId - ID of product
   * @returns {number} Quantity in cart
   */
  const getItemQuantity = (productId) => {
    if (!productId) return 0
    const item = cartItems.find(item => item._id === productId)
    return item?.quantity || 0
  }

  /**
   * Check if item is in cart
   * @param {string} productId - ID of product
   * @returns {boolean} True if in cart
   */
  const isInCart = (productId) => {
    if (!productId) return false
    return cartItems.some(item => item._id === productId)
  }

  /**
   * Get subtotal (before tax and delivery)
   * @returns {number} Subtotal
   */
  const getSubtotal = () => {
    return cartItems.reduce((sum, item) => {
      const price = item.discountPrice || item.price
      return sum + (price * item.quantity)
    }, 0)
  }

  /**
   * Get tax amount
   * @param {number} rate - Tax rate (default: 0.05 = 5%)
   * @returns {number} Tax amount
   */
  const getTax = (rate = 0.05) => {
    return getSubtotal() * rate
  }

  /**
   * Get delivery fee
   * @returns {number} Delivery fee
   */
  const getDeliveryFee = () => {
    const subtotal = getSubtotal()
    if (subtotal === 0) return 0
    if (subtotal >= 200) return 0 // Free delivery for orders over GHS 200
    return 10 // Flat rate of GHS 10
  }

  /**
   * Get grand total (subtotal + tax + delivery)
   * @param {number} taxRate - Tax rate (default: 0.05)
   * @returns {number} Grand total
   */
  const getGrandTotal = (taxRate = 0.05) => {
    return getSubtotal() + getTax(taxRate) + getDeliveryFee()
  }

  /**
   * Get cart summary
   * @returns {Object} Cart summary
   */
  const getCartSummary = () => {
    return {
      items: cartItems,
      totalItems,
      totalPrice,
      subtotal: getSubtotal(),
      tax: getTax(),
      deliveryFee: getDeliveryFee(),
      grandTotal: getGrandTotal(),
      itemCount: cartItems.length
    }
  }

  /**
   * Check if any item requires prescription
   * @returns {boolean} True if any item requires prescription
   */
  const hasPrescriptionItems = () => {
    return cartItems.some(item => item.requiresPrescription)
  }

  /**
   * Get items that require prescription
   * @returns {Array} Items requiring prescription
   */
  const getPrescriptionItems = () => {
    return cartItems.filter(item => item.requiresPrescription)
  }

  /**
   * Get total items count (sum of all quantities)
   * @returns {number} Total items
   */
  const getTotalItemsCount = () => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0)
  }

  const value = {
    // State
    cartItems,
    isLoading,
    totalItems,
    totalPrice,
    
    // Core actions
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    
    // Helper functions
    getItemQuantity,
    isInCart,
    getSubtotal,
    getTax,
    getDeliveryFee,
    getGrandTotal,
    getCartSummary,
    hasPrescriptionItems,
    getPrescriptionItems,
    getTotalItemsCount,
    
    // Derived state
    isEmpty: cartItems.length === 0,
    itemCount: cartItems.length
  }

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}

export default CartContext