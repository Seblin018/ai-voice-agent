import { DollarSign, TrendingUp } from 'lucide-react';
import { ROIData } from '../types';

interface ROICardProps {
  data: ROIData;
}

export default function ROICard({ data }: ROICardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">ROI Analysis</h2>
        <DollarSign className="h-6 w-6" />
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <p className="text-blue-100 text-sm">Revenue</p>
          <p className="text-2xl font-bold">{formatCurrency(data.revenue)}</p>
        </div>
        
        <div className="text-center">
          <p className="text-blue-100 text-sm">Cost</p>
          <p className="text-2xl font-bold">{formatCurrency(data.cost)}</p>
        </div>
        
        <div className="text-center">
          <p className="text-blue-100 text-sm">ROI</p>
          <div className="flex items-center justify-center gap-1">
            <TrendingUp className="h-5 w-5" />
            <p className="text-2xl font-bold">{data.roi}%</p>
          </div>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-blue-400">
        <p className="text-blue-100 text-sm">
          Net Profit: {formatCurrency(data.revenue - data.cost)}
        </p>
      </div>
    </div>
  );
}
