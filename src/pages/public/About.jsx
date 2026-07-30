import React, { useRef, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import { 
  FiHeart, FiShield, FiAward, FiUsers, 
  FiClock, FiCalendar, FiMapPin, FiPhone, FiMail, 
  FiGlobe, FiTrendingUp, FiBookOpen, FiStar, 
  FiCheckCircle, FiUser, FiUserCheck
} from 'react-icons/fi'
import { doctorsApi } from '../../api/doctors.api'
import { reviewsApi } from '../../api/reviews.api'
import toast from 'react-hot-toast'

// ============================================================
// ANIMATION VARIANTS
// ============================================================
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.6, ease: 'easeOut' } 
  }
}

const fadeInLeft = {
  hidden: { opacity: 0, x: -40 },
  visible: { 
    opacity: 1, 
    x: 0, 
    transition: { duration: 0.6, ease: 'easeOut' } 
  }
}

const fadeInRight = {
  hidden: { opacity: 0, x: 40 },
  visible: { 
    opacity: 1, 
    x: 0, 
    transition: { duration: 0.6, ease: 'easeOut' } 
  }
}

const scaleUp = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    transition: { duration: 0.6, ease: 'easeOut' } 
  }
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1
    }
  }
}

// ============================================================
// ANIMATED SECTION COMPONENT
// ============================================================
const AnimatedSection = ({ children, animation = fadeUp, className = '' }) => {
  const ref = useRef(null)
  const isInView = useInView(ref, { 
    once: true, 
    amount: 0.1,
    margin: "-50px 0px"
  })

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={animation}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// ============================================================
// MAIN ABOUT COMPONENT
// ============================================================
const About = () => {
  const [loading, setLoading] = useState(true)
  const [doctors, setDoctors] = useState([])
  const [reviewStats, setReviewStats] = useState({})
  const [topReviews, setTopReviews] = useState([])

  // Stats from API
  const [stats, setStats] = useState([
    { icon: FiUsers, value: 'Loading...', label: 'Patients Served' },
    { icon: FiAward, value: 'Loading...', label: 'Years of Excellence' },
    { icon: FiUserCheck, value: 'Loading...', label: 'Medical Specialists' },
    { icon: FiClock, value: '24/7', label: 'Emergency Care' }
  ])

  // Fetch data from API
  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      // Fetch doctors
      const doctorsRes = await doctorsApi.getAll({ limit: 100 })
      const doctorsData = doctorsRes.data.doctors || []
      setDoctors(doctorsData)

      // Fetch reviews stats
      try {
        const reviewsRes = await reviewsApi.getStats()
        setReviewStats(reviewsRes.data.stats || {})
      } catch (err) {
        console.error('Failed to load review stats:', err)
      }

      // Update stats with real data
      setStats([
        { 
          icon: FiUsers, 
          value: doctorsData.reduce((sum, d) => sum + (d.patientCount || 0), 0).toLocaleString() || '12,847+', 
          label: 'Patients Served' 
        },
        { 
          icon: FiAward, 
          value: '25+', 
          label: 'Years of Excellence' 
        },
        { 
          icon: FiUserCheck, 
          value: doctorsData.length > 0 ? `${doctorsData.length}+` : '46+', 
          label: 'Medical Specialists' 
        },
        { 
          icon: FiClock, 
          value: '24/7', 
          label: 'Emergency Care' 
        }
      ])

    } catch (error) {
      console.error('Failed to fetch data:', error)
      // Keep default stats if API fails
    } finally {
      setLoading(false)
    }
  }

  const values = [
    { 
      icon: FiHeart, 
      title: 'Compassion', 
      desc: 'We treat every patient with empathy, dignity, and respect, understanding that healthcare is personal.',
      color: 'red'
    },
    { 
      icon: FiAward, 
      title: 'Excellence', 
      desc: 'We strive for the highest standards in healthcare delivery, continuously improving our services.',
      color: 'blue'
    },
    { 
      icon: FiShield, 
      title: 'Integrity', 
      desc: 'We are honest, transparent, and accountable in all we do, building trust with our patients.',
      color: 'green'
    },
    { 
      icon: FiUsers, 
      title: 'Community', 
      desc: 'We are committed to the health and well-being of our community, serving with dedication.',
      color: 'purple'
    },
    { 
      icon: FiClock, 
      title: 'Timeliness', 
      desc: 'We value your time and provide prompt, efficient care without compromising quality.',
      color: 'orange'
    },
    { 
      icon: FiTrendingUp, 
      title: 'Innovation', 
      desc: 'We embrace innovation and technology to deliver cutting-edge medical treatments.',
      color: 'teal'
    }
  ]

  const timeline = [
    { year: '1998', title: 'Foundation', desc: 'Sakumono Community Hospital was established with a vision to provide accessible healthcare to the local community.' },
    { year: '2005', title: 'Expansion', desc: 'We expanded our facilities and introduced new departments including Pediatrics and Orthopedics.' },
    { year: '2012', title: 'Technology Upgrade', desc: 'We invested in state-of-the-art medical equipment and digital health records systems.' },
    { year: '2018', title: 'Specialist Care', desc: 'We welcomed our first team of specialists, expanding our services to include cardiology and neurology.' },
    { year: '2024', title: 'Digital Transformation', desc: 'We launched our online appointment and consultation system to better serve our patients.' }
  ]

  // Get top 4 doctors for display
  const displayDoctors = doctors.slice(0, 4)

  return (
    <div className="min-h-screen bg-white">
      {/* ============================================================ */}
      {/* HERO SECTION */}
      {/* ============================================================ */}
      <section className="relative overflow-hidden bg-gradient-to-b from-green-50 to-white pt-20 pb-16 md:pt-28 md:pb-20">
        <div aria-hidden="true" className="absolute -top-20 -right-24 w-96 h-96 rounded-full bg-green-100 blur-3xl opacity-50" />
        <div aria-hidden="true" className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-green-50 blur-3xl" />

        <div className="max-w-7xl mx-auto px-6 text-center relative">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
          >
            <span className="text-green-600 font-semibold text-sm uppercase tracking-wider">
              About Us
            </span>
            <h1 className="mt-4 text-4xl sm:text-5xl lg:text-5xl font-medium text-gray-900">
              Your Health, <span className="italic text-green-600">Our Priority</span>
            </h1>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              For over 25 years, we've been dedicated to providing exceptional healthcare that combines 
              cutting-edge medical technology with the personal touch our patients deserve.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* STATS SECTION */}
      {/* ============================================================ */}
      <section className="max-w-7xl mx-auto px-6 -mt-4 pb-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <AnimatedSection key={index} animation={scaleUp} className="text-center">
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
                  <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Icon className="text-green-600 text-xl" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                </div>
              </AnimatedSection>
            )
          })}
        </div>
      </section>

      {/* ============================================================ */}
      {/* MISSION & VISION */}
      {/* ============================================================ */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <AnimatedSection animation={fadeInLeft} className="bg-green-50 rounded-2xl border border-green-100 p-8 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center">
                  <FiHeart className="text-white text-xl" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-900">Our Mission</h2>
              </div>
              <p className="text-gray-700 leading-relaxed">
                To provide compassionate, high-quality healthcare services that are accessible, affordable, 
                and patient-centered, improving the health and well-being of our community through excellence in medical care.
              </p>
            </AnimatedSection>

            <AnimatedSection animation={fadeInRight} className="bg-green-50 rounded-2xl border border-green-100 p-8 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center">
                  <FiShield className="text-white text-xl" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-900">Our Vision</h2>
              </div>
              <p className="text-gray-700 leading-relaxed">
                To be the leading community hospital in Ghana, recognized for excellence in patient care, 
                medical innovation, and community health improvement, setting the standard for healthcare delivery in the region.
              </p>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* CORE VALUES */}
      {/* ============================================================ */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <AnimatedSection className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-green-600 font-semibold text-sm uppercase tracking-wider">Our Values</span>
            <h2 className="mt-3 text-3xl font-medium text-gray-900">
              What We <span className="italic text-green-600">Stand For</span>
            </h2>
            <p className="mt-2 text-gray-600">
              These principles guide everything we do, from patient care to community engagement.
            </p>
          </AnimatedSection>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, threshold: 0.1 }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto"
          >
            {values.map((value, index) => {
              const Icon = value.icon
              const colorClasses = {
                red: 'bg-red-50 text-red-600 border-red-100',
                blue: 'bg-blue-50 text-blue-600 border-blue-100',
                green: 'bg-green-50 text-green-600 border-green-100',
                purple: 'bg-purple-50 text-purple-600 border-purple-100',
                orange: 'bg-orange-50 text-orange-600 border-orange-100',
                teal: 'bg-teal-50 text-teal-600 border-teal-100'
              }
              return (
                <motion.div
                  key={index}
                  variants={fadeUp}
                  className={`bg-white rounded-2xl border ${colorClasses[value.color]} p-6 hover:shadow-md transition-shadow`}
                >
                  <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center mb-4">
                    <Icon className="text-green-600 text-xl" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{value.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{value.desc}</p>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* TIMELINE */}
      {/* ============================================================ */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <AnimatedSection className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-green-600 font-semibold text-sm uppercase tracking-wider">Our Journey</span>
            <h2 className="mt-3 text-3xl font-medium text-gray-900">
              Our <span className="italic text-green-600">Story</span>
            </h2>
            <p className="mt-2 text-gray-600">
              From humble beginnings to becoming a trusted healthcare institution.
            </p>
          </AnimatedSection>

          <div className="max-w-4xl mx-auto relative">
            {/* Timeline line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-green-200 hidden md:block"></div>

            {timeline.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                viewport={{ once: true, threshold: 0.1 }}
                className={`flex flex-col md:flex-row items-center mb-10 ${
                  index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                }`}
              >
                <div className={`w-full md:w-5/12 ${index % 2 === 0 ? 'md:text-right md:pr-8' : 'md:text-left md:pl-8'}`}>
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
                    <span className="text-green-600 font-bold text-2xl">{item.year}</span>
                    <h3 className="text-lg font-semibold text-gray-900 mt-1">{item.title}</h3>
                    <p className="text-gray-600 text-sm mt-2 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
                <div className="relative z-10 w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm mx-4 hidden md:flex shadow-md shadow-green-600/20">
                  {index + 1}
                </div>
                <div className="w-full md:w-5/12"></div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* TEAM SECTION - FETCHED FROM API */}
      {/* ============================================================ */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <AnimatedSection className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-green-600 font-semibold text-sm uppercase tracking-wider">Leadership</span>
            <h2 className="mt-3 text-3xl font-medium text-gray-900">
              Meet Our <span className="italic text-green-600">Team</span>
            </h2>
            <p className="mt-2 text-gray-600">
              Dedicated professionals committed to excellence in healthcare.
            </p>
          </AnimatedSection>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
          ) : displayDoctors.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No doctors available at the moment.</p>
            </div>
          ) : (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, threshold: 0.1 }}
              className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto"
            >
              {displayDoctors.map((doctor, index) => (
                <motion.div
                  key={doctor._id || index}
                  variants={fadeUp}
                  className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 text-center hover:shadow-md transition-shadow"
                >
                  <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center text-4xl mx-auto mb-4 border-2 border-green-100">
                    {doctor.user?.profileImage ? (
                      <img 
                        src={doctor.user.profileImage} 
                        alt={doctor.user.firstName} 
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <FiUser className="text-green-600 text-2xl" />
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Dr. {doctor.user?.firstName || 'N/A'} {doctor.user?.lastName || ''}
                  </h3>
                  <p className="text-green-600 text-sm font-medium">{doctor.specialization || 'Specialist'}</p>
                  <div className="flex items-center justify-center gap-1 mt-2 text-yellow-400">
                    <FiStar className="fill-current" />
                    <span className="text-sm text-gray-600">{doctor.rating?.toFixed(1) || '0.0'}</span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* ============================================================ */}
      {/* CONTACT CTA */}
      {/* ============================================================ */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl border border-green-200 p-10 md:p-14 text-center max-w-4xl mx-auto">
            <h2 className="text-2xl font-medium text-gray-900">Want to know more?</h2>
            <p className="text-gray-600 mt-2 max-w-md mx-auto">
              We'd love to hear from you. Reach out to us with any questions.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-4">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors shadow-sm"
              >
                <FiMail /> Contact Us
              </Link>
              <a
                href="tel:+233555000000"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-green-600 rounded-xl font-medium hover:bg-gray-50 transition-colors border border-green-200"
              >
                <FiPhone /> Call Us
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* EMERGENCY CTA */}
      {/* ============================================================ */}
      <section className="max-w-7xl mx-auto px-6 pb-16">
        <div className="rounded-2xl bg-green-700 text-white px-8 py-14 md:px-16 md:py-16 text-center relative overflow-hidden">
          <div aria-hidden="true" className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-green-500/30 blur-3xl" />
          <h2 className="text-2xl md:text-3xl font-medium max-w-2xl mx-auto relative">
            Need immediate medical assistance?
          </h2>
          <p className="mt-3 text-green-50 max-w-lg mx-auto relative">
            Our emergency line is answered around the clock.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4 relative">
            <a
              href="tel:+233555000000"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-white text-green-700 font-medium hover:bg-green-50 transition-colors"
            >
              <FiPhone /> +233 55 500 0000
            </a>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-full border border-white/30 text-white font-medium hover:bg-white/10 transition-colors"
            >
              Contact us
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default About