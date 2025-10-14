-- Test inspection verisi oluştur
-- Önce gerekli verileri kontrol et

-- Mevcut order, equipment, customer ve user'ları listele
SELECT 
  o.id as order_id, 
  o.orderNumber,
  e.id as equipment_id,
  e.name as equipment_name,
  c.id as customer_id,
  c.name as customer_name,
  u.id as user_id,
  u.name as user_name
FROM "Order" o
JOIN "Customer" c ON o.customerId = c.id
JOIN "User" u ON o.companyId = u.companyId
JOIN "Equipment" e ON e.companyId = o.companyId
LIMIT 1;

-- Test inspection oluştur (yukarıdaki query'den aldığın ID'leri kullan)
INSERT INTO "Inspection" (
  inspectionType,
  orderId,
  equipmentId,
  inspectorId,
  customerId,
  status,
  overallCondition,
  checklistData,
  notes,
  location,
  inspectionDate,
  createdAt,
  updatedAt
) VALUES (
  'CHECKOUT',
  1, -- order ID
  1, -- equipment ID  
  1, -- inspector (user) ID
  1, -- customer ID
  'APPROVED',
  'GOOD',
  '[
    {"id":"1","category":"Fiziksel Durum","label":"Gövde ve kasa hasarı var mı?","checked":true,"required":true,"notes":"Hafif çizik var"},
    {"id":"2","category":"Fiziksel Durum","label":"Objektif ve lens temiz mi?","checked":true,"required":true,"notes":""},
    {"id":"3","category":"Aksesuar Kontrolü","label":"Batarya mevcut mu?","checked":true,"required":true,"notes":"2 adet batarya var"}
  ]',
  'Test kontrol raporu. Ekipman iyi durumda teslim edildi.',
  'İstanbul Merkez Depo',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);

-- Hasar raporu ekle (opsiyonel)
INSERT INTO "DamageReport" (
  inspectionId,
  damageType,
  severity,
  description,
  location,
  estimatedCost,
  responsibleParty,
  status,
  createdAt,
  updatedAt
) VALUES (
  (SELECT MAX(id) FROM "Inspection"),
  'COSMETIC',
  'MINOR',
  'Kamera gövdesinde küçük bir çizik var. Fonksiyonel bir sorun yok.',
  'Gövde ön yüzü',
  50.00,
  'CUSTOMER',
  'PENDING',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);
