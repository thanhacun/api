'use strict';

var express = require('express');
var controller = require('./weather.controller');

var router = express.Router();

router.get('/now/:lat,:lon', controller.now)

router.get('/', controller.index);
router.get('/:id', controller.show);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.patch('/:id', controller.update);
router.delete('/:id', controller.destroy);

module.exports = router;
