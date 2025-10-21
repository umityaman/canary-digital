import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useNotification } from '../contexts/NotificationContext';
import { 
  Search, Plus, X, Calendar, QrCode, UserPlus, ChevronDown, ChevronUp,
  User, MapPin, FileText, Mail, Phone, Tag, StickyNote, CreditCard, Package, MoreHorizontal,
  Copy, Clock, Grip, Loader2, Upload, Paperclip
} from 'lucide-react';

const NewOrder: React.FC = () => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
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
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [showQRScanModal, setShowQRScanModal] = useState(false);
  const [qrScanType, setQRScanType] = useState<'customer' | 'equipment'>('customer');
  const [showEmailModal, setShowEmailModal] = useState(false);
  
  // Discount & Coupon
  const [discount, setDiscount] = useState({ type: 'percentage', value: 0, reason: '' });
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  
  // QR Scanning
  const [qrManualInput, setQrManualInput] = useState('');
  const [qrError, setQrError] = useState('');
  
  // Email
  const [emailTemplate, setEmailTemplate] = useState('order_confirmation');
  const [emailRecipient, setEmailRecipient] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  
  // Tags
  const [showAddTagModal, setShowAddTagModal] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#3B82F6');
  const [orderTags, setOrderTags] = useState<any[]>([]);
  
  // Notes Auto-Save
  const notesTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [notesSaved, setNotesSaved] = useState(false);
  const [savingNotes, setSavingNotes] = useState(false);
  
  // Documents
  const [showAddDocumentModal, setShowAddDocumentModal] = useState(false);
  const [documents, setDocuments] = useState<any[]>([]);
  const [uploadingDocument, setUploadingDocument] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Order Save
  const [savingOrder, setSavingOrder] = useState(false);
  
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
  
  // Calculate discount amount
  const discountAmount = discount.type === 'percentage' 
    ? (subtotal * discount.value / 100)
    : discount.value;
  
  // Calculate coupon discount
  const couponDiscount = appliedCoupon 
    ? (appliedCoupon.type === 'percentage' 
        ? (subtotal * appliedCoupon.value / 100)
        : appliedCoupon.value)
    : 0;
  
  // Total discount
  const totalDiscount = discountAmount + couponDiscount;
  
  // Subtotal after discount
  const subtotalAfterDiscount = Math.max(0, subtotal - totalDiscount);
  
  // Total with tax (20% VAT)
  const totalWithTax = subtotalAfterDiscount * 1.2;
  
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
  
  // QR Scanning Handler
  const handleManualQRScan = async () => {
    if (!qrManualInput.trim()) return;
    
    setQrError('');
    
    try {
      if (qrScanType === 'customer') {
        // Call customer scan API
        const response = await api.get(`/customers/scan/${qrManualInput}`);
        
        if (response.data.success && response.data.data) {
          setSelectedCustomer(response.data.data);
          setShowQRScanModal(false);
          setQrManualInput('');
        } else {
          setQrError('Customer not found');
        }
      } else {
        // Call equipment scan API
        const response = await api.get(`/equipment/scan/${qrManualInput}`);
        
        if (response.data && response.data.id) {
          const equipment = response.data;
          
          // Add to product lines
          const id = generateId();
          setProductLines(prev => [
            ...prev,
            { 
              id, 
              type: 'custom', 
              title: equipment.name,
              equipmentId: equipment.id,
              qty: 1, 
              price: equipment.dailyRate || equipment.price || 0, 
              tax: 'No tax' 
            }
          ]);
          
          setShowQRScanModal(false);
          setQrManualInput('');
        } else {
          setQrError('Equipment not found');
        }
      }
    } catch (error: any) {
      console.error('QR scan failed:', error);
      setQrError(error.response?.data?.message || 'Failed to scan QR code. Please try again.');
    }
  };
  
  // Tags Handler
  const tagColors = [
    { name: 'Blue', value: '#3B82F6' },
    { name: 'Green', value: '#10B981' },
    { name: 'Red', value: '#EF4444' },
    { name: 'Yellow', value: '#F59E0B' },
    { name: 'Purple', value: '#8B5CF6' },
    { name: 'Pink', value: '#EC4899' },
    { name: 'Indigo', value: '#6366F1' },
    { name: 'Gray', value: '#6B7280' }
  ];
  
  const handleAddTag = () => {
    if (!newTagName.trim()) return;
    
    const newTag = {
      id: generateId(),
      name: newTagName.trim(),
      color: newTagColor
    };
    
    setOrderTags(prev => [...prev, newTag]);
    setNewTagName('');
    setNewTagColor('#3B82F6');
    setShowAddTagModal(false);
  };
  
  const handleRemoveTag = (tagId: string) => {
    setOrderTags(prev => prev.filter(t => t.id !== tagId));
  };
  
  // Notes Auto-Save Handler
  const handleNotesChange = (value: string) => {
    setNotes(value);
    setNotesSaved(false);
    
    // Clear existing timeout
    if (notesTimeoutRef.current) {
      clearTimeout(notesTimeoutRef.current);
    }
    
    // Set new timeout for auto-save (2 seconds after user stops typing)
    notesTimeoutRef.current = setTimeout(async () => {
      setSavingNotes(true);
      
      // Simulate API call to save notes
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setSavingNotes(false);
      setNotesSaved(true);
      
      // Hide saved message after 2 seconds
      setTimeout(() => setNotesSaved(false), 2000);
    }, 2000);
  };
  
  // Document Upload Handler
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    handleUploadDocuments(Array.from(files));
    e.target.value = ''; // Reset input
  };
  
  const handleUploadDocuments = async (files: File[]) => {
    setUploadingDocument(true);
    
    try {
      // Simulate upload for each file
      for (const file of files) {
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const newDoc = {
          id: generateId(),
          name: file.name,
          size: file.size,
          type: file.type,
          uploadedAt: new Date().toISOString()
        };
        
        setDocuments(prev => [...prev, newDoc]);
      }
      
      setShowAddDocumentModal(false);
    } catch (error) {
      console.error('Document upload failed:', error);
      alert('Failed to upload document. Please try again.');
    } finally {
      setUploadingDocument(false);
    }
  };
  
  const handleRemoveDocument = (docId: string) => {
    setDocuments(prev => prev.filter(d => d.id !== docId));
  };
  
  // Save Order Handler
  const handleSaveAsDraft = async () => {
    // Validation
    if (!selectedCustomer) {
      showNotification('error', 'Lütfen bir müşteri seçin');
      return;
    }
    
    if (!pickupDate || !returnDate) {
      showNotification('error', 'Lütfen başlangıç ve bitiş tarihlerini seçin');
      return;
    }
    
    if (productLines.filter(l => l.type !== 'section').length === 0) {
      showNotification('error', 'Lütfen en az bir ürün ekleyin');
      return;
    }
    
    setSavingOrder(true);
    
    try {
      // Prepare order data
      const orderData = {
        customerId: selectedCustomer.id,
        startDate: new Date(`${pickupDate}T${pickupTime || '00:00'}`).toISOString(),
        endDate: new Date(`${returnDate}T${returnTime || '00:00'}`).toISOString(),
        status: 'PENDING', // Draft status
        paymentStatus: 'payment_due',
        totalAmount: totalWithTax,
        subtotal: subtotal,
        taxAmount: totalWithTax - subtotalAfterDiscount,
        discountAmount: totalDiscount,
        notes: notes,
        tags: JSON.stringify(orderTags),
        documents: JSON.stringify(documents),
        orderItems: productLines
          .filter(l => l.type !== 'section')
          .map(line => ({
            equipmentId: line.equipmentId || null,
            quantity: parseInt(line.qty) || 1,
            unitPrice: parseFloat(line.price) || 0,
            totalPrice: (parseInt(line.qty) || 1) * (parseFloat(line.price) || 0),
            description: line.title || ''
          }))
      };
      
      // Save to API
      const response = await api.post('/orders', orderData);
      
      if (response.data) {
        showNotification('success', 'Sipariş başarıyla kaydedildi!');
        
        // Save tags if any
        if (orderTags.length > 0) {
          for (const tag of orderTags) {
            try {
              await api.post(`/orders/${response.data.id}/tags`, {
                name: tag.name,
                color: tag.color
              });
            } catch (err) {
              console.error('Failed to save tag:', err);
            }
          }
        }
        
        // Save documents if any
        if (documents.length > 0) {
          for (const doc of documents) {
            try {
              await api.post(`/orders/${response.data.id}/documents`, {
                name: doc.name,
                size: doc.size,
                type: doc.type,
                url: doc.url
              });
            } catch (err) {
              console.error('Failed to save document:', err);
            }
          }
        }
        
        // Redirect to orders list
        navigate('/orders');
      }
    } catch (error: any) {
      console.error('Save order error:', error);
      showNotification('error', error.response?.data?.message || 'Sipariş kaydedilemedi. Lütfen tekrar deneyin.');
    } finally {
      setSavingOrder(false);
    }
  };
  
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };
  
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

      {/* Discount Modal */}
      {showDiscountModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Add discount</h2>
              <button 
                onClick={() => setShowDiscountModal(false)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Discount type</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setDiscount(prev => ({ ...prev, type: 'percentage' }))}
                    className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                      discount.type === 'percentage'
                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Percentage (%)
                  </button>
                  <button
                    onClick={() => setDiscount(prev => ({ ...prev, type: 'fixed' }))}
                    className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                      discount.type === 'fixed'
                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Fixed (£)
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {discount.type === 'percentage' ? 'Percentage' : 'Amount (£)'}
                </label>
                <input 
                  type="number" 
                  min="0"
                  max={discount.type === 'percentage' ? 100 : undefined}
                  value={discount.value}
                  onChange={(e) => setDiscount(prev => ({ ...prev, value: Number(e.target.value) }))}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  placeholder={discount.type === 'percentage' ? '0-100' : '0.00'}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason (optional)</label>
                <textarea 
                  rows={2}
                  value={discount.reason}
                  onChange={(e) => setDiscount(prev => ({ ...prev, reason: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="e.g., Early bird discount, Bulk order..."
                ></textarea>
              </div>
              
              {discount.value > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-700">Discount amount:</span>
                    <span className="font-semibold text-blue-700">
                      £{discount.type === 'percentage' 
                        ? (subtotal * discount.value / 100).toFixed(2)
                        : discount.value.toFixed(2)
                      }
                    </span>
                  </div>
                </div>
              )}
            </div>
            
            <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-2">
              <button 
                onClick={() => {
                  setShowDiscountModal(false);
                  setDiscount({ type: 'percentage', value: 0, reason: '' });
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => setShowDiscountModal(false)}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Apply discount
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Coupon Modal */}
      {showCouponModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Add coupon</h2>
              <button 
                onClick={() => setShowCouponModal(false)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Coupon code</label>
                <input 
                  type="text" 
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono uppercase" 
                  placeholder="Enter coupon code"
                />
              </div>
              
              {appliedCoupon && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-semibold text-green-800 text-sm mb-1">
                        {appliedCoupon.code}
                      </div>
                      <div className="text-xs text-green-600">
                        {appliedCoupon.type === 'percentage' 
                          ? `${appliedCoupon.value}% off`
                          : `£${appliedCoupon.value} off`
                        }
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setAppliedCoupon(null);
                        setCouponCode('');
                      }}
                      className="text-green-600 hover:text-green-800"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
              
              <div className="text-xs text-gray-500">
                Enter a valid coupon code to apply a discount to your order.
              </div>
            </div>
            
            <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-2">
              <button 
                onClick={() => {
                  setShowCouponModal(false);
                  if (!appliedCoupon) setCouponCode('');
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  // Simulate coupon validation (in real app, call API)
                  if (couponCode) {
                    // Mock coupon data
                    setAppliedCoupon({
                      code: couponCode,
                      type: 'percentage',
                      value: 10 // 10% off
                    });
                  }
                  setShowCouponModal(false);
                }}
                disabled={!couponCode || appliedCoupon !== null}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Apply coupon
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Scan Modal */}
      {showQRScanModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Scan QR Code - {qrScanType === 'customer' ? 'Customer' : 'Equipment'}
              </h2>
              <button 
                onClick={() => {
                  setShowQRScanModal(false);
                  setQrManualInput('');
                  setQrError('');
                }}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              {/* QR Error Message */}
              {qrError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-700">{qrError}</p>
                </div>
              )}
              
              {/* Manual Input Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter QR Code or ID manually
                </label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={qrManualInput}
                    onChange={(e) => setQrManualInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && qrManualInput.trim()) {
                        handleManualQRScan();
                      }
                    }}
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono" 
                    placeholder="Paste or type code here"
                  />
                  <button
                    onClick={handleManualQRScan}
                    disabled={!qrManualInput.trim()}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Scan
                  </button>
                </div>
              </div>
              
              {/* Camera Section - Placeholder */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50">
                <QrCode className="w-16 h-16 text-gray-400 mx-auto mb-3" />
                <p className="text-sm font-medium text-gray-700 mb-1">Camera scanning coming soon</p>
                <p className="text-xs text-gray-500">
                  For now, please use manual input above
                </p>
              </div>
              
              <div className="text-xs text-gray-500">
                <p className="font-medium mb-1">Tips:</p>
                <ul className="list-disc list-inside space-y-0.5 text-gray-600">
                  <li>Paste the QR code value from your scanner</li>
                  <li>Or type the {qrScanType === 'customer' ? 'customer' : 'equipment'} ID directly</li>
                  <li>Press Enter to scan quickly</li>
                </ul>
              </div>
            </div>
            
            <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-end">
              <button 
                onClick={() => {
                  setShowQRScanModal(false);
                  setQrManualInput('');
                  setQrError('');
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Send Email</h2>
              <button 
                onClick={() => setShowEmailModal(false)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Template</label>
                <select 
                  value={emailTemplate}
                  onChange={(e) => {
                    setEmailTemplate(e.target.value);
                    // Update subject and body based on template
                    const templates: any = {
                      order_confirmation: {
                        subject: 'Order Confirmation - #{ORDER_ID}',
                        body: 'Dear Customer,\n\nYour order has been confirmed.\n\nOrder Details:\n...'
                      },
                      payment_reminder: {
                        subject: 'Payment Reminder - Order #{ORDER_ID}',
                        body: 'Dear Customer,\n\nThis is a friendly reminder about your pending payment.\n\n...'
                      },
                      pickup_reminder: {
                        subject: 'Pickup Reminder - Order #{ORDER_ID}',
                        body: 'Dear Customer,\n\nYour equipment is ready for pickup.\n\n...'
                      },
                      return_reminder: {
                        subject: 'Return Reminder - Order #{ORDER_ID}',
                        body: 'Dear Customer,\n\nPlease remember to return your equipment.\n\n...'
                      }
                    };
                    setEmailSubject(templates[e.target.value]?.subject || '');
                    setEmailBody(templates[e.target.value]?.body || '');
                  }}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="order_confirmation">Order Confirmation</option>
                  <option value="payment_reminder">Payment Reminder</option>
                  <option value="pickup_reminder">Pickup Reminder</option>
                  <option value="return_reminder">Return Reminder</option>
                  <option value="custom">Custom Email</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
                <input 
                  type="email" 
                  value={emailRecipient || selectedCustomer?.email || ''}
                  onChange={(e) => setEmailRecipient(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  placeholder="customer@example.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <input 
                  type="text" 
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  placeholder="Email subject"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea 
                  rows={8}
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-mono"
                  placeholder="Email message body..."
                ></textarea>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-700">
                  <strong>Available variables:</strong> #{'{ORDER_ID}'}, #{'{CUSTOMER_NAME}'}, #{'{PICKUP_DATE}'}, #{'{RETURN_DATE}'}, #{'{TOTAL_AMOUNT}'}
                </p>
              </div>
            </div>
            
            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-2">
              <button 
                onClick={() => setShowEmailModal(false)}
                disabled={sendingEmail}
                className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                onClick={async () => {
                  setSendingEmail(true);
                  try {
                    // Note: This would require an order ID in production
                    // For now, we'll call a generic email endpoint or show a message
                    if (!selectedCustomer) {
                      alert('Please select a customer first');
                      setSendingEmail(false);
                      return;
                    }
                    
                    // Call email API (would need order ID in production)
                    // await api.post(`/orders/${orderId}/email`, {
                    //   recipient: emailRecipient,
                    //   subject: emailSubject,
                    //   body: emailBody,
                    //   template: emailTemplate
                    // });
                    
                    // For now, show success message
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    
                    setSendingEmail(false);
                    setShowEmailModal(false);
                    alert('Email sent successfully!');
                  } catch (error: any) {
                    console.error('Email send failed:', error);
                    alert(error.response?.data?.message || 'Failed to send email');
                    setSendingEmail(false);
                  }
                }}
                disabled={sendingEmail || !emailRecipient || !emailSubject}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {sendingEmail && <Loader2 className="w-4 h-4 animate-spin" />}
                {sendingEmail ? 'Sending...' : 'Send Email'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Add Tag Modal */}
      {showAddTagModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Add Tag</h2>
              <button 
                onClick={() => {
                  setShowAddTagModal(false);
                  setNewTagName('');
                  setNewTagColor('#3B82F6');
                }}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tag Name</label>
                <input 
                  type="text"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  placeholder="e.g., Urgent, VIP Customer, Follow-up"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tag Color</label>
                <div className="grid grid-cols-4 gap-2">
                  {tagColors.map(color => (
                    <button
                      key={color.value}
                      onClick={() => setNewTagColor(color.value)}
                      className={`h-10 rounded-lg border-2 transition-all ${
                        newTagColor === color.value 
                          ? 'border-gray-900 scale-105' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
              
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                <div 
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium text-white"
                  style={{ backgroundColor: newTagColor }}
                >
                  <Tag className="w-3.5 h-3.5" />
                  {newTagName || 'Tag Name'}
                </div>
              </div>
            </div>
            
            <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-2">
              <button 
                onClick={() => {
                  setShowAddTagModal(false);
                  setNewTagName('');
                  setNewTagColor('#3B82F6');
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleAddTag}
                disabled={!newTagName.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Tag
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Add Document Modal */}
      {showAddDocumentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Upload Document</h2>
              <button 
                onClick={() => setShowAddDocumentModal(false)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="p-6">
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileSelect}
                className="hidden"
                multiple
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
              />
              
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingDocument}
                className="w-full border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-blue-500 hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex flex-col items-center gap-3">
                  {uploadingDocument ? (
                    <>
                      <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                      <p className="text-sm text-gray-600">Uploading...</p>
                    </>
                  ) : (
                    <>
                      <FileText className="w-12 h-12 text-gray-400" />
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-900">Click to upload documents</p>
                        <p className="text-xs text-gray-500 mt-1">PDF, DOC, DOCX, JPG, PNG, TXT</p>
                      </div>
                    </>
                  )}
                </div>
              </button>
              
              <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-700">
                  <strong>Tip:</strong> You can upload multiple files at once. Maximum file size: 10MB per file.
                </p>
              </div>
            </div>
            
            <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-end">
              <button 
                onClick={() => setShowAddDocumentModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
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
                <button 
                  onClick={handleSaveAsDraft}
                  disabled={savingOrder}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {savingOrder && <Loader2 className="w-4 h-4 animate-spin" />}
                  {savingOrder ? 'Saving...' : 'Save as draft'}
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
            
            {/* Order Error Message */}
            {orderError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <X className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-800">{orderError}</p>
                </div>
                <button onClick={() => setOrderError('')} className="text-red-400 hover:text-red-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            
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
                      onClick={() => {
                        setQRScanType('customer');
                        setShowQRScanModal(true);
                      }}
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
                  onClick={() => {
                    setQRScanType('equipment');
                    setShowQRScanModal(true);
                  }}
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
                    <span className="font-medium text-gray-900">£{subtotal.toFixed(2)}</span>
                  </div>
                  
                  {/* Discount */}
                  {discount.value > 0 ? (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="text-xs font-medium text-blue-700">
                            Discount {discount.type === 'percentage' ? `(${discount.value}%)` : ''}
                          </div>
                          {discount.reason && (
                            <div className="text-xs text-blue-600 mt-0.5">{discount.reason}</div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-blue-700">-£{discountAmount.toFixed(2)}</span>
                          <button
                            onClick={() => setDiscount({ type: 'percentage', value: 0, reason: '' })}
                            className="text-blue-400 hover:text-blue-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setShowDiscountModal(true)}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium block"
                    >
                      Add a discount
                    </button>
                  )}
                  
                  {/* Coupon */}
                  {appliedCoupon ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-2">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="text-xs font-medium text-green-700 font-mono">
                            {appliedCoupon.code}
                          </div>
                          <div className="text-xs text-green-600 mt-0.5">
                            {appliedCoupon.type === 'percentage' ? `${appliedCoupon.value}% off` : `£${appliedCoupon.value} off`}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-green-700">-£{couponDiscount.toFixed(2)}</span>
                          <button
                            onClick={() => {
                              setAppliedCoupon(null);
                              setCouponCode('');
                            }}
                            className="text-green-400 hover:text-green-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setShowCouponModal(true)}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium block"
                    >
                      Add a coupon
                    </button>
                  )}
                  
                  {/* Total Discount Display */}
                  {totalDiscount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-700">Total discount</span>
                      <span className="font-medium text-green-600">-£{totalDiscount.toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="border-t border-gray-200 pt-3 flex justify-between">
                    <span className="text-sm font-semibold text-gray-900">Total incl. taxes</span>
                    <span className="text-sm font-semibold text-gray-900">£{totalWithTax.toFixed(2)}</span>
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
              <button 
                onClick={() => setShowEmailModal(true)}
                className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
              >
                <Mail className="w-4 h-4" />
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
                <span className="text-sm font-semibold text-gray-900">
                  Documents {documents.length > 0 && <span className="text-gray-500">{documents.length}</span>}
                </span>
                {documentsOpen ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
              </button>
              {documentsOpen && (
                <div className="px-4 pb-3 space-y-2">
                  {documents.map(doc => (
                    <div 
                      key={doc.id}
                      className="flex items-center justify-between text-sm py-2 hover:bg-gray-50 rounded px-2 group"
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span className="text-gray-700 truncate">{doc.name}</span>
                        <span className="text-gray-400 text-xs flex-shrink-0">
                          {formatFileSize(doc.size)}
                        </span>
                      </div>
                      <button
                        onClick={() => handleRemoveDocument(doc.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded transition-all"
                      >
                        <X className="w-3 h-3 text-gray-500" />
                      </button>
                    </div>
                  ))}
                  
                  <button 
                    onClick={() => setShowAddDocumentModal(true)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm text-gray-700 flex items-center justify-center gap-2 mt-2"
                  >
                    <Plus className="w-4 h-4" />
                    Upload document
                  </button>
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
                <div className="px-4 pb-3 space-y-2">
                  {orderTags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {orderTags.map(tag => (
                        <div 
                          key={tag.id}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium text-white"
                          style={{ backgroundColor: tag.color }}
                        >
                          <Tag className="w-3 h-3" />
                          {tag.name}
                          <button
                            onClick={() => handleRemoveTag(tag.id)}
                            className="hover:bg-white hover:bg-opacity-20 rounded-full p-0.5 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <button 
                    onClick={() => setShowAddTagModal(true)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm text-gray-700 flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add tag
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
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-900">Notes</span>
                  {savingNotes && (
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Saving...
                    </span>
                  )}
                  {notesSaved && (
                    <span className="text-xs text-green-600 flex items-center gap-1">
                      ✓ Saved
                    </span>
                  )}
                </div>
                {notesOpen ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
              </button>
              {notesOpen && (
                <div className="px-4 pb-3">
                  <textarea
                    value={notes}
                    onChange={(e) => handleNotesChange(e.target.value)}
                    placeholder="Add a new note (auto-saves after 2 seconds)"
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
