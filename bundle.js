(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _avalonbox = require('../../src/scripts/avalonbox');

var _avalonbox2 = _interopRequireDefault(_avalonbox);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

document.onreadystatechange = function () {
  if (document.readyState === 'complete') {
    _avalonbox2.default.run('image-gallery-single');
    _avalonbox2.default.run('image-gallery-multiple');
    _avalonbox2.default.run('image-gallery-many');
  }
};

},{"../../src/scripts/avalonbox":2}],2:[function(require,module,exports){
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

},{"./bind":3,"./html":4}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
function bind(element, event, callback, useCapture) {
  element.addEventListener(event, callback, useCapture);
}

exports.default = bind;

},{}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.appendChild = exports.show = exports.hide = exports.getOverlayBox = exports.createSpinnerWrapper = exports.createSpinner = exports.createOverlayBox = exports.createFrame = exports.createNextButton = exports.createPreviousButton = undefined;

var _bind = require('./bind');

var _bind2 = _interopRequireDefault(_bind);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function createPreviousButton(doc, box) {
  var prev = doc.createElement('button');
  prev.id = "previous";
  prev.className = box + '-prev-button';
  prev.innerHTML = "&lt";
  prev.type = "button";
  return prev;
}

function createNextButton(doc, box) {
  var next = doc.createElement('button');
  next.id = "next";
  next.className = box + '-next-button';
  next.innerHTML = "&gt";
  next.type = "button";
  return next;
}

function createSpinner(doc, box) {
  var spinner = doc.createElement('div');
  spinner.id = box + '-spinner';
  spinner.className = box + '-spinner';

  return spinner;
}

function createSpinnerWrapper(doc, box) {
  var wrapper = doc.createElement('div');
  wrapper.id = box + '-spinner-wrapper';
  wrapper.className = box + '-spinner-wrapper';

  return wrapper;
}

