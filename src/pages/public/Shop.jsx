import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FiSearch, FiShoppingCart, FiStar, FiFilter,
  FiChevronDown, FiX, FiPackage
} from 'react-icons/fi'
import { shopApi } from '../../api/shop.api'
import { useCart } from '../../context/CartContext'
import toast from 'react-hot-toast'

/*
  Shares the design system introduced in PatientProfile.jsx / PatientDashboard.jsx —
  same palette, type roles, and pulse-trace signature. Fonts (Fraunces, Inter,
  IBM Plex Mono) only need to be added once, globally.
*/

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.06, ease: 'easeOut' },
  }),
}

const PulseDivider = () => (
  <svg
    viewBox="0 0 1200 60"
    preserveAspectRatio="none"
    className="w-full h-[28px] text-[#B8863E]"
    aria-hidden="true"
  >
    <motion.path
      d="M0 30 L260 30 L285 30 L300 8 L318 52 L336 30 L360 30 L960 30 L985 30 L1000 12 L1015 48 L1030 30 L1200 30"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      initial={{ pathLength: 0, opacity: 0.4 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{ duration: 1.4, ease: 'easeInOut' }}
    />
  </svg>
)

const Shop = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [categories, setCategories] = useState([])
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, pages: 0 })
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState('newest')
  const { addToCart, cartItems, getItemQuantity } = useCart()

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [searchTerm, selectedCategory, pagination.page, sortBy])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const params = { page: pagination.page, limit: pagination.limit, sort: sortBy }
      if (searchTerm) params.search = searchTerm
      if (selectedCategory) params.category = selectedCategory

      const response = await shopApi.getProducts(params)
      setProducts(response.data.products || [])
      setPagination(response.data.pagination || { page: 1, limit: 12, total: 0, pages: 0 })
    } catch (error) {
      toast.error('Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await shopApi.getCategories()
      setCategories(response.data.categories || [])
    } catch (error) {
      console.error('Failed to load categories')
    }
  }

  const handleAddToCart = (product) => {
    const currentQty = getItemQuantity(product._id)
    if (currentQty >= product.stockQuantity) {
      toast.error('Not enough stock available')
      return
    }
    if (product.stockQuantity === 0) {
      toast.error('Product is out of stock')
      return
    }
    addToCart(product)
    toast.success(`${product.name} added to cart`)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setPagination((prev) => ({ ...prev, page: 1 }))
    fetchProducts()
  }

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedCategory('')
    setSortBy('newest')
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  const filtersActive = searchTerm || selectedCategory || sortBy !== 'newest'

  if (loading && products.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-[#F3F5F3]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#E3E7E4] border-t-[#2F5D50] mx-auto"></div>
          <p className="mt-4 text-sm text-[#62726D]">Loading products…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F3F5F3] py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Masthead */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp}>
          <div className="flex flex-wrap items-end justify-between gap-4 mb-2">
            <div>
              <p className="text-[12px] uppercase tracking-widest text-[#B8863E] font-medium">Pharmacy</p>
              <h1 className="font-['Fraunces'] text-[28px] leading-tight text-[#16241F]">
                Health <span className="italic">Shop</span>
              </h1>
              <p className="mt-1 text-sm text-[#62726D] max-w-2xl">
                Medications, supplements, and health products — in stock and ready to order.
              </p>
            </div>
            <Link
              to="/cart"
              className="relative inline-flex items-center gap-2 px-4 py-2 bg-[#2F5D50] text-white rounded-lg text-sm font-medium hover:bg-[#1F4038] transition-colors"
            >
              <FiShoppingCart size={15} /> Cart
              {cartItems.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#B8863E] text-white text-[11px] font-['IBM_Plex_Mono'] rounded-full w-5 h-5 flex items-center justify-center border-2 border-[#F3F5F3]">
                  {cartItems.length}
                </span>
              )}
            </Link>
          </div>
          <PulseDivider />
        </motion.div>

        {/* Search & filters */}
        <div className="bg-white rounded-2xl border border-[#E3E7E4] p-5 mt-4 mb-6">
          <div className="flex flex-col md:flex-row gap-3">
            <form onSubmit={handleSearch} className="flex-1 relative">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#62726D]" size={15} />
              <input
                type="text"
                placeholder="Search products…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 rounded-lg border border-[#E3E7E4] bg-white text-sm text-[#16241F] placeholder:text-[#62726D]/70 focus:outline-none focus:ring-2 focus:ring-[#2F5D50]/25 focus:border-[#2F5D50] transition"
              />
            </form>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-[#E3E7E4] text-sm text-[#16241F] hover:bg-[#F3F5F3] transition-colors"
            >
              <FiFilter size={14} /> Filters
              <FiChevronDown size={14} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
            {filtersActive && (
              <button
                onClick={clearFilters}
                className="flex items-center justify-center gap-1 px-4 py-2.5 rounded-lg text-sm text-[#2F5D50] hover:bg-[#2F5D50]/10 transition-colors"
              >
                <FiX size={14} /> Clear
              </button>
            )}
          </div>

          {showFilters && (
            <div className="mt-4 pt-4 border-t border-[#E3E7E4] grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[12px] uppercase tracking-wide text-[#62726D] mb-1.5">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-[#E3E7E4] bg-white text-sm text-[#16241F] focus:outline-none focus:ring-2 focus:ring-[#2F5D50]/25 focus:border-[#2F5D50] transition"
                >
                  <option value="">All categories</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat._id} ({cat.count})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[12px] uppercase tracking-wide text-[#62726D] mb-1.5">
                  Sort by
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-[#E3E7E4] bg-white text-sm text-[#16241F] focus:outline-none focus:ring-2 focus:ring-[#2F5D50]/25 focus:border-[#2F5D50] transition"
                >
                  <option value="newest">Newest</option>
                  <option value="popular">Most popular</option>
                  <option value="price_asc">Price: low to high</option>
                  <option value="price_desc">Price: high to low</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-[13px] text-[#62726D] font-['IBM_Plex_Mono']">
            {pagination.total > 0 ? (
              <>
                {(pagination.page - 1) * pagination.limit + 1}–
                {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} products
              </>
            ) : (
              'No products found'
            )}
          </p>
        </div>

        {/* Products grid */}
        {products.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-[#E3E7E4]">
            <div className="w-14 h-14 rounded-full bg-[#F3F5F3] flex items-center justify-center mx-auto mb-4">
              <FiPackage size={22} className="text-[#62726D]" />
            </div>
            <h3 className="font-['Fraunces'] text-lg text-[#16241F] mb-1">No products found</h3>
            <p className="text-[#62726D] text-sm">Try adjusting your search or filters.</p>
            <button
              onClick={clearFilters}
              className="mt-4 text-[#2F5D50] hover:underline font-medium text-sm"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {products.map((product, index) => {
              const inCartQty = getItemQuantity(product._id)
              const isOutOfStock = product.stockQuantity === 0
              const isInCart = inCartQty > 0

              return (
                <motion.div
                  key={product._id}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.3 }}
                  variants={fadeUp}
                  custom={index % 8}
                >
                  <div className="bg-white rounded-2xl border border-[#E3E7E4] hover:border-[#2F5D50]/30 hover:shadow-sm transition-all duration-300 group h-full flex flex-col">
                    {/* Image */}
                    <Link to={`/shop/${product.slug}`} className="block">
                      <div className="aspect-square bg-[#F3F5F3] rounded-t-2xl overflow-hidden relative">
                        {product.featuredImage ? (
                          <img
                            src={product.featuredImage}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <FiPackage size={36} className="text-[#62726D]/30" />
                          </div>
                        )}
                        {product.discountPrice && (
                          <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-[#B8863E] text-white text-[11px] font-medium">
                            Sale
                          </span>
                        )}
                        {product.requiresPrescription && (
                          <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-[#16241F] text-white text-[11px] font-medium">
                            Rx required
                          </span>
                        )}
                      </div>
                    </Link>

                    {/* Content */}
                    <div className="p-4 flex-1 flex flex-col">
                      <Link to={`/shop/${product.slug}`}>
                        <h3 className="font-medium text-[#16241F] group-hover:text-[#2F5D50] transition-colors line-clamp-1 text-sm">
                          {product.name}
                        </h3>
                      </Link>
                      <p className="text-[12px] text-[#62726D] line-clamp-1 mt-0.5">{product.category}</p>

                      <div className="flex items-center justify-between mt-2.5">
                        <div>
                          {product.discountPrice ? (
                            <div className="flex items-center gap-2">
                              <span className="font-['IBM_Plex_Mono'] text-base font-medium text-[#2F5D50]">
                                GHS {product.discountPrice}
                              </span>
                              <span className="text-[12px] text-[#62726D]/70 line-through font-['IBM_Plex_Mono']">
                                GHS {product.price}
                              </span>
                            </div>
                          ) : (
                            <span className="font-['IBM_Plex_Mono'] text-base font-medium text-[#2F5D50]">
                              GHS {product.price}
                            </span>
                          )}
                          <p className="text-[11px] text-[#62726D] mt-0.5">{product.stockQuantity} in stock</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <FiStar className="text-[#B8863E] fill-[#B8863E]" size={13} />
                          <span className="text-[12px] text-[#62726D] font-['IBM_Plex_Mono']">
                            {product.rating?.toFixed(1) || '0.0'}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 flex gap-2">
                        {isOutOfStock ? (
                          <button
                            disabled
                            className="flex-1 py-2 rounded-lg bg-[#F3F5F3] text-[#62726D]/60 text-sm font-medium cursor-not-allowed"
                          >
                            Out of stock
                          </button>
                        ) : isInCart ? (
                          <Link
                            to="/cart"
                            className="flex-1 py-2 rounded-lg bg-[#2F5D50]/10 text-[#2F5D50] text-sm font-medium hover:bg-[#2F5D50]/15 transition-colors text-center"
                          >
                            In cart ({inCartQty})
                          </Link>
                        ) : (
                          <button
                            onClick={() => handleAddToCart(product)}
                            className="flex-1 py-2 rounded-lg bg-[#2F5D50] text-white text-sm font-medium hover:bg-[#1F4038] transition-colors"
                          >
                            Add to cart
                          </button>
                        )}
                        <Link
                          to={`/shop/${product.slug}`}
                          className="px-3.5 py-2 rounded-lg border border-[#E3E7E4] text-[#62726D] hover:bg-[#F3F5F3] transition-colors"
                        >
                          <FiSearch size={15} />
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
          <div className="flex items-center justify-center gap-2 mt-10">
            <button
              onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
              disabled={pagination.page === 1}
              className="px-4 py-2 rounded-lg border border-[#E3E7E4] text-sm text-[#16241F] hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-[13px] text-[#62726D] font-['IBM_Plex_Mono']">
              {pagination.page} / {pagination.pages}
            </span>
            <button
              onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page === pagination.pages}
              className="px-4 py-2 rounded-lg border border-[#E3E7E4] text-sm text-[#16241F] hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Shop
