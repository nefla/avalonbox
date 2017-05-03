'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _Direction = require('../constants/Direction');

var _Direction2 = _interopRequireDefault(_Direction);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function oppositeDirection(DIRECTION) {
  return DIRECTION === _Direction2.default.LEFT ? _Direction2.default.RIGHT : _Direction2.default.LEFT;
}

exports.default = oppositeDirection;