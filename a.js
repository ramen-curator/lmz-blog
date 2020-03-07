const userArgs = process.argv.slice(2);
if (!userArgs[0].startsWith('mongodb://')) {
  console.log('错误：需要指定一个合法的 MongoDB URL 作为第一个参数。');
  return;
}
const async         = require('async');
const Author        = require('./models/author');
const Article        = require('./models/article');

const mongoose      = require('mongoose');
const mongoDB       = userArgs[0];
mongoose.connect(mongoDB);
mongoose.Promise    = global.Promise;

const db            = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB 连接错误：'));
const authors       = [];
const articles      = [];

function authorCreate(name1, personal_profile1, password1, identity1, cb) {
    const author = new Author({
      name               : name1,
      personal_profile   : personal_profile1,
      password           : password1,
      identity           : identity1
    });
       
    author.save( err => {
      if (err) {
        cb(err, null);
        return;
      }
      console.log('新建作者：' + author);
      authors.push(author);
      cb(null, author);
    });
}
function articleCreate(title1, content1, author1, cb) {
    const article = new Article({
      title               : title1,
      content             : content1,
      author              : author1,
    });
       
    article.save( err => {
      if (err) {
        cb(err, null);
        return;
      }
      console.log('新建文章：' + article);
      articles.push(article);
      cb(null, article);
    });
}
function createAuthors(cb) {
    async.parallel([
      callback => authorCreate('赖铭志','搭建了这个博客的人','a12345','管理员', callback),
      callback => authorCreate('小明','测试这个博客的虚拟人物','abc','访客', callback)
    ], cb); // 可选回调
}
function createArticles(cb) {
    async.parallel([
      callback => articleCreate('测试用例1','如题所示，这是管理员的测试',authors[0], callback),
      callback => articleCreate('测试用例2','如题所示，这是访客的测试',authors[1], callback)
    ], cb); // 可选回调
}
async.series (
    [
      createAuthors,
      createArticles
    ],
    // 可选回调
    (err, results) => {
      console.log(
        err ?
        '最终错误：' + err :
        '文章：' + articles
      );
      // 操作完成，断开数据库连接
      db.close();
    }
  );