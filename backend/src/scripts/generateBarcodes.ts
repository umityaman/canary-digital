import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function generateBarcodesForAllEquipment() {
  console.log('🔄 Starting barcode generation for all equipment...\n');

  try {
    // Get all equipment without barcodes
    const equipmentList = await prisma.equipment.findMany({
      where: {
        barcode: null
      }
    });

    console.log(`Found ${equipmentList.length} equipment without barcodes\n`);

    let successCount = 0;
    let errorCount = 0;

    for (const equipment of equipmentList) {
      try {
        // Generate barcode: EQ + padded ID (8 digits)
        const barcode = `EQ${String(equipment.id).padStart(8, '0')}`;

        // Update equipment with barcode
        await prisma.equipment.update({
          where: { id: equipment.id },
          data: { barcode }
        });

        console.log(`✅ Generated barcode for "${equipment.name}": ${barcode}`);
        successCount++;
      } catch (error: any) {
        console.error(`❌ Failed to generate barcode for "${equipment.name}":`, error.message);
        errorCount++;
      }
    }

    console.log('\n📊 Summary:');
    console.log(`   Total processed: ${equipmentList.length}`);
    console.log(`   ✅ Successful: ${successCount}`);
    console.log(`   ❌ Failed: ${errorCount}`);

    // Show some examples
    const samplesWithBarcodes = await prisma.equipment.findMany({
      where: {
        barcode: {
          not: null
        }
      },
      take: 5
    });

    if (samplesWithBarcodes.length > 0) {
      console.log('\n📋 Sample barcodes:');
      samplesWithBarcodes.forEach((eq) => {
        console.log(`   ${eq.barcode} - ${eq.name}`);
      });
    }

    console.log('\n✅ Barcode generation completed!');
  } catch (error: any) {
    console.error('\n❌ Error during barcode generation:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
generateBarcodesForAllEquipment()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
