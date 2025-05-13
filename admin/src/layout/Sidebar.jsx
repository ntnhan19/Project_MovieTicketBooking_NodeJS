// src/layout/Sidebar.jsx
import { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { 
  usePermissions, 
  useGetResourceLabel, 
  useResourceDefinitions,
  useGetIdentity
} from 'react-admin';

// Icons
import { 
  HomeIcon,
  TicketIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';

const Sidebar = ({ open, darkMode }) => {
  const [setExpandedCategories] = useState({});
  const { data: identity } = useGetIdentity();
  const { permissions } = usePermissions();
  const getResourceLabel = useGetResourceLabel();
  
  // Lấy các resource được khai báo
  const resources = useResourceDefinitions();
  
  // Lọc resources dựa trên permissions (nếu có)
  const filteredResources = Object.keys(resources).filter(name => {
    const resource = resources[name];
    return !resource.options?.requiredPermission || 
           permissions?.includes(resource.options.requiredPermission);
  });

  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  return (
    <div 
      className={`${
        open ? 'w-64' : 'w-20'
      } transition-all duration-300 ease-in-out h-screen ${
        darkMode 
          ? 'bg-secondary border-r border-border-dark text-text-primary-dark' 
          : 'bg-white border-r border-border-light shadow-sidebar text-text-primary'
      } flex flex-col`}
    >
      {/* Logo */}
      <div className={`h-16 flex items-center ${
        darkMode ? 'border-b border-border-dark' : 'border-b border-border-light'
      } px-4`}>
        <Link to="/" className="flex items-center justify-center w-full">
          <div className="flex-shrink-0 flex items-center">
            <div className="bg-primary rounded-full p-2 w-10 h-10 flex items-center justify-center">
              <TicketIcon className="h-5 w-5 text-white" />
            </div>
            {open && (
              <h1 className="ml-3 text-xl font-bold transition-opacity duration-200">
                DHL Cinema
              </h1>
            )}
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="mt-3 px-2 overflow-y-auto flex-grow">
        <div className={`space-y-1 ${open ? 'px-2' : 'px-0'}`}>
          {/* Dashboard */}
          <NavLink
            to="/"
            end
            className={({ isActive }) => `
              ${isActive 
                ? `${darkMode 
                    ? 'bg-secondary-dark text-primary-light' 
                    : 'bg-primary bg-opacity-10 text-primary'
                  } font-medium`
                : `${darkMode 
                    ? 'text-gray-300 hover:bg-secondary-dark' 
                    : 'text-gray-700 hover:bg-gray-100'
                  }`
              }
              group flex items-center px-3 py-2.5 rounded-lg text-sm transition-colors duration-150 ease-in-out
              ${!open && 'justify-center'}
            `}
          >
            <HomeIcon className={`h-5 w-5 ${!open && 'mx-auto'}`} />
            {open && <span className="ml-3">Dashboard</span>}
          </NavLink>
          
          {/* Resources */}
          {filteredResources.map((name) => {
            const resource = resources[name];
            const label = getResourceLabel(name, 2);
            const menuIcon = resource.options?.menuIcon || <ChevronRightIcon className="h-5 w-5" />;
            
            return (
              <NavLink
                key={name}
                to={`/${name}`}
                className={({ isActive }) => `
                  ${isActive 
                    ? `${darkMode 
                        ? 'bg-secondary-dark text-primary-light' 
                        : 'bg-primary bg-opacity-10 text-primary'
                      } font-medium`
                    : `${darkMode 
                        ? 'text-gray-300 hover:bg-secondary-dark' 
                        : 'text-gray-700 hover:bg-gray-100'
                      }`
                  }
                  group flex items-center px-3 py-2.5 rounded-lg text-sm transition-colors duration-150 ease-in-out
                  ${!open && 'justify-center'}
                `}
              >
                <div className={`${!open && 'mx-auto'}`}>
                  {menuIcon}
                </div>
                {open && <span className="ml-3">{label}</span>}
              </NavLink>
            );
          })}
        </div>

        {/* User Section */}
        {open && (
          <div className={`mt-8 pt-4 ${
            darkMode ? 'border-t border-border-dark' : 'border-t border-border-light'
          }`}>
            <div className="flex items-center px-4 mb-2">
              <div className="flex-shrink-0">
                <div className="bg-primary-light rounded-full w-8 h-8 flex items-center justify-center text-white">
                  {identity?.fullName?.charAt(0) || 'A'}
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">{identity?.fullName || 'Admin'}</p>
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {identity?.email || 'admin@example.com'}
                </p>
              </div>
            </div>
          </div>
        )}
      </nav>
      
      {/* Phần footer của sidebar */}
      <div className={`mt-auto mb-4 px-4 ${!open && 'text-center'}`}>
        <div className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
          {open ? 'DHL Cinema Admin v1.0' : 'v1.0'}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;