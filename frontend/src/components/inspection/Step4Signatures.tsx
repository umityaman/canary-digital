import { useState, useEffect } from 'react';
import { PenTool, CheckSquare } from 'lucide-react';
import SignatureCanvas from '../SignatureCanvas';
import type { CreateInspectionDto } from '../../types/inspection';

interface Step4Props {
  data: Partial<CreateInspectionDto>;
  onChange: (data: Partial<CreateInspectionDto>) => void;
}

export default function Step4Signatures({ data, onChange }: Step4Props) {
  const [customerAgreed, setCustomerAgreed] = useState(false);
  const [inspectorAgreed, setInspectorAgreed] = useState(false);
  const [customerSignature, setCustomerSignature] = useState((data as any).customerSignature || '');
  const [inspectorSignature, setInspectorSignature] = useState((data as any).inspectorSignature || '');

  // İmzalar değiştiğinde parent component'i güncelle
  useEffect(() => {
    onChange({
      ...data,
      customerSignature,
      inspectorSignature
    });
  }, [customerSignature, inspectorSignature]);

  const handleCustomerSignature = (signature: string) => {
    setCustomerSignature(signature);
    setCustomerAgreed(true); // İmza atılınca otomatik checkbox işaretle
  };

  const handleInspectorSignature = (signature: string) => {
    setInspectorSignature(signature);
    setInspectorAgreed(true); // İmza atılınca otomatik checkbox işaretle
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-neutral-900 mb-2">İmzalar & Onay</h2>
        <p className="text-sm text-neutral-600">
          Kontrol işlemini tamamlamak için gerekli onayları alın
        </p>
      </div>

      {/* Summary Section */}
      <div className="bg-neutral-50 rounded-xl p-6">
        <h3 className="font-semibold text-neutral-900 mb-4">Kontrol Özeti</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-neutral-600">Kontrol Tipi:</span>
            <span className="font-medium text-neutral-900">
              {data.inspectionType === 'CHECKOUT' ? 'Teslim Alış' : 'Teslim Ediş'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-600">Genel Durum:</span>
            <span className="font-medium text-neutral-900">
              {data.overallCondition || 'Belirtilmedi'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-600">Kontrol Listesi:</span>
            <span className="font-medium text-neutral-900">
              {Array.isArray(data.checklistData) ? data.checklistData.length : 0} madde
            </span>
          </div>
        </div>
      </div>

      {/* Customer Signature */}
      <div className="bg-white border border-neutral-200 rounded-xl p-6">
        <div className="flex items-start gap-3 mb-4">
          <PenTool className="text-blue-600 flex-shrink-0" size={20} />
          <div className="flex-1">
            <h3 className="font-semibold text-neutral-900 mb-1">Müşteri İmzası</h3>
            <p className="text-sm text-neutral-600">
              Müşteri, ekipmanın teslim alındığını/verildiğini ve kontrolü onayladığını beyan eder
            </p>
          </div>
        </div>

        {/* Signature Canvas */}
        <div className="mb-4">
          <SignatureCanvas
            label="Müşteri İmzası"
            onSave={handleCustomerSignature}
            width={600}
            height={200}
            initialSignature={customerSignature}
          />
        </div>

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={customerAgreed}
            onChange={(e) => setCustomerAgreed(e.target.checked)}
            className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-neutral-500"
          />
          <span className="text-sm text-neutral-700">
            Yukarıda belirtilen ekipmanı kontrol ettim ve mevcut durumunu onaylıyorum. 
            Hasar durumları doğru bir şekilde kaydedilmiştir.
          </span>
        </label>
      </div>

      {/* Inspector Signature */}
      <div className="bg-white border border-neutral-200 rounded-xl p-6">
        <div className="flex items-start gap-3 mb-4">
          <PenTool className="text-green-600 flex-shrink-0" size={20} />
          <div className="flex-1">
            <h3 className="font-semibold text-neutral-900 mb-1">Kontrol Eden İmzası</h3>
            <p className="text-sm text-neutral-600">
              Kontrolü yapan personel, işlemi onaylar
            </p>
          </div>
        </div>

        {/* Signature Canvas */}
        <div className="mb-4">
          <SignatureCanvas
            label="Kontrol Eden İmzası"
            onSave={handleInspectorSignature}
            width={600}
            height={200}
            initialSignature={inspectorSignature}
          />
        </div>

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={inspectorAgreed}
            onChange={(e) => setInspectorAgreed(e.target.checked)}
            className="mt-1 w-4 h-4 text-green-600 rounded focus:ring-2 focus:ring-green-500"
          />
          <span className="text-sm text-neutral-700">
            Kontrolü titizlikle gerçekleştirdim ve tüm bulguları doğru bir şekilde kaydettim. 
            Bu rapor gerçek durumu yansıtmaktadır.
          </span>
        </label>
      </div>

      {/* Terms & Conditions */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <CheckSquare className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <h3 className="font-semibold text-yellow-900 mb-2">Önemli Notlar</h3>
            <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
              <li>Bu kontrol raporu yasal bir belge niteliğindedir</li>
              <li>İmzalandıktan sonra değişiklik yapılamaz</li>
              <li>Hasar durumları maliyetlendirmeye esas teşkil eder</li>
              <li>Rapor müşteri ile paylaşılacaktır</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Validation Warning */}
      {(!customerAgreed || !inspectorAgreed) && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-sm text-red-800">
            <strong>⚠️ Uyarı:</strong> Kaydetmek için hem müşteri hem de kontrol eden personelin onay kutucuklarını işaretlemesi gerekmektedir.
          </p>
        </div>
      )}

      {/* Success Message */}
      {customerAgreed && inspectorAgreed && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <p className="text-sm text-green-800">
            <strong>✓ Hazır!</strong> Tüm onaylar alındı. "Kaydet ve Tamamla" butonuna tıklayarak işlemi tamamlayabilirsiniz.
          </p>
        </div>
      )}
    </div>
  );
}
