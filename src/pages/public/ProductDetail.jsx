import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FiArrowLeft, FiShoppingCart, FiHeart, FiShare2,
  FiStar, FiClock, FiPackage, FiCheck, FiAlertCircle,
  FiMinus, FiPlus, FiTruck, FiShield, FiRefreshCw,
  FiChevronLeft, FiChevronRight
} from 'react-icons/fi'
import { shopApi } from '../../api/shop.api'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.06, ease: 'easeOut' },
  }),
}

const ProductDetail = () => {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { addToCart, getItemQuantity } = useCart()
  
  const [product, setProduct] = useState(null)
  const [relatedProducts, setRelatedProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    fetchProduct()
    window.scrollTo(0, 0)
  }, [slug])

  const fetchProduct = async () => {
    setLoading(true)
    try {
      const response = await shopApi.getProductBySlug(slug)
      const data = response.data
      setProduct(data.product)
      setRelatedProducts(data.relatedProducts || [])
    } catch (error) {
      console.error('Failed to fetch product:', error)
      toast.error('Product not found')
      navigate('/shop')
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = () => {
    if (!product) return
    
    const currentQty = getItemQuantity(product._id)
    if (currentQty + quantity > product.stockQuantity) {
      toast.error('Not enough stock available')
      return
    }
    if (product.stockQuantity === 0) {
      toast.error('Product is out of stock')
      return
    }
    
    addToCart(product, quantity)
    toast.success(`${quantity} × ${product.name} added to cart`)
  }

  const handleQuantityChange = (change) => {
    const newQty = quantity + change
    if (newQty < 1) return
    if (product && newQty > product.stockQuantity) {
      toast.error('Not enough stock available')
      return
    }
    setQuantity(newQty)
  }

  const formatPrice = (price) => {
    return `GH₵ ${price?.toFixed(2) || '0.00'}`
  }

  const renderStars = (rating) => {
    const filled = Math.round(rating || 0)
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <FiStar
            key={star}
            className={`${star <= filled ? 'text-[#B8863E] fill-[#B8863E]' : 'text-gray-300'}`}
            size={16}
          />
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-[#F3F5F3]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#E3E7E4] border-t-[#2F5D50] mx-auto"></div>
          <p className="mt-4 text-sm text-[#62726D]">Loading product…</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-[#F3F5F3]">
        <div className="text-center">
          <div className="text-6xl mb-4">📦</div>
          <h2 className="text-2xl font-medium text-[#16241F]">Product not found</h2>
          <p className="text-[#62726D] mt-2">The product you're looking for doesn't exist.</p>
          <Link to="/shop" className="mt-4 inline-flex items-center gap-2 text-[#2F5D50] hover:text-[#1F4038]">
            <FiArrowLeft /> Back to Shop
          </Link>
        </div>
      </div>
    )
  }

  const images = product.images && product.images.length > 0 ? product.images : [product.featuredImage]
  const isOutOfStock = product.stockQuantity === 0
  const inCartQty = getItemQuantity(product._id)

  return (
    <div className="min-h-screen bg-[#F3F5F3] py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-[#62726D] mb-6">
          <Link to="/shop" className="hover:text-[#2F5D50] transition-colors">Shop</Link>
          <span>/</span>
          <Link to={`/shop?category=${encodeURIComponent(product.category)}`} className="hover:text-[#2F5D50] transition-colors">
            {product.category}
          </Link>
          <span>/</span>
          <span className="text-[#16241F]">{product.name}</span>
        </nav>

        <div className="bg-white rounded-2xl border border-[#E3E7E4] overflow-hidden">
          <div className="grid md:grid-cols-2 gap-8 p-6 md:p-8">
            {/* ============================================================ */}
            {/* Image Gallery */}
            {/* ============================================================ */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="space-y-4"
            >
              {/* Main Image */}
              <div className="aspect-square bg-[#F3F5F3] rounded-xl overflow-hidden relative">
                {images.length > 0 && images[currentImageIndex] ? (
                  <img
                    src={images[currentImageIndex]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#62726D]/30">
                    <FiPackage size={64} />
                  </div>
                )}
                
                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                  {product.discountPrice && (
                    <span className="px-3 py-1 rounded-full bg-[#B8863E] text-white text-xs font-medium">
                      Sale
                    </span>
                  )}
                  {product.requiresPrescription && (
                    <span className="px-3 py-1 rounded-full bg-[#16241F] text-white text-xs font-medium">
                      Rx Required
                    </span>
                  )}
                </div>

                {/* Image Navigation Arrows */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentImageIndex(prev => prev === 0 ? images.length - 1 : prev - 1)}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 rounded-full p-2 shadow-lg hover:bg-white transition-colors"
                    >
                      <FiChevronLeft size={20} />
                    </button>
                    <button
                      onClick={() => setCurrentImageIndex(prev => prev === images.length - 1 ? 0 : prev + 1)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 rounded-full p-2 shadow-lg hover:bg-white transition-colors"
                    >
                      <FiChevronRight size={20} />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-20 h-20 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-colors ${
                        index === currentImageIndex ? 'border-[#2F5D50]' : 'border-transparent'
                      }`}
                    >
                      <img
                        src={img}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* ============================================================ */}
            {/* Product Info */}
            {/* ============================================================ */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="space-y-6"
            >
              {/* Category */}
              <span className="text-sm font-medium text-[#2F5D50] bg-[#2F5D50]/10 px-3 py-1 rounded-full inline-block">
                {product.category}
              </span>

              {/* Title */}
              <h1 className="font-['Fraunces'] text-3xl md:text-4xl text-[#16241F] leading-tight">
                {product.name}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-3">
                {renderStars(product.rating)}
                <span className="text-sm text-[#62726D]">
                  ({product.reviews?.length || 0} reviews)
                </span>
              </div>

              {/* Price */}
              <div className="flex items-center gap-3">
                {product.discountPrice ? (
                  <>
                    <span className="text-3xl font-['IBM_Plex_Mono'] font-bold text-[#2F5D50]">
                      {formatPrice(product.discountPrice)}
                    </span>
                    <span className="text-lg text-[#62726D]/70 line-through font-['IBM_Plex_Mono']">
                      {formatPrice(product.price)}
                    </span>
                    <span className="px-2 py-1 bg-[#B8863E]/10 text-[#B8863E] rounded-full text-xs font-medium">
                      Save {Math.round((1 - product.discountPrice / product.price) * 100)}%
                    </span>
                  </>
                ) : (
                  <span className="text-3xl font-['IBM_Plex_Mono'] font-bold text-[#2F5D50]">
                    {formatPrice(product.price)}
                  </span>
                )}
              </div>

              {/* Stock Status */}
              <div className="flex items-center gap-2">
                {isOutOfStock ? (
                  <span className="flex items-center gap-1.5 text-red-600">
                    <FiAlertCircle size={16} />
                    <span className="text-sm font-medium">Out of Stock</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-emerald-600">
                    <FiCheck size={16} />
                    <span className="text-sm font-medium">
                      In Stock ({product.stockQuantity} available)
                    </span>
                  </span>
                )}
              </div>

              {/* Short Description */}
              <p className="text-[#62726D] leading-relaxed">
                {product.shortDescription || product.description?.substring(0, 200) + '...'}
              </p>

              {/* Product Details */}
              <div className="grid grid-cols-2 gap-3 py-3 border-t border-b border-[#E3E7E4]">
                {product.unit && (
                  <div>
                    <p className="text-xs text-[#62726D]">Unit</p>
                    <p className="text-sm font-medium text-[#16241F]">{product.unit}</p>
                  </div>
                )}
                {product.dosage && (
                  <div>
                    <p className="text-xs text-[#62726D]">Dosage</p>
                    <p className="text-sm font-medium text-[#16241F]">{product.dosage}</p>
                  </div>
                )}
                {product.manufacturer && (
                  <div>
                    <p className="text-xs text-[#62726D]">Manufacturer</p>
                    <p className="text-sm font-medium text-[#16241F]">{product.manufacturer}</p>
                  </div>
                )}
                {product.batchNumber && (
                  <div>
                    <p className="text-xs text-[#62726D]">Batch</p>
                    <p className="text-sm font-medium text-[#16241F]">{product.batchNumber}</p>
                  </div>
                )}
              </div>

              {/* Ingredients */}
              {product.ingredients && product.ingredients.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-[#16241F] mb-1">Ingredients</p>
                  <div className="flex flex-wrap gap-1.5">
                    {product.ingredients.map((ing, index) => (
                      <span key={index} className="px-2 py-1 bg-[#F3F5F3] rounded-full text-xs text-[#62726D]">
                        {ing}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              {product.tags && product.tags.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-[#16241F] mb-1">Tags</p>
                  <div className="flex flex-wrap gap-1.5">
                    {product.tags.map((tag, index) => (
                      <span key={index} className="px-2 py-1 bg-[#E3E7E4] rounded-full text-xs text-[#62726D]">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Selector */}
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-[#E3E7E4] rounded-lg">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    className="px-3 py-2 hover:bg-[#F3F5F3] transition-colors disabled:opacity-40"
                  >
                    <FiMinus size={16} />
                  </button>
                  <span className="w-12 text-center font-['IBM_Plex_Mono'] text-sm">
                    {quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    disabled={isOutOfStock || quantity >= product.stockQuantity}
                    className="px-3 py-2 hover:bg-[#F3F5F3] transition-colors disabled:opacity-40"
                  >
                    <FiPlus size={16} />
                  </button>
                </div>

                {inCartQty > 0 && (
                  <span className="text-sm text-[#2F5D50] font-medium">
                    {inCartQty} in cart
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[#2F5D50] text-white rounded-xl font-medium hover:bg-[#1F4038] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiShoppingCart size={18} />
                  {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                </button>
                <button
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  className={`px-4 py-3 rounded-xl border transition-colors ${
                    isWishlisted
                      ? 'border-red-200 bg-red-50 text-red-600'
                      : 'border-[#E3E7E4] hover:bg-[#F3F5F3] text-[#62726D]'
                  }`}
                >
                  <FiHeart className={isWishlisted ? 'fill-red-500' : ''} size={18} />
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href)
                    toast.success('Link copied!')
                  }}
                  className="px-4 py-3 rounded-xl border border-[#E3E7E4] hover:bg-[#F3F5F3] text-[#62726D] transition-colors"
                >
                  <FiShare2 size={18} />
                </button>
              </div>

              {/* Prescription Warning */}
              {product.requiresPrescription && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <FiAlertCircle className="text-amber-600 mt-0.5" size={18} />
                    <div>
                      <p className="text-sm font-medium text-amber-800">Prescription Required</p>
                      <p className="text-sm text-amber-700">
                        This product requires a valid prescription. Please upload your prescription at checkout.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Delivery Info */}
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-[#E3E7E4]">
                <div className="flex items-center gap-2 text-sm text-[#62726D]">
                  <FiTruck className="text-[#2F5D50]" />
                  <span>Free delivery</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-[#62726D]">
                  <FiShield className="text-[#2F5D50]" />
                  <span>Authentic products</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-[#62726D]">
                  <FiRefreshCw className="text-[#2F5D50]" />
                  <span>7-day return</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-[#62726D]">
                  <FiClock className="text-[#2F5D50]" />
                  <span>24/7 support</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* Description */}
        {/* ============================================================ */}
        <div className="bg-white rounded-2xl border border-[#E3E7E4] p-6 md:p-8 mt-6">
          <h2 className="font-['Fraunces'] text-xl text-[#16241F] mb-4">Description</h2>
          <div className="text-[#62726D] leading-relaxed whitespace-pre-line">
            {product.description}
          </div>
        </div>

        {/* ============================================================ */}
        {/* Related Products */}
        {/* ============================================================ */}
        {relatedProducts.length > 0 && (
          <div className="mt-10">
            <h2 className="font-['Fraunces'] text-xl text-[#16241F] mb-4">Related Products</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {relatedProducts.map((related, index) => (
                <motion.div
                  key={related._id}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.3 }}
                  variants={fadeUp}
                  custom={index}
                >
                  <Link
                    to={`/shop/${related.slug}`}
                    className="block bg-white rounded-2xl border border-[#E3E7E4] overflow-hidden hover:shadow-lg transition-all group"
                  >
                    <div className="aspect-square bg-[#F3F5F3] overflow-hidden">
                      {related.featuredImage ? (
                        <img
                          src={related.featuredImage}
                          alt={related.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#62726D]/30">
                          <FiPackage size={36} />
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium text-[#16241F] group-hover:text-[#2F5D50] transition-colors line-clamp-1 text-sm">
                        {related.name}
                      </h3>
                      <div className="flex items-center justify-between mt-2">
                        <span className="font-['IBM_Plex_Mono'] text-sm font-medium text-[#2F5D50]">
                          {formatPrice(related.discountPrice || related.price)}
                        </span>
                        <span className="text-xs text-[#62726D]">{related.unit}</span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductDetail