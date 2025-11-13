const fs = require('fs');
const path = require('path');

const content = `import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Users, TrendingUp, TrendingDown, DollarSign, Eye, Edit, Trash2, Calendar } from 'lucide-react'
import { card, button, input, badge, statCardIcon, DESIGN_TOKENS, cx } from '../../styles/design-tokens'
import { accountCardAPI } from '../../services/api'

const TABLE_HEADER_CELL = 'px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider bg-neutral-50'
const TABLE_BODY_CELL = 'px-6 py-4 text-sm text-neutral-900'

interface AccountCard {
  id: number
  code: string
  name: string
  type: 'CUSTOMER' | 'SUPPLIER' | 'BOTH'
  taxNumber?: string
  phone?: string
  balance: number
  createdAt: string
}

const AccountCardList: React.FC = () => {
  const navigate = useNavigate()
  const [accounts, setAccounts] = useState<AccountCard[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('')
  const [balanceFilter, setBalanceFilter] = useState<string>('')

  useEffect(() => { fetchAccounts() }, [])

  const fetchAccounts = async () => {
    try {
      setLoading(true)
      const response = await accountCardAPI.getAll()
      setAccounts(response.data || [])
    } catch (error) {
      console.error('Error:', error)
      setAccounts([])
    } finally {
      setLoading(false)
    }
  }

  const totalAccounts = accounts.length
  const customers = accounts.filter(a => a.type === 'CUSTOMER' || a.type === 'BOTH')
  const totalReceivables = accounts.reduce((sum, acc) => sum + (acc.balance > 0 ? acc.balance : 0), 0)
  const totalPayables = accounts.reduce((sum, acc) => sum + (acc.balance < 0 ? Math.abs(acc.balance) : 0), 0)

  const filteredAccounts = accounts.filter(account => {
    const matchesSearch = searchTerm === '' || account.name?.toLowerCase().includes(searchTerm.toLowerCase()) || account.code?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === '' || account.type === typeFilter
    let matchesBalance = true
    if (balanceFilter === 'RECEIVABLE') matchesBalance = account.balance > 0
    else if (balanceFilter === 'PAYABLE') matchesBalance = account.balance < 0
    else if (balanceFilter === 'ZERO') matchesBalance = account.balance === 0
    return matchesSearch && matchesType && matchesBalance
  })

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neutral-900"></div></div>

  return (
    <div className="space-y-6" style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={cx(card('md', 'default', 'lg'), 'p-6')}>
          <div className="flex items-center justify-between">
            <div><p>Toplam Cari</p><p className="text-2xl font-bold">{totalAccounts}</p></div>
            <div className={statCardIcon('primary')}><Users size={16} /></div>
          </div>
        </div>
        <div className={cx(card('md', 'default', 'lg'), 'p-6')}>
          <div className="flex items-center justify-between">
            <div><p>Toplam Alacak</p><p className="text-2xl font-bold">{totalReceivables.toFixed(2)} TL</p></div>
            <div className={statCardIcon('success')}><TrendingUp size={16} /></div>
          </div>
        </div>
        <div className={cx(card('md', 'default', 'lg'), 'p-6')}>
          <div className="flex items-center justify-between">
            <div><p>Toplam Borç</p><p className="text-2xl font-bold">{totalPayables.toFixed(2)} TL</p></div>
            <div className={statCardIcon('danger')}><TrendingDown size={16} /></div>
          </div>
        </div>
        <div className={cx(card('md', 'default', 'lg'), 'p-6')}>
          <div className="flex items-center justify-between">
            <div><p>Net Pozisyon</p><p className="text-2xl font-bold">{(totalReceivables - totalPayables).toFixed(2)} TL</p></div>
            <div className={statCardIcon('info')}><DollarSign size={16} /></div>
          </div>
        </div>
      </div>
      <div className={cx(card('md', 'default', 'lg'), 'p-4')}>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 text-neutral-400" size={18} />
            <input type="text" placeholder="Cari ara..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className={cx(input('md', 'default', undefined, 'md'), 'pl-10 w-full')} />
          </div>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className={input('md', 'default', undefined, 'md')}>
            <option value="">Tüm Tipler</option>
            <option value="CUSTOMER">Müşteri</option>
            <option value="SUPPLIER">Tedarikçi</option>
          </select>
          <select value={balanceFilter} onChange={(e) => setBalanceFilter(e.target.value)} className={input('md', 'default', undefined, 'md')}>
            <option value="">Tüm Bakiyeler</option>
            <option value="RECEIVABLE">Alacaklı</option>
            <option value="PAYABLE">Borçlu</option>
          </select>
          <button onClick={() => navigate('/accounting/account-card/new')} className={button('md', 'primary', 'md')}>Yeni Cari</button>
        </div>
      </div>
      <div className={cx(card('md', 'default', 'lg'), 'overflow-hidden')} style={{ overflow: 'hidden' }}>
        <div className="overflow-x-auto">
          <table className="w-full" style={{ tableLayout: 'fixed' }}>
            <thead><tr><th className={TABLE_HEADER_CELL}>Kod</th><th className={TABLE_HEADER_CELL}>Cari Adı</th><th className={TABLE_HEADER_CELL}>Tip</th><th className={TABLE_HEADER_CELL}>Bakiye</th><th className={TABLE_HEADER_CELL}>İşlemler</th></tr></thead>
            <tbody>{filteredAccounts.length === 0 ? (<tr><td colSpan={5} className="text-center py-12"><Users size={48} className="mx-auto text-neutral-400 mb-2" /><p>Cari hesap bulunamadı</p></td></tr>) : filteredAccounts.map(a => (<tr key={a.id} className="hover:bg-neutral-50"><td className={TABLE_BODY_CELL}>{a.code}</td><td className={TABLE_BODY_CELL}>{a.name}</td><td className={TABLE_BODY_CELL}><span className={badge('sm', a.type === 'CUSTOMER' ? 'success' : 'warning', 'full')}>{a.type === 'CUSTOMER' ? 'Müşteri' : 'Tedarikçi'}</span></td><td className={TABLE_BODY_CELL}><span className={a.balance > 0 ? 'text-green-600' : 'text-red-600'}>{a.balance.toFixed(2)} TL</span></td><td className={TABLE_BODY_CELL}><div className="flex gap-2"><button onClick={() => navigate(\/accounting/account-card/\\)}><Eye size={18} /></button><button onClick={() => navigate(\/accounting/account-card/\/edit\)}><Edit size={18} /></button></div></td></tr>))}</tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default AccountCardList
`;

const filePath = 'c:/Users/umity/Desktop/CANARY-BACKUP-20251008-1156/frontend/src/components/accounting/AccountCardList.tsx';
fs.writeFileSync(filePath, content, 'utf8');
console.log('File created successfully');
