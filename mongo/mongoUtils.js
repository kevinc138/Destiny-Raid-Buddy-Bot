const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = process.env.MONGO_URI;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

var _db;

module.exports = {

  connectToServer: async function() {
    await client.connect();
    _db = await client.db("drb");
    console.log("Connected to the database.");
  },

  getDb: function() {
    return _db;
  }
};