import { prisma } from '../src/lib/prisma';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('Seeding database...');

  // Clean existing data
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

  console.log('Cleared existing data.');

  // Create Users
  const passwordHash = await bcrypt.hash('password123', 10);

  // Admin user
  const admin = await prisma.user.create({
    data: {
      name: 'Moderator Chief',
      email: 'admin@example.com',
      password: passwordHash,
      role: 'ADMIN',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100',
      instagram: 'mod_chief',
    },
  });

  const alice = await prisma.user.create({
    data: {
      name: 'Alice Henderson',
      email: 'alice@example.com',
      password: passwordHash,
      role: 'USER',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=100',
      instagram: 'alice_henderson',
    },
  });

  const bob = await prisma.user.create({
    data: {
      name: 'Bob Miller',
      email: 'bob@example.com',
      password: passwordHash,
      role: 'USER',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=100',
      instagram: 'bob_vocals',
    },
  });

  const charlie = await prisma.user.create({
    data: {
      name: 'Charlie Davis',
      email: 'charlie@example.com',
      password: passwordHash,
      role: 'USER',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100',
      instagram: 'charlie_pillows',
    },
  });

  console.log('Created users (with an Admin).');

  // Helper date generators
  const getFutureDate = (daysAhead: number, hour: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysAhead);
    d.setHours(hour, 0, 0, 0);
    return d;
  };

  // Create Events
  const event1 = await prisma.event.create({
    data: {
      title: 'Central Park Frozen Statue Challenge',
      description: 'We will meet near the Bethesda Fountain. At exactly 3:00 PM, a whistle will sound. Everyone must freeze in whatever position they are in for exactly 5 minutes. No moving, no talking, no laughing. At 3:05 PM, a double whistle will blow, and we will disperse quietly back into the crowd like nothing happened! Dress in dark colors if possible to stand out in the snow/pavement.',
      category: 'Dance',
      date: getFutureDate(3, 15),
      location: 'Bethesda Fountain, Central Park',
      city: 'New York',
      maxParticipants: 150,
      latitude: 40.7737,
      longitude: -73.9712,
      image: 'https://images.unsplash.com/photo-1513829096970-cf9989577dfc?auto=format&fit=crop&q=80&w=600',
      organizerContact: 'https://chat.whatsapp.com/bethesda-freeze-2026',
      organizerId: alice.id,
    },
  });

  const event2 = await prisma.event.create({
    data: {
      title: 'Bohemian Rhapsody Choir Flashmob',
      description: 'Let\'s surprise commuters at Millennium Park! We will disperse around the Cloud Gate (the Bean). At 5:30 PM, our lead singer will start the intro of Bohemian Rhapsody: "Is this the real life...". At 5:31 PM, the choir will join in. Lyric sheets will be sent to joined participants. Bring your energy and harmonizing voices!',
      category: 'Music',
      date: getFutureDate(5, 17),
      location: 'Millennium Park, under the Cloud Gate',
      city: 'Chicago',
      maxParticipants: 80,
      latitude: 41.8827,
      longitude: -87.6227,
      image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=600',
      organizerContact: 'organizer@chicagosingers.org',
      organizerId: bob.id,
    },
  });

  const event3 = await prisma.event.create({
    data: {
      title: 'Glow-in-the-Dark Beach Yoga Session',
      description: 'Spontaneous sunset/night yoga. Meet on the beach. Bring your own mat and wear white or fluorescent clothes. We will distribute glow sticks and neon face paint. Clean, calming flow led by certified instructor Alice. Everyone is welcome!',
      category: 'Fitness',
      date: getFutureDate(1, 19),
      location: 'Santa Monica Beach, South of the Pier',
      city: 'Los Angeles',
      maxParticipants: 40,
      latitude: 34.0100,
      longitude: -118.4961,
      image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=600',
      organizerContact: 'Text Alice at 555-0199',
      organizerId: alice.id,
    },
  });

  const event4 = await prisma.event.create({
    data: {
      title: 'Spontaneous City Pillow Fight',
      description: 'The ultimate pillow fight! Bring a soft pillow in a bag. Gather at Union Square. At 1:00 PM sharp, we will unzip our bags and start the fight. Rules: 1. Pillows only! 2. Never hit anyone without a pillow or holding a camera. 3. Stop at 1:20 PM and clean up all feathers together.',
      category: 'Social',
      date: getFutureDate(10, 13),
      location: 'Union Square Plaza',
      city: 'New York',
      maxParticipants: 300,
      latitude: 40.7359,
      longitude: -73.9911,
      image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&q=80&w=600',
      organizerContact: 'https://pillowfight.ny/join',
      organizerId: charlie.id,
    },
  });

  console.log('Created events with lat/lng coordinates.');

  // Create Participants
  await prisma.participant.createMany({
    data: [
      { userId: alice.id, eventId: event1.id, status: 'JOINED' },
      { userId: bob.id, eventId: event1.id, status: 'JOINED' },
      { userId: charlie.id, eventId: event1.id, status: 'JOINED' },

      { userId: bob.id, eventId: event2.id, status: 'JOINED' },
      { userId: alice.id, eventId: event2.id, status: 'JOINED' },

      { userId: alice.id, eventId: event3.id, status: 'JOINED' },
      { userId: charlie.id, eventId: event3.id, status: 'JOINED' },

      { userId: charlie.id, eventId: event4.id, status: 'JOINED' },
      { userId: bob.id, eventId: event4.id, status: 'JOINED' },
    ],
  });

  // Bookmarks
  await prisma.bookmark.createMany({
    data: [
      { userId: bob.id, eventId: event3.id },
      { userId: alice.id, eventId: event2.id },
      { userId: charlie.id, eventId: event1.id },
    ],
  });

  // Comments
  await prisma.comment.createMany({
    data: [
      { userId: bob.id, eventId: event1.id, content: 'This is going to be epic! Im already pickin my freeze position.' },
      { userId: charlie.id, eventId: event1.id, content: 'Should we dress as statues or just normal winter wear?' },
      { userId: alice.id, eventId: event1.id, content: 'Dress normal, so we merge back into the crowd seamlessly!' },
      { userId: alice.id, eventId: event2.id, content: 'Are we doing the high notes in Bohemian Rhapsody?' },
      { userId: bob.id, eventId: event2.id, content: 'Haha, yes! I will bring lyric printouts just in case.' },
    ],
  });

  // Likes/Reactions
  await prisma.like.createMany({
    data: [
      { userId: bob.id, eventId: event1.id },
      { userId: charlie.id, eventId: event1.id },
      { userId: alice.id, eventId: event2.id },
      { userId: charlie.id, eventId: event3.id },
      { userId: alice.id, eventId: event4.id },
    ],
  });

  // Follows
  await prisma.follow.createMany({
    data: [
      { followerId: bob.id, followingId: alice.id },
      { followerId: charlie.id, followingId: alice.id },
      { followerId: alice.id, followingId: bob.id },
    ],
  });

  // Notifications
  await prisma.notification.createMany({
    data: [
      { userId: alice.id, title: 'Welcome! 👋', message: 'Welcome to FlashMob Connect. Explore events in your area.', type: 'INFO', read: false },
      { userId: alice.id, title: 'New Follower! 👤', message: 'Bob Miller followed you.', type: 'INFO', read: false },
      { userId: bob.id, title: 'Event reminder ⏰', message: 'Bohemian Rhapsody Choir Flashmob is in 5 days!', type: 'INFO', read: false },
    ],
  });

  // Event Views
  await prisma.eventView.createMany({
    data: [
      { eventId: event1.id, viewedAt: new Date(Date.now() - 1000 * 60 * 30) },
      { eventId: event1.id, viewedAt: new Date(Date.now() - 1000 * 60 * 5) },
      { eventId: event2.id, viewedAt: new Date() },
      { eventId: event3.id, viewedAt: new Date() },
      { eventId: event4.id, viewedAt: new Date() },
    ],
  });

  // Create a pending report for admin moderation
  await prisma.report.create({
    data: {
      userId: bob.id,
      eventId: event4.id,
      reason: 'Inappropriate content',
      description: 'Pillow fights in public plazas might violate local permit bylaws. Need moderator check.',
      status: 'PENDING',
    },
  });

  console.log('Created participant, bookmark, comment, follow, like, view, and notification links.');
  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
