import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Turkish Chart of Accounts (Tekdüzen Hesap Planı)
 * Based on Turkish Uniform Chart of Accounts standards
 */
export const standardAccounts = [
  // 1XX - DÖNEN VARLIKLAR (Current Assets)
  { code: '100', name: 'KASA', nameEn: 'Cash', type: 'asset', category: 'current_assets', level: 1, normalBalance: 'debit', isSystem: true },
  { code: '102', name: 'BANKALAR', nameEn: 'Banks', type: 'asset', category: 'current_assets', level: 1, normalBalance: 'debit', isSystem: true },
  { code: '103', name: 'VERİLEN ÇEKLER VE ÖDEME EMİRLERİ', nameEn: 'Issued Checks', type: 'asset', category: 'current_assets', level: 1, normalBalance: 'credit', isSystem: true },
  { code: '108', name: 'DİĞER HAZIR DEĞERLER', nameEn: 'Other Cash Equivalents', type: 'asset', category: 'current_assets', level: 1, normalBalance: 'debit', isSystem: true },
  
  // 12X - TİCARİ ALACAKLAR
  { code: '120', name: 'ALICILAR', nameEn: 'Accounts Receivable', type: 'asset', category: 'current_assets', level: 1, normalBalance: 'debit', isSystem: true },
  { code: '121', name: 'ALACAK SENETLERİ', nameEn: 'Notes Receivable', type: 'asset', category: 'current_assets', level: 1, normalBalance: 'debit', isSystem: true },
  { code: '122', name: 'ALACAK SENETLERİ REESKONTU', nameEn: 'Notes Receivable Discount', type: 'asset', category: 'current_assets', level: 1, normalBalance: 'credit', isSystem: true },
  { code: '126', name: 'VERİLEN DEPOZİTO VE TEMİNATLAR', nameEn: 'Given Deposits', type: 'asset', category: 'current_assets', level: 1, normalBalance: 'debit', isSystem: true },
  { code: '128', name: 'ŞÜPHELİ TİCARİ ALACAKLAR', nameEn: 'Doubtful Receivables', type: 'asset', category: 'current_assets', level: 1, normalBalance: 'debit', isSystem: true },
  { code: '129', name: 'ŞÜPHELİ TİCARİ ALACAKLAR KARŞILIĞI', nameEn: 'Allowance for Doubtful Receivables', type: 'asset', category: 'current_assets', level: 1, normalBalance: 'credit', isSystem: true },
  
  // 13X - DİĞER ALACAKLAR
  { code: '131', name: 'ORTAKLARDAN ALACAKLAR', nameEn: 'Receivables from Partners', type: 'asset', category: 'current_assets', level: 1, normalBalance: 'debit', isSystem: true },
  { code: '135', name: 'PERSONELDEN ALACAKLAR', nameEn: 'Employee Receivables', type: 'asset', category: 'current_assets', level: 1, normalBalance: 'debit', isSystem: true },
  { code: '136', name: 'DİĞER ÇEŞİTLİ ALACAKLAR', nameEn: 'Other Receivables', type: 'asset', category: 'current_assets', level: 1, normalBalance: 'debit', isSystem: true },
  { code: '138', name: 'ŞÜPHELİ DİĞER ALACAKLAR', nameEn: 'Doubtful Other Receivables', type: 'asset', category: 'current_assets', level: 1, normalBalance: 'debit', isSystem: true },
  { code: '139', name: 'ŞÜPHELİ DİĞER ALACAKLAR KARŞILIĞI', nameEn: 'Allowance for Doubtful Other Receivables', type: 'asset', category: 'current_assets', level: 1, normalBalance: 'credit', isSystem: true },
  
  // 15X - STOKLAR
  { code: '150', name: 'İLK MADDE VE MALZEME', nameEn: 'Raw Materials', type: 'asset', category: 'inventory', level: 1, normalBalance: 'debit', isSystem: true },
  { code: '151', name: 'YARI MAMULLER - ÜRETİM', nameEn: 'Work in Process', type: 'asset', category: 'inventory', level: 1, normalBalance: 'debit', isSystem: true },
  { code: '152', name: 'MAMULLER', nameEn: 'Finished Goods', type: 'asset', category: 'inventory', level: 1, normalBalance: 'debit', isSystem: true },
  { code: '153', name: 'TİCARİ MALLAR', nameEn: 'Merchandise', type: 'asset', category: 'inventory', level: 1, normalBalance: 'debit', isSystem: true },
  { code: '157', name: 'DİĞER STOKLAR', nameEn: 'Other Inventory', type: 'asset', category: 'inventory', level: 1, normalBalance: 'debit', isSystem: true },
  { code: '158', name: 'STOK DEĞER DÜŞÜKLÜĞÜ KARŞILIĞI', nameEn: 'Inventory Allowance', type: 'asset', category: 'inventory', level: 1, normalBalance: 'credit', isSystem: true },
  
  // 18X - GELECEK AYLARA AİT GİDERLER
  { code: '180', name: 'GELECEK AYLARA AİT GİDERLER', nameEn: 'Prepaid Expenses', type: 'asset', category: 'current_assets', level: 1, normalBalance: 'debit', isSystem: true },
  { code: '181', name: 'GELİR TAHAKKUKLARI', nameEn: 'Accrued Income', type: 'asset', category: 'current_assets', level: 1, normalBalance: 'debit', isSystem: true },
  
  // 19X - DİĞER DÖNEN VARLIKLAR
  { code: '191', name: 'İNDİRİLECEK KDV', nameEn: 'Deductible VAT', type: 'asset', category: 'current_assets', level: 1, normalBalance: 'debit', isSystem: true },
  { code: '193', name: 'PEŞİN ÖDENEN VERGİLER VE FONLAR', nameEn: 'Prepaid Taxes', type: 'asset', category: 'current_assets', level: 1, normalBalance: 'debit', isSystem: true },
  { code: '195', name: 'İŞ AVANSLARI', nameEn: 'Job Advances', type: 'asset', category: 'current_assets', level: 1, normalBalance: 'debit', isSystem: true },
  { code: '197', name: 'SAYIM VE TESELLÜM NOKSANLARI', nameEn: 'Inventory Shortages', type: 'asset', category: 'current_assets', level: 1, normalBalance: 'debit', isSystem: true },
  { code: '199', name: 'DİĞER DÖNEN VARLIKLAR', nameEn: 'Other Current Assets', type: 'asset', category: 'current_assets', level: 1, normalBalance: 'debit', isSystem: true },

  // 2XX - DURAN VARLIKLAR (Non-Current Assets)
  { code: '250', name: 'ARAZİ VE ARSALAR', nameEn: 'Land', type: 'asset', category: 'fixed_assets', level: 1, normalBalance: 'debit', isSystem: true },
  { code: '251', name: 'YER ALTI VE YER ÜSTÜ DÜZENLERI', nameEn: 'Land Improvements', type: 'asset', category: 'fixed_assets', level: 1, normalBalance: 'debit', isSystem: true },
  { code: '252', name: 'BİNALAR', nameEn: 'Buildings', type: 'asset', category: 'fixed_assets', level: 1, normalBalance: 'debit', isSystem: true },
  { code: '253', name: 'TESİS, MAKİNE VE CİHAZLAR', nameEn: 'Machinery and Equipment', type: 'asset', category: 'fixed_assets', level: 1, normalBalance: 'debit', isSystem: true },
  { code: '254', name: 'TAŞITLAR', nameEn: 'Vehicles', type: 'asset', category: 'fixed_assets', level: 1, normalBalance: 'debit', isSystem: true },
  { code: '255', name: 'DEMİRBAŞLAR', nameEn: 'Furniture and Fixtures', type: 'asset', category: 'fixed_assets', level: 1, normalBalance: 'debit', isSystem: true },
  { code: '257', name: 'DİĞER MADDİ DURAN VARLIKLAR', nameEn: 'Other Fixed Assets', type: 'asset', category: 'fixed_assets', level: 1, normalBalance: 'debit', isSystem: true },
  { code: '258', name: 'BİRİKMİŞ AMORTİSMANLAR', nameEn: 'Accumulated Depreciation', type: 'asset', category: 'fixed_assets', level: 1, normalBalance: 'credit', isSystem: true },
  
  // 26X - MADDİ OLMAYAN DURAN VARLIKLAR
  { code: '260', name: 'HAKLAR', nameEn: 'Rights', type: 'asset', category: 'intangible_assets', level: 1, normalBalance: 'debit', isSystem: true },
  { code: '261', name: 'ŞEREFİYE', nameEn: 'Goodwill', type: 'asset', category: 'intangible_assets', level: 1, normalBalance: 'debit', isSystem: true },
  { code: '262', name: 'KURULUŞ VE ÖRGÜTLENME GİDERLERİ', nameEn: 'Organization Costs', type: 'asset', category: 'intangible_assets', level: 1, normalBalance: 'debit', isSystem: true },
  { code: '263', name: 'ARAŞTIRMA VE GELİŞTİRME GİDERLERİ', nameEn: 'R&D Costs', type: 'asset', category: 'intangible_assets', level: 1, normalBalance: 'debit', isSystem: true },
  { code: '268', name: 'BİRİKMİŞ AMORTİSMANLAR', nameEn: 'Accumulated Amortization', type: 'asset', category: 'intangible_assets', level: 1, normalBalance: 'credit', isSystem: true },

  // 3XX - KISA VADELİ YABANCI KAYNAKLAR (Current Liabilities)
  { code: '300', name: 'BANKA KREDİLERİ', nameEn: 'Bank Loans', type: 'liability', category: 'current_liabilities', level: 1, normalBalance: 'credit', isSystem: true },
  { code: '301', name: 'FAKTORİNG BORÇLARI', nameEn: 'Factoring Payables', type: 'liability', category: 'current_liabilities', level: 1, normalBalance: 'credit', isSystem: true },
  { code: '303', name: 'UZUN VADELİ KREDİLERİN ANA PARA TAKSİT VE FAİZLERİ', nameEn: 'Current Portion of Long-term Debt', type: 'liability', category: 'current_liabilities', level: 1, normalBalance: 'credit', isSystem: true },
  { code: '304', name: 'TAHVIL ANAPARA BORÇ, TAKSİT VE FAİZLERİ', nameEn: 'Bond Principal and Interest', type: 'liability', category: 'current_liabilities', level: 1, normalBalance: 'credit', isSystem: true },
  { code: '305', name: 'ÇIKARILMIŞ BONOLAR VE SENETLER', nameEn: 'Issued Bonds and Notes', type: 'liability', category: 'current_liabilities', level: 1, normalBalance: 'credit', isSystem: true },
  { code: '306', name: 'ÇIKARILMIŞ DİĞER MENKUL KIYMETLER', nameEn: 'Other Issued Securities', type: 'liability', category: 'current_liabilities', level: 1, normalBalance: 'credit', isSystem: true },
  
  // 32X - TİCARİ BORÇLAR
  { code: '320', name: 'SATICILAR', nameEn: 'Accounts Payable', type: 'liability', category: 'current_liabilities', level: 1, normalBalance: 'credit', isSystem: true },
  { code: '321', name: 'BORÇ SENETLERİ', nameEn: 'Notes Payable', type: 'liability', category: 'current_liabilities', level: 1, normalBalance: 'credit', isSystem: true },
  { code: '322', name: 'BORÇ SENETLERİ REESKONTU', nameEn: 'Notes Payable Discount', type: 'liability', category: 'current_liabilities', level: 1, normalBalance: 'debit', isSystem: true },
  { code: '326', name: 'ALINAN DEPOZİTO VE TEMİNATLAR', nameEn: 'Received Deposits', type: 'liability', category: 'current_liabilities', level: 1, normalBalance: 'credit', isSystem: true },
  
  // 33X - DİĞER BORÇLAR
  { code: '331', name: 'ORTAKLARA BORÇLAR', nameEn: 'Payables to Partners', type: 'liability', category: 'current_liabilities', level: 1, normalBalance: 'credit', isSystem: true },
  { code: '335', name: 'PERSONELE BORÇLAR', nameEn: 'Employee Payables', type: 'liability', category: 'current_liabilities', level: 1, normalBalance: 'credit', isSystem: true },
  { code: '336', name: 'DİĞER ÇEŞİTLİ BORÇLAR', nameEn: 'Other Payables', type: 'liability', category: 'current_liabilities', level: 1, normalBalance: 'credit', isSystem: true },
  { code: '337', name: 'DİĞER BORÇLAR', nameEn: 'Miscellaneous Payables', type: 'liability', category: 'current_liabilities', level: 1, normalBalance: 'credit', isSystem: true },
  
  // 36X - ÖDENECEK VERGİ VE DİĞER YÜKÜMLÜLÜKLER
  { code: '360', name: 'ÖDENECEK VERGİ VE FONLAR', nameEn: 'Taxes Payable', type: 'liability', category: 'current_liabilities', level: 1, normalBalance: 'credit', isSystem: true },
  { code: '361', name: 'ÖDENECEK SOSYAL GÜVENLİK KESİNTİLERİ', nameEn: 'Social Security Payables', type: 'liability', category: 'current_liabilities', level: 1, normalBalance: 'credit', isSystem: true },
  
  // 37X - BORÇ VE GİDER KARŞILIKLARI
  { code: '370', name: 'DÖNEM KÂRI VERGİ VE DİĞER YASAL YÜKÜMLÜLÜK KARŞILIKLARI', nameEn: 'Tax Provisions', type: 'liability', category: 'current_liabilities', level: 1, normalBalance: 'credit', isSystem: true },
  { code: '371', name: 'DÖNEM KÂRININ PEŞİN ÖDENEN VERGİ VE DİĞER YÜKÜMLÜLÜKLERI', nameEn: 'Prepaid Taxes on Income', type: 'liability', category: 'current_liabilities', level: 1, normalBalance: 'debit', isSystem: true },
  
  // 38X - GELECEK AYLARA AİT GELİRLER
  { code: '380', name: 'GELECEK AYLARA AİT GELİRLER', nameEn: 'Deferred Revenue', type: 'liability', category: 'current_liabilities', level: 1, normalBalance: 'credit', isSystem: true },
  { code: '381', name: 'GİDER TAHAKKUKLARI', nameEn: 'Accrued Expenses', type: 'liability', category: 'current_liabilities', level: 1, normalBalance: 'credit', isSystem: true },
  
  // 39X - DİĞER KISA VADELİ YABANCI KAYNAKLAR
  { code: '391', name: 'HESAPLANAN KDV', nameEn: 'VAT Payable', type: 'liability', category: 'current_liabilities', level: 1, normalBalance: 'credit', isSystem: true },
  { code: '393', name: 'MERKEZ VE ŞUBELER CARİ HESABI', nameEn: 'Head Office Current Account', type: 'liability', category: 'current_liabilities', level: 1, normalBalance: 'credit', isSystem: true },
  { code: '397', name: 'SAYIM VE TESELLÜM FAZLALARI', nameEn: 'Inventory Overages', type: 'liability', category: 'current_liabilities', level: 1, normalBalance: 'credit', isSystem: true },
  { code: '399', name: 'DİĞER ÇEŞİTLİ YABANCI KAYNAKLAR', nameEn: 'Other Current Liabilities', type: 'liability', category: 'current_liabilities', level: 1, normalBalance: 'credit', isSystem: true },

  // 4XX - UZUN VADELİ YABANCI KAYNAKLAR (Non-Current Liabilities)
  { code: '400', name: 'BANKA KREDİLERİ', nameEn: 'Long-term Bank Loans', type: 'liability', category: 'long_term_liabilities', level: 1, normalBalance: 'credit', isSystem: true },
  { code: '401', name: 'FAKTORİNG BORÇLARI', nameEn: 'Long-term Factoring', type: 'liability', category: 'long_term_liabilities', level: 1, normalBalance: 'credit', isSystem: true },
  { code: '405', name: 'ÇIKARILMIŞ BONOLAR', nameEn: 'Issued Bonds', type: 'liability', category: 'long_term_liabilities', level: 1, normalBalance: 'credit', isSystem: true },
  { code: '420', name: 'SATICILAR', nameEn: 'Long-term Payables', type: 'liability', category: 'long_term_liabilities', level: 1, normalBalance: 'credit', isSystem: true },
  { code: '431', name: 'ORTAKLARA BORÇLAR', nameEn: 'Long-term Payables to Partners', type: 'liability', category: 'long_term_liabilities', level: 1, normalBalance: 'credit', isSystem: true },
  { code: '472', name: 'KIDEM TAZMİNATI KARŞILIĞI', nameEn: 'Severance Pay Provision', type: 'liability', category: 'long_term_liabilities', level: 1, normalBalance: 'credit', isSystem: true },

  // 5XX - ÖZKAYNAKLAR (Equity)
  { code: '500', name: 'SERMAYE', nameEn: 'Capital', type: 'equity', category: 'equity', level: 1, normalBalance: 'credit', isSystem: true },
  { code: '501', name: 'ÖDENMEMİŞ SERMAYE', nameEn: 'Unpaid Capital', type: 'equity', category: 'equity', level: 1, normalBalance: 'debit', isSystem: true },
  { code: '520', name: 'HİSSE SENETLERİ İHRAÇ PRİMLERİ', nameEn: 'Share Premium', type: 'equity', category: 'equity', level: 1, normalBalance: 'credit', isSystem: true },
  { code: '521', name: 'HİSSE SENETLERİ İPTAL KÂRLARI', nameEn: 'Share Cancellation Gains', type: 'equity', category: 'equity', level: 1, normalBalance: 'credit', isSystem: true },
  { code: '540', name: 'YASAL YEDEKLER', nameEn: 'Legal Reserves', type: 'equity', category: 'equity', level: 1, normalBalance: 'credit', isSystem: true },
  { code: '541', name: 'STATÜ YEDEKLERI', nameEn: 'Statutory Reserves', type: 'equity', category: 'equity', level: 1, normalBalance: 'credit', isSystem: true },
  { code: '542', name: 'OLAĞANÜSTÜ YEDEKLER', nameEn: 'Extraordinary Reserves', type: 'equity', category: 'equity', level: 1, normalBalance: 'credit', isSystem: true },
  { code: '548', name: 'DİĞER KÂR YEDEKLERİ', nameEn: 'Other Reserves', type: 'equity', category: 'equity', level: 1, normalBalance: 'credit', isSystem: true },
  { code: '570', name: 'GEÇMİŞ YILLAR KÂRLARI', nameEn: 'Retained Earnings', type: 'equity', category: 'equity', level: 1, normalBalance: 'credit', isSystem: true },
  { code: '580', name: 'GEÇMİŞ YILLAR ZARARLARI', nameEn: 'Retained Losses', type: 'equity', category: 'equity', level: 1, normalBalance: 'debit', isSystem: true },
  { code: '590', name: 'DÖNEM NET KÂRI', nameEn: 'Net Income', type: 'equity', category: 'equity', level: 1, normalBalance: 'credit', isSystem: true },
  { code: '591', name: 'DÖNEM NET ZARARI', nameEn: 'Net Loss', type: 'equity', category: 'equity', level: 1, normalBalance: 'debit', isSystem: true },

  // 6XX - GELİR HESAPLARI (Income)
  { code: '600', name: 'YURTİÇİ SATIŞLAR', nameEn: 'Domestic Sales', type: 'income', category: 'operating_income', level: 1, normalBalance: 'credit', isSystem: true },
  { code: '601', name: 'YURTDIŞI SATIŞLAR', nameEn: 'Export Sales', type: 'income', category: 'operating_income', level: 1, normalBalance: 'credit', isSystem: true },
  { code: '602', name: 'DİĞER GELİRLER', nameEn: 'Other Income', type: 'income', category: 'operating_income', level: 1, normalBalance: 'credit', isSystem: true },
  { code: '610', name: 'SATIŞTAN İADELER', nameEn: 'Sales Returns', type: 'income', category: 'operating_income', level: 1, normalBalance: 'debit', isSystem: true },
  { code: '611', name: 'SATIŞ İSKONTOLARI', nameEn: 'Sales Discounts', type: 'income', category: 'operating_income', level: 1, normalBalance: 'debit', isSystem: true },
  { code: '612', name: 'DİĞER İNDİRİMLER', nameEn: 'Other Deductions', type: 'income', category: 'operating_income', level: 1, normalBalance: 'debit', isSystem: true },
  { code: '620', name: 'KİRALAMA GELİRLERİ', nameEn: 'Rental Income', type: 'income', category: 'operating_income', level: 1, normalBalance: 'credit', isSystem: true },
  { code: '621', name: 'FAİZ GELİRLERİ', nameEn: 'Interest Income', type: 'income', category: 'financial_income', level: 1, normalBalance: 'credit', isSystem: true },
  { code: '622', name: 'KOMİSYON GELİRLERİ', nameEn: 'Commission Income', type: 'income', category: 'operating_income', level: 1, normalBalance: 'credit', isSystem: true },
  { code: '623', name: 'KONUŞMACİ GELİRLERİ', nameEn: 'Speaking Fees', type: 'income', category: 'operating_income', level: 1, normalBalance: 'credit', isSystem: true },
  { code: '626', name: 'SİGORTA TAZMİNATLARI', nameEn: 'Insurance Proceeds', type: 'income', category: 'other_income', level: 1, normalBalance: 'credit', isSystem: true },
  { code: '627', name: 'KONUSU KALMAYAN KARŞILIKLAR', nameEn: 'Reversed Provisions', type: 'income', category: 'other_income', level: 1, normalBalance: 'credit', isSystem: true },
  { code: '628', name: 'REESKONT FAİZ GELİRLERİ', nameEn: 'Discount Interest Income', type: 'income', category: 'financial_income', level: 1, normalBalance: 'credit', isSystem: true },
  { code: '642', name: 'FAİZ GELİRLERİ', nameEn: 'Interest Income', type: 'income', category: 'financial_income', level: 1, normalBalance: 'credit', isSystem: true },
  { code: '645', name: 'MENKUL KIYMET SATIŞ KÂRLARI', nameEn: 'Securities Gains', type: 'income', category: 'financial_income', level: 1, normalBalance: 'credit', isSystem: true },
  { code: '646', name: 'KAMBİYO KÂRLARI', nameEn: 'Foreign Exchange Gains', type: 'income', category: 'financial_income', level: 1, normalBalance: 'credit', isSystem: true },
  { code: '679', name: 'DİĞER OLAĞANDIŞI GELİR VE KÂRLAR', nameEn: 'Extraordinary Income', type: 'income', category: 'extraordinary_income', level: 1, normalBalance: 'credit', isSystem: true },

  // 7XX - GİDER HESAPLARI (Expenses)
  { code: '710', name: 'DİREKT İLK MADDE VE MALZEME GİDERLERİ', nameEn: 'Direct Materials', type: 'expense', category: 'cost_of_sales', level: 1, normalBalance: 'debit', isSystem: true },
  { code: '720', name: 'DİREKT İŞÇİLİK GİDERLERİ', nameEn: 'Direct Labor', type: 'expense', category: 'cost_of_sales', level: 1, normalBalance: 'debit', isSystem: true },
  { code: '730', name: 'GENEL ÜRETİM GİDERLERİ', nameEn: 'Manufacturing Overhead', type: 'expense', category: 'cost_of_sales', level: 1, normalBalance: 'debit', isSystem: true },
  { code: '740', name: 'HİZMET ÜRETİM MALİYETİ', nameEn: 'Service Cost', type: 'expense', category: 'cost_of_sales', level: 1, normalBalance: 'debit', isSystem: true },
  { code: '750', name: 'ARAŞTIRMA VE GELİŞTİRME GİDERLERİ', nameEn: 'R&D Expenses', type: 'expense', category: 'operating_expenses', level: 1, normalBalance: 'debit', isSystem: true },
  { code: '760', name: 'PAZARLAMA SATIŞ VE DAĞITIM GİDERLERİ', nameEn: 'Marketing Expenses', type: 'expense', category: 'operating_expenses', level: 1, normalBalance: 'debit', isSystem: true },
  { code: '770', name: 'GENEL YÖNETİM GİDERLERİ', nameEn: 'Administrative Expenses', type: 'expense', category: 'operating_expenses', level: 1, normalBalance: 'debit', isSystem: true },
  { code: '771', name: 'GENEL YÖNETİM GİDERLERİ YANSITMA HESABI', nameEn: 'Admin Expenses Allocation', type: 'expense', category: 'operating_expenses', level: 1, normalBalance: 'credit', isSystem: true },
  
  // Detailed expense accounts
  { code: '770.01', name: 'PERSONEL ÜCRETLERİ', nameEn: 'Personnel Salaries', type: 'expense', category: 'operating_expenses', level: 2, normalBalance: 'debit', parentCode: '770', isSystem: false },
  { code: '770.02', name: 'DIŞARIDAN SAĞLANAN FAYDA VE HİZMETLER', nameEn: 'External Services', type: 'expense', category: 'operating_expenses', level: 2, normalBalance: 'debit', parentCode: '770', isSystem: false },
  { code: '770.03', name: 'ÇEŞİTLİ GİDERLER', nameEn: 'Miscellaneous Expenses', type: 'expense', category: 'operating_expenses', level: 2, normalBalance: 'debit', parentCode: '770', isSystem: false },
  { code: '770.04', name: 'VERGİ RESİM VE HARÇLAR', nameEn: 'Taxes and Fees', type: 'expense', category: 'operating_expenses', level: 2, normalBalance: 'debit', parentCode: '770', isSystem: false },
  { code: '770.05', name: 'AMORTİSMANLAR VE TÜKENME PAYLARI', nameEn: 'Depreciation', type: 'expense', category: 'operating_expenses', level: 2, normalBalance: 'debit', parentCode: '770', isSystem: false },
  
  { code: '780', name: 'FİNANSMAN GİDERLERİ', nameEn: 'Financial Expenses', type: 'expense', category: 'financial_expenses', level: 1, normalBalance: 'debit', isSystem: true },
  { code: '781', name: 'REESKONT FAİZ GİDERLERİ', nameEn: 'Discount Interest Expenses', type: 'expense', category: 'financial_expenses', level: 1, normalBalance: 'debit', isSystem: true },
  
  // 78X - Detailed financial expenses
  { code: '780.01', name: 'KISA VADELİ BORÇLANMA GİDERLERİ', nameEn: 'Short-term Borrowing Costs', type: 'expense', category: 'financial_expenses', level: 2, normalBalance: 'debit', parentCode: '780', isSystem: false },
  { code: '780.02', name: 'UZUN VADELİ BORÇLANMA GİDERLERİ', nameEn: 'Long-term Borrowing Costs', type: 'expense', category: 'financial_expenses', level: 2, normalBalance: 'debit', parentCode: '780', isSystem: false },
  
  { code: '642', name: 'FAİZ GİDERLERİ', nameEn: 'Interest Expenses', type: 'expense', category: 'financial_expenses', level: 1, normalBalance: 'debit', isSystem: true },
  { code: '646', name: 'KAMBİYO ZARARLARI', nameEn: 'Foreign Exchange Losses', type: 'expense', category: 'financial_expenses', level: 1, normalBalance: 'debit', isSystem: true },
  { code: '689', name: 'DİĞER OLAĞANDIŞI GİDER VE ZARARLAR', nameEn: 'Extraordinary Expenses', type: 'expense', category: 'extraordinary_expenses', level: 1, normalBalance: 'debit', isSystem: true },
  
  // 8XX - MALİYET HESAPLARI (Cost Accounts) - used in cost accounting
  { code: '800', name: 'SABİT MALİYETLER', nameEn: 'Fixed Costs', type: 'expense', category: 'cost_of_sales', level: 1, normalBalance: 'debit', isSystem: true },
  { code: '810', name: 'DEĞİŞKEN MALİYETLER', nameEn: 'Variable Costs', type: 'expense', category: 'cost_of_sales', level: 1, normalBalance: 'debit', isSystem: true },
];

