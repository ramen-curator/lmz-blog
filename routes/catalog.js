const express = require('express');
const router = express.Router();

// 导入控制器模块
const article_controller = require('../controllers/articleController');
const author_controller = require('../controllers/authorController');
const genre_controller = require('../controllers/genreController');


/// 文章路由 ///

// GET 获取文章编目主页
router.get('/', article_controller.article_list);

// GET 请求添加新的文章。注意此项必须位于显示文章的路由（使用了 id）之前。
router.get('/article/create', article_controller.article_create_get);

// POST 请求添加新的文章
router.post('/article/create', article_controller.article_create_post);

// GET 请求删除文章
router.get('/article/:id/delete', article_controller.article_delete_get);

// POST 请求删除文章
router.post('/article/:id/delete', article_controller.article_delete_post);

// GET 请求更新文章
router.get('/article/:id/update', article_controller.article_update_get);

// POST 请求更新文章
router.post('/article/:id/update', article_controller.article_update_post);

// GET 请求文章
router.get('/article/:id', article_controller.article_detail);

// GET 请求完整文章列表
router.get('/articles', article_controller.article_list);

/// 文章种类、作者的路由与文章路由结构基本一致，只是无需获取主页 ///

// GET 请求添加新的作者。注意此项必须位于显示作者的路由（使用了 id）之前。
router.get('/author/create', author_controller.author_create_get);

// POST 请求添加新的作者
router.post('/author/create', author_controller.author_create_post);

// GET 请求删除作者
router.get('/author/:id/delete', author_controller.author_delete_get);

// POST 请求删除作者
router.post('/author/:id/delete', author_controller.author_delete_post);

// GET 请求更新作者
router.get('/author/:id/update', author_controller.author_update_get);

// POST 请求更新作者
router.post('/author/:id/update', author_controller.author_update_post);

// GET 请求作者
router.get('/author/:id', author_controller.author_detail);

// GET 请求完整作者列表
router.get('/authors', author_controller.author_list);



// GET 请求添加新的作者。注意此项必须位于显示作者的路由（使用了 id）之前。
router.get('/genre/create', genre_controller.genre_create_get);

// POST 请求添加新的作者
router.post('/genre/create', genre_controller.genre_create_post);

// GET 请求删除作者
router.get('/genre/:id/delete', genre_controller.genre_delete_get);

// POST 请求删除作者
router.post('/genre/:id/delete', genre_controller.genre_delete_post);

// GET 请求更新作者
router.get('/genre/:id/update', genre_controller.genre_update_get);

// POST 请求更新作者
router.post('/genre/:id/update', genre_controller.genre_update_post);

// GET 请求作者
router.get('/genre/:id', genre_controller.genre_detail);

// GET 请求完整作者列表
router.get('/genres', genre_controller.genre_list);

module.exports = router;