'use client';

interface HeaderProps {
  action?: React.ReactNode;
}

export default function Header({ action }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
      <div className="flex">
        {/* Logo section over sidebar */}
        <div className="w-64 flex items-center justify-between px-4 py-4 border-r border-gray-200">
          <div className="flex items-center">
            <span className="text-2xl">✂️</span>
            <span className="ml-2 text-lg font-semibold text-gray-900">
              Fashion CMS
            </span>
          </div>
        </div>
        
        {/* Main header content */}
        <div className="flex-1">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-end">
              <div className="flex items-center space-x-4">
                {action}
                
                {/* User Menu */}
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      Fashion Admin
                    </div>
                    <div className="text-xs text-gray-500">
                      Administrator
                    </div>
                  </div>
                  <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    FA
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}