/**
 * Seeds the ChartOfAccounts table with standard Turkish accounts
 */
export async function seedChartOfAccounts(companyId: number) {
  console.log(`🌱 Seeding Chart of Accounts for company ${companyId}...`);

  let created = 0;
  let skipped = 0;

  for (const account of standardAccounts) {
    try {
      // Check if account already exists
      const existing = await prisma.chartOfAccounts.findFirst({
        where: {
          companyId,
          code: account.code,
        },
      });

      if (existing) {
        skipped++;
        continue;
      }

      // Create the account
      await prisma.chartOfAccounts.create({
        data: {
          ...account,
          companyId,
          currentBalance: 0,
          isActive: true,
        },
      });

      created++;
    } catch (error) {
      console.error(`❌ Error creating account ${account.code}:`, error);
    }
  }

  console.log(`✅ Created ${created} accounts, skipped ${skipped} existing accounts`);
  return { created, skipped, total: standardAccounts.length };
}

/**
 * Seeds all companies with standard chart of accounts
 */
export async function seedAllCompanies() {
  console.log('🌱 Starting Chart of Accounts seed for all companies...');

  const companies = await prisma.company.findMany({
    select: { id: true, name: true },
  });

  console.log(`📊 Found ${companies.length} companies`);

  for (const company of companies) {
    console.log(`\n📁 Processing company: ${company.name} (${company.id})`);
    await seedChartOfAccounts(company.id);
  }

  console.log('\n✅ Chart of Accounts seed completed for all companies!');
}

// Run seed if called directly
if (require.main === module) {
  seedAllCompanies()
    .then(() => {
      console.log('✅ Seed completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seed failed:', error);
      process.exit(1);
    })
    .finally(() => {
      prisma.$disconnect();
    });
}
