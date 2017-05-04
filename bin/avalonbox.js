'use strict';

var _html = require('./core/html');

var html = _interopRequireWildcard(_html);

var _bind = require('./core/bind');

var _bind2 = _interopRequireDefault(_bind);

var _delegate = require('./core/delegate');

var _delegate2 = _interopRequireDefault(_delegate);

var _Direction = require('./constants/Direction');

var _Direction2 = _interopRequireDefault(_Direction);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var box = 'avalonbox';
var isDev = true;

var Avalonbox = function () {
  var doc = document;
  var buttons = {};
  var overlay = html.createOverlayBox(doc);
  var frame = html.createFrame(doc);
  var spinner = html.createSpinner(doc);
  var spinnerWrapper = html.createSpinnerWrapper(doc);
  var downloadImage = new Image();

  var active = void 0;
  var currentLink = void 0;

  initialize();

  function initialize() {
    active = false;
    html.appendChild(doc, overlay);
    buttons.prev = html.createPreviousButton(doc);
    buttons.next = html.createNextButton(doc);
    spinnerWrapper.appendChild(spinner);
    overlay.appendChild(frame.container);
    overlay.appendChild(spinnerWrapper);
    overlay.appendChild(buttons.prev);
    overlay.appendChild(buttons.next);

    (0, _bind2.default)(overlay, 'click', hideOverlay);
    (0, _bind2.default)(buttons.prev, 'click', previous);
    (0, _bind2.default)(buttons.next, 'click', next);
    (0, _bind2.default)(doc, 'keydown', keyPressHandler);
  }

  function hideOverlay(e) {
    var f = frame.container;
    if (f === e.target || !f.contains(e.target)) cleanFrame();
  }

  function cleanFrame() {
    html.hide(overlay);
    frame.image.classList.remove('showRight', 'showLeft', 'show');
    frame.image.src = '';
    active = false;
  }

  function showOverlay(e) {
    e.preventDefault();
    active = true;
    html.show(overlay);
    currentLink = e.delegateTarget;
    fetchImage();

    if (single(e.currentTarget.id)) {
      html.hide(buttons.prev);
      html.hide(buttons.next);
    } else {
      if (currentLink.previousElementSibling) html.show(buttons.prev);else html.hide(buttons.prev);

      if (currentLink.nextElementSibling) html.show(buttons.next);else html.hide(buttons.next);
    }
  }

  function next(e) {
    frame.image.classList.remove('showLeft', 'show');
    html.show(buttons.prev);
    if (currentLink.nextElementSibling) {
      currentLink = currentLink.nextElementSibling;
      fetchImage(_Direction2.default.RIGHT);
      if (!currentLink.nextElementSibling) html.hide(buttons.next);
    }

    e.stopPropagation();
  }

  function previous(e) {
    frame.image.classList.remove('showRight', 'show');
    html.show(buttons.next);
    if (currentLink.previousElementSibling) {
      currentLink = currentLink.previousElementSibling;
      fetchImage(_Direction2.default.LEFT);
      if (!currentLink.previousElementSibling) html.hide(buttons.prev);
    }

    e.stopPropagation();
  }

  function fetchImage(DIRECTION) {
    if (DIRECTION) html.slideOut(frame.image, DIRECTION);
    html.show(spinner);
    downloadImage.onload = function () {
      onLoadImage.bind(this, DIRECTION)();
    };

    downloadImage.src = currentLink.getAttribute('href');
    frame.link.href = currentLink.getAttribute('href');
  }

  function onLoadImage(DIRECTION) {
    if (isDev) {
      setTimeout(loadImage.bind(this, DIRECTION), 1000);
    } else {
      loadImage.bind(this, DIRECTION)();
    }
  }

  function loadImage(DIRECTION) {
    if (DIRECTION) html.slideIn(frame.image, DIRECTION);else html.show(frame.image);
    frame.image.src = this.src;
    html.hide(spinner);
  }

  // TODO: Swap [].slice for Array.from (ES6)
  // Need to test in IE9
  function single(query) {
    var links = doc.getElementById(query).getElementsByTagName('a');
    return [].slice.call(links).length == 1;
  }

  function run(query) {
    eventHandlers(query);
  }

  function eventHandlers(query) {
    var el = document.getElementById(query);
    var filterLinks = function filterLinks(x) {
      return x.tagName.toLowerCase() == 'a';
    };
    el.addEventListener('click', (0, _delegate2.default)(filterLinks, showOverlay));
  }

  function keyPressHandler(event) {
    var e = event || window.event;

    if (!active) return;

    if (e.keyCode == '37') previous(e);else if (e.keyCode == '39') next(e);
  }

  return {
    run: run
  };
}();

module.exports = Avalonbox;