function createFrame(doc, box) {
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

function createOverlayBox(doc, box) {
  var overlay = doc.createElement('div');
  overlay.className = box + '-overlay';
  overlay.id = box + '-overlay';
  return overlay;
}

function getOverlayBox(doc, box) {
  var overlay = doc.getElementById(box + '-overlay');
  return overlay;
}

function hide(el) {
  el.className = el.className.replace(' hide', '') + ' hide';
}

function show(el) {
  el.className = el.className.replace(' hide', '');
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

},{"./bind":3}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwYWdlcy9qcy9hcHAuanMiLCJzcmMvc2NyaXB0cy9hdmFsb25ib3guanMiLCJzcmMvc2NyaXB0cy9iaW5kLmpzIiwic3JjL3NjcmlwdHMvaHRtbC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUE7Ozs7OztBQUVBLFNBQVMsa0JBQVQsR0FBOEIsWUFBVTtBQUN0QyxNQUFHLFNBQVMsVUFBVCxLQUF3QixVQUEzQixFQUFzQztBQUNwQyx3QkFBVSxHQUFWLENBQWMsc0JBQWQ7QUFDQSx3QkFBVSxHQUFWLENBQWMsd0JBQWQ7QUFDQSx3QkFBVSxHQUFWLENBQWMsb0JBQWQ7QUFDRDtBQUNGLENBTkQ7Ozs7O0FDRkE7O0lBQWEsSTs7QUFDYjs7Ozs7Ozs7QUFFQSxJQUFNLFlBQWEsWUFBVTtBQUMzQixNQUFNLE1BQU0sUUFBWjtBQUNBLE1BQU0sTUFBTSxXQUFaO0FBQ0EsTUFBTSxVQUFVLEVBQWhCO0FBQ0EsTUFBTSxVQUFVLEtBQUssZ0JBQUwsQ0FBc0IsR0FBdEIsRUFBMkIsR0FBM0IsQ0FBaEI7QUFDQSxNQUFNLFFBQVEsS0FBSyxXQUFMLENBQWlCLEdBQWpCLEVBQXNCLEdBQXRCLENBQWQ7QUFDQSxNQUFNLFVBQVUsS0FBSyxhQUFMLENBQW1CLEdBQW5CLEVBQXdCLEdBQXhCLENBQWhCO0FBQ0EsTUFBTSxpQkFBaUIsS0FBSyxvQkFBTCxDQUEwQixHQUExQixFQUErQixHQUEvQixDQUF2Qjs7QUFFQSxNQUFJLGVBQUo7QUFDQSxNQUFJLG9CQUFKOztBQUVBOztBQUVBLFdBQVMsVUFBVCxHQUFxQjtBQUNuQixhQUFTLEtBQVQ7QUFDQSxTQUFLLFdBQUwsQ0FBaUIsR0FBakIsRUFBc0IsT0FBdEI7QUFDQSxZQUFRLElBQVIsR0FBZSxLQUFLLG9CQUFMLENBQTBCLEdBQTFCLEVBQStCLEdBQS9CLENBQWY7QUFDQSxZQUFRLElBQVIsR0FBZSxLQUFLLGdCQUFMLENB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QjtBQUM1QixNQUFJLG9CQUFKLENBQXlCLE1BQXpCLEVBQWlDLENBQWpDLEVBQW9DLFdBQXBDLENBQWdELEVBQWhEO0FBRUQ7O1FBR0Msb0IsR0FBQSxvQjtRQUNBLGdCLEdBQUEsZ0I7UUFDQSxXLEdBQUEsVztRQUNBLGdCLEdBQUEsZ0I7UUFDQSxhLEdBQUEsYTtRQUNBLG9CLEdBQUEsb0I7UUFDQSxhLEdBQUEsYTtRQUNBLEksR0FBQSxJO1FBQ0EsSSxHQUFBLEk7UUFDQSxXLEdBQUEsVyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJpbXBvcnQgYXZhbG9uYm94IGZyb20gJy4uLy4uL3NyYy9zY3JpcHRzL2F2YWxvbmJveCc7XG5cbmRvY3VtZW50Lm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uKCl7XG4gIGlmKGRvY3VtZW50LnJlYWR5U3RhdGUgPT09ICdjb21wbGV0ZScpe1xuICAgIGF2YWxvbmJveC5ydW4oJ2ltYWdlLWdhbGxlcnktc2luZ2xlJyk7XG4gICAgYXZhbG9uYm94LnJ1bignaW1hZ2UtZ2FsbGVyeS1tdWx0aXBsZScpO1xuICAgIGF2YWxvbmJveC5ydW4oJ2ltYWdlLWdhbGxlcnktbWFueScpO1xuICB9XG59XG4iLCJpbXBvcnQgICogYXMgaHRtbCBmcm9tICcuL2h0bWwnXG5pbXBvcnQgYmluZCBmcm9tICcuL2JpbmQnXG5cbmNvbnN0IEF2YWxvbmJveCA9IChmdW5jdGlvbigpe1xuICBjb25zdCBkb2MgPSBkb2N1bWVudFxuICBjb25zdCBib3ggPSAnYXZhbG9uYm94J1xuICBjb25zdCBidXR0b25zID0ge31cbiAgY29uc3Qgb3ZlcmxheSA9IGh0bWwuY3JlYXRlT3ZlcmxheUJveChkb2MsIGJveClcbiAgY29uc3QgZnJhbWUgPSBodG1sLmNyZWF0ZUZyYW1lKGRvYywgYm94KVxuICBjb25zdCBzcGlubmVyID0gaHRtbC5jcmVhdGVTcGlubmVyKGRvYywgYm94KVxuICBjb25zdCBzcGlubmVyV3JhcHBlciA9IGh0bWwuY3JlYXRlU3Bpbm5lcldyYXBwZXIoZG9jLCBib3gpXG5cbiAgbGV0IGFjdGl2ZVxuICBsZXQgY3VycmVudExpbmtcblxuICBpbml0aWFsaXplKClcblxuICBmdW5jdGlvbiBpbml0aWFsaXplKCl7XG4gICAgYWN0aXZlID0gZmFsc2VcbiAgICBodG1sLmFwcGVuZENoaWxkKGRvYywgb3ZlcmxheSlcbiAgICBidXR0b25zLnByZXYgPSBodG1sLmNyZWF0ZVByZXZpb3VzQnV0dG9uKGRvYywgYm94KVxuICAgIGJ1dHRvbnMubmV4dCA9IGh0bWwuY3JlYXRlTmV4dEJ1dHRvbihkb2MsIGJveClcbiAgICBzcGlubmVyV3JhcHBlci5hcHBlbmRDaGlsZChzcGlubmVyKVxuICAgIG92ZXJsYXkuYXBwZW5kQ2hpbGQoZnJhbWUuY29udGFpbmVyKVxuICAgIG92ZXJsYXkuYXBwZW5kQ2hpbGQoc3Bpbm5lcldyYXBwZXIpXG4gICAgb3ZlcmxheS5hcHBlbmRDaGlsZChidXR0b25zLnByZXYpXG4gICAgb3ZlcmxheS5hcHBlbmRDaGlsZChidXR0b25zLm5leHQpXG5cblxuICAgIGJpbmQob3ZlcmxheSwgJ2NsaWNrJywgaGlkZU92ZXJsYXkpXG4gICAgYmluZChidXR0b25zLnByZXYsICdjbGljaycsIHByZXZpb3VzKVxuICAgIGJpbmQoYnV0dG9ucy5uZXh0LCAnY2xpY2snLCBuZXh0KVxuICAgIGJpbmQoZG9jLCAna2V5ZG93bicsIGtleVByZXNzSGFuZGxlcilcbiAgfVxuXG4gIGZ1bmN0aW9uIGhpZGVPdmVybGF5KGUpe1xuICAgIGxldCBmID0gZnJhbWUuY29udGFpbmVyO1xuICAgIGlmICgoZiA9PT0gZS50YXJnZXQpIHx8ICghIGYuY29udGFpbnMoZS50YXJnZXQpKSlcbiAgICAgIGNsZWFuRnJhbWUoKVxuICB9XG5cbiAgZnVuY3Rpb24gY2xlYW5GcmFtZSgpe1xuICAgIG92ZXJsYXkuc3R5bGUuZGlzcGxheSA9ICdub25lJ1xuICAgIGZyYW1lLmltYWdlLnNyYyA9IFwiXCJcbiAgICBhY3RpdmUgPSBmYWxzZVxuICB9XG5cbiAgZnVuY3Rpb24gc2hvd092ZXJsYXkoZSl7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpXG5cbiAgICBhY3RpdmUgPSB0cnVlXG4gICAgb3ZlcmxheS5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJ1xuICAgIGN1cnJlbnRMaW5rID0gZS50YXJnZXQucGFyZW50Tm9kZVxuXG4gICAgbG9hZEltYWdlKClcblxuICAgIGlmIChzaW5nbGUoY3VycmVudExpbmsucGFyZW50Tm9kZS5pZCkpIHtcbiAgICAgIGh0bWwuaGlkZShidXR0b25zLnByZXYpXG4gICAgICBodG1sLmhpZGUoYnV0dG9ucy5uZXh0KVxuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoY3VycmVudExpbmsucHJldmlvdXNFbGVtZW50U2libGluZylcbiAgICAgICAgaHRtbC5zaG93KGJ1dHRvbnMucHJldilcbiAgICAgIGVsc2VcbiAgICAgICAgaHRtbC5oaWRlKGJ1dHRvbnMucHJldilcblxuICAgICAgaWYgKGN1cnJlbnRMaW5rLm5leHRFbGVtZW50U2libGluZylcbiAgICAgICAgaHRtbC5zaG93KGJ1dHRvbnMubmV4dClcbiAgICAgIGVsc2VcbiAgICAgICAgaHRtbC5oaWRlKGJ1dHRvbnMubmV4dClcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBuZXh0KGUpe1xuICAgIGh0bWwuc2hvdyhidXR0b25zLnByZXYpXG4gICAgaWYgKGN1cnJlbnRMaW5rLm5leHRFbGVtZW50U2libGluZykge1xuICAgICAgY3VycmVudExpbmsgPSBjdXJyZW50TGluay5uZXh0RWxlbWVudFNpYmxpbmdcbiAgICAgIGxvYWRJbWFnZSgpXG4gICAgICBpZiAoIWN1cnJlbnRMaW5rLm5leHRFbGVtZW50U2libGluZylcbiAgICAgICAgaHRtbC5oaWRlKGJ1dHRvbnMubmV4dClcbiAgICB9XG5cbiAgICBlLnN0b3BQcm9wYWdhdGlvbigpXG4gIH1cblxuICBmdW5jdGlvbiBwcmV2aW91cyhlKXtcbiAgICBodG1sLnNob3coYnV0dG9ucy5uZXh0KVxuICAgIGlmIChjdXJyZW50TGluay5wcmV2aW91c0VsZW1lbnRTaWJsaW5nKSB7XG4gICAgICBjdXJyZW50TGluayA9IGN1cnJlbnRMaW5rLnByZXZpb3VzRWxlbWVudFNpYmxpbmdcbiAgICAgIGxvYWRJbWFnZSgpXG4gICAgICBpZiAoISBjdXJyZW50TGluay5wcmV2aW91c0VsZW1lbnRTaWJsaW5nKVxuICAgICAgICBodG1sLmhpZGUoYnV0dG9ucy5wcmV2KVxuICAgIH1cblxuICAgIGUuc3RvcFByb3BhZ2F0aW9uKClcbiAgfVxuXG4gIGZ1bmN0aW9uIGxvYWRJbWFnZSgpe1xuICAgIGZyYW1lLmltYWdlLnNyYyA9ICcnXG4gICAgc3Bpbm5lci5jbGFzc05hbWUgPSBzcGlubmVyLmNsYXNzTmFtZS5yZXBsYWNlKCcgaGlkZScsICcnKVxuICAgIGxldCBkb3dubG9hZEltYWdlID0gbmV3IEltYWdlKClcbiAgICBkb3dubG9hZEltYWdlLm9ubG9hZCA9IGZ1bmN0aW9uKCl7XG4gICAgICBmcmFtZS5pbWFnZS5zcmMgPSB0aGlzLnNyY1xuICAgICAgc3Bpbm5lci5jbGFzc05hbWUgPSBzcGlubmVyLmNsYXNzTmFtZSArICcgaGlkZSdcbiAgICB9XG5cbiAgICBkb3dubG9hZEltYWdlLnNyYyA9IGN1cnJlbnRMaW5rLmdldEF0dHJpYnV0ZSgnaHJlZicpXG4gICAgZnJhbWUubGluay5ocmVmID0gY3VycmVudExpbmsuZ2V0QXR0cmlidXRlKCdocmVmJylcbiAgfVxuXG4gIC8vIFRPRE86IFN3YXAgW10uc2xpY2UgZm9yIEFycmF5LmZyb20gKEVTNilcbiAgLy8gTmVlZCB0byB0ZXN0IGluIElFOVxuICBmdW5jdGlvbiBzaW5nbGUocXVlcnkpe1xuICAgIGNvbnN0IGxpbmtzID0gZG9jLmdldEVsZW1lbnRCeUlkKHF1ZXJ5KVxuICAgICAgLmdldEVsZW1lbnRzQnlUYWdOYW1lKCdhJylcbiAgICByZXR1cm4gW10uc2xpY2UuY2FsbChsaW5rcykubGVuZ3RoID09IDFcbiAgfVxuXG4gIGZ1bmN0aW9uIHJ1bihxdWVyeSl7XG4gICAgZXZlbnRIYW5kbGVycyhxdWVyeSlcbiAgfVxuXG4gIGZ1bmN0aW9uIGV2ZW50SGFuZGxlcnMocXVlcnkpe1xuICAgIGxldCBsaW5rcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHF1ZXJ5KVxuICAgICAgLmdldEVsZW1lbnRzQnlUYWdOYW1lKCdhJylcbiAgICBsaW5rcyA9IFtdLnNsaWNlLmNhbGwobGlua3MpXG4gICAgbGlua3MuZm9yRWFjaChsaW5rID0+IHtcbiAgICAgIGJpbmQobGluaywgJ2NsaWNrJywgc2hvd092ZXJsYXkpXG4gICAgfSlcblxuICB9XG5cbiAgZnVuY3Rpb24ga2V5UHJlc3NIYW5kbGVyKGUpe1xuICAgIGUgPSBlIHx8IHdpbmRvdy5ldmVudFxuXG4gICAgaWYgKCFhY3RpdmUpXG4gICAgICByZXR1cm5cblxuICAgIGlmIChlLmtleUNvZGUgPT0gJzM3JylcbiAgICAgIHByZXZpb3VzKClcbiAgICBlbHNlIGlmIChlLmtleUNvZGUgPT0gJzM5JylcbiAgICAgIG5leHQoKVxuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBydW5cbiAgfVxufSkoKVxuXG5tb2R1bGUuZXhwb3J0cyA9IEF2YWxvbmJveFxuIiwiZnVuY3Rpb24gYmluZChlbGVtZW50LCBldmVudCwgY2FsbGJhY2ssIHVzZUNhcHR1cmUpIHtcbiAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKGV2ZW50LCBjYWxsYmFjaywgdXNlQ2FwdHVyZSlcbn1cblxuZXhwb3J0IGRlZmF1bHQgYmluZFxuIiwiaW1wb3J0IGJpbmQgZnJvbSAnLi9iaW5kJ1xuXG5mdW5jdGlvbiBjcmVhdGVQcmV2aW91c0J1dHRvbihkb2MsIGJveCl7XG4gIGNvbnN0IHByZXYgPSBkb2MuY3JlYXRlRWxlbWVudCgnYnV0dG9uJylcbiAgcHJldi5pZCA9IFwicHJldmlvdXNcIlxuICBwcmV2LmNsYXNzTmFtZSA9IGAke2JveH0tcHJldi1idXR0b25gXG4gIHByZXYuaW5uZXJIVE1MID0gXCImbHRcIlxuICBwcmV2LnR5cGUgPSBcImJ1dHRvblwiXG4gIHJldHVybiBwcmV2XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZU5leHRCdXR0b24oZG9jLCBib3gpe1xuICBjb25zdCBuZXh0ID0gZG9jLmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpXG4gIG5leHQuaWQgPSBcIm5leHRcIlxuICBuZXh0LmNsYXNzTmFtZSA9IGAke2JveH0tbmV4dC1idXR0b25gXG4gIG5leHQuaW5uZXJIVE1MID0gXCImZ3RcIlxuICBuZXh0LnR5cGUgPSBcImJ1dHRvblwiXG4gIHJldHVybiBuZXh0XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVNwaW5uZXIoZG9jLCBib3gpe1xuICBjb25zdCBzcGlubmVyID0gZG9jLmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gIHNwaW5uZXIuaWQgPSBgJHtib3h9LXNwaW5uZXJgXG4gIHNwaW5uZXIuY2xhc3NOYW1lID0gYCR7Ym94fS1zcGlubmVyYFxuXG4gIHJldHVybiBzcGlubmVyXG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVNwaW5uZXJXcmFwcGVyKGRvYywgYm94KSB7XG4gIGNvbnN0IHdyYXBwZXIgPSBkb2MuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgd3JhcHBlci5pZCA9IGAke2JveH0tc3Bpbm5lci13cmFwcGVyYFxuICB3cmFwcGVyLmNsYXNzTmFtZSA9IGAke2JveH0tc3Bpbm5lci13cmFwcGVyYFxuXG4gIHJldHVybiB3cmFwcGVyXG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUZyYW1lKGRvYywgYm94KXtcbiAgY29uc3QgZnJhbWUgPSBkb2MuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgZnJhbWUuaWQgPSBgJHtib3h9LWZyYW1lYFxuICBmcmFtZS5jbGFzc05hbWUgPSBgJHtib3h9LWZyYW1lYFxuXG4gIGNvbnN0IGltYWdlID0gZG9jLmNyZWF0ZUVsZW1lbnQoJ2ltZycpXG4gIGltYWdlLmNsYXNzTmFtZSA9IGAke2JveH0tZnJhbWUtaW1hZ2VgXG4gIGltYWdlLmlkID0gYCR7Ym94fS1mcmFtZS1pbWFnZWBcblxuICBjb25zdCBsaW5rID0gZG9jLmNyZWF0ZUVsZW1lbnQoJ2EnKVxuICBsaW5rLmFwcGVuZENoaWxkKGltYWdlKVxuXG4gIGJpbmQobGluaywgJ2NsaWNrJywgZSA9PiB7IGUucHJldmVudERlZmF1bHQoKSB9KVxuXG4gIGZyYW1lLmFwcGVuZENoaWxkKGxpbmspXG4gIHJldHVybiB7Y29udGFpbmVyOiBmcmFtZSwgaW1hZ2U6IGltYWdlLCBsaW5rOiBsaW5rfVxufVxuXG5mdW5jdGlvbiBjcmVhdGVPdmVybGF5Qm94KGRvYywgYm94KXtcbiAgY29uc3Qgb3ZlcmxheSA9IGRvYy5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICBvdmVybGF5LmNsYXNzTmFtZSA9IGAke2JveH0tb3ZlcmxheWBcbiAgb3ZlcmxheS5pZCA9IGAke2JveH0tb3ZlcmxheWBcbiAgcmV0dXJuIG92ZXJsYXlcbn1cblxuZnVuY3Rpb24gZ2V0T3ZlcmxheUJveChkb2MsIGJveCkge1xuICBjb25zdCBvdmVybGF5ID0gZG9jLmdldEVsZW1lbnRCeUlkKGAke2JveH0tb3ZlcmxheWApXG4gIHJldHVybiBvdmVybGF5XG59XG5cbmZ1bmN0aW9uIGhpZGUoZWwpIHtcbiAgZWwuY2xhc3NOYW1lID0gZWwuY2xhc3NOYW1lLnJlcGxhY2UoJyBoaWRlJywgJycpICsgJyBoaWRlJ1xufVxuXG5mdW5jdGlvbiBzaG93KGVsKSB7XG4gIGVsLmNsYXNzTmFtZSA9IGVsLmNsYXNzTmFtZS5yZXBsYWNlKCcgaGlkZScsICcnKVxufVxuXG5mdW5jdGlvbiBhcHBlbmRDaGlsZChkb2MsIGVsKSB7XG4gIGRvYy5nZXRFbGVtZW50c0J5VGFnTmFtZSgnYm9keScpWzBdLmFwcGVuZENoaWxkKGVsKVxuXG59XG5cbmV4cG9ydCB7XG4gIGNyZWF0ZVByZXZpb3VzQnV0dG9uLFxuICBjcmVhdGVOZXh0QnV0dG9uLFxuICBjcmVhdGVGcmFtZSxcbiAgY3JlYXRlT3ZlcmxheUJveCxcbiAgY3JlYXRlU3Bpbm5lcixcbiAgY3JlYXRlU3Bpbm5lcldyYXBwZXIsXG4gIGdldE92ZXJsYXlCb3gsXG4gIGhpZGUsXG4gIHNob3csXG4gIGFwcGVuZENoaWxkXG59XG4iXX0=
