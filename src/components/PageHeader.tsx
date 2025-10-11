import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  action?: {
    label: string;
    onClick: () => void;
    icon?: ReactNode;
    variant?: 'primary' | 'secondary' | 'outline';
  };
}

export default function PageHeader({ 
  title, 
  description, 
  breadcrumbs = [], 
  action 
}: PageHeaderProps) {
  const getButtonStyles = (variant: 'primary' | 'secondary' | 'outline' = 'primary') => {
    const baseStyles = "inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";
    
    switch (variant) {
      case 'primary':
        return `${baseStyles} bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 focus:ring-blue-500 shadow-sm hover:shadow-md`;
      case 'secondary':
        return `${baseStyles} bg-gray-100 text-gray-900 hover:bg-gray-200 active:bg-gray-300 focus:ring-gray-500`;
      case 'outline':
        return `${baseStyles} border border-gray-300 text-gray-700 hover:bg-gray-50 active:bg-gray-100 focus:ring-gray-500`;
      default:
        return baseStyles;
    }
  };

  return (
    <div className="mb-8">
      {/* Breadcrumbs */}
      {breadcrumbs.length > 0 && (
        <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
          <Link 
            to="/" 
            className="flex items-center gap-1 hover:text-gray-700 transition-colors duration-200"
          >
            <Home className="h-4 w-4" />
            <span>Home</span>
          </Link>
          {breadcrumbs.map((item, index) => (
            <div key={index} className="flex items-center space-x-2">
              <ChevronRight className="h-4 w-4" />
              {item.href ? (
                <Link 
                  to={item.href}
                  className="hover:text-gray-700 transition-colors duration-200"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="text-gray-900 font-medium">{item.label}</span>
              )}
            </div>
          ))}
        </nav>
      )}

      {/* Header Content */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
          {description && (
            <p className="text-gray-600">{description}</p>
          )}
        </div>
        
        {action && (
          <button
            onClick={action.onClick}
            className={getButtonStyles(action.variant)}
          >
            {action.icon}
            {action.label}
          </button>
        )}
      </div>
    </div>
  );
}
