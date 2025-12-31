import React, { useState, useEffect } from 'react';
import { Settings, User, Bell, Palette, Lock, CreditCard, Cloud, Shield, Download, Trash2 } from 'lucide-react'; // Importing icons for settings sections

const SettingsPage = () => {
  // State for various settings, can be expanded as needed
  const [username, setUsername] = useState('John Doe');
  const [email, setEmail] = useState('john.doe@example.com');
  const [receiveNotifications, setReceiveNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [privacySetting, setPrivacySetting] = useState('public'); // 'public', 'private', 'friends'
  const [integrationEnabled, setIntegrationEnabled] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('Visa **** 1234'); // Placeholder for billing

  // State for displaying success/error messages
  const [message, setMessage] = useState({ text: '', type: '' }); // type: 'success' or 'error'

  // Function to show a temporary message
  const showMessage = (text, type) => {
    setMessage({ text, type });
    const timer = setTimeout(() => {
      setMessage({ text: '', type: '' });
    }, 3000); // Message disappears after 3 seconds
    return () => clearTimeout(timer);
  };

  // Function to handle saving changes (placeholder for actual API call)
  const handleSaveChanges = (e) => {
    e.preventDefault();
    // In a real application, you would send this data to your backend
    console.log('Saving general settings:', { username, email });
    showMessage('Profile settings saved successfully!', 'success');
  };

  // Function to handle password change (placeholder)
  const handleChangePassword = (e) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      showMessage('New password and confirm password do not match.', 'error');
      return;
    }
    // In a real application, send old and new passwords to backend for verification and update
    console.log('Changing password...');
    showMessage('Password changed successfully!', 'success');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
  };

  // Function to handle notification toggle
  const handleNotificationToggle = () => {
    setReceiveNotifications(!receiveNotifications);
    showMessage(`Notifications ${!receiveNotifications ? 'enabled' : 'disabled'}.`, 'success');
  };

  // Function to handle dark mode toggle
  const handleDarkModeToggle = () => {
    setDarkMode(!darkMode);
    // In a real app, you would apply the dark mode class to the body or root element
    document.documentElement.classList.toggle('dark', !darkMode);
    showMessage(`Dark mode ${!darkMode ? 'enabled' : 'disabled'}.`, 'success');
  };

  // Function to handle privacy setting change
  const handlePrivacyChange = (e) => {
    setPrivacySetting(e.target.value);
    showMessage(`Privacy setting updated to: ${e.target.value}`, 'success');
  };

  // Function to handle integration toggle
  const handleIntegrationToggle = () => {
    setIntegrationEnabled(!integrationEnabled);
    showMessage(`Integration ${!integrationEnabled ? 'enabled' : 'disabled'}.`, 'success');
  };

  // Function for data export (placeholder)
  const handleExportData = () => {
    console.log('Exporting user data...');
    showMessage('Your data export has started. You will receive an email shortly.', 'success');
  };

  // Function for account deletion (placeholder)
  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      console.log('Deleting account...');
      showMessage('Your account has been scheduled for deletion.', 'success');
      // Redirect or log out user
    }
  };

  // Effect to apply dark mode class on initial load based on state
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);


  return (
    <div className="flex flex-col flex-1 bg-gray-900 text-white min-h-screen font-inter py-8 px-4 sm:px-6 lg:px-8">
      {/* Central content wrapper for max width and centering */}
      <div className="max-w-6xl mx-auto w-full"> {/* Adjusted max-w and added mx-auto */}
        <h1 className="text-3xl md:text-4xl font-bold mb-6 md:mb-8 text-white-100">Settings</h1>

        {/* Message Display */}
        {message.text && (
          <div className={`p-3 mb-5 rounded-md text-center font-semibold
            ${message.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}
            role="alert"
          >
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
          {/* Vertical line between columns for larger screens */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-gray-700 -translate-x-1/2"></div>

          {/* Left Column */}
          <div className="flex flex-col gap-6 pr-3">
            {/* Profile Settings Section */}
            <h2 className="text-2xl font-bold mb-3 flex items-center text-blue-300">
              <User size={24} className="mr-2" /> Profile Settings
            </h2>
            <p className="text-gray-400 mb-5 text-sm max-w-xl">
              Manage your personal information, including your username and email address. These details are used across your JustSpeak account.
            </p>
            <section className="bg-gray-800 p-5 rounded-lg shadow-lg">
              <form onSubmit={handleSaveChanges} className="space-y-5">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    id="username"
                    className="w-full p-2.5 rounded-md bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 text-sm"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    className="w-full p-2.5 rounded-md bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 text-sm"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                  />
                </div>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition-colors duration-200 shadow-md w-full text-sm"
                >
                  Save Profile Settings
                </button>
              </form>
            </section>
            <hr className="border-gray-700 my-6" /> {/* Section divider */}

            {/* Notification Settings Section */}
            <h2 className="text-2xl font-bold mb-3 flex items-center text-green-300">
              <Bell size={24} className="mr-2" /> Notification Preferences
            </h2>
            <p className="text-gray-400 mb-5 text-sm max-w-xl">
              Control how you receive alerts and updates from JustSpeak. You can enable or disable email notifications.
            </p>
            <section className="bg-gray-800 p-5 rounded-lg shadow-lg">
              <div className="flex items-center justify-between py-2">
                <span className="text-gray-300 text-sm">Receive email notifications</span>
                <label htmlFor="toggle-notifications" className="flex items-center cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      id="toggle-notifications"
                      className="sr-only"
                      checked={receiveNotifications}
                      onChange={handleNotificationToggle}
                    />
                    <div className="block bg-gray-600 w-12 h-7 rounded-full"></div>
                    <div className={`dot absolute left-1 top-1 bg-white w-5 h-5 rounded-full transition-transform duration-300 ${receiveNotifications ? 'translate-x-full bg-blue-500' : ''}`}></div>
                  </div>
                </label>
              </div>
              <p className="text-xs text-gray-400 mt-3">
                Enable this option to receive important updates, announcements, and activity summaries directly to your registered email address.
              </p>
            </section>
            <hr className="border-gray-700 my-6" /> {/* Section divider */}

            {/* Privacy Settings Section */}
            <h2 className="text-2xl font-bold mb-3 flex items-center text-yellow-300">
              <Shield size={24} className="mr-2" /> Privacy Settings
            </h2>
            <p className="text-gray-400 mb-5 text-sm max-w-xl">
              Manage your privacy preferences and control who can view your profile and activity within JustSpeak.
            </p>
            <section className="bg-gray-800 p-5 rounded-lg shadow-lg">
              <div className="space-y-4">
                <div>
                  <label htmlFor="privacy-setting" className="block text-sm font-medium text-gray-300 mb-2">
                    Who can see my profile?
                  </label>
                  <select
                    id="privacy-setting"
                    className="w-full p-2.5 rounded-md bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    value={privacySetting}
                    onChange={handlePrivacyChange}
                  >
                    <option value="public">Public (Everyone)</option>
                    <option value="friends">Friends Only</option>
                    <option value="private">Private (Only Me)</option>
                  </select>
                  <p className="text-xs text-gray-400 mt-2">
                    Choose your profile visibility. Public means anyone can see your profile, while Private limits access to only you.
                  </p>
                </div>
              </div>
            </section>
            <hr className="border-gray-700 my-6" /> {/* Section divider */}

            {/* Billing & Payments Section */}
            <h2 className="text-2xl font-bold mb-3 flex items-center text-teal-300">
              <CreditCard size={24} className="mr-2" /> Billing & Payments
            </h2>
            <p className="text-gray-400 mb-5 text-sm max-w-xl">
              Review your subscription details, manage payment methods, and access your billing history.
            </p>
            <section className="bg-gray-800 p-5 rounded-lg shadow-lg">
              <div className="space-y-4">
                <div>
                  <p className="text-gray-300 mb-2 text-sm">Current Payment Method:</p>
                  <div className="flex items-center bg-gray-700 p-2.5 rounded-md border border-gray-600">
                    <CreditCard size={18} className="mr-2 text-gray-400" />
                    <span className="font-medium text-sm">{paymentMethod}</span>
                    <button className="ml-auto px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-md transition-colors duration-200">
                      Update
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    Your primary payment method used for recurring subscriptions and purchases.
                  </p>
                </div>
                <button className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition-colors duration-200 shadow-md w-full text-sm">
                  View Billing History
                </button>
                <p className="text-xs text-gray-400 mt-2">
                  Access a detailed record of all your past transactions and invoices.
                </p>
              </div>
            </section>
          </div>

          {/* Right Column */}
          <div className="flex flex-col gap-6 pl-3">
            {/* Account Security Section */}
            <h2 className="text-2xl font-bold mb-3 flex items-center text-red-300">
              <Lock size={24} className="mr-2" /> Account Security
            </h2>
            <p className="text-gray-400 mb-5 text-sm max-w-xl">
              Protect your account by regularly updating your password. We recommend using a strong, unique password.
            </p>
            <section className="bg-gray-800 p-5 rounded-lg shadow-lg">
              <form onSubmit={handleChangePassword} className="space-y-5">
                <div>
                  <label htmlFor="current-password" className="block text-sm font-medium text-gray-300 mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    id="current-password"
                    className="w-full p-2.5 rounded-md bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 text-sm"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                  />
                </div>
                <div>
                  <label htmlFor="new-password" className="block text-sm font-medium text-gray-300 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    id="new-password"
                    className="w-full p-2.5 rounded-md bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 text-sm"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                  />
                </div>
                <div>
                  <label htmlFor="confirm-new-password" className="block text-sm font-medium text-gray-300 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    id="confirm-new-password"
                    className="w-full p-2.5 rounded-md bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 text-sm"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="Confirm new password"
                  />
                </div>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-md transition-colors duration-200 shadow-md w-full text-sm"
                >
                  Change Password
                </button>
              </form>
            </section>
            <hr className="border-gray-700 my-6" /> {/* Section divider */}

            {/* Appearance Settings Section */}
            <h2 className="text-2xl font-bold mb-3 flex items-center text-purple-300">
              <Palette size={24} className="mr-2" /> Appearance
            </h2>
            <p className="text-gray-400 mb-5 text-sm max-w-xl">
              Customize the visual theme of your JustSpeak application. Switch between dark and light modes to suit your preference.
            </p>
            <section className="bg-gray-800 p-5 rounded-lg shadow-lg">
              <div className="flex items-center justify-between py-2">
                <span className="text-gray-300 text-sm">Enable Dark Mode</span>
                <label htmlFor="toggle-dark-mode" className="flex items-center cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      id="toggle-dark-mode"
                      className="sr-only"
                      checked={darkMode}
                      onChange={handleDarkModeToggle}
                    />
                    <div className="block bg-gray-600 w-12 h-7 rounded-full"></div>
                    <div className={`dot absolute left-1 top-1 bg-white w-5 h-5 rounded-full transition-transform duration-300 ${darkMode ? 'translate-x-full bg-blue-500' : ''}`}></div>
                  </div>
                </label>
              </div>
              <p className="text-xs text-gray-400 mt-3">
                Dark mode provides a darker color scheme, which can be easier on the eyes in low-light conditions and save battery life on some devices.
              </p>
            </section>
            <hr className="border-gray-700 my-6" /> {/* Section divider */}

            {/* Integrations Section */}
            <h2 className="text-2xl font-bold mb-3 flex items-center text-indigo-300">
              <Cloud size={24} className="mr-2" /> Integrations
            </h2>
            <p className="text-gray-400 mb-5 text-sm max-w-xl">
              Connect JustSpeak with other services to enhance your workflow and productivity.
            </p>
            <section className="bg-gray-800 p-5 rounded-lg shadow-lg">
              <div className="flex items-center justify-between py-2">
                <span className="text-gray-300 text-sm">Connect to Google Drive</span>
                <label htmlFor="toggle-integration" className="flex items-center cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      id="toggle-integration"
                      className="sr-only"
                      checked={integrationEnabled}
                      onChange={handleIntegrationToggle}
                    />
                    <div className="block bg-gray-600 w-12 h-7 rounded-full"></div>
                    <div className={`dot absolute left-1 top-1 bg-white w-5 h-5 rounded-full transition-transform duration-300 ${integrationEnabled ? 'translate-x-full bg-blue-500' : ''}`}></div>
                  </div>
                </label>
              </div>
              <p className="text-xs text-gray-400 mt-3">
                Allow JustSpeak to access your Google Drive for seamless file management, enabling direct imports and exports.
              </p>
            </section>
            <hr className="border-gray-700 my-6" /> {/* Section divider */}

            {/* Data & Account Management Section */}
            <h2 className="text-2xl font-bold mb-3 flex items-center text-orange-300">
              <Download size={24} className="mr-2" /> Data & Account Management
            </h2>
            <p className="text-gray-400 mb-5 text-sm max-w-xl">
              Manage your data, export your information, or initiate account deletion.
            </p>
            <section className="bg-gray-800 p-5 rounded-lg shadow-lg">
              <div className="space-y-5">
                <div>
                  <p className="text-gray-300 mb-2 text-sm">Export your personal data:</p>
                  <button
                    onClick={handleExportData}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition-colors duration-200 shadow-md flex items-center w-full justify-center text-sm"
                  >
                    <Download size={18} className="mr-2" /> Export Data
                  </button>
                  <p className="text-xs text-gray-400 mt-2">
                    Download a copy of your data, including profile information, usage history, and any content you've created.
                  </p>
                </div>
                <div className="border-t border-gray-700 pt-5">
                  <p className="text-gray-300 mb-2 text-sm">Delete your account:</p>
                  <button
                    onClick={handleDeleteAccount}
                    className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-md transition-colors duration-200 shadow-md flex items-center w-full justify-center text-sm"
                  >
                    <Trash2 size={18} className="mr-2" /> Delete Account
                  </button>
                  <p className="text-xs text-gray-400 mt-2">
                    Permanently delete your account and all associated data. This action is irreversible and cannot be undone.
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;