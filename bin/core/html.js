'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.appendChild = exports.slideOut = exports.slideIn = exports.show = exports.hide = exports.getOverlayBox = exports.createSpinnerWrapper = exports.createSpinner = exports.createOverlayBox = exports.createFrame = exports.createNextButton = exports.createPreviousButton = undefined;

var _bind = require('./bind');

var _bind2 = _interopRequireDefault(_bind);

var _Direction = require('../constants/Direction');

var _Direction2 = _interopRequireDefault(_Direction);

var _capitalize = require('../utils/capitalize');

var _capitalize2 = _interopRequireDefault(_capitalize);

var _oppositeDirection = require('../utils/opposite-direction');

var _oppositeDirection2 = _interopRequireDefault(_oppositeDirection);

var _icons = require('../icons');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var box = 'avalonbox';

function createPreviousButton(doc) {
  var prev = doc.createElement('button');
  prev.id = box + '-prev';
  prev.className = box + '-move-button ' + box + '-prev-button';
  prev.innerHTML = _icons.LeftIcon;
  prev.type = 'button';
  return prev;
}

function createNextButton(doc) {
  var next = doc.createElement('button');
  next.id = box + '-next';
  next.className = box + '-move-button ' + box + '-next-button';
  next.innerHTML = _icons.RightIcon;
  next.type = 'button';
  return next;
}

function createSpinner(doc) {
  var spinner = doc.createElement('div');
  spinner.id = box + '-spinner';
  spinner.className = box + '-spinner';

  return spinner;
}

function createSpinnerWrapper(doc) {
  var wrapper = doc.createElement('div');
  wrapper.id = box + '-spinner-wrapper';
  wrapper.className = box + '-spinner-wrapper';

  return wrapper;
}

function createFrame(doc) {
  var frame = doc.createElement('div');
  frame.id = box + '-frame';
  frame.className = box + '-frame';

  var image = doc.createElement('img');
  image.src = '';
  image.className = box + '-frame-image';
  image.id = box + '-frame-image';

  var link = doc.createElement('a');
  link.appendChild(image);

  (0, _bind2.default)(link, 'click', function (e) {
    e.preventDefault();
  });

  frame.appendChild(link);
  return { container: frame, image: image, link: link };
}

function createOverlayBox(doc) {
  var overlay = doc.createElement('div');
  overlay.className = box + '-overlay';
  overlay.id = box + '-overlay';
  return overlay;
}

function getOverlayBox(doc) {
  var overlay = doc.getElementById(box + '-overlay');
  return overlay;
}

function hide(el) {
  el.classList.remove('show');
  el.classList.add('hide');
}

function show(el) {
  el.classList.remove('hide');
  el.classList.add('show');
}

function appendChild(doc, el) {
  doc.getElementsByTagName('body')[0].appendChild(el);
}

function slideIn(el, DIRECTION) {
  el.classList.remove('hide' + (0, _capitalize2.default)((0, _oppositeDirection2.default)(DIRECTION)));
  el.classList.add('show' + (0, _capitalize2.default)(DIRECTION));
}

function slideOut(el, DIRECTION) {
  el.classList.remove('show' + (0, _capitalize2.default)(DIRECTION));
  el.classList.add('hide' + (0, _capitalize2.default)((0, _oppositeDirection2.default)(DIRECTION)));
}

exports.createPreviousButton = createPreviousButton;
exports.createNextButton = createNextButton;
exports.createFrame = createFrame;
exports.createOverlayBox = createOverlayBox;
exports.createSpinner = createSpinner;
exports.createSpinnerWrapper = createSpinnerWrapper;
exports.getOverlayBox = getOverlayBox;
exports.hide = hide;
exports.show = show;
exports.slideIn = slideIn;
exports.slideOut = slideOut;
exports.appendChild = appendChild;