// ValoleakCompetCards-model.js - A mongoose model
// 
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
module.exports = function (app) {
  const modelName = 'valoleakCompetCards';
  const mongooseClient = app.get('mongooseClient');
  const { Schema } = mongooseClient;
  const schema = new Schema({
    userId: String,
    userInfo: {
      displayName: String
    },
    matches: [{
      id: String,
      map: String,
      startTime: Number,
      move: String,

      promoted: Boolean,
      demoted: Boolean,
      rankChanged: Boolean,

      tier: Number,
      before: Number,
      after: Number,

      ranked: Boolean,
      tierProgress: String,
      isUp: Boolean
    }],
    noRanked: Boolean,
    lastMatch: {
      MatchID: String,
      MapID: String,
      MatchStartTime: Number,
      TierAfterUpdate: Number,
      TierBeforeUpdate: Number,
      TierProgressAfterUpdate: Number,
      TierProgressBeforeUpdate: Number,
      RankedRatingEarned: Number,
      CompetitiveMovement: String
    }
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
