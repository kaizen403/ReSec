const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const pathModule = require('path');
const fs = require('fs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

 console.log('🧹 Resetting existing data...');
 await prisma.$transaction([
    prisma.orderItem.deleteMany(),
    prisma.order.deleteMany(),
    prisma.review.deleteMany(),
    prisma.wishlistItem.deleteMany(),
    prisma.adminSecret.deleteMany(),
    prisma.product.deleteMany(),
    prisma.user.deleteMany()
  ]);
  console.log('✓ Cleared tables');

  // Create admin user with flag in secretNote
  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  const adminUser = await prisma.user.create({
    data: {
      username: 'admin',
      email: 'admin@shopsmart.com',
      passwordHash: adminPasswordHash,
      role: 'admin',
      displayName: 'Administrator',
      secretNote: `PCTFS{${uuidv4()}}` // IDOR FLAG
    }
  });
  console.log('✓ Created admin user');

  // Create regular users
  const regularPasswordHash = await bcrypt.hash('password123', 10);
  const user1 = await prisma.user.create({
    data: {
      username: 'johndoe',
      email: 'john@example.com',
      passwordHash: regularPasswordHash,
      role: 'user',
      displayName: 'John Doe'
    }
  });

  const user2 = await prisma.user.create({
    data: {
      username: 'janedoe',
      email: 'jane@example.com',
      passwordHash: regularPasswordHash,
      role: 'user',
      displayName: 'Jane Doe'
    }
  });
  console.log('✓ Created regular users');
  const productsFile = pathModule.join(__dirname, 'seed-data', 'products.json');
  const products = JSON.parse(fs.readFileSync(productsFile, 'utf8'));

  const createdProducts = [];
  for (const product of products) {
    const created = await prisma.product.create({
      data: product
    });
    createdProducts.push(created);
  }
  console.log('✓ Created products');

  // Create admin order with flag in giftNote
  const adminOrder = await prisma.order.create({
    data: {
      userId: adminUser.id,
      status: 'delivered',
      totalCents: 39998,
      giftNote: `PCTFS{${uuidv4()}}`, // IDOR FLAG
      items: {
        create: [
          { productId: createdProducts[0].id, qty: 2, priceCents: createdProducts[0].priceCents },
          { productId: createdProducts[1].id, qty: 1, priceCents: createdProducts[1].priceCents }
        ]
      }
    }
  });
  console.log('✓ Created admin order with flag');

  // Create regular orders
  await prisma.order.create({
    data: {
      userId: user1.id,
      status: 'shipped',
      totalCents: 12998,
      items: {
        create: [
          { productId: createdProducts[2].id, qty: 1, priceCents: createdProducts[2].priceCents },
          { productId: createdProducts[3].id, qty: 1, priceCents: createdProducts[3].priceCents }
        ]
      }
    }
  });

  await prisma.order.create({
    data: {
      userId: user2.id,
      status: 'pending',
      totalCents: 7999,
      items: {
        create: [
          { productId: createdProducts[6].id, qty: 1, priceCents: createdProducts[6].priceCents }
        ]
      }
    }
  });
  console.log('✓ Created user orders');

  // Create admin secret with SQLi flag
  const sqliFlagValue = `PCTFS{${uuidv4()}}`;
  await prisma.adminSecret.create({
    data: {
      key: 'sqli_flag',
      value: sqliFlagValue
    }
  });
  console.log('✓ Created admin secret with SQLi flag');

  // Create some reviews
  await prisma.review.createMany({
    data: [
      {
        userId: user1.id,
        productId: createdProducts[0].id,
        rating: 5,
        text: 'Excellent product! Highly recommended.'
      },
      {
        userId: user2.id,
        productId: createdProducts[1].id,
        rating: 4,
        text: 'Good quality, fast shipping.'
      },
      {
        userId: user1.id,
        productId: createdProducts[2].id,
        rating: 5,
        text: 'Perfect for my setup!'
      }
    ]
  });
  console.log('✓ Created reviews');

  // Create wishlist items
  await prisma.wishlistItem.createMany({
    data: [
      { userId: user1.id, productId: createdProducts[5].id },
      { userId: user1.id, productId: createdProducts[8].id },
      { userId: user2.id, productId: createdProducts[0].id }
    ]
  });
  console.log('✓ Created wishlist items');

  console.log('✅ Database seeded successfully!');
  console.log('\n📝 Test Credentials:');
  console.log('Admin: admin@shopsmart.com / admin123');
  console.log('User: john@example.com / password123');
  console.log('User: jane@example.com / password123');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
