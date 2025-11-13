const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'frontend', 'src', 'pages', 'Accounting.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Step 1: Add InvoiceList lazy import
const importRegex = /(const ExpenseTab = lazy\(\(\) => import\('\.\.\/components\/accounting\/ExpenseTab'\)\))/;
const newImport = `$1\nconst InvoiceList = lazy(() => import('../components/accounting/InvoiceList'))`;
content = content.replace(importRegex, newImport);

// Step 2: Replace entire invoice tab (lines 1104-1486)
const invoiceTabStart = `            {/* Invoice Tab */}`;

const invoiceTabEnd = `            {/* Offer Tab */}`;

// Find start and end positions
const startIdx = content.indexOf(invoiceTabStart);
if (startIdx === -1) {
  console.error('Could not find invoice tab start marker');
  process.exit(1);
}

const endIdx = content.indexOf(invoiceTabEnd, startIdx);
if (endIdx === -1) {
  console.error('Could not find invoice tab end marker');
  process.exit(1);
}

// Extract the text before and after
const before = content.substring(0, startIdx);
const after = content.substring(endIdx);

// New invoice tab content
const newInvoiceTab = `            {/* Invoice Tab */}
            {activeTab === 'invoice' && (
              <ErrorBoundary fallbackTitle="Fatura Listesi Hatası" fallbackMessage="Fatura listesi yüklenirken bir sorun oluştu.">
                <Suspense fallback={<div className="p-8 text-center">Yükleniyor...</div>}>
                  <InvoiceList />
                </Suspense>
              </ErrorBoundary>
            )}

`;

// Combine
content = before + newInvoiceTab + after;

// Write back
fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ Invoice tab replaced successfully!');
console.log(`Removed ${endIdx - startIdx} characters`);
console.log(`Added ${newInvoiceTab.length} characters`);
