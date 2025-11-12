const fs = require('fs');

const file = 'frontend/src/pages/Accounting.tsx';
let content = fs.readFileSync(file, 'utf8');

const replacements = {
  'dï¿½nï¿½ï¿½tï¿½rmek': 'dönüştürmek',
  'istediï¿½inizden': 'istediğinizden',
  'iï¿½in': 'için',
  'Basitleï¿½tirilmiï¿½': 'Basitleştirilmiş',
  'gerï¿½ek': 'gerçek',
  'almalï¿½sï¿½nï¿½z': 'almalısınız',
  'Geï¿½ici': 'Geçici',
  'kullanï¿½yoruz': 'kullanıyoruz',
  'oluï¿½turuldu': 'oluşturuldu',
  'baï¿½arï¿½yla': 'başarıyla',
  'dï¿½nï¿½ï¿½tï¿½rï¿½ldï¿½': 'dönüştürüldü',
  'Dï¿½nï¿½ï¿½tï¿½rme': 'Dönüştürme',
  'baï¿½arï¿½sï¿½z': 'başarısız',
  'faturayï¿½': 'faturayı',
  'iï¿½lem': 'işlem',
  'olmalï¿½': 'olmalı',
  'gï¿½nderme': 'gönderme',
  'ï¿½zelliï¿½i': 'özelliği',
  'yakï¿½nda': 'yakında',
  'Mï¿½ï¿½terinin': 'Müşterinin',
  'Mï¿½ï¿½teri': 'Müşteri',
  'mï¿½ï¿½teri': 'müşteri',
  'numarasï¿½': 'numarası',
  'bulunamadï¿½': 'bulunamadı',
  'numaralï¿½': 'numaralı',
  'faturanï¿½z': 'faturanız',
  'hazï¿½r': 'hazır',
  'aï¿½ï¿½lï¿½yor': 'açılıyor',
  'kopyalandï¿½': 'kopyalandı',
  'ï¿½ekler': 'Çekler',
  'ï¿½eki': 'çeki',
  'ï¿½ek ': 'Çek ',
  'Yaï¿½landï¿½rma': 'Yaşlandırma',
  'alï¿½namadï¿½': 'alınamadı',
  'Geï¿½miï¿½': 'Geçmiş',
  'Kï¿½r': 'Kâr',
  'Yï¿½netimi': 'Yönetimi',
  'Planï¿½': 'Planı',
  'Modï¿½lï¿½': 'Modülü',
  'Hatasï¿½': 'Hatası',
  'modï¿½lï¿½nde': 'modülünde',
  'oluï¿½tu': 'oluştu',
  'Lï¿½tfen': 'Lütfen',
  'sayfayï¿½': 'sayfayı',
  'ï¿½ï¿½erik': 'İçerik',
  'yï¿½kleniyor': 'yükleniyor',
  'Geliï¿½miï¿½': 'Gelişmiş',
  'Bilanï¿½o': 'Bilanço',
  'ï¿½ï¿½lemler': 'İşlemler',
  'Dï¿½zenle': 'Düzenle',
  'oluï¿½tur': 'oluştur',
  'Tï¿½m': 'Tüm',
  'Gï¿½nderildi': 'Gönderildi',
  'ï¿½dendi': 'Ödendi',
  'Kï¿½smi': 'Kısmi',
  'ï¿½deme': 'Ödeme',
  'ï¿½ptal': 'İptal',
  'Gï¿½n': 'Gün',
  'ï¿½zel': 'Özel',
  'Baï¿½langï¿½ï¿½': 'Başlangıç',
  'Bitiï¿½': 'Bitiş',
  'baï¿½layï¿½n': 'başlayın',
  'seï¿½ildi': 'seçildi',
  'Seï¿½imi': 'Seçimi',
  'ï¿½ndir': 'İndir',
  'Gï¿½nder': 'Gönder',
  'Yazdï¿½r': 'Yazdır',
  'Dï¿½nï¿½ï¿½tï¿½': 'Dönüştü',
  'Sï¿½resi': 'Süresi',
  'Aralï¿½ï¿½ï¿½': 'Aralığı'
};

let count = 0;
for (const [old, newStr] of Object.entries(replacements)) {
  const before = content;
  content = content.split(old).join(newStr);
  if (before !== content) {
    count++;
  }
}

fs.writeFileSync(file, content, 'utf8');
console.log(`✅ Fixed ${count} different patterns!`);
