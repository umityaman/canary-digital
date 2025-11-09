import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  Edit2,
  Trash2,
  ChevronRight,
  ChevronDown,
  TrendingUp,
  TrendingDown,
  DollarSign,
  RefreshCw,
  Download,
  Eye,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { card, button, badge, DESIGN_TOKENS, cx } from '../../styles/design-tokens';
import AccountFormModal from './AccountFormModal';
import { exportChartOfAccountsToExcel } from '../../utils/excelExport';

interface ChartOfAccount {
  id: number;
  code: string;
  name: string;
  type: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE';
  parentId: number | null;
  balance: number;
  isActive: boolean;
  children?: ChartOfAccount[];
}

export default function ChartOfAccountsManagement() {
  const [accounts, setAccounts] = useState<ChartOfAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [expandedNodes, setExpandedNodes] = useState<Set<number>>(new Set());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<ChartOfAccount | null>(null);

  useEffect(() => {
    loadAccounts();
  }, [typeFilter]);

  const loadAccounts = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      if (typeFilter !== 'ALL') params.append('type', typeFilter);

      const response = await fetch(`/api/accounting/chart-of-accounts?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to load accounts');

      const data = await response.json();
      setAccounts(buildAccountTree(data.data || data));
    } catch (error: any) {
      console.error('Failed to load accounts:', error);
      toast.error('Hesap planı yüklenemedi: ' + (error.message || 'Bilinmeyen hata'));
    } finally {
      setLoading(false);
    }
  };

  const buildAccountTree = (accounts: ChartOfAccount[]): ChartOfAccount[] => {
    const accountMap = new Map<number, ChartOfAccount>();
    const rootAccounts: ChartOfAccount[] = [];

    // Create map
    accounts.forEach((account) => {
      accountMap.set(account.id, { ...account, children: [] });
    });

    // Build tree
    accounts.forEach((account) => {
      const node = accountMap.get(account.id)!;
      if (account.parentId) {
        const parent = accountMap.get(account.parentId);
        if (parent) {
          parent.children!.push(node);
        } else {
          rootAccounts.push(node);
        }
      } else {
        rootAccounts.push(node);
      }
    });

    // Sort by code
    const sortByCode = (a: ChartOfAccount, b: ChartOfAccount) => 
      a.code.localeCompare(b.code);

    rootAccounts.sort(sortByCode);
    rootAccounts.forEach((account) => {
      if (account.children) account.children.sort(sortByCode);
    });

    return rootAccounts;
  };

  const toggleNode = (accountId: number) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(accountId)) {
      newExpanded.delete(accountId);
    } else {
      newExpanded.add(accountId);
    }
    setExpandedNodes(newExpanded);
  };

  const handleDeleteAccount = async (accountId: number) => {
    if (!confirm('Bu hesabı silmek istediğinize emin misiniz?')) return;

    try {
      const response = await fetch(`/api/accounting/chart-of-accounts/${accountId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to delete account');

      toast.success('Hesap silindi');
      loadAccounts();
    } catch (error: any) {
      toast.error('Hesap silinemedi: ' + (error.message || 'Bilinmeyen hata'));
    }
  };

  const getAccountTypeLabel = (type: string): string => {
    const typeMap: Record<string, string> = {
      ASSET: 'Varlık',
      LIABILITY: 'Borç',
      EQUITY: 'Özkaynak',
      REVENUE: 'Gelir',
      EXPENSE: 'Gider',
    };
    return typeMap[type] || type;
  };

  const getAccountTypeBadge = (type: string) => {
    const typeConfig: Record<string, { color: string }> = {
      ASSET: { color: 'bg-blue-100 text-blue-700' },
      LIABILITY: { color: 'bg-red-100 text-red-700' },
      EQUITY: { color: 'bg-purple-100 text-purple-700' },
      REVENUE: { color: 'bg-green-100 text-green-700' },
      EXPENSE: { color: 'bg-orange-100 text-orange-700' },
    };

    const config = typeConfig[type] || { color: 'bg-gray-100 text-gray-700' };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {getAccountTypeLabel(type)}
      </span>
    );
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    }).format(amount);
  };

  const renderAccountRow = (account: ChartOfAccount, level: number = 0) => {
    const hasChildren = account.children && account.children.length > 0;
    const isExpanded = expandedNodes.has(account.id);
    const matchesSearch = 
      account.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      account.name.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch && searchQuery) return null;

    return (
      <React.Fragment key={account.id}>
        <tr className="hover:bg-gray-50 transition-colors">
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="flex items-center" style={{ paddingLeft: `${level * 24}px` }}>
              {hasChildren ? (
                <button
                  onClick={() => toggleNode(account.id)}
                  className="mr-2 text-gray-400 hover:text-gray-600"
                >
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>
              ) : (
                <span className="mr-2 w-4" />
              )}
              <BookOpen className="w-4 h-4 text-gray-400 mr-2" />
              <span className={`${DESIGN_TOKENS?.typography?.body.sm} font-mono font-medium ${DESIGN_TOKENS?.colors?.text.primary}`}>
                {account.code}
              </span>
            </div>
          </td>
          <td className="px-6 py-4">
            <div>
              <p className={`${DESIGN_TOKENS?.typography?.body.sm} ${DESIGN_TOKENS?.colors?.text.primary} font-medium`}>
                {account.name}
              </p>
              {!account.isActive && (
                <span className="text-xs text-gray-400">(Pasif)</span>
              )}
            </div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-center">
            {getAccountTypeBadge(account.type)}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-right">
            <span className={`${DESIGN_TOKENS?.typography?.body.sm} font-medium ${
              account.balance >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {formatCurrency(account.balance)}
            </span>
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-right">
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => toast.success('Detay görüntüleme özelliği yakında eklenecek')}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Detayları Görüntüle"
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setEditingAccount(account);
                  setShowCreateModal(true);
                }}
                className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                title="Düzenle"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDeleteAccount(account.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Sil"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </td>
        </tr>

        {/* Render children if expanded */}
        {hasChildren && isExpanded && account.children!.map((child) => 
          renderAccountRow(child, level + 1)
        )}
      </React.Fragment>
    );
  };

  const flattenAccounts = (accounts: ChartOfAccount[]): ChartOfAccount[] => {
    const result: ChartOfAccount[] = [];
    
    const flatten = (accs: ChartOfAccount[]) => {
      accs.forEach((acc) => {
        result.push(acc);
        if (acc.children && acc.children.length > 0) {
          flatten(acc.children);
        }
      });
    };

    flatten(accounts);
    return result;
  };

  const flatAccounts = flattenAccounts(accounts);
  const totalBalance = flatAccounts.reduce((sum, acc) => sum + acc.balance, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className={`${DESIGN_TOKENS?.typography?.heading.h2} ${DESIGN_TOKENS?.colors?.text.primary}`}>
            Hesap Planı Yönetimi
          </h2>
          <p className={`${DESIGN_TOKENS?.typography?.body.sm} ${DESIGN_TOKENS?.colors?.text.secondary} mt-1`}>
            Muhasebe hesaplarını görüntüleyin ve yönetin
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            className={button('secondary', 'md', 'md')}
            onClick={() => {
              try {
                exportChartOfAccountsToExcel(flatAccounts);
                toast.success('Hesap planı Excel olarak indirildi');
              } catch (error) {
                toast.error('Excel export başarısız oldu');
              }
            }}
          >
            <Download className="w-4 h-4" />
            Excel İndir
          </button>
          <button
            className={button('primary', 'md', 'md')}
            onClick={() => {
              setEditingAccount(null);
              setShowCreateModal(true);
            }}
          >
            <Plus className="w-4 h-4" />
            Yeni Hesap
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={card('md', 'md', 'default', 'lg')}>
          <div className="flex items-center justify-between mb-2">
            <BookOpen className="w-8 h-8 text-blue-500" />
          </div>
          <p className={`${DESIGN_TOKENS?.typography?.stat.md} ${DESIGN_TOKENS?.colors?.text.primary}`}>
            {flatAccounts.length}
          </p>
          <p className={`${DESIGN_TOKENS?.typography?.body.sm} ${DESIGN_TOKENS?.colors?.text.secondary}`}>
            Toplam Hesap
          </p>
        </div>

        <div className={card('md', 'md', 'default', 'lg')}>
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8 text-green-500" />
          </div>
          <p className={`${DESIGN_TOKENS?.typography?.stat.md} ${DESIGN_TOKENS?.colors?.text.primary}`}>
            {flatAccounts.filter((a) => a.balance > 0).length}
          </p>
          <p className={`${DESIGN_TOKENS?.typography?.body.sm} ${DESIGN_TOKENS?.colors?.text.secondary}`}>
            Pozitif Bakiye
          </p>
        </div>

        <div className={card('md', 'md', 'default', 'lg')}>
          <div className="flex items-center justify-between mb-2">
            <TrendingDown className="w-8 h-8 text-red-500" />
          </div>
          <p className={`${DESIGN_TOKENS?.typography?.stat.md} ${DESIGN_TOKENS?.colors?.text.primary}`}>
            {flatAccounts.filter((a) => a.balance < 0).length}
          </p>
          <p className={`${DESIGN_TOKENS?.typography?.body.sm} ${DESIGN_TOKENS?.colors?.text.secondary}`}>
            Negatif Bakiye
          </p>
        </div>

        <div className={card('md', 'md', 'default', 'lg')}>
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-8 h-8 text-purple-500" />
          </div>
          <p className={`${DESIGN_TOKENS?.typography?.stat.md} ${totalBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(totalBalance)}
          </p>
          <p className={`${DESIGN_TOKENS?.typography?.body.sm} ${DESIGN_TOKENS?.colors?.text.secondary}`}>
            Net Bakiye
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className={card('md', 'md', 'default', 'lg')}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Hesap kodu veya adı ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="ALL">Tüm Hesap Tipleri</option>
            <option value="ASSET">Varlık</option>
            <option value="LIABILITY">Borç</option>
            <option value="EQUITY">Özkaynak</option>
            <option value="REVENUE">Gelir</option>
            <option value="EXPENSE">Gider</option>
          </select>
        </div>

        <div className="flex items-center gap-2 mt-4">
          <button
            onClick={loadAccounts}
            className={button('secondary', 'sm', 'md')}
          >
            <RefreshCw className="w-4 h-4" />
            Yenile
          </button>

          <button
            onClick={() => {
              // Expand all nodes
              const allIds = new Set(flatAccounts.map((a) => a.id));
              setExpandedNodes(allIds);
            }}
            className={button('secondary', 'sm', 'md')}
          >
            Tümünü Aç
          </button>

          <button
            onClick={() => setExpandedNodes(new Set())}
            className={button('secondary', 'sm', 'md')}
          >
            Tümünü Kapat
          </button>

          <button
            onClick={() => toast.success('Excel export özelliği yakında eklenecek')}
            className={button('secondary', 'sm', 'md')}
          >
            <Download className="w-4 h-4" />
            Excel İndir
          </button>
        </div>
      </div>

      {/* Accounts Table */}
      <div className={card('none', 'none', 'default', 'lg')}>
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : accounts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center p-6">
            <BookOpen className="w-16 h-16 text-gray-300 mb-4" />
            <p className={`${DESIGN_TOKENS?.typography?.body.lg} ${DESIGN_TOKENS?.colors?.text.primary} mb-2`}>
              Hesap Bulunamadı
            </p>
            <p className={`${DESIGN_TOKENS?.typography?.body.sm} ${DESIGN_TOKENS?.colors?.text.tertiary}`}>
              Henüz hesap eklenmemiş
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hesap Kodu
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hesap Adı
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tip
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bakiye
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {accounts.map((account) => renderAccountRow(account, 0))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <AccountFormModal
        open={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setEditingAccount(null);
        }}
        onSaved={() => {
          loadAccounts();
          setShowCreateModal(false);
          setEditingAccount(null);
        }}
        initialData={editingAccount}
      />
    </div>
  );
}
