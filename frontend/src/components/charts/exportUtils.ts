import * as XLSX from 'xlsx';
import { format } from 'date-fns';

interface ExportData {
  date: string;
  [key: string]: any;
}

export const exportToExcel = (data: ExportData[], filename: string) => {
  try {
    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(data);

    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data');

    // Generate filename with timestamp
    const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm-ss');
    const fullFilename = `${filename}_${timestamp}.xlsx`;

    // Save file
    XLSX.writeFile(wb, fullFilename);

    return { success: true, filename: fullFilename };
  } catch (error) {
    console.error('Excel export error:', error);
    return { success: false, error: 'Excel dosyası oluşturulamadı' };
  }
};

export const exportToPDF = async (
  elementId: string,
  filename: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Import jsPDF and html2canvas dynamically
    const jsPDF = (await import('jspdf')).default;
    const html2canvas = (await import('html2canvas')).default;

    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error('Element not found');
    }

    // Capture the element as canvas
    const canvas = await html2canvas(element, {
      scale: 2,
      logging: false,
      useCORS: true,
    });

    const imgData = canvas.toDataURL('image/png');
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    const pdf = new jsPDF('p', 'mm', 'a4');
    let heightLeft = imgHeight;
    let position = 0;

    // Add first page
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Add additional pages if needed
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    // Generate filename with timestamp
    const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm-ss');
    const fullFilename = `${filename}_${timestamp}.pdf`;

    pdf.save(fullFilename);

    return { success: true };
  } catch (error) {
    console.error('PDF export error:', error);
    return { success: false, error: 'PDF dosyası oluşturulamadı' };
  }
};

export const printChart = (elementId: string) => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error('Element not found');
    return;
  }

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    console.error('Could not open print window');
    return;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Yazdır</title>
        <style>
          body { 
            margin: 20px; 
            font-family: Arial, sans-serif; 
          }
          @media print {
            body { margin: 0; }
          }
        </style>
      </head>
      <body>
        ${element.innerHTML}
      </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.focus();

  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 250);
};
