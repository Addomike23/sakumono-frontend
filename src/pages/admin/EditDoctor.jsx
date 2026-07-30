import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FaArrowLeft, FaSpinner, FaSave, FaTimes,
  FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt,
  FaStethoscope, FaClock, FaDollarSign, FaFileAlt,
  FaCheckCircle, FaTimesCircle, FaCalendarAlt,
  FaBriefcase, FaUpload, FaImage, FaPlus
} from 'react-icons/fa'
import { doctorsApi } from '../../api/doctors.api'
import { usersApi } from '../../api/users.api'
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

const EditDoctor = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    specialization: '',
    qualifications: [],
    yearsOfExperience: '',
    consultationFee: '',
    bio: '',
    isAvailableForConsultation: false,
    address: {
      street: '',
      city: '',
      state: '',
      country: 'Ghana'
    }
  })
  const [qualificationInput, setQualificationInput] = useState('')
  const [profileImage, setProfileImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [currentImage, setCurrentImage] = useState(null)

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

  useEffect(() => {
    if (id) {
      fetchDoctor()
    }
  }, [id])

  const fetchDoctor = async () => {
    setLoading(true)
    try {
      // Fetch doctor details using the admin endpoint
      const response = await doctorsApi.getAllAdmin({ page: 1, limit: 100 })
      const doctor = response.data.doctors?.find(d => {
        const doctorId = d.user?._id || d._id || d.user?.id || d.id
        return doctorId === id
      })
      
      if (!doctor) {
        toast.error('Doctor not found')
        navigate('/admin/doctors')
        return
      }

      const userData = doctor.user || doctor
      
      setFormData({
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        email: userData.email || '',
        phone: userData.phone || '',
        specialization: doctor.specialization || '',
        qualifications: doctor.qualifications || [],
        yearsOfExperience: doctor.yearsOfExperience || '',
        consultationFee: doctor.consultationFee || '',
        bio: doctor.bio || '',
        isAvailableForConsultation: doctor.isAvailableForConsultation || false,
        address: {
          street: userData.address?.street || '',
          city: userData.address?.city || '',
          state: userData.address?.state || '',
          country: userData.address?.country || 'Ghana'
        }
      })
      
      setCurrentImage(userData.profileImage || null)
      
    } catch (error) {
      
      toast.error('Failed to load doctor details')
      navigate('/admin/doctors')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    if (name.includes('address.')) {
      const field = name.split('.')[1]
      setFormData(prev => ({
        ...prev,
        address: { ...prev.address, [field]: value }
      }))
    } else if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleAddQualification = () => {
    if (!qualificationInput.trim()) return
    if (formData.qualifications.includes(qualificationInput.trim())) {
      toast.error('Qualification already exists')
      return
    }
    setFormData(prev => ({
      ...prev,
      qualifications: [...prev.qualifications, qualificationInput.trim()]
    }))
    setQualificationInput('')
  }

  const handleRemoveQualification = (index) => {
    setFormData(prev => ({
      ...prev,
      qualifications: prev.qualifications.filter((_, i) => i !== index)
    }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setProfileImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setProfileImage(null)
    setImagePreview(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.firstName || !formData.lastName || !formData.email) {
      toast.error('Please fill in all required fields')
      return
    }

    setSaving(true)
    try {
      const data = new FormData()
      
      // User fields
      data.append('firstName', formData.firstName)
      data.append('lastName', formData.lastName)
      data.append('email', formData.email)
      data.append('phone', formData.phone || '')
      data.append('address', JSON.stringify(formData.address))
      
      // Doctor fields
      data.append('specialization', formData.specialization || '')
      data.append('qualifications', JSON.stringify(formData.qualifications))
      data.append('yearsOfExperience', formData.yearsOfExperience || '0')
      data.append('consultationFee', formData.consultationFee || '0')
      data.append('bio', formData.bio || '')
      data.append('isAvailableForConsultation', formData.isAvailableForConsultation ? 'true' : 'false')
      
      // Profile image
      if (profileImage) {
        data.append('profileImage', profileImage)
      }

      // Update doctor
      await doctorsApi.updateMyProfile(data)
      
      toast.success('Doctor updated successfully!')
      navigate('/admin/doctors')
    } catch (error) {
      
      toast.error(error.response?.data?.message || 'Failed to update doctor')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <FaSpinner className="animate-spin text-3xl text-emerald-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link to="/admin/doctors" className="text-gray-600 hover:text-gray-800">
            <FaArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-semibold text-gray-900">
            Edit Doctor
          </h1>
          <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${
            formData.isAvailableForConsultation 
              ? 'bg-green-100 text-green-700' 
              : 'bg-red-100 text-red-700'
          }`}>
            {formData.isAvailableForConsultation ? <FaCheckCircle size={12} /> : <FaTimesCircle size={12} />}
            {formData.isAvailableForConsultation ? 'Available' : 'Unavailable'}
          </span>
        </div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="bg-white rounded-xl border border-gray-200 shadow-sm p-6"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Profile Image
              </label>
              <div className="flex items-center gap-4">
                {imagePreview || currentImage ? (
                  <div className="relative w-24 h-24 rounded-full overflow-hidden border border-gray-200 group">
                    <img
                      src={imagePreview || currentImage}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <FaTimes size={12} />
                    </button>
                  </div>
                ) : (
                  <label className="w-24 h-24 rounded-full border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-emerald-400 transition-colors">
                    <FaUpload className="text-gray-400 text-xl mb-1" />
                    <span className="text-xs text-gray-400">Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                )}
                <div className="text-xs text-gray-400">
                  <p>JPG, PNG, WebP (Max 2MB)</p>
                </div>
              </div>
            </div>

            {/* Personal Information */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  First Name *
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Last Name *
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
                  required
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Phone
                </label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+233 XX XXX XXXX"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
                />
              </div>
            </div>

            {/* Doctor Specific */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Specialization *
                </label>
                <input
                  type="text"
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleChange}
                  placeholder="e.g., Cardiologist"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Years of Experience
                </label>
                <input
                  type="number"
                  name="yearsOfExperience"
                  value={formData.yearsOfExperience}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Consultation Fee (GHS)
              </label>
              <input
                type="number"
                name="consultationFee"
                value={formData.consultationFee}
                onChange={handleChange}
                placeholder="0.00"
                min="0"
                step="0.01"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Bio / About
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows="4"
                placeholder="Brief biography of the doctor..."
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
              />
            </div>

            {/* Qualifications */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Qualifications
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={qualificationInput}
                  onChange={(e) => setQualificationInput(e.target.value)}
                  placeholder="Add qualification"
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddQualification()}
                />
                <button
                  type="button"
                  onClick={handleAddQualification}
                  className="px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  <FaPlus size={14} />
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.qualifications.map((qual, index) => (
                  <span key={index} className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
                    <FaBriefcase size={12} />
                    {qual}
                    <button
                      type="button"
                      onClick={() => handleRemoveQualification(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <FaTimes size={12} />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Address */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Street Address
                </label>
                <input
                  type="text"
                  name="address.street"
                  value={formData.address.street}
                  onChange={handleChange}
                  placeholder="Street"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  City
                </label>
                <input
                  type="text"
                  name="address.city"
                  value={formData.address.city}
                  onChange={handleChange}
                  placeholder="City"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  State/Region
                </label>
                <input
                  type="text"
                  name="address.state"
                  value={formData.address.state}
                  onChange={handleChange}
                  placeholder="State/Region"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Country
                </label>
                <input
                  type="text"
                  name="address.country"
                  value={formData.address.country}
                  onChange={handleChange}
                  placeholder="Country"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
                />
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  name="isAvailableForConsultation"
                  checked={formData.isAvailableForConsultation}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                />
                Available for Consultation
              </label>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50"
              >
                {saving ? <FaSpinner className="animate-spin" /> : <FaSave />}
                Update Doctor
              </button>
              <Link
                to="/admin/doctors"
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                Cancel
              </Link>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  )
}

export default EditDoctor