import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query'] : [],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Helper function to check database connection
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}

// Helper function to initialize database with sample data
export async function initializeDatabase(): Promise<void> {
  try {
    // Check if we already have data
    const clientCount = await prisma.client.count();
    
    if (clientCount === 0) {
      console.log('🔄 Initializing database with sample data...');
      
      // Create sample settings
      await prisma.appSettings.create({
        data: {
          businessName: "Fashion CMS",
          businessStreet: "123 Fashion Street",
          businessCity: "New York",
          businessState: "NY",
          businessZipCode: "10001",
          businessCountry: "USA",
          businessPhone: "+1 (555) 123-4567",
          businessEmail: "info@fashioncms.com",
          businessWebsite: "https://fashioncms.com",
          currency: "USD",
          timezone: "America/New_York",
          taxRate: 8.5,
          invoicePrefix: "INV",
          invoiceNextNumber: 1,
          invoiceDueInDays: 30,
          fromEmail: "noreply@fashioncms.com",
          fromName: "Fashion CMS System",
        },
      });

      // Create sample services
      const services = await Promise.all([
        prisma.service.create({
          data: {
            name: "Custom Dress Design",
            description: "Complete custom dress design and creation service",
            category: "custom_couture",
            basePrice: 500.00,
            duration: 240, // 4 hours
            requirements: JSON.stringify(["measurements", "fabric_selection", "consultation"])
          }
        }),
        prisma.service.create({
          data: {
            name: "Dress Alteration",
            description: "Professional dress alteration and fitting service",
            category: "alterations",
            basePrice: 75.00,
            duration: 90, // 1.5 hours
            requirements: JSON.stringify(["garment", "fitting_appointment"])
          }
        }),
        prisma.service.create({
          data: {
            name: "Consultation",
            description: "Style consultation and design planning session",
            category: "consultation",
            basePrice: 100.00,
            duration: 60, // 1 hour
            requirements: JSON.stringify(["appointment"])
          }
        })
      ]);

      // Create sample client
      const sampleClient = await prisma.client.create({
        data: {
          firstName: "Sarah",
          lastName: "Johnson",
          email: "sarah.johnson@example.com",
          phone: "+1 (555) 987-6543",
          streetAddress: "456 Client Avenue",
          city: "Los Angeles",
          state: "CA",
          zipCode: "90210",
          country: "USA",
          ageBracket: "26_35",
          dateJoined: new Date(),
          skinColor: "fair",
          ukSize: "12",
          colorShades: JSON.stringify(["blue", "green", "purple"]),
          refashioning: JSON.stringify({
            selectedTypes: ["sleeve", "neckline"],
            notes: "Prefers modern classic styles"
          }),
          embellishments: JSON.stringify({
            selectedTypes: ["beads"],
            notes: "Minimal embellishments preferred"
          }),
          notes: "VIP client - prefers appointments on weekends",
          preferredContactMethod: "email",
          status: "vip"
        }
      });

      console.log('✅ Sample data created successfully');
    } else {
      console.log('📊 Database already contains data, skipping initialization');
    }
  } catch (error) {
    console.error('❌ Failed to initialize database:', error);
    throw error;
  }
}

export default prisma;