import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../constants';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center mb-4">
              <div className="h-8 w-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">🎬</span>
              </div>
              <span className="ml-2 text-xl font-bold">Movie Booking</span>
            </div>
            <p className="text-gray-300 text-sm">
              Your premier destination for booking movie tickets online.
              Discover the latest movies and find theaters near you.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to={ROUTES.MOVIES}
                  className="text-gray-300 hover:text-white transition-colors duration-200"
                >
                  Movies
                </Link>
              </li>
              <li>
                <Link
                  to={ROUTES.THEATERS}
                  className="text-gray-300 hover:text-white transition-colors duration-200"
                >
                  Theaters
                </Link>
              </li>
              <li>
                <Link
                  to={ROUTES.HOME}
                  className="text-gray-300 hover:text-white transition-colors duration-200"
                >
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Features */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Features</h3>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li>🎫 Online Ticket Booking</li>
              <li>🏢 Theater Management</li>
              <li>🎬 Movie Listings</li>
              <li>👥 User Management</li>
              <li>📱 Responsive Design</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <div className="space-y-2 text-gray-300 text-sm">
              <p>📧 support@moviebooking.com</p>
              <p>📞 +1 (555) 123-4567</p>
              <p>📍 123 Movie Street, Cinema City, CC 12345</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-300 text-sm">
            © 2025 Movie Booking System. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-gray-300 hover:text-white text-sm transition-colors duration-200">
              Privacy Policy
            </a>
            <a href="#" className="text-gray-300 hover:text-white text-sm transition-colors duration-200">
              Terms of Service
            </a>
            <a href="#" className="text-gray-300 hover:text-white text-sm transition-colors duration-200">
              Help
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;