const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create a test user
  const hashedPassword = await bcrypt.hash('password123', 12)
  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      passwordHash: hashedPassword,
      plan: 'FREE'
    }
  })

  console.log('✅ Created user:', user)

  // Create some test API keys
  const testKeys = [
    {
      userId: user.id,
      name: 'Clé de test 1',
      prefix: 'pk_test',
      last4: 'abcd',
      encCiphertext: Buffer.from('encrypted_data_1'),
      encNonce: Buffer.from('nonce1'),
      hash: 'hash1'
    },
    {
      userId: user.id,
      name: 'Clé de test 2',
      prefix: 'sk_test',
      last4: 'efgh',
      encCiphertext: Buffer.from('encrypted_data_2'),
      encNonce: Buffer.from('nonce2'),
      hash: 'hash2'
    }
  ]

  for (const key of testKeys) {
    await prisma.apiKey.create({
      data: key
    })
  }

  console.log('✅ Created API keys:', testKeys)

  console.log('🎉 Seeding complete!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
