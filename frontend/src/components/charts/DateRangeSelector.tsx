import React from 'react';
import { subDays, format } from 'date-fns';

interface DateRange {
  startDate: Date;
  endDate: Date;
  label: string;
}

interface DateRangeSelectorProps {
  selectedRange: DateRange;
  onRangeChange: (range: DateRange) => void;
}

const predefinedRanges: DateRange[] = [
  {
    label: 'Son 7 Gün',
    startDate: subDays(new Date(), 7),
    endDate: new Date(),
  },
  {
    label: 'Son 30 Gün',
    startDate: subDays(new Date(), 30),
    endDate: new Date(),
  },
  {
    label: 'Son 90 Gün',
    startDate: subDays(new Date(), 90),
    endDate: new Date(),
  },
  {
    label: 'Bu Yıl',
    startDate: new Date(new Date().getFullYear(), 0, 1),
    endDate: new Date(),
  },
];

const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({
  selectedRange,
  onRangeChange,
}) => {
  const [showCustom, setShowCustom] = React.useState(false);
  const [customStart, setCustomStart] = React.useState('');
  const [customEnd, setCustomEnd] = React.useState('');

  const handlePresetClick = (range: DateRange) => {
    onRangeChange(range);
    setShowCustom(false);
  };

  const handleCustomApply = () => {
    if (customStart && customEnd) {
      onRangeChange({
        label: 'Özel Tarih',
        startDate: new Date(customStart),
        endDate: new Date(customEnd),
      });
      setShowCustom(false);
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700">📅 Tarih Aralığı</h3>
        <span className="text-xs text-gray-500">
          {format(selectedRange.startDate, 'dd/MM/yyyy')} -{' '}
          {format(selectedRange.endDate, 'dd/MM/yyyy')}
        </span>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        {predefinedRanges.map((range) => (
          <button
            key={range.label}
            onClick={() => handlePresetClick(range)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              selectedRange.label === range.label
                ? 'bg-neutral-900 text-white'
                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
            }`}
          >
            {range.label}
          </button>
        ))}
        <button
          onClick={() => setShowCustom(!showCustom)}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            showCustom || selectedRange.label === 'Özel Tarih'
              ? 'bg-neutral-900 text-white'
              : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
          }`}
        >
          Özel Tarih
        </button>
      </div>

      {showCustom && (
        <div className="flex items-end gap-2 p-3 bg-gray-50 rounded-md">
          <div className="flex-1">
            <label className="block text-xs font-medium text-neutral-700 mb-1">
              Başlangıç
            </label>
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="w-full px-2 py-1.5 text-xs border border-neutral-300 rounded-md focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-medium text-neutral-700 mb-1">
              Bitiş
            </label>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="w-full px-2 py-1.5 text-xs border border-neutral-300 rounded-md focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
            />
          </div>
          <button
            onClick={handleCustomApply}
            disabled={!customStart || !customEnd}
            className="px-4 py-1.5 text-xs font-medium text-white bg-neutral-900 rounded-md hover:bg-neutral-800 disabled:bg-neutral-300 disabled:cursor-not-allowed transition-colors"
          >
            Uygula
          </button>
        </div>
      )}
    </div>
  );
};

export default DateRangeSelector;
