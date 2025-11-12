import React, { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Shield,
  CheckCircle2,
  XCircle,
  Clock,
  Mail,
  Phone,
  Calendar,
} from 'lucide-react';

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'seller' | 'customer';
  status: 'active' | 'pending' | 'suspended';
  registeredDate: string;
  lastLogin: string;
  totalBookings: number;
  totalSpent: number;
}

const UserManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'admin' | 'seller' | 'customer'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const users: User[] = [
    {
      id: 1,
      name: 'Ahmet YÄ±lmaz',
      email: 'ahmet@example.com',
      phone: '+90 532 123 4567',
      role: 'admin',
      status: 'active',
      registeredDate: '10 Oca 2024',
      lastLogin: '2 saat Ã¶nce',
      totalBookings: 0,
      totalSpent: 0,
    },
    {
      id: 2,
      name: 'Mehmet Demir',
      email: 'mehmet@rental.com',
      phone: '+90 533 234 5678',
      role: 'seller',
      status: 'active',
      registeredDate: '15 Åub 2024',
      lastLogin: '1 gÃ¼n Ã¶nce',
      totalBookings: 45,
      totalSpent: 125000,
    },
    {
      id: 3,
      name: 'AyÅŸe Kaya',
      email: 'ayse@customer.com',
      phone: '+90 534 345 6789',
      role: 'customer',
      status: 'active',
      registeredDate: '20 Mar 2025',
      lastLogin: '3 saat Ã¶nce',
      totalBookings: 12,
      totalSpent: 35000,
    },
    {
      id: 4,
      name: 'Zeynep Arslan',
      email: 'zeynep@example.com',
      phone: '+90 535 456 7890',
      role: 'customer',
      status: 'pending',
      registeredDate: '18 Eki 2025',
      lastLogin: 'HiÃ§ giriÅŸ yapmadÄ±',
      totalBookings: 0,
      totalSpent: 0,
    },
  ];

  const getRoleLabel = (role: string) => {
    const labels = {
      admin: 'YÃ¶netici',
      seller: 'SatÄ±cÄ±',
      customer: 'MÃ¼ÅŸteri',
    };
    return labels[role as keyof typeof labels] || role;
  };

  const getRoleColor = (role: string) => {
    const colors = {
      admin: 'bg-neutral-900 text-white',
      seller: 'bg-neutral-700 text-white',
      customer: 'bg-neutral-400 text-white',
    };
    return colors[role as keyof typeof colors] || 'bg-neutral-100 text-neutral-900';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'bg-neutral-900 text-white',
      pending: 'bg-neutral-400 text-white',
      suspended: 'bg-neutral-600 text-white',
    };
    return colors[status as keyof typeof colors] || 'bg-neutral-100 text-neutral-900';
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      active: 'Aktif',
      pending: 'Beklemede',
      suspended: 'AskÄ±ya AlÄ±ndÄ±',
    };
    return labels[status as keyof typeof labels] || status;
  };

  const filteredUsers = users.filter((user) => {
    const matchesTab = activeTab === 'all' || user.role === activeTab;
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const stats = {
    total: users.length,
    admin: users.filter((u) => u.role === 'admin').length,
    seller: users.filter((u) => u.role === 'seller').length,
    customer: users.filter((u) => u.role === 'customer').length,
    active: users.filter((u) => u.status === 'active').length,
    pending: users.filter((u) => u.status === 'pending').length,
  };

  return (
    <div className="p-6 bg-neutral-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 flex items-center gap-3">
              <Users size={32} className="text-neutral-900" />
              KullanÄ±cÄ± YÃ¶netimi
            </h1>
            <p className="text-neutral-600 mt-1">Ãœyeleri ve rolleri yÃ¶netin</p>
          </div>
          <button className="flex items-center gap-2 px-6 py-3 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors font-medium shadow-lg">
            <Plus size={20} />
            Yeni KullanÄ±cÄ±
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl border border-neutral-200">
            <div className="text-neutral-600 text-xs mb-1">Toplam</div>
            <div className="text-2xl font-bold text-neutral-900">{stats.total}</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-neutral-200">
            <div className="text-neutral-600 text-xs mb-1">YÃ¶netici</div>
            <div className="text-2xl font-bold text-neutral-900">{stats.admin}</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-neutral-200">
            <div className="text-neutral-600 text-xs mb-1">SatÄ±cÄ±</div>
            <div className="text-2xl font-bold text-neutral-900">{stats.seller}</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-neutral-200">
            <div className="text-neutral-600 text-xs mb-1">MÃ¼ÅŸteri</div>
            <div className="text-2xl font-bold text-neutral-900">{stats.customer}</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-neutral-200">
            <div className="text-neutral-600 text-xs mb-1">Aktif</div>
            <div className="text-2xl font-bold text-neutral-900">{stats.active}</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-neutral-200">
            <div className="text-neutral-600 text-xs mb-1">Bekleyen</div>
            <div className="text-2xl font-bold text-neutral-900">{stats.pending}</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex items-center gap-2">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-xl font-medium transition-colors ${
            activeTab === 'all'
              ? 'bg-neutral-900 text-white'
              : 'bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200'
          }`}
        >
          TÃ¼mÃ¼ ({stats.total})
        </button>
        <button
          onClick={() => setActiveTab('admin')}
          className={`px-4 py-2 rounded-xl font-medium transition-colors ${
            activeTab === 'admin'
              ? 'bg-neutral-900 text-white'
              : 'bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200'
          }`}
        >
          YÃ¶netici ({stats.admin})
        </button>
        <button
          onClick={() => setActiveTab('seller')}
          className={`px-4 py-2 rounded-xl font-medium transition-colors ${
            activeTab === 'seller'
              ? 'bg-neutral-900 text-white'
              : 'bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200'
          }`}
        >
          SatÄ±cÄ± ({stats.seller})
        </button>
        <button
          onClick={() => setActiveTab('customer')}
          className={`px-4 py-2 rounded-xl font-medium transition-colors ${
            activeTab === 'customer'
              ? 'bg-neutral-900 text-white'
              : 'bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200'
          }`}
        >
          MÃ¼ÅŸteri ({stats.customer})
        </button>
      </div>

      {/* Search & Filter */}
      <div className="mb-6 flex gap-4">
        <div className="flex-1 relative">
          <Search
            size={20}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
          />
          <input
            type="text"
            placeholder="Ä°sim veya email ile ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 border border-neutral-200 rounded-xl hover:bg-neutral-100 transition-colors">
          <Filter size={20} />
          Filtrele
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase">
                  KullanÄ±cÄ±
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase">
                  Ä°letiÅŸim
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-neutral-600 uppercase">
                  Rol
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-neutral-600 uppercase">
                  Durum
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-neutral-600 uppercase">
                  Rezervasyon
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-neutral-600 uppercase">
                  Toplam Harcama
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase">
                  KayÄ±t Tarihi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase">
                  Son GiriÅŸ
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-neutral-600 uppercase">
                  Ä°ÅŸlemler
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-neutral-900 text-white rounded-full flex items-center justify-center font-bold text-sm">
                        {user.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-neutral-900">{user.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs text-neutral-700">
                        <Mail size={14} />
                        {user.email}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-neutral-700">
                        <Phone size={14} />
                        {user.phone}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(
                        user.role
                      )}`}
                    >
                      <Shield size={14} />
                      {getRoleLabel(user.role)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        user.status
                      )}`}
                    >
                      {user.status === 'active' ? (
                        <CheckCircle2 size={14} />
                      ) : user.status === 'pending' ? (
                        <Clock size={14} />
                      ) : (
                        <XCircle size={14} />
                      )}
                      {getStatusLabel(user.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900 text-right">
                    {user.totalBookings}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900 text-right">
                    â‚º{user.totalSpent.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2 text-xs text-neutral-600">
                      <Calendar size={14} />
                      {user.registeredDate}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-neutral-600">
                    {user.lastLogin}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
                        <Edit size={16} className="text-neutral-700" />
                      </button>
                      <button className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
                        <Trash2 size={16} className="text-neutral-700" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
