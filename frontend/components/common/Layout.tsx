import React, { useState, useEffect, ReactNode, FC } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import { notificationsAPI } from '../../lib/api';

interface LayoutProps {
  children: ReactNode;
}

interface NavLink {
  label: string;
  href: string;
}

const Layout: FC<LayoutProps> = ({ children }) => {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await notificationsAPI.getUnreadCount();
        setUnreadCount(response.data.unreadCount);
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      }
    };

    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000); // Check every 30s
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleLogout = async () => {
    await logout();
    router.push('/auth/login');
  };

  const navLinks: Record<string, NavLink[]> = {
    admin: [
      { label: 'Dashboard', href: '/admin' },
      { label: 'Jobs', href: '/admin/jobs' },
      { label: 'Create Job', href: '/admin/jobs/new' },
    ],
    technician: [
      { label: 'My Jobs', href: '/technician' },
      { label: 'Notifications', href: '/technician/notifications' },
    ],
    client: [
      { label: 'My Jobs', href: '/client' },
    ],
  };

  const links = user?.role ? navLinks[user.role] || [] : [];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white shadow-lg">
        <div className="p-6 border-b border-gray-700">
          <h1 className="text-xl font-bold">FieldOps</h1>
          <p className="text-xs text-gray-400 mt-1">{(user?.role || 'user').toUpperCase()}</p>
        </div>

        <nav className="p-4 space-y-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`block px-4 py-2 rounded transition ${
                router.pathname === link.href
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow">
          <div className="px-6 py-4 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">{user?.name}</h2>
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              {unreadCount > 0 && (
                <Link href={user?.role === 'admin' ? '/admin/notifications' : '/notifications'} className="relative">
                  <span className="text-gray-600">🔔</span>
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="btn btn-secondary btn-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
