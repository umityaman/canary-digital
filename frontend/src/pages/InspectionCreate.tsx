import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check } from 'lucide-react';
import Step1GeneralInfo from '../components/inspection/Step1GeneralInfo';
import Step2Checklist from '../components/inspection/Step2Checklist';
import Step3PhotosDamage from '../components/inspection/Step3PhotosDamage';
import Step4Signatures from '../components/inspection/Step4Signatures';
import { useInspectionStore } from '../stores/inspectionStore';
import type { CreateInspectionDto } from '../types/inspection';

export default function InspectionCreate() {
  const navigate = useNavigate();
  const { createInspection, loading } = useInspectionStore();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<CreateInspectionDto>>({
    inspectionType: 'CHECKOUT',
    overallCondition: 'GOOD',
    checklistData: [],
  });

  const steps = [
    { number: 1, title: 'Genel Bilgiler', component: Step1GeneralInfo },
    { number: 2, title: 'Kontrol Listesi', component: Step2Checklist },
    { number: 3, title: 'Fotoğraf & Hasar', component: Step3PhotosDamage },
    { number: 4, title: 'İmzalar', component: Step4Signatures },
  ];

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepDataChange = (data: Partial<CreateInspectionDto>) => {
    setFormData({ ...formData, ...data });
  };

  const handleSubmit = async () => {
    try {
      // Validate required fields
      if (!formData.orderId || !formData.equipmentId || !formData.inspectorId) {
        alert('Lütfen gerekli tüm alanları doldurun');
        return;
      }

      const inspection = await createInspection(formData as CreateInspectionDto);
      
      // Success message
      alert('✅ Kontrol kaydı başarıyla oluşturuldu!');
      
      // Navigate to detail page
      navigate(`/inspection/${inspection.id}`);
    } catch (error: any) {
      console.error('Kontrol oluşturma hatası:', error);
      alert('❌ Hata: ' + (error.response?.data?.error || error.message));
    }
  };

  const CurrentStepComponent = steps[currentStep - 1].component;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate('/inspection')}
          className="p-2 hover:bg-neutral-100 rounded-lg transition-colors border border-neutral-200 rounded-xl"
        >
          <ArrowLeft size={20} />
        </button>
        <p className="text-sm text-neutral-600">
          Adım {currentStep} / {steps.length}: {steps[currentStep - 1].title}
        </p>
      </div>

      {/* Progress Steps */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-6">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <React.Fragment key={step.number}>
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                    currentStep > step.number
                      ? 'bg-green-500 text-white'
                      : currentStep === step.number
                      ? 'bg-neutral-900 text-white'
                      : 'bg-neutral-200 text-neutral-600'
                  }`}
                >
                  {currentStep > step.number ? (
                    <Check size={20} />
                  ) : (
                    step.number
                  )}
                </div>
                <div className="hidden md:block">
                  <p
                    className={`text-sm font-medium ${
                      currentStep >= step.number
                        ? 'text-neutral-900'
                        : 'text-neutral-500'
                    }`}
                  >
                    {step.title}
                  </p>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-4 transition-colors ${
                    currentStep > step.number
                      ? 'bg-green-500'
                      : 'bg-neutral-200'
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-6">
        <CurrentStepComponent
          data={formData}
          onChange={handleStepDataChange}
        />
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between bg-white rounded-2xl border border-neutral-200 p-6">
        <button
          onClick={handlePrev}
          disabled={currentStep === 1}
          className="px-6 py-2 border border-neutral-300 text-neutral-700 rounded-xl hover:bg-neutral-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Geri
        </button>

        <div className="text-sm text-neutral-600">
          Adım {currentStep} / {steps.length}
        </div>

        {currentStep < steps.length ? (
          <button
            onClick={handleNext}
            className="px-6 py-2 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors"
          >
            İleri
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Kaydediliyor...
              </>
            ) : (
              <>
                <Check size={20} />
                Kaydet ve Tamamla
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
