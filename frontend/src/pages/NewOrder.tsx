import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Plus, X, Calendar, QrCode, UserPlus, ChevronDown, ChevronUp,
  User, MapPin, FileText, Mail, Phone, Tag, StickyNote, CreditCard, Package, MoreHorizontal,
  Copy, Clock, Grip
} from 'lucide-react';

const NewOrder: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [pickupDate, setPickupDate] = useState('');
  const [pickupTime, setPickupTime] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [returnTime, setReturnTime] = useState('');
  const [searchProducts, setSearchProducts] = useState('');
  const [notes, setNotes] = useState('');
  
  // Modal states
  const [showThreeDotsMenu, setShowThreeDotsMenu] = useState(false);
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [showCustomFieldModal, setShowCustomFieldModal] = useState(false);
  const [showAddLineMenu, setShowAddLineMenu] = useState(false);
  
  // Product lines
  const [productLines, setProductLines] = useState<any[]>([]);
  // Drag state
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  // Helpers
  const generateId = () => Math.random().toString(36).slice(2, 9);

  const addCustomLine = (kind: 'custom' | 'charge' | 'section') => {
    const id = generateId();
    if (kind === 'charge') {
      setProductLines(prev => [
        ...prev,
        { id, type: 'charge', title: 'Charge', qty: 1, price: 0, tax: 'No tax' }
      ]);
    } else if (kind === 'section') {
      setProductLines(prev => [
        ...prev,
        { id, type: 'section', title: 'Section', isSection: true }
      ]);
    } else {
      setProductLines(prev => [
        ...prev,
        { id, type: 'custom', title: '', qty: 1, price: 0, tax: 'No tax' }
      ]);
    }
    setShowAddLineMenu(false);
  };

  const updateLine = (id: string, patch: Partial<any>) => {
    setProductLines(prev => prev.map(l => l.id === id ? { ...l, ...patch } : l));
  };

  const removeLine = (id: string) => {
    setProductLines(prev => prev.filter(l => l.id !== id));
  };

  // Drag & drop handlers
  const onDragStart = (e: React.DragEvent, index: number) => {
    setDragIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const onDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (dragIndex === null) return;
    setProductLines(prev => {
      const copy = [...prev];
      const [moved] = copy.splice(dragIndex, 1);
      copy.splice(dropIndex, 0, moved);
      return copy;
    });
    setDragIndex(null);
  };

  const subtotal = productLines.reduce((s, l) => {
    if (l.type === 'charge' || l.type === 'custom') {
      const qty = Number(l.qty || 0);
      const price = Number(l.price || 0);
      return s + qty * price;
    }
    return s;
  }, 0);
  
  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.dropdown-container')) {
        setShowThreeDotsMenu(false);
        setShowAddLineMenu(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Accordion states
  const [documentsOpen, setDocumentsOpen] = useState(true);
  const [invoicesOpen, setInvoicesOpen] = useState(true);
  const [paymentsOpen, setPaymentsOpen] = useState(true);
  const [tagsOpen, setTagsOpen] = useState(true);
  const [notesOpen, setNotesOpen] = useState(true);

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* Add Customer Modal */}
      {showAddCustomerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">New customer</h2>
              <button 
                onClick={() => setShowAddCustomerModal(false)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First name *</label>
                  <input type="text" className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last name</label>
                  <input type="text" className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input type="email" className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input type="tel" className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                <input type="text" className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tax ID</label>
                <input type="text" className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input type="text" placeholder="Street address" className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2" />
                <div className="grid grid-cols-2 gap-2">
                  <input type="text" placeholder="City" className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <input type="text" placeholder="Postal code" className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <input type="text" placeholder="Country" className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mt-2" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea rows={3} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"></textarea>
              </div>
            </div>
            
            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-2">
              <button 
                onClick={() => setShowAddCustomerModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
                Add customer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Field Modal */}
      {showCustomFieldModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">New custom field</h2>
              <button 
                onClick={() => setShowCustomFieldModal(false)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Custom field label</label>
                <input type="text" className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data type</label>
                <select className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Single line text</option>
                  <option>Multi-line text</option>
                  <option>Date</option>
                  <option>Address</option>
                  <option>Phone</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
                <input type="text" className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Show on</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                    <span className="text-sm text-gray-700">Quotes</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                    <span className="text-sm text-gray-700">Contracts</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                    <span className="text-sm text-gray-700">Invoices</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                    <span className="text-sm text-gray-700">Packing slip</span>
                  </label>
                </div>
              </div>
            </div>
            
            <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-2">
              <button 
                onClick={() => setShowCustomFieldModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
                Add field
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex">
        {/* Left Side - Header + Main Content */}
        <div className="flex-1">
          {/* Header */}
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-sm text-gray-600">
                  <span className="hover:text-gray-900 cursor-pointer" onClick={() => navigate('/orders')}>Orders</span>
                  <span className="mx-2">›</span>
                  <span className="text-gray-900">New order</span>
                </div>
                <span className="px-2.5 py-0.5 bg-gray-200 text-gray-700 text-xs font-medium rounded-full">New</span>
              </div>
              
              <div className="flex items-center gap-2">
                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700">
                  Save as draft
                </button>
                <div className="relative dropdown-container">
                  <button 
                    onClick={() => setShowThreeDotsMenu(!showThreeDotsMenu)}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <MoreHorizontal className="w-5 h-5 text-gray-600" />
                  </button>
                  
                  {/* 3-Dot Dropdown Menu */}
                  {showThreeDotsMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                      <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                        <Copy className="w-4 h-4" />
                        Duplicate order
                      </button>
                      <button className="w-full px-4 py-2 text-left text-sm text-gray-500 hover:bg-gray-50 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Revert to draft
                      </button>
                      <button className="w-full px-4 py-2 text-left text-sm text-gray-500 hover:bg-gray-50 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Revert to reserved
                      </button>
                      <button className="w-full px-4 py-2 text-left text-sm text-gray-500 hover:bg-gray-50 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Revert to picked up
                      </button>
                      <button className="w-full px-4 py-2 text-left text-sm text-gray-500 hover:bg-gray-50 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Revert to returned
                      </button>
                      <hr className="my-1 border-gray-200" />
                      <button className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-50 flex items-center gap-2">
                        <X className="w-4 h-4" />
                        Cancel order
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="p-6 space-y-6">
            
            {/* Row 1: 2 Columns - Customer+Information | Pickup */}
            <div className="grid grid-cols-2 gap-6">
              
              {/* Left Column: Customer + Information (Alt Alta) */}
              <div className="space-y-6">
                
                {/* Customer Section */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-base font-semibold text-gray-900 mb-4">Customer</h3>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search customer"
                        className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <button
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      title="Scan QR"
                    >
                      <QrCode className="w-4 h-4 text-gray-600" />
                    </button>
                    <button
                      onClick={() => setShowAddCustomerModal(true)}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      title="Add customer"
                    >
                      <UserPlus className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                </div>

                {/* Information Section */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-semibold text-gray-900">Information</h3>
                    <button 
                      onClick={() => setShowCustomFieldModal(true)}
                      className="text-sm text-gray-700 hover:text-gray-900 font-medium px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Add field
                    </button>
                  </div>
                  
                  <div className="text-center py-8 border border-dashed border-gray-300 rounded-lg bg-gray-50">
                    <p className="text-sm font-medium text-gray-900 mb-2">You haven't set up any custom fields yet.</p>
                    <p className="text-xs text-gray-600 mb-3 px-4">
                      Custom fields display extra details like delivery info or notes. Set them to auto-populate on orders or add one-off fields using the button above. You can also configure them to collect data from your online store.
                    </p>
                    <button 
                      onClick={() => {
                        // TODO: Navigate to custom fields settings page when it's created
                        alert('Custom fields settings page will be created in next phase');
                      }}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Set up custom fields
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Pickup (Tek Başına) */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-base font-semibold text-gray-900 mb-4">Pickup</h3>

                {/* Pick up */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Pick up</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <input
                        type="date"
                        value={pickupDate}
                        onChange={(e) => setPickupDate(e.target.value)}
                        placeholder="Select date"
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <input
                        type="time"
                        value={pickupTime}
                        onChange={(e) => setPickupTime(e.target.value)}
                        placeholder="Time"
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Return */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Return</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <input
                        type="date"
                        value={returnDate}
                        onChange={(e) => setReturnDate(e.target.value)}
                        placeholder="Select date"
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <input
                        type="time"
                        value={returnTime}
                        onChange={(e) => setReturnTime(e.target.value)}
                        placeholder="Time"
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Row 2: Products & Pricing (Tek Section, Full Width) */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              
              {/* PRODUCTS PART */}
              <div className="flex gap-2 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search to add products"
                    value={searchProducts}
                    onChange={(e) => setSearchProducts(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  title="Scan QR"
                >
                  <QrCode className="w-4 h-4 text-gray-600" />
                </button>
              </div>

              {/* Product lines list or Empty State */}
              {productLines.length === 0 ? (
                <div className="text-center py-20 mb-6">
                  <p className="text-sm text-gray-900 font-medium mb-1">This order is empty. Get started by adding some products or a custom line.</p>
                </div>
              ) : (
                <div className="space-y-2 mb-6">
                  {productLines.map((line, idx) => (
                    <div
                      key={line.id}
                      draggable={!line.isSection}
                      onDragStart={(e) => onDragStart(e, idx)}
                      onDragOver={onDragOver}
                      onDrop={(e) => onDrop(e, idx)}
                      className="flex items-center gap-2 p-2 border border-gray-200 rounded-md bg-white hover:bg-gray-50"
                    >
                      {/* Drag Handle */}
                      <button className="p-1 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <circle cx="6" cy="4" r="1" fill="currentColor"/>
                          <circle cx="10" cy="4" r="1" fill="currentColor"/>
                          <circle cx="6" cy="8" r="1" fill="currentColor"/>
                          <circle cx="10" cy="8" r="1" fill="currentColor"/>
                          <circle cx="6" cy="12" r="1" fill="currentColor"/>
                          <circle cx="10" cy="12" r="1" fill="currentColor"/>
                        </svg>
                      </button>

                      {/* Menu Button */}
                      <button className="p-1 text-gray-400 hover:text-gray-600">
                        <ChevronDown className="w-4 h-4" />
                      </button>

                      {/* Title Input - Resimdeki gibi */}
                      <div className="flex-1">
                        <input
                          type="text"
                          value={line.title}
                          onChange={(e) => updateLine(line.id, { title: e.target.value })}
                          placeholder={line.isSection ? "Section name" : line.type === 'charge' ? "Title" : "Name"}
                          className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      {/* Quantity - Sadece Charge için */}
                      {line.type === 'charge' && (
                        <div className="flex items-center border border-gray-300 rounded">
                          <button 
                            onClick={() => updateLine(line.id, { qty: Math.max(1, Number(line.qty || 1) - 1) })} 
                            className="px-2 py-1 hover:bg-gray-100 text-gray-600"
                          >
                            -
                          </button>
                          <input 
                            type="text" 
                            value={line.qty || 1} 
                            onChange={(e) => updateLine(line.id, { qty: Number(e.target.value) || 1 })} 
                            className="w-12 text-center text-sm py-1 border-x border-gray-300"
                          />
                          <button 
                            onClick={() => updateLine(line.id, { qty: Number(line.qty || 1) + 1 })} 
                            className="px-2 py-1 hover:bg-gray-100 text-gray-600"
                          >
                            +
                          </button>
                        </div>
                      )}

                      {/* Price - Sadece Charge için */}
                      {line.type === 'charge' && (
                        <div className="flex items-center gap-1">
                          <span className="text-sm text-gray-600">£</span>
                          <input 
                            type="text" 
                            value={line.price || '0,00'} 
                            onChange={(e) => updateLine(line.id, { price: e.target.value })} 
                            className="w-20 px-2 py-1.5 text-sm text-right border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      )}

                      {/* Tax Category - Sadece Charge için */}
                      {line.type === 'charge' && (
                        <select 
                          value={line.tax || 'No tax'} 
                          onChange={(e) => updateLine(line.id, { tax: e.target.value })} 
                          className="px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500 bg-white"
                        >
                          <option>No tax category</option>
                          <option>20% VAT</option>
                          <option>No tax</option>
                        </select>
                      )}

                      {/* Total - Sadece Charge için */}
                      {line.type === 'charge' && (
                        <div className="w-24 text-right font-medium text-sm">
                          £{((Number(line.qty) || 0) * (Number(line.price) || 0)).toFixed(2)}
                        </div>
                      )}

                      {/* Delete Button */}
                      <button 
                        onClick={() => removeLine(line.id)} 
                        className="p-1 text-gray-400 hover:text-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Divider */}
              <hr className="my-6 border-gray-200" />

              {/* PRICING PART - Sol: Add custom line, Sağ: Pricing bilgileri */}
              <div className="flex items-start justify-between">
                
                {/* Sol Taraf: Add custom line dropdown */}
                <div className="relative dropdown-container">
                  <button 
                    onClick={() => setShowAddLineMenu(!showAddLineMenu)}
                    className="text-sm text-gray-700 hover:text-gray-900 font-medium flex items-center gap-1"
                  >
                    <ChevronDown className="w-4 h-4" />
                    Add custom line
                  </button>
                  
                  {/* Add Line Dropdown Menu */}
                  {showAddLineMenu && (
                    <div className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                      <button 
                        onClick={() => addCustomLine('custom')}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Add custom line
                      </button>
                      <button 
                        onClick={() => addCustomLine('charge')}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <CreditCard className="w-4 h-4" />
                        Charge
                      </button>
                      <button 
                        onClick={() => addCustomLine('section')}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <Package className="w-4 h-4" />
                        Section
                      </button>
                    </div>
                  )}
                </div>

                {/* Sağ Taraf: Pricing Bilgileri */}
                <div className="w-80 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">Subtotal</span>
                    <span className="font-medium text-gray-900">€{subtotal.toFixed(2)}</span>
                  </div>
                  
                  <button className="text-sm text-blue-600 hover:text-blue-700 font-medium block">
                    Add a discount
                  </button>
                  
                  <button className="text-sm text-blue-600 hover:text-blue-700 font-medium block">
                    Add a coupon
                  </button>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">Total discount</span>
                    <span className="font-medium text-gray-900">€0.00</span>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-3 flex justify-between">
                    <span className="text-sm font-semibold text-gray-900">Total incl. taxes</span>
                    <span className="text-sm font-semibold text-gray-900">€{(subtotal * 1.2).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Right Sidebar - En Üstten Başlıyor */}
        <div className="w-64 border-l border-gray-200 bg-white">
          <div className="p-4 space-y-4">
            
            {/* Action Buttons - Tek Kart İçinde */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 space-y-2">
              <button className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                Send email
              </button>
              <button className="w-full px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700">
                New contract
              </button>
              <button className="w-full px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700">
                New quote
              </button>
            </div>

            {/* Email History Link */}
            <button className="w-full text-sm text-blue-600 hover:text-blue-700 font-medium text-left">
              View email history (0)
            </button>

            {/* Documents Accordion */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <button
                onClick={() => setDocumentsOpen(!documentsOpen)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <span className="text-sm font-semibold text-gray-900">Documents <span className="text-gray-500">1</span></span>
                {documentsOpen ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
              </button>
              {documentsOpen && (
                <div className="px-4 pb-3 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-700 py-2 hover:bg-gray-50 rounded px-2 cursor-pointer">
                    <FileText className="w-4 h-4 text-gray-400" />
                    <span>Packing slip</span>
                  </div>
                  <div className="flex items-center justify-between text-sm py-2 hover:bg-gray-50 rounded px-2 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-yellow-100 rounded flex items-center justify-center">
                        <FileText className="w-3 h-3 text-yellow-600" />
                      </div>
                      <span className="text-gray-700">Contract #1</span>
                    </div>
                    <span className="text-gray-600">₺0,00</span>
                  </div>
                </div>
              )}
            </div>

            {/* Invoices Accordion */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <button
                onClick={() => setInvoicesOpen(!invoicesOpen)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <span className="text-sm font-semibold text-gray-900">Invoices</span>
                {invoicesOpen ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
              </button>
              {invoicesOpen && (
                <div className="px-4 pb-3">
                  <p className="text-xs text-gray-500">No invoices found.</p>
                </div>
              )}
            </div>

            {/* Payments Accordion */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <button
                onClick={() => setPaymentsOpen(!paymentsOpen)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <span className="text-sm font-semibold text-gray-900">Payments</span>
                {paymentsOpen ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
              </button>
              {paymentsOpen && (
                <div className="px-4 pb-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Paid</span>
                    <span className="font-medium text-gray-900">₺0,00</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Due</span>
                    <span className="font-medium text-gray-900">₺0,00</span>
                  </div>
                </div>
              )}
            </div>

            {/* Tags Accordion */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <button
                onClick={() => setTagsOpen(!tagsOpen)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <span className="text-sm font-semibold text-gray-900">Tags</span>
                {tagsOpen ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
              </button>
              {tagsOpen && (
                <div className="px-4 pb-3">
                  <button className="w-full px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm text-gray-700 flex items-center justify-center gap-2">
                    <Plus className="w-4 h-4" />
                    Add tags
                  </button>
                </div>
              )}
            </div>

            {/* Notes Accordion */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <button
                onClick={() => setNotesOpen(!notesOpen)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <span className="text-sm font-semibold text-gray-900">Notes</span>
                {notesOpen ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
              </button>
              {notesOpen && (
                <div className="px-4 pb-3">
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add a new note"
                    rows={3}
                    className="w-full text-sm border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewOrder;
