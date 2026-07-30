import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiArrowUpRight,
  FiHeart,
  FiActivity,
  FiShield,
  FiClock,
  FiPhoneCall,
  FiUsers,
  FiAward,
  FiThermometer,
  FiFeather,
  FiEye,
  FiWind,
  FiStar,
  FiUser,
  FiSearch,
  FiMapPin,
  FiMail,
  FiFacebook,
  FiTwitter,
  FiYoutube,
  FiLinkedin,
  FiChevronRight,
  FiCalendar,
  FiCheckCircle,
  FiMessageSquare,
  FiThumbsUp
} from "react-icons/fi";
import { doctorsApi } from "../../api/doctors.api";
import { blogsApi } from "../../api/blogs.api";
import { reviewsApi } from "../../api/reviews.api";
import { heroApi } from "../../api/hero.api";
import toast from "react-hot-toast";

const IMG = "https://themewagon.github.io/Clinic/assets/img/health";

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.08, ease: "easeOut" },
  }),
};

const textVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" }
  },
  exit: { 
    opacity: 0, 
    y: -20,
    transition: { duration: 0.3 }
  }
};

const DEPARTMENTS = [
  {
    title: "Cardiovascular Medicine",
    desc: "Advanced diagnostic imaging and interventional procedures for comprehensive heart health management with personalized treatment protocols.",
    tags: ["24/7 Cardiac Care", "Minimally Invasive"],
    icon: FiHeart,
    image: `${IMG}/cardiology-1.webp`,
  },
  {
    title: "Neurological Sciences",
    desc: "Cutting-edge neuroimaging and neurosurgical expertise for complex brain and spinal cord conditions with innovative treatment approaches.",
    tags: ["Advanced Imaging", "Robotic Surgery"],
    icon: FiActivity,
    image: `${IMG}/neurology-4.webp`,
  },
  {
    title: "Orthopedic Surgery",
    desc: "Comprehensive musculoskeletal care utilizing advanced arthroscopic techniques and joint replacement procedures.",
    tags: ["Sports Medicine", "Joint Replacement"],
    icon: FiFeather,
    image: `${IMG}/facilities-6.webp`,
  },
  {
    title: "Pediatric Care",
    desc: "Child-centered healthcare services from newborn to adolescence with family-focused treatment approaches.",
    tags: ["Neonatal ICU", "Developmental Care"],
    icon: FiThermometer,
    image: `${IMG}/maternal-2.webp`,
  },
  {
    title: "Cancer Treatment",
    desc: "Multidisciplinary oncology program offering personalized cancer care with latest therapeutic innovations.",
    tags: ["Precision Medicine", "Immunotherapy"],
    icon: FiEye,
    image: `${IMG}/consultation-4.webp`,
  },
  {
    title: "Pulmonary Medicine",
    desc: "Comprehensive respiratory care from diagnostics to long-term therapeutic support for better breathing health.",
    tags: ["Respiratory Therapy", "Sleep Medicine"],
    icon: FiWind,
    image: `${IMG}/emergency-1.webp`,
  },
];

const FEATURED_SERVICES = [
  { title: "Maternal Care", desc: "Expert pregnancy & delivery support", icon: FiShield, image: `${IMG}/maternal-2.webp` },
  { title: "Vaccination", desc: "Complete immunization programs", icon: FiActivity, image: `${IMG}/vaccination-3.webp` },
  { title: "Emergency Care", desc: "24/7 critical care services", icon: FiClock, image: `${IMG}/emergency-1.webp` },
  { title: "Advanced Technology", desc: "State-of-the-art medical equipment", icon: FiHeart, image: `${IMG}/facilities-6.webp` },
];

const WHY_US = [
  {
    icon: FiShield,
    title: "Advanced Technology",
    desc: "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
  },
  {
    icon: FiClock,
    title: "24/7 Availability",
    desc: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur excepteur.",
  },
  {
    icon: FiHeart,
    title: "Expert Team",
    desc: "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium totam rem.",
  },
];

const FALLBACK_HERO = {
  id: 1,
  title: "Excellence in Healthcare",
  highlight: "With Compassionate Care",
  description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  ctaText: "Book an appointment",
  ctaLink: "/patient/appointments/new",
  secondaryCta: "Meet our doctors",
  secondaryLink: "/doctors",
  stats: [
    { value: "13+", label: "Years Experience" },
    { value: "4,450+", label: "Patients Treated" },
    { value: "45+", label: "Medical Experts" }
  ],
  trustBadges: [
    { label: "Accredited", icon: "FiShield" },
    { label: "24/7 Emergency", icon: "FiClock" },
    { label: "4.9/5 Rating", icon: "FiAward" }
  ]
};

