const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'frontend', 'src', 'pages', 'Accounting.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Step 1: Add OfferList lazy import (already done manually)

// Step 2: Replace entire offer tab
const offerTabStart = `            {/* Offer Tab */}`;

// Find start position
const startIdx = content.indexOf(offerTabStart);
if (startIdx === -1) {
  console.error('Could not find offer tab start marker');
  process.exit(1);
}

// Find next tab start (which would be after offer tab ends)
// Look for any other tab comment after offer tab
const afterOfferStart = content.substring(startIdx + offerTabStart.length);
const nextTabRegex = /\n\n +{\/\* .+ Tab \*\/}/;
const nextTabMatch = afterOfferStart.match(nextTabRegex);

if (!nextTabMatch) {
  console.error('Could not find next tab marker');
  process.exit(1);
}

const endIdx = startIdx + offerTabStart.length + nextTabMatch.index;

// Extract the text before and after
const before = content.substring(0, startIdx);
const after = content.substring(endIdx);

// New offer tab content
const newOfferTab = `            {/* Offer Tab */}
            {activeTab === 'offer' && (
              <ErrorBoundary fallbackTitle="Teklif Listesi Hatası" fallbackMessage="Teklif listesi yüklenirken bir sorun oluştu.">
                <Suspense fallback={<div className="p-8 text-center">Yükleniyor...</div>}>
                  <OfferList />
                </Suspense>
              </ErrorBoundary>
            )}`;

// Combine
content = before + newOfferTab + after;

// Write back
fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ Offer tab replaced successfully!');
console.log(`Removed ${endIdx - startIdx} characters`);
console.log(`Added ${newOfferTab.length} characters`);
