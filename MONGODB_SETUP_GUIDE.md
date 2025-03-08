# MongoDB Local Setup Guide

This guide will help you set up a local MongoDB database for the BankLoan project.

## 1. Install MongoDB Community Edition

### For macOS:

#### Using Homebrew (recommended):
```bash
# Install Homebrew if you don't have it
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install MongoDB
brew tap mongodb/brew
brew install mongodb-community@7.0
```

#### Start MongoDB service:
```bash
brew services start mongodb-community@7.0
```

### For Windows:
1. Download the MongoDB Community Server from [MongoDB Download Center](https://www.mongodb.com/try/download/community)
2. Run the installer and follow the installation wizard
3. Choose "Complete" installation
4. Install MongoDB Compass (GUI tool) when prompted
5. Start MongoDB service from Services or run:
   ```
   net start MongoDB
   ```

### For Linux (Ubuntu):
```bash
# Import MongoDB public GPG key
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -

# Create a list file for MongoDB
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu $(lsb_release -cs)/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Update package database
sudo apt-get update

# Install MongoDB
sudo apt-get install -y mongodb-org

# Start MongoDB service
sudo systemctl start mongod

# Enable MongoDB to start on boot
sudo systemctl enable mongod
```

## 2. Verify MongoDB Installation

```bash
# Check if MongoDB is running
mongosh --eval "db.runCommand({ connectionStatus: 1 })"
```

You should see output indicating that the connection is successful.

## 3. Create a Database for the Project

```bash
# Connect to MongoDB shell
mongosh

# Create and use the bankloan database
use bankloan

# Create a test document to initialize the database
db.test.insertOne({ name: "Test Document" })

# Verify the document was created
db.test.find()

# Exit the MongoDB shell
exit
```

## 4. Update Environment Variables

Make sure your `.env.local` file contains the correct MongoDB connection string:

```
DATABASE_URL="mongodb://localhost:27017/bankloan"
```

## 5. Generate Prisma Client

After setting up MongoDB, generate the Prisma client to work with your MongoDB database:

```bash
npx prisma generate
```

## 6. Start Your Application

```bash
npm run dev
```

## 7. MongoDB Compass (GUI Tool)

MongoDB Compass is a graphical user interface for MongoDB that makes it easy to explore and manipulate your data.

1. If you didn't install it during MongoDB installation, download it from [MongoDB Compass Download](https://www.mongodb.com/try/download/compass)
2. Install and open MongoDB Compass
3. Connect to your local MongoDB instance using the connection string: `mongodb://localhost:27017`
4. You should see your `bankloan` database in the list

## 8. Troubleshooting

### MongoDB Service Not Starting

#### macOS:
```bash
# Check MongoDB logs
cat /usr/local/var/log/mongodb/mongo.log

# Restart MongoDB service
brew services restart mongodb-community@7.0
```

#### Windows:
```
# Check MongoDB logs
type "C:\Program Files\MongoDB\Server\7.0\log\mongod.log"

# Restart MongoDB service
net stop MongoDB
net start MongoDB
```

#### Linux:
```bash
# Check MongoDB logs
sudo cat /var/log/mongodb/mongod.log

# Restart MongoDB service
sudo systemctl restart mongod
```

### Connection Issues

If you're having trouble connecting to MongoDB, make sure:

1. The MongoDB service is running
2. The connection string in `.env.local` is correct
3. No firewall is blocking the MongoDB port (27017)
4. You have appropriate permissions to access the database

## 9. Data Migration (Optional)

If you need to migrate data from PostgreSQL to MongoDB, you can use a script like this:

```javascript
// scripts/migrate-to-mongodb.js
const { PrismaClient: PgPrisma } = require('@prisma/client');
const { MongoClient } = require('mongodb');

async function migrate() {
  // Connect to PostgreSQL
  const pgPrisma = new PgPrisma({
    datasource: { url: process.env.PG_DATABASE_URL }
  });

  // Connect to MongoDB
  const mongoClient = new MongoClient(process.env.DATABASE_URL);
  await mongoClient.connect();
  const db = mongoClient.db('bankloan');

  // Migrate applications
  const applications = await pgPrisma.application.findMany();
  if (applications.length > 0) {
    await db.collection('applications').insertMany(applications);
  }

  // Migrate other collections...

  // Close connections
  await pgPrisma.$disconnect();
  await mongoClient.close();
  
  console.log('Migration completed successfully');
}

migrate().catch(console.error);
```

Run the migration script with:
```bash
node scripts/migrate-to-mongodb.js
```

## 10. Next Steps

Now that you have MongoDB set up locally, you can:

1. Explore your database using MongoDB Compass
2. Run your application with `npm run dev`
3. Test the server actions with MongoDB
4. Create and manage data through your application

For more information, refer to the [MongoDB Documentation](https://docs.mongodb.com/) and [Prisma with MongoDB Documentation](https://www.prisma.io/docs/orm/overview/databases/mongodb). 