const Home = () => {
  const [doctors, setDoctors] = useState([]);
  const [posts, setPosts] = useState([]);
  const [reviewStats, setReviewStats] = useState(null);
  const [topReviews, setTopReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [heroMessages, setHeroMessages] = useState([]);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isHeroLoading, setIsHeroLoading] = useState(true);

  useEffect(() => {
    fetchHomeData();
    fetchHeroMessage();
  }, []);

  useEffect(() => {
    if (heroMessages.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % heroMessages.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [heroMessages]);

  const fetchHeroMessage = async () => {
    setIsHeroLoading(true);
    try {
      const response = await heroApi.getHeroMessages();
      if (response?.success && response?.message) {
        let messages = [];
        if (response.message.heroMessages && Array.isArray(response.message.heroMessages)) {
          messages = response.message.heroMessages;
        } else if (Array.isArray(response.message)) {
          messages = response.message;
        } else if (response.message.id || response.message.title) {
          messages = [response.message];
        }
        if (messages.length > 0) {
          setHeroMessages(messages);
        } else {
          setHeroMessages([FALLBACK_HERO]);
        }
      } else {
        setHeroMessages([FALLBACK_HERO]);
      }
    } catch (error) {
      setHeroMessages([FALLBACK_HERO]);
      toast.error('Failed to load hero content');
    } finally {
      setIsHeroLoading(false);
    }
  };

  const fetchHomeData = async () => {
    setLoading(true);
    try {
      const doctorsRes = await doctorsApi.getTop(6);
      setDoctors(doctorsRes.data.doctors || []);

      const blogsRes = await blogsApi.getRecent(3);
      setPosts(blogsRes.data.blogs || []);

      try {
        const reviewsRes = await reviewsApi.getAll({ limit: 3, minRating: 4 });
        setReviewStats(reviewsRes.data.stats);
        setTopReviews(reviewsRes.data.reviews || []);
      } catch (err) {
      toast.error('Failed to load some content');
        
      }
    } catch (error) {
      
      toast.error('Failed to load some content');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    const filled = Math.round(rating || 0);
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <FiStar
            key={star}
            className={`${star <= filled ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`}
            size={14}
          />
        ))}
      </div>
    );
  };

  const formatDate = (date) => {
    if (!date) return 'Recent';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const getAvatarColor = (name) => {
    const colors = [
      'bg-blue-100 text-blue-600',
      'bg-green-100 text-green-600',
      'bg-purple-100 text-purple-600',
      'bg-pink-100 text-pink-600',
      'bg-indigo-100 text-indigo-600',
      'bg-teal-100 text-teal-600',
      'bg-orange-100 text-orange-600',
      'bg-rose-100 text-rose-600'
    ];
    const index = name ? name.length % colors.length : 0;
    return colors[index];
  };

  const currentMessage = heroMessages[currentMessageIndex] || FALLBACK_HERO;

  if (isHeroLoading) {
    return (
      <div className="min-h-screen bg-white overflow-x-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-36 pb-24">
          <div className="animate-pulse">
            <div className="h-8 w-32 bg-gray-200 rounded mb-4" />
            <div className="h-16 w-3/4 bg-gray-200 rounded mb-4" />
            <div className="h-16 w-2/3 bg-gray-200 rounded mb-6" />
            <div className="h-6 w-1/2 bg-gray-200 rounded mb-8" />
            <div className="flex gap-4">
              <div className="h-12 w-48 bg-gray-200 rounded-full" />
              <div className="h-12 w-40 bg-gray-200 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-hidden">
      {/* ========== TOP BAR ========== */}
      <div className="bg-green-800 text-white text-sm py-2 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex justify-between items-center flex-wrap gap-2">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="flex items-center gap-2">
              <FiMapPin className="text-green-300 flex-shrink-0" /> Sakumono-Tema, Ghana
            </span>
            <span className="flex items-center gap-2">
              <FiMail className="text-green-300 flex-shrink-0" /> info@sakumonohospital.com
            </span>
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <span>Emergency Hotline: +233 55 500 0000</span>
            <div className="flex gap-3">
              <a href="#" className="hover:text-green-300 transition-colors"><FiFacebook size={16} /></a>
              <a href="#" className="hover:text-green-300 transition-colors"><FiTwitter size={16} /></a>
              <a href="#" className="hover:text-green-300 transition-colors"><FiYoutube size={16} /></a>
              <a href="#" className="hover:text-green-300 transition-colors"><FiLinkedin size={16} /></a>
            </div>
          </div>
        </div>
      </div>

      {/* ========== HERO ========== */}
      <section className="relative overflow-hidden bg-white pt-16 pb-24 md:pt-20 md:pb-32">
        <div
          aria-hidden="true"
          className="absolute -top-20 -right-24 w-96 h-96 rounded-full bg-green-100 blur-3xl animate-floatSlow"
        />
        <div
          aria-hidden="true"
          className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-green-50 blur-3xl"
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid lg:grid-cols-2 gap-8 lg:gap-16 relative">
          <div>
            {/* Trust Badges */}
            <motion.div 
              className="flex flex-wrap gap-2 sm:gap-3 mb-4"
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              key={`badges-${currentMessageIndex}`}
            >
              {currentMessage?.trustBadges?.map(({ label, icon: IconName }, index) => {
                const IconMap = {
                  FiShield: FiShield,
                  FiClock: FiClock,
                  FiAward: FiAward,
                  FiActivity: FiActivity,
                  FiHeart: FiHeart,
                  FiUsers: FiUsers
                };
                const Icon = IconMap[IconName] || FiShield;
                
                return (
                  <motion.span
                    key={label}
                    custom={index}
                    initial="hidden"
                    animate="visible"
                    variants={fadeUp}
                    className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-xs font-medium bg-green-50 border border-green-200 text-green-700"
                  >
                    <Icon className="text-sm" /> {label}
                  </motion.span>
                );
              })}
            </motion.div>

            {/* Animated Title */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentMessageIndex}
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={textVariants}
                className="relative"
              >
                <h1 className="text-3xl sm:text-4xl lg:text-[3.4rem] leading-[1.08] font-medium text-gray-900">
                  {currentMessage?.title || "Excellence in Healthcare"} <br />
                  <motion.span 
                    className="text-green-600 inline-block"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                  >
                    {currentMessage?.highlight || "With Compassionate Care"}
                  </motion.span>
                </h1>
                
                {/* Animated Description */}
                <motion.p 
                  className="mt-4 sm:mt-6 text-base md:text-lg text-gray-600 max-w-md leading-relaxed"
                  initial="hidden"
                  animate="visible"
                  variants={fadeUp}
                >
                  {currentMessage?.description || "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."}
                </motion.p>

                {/* Animated Stats */}
                <motion.div 
                  className="flex flex-wrap gap-4 sm:gap-6 mt-6 sm:mt-8"
                  initial="hidden"
                  animate="visible"
                  variants={fadeUp}
                >
                  {(currentMessage?.stats || [
                    { value: "13+", label: "Years Experience" },
                    { value: "4,450+", label: "Patients Treated" },
                    { value: "45+", label: "Medical Experts" }
                  ]).map((stat, index) => (
                    <motion.div
                      key={stat.label}
                      custom={index}
                      initial="hidden"
                      animate="visible"
                      variants={fadeUp}
                      className="px-4 sm:px-6 py-3 sm:py-4 rounded-xl bg-green-50 border border-green-100 hover:shadow-md transition-shadow flex-1 min-w-[80px] sm:min-w-[100px]"
                    >
                      <motion.p 
                        className="text-xl sm:text-2xl font-semibold text-green-700"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.4 + index * 0.1, type: "spring", stiffness: 200 }}
                      >
                        {stat.value}
                      </motion.p>
                      <p className="text-xs text-gray-500">{stat.label}</p>
                    </motion.div>
                  ))}
                </motion.div>

                {/* Animated CTAs */}
                <motion.div 
                  className="mt-6 sm:mt-9 flex flex-wrap items-center gap-3 sm:gap-4"
                  initial="hidden"
                  animate="visible"
                  variants={fadeUp}
                >
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link
                      to={currentMessage?.ctaLink || "/patient/appointments/new"}
                      className="inline-flex items-center gap-2 px-5 sm:px-7 py-3 sm:py-3.5 rounded-full bg-green-600 text-white font-medium shadow-lg shadow-green-600/20 hover:bg-green-700 transition-colors text-sm sm:text-base"
                    >
                      {currentMessage?.ctaText || "Book an appointment"} <FiArrowUpRight />
                    </Link>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link
                      to={currentMessage?.secondaryLink || "/doctors"}
                      className="inline-flex items-center gap-2 px-5 sm:px-7 py-3 sm:py-3.5 rounded-full border border-green-200 text-green-700 font-medium hover:bg-green-50 transition-colors text-sm sm:text-base"
                    >
                      {currentMessage?.secondaryCta || "Meet our doctors"}
                    </Link>
                  </motion.div>
                </motion.div>

                {/* Message Indicator Dots */}
                {heroMessages.length > 1 && (
                  <motion.div 
                    className="flex gap-2 mt-6 sm:mt-8"
                    initial="hidden"
                    animate="visible"
                    variants={fadeUp}
                  >
                    {heroMessages.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentMessageIndex(index)}
                        className={`h-2 rounded-full transition-all duration-300 ${
                          index === currentMessageIndex 
                            ? 'w-8 bg-green-600' 
                            : 'w-2 bg-gray-300 hover:bg-gray-400'
                        }`}
                        aria-label={`Go to message ${index + 1}`}
                      />
                    ))}
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Hero Card */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative"
          >
            <div className="rounded-2xl bg-white shadow-xl border border-gray-100 p-5 sm:p-7 md:p-8">
              <p className="text-green-700 font-semibold text-xs uppercase tracking-wider mb-4">
                Next Available
              </p>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3 rounded-xl bg-green-50">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Today 2:30 PM</p>
                    <p className="text-xs text-gray-500">Dr. Sarah Johnson</p>
                  </div>
                  <span className="text-xs font-medium text-green-700">Available</span>
                </div>
                <div className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3 rounded-xl bg-gray-50">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Tomorrow 9:00 AM</p>
                    <p className="text-xs text-gray-500">Dr. Michael Chen</p>
                  </div>
                  <span className="text-xs font-medium text-gray-500">Limited</span>
                </div>
                <div className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3 rounded-xl bg-gray-50">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Thu 11:15 AM</p>
                    <p className="text-xs text-gray-500">Dr. Amanda Foster</p>
                  </div>
                  <span className="text-xs font-medium text-gray-500">Available</span>
                </div>
              </div>
              
              <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-green-100 flex items-center justify-center text-green-700">
                    <FiPhoneCall className="text-sm sm:text-base" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Emergency Hotline</p>
                    <a href="tel:+233555000000" className="font-mono text-sm font-medium text-gray-900">
                      +233 55 500 0000
                    </a>
                  </div>
                </div>
                <FiChevronRight className="text-green-600" />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ========== ABOUT / COMPASSIONATE CARE ========== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeUp}
          >
            <span className="text-green-700 font-semibold text-sm uppercase tracking-wider">
              About Us
            </span>
            <h2 className="mt-3 text-2xl sm:text-3xl md:text-4xl font-medium text-gray-900">
              Compassionate Care, Advanced Medicine
            </h2>
            <p className="mt-4 sm:mt-6 text-gray-600 leading-relaxed">
              For over two decades, we've been dedicated to providing exceptional healthcare that combines cutting-edge medical technology with the personal touch our patients deserve.
            </p>
            <p className="mt-3 sm:mt-4 text-gray-600 leading-relaxed">
              Our multidisciplinary team of specialists works collaboratively to ensure every patient receives comprehensive care tailored to their unique needs.
            </p>
            <div className="grid grid-cols-3 gap-3 sm:gap-4 mt-6 sm:mt-8">
              <div className="text-center p-3 sm:p-4 rounded-xl bg-green-50">
                <p className="text-xl sm:text-2xl font-semibold text-green-700">12K+</p>
                <p className="text-[10px] sm:text-xs text-gray-500">Patients Served</p>
              </div>
              <div className="text-center p-3 sm:p-4 rounded-xl bg-green-50">
                <p className="text-xl sm:text-2xl font-semibold text-green-700">25+</p>
                <p className="text-[10px] sm:text-xs text-gray-500">Years of Excellence</p>
              </div>
              <div className="text-center p-3 sm:p-4 rounded-xl bg-green-50">
                <p className="text-xl sm:text-2xl font-semibold text-green-700">46</p>
                <p className="text-[10px] sm:text-xs text-gray-500">Medical Specialists</p>
              </div>
            </div>
            <div className="mt-6 sm:mt-8 flex items-center gap-3 bg-green-50 p-3 sm:p-4 rounded-xl border border-green-100">
              <FiClock className="text-green-700 text-lg sm:text-xl flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-900">24/7 Emergency Care</p>
                <p className="text-sm text-gray-500">Always here when you need us most</p>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="rounded-2xl overflow-hidden shadow-xl">
              <img
                src={`${IMG}/staff-10.webp`}
                alt="Compassionate Care"
                className="w-full h-64 sm:h-80 lg:h-96 object-cover"
                loading="lazy"
              />
            </div>
            <div className="absolute -bottom-4 sm:-bottom-6 -left-4 sm:-left-6 bg-white rounded-xl shadow-lg p-3 sm:p-4 border border-gray-100">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-green-100 flex items-center justify-center text-green-700">
                  <FiAward className="text-lg sm:text-xl" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm sm:text-base">25+ Years</p>
                  <p className="text-[10px] sm:text-xs text-gray-500">of Trusted Care</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ========== DEPARTMENTS ========== */}
      <section className="bg-green-50 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeUp}
            className="text-center max-w-2xl mx-auto mb-10 sm:mb-14"
          >
            <span className="text-green-700 font-semibold text-sm uppercase tracking-wider">
              Departments
            </span>
            <h2 className="mt-3 text-2xl sm:text-3xl md:text-4xl font-medium text-gray-900">
              Featured Departments
            </h2>
            <p className="mt-3 text-gray-600 text-sm sm:text-base">
              Necessitatibus eius consequatur ex aliquid fuga eum quidem sint consectetur velit
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {DEPARTMENTS.map((dept, i) => {
              const Icon = dept.icon;
              return (
                <motion.div
                  key={dept.title}
                  custom={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.3 }}
                  variants={fadeUp}
                  className="group rounded-2xl bg-white border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow"
                >
                  <div className="relative h-40 sm:h-48 bg-green-50 overflow-hidden">
                    <img
                      src={dept.image}
                      alt={dept.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute top-3 left-3 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-green-700 shadow-sm">
                      <Icon className="text-base sm:text-lg" />
                    </div>
                  </div>
                  <div className="p-4 sm:p-6">
                    <h3 className="font-semibold text-base sm:text-lg mb-2 text-gray-900">{dept.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">{dept.desc}</p>
                    <div className="flex flex-wrap gap-2 mt-3 sm:mt-4">
                      {dept.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs px-2 sm:px-3 py-1 rounded-full font-medium bg-green-50 text-green-700"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <Link
                      to="/services"
                      className="mt-4 sm:mt-5 inline-flex items-center gap-1 text-sm font-medium text-green-700 hover:gap-2 transition-all"
                    >
                      Explore {dept.title.split(" ")[0]} <FiArrowUpRight />
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========== FEATURED SERVICES ========== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeUp}
          className="text-center max-w-2xl mx-auto mb-10 sm:mb-14"
        >
          <span className="text-green-700 font-semibold text-sm uppercase tracking-wider">
            Services
          </span>
          <h2 className="mt-3 text-2xl sm:text-3xl md:text-4xl font-medium text-gray-900">
            Featured Services
          </h2>
          <p className="mt-3 text-gray-600 text-sm sm:text-base">
            Necessitatibus eius consequatur ex aliquid fuga eum quidem sint consectetur velit
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeUp}
            className="rounded-2xl overflow-hidden shadow-lg relative min-h-[300px] sm:min-h-[400px]"
          >
            <img
              src={`${IMG}/consultation-4.webp`}
              alt="Comprehensive Healthcare Excellence"
              className="w-full h-full object-cover absolute inset-0"
              loading="lazy"
            />
            <div className="relative bg-gradient-to-t from-green-900/90 via-green-900/40 to-transparent p-6 sm:p-10 h-full flex flex-col justify-end min-h-[300px] sm:min-h-[400px]">
              <h3 className="text-xl sm:text-2xl font-semibold text-white mb-2 sm:mb-3">
                Comprehensive Healthcare Excellence
              </h3>
              <p className="text-white/80 leading-relaxed max-w-lg text-sm sm:text-base">
                Mauris blandit aliquet elit, eget tincidunt nibh pulvinar a. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae donec velit neque.
              </p>
              <Link
                to="/services"
                className="mt-4 sm:mt-6 inline-flex items-center gap-2 bg-white text-green-700 px-5 sm:px-6 py-2.5 sm:py-3 rounded-full font-medium hover:bg-green-50 transition-colors w-fit shadow-lg text-sm sm:text-base"
              >
                Explore Our Services <FiArrowUpRight />
              </Link>
            </div>
          </motion.div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {FEATURED_SERVICES.map(({ title, desc, icon: Icon, image }, i) => (
              <motion.div
                key={title}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.4 }}
                variants={fadeUp}
                className="rounded-xl overflow-hidden relative group cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300"
              >
                <img
                  src={image}
                  alt={title}
                  className="w-full h-32 sm:h-40 object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <div className="absolute top-3 left-3 w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-white/90 flex items-center justify-center text-green-700">
                  <Icon className="text-xs sm:text-sm" />
                </div>
                <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3 right-2 sm:right-3">
                  <h4 className="font-semibold text-white text-xs sm:text-sm">{title}</h4>
                  <p className="text-gray-200 text-[10px] sm:text-xs">{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== DOCTORS ========== */}
      <section className="bg-green-50 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeUp}
            className="text-center max-w-2xl mx-auto mb-10 sm:mb-14"
          >
            <span className="text-green-700 font-semibold text-sm uppercase tracking-wider">
              Our Team
            </span>
            <h2 className="mt-3 text-2xl sm:text-3xl md:text-4xl font-medium text-gray-900">
              Find A Doctor
            </h2>
            <p className="mt-3 text-gray-600 text-sm sm:text-base">
              Necessitatibus eius consequatur ex aliquid fuga eum quidem sint consectetur velit
            </p>
          </motion.div>

          <div className="max-w-2xl mx-auto mb-8 sm:mb-12">
            <div className="relative flex items-center bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                <FiSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Find Your Perfect Healthcare Provider..."
                className="w-full pl-11 pr-4 py-2.5 sm:py-3 outline-none text-gray-700 text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button className="bg-green-600 hover:bg-green-700 text-white px-4 sm:px-6 py-2.5 sm:py-3 font-medium transition-colors text-sm">
                Search
              </button>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
                  <div className="aspect-[4/3] bg-gray-200" />
                  <div className="p-4 sm:p-5 space-y-3">
                    <div className="h-5 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                    <div className="h-4 bg-gray-200 rounded w-1/3" />
                  </div>
                </div>
              ))
            ) : doctors.length === 0 ? (
              <div className="col-span-full text-center py-12 bg-white rounded-2xl border border-gray-100">
                <p className="text-gray-500">No doctors available at the moment.</p>
              </div>
            ) : (
              doctors.map((doc, i) => (
                <motion.div
                  key={doc._id || i}
                  custom={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.3 }}
                  variants={fadeUp}
                >
                  <Link
                    to={doc.user?._id ? `/doctors/${doc.user._id}` : "/doctors"}
                    className="block bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow group"
                  >
                    <div className="relative aspect-[4/3] bg-green-50 flex items-center justify-center overflow-hidden">
                      {doc.user?.profileImage ? (
                        <img
                          src={doc.user.profileImage}
                          alt={`${doc.user.firstName} ${doc.user.lastName}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-green-50">
                          <FiUser className="text-5xl sm:text-6xl text-green-300" />
                        </div>
                      )}
                      {doc.experience && (
                        <div className="absolute top-3 left-3 bg-green-600 text-white text-xs font-medium px-2 sm:px-3 py-1 rounded-full">
                          {doc.experience} years
                        </div>
                      )}
                    </div>
                    <div className="p-4 sm:p-5 text-left">
                      <h3 className="font-semibold text-base sm:text-lg text-gray-900">
                        Dr. {doc.user?.firstName || 'N/A'} {doc.user?.lastName || ''}
                      </h3>
                      <p className="text-sm text-green-600 font-medium mt-1">
                        {doc.specialization || "Medical Specialist"}
                      </p>
                      {doc.rating > 0 && (
                        <div className="flex items-center gap-1 mt-2">
                          {renderStars(doc.rating)}
                          <span className="text-sm text-gray-600 ml-1">{doc.rating.toFixed(1)}</span>
                        </div>
                      )}
                      <span className="mt-3 sm:mt-4 inline-flex items-center gap-1 text-sm font-medium text-green-700 group-hover:gap-2 transition-all">
                        View profile <FiArrowUpRight />
                      </span>
                    </div>
                  </Link>
                </motion.div>
              ))
            )}
          </div>

          <div className="text-center mt-8 sm:mt-10">
            <Link
              to="/doctors"
              className="inline-flex items-center gap-2 px-6 sm:px-8 py-2.5 sm:py-3 rounded-full bg-green-600 text-white font-medium hover:bg-green-700 transition-colors shadow-lg shadow-green-600/20 text-sm sm:text-base"
            >
              View All Doctors <FiArrowUpRight />
            </Link>
          </div>
        </div>
      </section>

      {/* ========== TESTIMONIALS / REVIEWS SECTION ========== */}
      <section className="bg-gradient-to-b from-white to-gray-50 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeUp}
            className="text-center max-w-3xl mx-auto mb-10 sm:mb-14"
          >
            <span className="text-green-700 font-semibold text-sm uppercase tracking-wider inline-flex items-center gap-2">
              <FiMessageSquare className="text-green-600" /> Testimonials
            </span>
            <h2 className="mt-3 text-2xl sm:text-3xl md:text-4xl font-medium text-gray-900">
              What Our Patients Say
            </h2>
            <p className="mt-3 text-gray-500 max-w-xl mx-auto text-sm sm:text-base">
              Real stories from real people who trusted us with their care
            </p>
            {reviewStats && (
              <div className="mt-4 inline-flex flex-wrap items-center gap-3 sm:gap-4 bg-white px-4 sm:px-6 py-2 sm:py-3 rounded-full shadow-sm border border-gray-100">
                <div className="flex items-center gap-2">
                  <span className="text-xl sm:text-2xl font-bold text-green-700">{reviewStats.averageRating?.toFixed(1)}</span>
                  <div className="flex items-center gap-0.5">
                    {renderStars(Math.round(reviewStats.averageRating || 0))}
                  </div>
                </div>
                <div className="w-px h-5 sm:h-6 bg-gray-200" />
                <span className="text-sm text-gray-500">
                  {reviewStats.totalReviews} reviews
                </span>
                <div className="w-px h-5 sm:h-6 bg-gray-200" />
                <span className="text-sm text-green-600 font-medium">Verified</span>
              </div>
            )}
          </motion.div>

          <div className="grid md:grid-cols-3 gap-4 sm:gap-6">
            {topReviews.length === 0 ? (
              [
                { 
                  name: "Sarah Mensah", 
                  email: "sarah.m@email.com",
                  content: "Exceptional care and compassionate staff. Highly recommend Sakumono Community Hospital.", 
                  rating: 5,
                  date: "2024-01-15",
                  avatar: null
                },
                { 
                  name: "James Asare", 
                  email: "james.a@email.com",
                  content: "The doctors here are truly world-class. They saved my life with their quick thinking and expertise.", 
                  rating: 5,
                  date: "2024-01-10",
                  avatar: null
                },
                { 
                  name: "Ama Serwaa", 
                  email: "ama.s@email.com",
                  content: "Best healthcare experience in Tema. The facility is modern and the staff are incredibly caring.", 
                  rating: 5,
                  date: "2024-01-05",
                  avatar: null
                }
              ].map((review, i) => (
                <motion.div
                  key={i}
                  custom={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.4 }}
                  variants={fadeUp}
                  className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 p-5 sm:p-6 hover:-translate-y-1"
                >
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-semibold text-base sm:text-lg flex-shrink-0 ${getAvatarColor(review.name)}`}>
                      {getInitials(review.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 text-sm sm:text-base">{review.name}</h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <FiMail size={12} className="text-gray-400" />
                        <span className="text-xs text-gray-400 truncate">{review.email}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3">
                    {renderStars(review.rating)}
                    <div className="flex items-center gap-2 mt-1">
                      <FiCalendar size={12} className="text-gray-300" />
                      <span className="text-xs text-gray-400">{formatDate(review.date)}</span>
                      <span className="w-1 h-1 rounded-full bg-green-400" />
                      <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                        <FiCheckCircle size={12} /> Verified
                      </span>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm leading-relaxed mt-3 italic line-clamp-3">
                    "{review.content}"
                  </p>

                  <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <FiThumbsUp size={12} className="text-green-500" /> Helpful
                      </span>
                      <span className="flex items-center gap-1">
                        <FiHeart size={12} className="text-red-400" /> Like
                      </span>
                    </div>
                    <span className="text-xs text-green-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      Read more →
                    </span>
                  </div>
                </motion.div>
              ))
            ) : (
              topReviews.map((rev, i) => {
                const reviewerName = rev.name || rev.patient?.name || 'Anonymous';
                const reviewerEmail = rev.email || rev.patient?.email || '';
                const reviewerAvatar = rev.avatar || rev.patient?.profileImage || null;
                
                return (
                  <motion.div
                    key={rev._id || i}
                    custom={i}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.4 }}
                    variants={fadeUp}
                    className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 p-5 sm:p-6 hover:-translate-y-1"
                  >
                    <div className="flex items-start gap-3 sm:gap-4">
                      {reviewerAvatar ? (
                        <img
                          src={reviewerAvatar}
                          alt={reviewerName}
                          className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-green-100 flex-shrink-0"
                        />
                      ) : (
                        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-semibold text-base sm:text-lg flex-shrink-0 ${getAvatarColor(reviewerName)}`}>
                          {getInitials(reviewerName)}
                        </div>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 text-sm sm:text-base">{reviewerName}</h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <FiMail size={12} className="text-gray-400" />
                          <span className="text-xs text-gray-400 truncate">{reviewerEmail || 'No email provided'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3">
                      {renderStars(rev.rating || 5)}
                      <div className="flex items-center gap-2 mt-1">
                        <FiCalendar size={12} className="text-gray-300" />
                        <span className="text-xs text-gray-400">{formatDate(rev.createdAt || rev.date)}</span>
                        {rev.isVerified && (
                          <>
                            <span className="w-1 h-1 rounded-full bg-green-400" />
                            <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                              <FiCheckCircle size={12} /> Verified
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <p className="text-gray-600 text-sm leading-relaxed mt-3 italic line-clamp-4">
                      "{rev.content || 'Great experience!'}"
                    </p>

                    {rev.doctor && (
                      <div className="mt-3 flex items-center gap-2 text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
                        <FiUser size={12} className="text-green-500" />
                        <span>Doctor: Dr. {rev.doctor.firstName} {rev.doctor.lastName}</span>
                        {rev.doctor.specialization && (
                          <span className="text-gray-400">• {rev.doctor.specialization}</span>
                        )}
                      </div>
                    )}

                    <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                      <div className="flex items-center gap-3 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <FiThumbsUp size={12} className="text-green-500" /> Helpful
                        </span>
                        <span className="flex items-center gap-1">
                          <FiHeart size={12} className="text-red-400" /> Like
                        </span>
                      </div>
                      <Link
                        to={`/reviews/${rev._id}`}
                        className="text-xs text-green-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1"
                      >
                        Read more <FiArrowUpRight size={12} />
                      </Link>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.4 }}
            variants={fadeUp}
            className="text-center mt-8 sm:mt-10"
          >
            <Link
              to="/reviews"
              className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 bg-green-600 text-white rounded-full font-medium hover:bg-green-700 transition-colors shadow-lg shadow-green-600/20 text-sm sm:text-base"
            >
              Read All Reviews <FiArrowUpRight />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ========== WHY CHOOSE US ========== */}
      <section className="bg-green-50 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeUp}
            className="text-center max-w-2xl mx-auto mb-10 sm:mb-14"
          >
            <span className="text-green-700 font-semibold text-sm uppercase tracking-wider">
              Why Choose Us
            </span>
            <h2 className="mt-3 text-2xl sm:text-3xl md:text-4xl font-medium text-gray-900">
              Excellence in Medical Care, Every Day
            </h2>
            <p className="mt-3 text-gray-600 text-sm sm:text-base">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-4 sm:gap-6">
            {WHY_US.map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.4 }}
                variants={fadeUp}
                className="p-6 sm:p-8 rounded-2xl bg-white border border-gray-100 hover:shadow-xl transition-shadow text-center"
              >
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-green-50 flex items-center justify-center text-green-700 text-xl sm:text-2xl mx-auto mb-4 sm:mb-5">
                  <Icon />
                </div>
                <h3 className="font-semibold text-lg sm:text-xl mb-2 sm:mb-3 text-gray-900">{title}</h3>
                <p className="text-gray-600 leading-relaxed text-sm sm:text-base">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== EMERGENCY CTA ========== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
          variants={fadeUp}
          className="rounded-2xl bg-green-700 text-white px-6 sm:px-8 py-12 sm:py-16 md:px-16 md:py-20 text-center relative overflow-hidden"
        >
          <div
            aria-hidden="true"
            className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-green-500/30 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-green-500/30 blur-3xl"
          />
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-medium max-w-2xl mx-auto relative">
            Need Immediate Medical Assistance?
          </h2>
          <p className="mt-3 sm:mt-4 text-green-50 max-w-lg mx-auto relative text-sm sm:text-base">
            Our emergency response team is available around the clock to provide immediate medical support when you need it most.
          </p>
          <div className="mt-6 sm:mt-8 flex flex-wrap justify-center gap-3 sm:gap-4 relative">
            <a
              href="tel:+233555000000"
              className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 rounded-full bg-white text-green-700 font-medium hover:bg-green-50 transition-colors text-sm sm:text-base"
            >
              <FiPhoneCall /> +233 55 500 0000
            </a>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 rounded-full border border-white/30 text-white font-medium hover:bg-white/10 transition-colors text-sm sm:text-base"
            >
              Contact Us <FiArrowUpRight />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ========== BLOG PREVIEW ========== */}
      <section className="bg-green-50 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeUp}
            className="text-center max-w-2xl mx-auto mb-10 sm:mb-14"
          >
            <span className="text-green-700 font-semibold text-sm uppercase tracking-wider">
              Blog
            </span>
            <h2 className="mt-3 text-2xl sm:text-3xl md:text-4xl font-medium text-gray-900">
              Health Tips Worth Reading
            </h2>
            <p className="mt-3 text-gray-600 text-sm sm:text-base">
              Stay informed with our latest health articles and medical insights
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-4 sm:gap-6">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
                  <div className="aspect-[16/10] bg-gray-200" />
                  <div className="p-5 sm:p-6 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-1/3" />
                    <div className="h-5 bg-gray-200 rounded w-3/4" />
                  </div>
                </div>
              ))
            ) : posts.length === 0 ? (
              <div className="col-span-full text-center py-12 bg-white rounded-2xl border border-gray-100">
                <p className="text-gray-500">No blog posts available.</p>
              </div>
            ) : (
              posts.map((post, i) => (
                <motion.div
                  key={post._id || i}
                  custom={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.4 }}
                  variants={fadeUp}
                >
                  <Link
                    to={post.slug ? `/blog/${post.slug}` : "/blog"}
                    className="block bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow group"
                  >
                    <div className="aspect-[16/10] bg-green-50 overflow-hidden">
                      {post.featuredImage ? (
                        <img
                          src={post.featuredImage}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl text-green-300">
                          📖
                        </div>
                      )}
                    </div>
                    <div className="p-5 sm:p-6">
                      <span className="text-green-700 font-semibold text-xs uppercase tracking-wider">
                        {post.category || "Health Tips"}
                      </span>
                      <h3 className="font-semibold text-base sm:text-lg mt-2 leading-snug text-gray-900 line-clamp-2">
                        {post.title || "New posts arriving soon"}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                        {post.excerpt || ""}
                      </p>
                    </div>
                  </Link>
                </motion.div>
              ))
            )}
          </div>

          <div className="text-center mt-8 sm:mt-10">
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 px-6 sm:px-8 py-2.5 sm:py-3 rounded-full bg-green-600 text-white font-medium hover:bg-green-700 transition-colors shadow-lg shadow-green-600/20 text-sm sm:text-base"
            >
              Read More Articles <FiArrowUpRight />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;