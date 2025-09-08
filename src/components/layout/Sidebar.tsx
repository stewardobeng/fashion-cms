'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navigationItems = [
  { name: 'Dashboard', href: '/', icon: '🏠' },
  { name: 'Clients', href: '/clients', icon: '👥' },
  { name: 'Services', href: '/services', icon: '✂️' },
  { name: 'Client Services', href: '/client-services', icon: '📋' },
  { name: 'Invoices', href: '/invoices', icon: '💰' },
  { name: 'Reports', href: '/reports', icon: '📊' },
  { name: 'Admin', href: '/admin', icon: '⚙️' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="bg-white shadow-sm border-r border-gray-200 transition-all duration-300 fixed left-0 top-16 bottom-0 z-40 w-64">
      <div className="flex flex-col h-full">
        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`nav-link ${
                      isActive ? 'nav-link-active' : 'nav-link-inactive'
                    }`}
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span className="ml-3">{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <div className="text-xs text-gray-500">
            Fashion Client Management v1.0
          </div>
        </div>
      </div>
    </div>
  );
}