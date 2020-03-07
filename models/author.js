const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const AuthorSchema = new Schema(
    {
      name: {type: String, required: true, max: 100},
      personal_profile: {type: String, required: true, max: 500},
      password: {type: String, required: true, max: 100},
      identity: {type: String, required: true, enum:['管理员','访客'], default:'访客'},
    }
  );

AuthorSchema
  .virtual('url')
  .get(function () {
    return '/catalog/author/' + this._id;
  });

module.exports = mongoose.model('Author', AuthorSchema);