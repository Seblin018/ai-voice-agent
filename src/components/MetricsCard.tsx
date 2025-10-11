import { 
  Clock, 
  Phone, 
  Calendar, 
  Shield,
  TrendingUp
} from 'lucide-react';
import { StatCard } from '../types';

interface MetricsCardProps {
  stats: StatCard[];
}

const iconMap = {
  'Clock': Clock,
  'Phone': Phone,
  'Calendar': Calendar,
  'Shield': Shield,
};

export default function MetricsCard({ stats }: MetricsCardProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => {
        const IconComponent = iconMap[stat.icon as keyof typeof iconMap];
        
        return (
          <div key={index} className="bg-white rounded-lg p-6 shadow-md border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-blue-50 rounded-lg">
                {IconComponent && <IconComponent className="h-6 w-6 text-blue-600" />}
              </div>
              <div className="flex items-center gap-1 text-sm text-green-600">
                <TrendingUp className="h-4 w-4" />
                <span>{stat.change}</span>
              </div>
            </div>
            
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {stat.value}
            </h3>
            <p className="text-gray-600 text-sm">{stat.title}</p>
          </div>
        );
      })}
    </div>
  );
}
