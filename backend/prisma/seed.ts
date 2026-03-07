import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create demo organization
  const organization = await prisma.organization.create({
    data: {
      name: 'Demo Business',
      slug: 'demo-business',
      plan: 'PROFESSIONAL',
    },
  });

  console.log('✅ Created organization:', organization.name);

  // Create admin user
  const hashedPassword = await bcrypt.hash('@9010Admin', 10);
  
  const adminUser = await prisma.user.create({
    data: {
      email: 'kryrosmobile@gmail.com',
      password: hashedPassword,
      name: 'Kryros Admin',
      role: 'ADMIN',
      organizationId: organization.id,
    },
  });

  console.log('✅ Created admin user:', adminUser.email);

  // Create business profile
  const businessProfile = await prisma.businessProfile.create({
    data: {
      organizationId: organization.id,
      businessName: 'Demo Business',
      businessEmail: 'contact@demobusiness.com',
      businessPhone: '+1234567890',
      website: 'https://demobusiness.com',
      description: 'A demo business for testing the omnichannel inbox',
      timezone: 'America/New_York',
      defaultAutoReply: 'Thanks for reaching out! We\'ll get back to you shortly.',
    },
  });

  console.log('✅ Created business profile');

  // Create business hours
  const businessHours = await prisma.businessHours.createMany({
    data: [
      { organizationId: organization.id, dayOfWeek: 0, isOpen: false },
      { organizationId: organization.id, dayOfWeek: 1, isOpen: true, openTime: '09:00', closeTime: '17:00' },
      { organizationId: organization.id, dayOfWeek: 2, isOpen: true, openTime: '09:00', closeTime: '17:00' },
      { organizationId: organization.id, dayOfWeek: 3, isOpen: true, openTime: '09:00', closeTime: '17:00' },
      { organizationId: organization.id, dayOfWeek: 4, isOpen: true, openTime: '09:00', closeTime: '17:00' },
      { organizationId: organization.id, dayOfWeek: 5, isOpen: true, openTime: '09:00', closeTime: '17:00' },
      { organizationId: organization.id, dayOfWeek: 6, isOpen: false },
    ],
  });

  console.log('✅ Created business hours');

  // Create demo contacts
  const contacts = await Promise.all([
    prisma.contact.create({
      data: {
        organizationId: organization.id,
        platform: 'WHATSAPP',
        platformId: '1234567890',
        name: 'John Doe',
        status: 'LEAD',
        source: 'DIRECT',
        notes: 'Interested in our product',
        tags: ['hot-lead', 'pricing'],
      },
    }),
    prisma.contact.create({
      data: {
        organizationId: organization.id,
        platform: 'INSTAGRAM',
        platformId: 'insta_user_1',
        name: 'Jane Smith',
        status: 'QUALIFIED',
        source: 'DIRECT',
        notes: 'Long-term customer',
        tags: ['customer', 'vip'],
      },
    }),
    prisma.contact.create({
      data: {
        organizationId: organization.id,
        platform: 'FACEBOOK',
        platformId: 'fb_user_123',
        name: 'Bob Johnson',
        status: 'NEW',
        source: 'AD',
        notes: 'Clicked on Facebook ad',
        tags: ['lead', 'facebook'],
      },
    }),
  ]);

  console.log('✅ Created demo contacts');

  // Create conversations and messages
  const conversations = await Promise.all([
    prisma.conversation.create({
      data: {
        organizationId: organization.id,
        contactId: contacts[0].id,
        platform: 'WHATSAPP',
        status: 'OPEN',
        priority: 'HIGH',
        lastMessageAt: new Date(),
      },
    }),
    prisma.conversation.create({
      data: {
        organizationId: organization.id,
        contactId: contacts[1].id,
        platform: 'INSTAGRAM',
        status: 'PENDING',
        lastMessageAt: new Date(Date.now() - 3600000),
      },
    }),
    prisma.conversation.create({
      data: {
        organizationId: organization.id,
        contactId: contacts[2].id,
        platform: 'FACEBOOK',
        status: 'OPEN',
        priority: 'NORMAL',
        lastMessageAt: new Date(Date.now() - 7200000),
      },
    }),
  ]);

  console.log('✅ Created demo conversations');

  // Create messages
  await Promise.all([
    // WhatsApp conversation messages
    prisma.message.create({
      data: {
        organizationId: organization.id,
        conversationId: conversations[0].id,
        contactId: contacts[0].id,
        content: 'Hi, I\'m interested in your product!',
        direction: 'INBOUND',
        status: 'READ',
        createdAt: new Date(Date.now() - 300000),
      },
    }),
    prisma.message.create({
      data: {
        organizationId: organization.id,
        conversationId: conversations[0].id,
        senderId: adminUser.id,
        content: 'Thanks for reaching out! I\'d be happy to help. What specifically are you looking for?',
        direction: 'OUTBOUND',
        status: 'DELIVERED',
        createdAt: new Date(Date.now() - 240000),
      },
    }),
    // Instagram conversation messages
    prisma.message.create({
      data: {
        organizationId: organization.id,
        conversationId: conversations[1].id,
        contactId: contacts[1].id,
        content: 'Thanks for your help!',
        direction: 'INBOUND',
        status: 'READ',
        createdAt: new Date(Date.now() - 3600000),
      },
    }),
    // Facebook conversation messages
    prisma.message.create({
      data: {
        organizationId: organization.id,
        conversationId: conversations[2].id,
        contactId: contacts[2].id,
        content: 'What are your pricing options?',
        direction: 'INBOUND',
        status: 'READ',
        createdAt: new Date(Date.now() - 7200000),
      },
    }),
  ]);

  console.log('✅ Created demo messages');

  // Create automations
  await Promise.all([
    prisma.automation.create({
      data: {
        organizationId: organization.id,
        name: 'Auto-reply to first message',
        description: 'Send welcome message to new contacts',
        trigger: 'FIRST_MESSAGE',
        action: 'SEND_REPLY',
        replyContent: '👋 Hi! Thanks for reaching out. We\'ll get back to you as soon as possible!',
        isActive: true,
        priority: 1,
      },
    }),
    prisma.automation.create({
      data: {
        organizationId: organization.id,
        name: 'Outside business hours',
        description: 'Send auto-reply when closed',
        trigger: 'OUTSIDE_BUSINESS_HOURS',
        action: 'SEND_REPLY',
        replyContent: 'Thanks for your message! Our business hours are Monday-Friday, 9 AM - 5 PM EST. We\'ll respond to you shortly.',
        isActive: true,
        priority: 0,
      },
    }),
    prisma.automation.create({
      data: {
        organizationId: organization.id,
        name: 'Qualify new leads',
        description: 'Add hot lead tag when contact mentions "interested"',
        trigger: 'KEYWORD_MATCH',
        conditions: [{ type: 'KEYWORD', operator: 'CONTAINS', value: 'interested' }],
        action: 'ADD_TAG',
        actionData: { tag: 'hot-lead' },
        isActive: true,
        priority: 2,
      },
    }),
  ]);

  console.log('✅ Created demo automations');

  // Create follow-ups
  await Promise.all([
    prisma.followUp.create({
      data: {
        organizationId: organization.id,
        contactId: contacts[0].id,
        type: 'SCHEDULED',
        scheduledAt: new Date(Date.now() + 86400000), // Tomorrow
        message: 'Follow up on product inquiry',
        status: 'PENDING',
      },
    }),
    prisma.followUp.create({
      data: {
        organizationId: organization.id,
        contactId: contacts[2].id,
        type: 'MANUAL',
        scheduledAt: new Date(Date.now() + 172800000), // Day after tomorrow
        message: 'Send pricing information',
        status: 'PENDING',
      },
    }),
  ]);

  console.log('✅ Created demo follow-ups');

  // Create platform connections (mocked - not connected)
  await Promise.all([
    prisma.platformConnection.create({
      data: {
        organizationId: organization.id,
        platform: 'WHATSAPP',
        status: 'DISCONNECTED',
        displayName: 'WhatsApp Business',
      },
    }),
    prisma.platformConnection.create({
      data: {
        organizationId: organization.id,
        platform: 'INSTAGRAM',
        status: 'DISCONNECTED',
        displayName: 'Instagram Business',
      },
    }),
    prisma.platformConnection.create({
      data: {
        organizationId: organization.id,
        platform: 'FACEBOOK',
        status: 'DISCONNECTED',
        displayName: 'Facebook Page',
      },
    }),
  ]);

  console.log('✅ Created platform connections');

  console.log('\n🎉 Demo data seeded successfully!');
  console.log('\n📧 Login credentials:');
  console.log('   Email: admin@demo.com');
  console.log('   Password: demo123');
  console.log('\n🔗 API URL: http://localhost:3001');
  console.log('   Docs: http://localhost:3001/api/docs');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
