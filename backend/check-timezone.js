const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    // Get the most recently created user with their profile
    const users = await prisma.user.findMany({
      include: { profile: true },
      orderBy: { createdAt: 'desc' },  
      take: 3
    });
    
    console.log('=== LAST 3 USERS ===');
    users.forEach(u => {
      console.log({ 
        email: u.email, 
        firstName: u.firstName,
        timezone: u.profile?.timezone || 'NOT SET'
      });
    });
    
    // Also check for 'hello' medication
    const meds = await prisma.medication.findMany({
      where: { name: 'hello' },
      include: { doseSchedules: true }
    });
    
    if (meds.length > 0) {
      console.log('\n=== HELLO MEDICATION ===');
      console.log('Name:', meds[0].name);
      console.log('Times:', meds[0].times);
      console.log('Dose Schedules:');
      meds[0].doseSchedules.slice(0, 3).forEach(d => {
        console.log('  -', d.scheduledAt.toISOString(), '(' + d.scheduledAt.toISOString().substring(11, 16) + ' UTC)');
      });
    }
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await prisma.$disconnect();
  }
})();
