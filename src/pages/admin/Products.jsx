import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  FaSearch, FaPlus, FaEdit, FaTrash, FaEye,
  FaSpinner, FaFilter, FaChevronDown,
  FaBox, FaTag, FaStar, FaShoppingCart, FaPrescription,
  FaCheckCircle, FaTimesCircle, FaClock
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

const AdminProducts = () => {
  const { user } = useAuth()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [categories, setCategories] = useState([])
  const [stats, setStats] = useState({})
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 })

  useEffect(() => {
    fetchProducts()
    fetchCategories()
    fetchStats()
  }, [search, categoryFilter, pagination.page])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit
      }
      if (search) params.search = search
      if (categoryFilter) params.category = categoryFilter
      
      const response = await shopApi.getProducts(params)
      setProducts(response.data.products || [])
      setPagination(response.data.pagination || { page: 1, limit: 20, total: 0, pages: 0 })
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

  const fetchStats = async () => {
    try {
      const response = await shopApi.getProductStats()
      setStats(response.data.stats || {})
    } catch (error) {
      console.error('Failed to load stats')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return
    try {
      await shopApi.deleteProduct(id)
      toast.success('Product deleted')
      fetchProducts()
      fetchStats()
    } catch (error) {
      toast.error('Failed to delete product')
    }
  }

  const getStockStatus = (stock) => {
    if (stock === 0) return { label: 'Out of Stock', color: 'bg-red-100 text-red-700', icon: FaTimesCircle }
    if (stock < 10) return { label: 'Low Stock', color: 'bg-yellow-100 text-yellow-700', icon: FaClock }
    return { label: 'In Stock', color: 'bg-green-100 text-green-700', icon: FaCheckCircle }
  }

  const formatCurrency = (amount) => {
    return `GHS ${amount?.toFixed(2) || '0.00'}`
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
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Products</h1>
            <p className="text-sm text-gray-500 mt-1">
              {stats.total || 0} products • {stats.lowStock || 0} low stock
            </p>
          </div>
          <Link
            to="/admin/products/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors shadow-sm"
          >
            <FaPlus /> Add Product
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-3 text-center">
            <p className="text-xl font-bold text-gray-800">{stats.total || 0}</p>
            <p className="text-[10px] text-gray-500">Total</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-3 text-center">
            <p className="text-xl font-bold text-red-600">{stats.outOfStock || 0}</p>
            <p className="text-[10px] text-gray-500">Out of Stock</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-3 text-center">
            <p className="text-xl font-bold text-yellow-600">{stats.lowStock || 0}</p>
            <p className="text-[10px] text-gray-500">Low Stock</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-3 text-center">
            <p className="text-xl font-bold text-purple-600">{stats.featured || 0}</p>
            <p className="text-[10px] text-gray-500">Featured</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-3 text-center">
            <p className="text-xl font-bold text-blue-600">{stats.requirePrescription || 0}</p>
            <p className="text-[10px] text-gray-500">Prescription Required</p>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
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
            {(search || categoryFilter) && (
              <button
                onClick={() => {
                  setSearch('')
                  setCategoryFilter('')
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
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500/30"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>{cat._id} ({cat.count})</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Products Table or Empty State */}
        {products.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">No products found</h3>
            <p className="text-gray-500 text-sm">
              {search || categoryFilter ? 'Try adjusting your search or filters.' : 'Start adding products to your pharmacy.'}
            </p>
            {!search && !categoryFilter && (
              <Link
                to="/admin/products/new"
                className="mt-4 inline-flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors shadow-sm"
              >
                <FaPlus /> Add Your First Product
              </Link>
            )}
            {(search || categoryFilter) && (
              <button
                onClick={() => {
                  setSearch('')
                  setCategoryFilter('')
                }}
                className="mt-4 text-green-600 hover:text-green-700 font-medium text-sm"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sales</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {products.map((product, index) => {
                    const stockStatus = getStockStatus(product.stockQuantity)
                    const StatusIcon = stockStatus.icon
                    return (
                      <motion.tr
                        key={product._id}
                        initial="hidden"
                        animate="visible"
                        custom={index}
                        variants={fadeUp}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            {product.featuredImage ? (
                              <img 
                                src={product.featuredImage} 
                                alt={product.name} 
                                className="w-10 h-10 rounded-lg object-cover border border-gray-200"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                                <FaBox size={16} />
                              </div>
                            )}
                            <div>
                              <p className="text-sm font-medium text-gray-900 line-clamp-1">{product.name}</p>
                              {product.requiresPrescription && (
                                <span className="text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                                  <FaPrescription size={10} /> Rx
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{product.category}</td>
                        <td className="px-4 py-3">
                          <div>
                            {product.discountPrice ? (
                              <>
                                <span className="text-sm font-bold text-green-600">{formatCurrency(product.discountPrice)}</span>
                                <span className="text-xs text-gray-400 line-through ml-1">{formatCurrency(product.price)}</span>
                              </>
                            ) : (
                              <span className="text-sm font-bold text-gray-900">{formatCurrency(product.price)}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{product.stockQuantity}</td>
                        <td className="px-4 py-3">
                          <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${stockStatus.color}`}>
                            <StatusIcon size={12} /> {stockStatus.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{product.salesCount || 0}</td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              to={`/shop/${product.slug}`}
                              target="_blank"
                              className="text-blue-600 hover:text-blue-800"
                              title="View on site"
                            >
                              <FaEye size={15} />
                            </Link>
                            <Link
                              to={`/admin/products/${product._id}/edit`}
                              className="text-yellow-600 hover:text-yellow-800"
                              title="Edit"
                            >
                              <FaEdit size={15} />
                            </Link>
                            <button
                              onClick={() => handleDelete(product._id)}
                              className="text-red-600 hover:text-red-800"
                              title="Delete"
                            >
                              <FaTrash size={15} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
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

export default AdminProducts