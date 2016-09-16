'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.appendChild = exports.show = exports.hide = exports.getOverlayBox = exports.createSpinnerWrapper = exports.createSpinner = exports.createOverlayBox = exports.createFrame = exports.createNextButton = exports.createPreviousButton = undefined;

var _bind = require('./bind');

var _bind2 = _interopRequireDefault(_bind);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var box = 'avalonbox';

function createPreviousButton(doc) {
  var prev = doc.createElement('button');
  prev.id = box + '-prev';
  prev.className = box + '-move-button ' + box + '-prev-button';
  prev.innerHTML = "&lt";
  prev.type = "button";
  return prev;
}

function createNextButton(doc) {
  var next = doc.createElement('button');
  next.id = box + '-next';
  next.className = box + '-move-button ' + box + '-next-button';
  next.innerHTML = "&gt";
  next.type = "button";
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
  el.className = el.className.replace(' ' + box + '-hide', '') + (' ' + box + '-hide');
}

function show(el) {
  el.className = el.className.replace(' ' + box + '-hide', '');
}

function appendChild(doc, el) {
  doc.getElementsByTagName('body')[0].appendChild(el);
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
exports.appendChild = appendChild;