import { prisma } from '../src/lib/prisma';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('Clearing database demo data...');
  
  // Delete related data first due to foreign key constraints
  await prisma.notification.deleteMany({});
  await prisma.report.deleteMany({});
  await prisma.comment.deleteMany({});
  await prisma.like.deleteMany({});
  await prisma.bookmark.deleteMany({});
  await prisma.participant.deleteMany({});
  await prisma.eventView.deleteMany({});
  await prisma.follow.deleteMany({});
  await prisma.event.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('Cleared all tables.');

  // Re-create a clean admin account for system administration and moderation
  const passwordHash = await bcrypt.hash('password123', 10);
  await prisma.user.create({
    data: {
      name: 'Moderator Chief',
      email: 'admin@example.com',
      password: passwordHash,
      role: 'ADMIN',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100',
    },
  });

  console.log('Created admin account (admin@example.com / password123).');
}

main()
  .catch((e) => {
    console.error('Error clearing database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
