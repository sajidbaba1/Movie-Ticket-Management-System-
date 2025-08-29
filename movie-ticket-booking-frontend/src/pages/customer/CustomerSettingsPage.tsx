import React, { useState } from 'react';
import { Button, Card } from '../../components/ui';
import toast from 'react-hot-toast';

const CustomerSettingsPage: React.FC = () => {
  // const { user } = useAuth();
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    smsNotifications: false,
    movieReminders: true,
    promotionalOffers: true,
  });

  const [preferences, setPreferences] = useState({
    language: 'en',
    timezone: 'UTC-5',
    currency: 'USD',
  });

  const handleNotificationChange = (key: keyof typeof notifications) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handlePreferenceChange = (key: keyof typeof preferences, value: string) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = () => {
    toast.success('Settings saved successfully!');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-responsive py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings ⚙️</h1>
          <p className="text-gray-600">Manage your account preferences and notifications</p>
        </div>

        <div className="max-w-2xl mx-auto space-y-6">
          {/* Notifications */}
          <Card padding="lg">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Notifications</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">Email Notifications</p>
                  <p className="text-xs text-gray-500">Receive booking confirmations and updates via email</p>
                </div>
                <button
                  onClick={() => handleNotificationChange('emailNotifications')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full ${notifications.emailNotifications ? 'bg-primary-600' : 'bg-gray-200'
                    }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${notifications.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                      }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">SMS Notifications</p>
                  <p className="text-xs text-gray-500">Receive text messages for important updates</p>
                </div>
                <button
                  onClick={() => handleNotificationChange('smsNotifications')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full ${notifications.smsNotifications ? 'bg-primary-600' : 'bg-gray-200'
                    }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${notifications.smsNotifications ? 'translate-x-6' : 'translate-x-1'
                      }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">Movie Reminders</p>
                  <p className="text-xs text-gray-500">Get reminded about your upcoming bookings</p>
                </div>
                <button
                  onClick={() => handleNotificationChange('movieReminders')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full ${notifications.movieReminders ? 'bg-primary-600' : 'bg-gray-200'
                    }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${notifications.movieReminders ? 'translate-x-6' : 'translate-x-1'
                      }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">Promotional Offers</p>
                  <p className="text-xs text-gray-500">Receive updates about discounts and special offers</p>
                </div>
                <button
                  onClick={() => handleNotificationChange('promotionalOffers')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full ${notifications.promotionalOffers ? 'bg-primary-600' : 'bg-gray-200'
                    }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${notifications.promotionalOffers ? 'translate-x-6' : 'translate-x-1'
                      }`}
                  />
                </button>
              </div>
            </div>
          </Card>

          {/* Preferences */}
          <Card padding="lg">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Preferences</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Language
                </label>
                <select
                  value={preferences.language}
                  onChange={(e) => handlePreferenceChange('language', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Timezone
                </label>
                <select
                  value={preferences.timezone}
                  onChange={(e) => handlePreferenceChange('timezone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="UTC-8">Pacific Time (UTC-8)</option>
                  <option value="UTC-7">Mountain Time (UTC-7)</option>
                  <option value="UTC-6">Central Time (UTC-6)</option>
                  <option value="UTC-5">Eastern Time (UTC-5)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Currency
                </label>
                <select
                  value={preferences.currency}
                  onChange={(e) => handlePreferenceChange('currency', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="USD">US Dollar (USD)</option>
                  <option value="EUR">Euro (EUR)</option>
                  <option value="GBP">British Pound (GBP)</option>
                  <option value="CAD">Canadian Dollar (CAD)</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Privacy & Security */}
          <Card padding="lg">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Privacy & Security</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">Change Password</p>
                  <p className="text-xs text-gray-500">Update your account password</p>
                </div>
                <Button variant="outline" size="sm">
                  Change
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">Two-Factor Authentication</p>
                  <p className="text-xs text-gray-500">Add an extra layer of security to your account</p>
                </div>
                <Button variant="outline" size="sm">
                  Enable
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">Download My Data</p>
                  <p className="text-xs text-gray-500">Get a copy of your personal data</p>
                </div>
                <Button variant="outline" size="sm">
                  Download
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-600">Delete Account</p>
                  <p className="text-xs text-gray-500">Permanently delete your account and all data</p>
                </div>
                <Button variant="outline" size="sm" className="text-red-600 border-red-300 hover:bg-red-50">
                  Delete
                </Button>
              </div>
            </div>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button variant="primary" onClick={handleSave}>
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerSettingsPage;