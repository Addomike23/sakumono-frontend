import { useState, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import { HiMenu, HiX } from "react-icons/hi";
import { FiUser, FiLogOut, FiSettings, FiUser as FiUserIcon } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/services", label: "Services" },
  { to: "/about", label: "About" },
  { to: "/doctors", label: "Doctors" },
  { to: "/blog", label: "Blog" },
  { to: "/shop", label: "Pharmacy" },
  { to: "/reviews", label: "Reviews" },
  { to: "/contact", label: "Contact" },
];

const dashboardPath = (role) => {
  if (role === "admin") return "/admin/dashboard";
  if (role === "doctor") return "/doctor/dashboard";
  return "/patient/dashboard";
};

const profilePath = (role) => {
  if (role === "admin") return "/admin/profile";
  if (role === "doctor") return "/doctor/profile";
  return "/patient/profile";
};

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { isAuthenticated, user, role, logout } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    setOpen(false);
  };

  const getInitials = (firstName, lastName) => {
    if (!firstName && !lastName) return "U";
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase() || "U";
  };

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/90 backdrop-blur-md shadow-sm py-3"
          : "bg-transparent py-6"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <span className="font-['Fraunces'] text-xl md:text-2xl font-medium text-[#1a3a2a]">
            Sakumono
          </span>
          <span className="hidden sm:inline font-mono text-[10px] uppercase tracking-[0.25em] text-[#B8863E] pt-1">
            Community Hospital
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `text-sm font-medium transition-colors ${
                  isActive ? "text-[#2e7d32]" : "text-[#16241F]/70 hover:text-[#2e7d32]"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        {/* Desktop Auth */}
        <div className="hidden lg:flex items-center gap-4">
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-3 px-3 py-2 rounded-full hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200"
              >
                {/* Profile Image or Initials */}
                {user?.profileImage ? (
                  <img
                    src={user.profileImage}
                    alt={`${user.firstName} ${user.lastName}`}
                    className="w-9 h-9 rounded-full object-cover border-2 border-[#2e7d32]"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-[#2e7d32] flex items-center justify-center text-white font-semibold text-sm">
                    {getInitials(user?.firstName, user?.lastName)}
                  </div>
                )}
                <span className="text-sm font-medium text-[#16241F]">
                  {user?.firstName || "User"}
                </span>
                <span className="text-xs text-gray-400">▼</span>
              </button>

              {/* Dropdown */}
              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-[#16241F]">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-[#2e7d32]/10 text-[#2e7d32] capitalize">
                      {role || "patient"}
                    </span>
                  </div>

                  <Link
                    to={dashboardPath(role)}
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#16241F] hover:bg-gray-50 transition-colors"
                  >
                    <FiUser className="text-gray-400" size={16} />
                    Dashboard
                  </Link>

                  <Link
                    to={profilePath(role)}
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#16241F] hover:bg-gray-50 transition-colors"
                  >
                    <FiSettings className="text-gray-400" size={16} />
                    Profile Settings
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-gray-100 mt-1"
                  >
                    <FiLogOut className="text-red-400" size={16} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-[#16241F]/70 hover:text-[#2e7d32]">
                Log in
              </Link>
              <Link
                to="/patient/appointments/new"
                className="text-sm font-medium px-5 py-2.5 rounded-full bg-[#B8863E] text-white hover:bg-[#a07535] transition-colors shadow-sm"
              >
                Book Appointment
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="lg:hidden text-2xl text-[#16241F]"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <HiX /> : <HiMenu />}
        </button>
      </nav>

      {/* Mobile Menu */}
      {open && (
        <div className="lg:hidden mt-4 px-6 pb-6 flex flex-col gap-4 bg-white/95 backdrop-blur-md shadow-lg">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setOpen(false)}
              className="text-base font-medium text-[#16241F]/80 hover:text-[#2e7d32]"
            >
              {link.label}
            </NavLink>
          ))}
          <hr className="border-gray-100" />
          {isAuthenticated ? (
            <>
              <div className="flex items-center gap-3 py-2">
                {user?.profileImage ? (
                  <img
                    src={user.profileImage}
                    alt={`${user.firstName} ${user.lastName}`}
                    className="w-10 h-10 rounded-full object-cover border-2 border-[#2e7d32]"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-[#2e7d32] flex items-center justify-center text-white font-semibold text-sm">
                    {getInitials(user?.firstName, user?.lastName)}
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-[#16241F]">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                </div>
              </div>
              <Link
                to={dashboardPath(role)}
                onClick={() => setOpen(false)}
                className="text-sm font-medium text-[#2e7d32] hover:underline"
              >
                Dashboard
              </Link>
              <Link
                to={profilePath(role)}
                onClick={() => setOpen(false)}
                className="text-sm font-medium text-[#2e7d32] hover:underline"
              >
                Profile Settings
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm font-medium text-red-600 hover:text-red-700 text-left"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setOpen(false)} className="text-sm font-medium text-[#2e7d32]">
                Log in
              </Link>
              <Link
                to="/patient/appointments/new"
                onClick={() => setOpen(false)}
                className="text-center px-5 py-3 rounded-full bg-[#B8863E] text-white font-medium"
              >
                Book Appointment
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;