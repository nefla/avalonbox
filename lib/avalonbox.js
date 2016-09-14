'use strict';

var _html = require('./html');

var html = _interopRequireWildcard(_html);

var _bind = require('./bind');

var _bind2 = _interopRequireDefault(_bind);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var Avalonbox = function () {
  var doc = document;
  var box = 'avalonbox';
  var buttons = {};
  var overlay = html.createOverlayBox(doc, box);
  var frame = html.createFrame(doc, box);
  var spinner = html.createSpinner(doc, box);
  var spinnerWrapper = html.createSpinnerWrapper(doc, box);

  var active = void 0;
  var currentLink = void 0;

  initialize();

  function initialize() {
    active = false;
    html.appendChild(doc, overlay);
    buttons.prev = html.createPreviousButton(doc, box);
    buttons.next = html.createNextButton(doc, box);
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
    overlay.style.display = 'none';
    frame.image.src = "";
    active = false;
  }

  function showOverlay(e) {
    e.preventDefault();

    active = true;
    overlay.style.display = 'block';
    currentLink = e.target.parentNode;

    loadImage();

    if (single(currentLink.parentNode.id)) {
      html.hide(buttons.prev);
      html.hide(buttons.next);
    } else {
      if (currentLink.previousElementSibling) html.show(buttons.prev);else html.hide(buttons.prev);

      if (currentLink.nextElementSibling) html.show(buttons.next);else html.hide(buttons.next);
    }
  }

  function next(e) {
    html.show(buttons.prev);
    if (currentLink.nextElementSibling) {
      currentLink = currentLink.nextElementSibling;
      loadImage();
      if (!currentLink.nextElementSibling) html.hide(buttons.next);
    }

    e.stopPropagation();
  }

  function previous(e) {
    html.show(buttons.next);
    if (currentLink.previousElementSibling) {
      currentLink = currentLink.previousElementSibling;
      loadImage();
      if (!currentLink.previousElementSibling) html.hide(buttons.prev);
    }

    e.stopPropagation();
  }

  function loadImage() {
    frame.image.src = '';
    spinner.className = spinner.className.replace(' hide', '');
    var downloadImage = new Image();
    downloadImage.onload = function () {
      frame.image.src = this.src;
      spinner.className = spinner.className + ' hide';
    };

    downloadImage.src = currentLink.getAttribute('href');
    frame.link.href = currentLink.getAttribute('href');
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
    var links = document.getElementById(query).getElementsByTagName('a');
    links = [].slice.call(links);
    links.forEach(function (link) {
      (0, _bind2.default)(link, 'click', showOverlay);
    });
  }

  function keyPressHandler(e) {
    e = e || window.event;

    if (!active) return;

    if (e.keyCode == '37') previous();else if (e.keyCode == '39') next();
  }

  return {
    run: run
  };
}();

module.exports = Avalonbox;