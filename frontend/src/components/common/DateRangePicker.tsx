import React, { useState } from 'react';
import { Calendar } from 'lucide-react';

export type DateRangePreset = 'this_month' | 'last_month' | 'this_year' | 'last_year' | 'custom';

interface DateRange {
  startDate: string;
  endDate: string;
}

interface DateRangePickerProps {
  value?: DateRange;
  onChange: (range: DateRange) => void;
  className?: string;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  onChange,
  className = '',
}) => {
  const [selectedPreset, setSelectedPreset] = useState<DateRangePreset>('this_month');
  const [showCustom, setShowCustom] = useState(false);
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const getPresetRange = (preset: DateRangePreset): DateRange | null => {
    const now = new Date();
    let start: Date;
    let end: Date;

    switch (preset) {
      case 'this_month':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;

      case 'last_month':
        start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        end = new Date(now.getFullYear(), now.getMonth(), 0);
        break;

      case 'this_year':
        start = new Date(now.getFullYear(), 0, 1);
        end = new Date(now.getFullYear(), 11, 31);
        break;

      case 'last_year':
        start = new Date(now.getFullYear() - 1, 0, 1);
        end = new Date(now.getFullYear() - 1, 11, 31);
        break;

      case 'custom':
        return null;

      default:
        return null;
    }

    return {
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
    };
  };

  const handlePresetClick = (preset: DateRangePreset) => {
    setSelectedPreset(preset);

    if (preset === 'custom') {
      setShowCustom(true);
    } else {
      setShowCustom(false);
      const range = getPresetRange(preset);
      if (range) {
        onChange(range);
      }
    }
  };

  const handleCustomApply = () => {
    if (customStart && customEnd) {
      onChange({
        startDate: customStart,
        endDate: customEnd,
      });
      setShowCustom(false);
    }
  };

  const presets: { key: DateRangePreset; label: string }[] = [
    { key: 'this_month', label: 'Bu Ay' },
    { key: 'last_month', label: 'Geçen Ay' },
    { key: 'this_year', label: 'Bu Yıl' },
    { key: 'last_year', label: 'Geçen Yıl' },
    { key: 'custom', label: 'Özel' },
  ];

  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center gap-2 flex-wrap">
        {presets.map((preset) => (
          <button
            key={preset.key}
            onClick={() => handlePresetClick(preset.key)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              selectedPreset === preset.key
                ? 'bg-blue-600 text-white'
                : 'bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50'
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {showCustom && (
        <div className="mt-4 p-4 bg-white border border-neutral-200 rounded-lg shadow-lg">
          <div className="flex items-center gap-2 mb-3">
            <Calendar size={20} className="text-neutral-600" />
            <h3 className="font-semibold text-neutral-900">Özel Tarih Aralığı</h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Başlangıç
              </label>
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Bitiş
              </label>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={() => setShowCustom(false)}
              className="px-4 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50"
            >
              İptal
            </button>
            <button
              onClick={handleCustomApply}
              disabled={!customStart || !customEnd}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Uygula
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
