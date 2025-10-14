// Inspection Types

export interface Inspection {
  id: number;
  inspectionType: 'CHECKOUT' | 'CHECKIN';
  
  orderId: number;
  equipmentId: number;
  inspectorId: number;
  customerId: number;
  
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'DAMAGE_FOUND';
  overallCondition?: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
  
  checklistData?: string; // JSON string
  
  customerSignature?: string;
  inspectorSignature?: string;
  
  notes?: string;
  location?: string;
  
  inspectionDate: string;
  createdAt: string;
  updatedAt: string;
  
  // Relations
  order?: {
    id: number;
    orderNumber: string;
    startDate: string;
    endDate: string;
    status: string;
  };
  equipment?: {
    id: number;
    name: string;
    brand?: string;
    model?: string;
    category?: string;
    serialNumber?: string;
  };
  customer?: {
    id: number;
    name: string;
    email?: string;
    phone?: string;
  };
  inspector?: {
    id: number;
    name?: string;
    email: string;
  };
  photos?: InspectionPhoto[];
  damageReports?: DamageReport[];
}

export interface ChecklistItem {
  id: string;
  category: string;
  label: string;
  checked: boolean;
  required: boolean;
  notes?: string;
}

export interface InspectionPhoto {
  id: number;
  inspectionId: number;
  photoUrl: string;
  photoType: 'GENERAL' | 'DAMAGE' | 'SERIAL_NUMBER' | 'FULL_VIEW';
  caption?: string;
  fileSize?: number;
  mimeType?: string;
  createdAt: string;
}

export interface DamageReport {
  id: number;
  inspectionId: number;
  damageType: 'SCRATCH' | 'DENT' | 'BROKEN' | 'MISSING_PART' | 'MALFUNCTION' | 'COSMETIC' | 'FUNCTIONAL';
  severity: 'MINOR' | 'MODERATE' | 'MAJOR' | 'CRITICAL';
  description: string;
  location?: string;
  estimatedCost?: number;
  actualCost?: number;
  responsibleParty: 'CUSTOMER' | 'COMPANY' | 'THIRD_PARTY' | 'UNKNOWN';
  status: 'REPORTED' | 'ASSESSED' | 'REPAIRED' | 'WRITTEN_OFF';
  photoUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChecklistTemplate {
  id: number;
  name: string;
  category?: string;
  items: ChecklistTemplateItem[];
  isActive: boolean;
}

export interface ChecklistTemplateItem {
  id: string;
  label: string;
  required: boolean;
  type: 'boolean' | 'text' | 'number' | 'rating';
  order: number;
}

export interface InspectionFilters {
  search?: string;
  inspectionType?: 'CHECKOUT' | 'CHECKIN' | 'ALL';
  status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'DAMAGE_FOUND' | 'ALL';
  dateFrom?: string;
  dateTo?: string;
  equipmentId?: number;
  customerId?: number;
}

export interface CreateInspectionDto {
  inspectionType: 'CHECKOUT' | 'CHECKIN';
  orderId: number;
  equipmentId: number;
  customerId: number;
  inspectorId?: number;
  checklistData?: ChecklistItem[];
  overallCondition?: string;
  customerSignature?: string;
  inspectorSignature?: string;
  photos?: string[]; // Base64 strings
  damages?: DamageReportDto[];
  notes?: string;
  location?: string;
}

export interface UpdateInspectionDto {
  status?: string;
  overallCondition?: string;
  checklistData?: ChecklistItem[];
  customerSignature?: string;
  inspectorSignature?: string;
  notes?: string;
}

export interface DamageReportDto {
  damageType: string;
  severity: string;
  description: string;
  location?: string;
  estimatedCost?: number;
  responsibleParty: string;
  photoUrl?: string;
}
