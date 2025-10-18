import React from 'react';
import { exportToExcel, exportToPDF, printChart } from './exportUtils';

interface ExportButtonsProps {
  data: any[];
  filename: string;
  chartElementId: string;
}

const ExportButtons: React.FC<ExportButtonsProps> = ({
  data,
  filename,
  chartElementId,
}) => {
  const [exporting, setExporting] = React.useState(false);

  const handleExportExcel = async () => {
    setExporting(true);
    try {
      const result = exportToExcel(data, filename);
      if (result.success) {
        alert(`✅ Excel dosyası indirildi: ${result.filename}`);
      } else {
        alert(`❌ Hata: ${result.error}`);
      }
    } catch (error) {
      alert('❌ Excel dışa aktarma hatası');
    } finally {
      setExporting(false);
    }
  };

  const handleExportPDF = async () => {
    setExporting(true);
    try {
      const result = await exportToPDF(chartElementId, filename);
      if (result.success) {
        alert('✅ PDF dosyası indirildi');
      } else {
        alert(`❌ Hata: ${result.error}`);
      }
    } catch (error) {
      alert('❌ PDF dışa aktarma hatası');
    } finally {
      setExporting(false);
    }
  };

  const handlePrint = () => {
    printChart(chartElementId);
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleExportExcel}
        disabled={exporting}
        className="px-3 py-1.5 text-xs font-medium text-neutral-700 bg-neutral-100 rounded-md hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
        title="Excel olarak indir"
      >
        📊 Excel
      </button>
      <button
        onClick={handleExportPDF}
        disabled={exporting}
        className="px-3 py-1.5 text-xs font-medium text-neutral-700 bg-neutral-100 rounded-md hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
        title="PDF olarak indir"
      >
        📄 PDF
      </button>
      <button
        onClick={handlePrint}
        disabled={exporting}
        className="px-3 py-1.5 text-xs font-medium text-neutral-700 bg-neutral-100 rounded-md hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
        title="Yazdır"
      >
        🖨️ Yazdır
      </button>
      {exporting && (
        <span className="text-xs text-gray-500 animate-pulse">İşleniyor...</span>
      )}
    </div>
  );
};

export default ExportButtons;
