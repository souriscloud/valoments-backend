// Match-model.js - A mongoose model
// 
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
module.exports = function (app) {
  const modelName = 'match';
  const mongooseClient = app.get('mongooseClient');
  const { Schema } = mongooseClient;
  const matchTeam = {
    team: { type: Schema.Types.ObjectId, ref: 'team' },
    score: { type: Number, required: true, default: () => 0 }
  }
  const schema = new Schema({
    home: matchTeam,
    away: matchTeam,
    plannedOn: { type: Date, required: true, default: () => Date.now() },
    playedOn: { type: Date, required: false }
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
