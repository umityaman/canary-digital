import api from './api';
import type {
  Inspection,
  InspectionFilters,
  CreateInspectionDto,
  UpdateInspectionDto,
  InspectionPhoto,
  DamageReport,
  DamageReportDto
} from '../types/inspection';

class InspectionService {
  // Kontrol listesi
  async getInspections(filters?: InspectionFilters): Promise<Inspection[]> {
    const params = new URLSearchParams();
    
    if (filters?.search) params.append('search', filters.search);
    if (filters?.inspectionType && filters.inspectionType !== 'ALL') {
      params.append('inspectionType', filters.inspectionType);
    }
    if (filters?.status && filters.status !== 'ALL') {
      params.append('status', filters.status);
    }
    if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters?.dateTo) params.append('dateTo', filters.dateTo);
    if (filters?.equipmentId) params.append('equipmentId', filters.equipmentId.toString());
    if (filters?.customerId) params.append('customerId', filters.customerId.toString());

    const response = await api.get<Inspection[]>(`/inspections?${params.toString()}`);
    return response.data;
  }

  // Tekil kontrol
  async getInspection(id: number): Promise<Inspection> {
    const response = await api.get<Inspection>(`/inspections/${id}`);
    return response.data;
  }

  // Sipariş bazlı kontroller
  async getInspectionsByOrder(orderId: number): Promise<Inspection[]> {
    const response = await api.get<Inspection[]>(`/inspections/order/${orderId}`);
    return response.data;
  }

  // Yeni kontrol oluştur
  async createInspection(data: CreateInspectionDto): Promise<Inspection> {
    const response = await api.post<Inspection>('/inspections', data);
    return response.data;
  }

  // Kontrol güncelle
  async updateInspection(id: number, data: UpdateInspectionDto): Promise<Inspection> {
    const response = await api.put<Inspection>(`/inspections/${id}`, data);
    return response.data;
  }

  // Kontrol sil
  async deleteInspection(id: number): Promise<void> {
    await api.delete(`/inspections/${id}`);
  }

  // Fotoğraf yükle
  async uploadPhoto(
    inspectionId: number,
    photoData: {
      photoUrl: string;
      photoType?: string;
      caption?: string;
    }
  ): Promise<InspectionPhoto> {
    const response = await api.post<InspectionPhoto>(
      `/inspections/${inspectionId}/photos`,
      photoData
    );
    return response.data;
  }

  // Fotoğraf sil
  async deletePhoto(inspectionId: number, photoId: number): Promise<void> {
    await api.delete(`/inspections/${inspectionId}/photos/${photoId}`);
  }

  // Hasar raporu ekle
  async addDamageReport(
    inspectionId: number,
    data: DamageReportDto
  ): Promise<DamageReport> {
    const response = await api.post<DamageReport>(
      `/inspections/${inspectionId}/damages`,
      data
    );
    return response.data;
  }

  // Hasar raporu güncelle
  async updateDamageReport(
    inspectionId: number,
    damageId: number,
    data: Partial<DamageReportDto>
  ): Promise<DamageReport> {
    const response = await api.put<DamageReport>(
      `/inspections/${inspectionId}/damages/${damageId}`,
      data
    );
    return response.data;
  }

  // Hasar raporu sil
  async deleteDamageReport(inspectionId: number, damageId: number): Promise<void> {
    await api.delete(`/inspections/${inspectionId}/damages/${damageId}`);
  }

  // İmza kaydet
  async saveSignature(
    inspectionId: number,
    signatureData: string,
    type: 'customer' | 'inspector'
  ): Promise<Inspection> {
    const field = type === 'customer' ? 'customerSignature' : 'inspectorSignature';
    const response = await api.put<Inspection>(`/inspections/${inspectionId}`, {
      [field]: signatureData
    });
    return response.data;
  }

  // PDF oluştur (gelecekte implement edilecek)
  async generatePDF(inspectionId: number): Promise<Blob> {
    const response = await api.get(`/inspections/${inspectionId}/pdf`, {
      responseType: 'blob'
    });
    return response.data;
  }
}

export default new InspectionService();
