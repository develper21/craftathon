const { PrismaClient } = require('@prisma/client');
const { generateFutureDoseSchedules } = require('./src/controllers/medication.controller');
const prisma = new PrismaClient();

(async () => {
  try {
    // Get all users with UTC timezone
    const users = await prisma.user.findMany({
      where: { profile: { timezone: 'UTC' } },
      include: { profile: true }
    });

    console.log(`Found ${users.length} users with UTC timezone. Updating to Asia/Kolkata...`);

    for (const user of users) {
      // Update user timezone
      await prisma.profile.update({
        where: { userId: user.id },
        data: { timezone: 'Asia/Kolkata' }
      });
      console.log(`✓ Updated ${user.email} timezone to Asia/Kolkata`);

      // Delete old incorrect dose schedules
      const deleted = await prisma.doseSchedule.deleteMany({
        where: {
          userId: user.id,
          scheduledAt: { gte: new Date('2026-04-04') }
        }
      });
      console.log(`  Deleted ${deleted.count} old dose schedules`);

      // Get all medications for this user
      const medications = await prisma.medication.findMany({
        where: { userId: user.id, isActive: true }
      });

      console.log(`  Regenerating dose schedules for ${medications.length} medications...`);
      
      // Regenerate schedules for each medication
      for (const med of medications) {
        await generateFutureDoseSchedules(med, 7, 'Asia/Kolkata');
      }
      
      console.log(`  ✓ Generated new schedules for all medications`);
    }

    console.log('\n=== SUCCESS ===');
    console.log('All timezones updated to Asia/Kolkata');
    console.log('All dose schedules regenerated with correct times');

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await prisma.$disconnect();
  }
})();
