const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ArticleSchema = new Schema(
    {
      title: {type: String, required: true, max: 100},
      content: {type: String, required: true},
      author: {type: Schema.Types.ObjectId,ref:'Author', required: true},
      summary: {type:String,max:100},
      genre:[{type:Schema.Types.ObjectId, ref:'Genre'}]
    }
  );

ArticleSchema
  .virtual('url')
  .get(function () {
    return '/catalog/article/' + this._id;
  });

module.exports = mongoose.model('Article', ArticleSchema);