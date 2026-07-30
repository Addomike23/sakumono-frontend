import { Link } from "react-router-dom";
import { FiPhone, FiMail, FiMapPin, FiCheckCircle } from "react-icons/fi";
import { useState } from "react";
import { subscriptionApi } from "../../api/contact.api";
import toast from "react-hot-toast";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    
    // Validate email
    if (!email || !email.includes('@')) {
      toast.error("Please enter a valid email address");
      return;
    }
    
    setLoading(true);
    try {
      const response = await subscriptionApi.subscribe({ 
        email, 
        source: "website" 
      });
      
      toast.success(response.data?.message || "Thanks for subscribing!");
      setEmail("");
      setSubscribed(true);
      
      // Reset subscribed state after 5 seconds
      setTimeout(() => setSubscribed(false), 5000);
    } catch (err) {
      console.error("Subscription error:", err);
      
      // Handle duplicate subscription
      if (err?.response?.status === 409) {
        toast.error(err?.response?.data?.message || "You are already subscribed");
      } else {
        toast.error(err?.response?.data?.message || "Could not subscribe. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="bg-[#16241F] text-white/90">
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Brand */}
        <div>
          <h3 className="font-['Fraunces'] text-2xl text-white mb-3">Sakumono</h3>
          <p className="text-sm text-white/60 leading-relaxed">
            Your health, our priority. Community-first care for Sakumono-Tema
            and beyond.
          </p>
          <div className="mt-4 flex items-center gap-2 text-sm text-white/40">
            <FiCheckCircle className="text-emerald-400" />
            <span>Trusted since 2000</span>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-xs uppercase tracking-wider text-white/50 mb-4 font-semibold">Explore</h4>
          <ul className="space-y-2.5 text-sm">
            <li>
              <Link to="/doctors" className="text-white/60 hover:text-emerald-400 transition-colors">
                Find a Doctor
              </Link>
            </li>
            <li>
              <Link to="/services" className="text-white/60 hover:text-emerald-400 transition-colors">
                Our Services
              </Link>
            </li>
            <li>
              <Link to="/blog" className="text-white/60 hover:text-emerald-400 transition-colors">
                Health Blog
              </Link>
            </li>
            <li>
              <Link to="/shop" className="text-white/60 hover:text-emerald-400 transition-colors">
                Pharmacy
              </Link>
            </li>
            <li>
              <Link to="/reviews" className="text-white/60 hover:text-emerald-400 transition-colors">
                Patient Stories
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-xs uppercase tracking-wider text-white/50 mb-4 font-semibold">Contact</h4>
          <ul className="space-y-3 text-sm text-white/60">
            <li className="flex items-start gap-3">
              <FiMapPin className="text-emerald-400 mt-0.5 flex-shrink-0" />
              <span>Sakumono-Tema, Accra, Ghana</span>
            </li>
            <li className="flex items-center gap-3">
              <FiPhone className="text-emerald-400 flex-shrink-0" />
              <a href="tel:+233555123456" className="hover:text-emerald-400 transition-colors">
                +233 555 123 456
              </a>
            </li>
            <li className="flex items-center gap-3">
              <FiMail className="text-emerald-400 flex-shrink-0" />
              <a href="mailto:care@sakumonohospital.org" className="hover:text-emerald-400 transition-colors">
                care@sakumonohospital.org
              </a>
            </li>
          </ul>
        </div>

        {/* Newsletter */}
        <div>
          <h4 className="text-xs uppercase tracking-wider text-white/50 mb-4 font-semibold">
            Health Tips, Monthly
          </h4>
          <p className="text-sm text-white/40 mb-4">
            Subscribe to receive health tips and hospital updates.
          </p>
          
          {subscribed ? (
            <div className="flex items-center gap-2 text-emerald-400 text-sm">
              <FiCheckCircle size={18} />
              <span>Subscribed successfully!</span>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                className="flex-1 min-w-0 px-4 py-2.5 rounded-lg bg-white/10 text-sm placeholder:text-white/40 border border-white/15 focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400 transition-colors"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 rounded-lg bg-emerald-600 text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {loading ? (
                  <span className="flex items-center gap-1">
                    <span className="animate-spin inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                  </span>
                ) : (
                  "Join"
                )}
              </button>
            </form>
          )}
          
          <p className="text-xs text-white/30 mt-3">
            No spam. Unsubscribe anytime.
          </p>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10 py-6 text-center text-xs text-white/40">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-center items-center gap-4">
          <span>© {new Date().getFullYear()} Sakumono Community Hospital. All rights reserved.</span>
          <span className="hidden sm:inline text-white/20">|</span>
          <Link to="/privacy" className="hover:text-emerald-400 transition-colors">Privacy Policy</Link>
          <span className="text-white/20">|</span>
          <Link to="/terms" className="hover:text-emerald-400 transition-colors">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;