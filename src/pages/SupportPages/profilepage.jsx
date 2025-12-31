import React, { useState, useEffect, useRef } from 'react';
import {
  User, MessageSquare, Share2, Image, Zap, Edit2, MoreHorizontal, ArrowRight,
  Send, Camera, Globe, Star, Headphones, Mic, Sparkles, Download, Copy, Trash2,
  Briefcase, MapPin, Calendar, Link as LinkIcon, X, Save, Circle, Upload,
  BarChart2, TrendingUp, TrendingDown, Eye, Plus, Users, LayoutDashboard, FileText
} from 'lucide-react';

// --- Dummy Data ---
const generateGradientId = (id) => `gradient-${id}`;

const initialUserData = {
  id: 'user123',
  coverPhoto: null,
  profilePicture: null,
  profileGradientId: generateGradientId('default-profile'),
  coverGradientId: generateGradientId('default-cover'),
  name: 'Alex "AudioWizard" Johnson',
  username: '@audio_alex',
  bio: 'Lead Sound Architect & AI Prompt Engineer at "PodCraft AI". Passionate about leveraging AI to revolutionize podcast content creation, from script generation to dynamic audio mixing. Always seeking innovative ways to amplify storytelling.',
  location: 'Remote, Global',
  joinedDate: 'Member Since: Jan 2022',
  website: 'https://podcraftai.com/alex-j',
  jobTitle: 'Lead Sound Architect, PodCraft AI',
  followers: 4850,
  following: 150,
  posts: 120,
  likesReceived: 9876,
  views: 250000,
  skills: ['AI Audio Generation', 'Podcast Production', 'Prompt Engineering', 'Sound Design'],
  interests: ['Voice Acting', 'Synthesizers', 'Sci-Fi Podcasting', 'AI Ethics'],
};

const dummyAnalyticsData = {
  transcripts: {
    total: 354,
    last30Days: 42,
    trend: 'up',
    trendValue: '+15.2%',
    data: [
      { month: 'Jan', count: 30 }, { month: 'Feb', count: 45 }, { month: 'Mar', count: 52 },
      { month: 'Apr', count: 48 }, { month: 'May', count: 60 }, { month: 'Jun', count: 70 },
    ]
  },
  seo: {
    total: 187,
    last30Days: 21,
    trend: 'down',
    trendValue: '-5.8%',
    data: [
      { month: 'Jan', count: 20 }, { month: 'Feb', count: 25 }, { month: 'Mar', count: 35 },
      { month: 'Apr', count: 28 }, { month: 'May', count: 22 }, { month: 'Jun', count: 18 },
    ]
  },
  posts: {
    total: 120,
    last30Days: 15,
    trend: 'up',
    trendValue: '+25.0%',
    data: [
      { month: 'Jan', count: 10 }, { month: 'Feb', count: 12 }, { month: 'Mar', count: 15 },
      { month: 'Apr', count: 13 }, { month: 'May', count: 18 }, { month: 'Jun', count: 20 },
    ]
  }
};

