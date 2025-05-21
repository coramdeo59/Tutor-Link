import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  BookOpen, 
  Calendar, 
  MessageSquare, 
  GraduationCap,
  Clock,
  Settings, 
  LayoutDashboard,
  Users,
  LogOut
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const TutorDashboardSidebar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  
  const navItems: NavItem[] = [
    {
      href: '/tutor-dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />
    },
    {
      href: '/tutor-dashboard/sessions',
      label: 'Sessions',
      icon: <Calendar className="w-4 h-4" />
    },
    {
      href: '/tutor-dashboard/assignments',
      label: 'Assignments',
      icon: <BookOpen className="w-4 h-4" />
    },
    {
      href: '/tutor-dashboard/students',
      label: 'Students',
      icon: <Users className="w-4 h-4" />
    },
    {
      href: '/tutor-dashboard/feedback',
      label: 'Feedback',
      icon: <MessageSquare className="w-4 h-4" />
    },
    {
      href: '/tutor-dashboard/availability',
      label: 'Availability',
      icon: <Clock className="w-4 h-4" />
    },
    {
      href: '/tutor-dashboard/subjects',
      label: 'Subjects',
      icon: <GraduationCap className="w-4 h-4" />
    },
    {
      href: '/tutor-dashboard/settings',
      label: 'Settings',
      icon: <Settings className="w-4 h-4" />
    }
  ];

  return (
    <div className="h-full flex flex-col overflow-y-auto py-4 bg-white">
      {/* Logo */}
      <div className="flex items-center justify-center px-4 mb-6">
        <Link href="/tutor-dashboard" className="flex items-center">
          <span className="text-amber-500 font-bold text-lg">TutorLink</span>
        </Link>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 px-2 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`
                flex items-center px-2 py-2 text-sm font-medium rounded-md group
                transition-colors duration-200
                ${isActive 
                  ? 'bg-amber-50 text-amber-600' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
              `}
            >
              <span className={`mr-3 ${isActive ? 'text-amber-500' : ''}`}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>
      
      {/* Logout Button */}
      <div className="border-t pt-4 mt-auto px-2">
        <button
          onClick={() => {
            logout();
            router.push('/auth/login');
          }}
          className="w-full flex items-center px-2 py-2 text-sm font-medium rounded-md text-red-600 hover:bg-red-50 transition-colors duration-200"
        >
          <LogOut className="w-4 h-4 mr-3" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default TutorDashboardSidebar;
