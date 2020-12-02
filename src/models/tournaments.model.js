const crypto = require('crypto')

// tournaments-model.js - A mongoose model
// 
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
module.exports = function (app) {
  const modelName = 'tournaments';
  const mongooseClient = app.get('mongooseClient');
  const { Schema } = mongooseClient;
  const schema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },

    ended: { type: Boolean, default: () => false },
    joinable: { type: Boolean, default: () => false },

    code: { type: String, unique: true, default: () => crypto.randomBytes(4).toString('hex') },

    home: {
      user: { type: Schema.Types.ObjectId, ref: 'users' },
      score: { type: String }
    },

    away: {
      user: { type: Schema.Types.ObjectId, ref: 'users' },
      score: { type: String }
    },

    winner: { type: String }
  }, {
    timestamps: true
  });

  // This is necessary to avoid model compilation errors in watch mode
  // see https://mongoosejs.com/docs/api/connection.html#connection_Connection-deleteModel
  if (mongooseClient.modelNames().includes(modelName)) {
    mongooseClient.deleteModel(modelName);
  }
  return mongooseClient.model(modelName, schema);
  
};