const ProfileHeader = ({ user, onToggleEditMode, onCoverPhotoChange, onRemoveCoverPhoto, onProfilePictureChange, isEditing, onSave, onCancel, onFieldChange }) => {
  const coverInputRef = useRef(null);
  const profilePicInputRef = useRef(null);

  const handleCoverClick = () => coverInputRef.current.click();
  const handleProfilePicClick = () => profilePicInputRef.current.click();

  return (
    <div className="relative w-full rounded-xl overflow-hidden mb-8 shadow-xl bg-[#242634] border border-[#2d2e3c]">
      {/* Cover Photo */}
      <div className="h-48 md:h-64 bg-[#242634] flex items-center justify-center text-white text-3xl font-bold overflow-hidden relative">
        {user.coverPhoto ? (
          <img src={user.coverPhoto} alt="Cover" className="w-full h-full object-cover transition-all duration-300 ease-in-out" />
        ) : (
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <linearGradient id={user.coverGradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{stopColor:"#8A2BE2", stopOpacity:1}} />
                <stop offset="100%" style={{stopColor:"#FF4500", stopOpacity:1}} />
              </linearGradient>
            </defs>
            <rect x="0" y="0" width="100" height="100" fill={`url(#${user.coverGradientId})`} />
          </svg>
        )}
        <div className="absolute top-4 right-4 flex space-x-2">
            <button
              onClick={handleCoverClick}
              className="bg-[#2d2e3c] bg-opacity-70 text-white p-2 rounded-full hover:bg-opacity-90 transition-all text-sm flex items-center transform hover:scale-105"
              aria-label="Change Cover Photo"
            >
              <Camera size={16} className="mr-1" />
            </button>
            {user.coverPhoto && (
                <button
                    onClick={onRemoveCoverPhoto}
                    className="bg-red-600 bg-opacity-70 text-white p-2 rounded-full hover:bg-red-700 transition-all text-sm flex items-center transform hover:scale-105"
                    aria-label="Remove Cover Photo"
                >
                    <Trash2 size={16} />
                </button>
            )}
        </div>
        <input
          type="file"
          accept="image/*"
          ref={coverInputRef}
          onChange={onCoverPhotoChange}
          className="hidden"
        />
      </div>

      {/* Profile Picture & Basic Info */}
      <div className="absolute top-28 md:top-40 left-1/2 -translate-x-1/2 flex flex-col items-center z-10">
        <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-[#1e1e2d] bg-[#2d2e3c] overflow-hidden shadow-2xl relative flex items-center justify-center transition-all duration-300 ease-in-out group">
          {user.profilePicture ? (
            <img
              src={user.profilePicture}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <defs>
                <linearGradient id={user.profileGradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{stopColor:"#8A2BE2", stopOpacity:1}} />
                  <stop offset="100%" style={{stopColor:"#FF4500", stopOpacity:1}} />
                </linearGradient>
              </defs>
              <circle cx="50" cy="50" r="50" fill={`url(#${user.profileGradientId})`} />
              <g transform="translate(20, 20)">
                <User size={60} className="text-white" />
              </g>
            </svg>
          )}
          <button
            onClick={handleProfilePicClick}
            className="absolute bottom-0 right-0 bg-[#8A2BE2] text-white p-2 rounded-full hover:bg-[#9932CC] transition-all transform hover:scale-110 opacity-0 group-hover:opacity-100"
            aria-label="Upload Profile Picture"
          >
            <Upload size={16} />
          </button>
          <input
            type="file"
            accept="image/*"
            ref={profilePicInputRef}
            onChange={onProfilePictureChange}
            className="hidden"
          />
        </div>
        {isEditing ? (
            <>
                <input
                    type="text"
                    name="name"
                    value={user.name}
                    onChange={onFieldChange}
                    className="text-3xl font-extrabold text-white mt-4 text-center bg-[#2d2e3c] rounded px-2 py-1 w-2/3 focus:outline-none focus:ring-2 focus:ring-[#8A2BE2]"
                />
                <input
                    type="text"
                    name="username"
                    value={user.username}
                    onChange={onFieldChange}
                    className="text-[#93c5fd] text-lg font-medium text-center bg-[#2d2e3c] rounded px-2 py-1 w-1/2 mt-1 focus:outline-none focus:ring-2 focus:ring-[#8A2BE2]"
                />
            </>
        ) : (
            <>
                <h1 className="text-3xl font-extrabold text-white mt-4 text-center">{user.name}</h1>
                <p className="text-[#93c5fd] text-lg font-medium text-center">{user.username}</p>
            </>
        )}
      </div>

      {/* Action Buttons & Stats */}
      <div className="bg-[#242634] p-6 pt-32 md:pt-40 flex flex-col items-center sm:flex-row sm:justify-between sm:items-start text-white border-t border-[#2d2e3c]">
        <div className="flex space-x-6 mb-4 sm:mb-0 text-center">
          <div>
            <span className="block text-2xl font-bold text-[#fde047]">{user.followers}</span>
            <span className="text-gray-400 text-sm">Followers</span>
          </div>
          <div>
            <span className="block text-2xl font-bold text-[#fde047]">{user.following}</span>
            <span className="text-gray-400 text-sm">Following</span>
          </div>
          <div>
            <span className="block text-2xl font-bold text-[#fde047]">{user.posts}</span>
            <span className="text-gray-400 text-sm">Posts</span>
          </div>
        </div>
        <div className="flex space-x-3">
          {isEditing ? (
            <>
              <button
                onClick={onSave}
                className="px-5 py-2 bg-[#8A2BE2] hover:bg-[#9932CC] text-white font-semibold rounded-full flex items-center transition-colors duration-200 shadow-md text-sm transform hover:scale-105"
              >
                <Save size={16} className="mr-2" /> Save
              </button>
              <button
                onClick={onCancel}
                className="px-5 py-2 border border-[#4a4a68] text-gray-200 hover:bg-[#3d3d57] font-semibold rounded-full flex items-center transition-colors duration-200 shadow-md text-sm transform hover:scale-105"
              >
                <X size={16} className="mr-2" /> Cancel
              </button>
            </>
          ) : (
            <button
              onClick={onToggleEditMode}
              className="px-5 py-2 border border-[#4a4a68] text-gray-200 hover:bg-[#3d3d57] font-semibold rounded-full flex items-center transition-colors duration-200 shadow-md text-sm transform hover:scale-105"
            >
              <Edit2 size={16} className="mr-2" /> Edit Profile
            </button>
          )}
        </div>
      </div>
    </div>
  );
};


const AnalyticsCard = ({ title, icon, value, period, trend, trendValue }) => {
  const trendColor = trend === 'up' ? 'text-green-500' : 'text-red-500';
  const TrendIcon = trend === 'up' ? TrendingUp : TrendingDown;

  return (
    <div className="bg-[#242634] p-6 rounded-xl shadow-lg border border-[#2d2e3c] flex flex-col justify-between transition-all duration-300 ease-in-out hover:bg-[#2d2e3c]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-200 flex items-center">
          {icon}
          <span className="ml-2">{title}</span>
        </h3>
      </div>
      <div className="flex items-end justify-between">
        <span className="text-4xl font-bold text-[#fde047]">{value}</span>
        <div className="flex flex-col items-end">
          <div className={`flex items-center text-sm font-medium ${trendColor}`}>
            <TrendIcon size={16} className="mr-1" />
            <span>{trendValue}</span>
          </div>
          <p className="text-gray-400 text-xs mt-1">vs. last {period}</p>
        </div>
      </div>
    </div>
  );
};

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState('transcripts');
  const [currentUserData, setCurrentUserData] = useState(initialUserData);
  const [editedUserData, setEditedUserData] = useState(initialUserData);
  const [isEditing, setIsEditing] = useState(false);

  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    setEditedUserData(prev => ({ ...prev, [name]: value }));
  };

  const handleToggleEditMode = () => {
    if (!isEditing) {
      setEditedUserData(currentUserData);
    }
    setIsEditing(!isEditing);
  };

  const handleSaveProfile = () => {
    setCurrentUserData(editedUserData);
    setIsEditing(false);
    console.log('Profile updated:', editedUserData);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedUserData(currentUserData);
  };

  const handleCoverPhotoChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCurrentUserData(prev => ({ ...prev, coverPhoto: reader.result }));
        setEditedUserData(prev => ({ ...prev, coverPhoto: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveCoverPhoto = () => {
    setCurrentUserData(prev => ({ ...prev, coverPhoto: null }));
    setEditedUserData(prev => ({ ...prev, coverPhoto: null }));
  };

  const handleProfilePictureChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCurrentUserData(prev => ({ ...prev, profilePicture: reader.result }));
        setEditedUserData(prev => ({ ...prev, profilePicture: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col flex-1 bg-[#1e1e2d] text-white min-h-screen font-sans py-6 sm:py-8">
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
        <ProfileHeader
          user={isEditing ? editedUserData : currentUserData}
          onToggleEditMode={handleToggleEditMode}
          onCoverPhotoChange={handleCoverPhotoChange}
          onRemoveCoverPhoto={handleRemoveCoverPhoto}
          onProfilePictureChange={handleProfilePictureChange}
          isEditing={isEditing}
          onSave={handleSaveProfile}
          onCancel={handleCancelEdit}
          onFieldChange={handleFieldChange}
        />

        <div className="bg-[#242634] rounded-xl shadow-lg mb-8 border border-[#2d2e3c]">
          <div className="flex justify-start border-b border-[#2d2e3c]">
            <button
              className={`py-4 px-6 text-sm md:text-base font-medium transition-colors duration-200 flex items-center
                ${activeTab === 'transcripts' ? 'text-[#8A2BE2] border-b-2 border-[#8A2BE2]' : 'text-gray-400 hover:text-gray-200'}`}
              onClick={() => setActiveTab('transcripts')}
            >
              <FileText size={18} className="inline mr-2" /> Transcripts
            </button>
            <button
              className={`py-4 px-6 text-sm md:text-base font-medium transition-colors duration-200 flex items-center
                ${activeTab === 'seo' ? 'text-[#8A2BE2] border-b-2 border-[#8A2BE2]' : 'text-gray-400 hover:text-gray-200'}`}
              onClick={() => setActiveTab('seo')}
            >
              <TrendingUp size={18} className="inline mr-2" /> SEO
            </button>
            <button
              className={`py-4 px-6 text-sm md:text-base font-medium transition-colors duration-200 flex items-center
                ${activeTab === 'posts' ? 'text-[#8A2BE2] border-b-2 border-[#8A2BE2]' : 'text-gray-400 hover:text-gray-200'}`}
              onClick={() => setActiveTab('posts')}
            >
              <LayoutDashboard size={18} className="inline mr-2" /> Posts
            </button>
          </div>
        </div>

        {activeTab === 'transcripts' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnalyticsCard
              title="Total Transcripts"
              icon={<FileText size={24} className="text-[#8A2BE2]" />}
              value={dummyAnalyticsData.transcripts.total}
              period="30 Days"
              trend={dummyAnalyticsData.transcripts.trend}
              trendValue={dummyAnalyticsData.transcripts.trendValue}
            />
             <AnalyticsCard
              title="Transcripts Last 30 Days"
              icon={<Calendar size={24} className="text-[#fde047]" />}
              value={dummyAnalyticsData.transcripts.last30Days}
              period="30 Days"
              trend={dummyAnalyticsData.transcripts.trend}
              trendValue={dummyAnalyticsData.transcripts.trendValue}
            />
            <div className="bg-[#242634] p-6 rounded-xl shadow-lg border border-[#2d2e3c]">
                <h3 className="text-lg font-semibold text-gray-200 mb-4 flex items-center"><BarChart2 size={20} className="mr-2 text-[#8A2BE2]" /> Transcripts Trend</h3>
                <div className="h-40 bg-[#1e1e2d] rounded-lg flex items-center justify-center text-gray-400">
                    {/* Placeholder for a chart */}
                    Chart placeholder here
                </div>
            </div>
          </div>
        )}

        {activeTab === 'seo' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnalyticsCard
              title="Total SEO Analyses"
              icon={<TrendingUp size={24} className="text-green-400" />}
              value={dummyAnalyticsData.seo.total}
              period="30 Days"
              trend={dummyAnalyticsData.seo.trend}
              trendValue={dummyAnalyticsData.seo.trendValue}
            />
            <AnalyticsCard
              title="Analyses Last 30 Days"
              icon={<Calendar size={24} className="text-[#fde047]" />}
              value={dummyAnalyticsData.seo.last30Days}
              period="30 Days"
              trend={dummyAnalyticsData.seo.trend}
              trendValue={dummyAnalyticsData.seo.trendValue}
            />
            <div className="bg-[#242634] p-6 rounded-xl shadow-lg border border-[#2d2e3c]">
                <h3 className="text-lg font-semibold text-gray-200 mb-4 flex items-center"><BarChart2 size={20} className="mr-2 text-green-400" /> SEO Trend</h3>
                <div className="h-40 bg-[#1e1e2d] rounded-lg flex items-center justify-center text-gray-400">
                    {/* Placeholder for a chart */}
                    Chart placeholder here
                </div>
            </div>
          </div>
        )}

        {activeTab === 'posts' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnalyticsCard
              title="Total Posts"
              icon={<LayoutDashboard size={24} className="text-[#FF4500]" />}
              value={dummyAnalyticsData.posts.total}
              period="30 Days"
              trend={dummyAnalyticsData.posts.trend}
              trendValue={dummyAnalyticsData.posts.trendValue}
            />
            <AnalyticsCard
              title="Posts Last 30 Days"
              icon={<Calendar size={24} className="text-[#fde047]" />}
              value={dummyAnalyticsData.posts.last30Days}
              period="30 Days"
              trend={dummyAnalyticsData.posts.trend}
              trendValue={dummyAnalyticsData.posts.trendValue}
            />
            <div className="bg-[#242634] p-6 rounded-xl shadow-lg border border-[#2d2e3c]">
                <h3 className="text-lg font-semibold text-gray-200 mb-4 flex items-center"><BarChart2 size={20} className="mr-2 text-[#FF4500]" /> Posts Trend</h3>
                <div className="h-40 bg-[#1e1e2d] rounded-lg flex items-center justify-center text-gray-400">
                    {/* Placeholder for a chart */}
                    Chart placeholder here
                </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;