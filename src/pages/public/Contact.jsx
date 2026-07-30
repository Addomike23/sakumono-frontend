import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  FiPhone, FiMail, FiMapPin, FiClock, FiSend,
  FiUser, FiMessageSquare, FiCheckCircle,
  FiArrowRight, FiFacebook, FiTwitter, FiInstagram,
  FiYoutube, FiMap, FiGlobe
} from 'react-icons/fi'
import { contactApi } from '../../api/contact.api'
import { subscriptionApi } from '../../api/subscriptionApi'
import toast from 'react-hot-toast'

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.08, ease: 'easeOut' },
  }),
}

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    category: 'general'
  })
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [subscribeEmail, setSubscribeEmail] = useState('')
  const [subscribing, setSubscribing] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const { name, email, subject, message } = formData
    if (!name || !email || !subject || !message) {
      toast.error('Please fill in all required fields')
      return
    }

    setLoading(true)
    try {
      await contactApi.send(formData)
      setSubmitted(true)
      toast.success('Your message has been sent successfully!')
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        category: 'general'
      })
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send message')
    } finally {
      setLoading(false)
    }
  }

  const handleSubscribe = async (e) => {
    e.preventDefault()
    if (!subscribeEmail) {
      toast.error('Please enter your email address')
      return
    }

    setSubscribing(true)
    try {
      await subscriptionApi.subscribe({ email: subscribeEmail })
      toast.success('Subscribed successfully!')
      setSubscribeEmail('')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to subscribe')
    } finally {
      setSubscribing(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl shadow-xl p-10 text-center max-w-md border border-gray-100"
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <FiCheckCircle className="text-green-600 text-4xl" />
          </div>
          <h2 className="text-2xl font-medium text-gray-900 mb-2">Message Sent!</h2>
          <p className="text-gray-600 mb-6">
            Thank you for reaching out. Our team will get back to you within 24 hours.
          </p>
          <button
            onClick={() => setSubmitted(false)}
            className="px-6 py-2.5 bg-green-600 text-white rounded-full font-medium hover:bg-green-700 transition-colors"
          >
            Send Another Message
          </button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* ============================================================ */}
      {/* HERO SECTION */}
      {/* ============================================================ */}
      <section className="relative overflow-hidden bg-gradient-to-b from-green-50 to-white pt-16 pb-12 md:pt-20 md:pb-16">
        <div aria-hidden="true" className="absolute -top-20 -right-24 w-96 h-96 rounded-full bg-green-100 blur-3xl opacity-50" />
        <div aria-hidden="true" className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-green-50 blur-3xl" />

        <div className="max-w-7xl mx-auto px-6 text-center relative">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
          >
            <span className="text-green-700 font-semibold text-sm uppercase tracking-wider">
              Get in Touch
            </span>
            <h1 className="mt-4 text-4xl sm:text-5xl lg:text-5xl font-medium text-gray-900">
              We're here to <span className="italic text-green-600">help</span>
            </h1>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Have questions, feedback, or need assistance? Reach out to us — we'd love to hear from you.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* CONTACT INFO CARDS */}
      {/* ============================================================ */}
      <section className="max-w-7xl mx-auto px-6 -mt-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: FiPhone, title: 'Call Us', info: '+233 55 500 0000', sub: 'Mon-Fri: 8am - 6pm', color: 'green' },
            { icon: FiMail, title: 'Email Us', info: 'info@sakumonohospital.com', sub: 'We respond within 24 hours', color: 'blue' },
            { icon: FiMapPin, title: 'Visit Us', info: 'Sakumono-Tema, Accra', sub: 'Open 24/7 for emergencies', color: 'red' },
            { icon: FiClock, title: 'Working Hours', info: 'Mon-Fri: 8am - 8pm', sub: 'Sat: 9am - 5pm', color: 'purple' },
          ].map((item, index) => {
            const Icon = item.icon
            return (
              <motion.div
                key={index}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                variants={fadeUp}
                custom={index}
                className="bg-white rounded-2xl border border-gray-100 p-6 text-center hover:shadow-lg transition-shadow"
              >
                <div className={`w-14 h-14 bg-${item.color}-50 rounded-full flex items-center justify-center mx-auto mb-3`}>
                  <Icon className={`text-${item.color}-600 text-xl`} />
                </div>
                <h3 className="font-semibold text-gray-900">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.info}</p>
                <p className="text-xs text-gray-400 mt-1">{item.sub}</p>
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* ============================================================ */}
      {/* CONTACT FORM + MAP */}
      {/* ============================================================ */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid lg:grid-cols-3 gap-10">
          {/* Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
              <h2 className="text-2xl font-medium text-gray-900 mb-6">Send us a message</h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Full Name *
                    </label>
                    <div className="relative">
                      <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Your name"
                        className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Email *
                    </label>
                    <div className="relative">
                      <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="you@example.com"
                        className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Phone (optional)
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="0555000000"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Category
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition"
                    >
                      <option value="general">General Inquiry</option>
                      <option value="appointment">Appointment</option>
                      <option value="feedback">Feedback</option>
                      <option value="complaint">Complaint</option>
                      <option value="medical">Medical Question</option>
                      <option value="billing">Billing</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Subject *
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="Brief subject"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Message *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows="5"
                    placeholder="How can we help you?"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition resize-y"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-full bg-green-600 text-white font-medium shadow-lg shadow-green-600/20 hover:bg-green-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? 'Sending...' : 'Send Message'}
                  {!loading && <FiSend />}
                </button>
              </form>
            </div>
          </div>

          {/* Sidebar - Map & Social */}
          <div className="lg:col-span-1 space-y-6">
            {/* Map */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FiMap className="text-green-600" /> Find Us
              </h3>
              <div className="aspect-video bg-gray-100 rounded-xl overflow-hidden">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3970.349170586997!2d-0.017324!3d5.603719!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xfdf90d2b8d6d6d7%3A0x6d6d6d6d6d6d6d6d!2sTema!5e0!3m2!1sen!2sgh!4v1700000000000!5m2!1sen!2sgh"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Hospital Location"
                  className="w-full h-full"
                />
              </div>
              <p className="text-sm text-gray-500 mt-3 flex items-center gap-2">
                <FiMapPin className="text-green-500" />
                Sakumono-Tema, Accra, Ghana
              </p>
            </div>

            {/* Social Media */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FiGlobe className="text-green-600" /> Connect With Us
              </h3>
              <div className="flex gap-3">
                {[
                  { icon: FiFacebook, color: 'bg-[#1877F2]', label: 'Facebook' },
                  { icon: FiTwitter, color: 'bg-[#1DA1F2]', label: 'Twitter' },
                  { icon: FiInstagram, color: 'bg-gradient-to-br from-[#E4405F] to-[#F58529]', label: 'Instagram' },
                  { icon: FiYoutube, color: 'bg-[#FF0000]', label: 'YouTube' },
                ].map((social, index) => {
                  const Icon = social.icon
                  return (
                    <a
                      key={index}
                      href="#"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`w-12 h-12 ${social.color} text-white rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-sm`}
                      aria-label={social.label}
                    >
                      <Icon size={18} />
                    </a>
                  )
                })}
              </div>
              <p className="text-xs text-gray-400 mt-3">Follow us for health tips and updates</p>
            </div>

            {/* Subscribe */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200">
              <h3 className="font-semibold text-gray-900 mb-2">Stay Updated</h3>
              <p className="text-sm text-gray-600 mb-4">
                Subscribe to our newsletter for health tips and hospital news.
              </p>
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <input
                  type="email"
                  value={subscribeEmail}
                  onChange={(e) => setSubscribeEmail(e.target.value)}
                  placeholder="Your email"
                  className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                  required
                />
                <button
                  type="submit"
                  disabled={subscribing}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors whitespace-nowrap disabled:opacity-60"
                >
                  {subscribing ? '...' : 'Subscribe'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* EMERGENCY CTA */}
      {/* ============================================================ */}
      <section className="max-w-7xl mx-auto px-6 pb-16">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeUp}
          className="rounded-2xl bg-green-700 text-white px-8 py-14 md:px-16 md:py-20 text-center relative overflow-hidden"
        >
          <div
            aria-hidden="true"
            className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-green-500/30 blur-3xl"
          />
          <h2 className="text-3xl md:text-4xl font-medium max-w-2xl mx-auto relative">
            Need immediate medical assistance?
          </h2>
          <p className="mt-4 text-green-50 max-w-lg mx-auto relative">
            Our emergency line is answered around the clock — call ahead before you arrive, or reach us any time.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4 relative">
            <a
              href="tel:+233555000000"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-white text-green-700 font-medium hover:bg-green-50 transition-colors"
            >
              <FiPhone /> +233 55 500 0000
            </a>
            <a
              href="/contact"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full border border-white/30 text-white font-medium hover:bg-white/10 transition-colors"
            >
              Contact us <FiArrowRight />
            </a>
          </div>
        </motion.div>
      </section>
    </div>
  )
}

export default Contact