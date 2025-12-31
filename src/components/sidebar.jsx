import React, { useState, createContext, useContext, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Headphones, BarChart, Menu, PanelLeftClose, Settings, CircleUser, BadgeAlert, Edit, LineChart, ChevronRight, Home, Sun, Moon } from 'lucide-react';

// Create a context for sidebar state
const SidebarContext = createContext();

// Provider for sidebar context
export const SidebarProvider = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  return (
    <SidebarContext.Provider value={{ isSidebarOpen, toggleSidebar }}>
      {children}
    </SidebarContext.Provider>
  );
};

// Custom hook to use sidebar context
export const useSidebar = () => useContext(SidebarContext);

const Sidebar = () => {
  const { isSidebarOpen, toggleSidebar } = useSidebar();
  const location = useLocation();
  const iconBaseSize = 20;

  const [openSubNav, setOpenSubNav] = useState(null);
  const [theme, setTheme] = useState('dark');

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'dark' ? 'light' : 'dark'));
  };

  const handleNavLinkClick = (item) => {
    if (item.subNav) {
      setOpenSubNav(openSubNav === item.to ? null : item.to);
    } else {
      setOpenSubNav(null);
    }
  };

  useEffect(() => {
    const fontLink = document.createElement('link');
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@700&display=swap';
    fontLink.rel = 'stylesheet';
    document.head.appendChild(fontLink);

    return () => {
      document.head.removeChild(fontLink);
    };
  }, []);

  // New useEffect to manage sub-navigation state based on current URL
  useEffect(() => {
    const currentPath = location.pathname;
    const activeParent = mainNavItems.find(item =>
      (item.to === currentPath || (item.subNav && item.subNav.some(subItem => subItem.to === currentPath)))
    );
    if (activeParent && activeParent.subNav) {
      setOpenSubNav(activeParent.to);
    } else {
      setOpenSubNav(null);
    }
  }, [location.pathname]);

  const mainNavItems = [
    {
      to: "/transcript/upload",
      icon: <Headphones size={iconBaseSize} />,
      text: "Transcribe",
      section: 'Main',
      subNav: [
        { to: "/transcript/history", icon: <Edit size={iconBaseSize * 0.8} />, text: "History" },
        { to: "/transcribe/insights", icon: <BarChart size={iconBaseSize * 0.8} />, text: "Insights" },
      ]
    },
    { to: "/seo/chat", icon: <BarChart size={iconBaseSize} />, text: "SEO Chat Guidance", section: 'Main' },
    {
      to: "/generate-post",
      icon: <Edit size={iconBaseSize} />,
      text: "Post",
      section: 'Main',
      subNav: [
        { to: "/generate-post/welcome", icon: <Edit size={iconBaseSize * 0.8} />, text: "Create New Post" },
        { to: "/generate-post/generate", icon: <LineChart size={iconBaseSize * 0.8} />, text: "Generate Post" },
      ]
    },
    { to: "/visualizer", icon: <LineChart size={iconBaseSize} />, text: "Mindmap", section: 'Main' },
  ];

  const bottomNavItems = [
    // { to: "/profile", icon: <CircleUser size={iconBaseSize} />, text: "Profile" },
    // { to: "/settings", icon: <Settings size={iconBaseSize} />, text: "Settings" },
    // { to: "/help-support", icon: <BadgeAlert size={iconBaseSize} />, text: "Help & Support" },
  ];

  const sections = [...new Set(mainNavItems.map(item => item.section))];

  return (
    <>
      <style>
        {`
          :root {
            /* Dark Theme */
            --sidebar-bg-color: #1e293b;
            --nav-item-bg-hover: #4a5568;
            --nav-item-bg-active: #4a5568;
            --text-primary-color: #ffffff;
            --text-secondary-color: #a0aec0;
            --accent-color: #66b2e0ff;
            --sub-nav-bg-active: #2d3748;
            --sub-nav-text-active: #5db6faff;
            --sub-nav-text-color: #cbd5e0;
            --border-color: #25282cff;
            --tooltip-bg-color: rgba(255, 255, 255, 0.1);
          }
          .light-theme {
            /* Light Theme */
            --sidebar-bg-color: #fefefe;
            --nav-item-bg-hover: #e2e8f0;
            --nav-item-bg-active: #e7eaedff;
            --text-primary-color: #2d3748;
            --text-secondary-color: #718096;
            --accent-color: #b55defff;
            --sub-nav-bg-active: #e2e8f0;
            --sub-nav-text-active: #bf67ffff;
            --sub-nav-text-color: #4a5568;
            --border-color: #ffffffff;
            --tooltip-bg-color: rgba(0, 0, 0, 0.1);
          }
        `}
      </style>
      <aside
        className={`border-r border-[var(--border-color)] shadow-2xl shadow-black/20 
          ${theme === 'light' ? 'light-theme' : ''}
          bg-[var(--sidebar-bg-color)] text-[var(--text-primary-color)] min-h-screen
        
          ${isSidebarOpen ? 'w-64 p-4' : 'w-16 px-2 py-4'}
          flex flex-col
          overflow-x-hidden
        `}
      >
        <div className={`flex items-center ${isSidebarOpen ? 'justify-between mb-6' : 'justify-center mb-4 mt-1'}`}>
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-full hover:bg-[var(--nav-item-bg-hover)] focus:outline-none transition-colors duration-200"
            title={isSidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
          >
            {isSidebarOpen ? (
              <PanelLeftClose size={iconBaseSize} className="transition-transform duration-300 rotate-0" />
            ) : (
              <Menu size={iconBaseSize} className="transition-transform duration-300 rotate-180" />
            )}
          </button>
        </div>

        <nav className={`mb-4 ${isSidebarOpen ? 'mt-8' : 'mt-8'}`}>
          <ul>
            <li className="mb-2">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `relative flex items-center rounded-md transition-all duration-200 group
                  ${isActive ? 'bg-[var(--nav-item-bg-active)] text-[var(--accent-color)]' : 'hover:bg-[var(--nav-item-bg-hover)] text-[var(--text-primary-color)]'}
                  ${isSidebarOpen ? 'py-2 px-3' : 'py-2 px-1 justify-center'}
                  `
                }
              >
                <span className={`${!isSidebarOpen ? 'transform hover:scale-110' : ''} transition-transform duration-200`}>
                  <Home size={iconBaseSize} />
                </span>
                {isSidebarOpen && (
                  <span className="ml-3 text-lg font-medium whitespace-nowrap flex items-center flex-grow">
                    Home
                  </span>
                )}
                {!isSidebarOpen && (
                  <span className="absolute left-full ml-4 px-3 py-2 rounded-md bg-[var(--tooltip-bg-color)] backdrop-blur-sm text-[var(--text-primary-color)] opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                    Home
                  </span>
                )}
              </NavLink>
            </li>
          </ul>
        </nav>

        <nav className={`flex-grow overflow-y-auto no-scrollbar h-full ${isSidebarOpen ? '' : 'mb-4'}`}>
          {sections.map(section => (
            <div key={section} className="mb-6">
              {isSidebarOpen && (
                <h3 className="text-sm font-semibold uppercase text-[var(--text-secondary-color)] mb-2 ml-3 transition-opacity duration-300 ease-in-out">
                  {section}
                </h3>
              )}
              <ul>
                {mainNavItems
                  .filter(item => item.section === section)
                  .map((item) => (
                    <li key={item.to} className="mb-2">
                      <NavLink
                        to={item.to}
                        onClick={() => handleNavLinkClick(item)}
                        className={({ isActive }) =>
                          `relative flex items-center rounded-md transition-all duration-200 group
                          ${isActive || (item.subNav && openSubNav === item.to) ? 'bg-[var(--nav-item-bg-active)] text-[var(--accent-color)]' : 'hover:bg-[var(--nav-item-bg-hover)] text-[var(--text-primary-color)]'}
                          ${isSidebarOpen ? 'py-2 px-3' : 'py-2 px-1 justify-center'}
                          `
                        }
                      >
                        <span className={`${!isSidebarOpen ? 'transform hover:scale-110' : ''} transition-transform duration-200`}>
                          {item.icon}
                        </span>
                        {isSidebarOpen && (
                          <span className="ml-3 text-lg font-medium whitespace-nowrap flex items-center flex-grow">
                            {item.text}
                            {item.subNav && (
                              <ChevronRight size={iconBaseSize * 0.7} className={`ml-auto transform transition-transform duration-200 ${openSubNav === item.to ? 'rotate-90' : 'rotate-0'}`} />
                            )}
                          </span>
                        )}
                        {!isSidebarOpen && (
                          <span className="absolute left-full ml-4 px-3 py-2 rounded-md bg-[var(--tooltip-bg-color)] backdrop-blur-sm text-[var(--text-primary-color)] opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                            {item.text}
                          </span>
                        )}
                      </NavLink>

                      {isSidebarOpen && item.subNav && openSubNav === item.to && (
                        <ul className="ml-8 mt-2 space-y-2 transition-all duration-300 ease-in-out origin-top animate-fade-in">
                          {item.subNav.map(subItem => (
                            <li key={subItem.to}>
                              <NavLink
                                to={subItem.to}
                                className={({ isActive }) =>
                                  `flex items-center rounded-md py-1.5 px-2 transition-all duration-200
                                  ${isActive ? 'bg-[var(--sub-nav-bg-active)] text-[var(--sub-nav-text-active)]' : 'hover:bg-[var(--nav-item-bg-hover)] text-[var(--sub-nav-text-color)]'}
                                  `
                                }
                              >
                                <span className="mr-2">
                                  {subItem.icon}
                                </span>
                                <span className="text-base whitespace-nowrap">
                                  {subItem.text}
                                </span>
                              </NavLink>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className={`pt-2 ${isSidebarOpen ? 'px-1' : 'px-0'} transition-all duration-300`}>
          <ul>
            {bottomNavItems.map((item) => (
              <li key={item.to} className="mb-2">
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    `relative flex items-center rounded-md transition-all duration-200 group
                    ${isActive ? 'bg-[var(--nav-item-bg-active)] text-[var(--accent-color)]' : 'hover:bg-[var(--nav-item-bg-hover)] text-[var(--text-primary-color)]'}
                    ${isSidebarOpen ? 'py-2 px-3' : 'py-2 px-1 justify-center'}
                    `
                  }
                >
                  <span className={`${!isSidebarOpen ? 'transform hover:scale-110' : ''} transition-transform duration-200`}>
                    {item.icon}
                  </span>
                  {isSidebarOpen && (
                    <span className="ml-3 text-lg font-medium whitespace-nowrap flex items-center">
                      {item.text}
                    </span>
                  )}
                  {!isSidebarOpen && (
                    <span className="absolute left-full ml-4 px-3 py-2 rounded-md bg-[var(--tooltip-bg-color)] backdrop-blur-sm text-[var(--text-primary-color)] opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                      {item.text}
                    </span>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>

        {isSidebarOpen && (
          <div className="mt-4 pt-4 border-t border-[var(--border-color)] text-sm text-[var(--text-secondary-color)] ml-1 opacity-100 transition-opacity duration-300 ease-in-out flex items-center justify-between">
            <div>
              <p>Version 1.0</p>
              <p className="text-xs">© 2025 JustSpeak</p>
            </div>
            <button
              onClick={toggleTheme}
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Theme`}
              className="p-2 rounded-full hover:bg-[var(--nav-item-bg-hover)]"
            >
              {theme === 'dark' ? <Moon size={iconBaseSize} /> : <Sun size={iconBaseSize} />}
            </button>
          </div>
        )}
      </aside>
    </>
  );
};

export default Sidebar;