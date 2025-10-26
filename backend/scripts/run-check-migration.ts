import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting Check & Promissory Note migration...');

  try {
    // Check if Check table exists
    const checkCount = await prisma.check.count();
    console.log(`✅ Check table exists. Current records: ${checkCount}`);

    // Check if PromissoryNote table exists
    const noteCount = await prisma.promissoryNote.count();
    console.log(`✅ PromissoryNote table exists. Current records: ${noteCount}`);

    // If tables are empty, add sample data
    if (checkCount === 0) {
      console.log('📝 Adding sample checks...');

      const sampleChecks = [
        {
          companyId: 1,
          checkNumber: 'CHK-2025-001',
          serialNumber: 'A123456',
          amount: 50000,
          currency: 'TRY',
          issueDate: new Date('2025-01-15'),
          dueDate: new Date('2025-04-15'),
          type: 'received', // Müşteriden alınan çek
          status: 'portfolio',
          drawerName: 'ABC İnşaat Ltd. Şti.',
          drawerTaxNumber: '1234567890',
          payeeName: 'Canary Digital',
          bankName: 'Ziraat Bankası',
          bankBranch: 'Kadıköy Şubesi',
          location: 'Portföy',
          notes: '3 ay vadeli müşteri çeki',
        },
        {
          companyId: 1,
          checkNumber: 'CHK-2025-002',
          serialNumber: 'B789012',
          amount: 75000,
          currency: 'TRY',
          issueDate: new Date('2025-02-01'),
          dueDate: new Date('2025-05-01'),
          type: 'received',
          status: 'deposited',
          drawerName: 'XYZ Ticaret A.Ş.',
          drawerTaxNumber: '9876543210',
          payeeName: 'Canary Digital',
          bankName: 'İş Bankası',
          bankBranch: 'Beşiktaş Şubesi',
          location: 'Bankada',
          depositedDate: new Date('2025-02-05'),
          notes: 'Bankaya yatırıldı, tahsil bekliyor',
        },
        {
          companyId: 1,
          checkNumber: 'CHK-2025-003',
          serialNumber: 'C345678',
          amount: 30000,
          currency: 'TRY',
          issueDate: new Date('2025-01-20'),
          dueDate: new Date('2025-03-20'),
          type: 'issued', // Tedarikçiye verilen çek
          status: 'cashed',
          drawerName: 'Canary Digital',
          payeeName: 'Tedarikçi Firma Ltd.',
          bankName: 'Garanti BBVA',
          bankBranch: 'Levent Şubesi',
          location: 'Tahsil Edildi',
          cashedDate: new Date('2025-03-21'),
          notes: 'Tedarikçiye ödeme',
        },
        {
          companyId: 1,
          checkNumber: 'CHK-2025-004',
          serialNumber: 'D901234',
          amount: 100000,
          currency: 'TRY',
          issueDate: new Date('2025-02-10'),
          dueDate: new Date('2025-06-10'),
          type: 'received',
          status: 'endorsed',
          drawerName: 'DEF Holding A.Ş.',
          drawerTaxNumber: '5555555555',
          payeeName: 'Canary Digital',
          bankName: 'Akbank',
          bankBranch: 'Şişli Şubesi',
          location: 'Ciroda',
          endorsedTo: 'Başka Tedarikçi Ltd.',
          endorsedDate: new Date('2025-02-15'),
          notes: 'Tedarikçiye ciro edildi',
        },
        {
          companyId: 1,
          checkNumber: 'CHK-2025-005',
          serialNumber: 'E567890',
          amount: 25000,
          currency: 'TRY',
          issueDate: new Date('2025-01-05'),
          dueDate: new Date('2025-02-05'),
          type: 'received',
          status: 'bounced',
          drawerName: 'Karşılıksız Firma',
          drawerTaxNumber: '1111111111',
          payeeName: 'Canary Digital',
          bankName: 'Yapı Kredi',
          bankBranch: 'Mecidiyeköy Şubesi',
          location: 'İade',
          bouncedDate: new Date('2025-02-06'),
          bouncedReason: 'Karşılıksız',
          notes: 'Karşılıksız çıktı, hukuki süreç başlatıldı',
        },
      ];

      for (const check of sampleChecks) {
        await prisma.check.create({ data: check });
      }

      console.log(`✅ Created ${sampleChecks.length} sample checks`);
    }

    if (noteCount === 0) {
      console.log('📝 Adding sample promissory notes...');

      const sampleNotes = [
        {
          companyId: 1,
          noteNumber: 'SEN-2025-001',
          serialNumber: 'S123456',
          amount: 150000,
          currency: 'TRY',
          issueDate: new Date('2025-01-10'),
          dueDate: new Date('2025-07-10'),
          type: 'receivable', // Alacak senedi
          status: 'portfolio',
          drawerName: 'GHI Yapı A.Ş.',
          drawerTaxNumber: '2222222222',
          payeeName: 'Canary Digital',
          guarantorName: 'Kemal Yılmaz',
          guarantorTaxNo: '33333333333',
          location: 'Portföy',
          notes: '6 ay vadeli alacak senedi, kefilli',
        },
        {
          companyId: 1,
          noteNumber: 'SEN-2025-002',
          serialNumber: 'S789012',
          amount: 200000,
          currency: 'TRY',
          issueDate: new Date('2025-02-01'),
          dueDate: new Date('2025-08-01'),
          type: 'receivable',
          status: 'collected',
          drawerName: 'JKL Otomotiv Ltd.',
          drawerTaxNumber: '4444444444',
          payeeName: 'Canary Digital',
          location: 'Tahsil Edildi',
          collectedDate: new Date('2025-08-02'),
          notes: 'Vadede tahsil edildi',
        },
        {
          companyId: 1,
          noteNumber: 'SEN-2025-003',
          serialNumber: 'S345678',
          amount: 80000,
          currency: 'TRY',
          issueDate: new Date('2025-01-15'),
          dueDate: new Date('2025-05-15'),
          type: 'payable', // Borç senedi
          status: 'portfolio',
          drawerName: 'Canary Digital',
          payeeName: 'MNO Tedarik A.Ş.',
          location: 'Portföy',
          notes: 'Tedarikçiye verilen borç senedi',
        },
        {
          companyId: 1,
          noteNumber: 'SEN-2025-004',
          serialNumber: 'S901234',
          amount: 120000,
          currency: 'TRY',
          issueDate: new Date('2025-02-05'),
          dueDate: new Date('2025-09-05'),
          type: 'receivable',
          status: 'endorsed',
          drawerName: 'PQR Tekstil Ltd.',
          drawerTaxNumber: '6666666666',
          payeeName: 'Canary Digital',
          location: 'Ciroda',
          endorsedTo: 'Başka Alacaklı Firma',
          endorsedDate: new Date('2025-02-10'),
          notes: 'Başka firmaya ciro edildi',
        },
        {
          companyId: 1,
          noteNumber: 'SEN-2025-005',
          serialNumber: 'S567890',
          amount: 60000,
          currency: 'TRY',
          issueDate: new Date('2025-01-20'),
          dueDate: new Date('2025-03-20'),
          type: 'receivable',
          status: 'defaulted',
          drawerName: 'Sorunlu Müşteri Ltd.',
          drawerTaxNumber: '7777777777',
          payeeName: 'Canary Digital',
          location: 'Protestolu',
          defaultedDate: new Date('2025-03-25'),
          defaultReason: 'Ödeme yapılmadı',
          notes: 'Protesto edildi, tahsilat süreci devam ediyor',
        },
      ];

      for (const note of sampleNotes) {
        await prisma.promissoryNote.create({ data: note });
      }

      console.log(`✅ Created ${sampleNotes.length} sample promissory notes`);
    }

    // Show summary
    const finalCheckCount = await prisma.check.count();
    const finalNoteCount = await prisma.promissoryNote.count();

    console.log('\n📊 Summary:');
    console.log(`Total Checks: ${finalCheckCount}`);
    console.log(`Total Promissory Notes: ${finalNoteCount}`);

    // Calculate totals by type
    const receivedChecks = await prisma.check.aggregate({
      where: { type: 'received', companyId: 1 },
      _sum: { amount: true },
      _count: true,
    });

    const issuedChecks = await prisma.check.aggregate({
      where: { type: 'issued', companyId: 1 },
      _sum: { amount: true },
      _count: true,
    });

    const receivableNotes = await prisma.promissoryNote.aggregate({
      where: { type: 'receivable', companyId: 1 },
      _sum: { amount: true },
      _count: true,
    });

    const payableNotes = await prisma.promissoryNote.aggregate({
      where: { type: 'payable', companyId: 1 },
      _sum: { amount: true },
      _count: true,
    });

    console.log('\n💰 Financial Summary:');
    console.log(
      `Alınan Çekler: ${receivedChecks._count} adet, ${receivedChecks._sum.amount?.toLocaleString('tr-TR')} TL`
    );
    console.log(
      `Verilen Çekler: ${issuedChecks._count} adet, ${issuedChecks._sum.amount?.toLocaleString('tr-TR')} TL`
    );
    console.log(
      `Alacak Senetleri: ${receivableNotes._count} adet, ${receivableNotes._sum.amount?.toLocaleString('tr-TR')} TL`
    );
    console.log(
      `Borç Senetleri: ${payableNotes._count} adet, ${payableNotes._sum.amount?.toLocaleString('tr-TR')} TL`
    );

    console.log('\n✅ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
