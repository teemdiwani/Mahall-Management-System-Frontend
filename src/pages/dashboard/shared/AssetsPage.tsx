import React from 'react';
import { Package, Building2, Wrench, MapPin, DollarSign, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { PageHeader, StatCard } from '../../../components/ui/EmptyState';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import Tabs, { useTabs } from '../../../components/ui/Tabs';
import { assetsApi } from '../../../api/domainApis';

const typeIcons: Record<string, React.ReactNode> = {
  building: <Building2 size={18} />, BUILDING: <Building2 size={18} />,
  land: <MapPin size={18} />, LAND: <MapPin size={18} />,
  equipment: <Package size={18} />, EQUIPMENT: <Package size={18} />,
  rental_shop: <Building2 size={18} />, RENTAL_SHOP: <Building2 size={18} />,
  vehicle: <Package size={18} />, VEHICLE: <Package size={18} />,
  other: <Package size={18} />, OTHER: <Package size={18} />,
};

const AssetCard: React.FC<{ asset: any }> = ({ asset }) => {
  const type = (asset.type || 'OTHER').toLowerCase();
  const status = (asset.status || 'OPERATIONAL').toLowerCase();
  const isRental = Boolean(asset.monthlyRent && asset.monthlyRent > 0) || type === 'rental_shop';
  const valueNum = Number(asset.estimatedValue || asset.value || 0);

  return (
    <Card padding="md" hover>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
            ${status === 'under_maintenance' || status === 'maintenance' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
            {typeIcons[asset.type] || <Building2 size={18} />}
          </div>
          <div>
            <p className="font-semibold text-gray-800 leading-snug">{asset.name}</p>
            <p className="text-xs text-gray-400 capitalize">{type.replace('_', ' ')}</p>
          </div>
        </div>
        <Badge
          variant={status === 'operational' || status === 'rented' ? 'emerald' : status === 'under_maintenance' ? 'amber' : 'gray'}
          dot
        >
          {status.replace('_', ' ')}
        </Badge>
      </div>
      <p className="text-sm text-gray-500 mb-3 line-clamp-2">{asset.description || 'Mahall community property record'}</p>
      <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
        <MapPin size={12} />
        {asset.location}
      </div>
      <div className="border-t border-gray-50 pt-3 flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-400">Asset Valuation</p>
          <p className="text-sm font-bold text-gray-800">
            {valueNum >= 10000000 ? `₹${(valueNum / 10000000).toFixed(2)} Cr` : `₹${(valueNum / 100000).toFixed(1)} L`}
          </p>
        </div>
        {isRental && (
          <div className="text-right">
            <p className="text-xs text-gray-400">Monthly Rent</p>
            <p className="text-sm font-bold text-emerald-600">₹{Number(asset.monthlyRent || 0).toLocaleString()}</p>
            {asset.tenantName && <p className="text-xs text-gray-400">{asset.tenantName}</p>}
          </div>
        )}
      </div>
    </Card>
  );
};

const AssetsPage: React.FC = () => {
  const { activeTab, setActiveTab } = useTabs('all');

  const { data: assetsData, isLoading } = useQuery({
    queryKey: ['assets', activeTab],
    queryFn: () => assetsApi.list({ type: activeTab !== 'all' ? activeTab : undefined }),
  });

  const { data: statsData } = useQuery({
    queryKey: ['assets-stats'],
    queryFn: assetsApi.getStats,
  });

  const assets: any[] = assetsData?.data || [];
  const stats = statsData?.data || {
    totalAssets: assets.length,
    totalValuation: assets.reduce((s, a) => s + (a.estimatedValue || 0), 0),
    totalMonthlyRental: assets.reduce((s, a) => s + (a.monthlyRent || 0), 0),
  };

  const filtered = assets.filter(a => {
    if (activeTab === 'all') return true;
    if (activeTab === 'rental') return Boolean(a.monthlyRent && a.monthlyRent > 0) || a.type === 'RENTAL_SHOP';
    if (activeTab === 'maintenance') return a.status === 'UNDER_MAINTENANCE';
    return (a.type || '').toLowerCase() === activeTab.toLowerCase();
  });

  const totalValuationCr = ((stats.totalValuation || 0) / 10000000).toFixed(2);
  const totalRent = stats.totalMonthlyRental || 0;

  return (
    <div>
      <PageHeader
        title="Assets & Property"
        subtitle="Mahall properties, endowment Waqf, and rental units connected directly to MongoDB"
        breadcrumb={[{ label: 'Dashboard' }, { label: 'Assets' }]}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Assets" value={String(stats.totalAssets || assets.length)} icon={<Package size={20} />} />
        <StatCard label="Total Valuation" value={`₹${totalValuationCr} Cr`} icon={<DollarSign size={20} />} iconBg="bg-blue-50 text-blue-600" />
        <StatCard label="Monthly Rental Revenue" value={`₹${totalRent.toLocaleString()}/mo`} icon={<Building2 size={20} />} iconBg="bg-teal-50 text-teal-600" />
        <StatCard label="Registered Waqf Units" value={String(assets.length)} icon={<Wrench size={20} />} iconBg="bg-amber-50 text-amber-600" />
      </div>

      <div className="mb-5">
        <Tabs
          activeTab={activeTab}
          onChange={setActiveTab}
          variant="pills"
          tabs={[
            { key: 'all', label: 'All' },
            { key: 'building', label: 'Buildings' },
            { key: 'land', label: 'Land' },
            { key: 'rental', label: 'Rental Units' },
            { key: 'equipment', label: 'Equipment' },
          ]}
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-gray-400 gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
          <span className="text-sm">Loading asset registry from database...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-sm">No assets found for this category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(asset => (
            <AssetCard key={asset._id || asset.id} asset={asset} />
          ))}
        </div>
      )}
    </div>
  );
};

export default AssetsPage;

