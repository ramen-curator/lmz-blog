const Author = require('../models/author');
const Article = require('../models/article');

const async = require('async');

const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

// 显示完整的作者列表
exports.author_list = (req, res) => { 
    Author.find()
    .sort([['name']])
    .exec(function (err, list_authors) {
      if (err) { return next(err); }
      res.render('author_list', { title: '作者列表', author_list: list_authors });
    });
};

// 为每位作者显示详细信息的页面
exports.author_detail = (req, res) => { 
    async.parallel({
        author: callback =>{
            //用这个书本id，把书本实例找出来，并且解析其中的author和genre
            Author.findById(req.params.id)
              .exec(callback);
        },
        articles: callback => {
            Article.find({ 'author': req.params.id })
            .exec(callback);
        },
      }, (err, results) => {
        if (err) { return next(err); }
        if (results.author==null) { // No results.
            let err = new Error('没有找到这本书');
            err.status = 404;
            return next(err);
        }
        res.render('author_detail', { title: '作者详情', author: results.author, article_list: results.articles } );
        //把找到的书实例、找到的 书副本 实例，回传给那个模板，用article和article_instances参数    
    });
}

// 由 GET 显示创建作者的表单
exports.author_create_get = (req, res) => { 
    res.render('author_form', { title: '创建作者'});
};

// 由 POST 处理作者创建操作
exports.author_create_post = [
    body('name').isLength({ min: 1 }).trim().withMessage('名字必须具体说明。'),
    body('personal_profile').isLength({ min: 1 }).trim().withMessage('个人简介必须具体说明。'),
    sanitizeBody('name').trim().escape(),
    sanitizeBody('personal_profile').trim().escape(),
    sanitizeBody('password').trim().escape(),
    sanitizeBody('special_identity').trim().escape(),
    (req, res, next) => {
      let errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.render('author_form', { title: '创建作者', author: req.body, errors: errors.array() });
        return;
      }
      else {
        let identity_h;
        if(req.body.special_password=='管理员')
        {
          identity_h='管理员';
        }else{
          identity_h='访客';
        }
        let author = new Author({
          name: req.body.name,
          personal_profile: req.body.personal_profile,
          password: req.body.password,
          identity: identity_h
        });
        author.save(function (err) {
          if (err) { return next(err); }
          res.redirect(author.url);
        })
    }
  }]

// 由 GET 显示删除作者的表单
exports.author_delete_get = (req, res, next) => {
  async.parallel({
    author: (callback) => {
      Author.findById(req.params.id).exec(callback)
    },
    author_articles: (callback) => {
      Article.find({ 'author': req.params.id }).exec(callback)
    },
  }, (err, results) => {
    if (err) { return next(err); }
    if (results.author==null) {
        res.redirect('/catalog/authors');
    }
    res.render('author_delete', { title: '删除作者', author: results.author, author_articles: results.author_articles } );
  });
};
// 由 POST 处理作者删除操作
exports.author_delete_post = (req, res, next) => {
  async.parallel({
    author: function(callback) {
      Author.findById(req.body.authorid).exec(callback)
    },
    author_articles: function(callback) {
      Article.find({ 'author': req.body.authorid }).exec(callback)
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
    if (results.author_articles.length > 0 
      || (req.body.password != results.author.password
      && c == true)) {
      res.render('author_delete', { title: '删除作者', author: results.author, author_articles: results.author_articles, input_err: "口令错误" } );
      return;
    }
    else {
      Author.findByIdAndRemove(req.body.authorid, err => {
        if (err) { return next(err); }
        res.redirect('/catalog/authors')
      })
    }
  });
};


// 由 GET 显示更新作者的表单
exports.author_update_get = (req, res, next) => {
  Author.findById(req.params.id).exec((err, author)=>{
    if(err){ return next(err); }
    if(author==null){
      let err= new Error("作者没找到");
      err.status=404;
      return next(err);
    }
    res.render('what_form',{title:'更改信息前确认身份',fine:false});
  });
};

// 由 POST 处理作者更新操作
exports.author_update_post = (req, res,next) => {
  if(req.body.name==undefined){
    async.parallel(
      {
        author:(callback)=>{
          Author.findById(req.params.id).exec(callback);
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
        if(req.body.v_password != results.author.password
          && c == true) {
          res.render('what_form', { title: '更改信息前确认身份', fine: false, errors: "口令错误" } );
          return;
        }//密码正确
        else {
          res.render('what_form',{title:'更改作者信息', fine: true, author: results.author});
        }
      }
      );
    }else{//已经确认身份，正式开始更改
    body('name').isLength({ min: 1 }).trim().withMessage('名字必须具体说明。');
    body('personal_profile').isLength({ min: 1 }).trim().withMessage('个人简介必须具体说明。');
    sanitizeBody('name').trim().escape();
    sanitizeBody('personal_profile').trim().escape();
    sanitizeBody('password').trim().escape();
    sanitizeBody('special_identity').trim().escape();
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render('what_form', { title: '更改作者信息', fine:true,author: req.body, errors: errors.array() });
      return;
    }
    else {
      let identity_h;
      if(req.body.special_password=='管理员')
      {
        identity_h='管理员';
      }else{
        identity_h='访客';
      }
      let author = new Author({
        name: req.body.name,
        personal_profile: req.body.personal_profile,
        password: req.body.password,
        identity: identity_h,
        _id: req.params.id
      });
      Author.findByIdAndUpdate(req.params.id, author, {}, function (err,theauthor) {
        if (err) { return next(err); }
        // Successful - redirect to book detail page.
        res.redirect(theauthor.url);
      });
  }
  }

};
