import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  FaClock, FaPlus, FaTrash, FaSave, FaSpinner,
  FaCheckCircle, FaTimesCircle, FaCalendarAlt
} from 'react-icons/fa'
import { doctorsApi } from '../../api/doctors.api'
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

const DoctorAvailability = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [availability, setAvailability] = useState([])
  const [isAvailable, setIsAvailable] = useState(true)

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

  useEffect(() => {
    fetchAvailability()
  }, [])

  const fetchAvailability = async () => {
    setLoading(true)
    try {
      const response = await doctorsApi.getMyProfile()
      console.log('Profile response:', response.data)
      setAvailability(response.data.doctor?.availability || [])
      setIsAvailable(response.data.doctor?.isAvailableForConsultation !== false)
    } catch (error) {
      console.error('Fetch availability error:', error)
      toast.error('Failed to load availability')
    } finally {
      setLoading(false)
    }
  }

  const handleAddDay = () => {
    setAvailability([...availability, { day: '', startTime: '09:00', endTime: '17:00', isAvailable: true }])
  }

  const handleRemoveDay = (index) => {
    const updated = availability.filter((_, i) => i !== index)
    setAvailability(updated)
  }

  const handleChange = (index, field, value) => {
    const updated = [...availability]
    updated[index][field] = value
    setAvailability(updated)
  }

  const handleSave = async () => {
    const invalid = availability.some(slot => !slot.day || !slot.startTime || !slot.endTime)
    if (invalid) {
      toast.error('Please fill in all fields')
      return
    }

    setSaving(true)
    try {
      await doctorsApi.updateMyAvailability(availability)
      toast.success('Availability updated successfully')
      fetchAvailability()
    } catch (error) {
      console.error('Save availability error:', error)
      toast.error('Failed to update availability')
    } finally {
      setSaving(false)
    }
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
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Availability</h1>
            <p className="text-sm text-gray-500 mt-1">Manage your weekly schedule</p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors disabled:opacity-50 shadow-sm"
          >
            {saving ? <FaSpinner className="animate-spin" /> : <FaSave />}
            Save Changes
          </button>
        </div>

        {/* Availability Toggle */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">Accepting Appointments</h3>
              <p className="text-sm text-gray-500">Toggle this off to stop accepting new appointments</p>
            </div>
            <button
              onClick={() => {
                setIsAvailable(!isAvailable)
                doctorsApi.updateMyAvailability(availability)
              }}
              className={`relative w-14 h-8 rounded-full transition-colors ${
                isAvailable ? 'bg-green-500' : 'bg-gray-300'
              }`}
            >
              <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform ${
                isAvailable ? 'right-1' : 'left-1'
              }`} />
            </button>
          </div>
        </motion.div>

        {/* Availability Slots */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="bg-white rounded-xl border border-gray-200 shadow-sm p-6"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Weekly Schedule</h2>

          {availability.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No availability set</p>
          ) : (
            <div className="space-y-4">
              {availability.map((slot, index) => (
                <div key={index} className="flex flex-wrap items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1 min-w-[120px]">
                    <select
                      value={slot.day}
                      onChange={(e) => handleChange(index, 'day', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500/30"
                    >
                      <option value="">Select Day</option>
                      {days.map(day => (
                        <option key={day} value={day}>{day}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1 min-w-[100px]">
                    <input
                      type="time"
                      value={slot.startTime}
                      onChange={(e) => handleChange(index, 'startTime', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500/30"
                    />
                  </div>
                  <span className="text-gray-500">to</span>
                  <div className="flex-1 min-w-[100px]">
                    <input
                      type="time"
                      value={slot.endTime}
                      onChange={(e) => handleChange(index, 'endTime', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500/30"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={slot.isAvailable}
                        onChange={(e) => handleChange(index, 'isAvailable', e.target.checked)}
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      Active
                    </label>
                    <button
                      onClick={() => handleRemoveDay(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={handleAddDay}
            className="mt-4 flex items-center gap-2 text-green-600 hover:text-green-700 font-medium text-sm"
          >
            <FaPlus /> Add Day
          </button>
        </motion.div>

        {/* Preview */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mt-6"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Preview</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {days.map(day => {
              const slot = availability.find(s => s.day === day)
              return (
                <div key={day} className={`p-3 rounded-lg text-sm text-center ${
                  slot?.isAvailable ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                }`}>
                  <p className="font-medium">{day}</p>
                  <p className="text-xs">{slot ? `${slot.startTime} - ${slot.endTime}` : 'Unavailable'}</p>
                </div>
              )
            })}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default DoctorAvailability