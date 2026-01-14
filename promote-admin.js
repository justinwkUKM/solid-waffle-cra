const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const email = process.argv[2];
    if (!email) {
        console.log('Please provide an email address');
        return;
    }

    try {
        const user = await prisma.user.update({
            where: { email: email },
            data: { role: 'ADMIN' },
        });
        console.log(`User ${email} promoted to ADMIN`);
    } catch (e) {
        console.error('Error updating user:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
