const Author = require('../models/author');
const Article = require('../models/article');
const Genre = require('../models/genre');

const async = require('async');

const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

// 显示完整的类型列表
exports.genre_list = (req, res) => { 
    Genre.find()
    .sort([['name']])//排序方法
    .exec(function (err, list_genres) {
      if (err) { return next(err); }
      res.render('genre_list', { title: '类型列表', genre_list: list_genres });
    });
};

// 为每位类型显示详细信息的页面
exports.genre_detail = (req, res) => { 
    async.parallel({
        genre: callback =>{
            //用这个书本id，把书本实例找出来，并且解析其中的genre和genre
            Genre.findById(req.params.id)
              .exec(callback);
        },
        articles: callback => {
            Article.find({ 'genre': req.params.id }).populate('author')
            .exec(callback);
        },
      }, (err, results) => {
        if (err) { return next(err); }
        if (results.genre==null) { // No results.
            let err = new Error('没有找到这本书');
            err.status = 404;
            return next(err);
        }
        res.render('genre_detail', { title: '类型详情', genre: results.genre, article_list: results.articles } );
        //把找到的书实例、找到的 书副本 实例，回传给那个模板，用article和article_instances参数    
    });
}

// 由 GET 显示创建类型的表单
exports.genre_create_get = (req, res) => { 
    res.render('genre_form', { title: '创建类型前需确认身份',fine:false});
};

// 由 POST 处理类型创建操作
// 需要验证身份
  //修改页面
exports.genre_create_post = 
(req, res, next) => {

    async.parallel({
      guanliyuan: (callback) =>{
        Author.find({'identity': '管理员'}).exec(callback)
      }
    }, function(err, results) {
      if(req.body.name==null){
        if (err) { return next(err); }
        let c=true;
        if(!(results.guanliyuan instanceof Array)){
        if(typeof results.guanliyuan==='undefined')
        results.guanliyuan=[];
        else
        results.guanliyuan=new Array(results.guanliyuan);
        }
        for(let i=0;i<results.guanliyuan.length;i++){
        if (req.body.v_password==results.guanliyuan[i].password)c=false;
        }
        if (c == true) {//密码错误
          res.render('genre_form', { title: '创建类型前需确认身份', fine: false, input_err:'密码错误' } );
          return;
        }
        else {
          res.render('genre_form',{title:'创建类型',fine:true})
        }
      }else{
        //已经在编辑那个表单了
        let genre = new Genre({
          name: req.body.name,
        });
        genre.save(function (err) {
          if (err) { return next(err); }
          res.redirect(genre.url);
          //保存完成
        })
      }
    }
    );
  }


// 由 GET 显示删除类型的表单
exports.genre_delete_get = (req, res, next) => {
  async.parallel({
    genre: (callback) => {
      Genre.findById(req.params.id).exec(callback)
    },
    genre_articles: (callback) => {
      Article.find({ 'genre': req.params.id }).populate('author')
      .exec(callback)
    },
  }, (err, results) => {
    if (err) { return next(err); }
    if (results.genre==null) {
        res.redirect('/catalog/genres');
    }
    res.render('genre_delete', { title: '删除类型', genre: results.genre, genre_articles: results.genre_articles } );
  });
};


// 由 POST 处理类型删除操作
exports.genre_delete_post = (req, res, next) => {
  async.parallel({
    genre: function(callback) {
      Genre.findById(req.body.genreid).exec(callback)
    },
    genre_articles: function(callback) {
      Article.find({ 'genre': req.body.genreid }).populate('author')
      .exec(callback)
    },
    guanliyuan: (callback) =>{
      Author.find({'identity': '管理员'}).exec(callback)
    }
  }, function(err, results) {
    if (err) { return next(err); }
    let c=true;
    if(!(results.guanliyuan instanceof Array)){
      if(typeof results.guanliyuan==='undefined')
      results.guanliyuan=[];
      else
      results.guanliyuan=new Array(results.guanliyuan);
    }
    for(let i=0;i<results.guanliyuan.length;i++){
      if (req.body.password==results.guanliyuan[i].password)c=false;
    }
    if (results.genre_articles.length > 0 
      || c == true) {
      res.render('genre_delete', { title: '删除类型', genre: results.genre, genre_articles: results.genre_articles, input_err: "口令错误或仍有文章" } );
      return;
    }
    else {
      Genre.findByIdAndRemove(req.body.genreid, err => {
        if (err) { return next(err); }
        res.redirect('/catalog/genres')
      })
    }
  });
};


// 由 GET 显示更新类型的表单
exports.genre_update_get = (req, res, next) => {
  Genre.findById(req.params.id).exec((err, genre)=>{
    if(err){ return next(err); }
    if(genre==null){
      let err= new Error("类型没找到");
      err.status=404;
      return next(err);
    }
    res.render('genre_form',{title:'更改信息前确认身份',fine:false});
  });
};

// 由 POST 处理类型更新操作
exports.genre_update_post = (req, res,next) => {
  if(req.body.name==undefined){//口令确认完毕之前
    async.parallel(
      {
        genre:(callback)=>{
          Genre.findById(req.params.id).exec(callback);
        },
        guanliyuan:(callback)=>{
          Author.find({'identity':'管理员'}).exec(callback);
        }
      },(err,results)=>{
        if (err) { return next(err); }
        let c=true;
        //管理员数组化
        if(!(results.guanliyuan instanceof Array)){
          if(typeof results.guanliyuan==='undefined')
          results.guanliyuan=[];
          else
          results.guanliyuan=new Array(results.guanliyuan);
        }
        //验证是否是管理员口令
        for(let i=0;i<results.guanliyuan.length;i++){
          if (req.body.v_password==results.guanliyuan[i].password)c=false;
        }
        //密码错误
        if(c == true) {
          res.render('genre_form', { title: '更改信息前确认身份', fine: false, errors: "口令错误" } );
          return;
        }//密码正确
        else {
          res.render('genre_form',{title:'更改类型信息', fine: true, genre: results.genre});
        }
      }
      );
    }else{//已经确认身份，正式开始更改
    body('name').isLength({ min: 1 }).trim().withMessage('名字必须具体说明。');
    sanitizeBody('name').trim().escape();
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render('genre_form', { title: '更改类型信息', fine: true, genre: req.body.genre, errors: errors.array() });
      return;
    }
    else {
      let genre = new Genre({
        name: req.body.name,
        _id: req.params.id
      });
      Genre.findByIdAndUpdate(req.params.id, genre, {}, function (err,thegenre) {
        if (err) { return next(err); }
        // Successful - redirect to book detail page.
        res.redirect(thegenre.url);
      });
  }
  }

};
