import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Users, 
  Search, 
  Calendar, 
  CreditCard, 
  Settings, 
  LayoutDashboard 
} from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const DashboardSidebar: React.FC = () => {
  const pathname = usePathname();
  
  const navItems: NavItem[] = [
    {
      href: '/parent-dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />
    },
    {
      href: '/parent-dashboard/children-management',
      label: 'Children Management',
      icon: <Users className="w-4 h-4" />
    },
    {
      href: '/parent-dashboard/tutor-search',
      label: 'Tutor Search',
      icon: <Search className="w-4 h-4" />
    },
    {
      href: '/parent-dashboard/session-management',
      label: 'Session Management',
      icon: <Calendar className="w-4 h-4" />
    },
    {
      href: '/parent-dashboard/payment-center',
      label: 'Payment Center',
      icon: <CreditCard className="w-4 h-4" />
    },
    {
      href: '/parent-dashboard/settings',
      label: 'Settings',
      icon: <Settings className="w-4 h-4" />
    }
  ];
  
  return (
    <aside className="bg-white border-r border-gray-200 w-[140px] h-screen flex-shrink-0 fixed left-0 top-0 overflow-y-auto">
      <div className="py-4 px-2">
        <div className="flex items-center justify-center mb-6 px-2">
          <Link href="/" className="flex items-center space-x-1">
            <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center">
              <span className="text-white text-xs font-bold">T</span>
            </div>
            <span className="text-sm font-bold">TutorLink</span>
          </Link>
        </div>
        
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center px-3 py-2 text-xs font-medium
                  ${isActive 
                    ? 'text-amber-700' 
                    : 'text-gray-700 hover:text-gray-900'}
                `}
              >
                <span className={`mr-2 ${isActive ? 'text-amber-500' : 'text-gray-500'}`}>
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};

export default DashboardSidebar;
