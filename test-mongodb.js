const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://sportograf:sportograf@cluster0.luj7tfc.mongodb.net/?retryWrites=true&w=majority";

async function testConnection() {
  try {
    const client = new MongoClient(uri);
    console.log('Connecting to MongoDB...');
    
    await client.connect();
    console.log('✅ Connected successfully!');
    
    // List databases
    const admin = client.db().admin();
    const databases = await admin.listDatabases();
    console.log('Available databases:', databases.databases.map(db => db.name));
    
    // Test creating a document
    const testDb = client.db('crew-events');
    const testCollection = testDb.collection('test');
    
    const result = await testCollection.insertOne({ message: 'Hello MongoDB!', timestamp: new Date() });
    console.log('✅ Inserted test document:', result.insertedId);
    
    // Clean up
    await testCollection.deleteOne({ _id: result.insertedId });
    console.log('✅ Cleaned up test document');
    
    await client.close();
    console.log('✅ Connection test completed successfully!');
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('Full error:', error);
  }
}

testConnection();
