import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Plus, X, Calendar, QrCode, UserPlus, ChevronDown, ChevronUp,
  User, MapPin, FileText, Mail, Phone, Tag, StickyNote, CreditCard, Package, MoreHorizontal
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
  
  // Accordion states
  const [documentsOpen, setDocumentsOpen] = useState(true);
  const [invoicesOpen, setInvoicesOpen] = useState(true);
  const [paymentsOpen, setPaymentsOpen] = useState(true);
  const [tagsOpen, setTagsOpen] = useState(true);
  const [notesOpen, setNotesOpen] = useState(true);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Booqable Style */}
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
            <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <MoreHorizontal className="w-5 h-5 text-gray-600" />
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
              Send email
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="flex gap-6">
          {/* Left Panel - Main Content */}
          <div className="flex-1 space-y-6">
            
            {/* 1. Customer Section */}
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
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  title="Add customer"
                >
                  <UserPlus className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>

            {/* 2. Pickup Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-base font-semibold text-gray-900 mb-4">Pickup</h3>
              
              {/* Add billing address link */}
              <button className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium mb-4">
                <FileText className="w-4 h-4" />
                Add billing address
              </button>

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

            {/* 3. Products Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex gap-2 mb-4">
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

              {/* Empty State */}
              <div className="text-center py-16 border border-gray-200 rounded-lg bg-gray-50">
                <p className="text-sm text-gray-900 font-medium mb-1">This order is empty.</p>
                <p className="text-sm text-gray-600">Get started by adding some products or a custom line.</p>
              </div>

              {/* Add custom line button */}
              <button className="mt-4 text-sm text-gray-700 hover:text-gray-900 font-medium flex items-center gap-1">
                <Plus className="w-4 h-4" />
                Add custom line
              </button>
            </div>

            {/* 4. Pricing Summary */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">Subtotal</span>
                  <span className="font-medium text-gray-900">₺0,00</span>
                </div>
                
                <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                  Add a discount
                </button>
                
                <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                  Add a coupon
                </button>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">Total discount</span>
                  <span className="font-medium text-gray-900">₺0,00</span>
                </div>
                
                <div className="border-t border-gray-200 pt-3 flex justify-between">
                  <span className="text-sm font-semibold text-gray-900">Total incl. taxes</span>
                  <span className="text-sm font-semibold text-gray-900">₺0,00</span>
                </div>
                
                <div className="pt-3 border-t border-gray-200">
                  <button className="text-sm text-blue-600 hover:text-blue-700 font-medium mb-1">
                    Security deposit
                  </button>
                  <p className="text-xs text-gray-600 mb-2">100% of product security deposit value</p>
                  <p className="text-sm font-medium text-gray-900">₺0,00</p>
                </div>
              </div>
            </div>

            {/* 5. Information Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-gray-900">Information</h3>
                <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                  Add field
                </button>
              </div>
              
              <div className="text-center py-8 border border-dashed border-gray-300 rounded-lg">
                <p className="text-sm font-medium text-gray-900 mb-2">You haven't set up any custom fields yet.</p>
                <p className="text-xs text-gray-600 mb-3">
                  Custom fields display extra details like delivery info or notes. Set them to auto-populate on orders or add one-off fields using the button above. You can also configure them to collect data from your online store.
                </p>
                <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                  Set up custom fields
                </button>
              </div>
            </div>
          </div>

          {/* Right Sidebar - Booqable Style */}
          <div className="w-80 space-y-4">
            
            {/* Action Buttons */}
            <div className="space-y-2">
              <button className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                Send email
              </button>
              <button className="w-full px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700">
                New contract
              </button>
              <button className="w-full px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700">
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
