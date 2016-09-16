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
    html.hide(overlay);
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
    frame.image.src = "";
    active = false;
  }

  function showOverlay(e) {
    e.preventDefault();

    active = true;
    html.show(overlay);
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
    html.hide(frame.image);
    html.show(spinner);
    downloadImage.onload = function () {
      html.show(frame.image);
      frame.image.src = this.src;
      html.hide(spinner);
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

    if (e.keyCode == '37') previous(e);else if (e.keyCode == '39') next(e);
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

},{"./bind":3}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwYWdlcy9qcy9hcHAuanMiLCJzcmMvc2NyaXB0cy9hdmFsb25ib3guanMiLCJzcmMvc2NyaXB0cy9iaW5kLmpzIiwic3JjL3NjcmlwdHMvaHRtbC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUE7Ozs7OztBQUVBLFNBQVMsa0JBQVQsR0FBOEIsWUFBVTtBQUN0QyxNQUFHLFNBQVMsVUFBVCxLQUF3QixVQUEzQixFQUFzQztBQUNwQyx3QkFBVSxHQUFWLENBQWMsc0JBQWQ7QUFDQSx3QkFBVSxHQUFWLENBQWMsd0JBQWQ7QUFDQSx3QkFBVSxHQUFWLENBQWMsb0JBQWQ7QUFDRDtBQUNGLENBTkQ7Ozs7O0FDRkE7O0lBQWEsSTs7QUFDYjs7Ozs7Ozs7QUFFQSxJQUFNLFlBQWEsWUFBVTtBQUMzQixNQUFNLE1BQU0sUUFBWjtBQUNBLE1BQU0sVUFBVSxFQUFoQjtBQUNBLE1BQU0sVUFBVSxLQUFLLGdCQUFMLENBQXNCLEdBQXRCLENBQWhCO0FBQ0EsTUFBTSxRQUFRLEtBQUssV0FBTCxDQUFpQixHQUFqQixDQUFkO0FBQ0EsTUFBTSxVQUFVLEtBQUssYUFBTCxDQUFtQixHQUFuQixDQUFoQjtBQUNBLE1BQU0saUJBQWlCLEtBQUssb0JBQUwsQ0FBMEIsR0FBMUIsQ0FBdkI7QUFDQSxNQUFNLGdCQUFnQixJQUFJLEtBQUosRUFBdEI7O0FBRUEsTUFBSSxlQUFKO0FBQ0EsTUFBSSxvQkFBSjs7QUFFQTs7QUFFQSxXQUFTLFVBQVQsR0FBcUI7QUFDbkIsYUFBUyxLQUFUO0FBQ0EsU0FBSyxJQUFMLENBQVUsT0FBVjtBQUNBLFNBQUssV0FBTCxDQUFpQixHQUFqQixFQUFzQixPQUF0QjtBQUNBLFlBQVEsSUFBUixHQUFlLEtBQUssb0JBQUwsQ0FBMEIsR0FBMUIsQ0FBZjtBQUNBLFlBQVEsSUFBUixHQUFlLEtBQUssZ0JBQUwsQ0FBc0IsR0FBdEIsQ0FBZjtBQUNBLG1C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Q0EsVyxHQUFBLFc7UUFDQSxnQixHQUFBLGdCO1FBQ0EsYSxHQUFBLGE7UUFDQSxvQixHQUFBLG9CO1FBQ0EsYSxHQUFBLGE7UUFDQSxJLEdBQUEsSTtRQUNBLEksR0FBQSxJO1FBQ0EsVyxHQUFBLFciLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiaW1wb3J0IGF2YWxvbmJveCBmcm9tICcuLi8uLi9zcmMvc2NyaXB0cy9hdmFsb25ib3gnO1xuXG5kb2N1bWVudC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbigpe1xuICBpZihkb2N1bWVudC5yZWFkeVN0YXRlID09PSAnY29tcGxldGUnKXtcbiAgICBhdmFsb25ib3gucnVuKCdpbWFnZS1nYWxsZXJ5LXNpbmdsZScpO1xuICAgIGF2YWxvbmJveC5ydW4oJ2ltYWdlLWdhbGxlcnktbXVsdGlwbGUnKTtcbiAgICBhdmFsb25ib3gucnVuKCdpbWFnZS1nYWxsZXJ5LW1hbnknKTtcbiAgfVxufVxuIiwiaW1wb3J0ICAqIGFzIGh0bWwgZnJvbSAnLi9odG1sJ1xuaW1wb3J0IGJpbmQgZnJvbSAnLi9iaW5kJ1xuXG5jb25zdCBBdmFsb25ib3ggPSAoZnVuY3Rpb24oKXtcbiAgY29uc3QgZG9jID0gZG9jdW1lbnRcbiAgY29uc3QgYnV0dG9ucyA9IHt9XG4gIGNvbnN0IG92ZXJsYXkgPSBodG1sLmNyZWF0ZU92ZXJsYXlCb3goZG9jKVxuICBjb25zdCBmcmFtZSA9IGh0bWwuY3JlYXRlRnJhbWUoZG9jKVxuICBjb25zdCBzcGlubmVyID0gaHRtbC5jcmVhdGVTcGlubmVyKGRvYylcbiAgY29uc3Qgc3Bpbm5lcldyYXBwZXIgPSBodG1sLmNyZWF0ZVNwaW5uZXJXcmFwcGVyKGRvYylcbiAgY29uc3QgZG93bmxvYWRJbWFnZSA9IG5ldyBJbWFnZSgpXG5cbiAgbGV0IGFjdGl2ZVxuICBsZXQgY3VycmVudExpbmtcblxuICBpbml0aWFsaXplKClcblxuICBmdW5jdGlvbiBpbml0aWFsaXplKCl7XG4gICAgYWN0aXZlID0gZmFsc2VcbiAgICBodG1sLmhpZGUob3ZlcmxheSlcbiAgICBodG1sLmFwcGVuZENoaWxkKGRvYywgb3ZlcmxheSlcbiAgICBidXR0b25zLnByZXYgPSBodG1sLmNyZWF0ZVByZXZpb3VzQnV0dG9uKGRvYylcbiAgICBidXR0b25zLm5leHQgPSBodG1sLmNyZWF0ZU5leHRCdXR0b24oZG9jKVxuICAgIHNwaW5uZXJXcmFwcGVyLmFwcGVuZENoaWxkKHNwaW5uZXIpXG4gICAgb3ZlcmxheS5hcHBlbmRDaGlsZChmcmFtZS5jb250YWluZXIpXG4gICAgb3ZlcmxheS5hcHBlbmRDaGlsZChzcGlubmVyV3JhcHBlcilcbiAgICBvdmVybGF5LmFwcGVuZENoaWxkKGJ1dHRvbnMucHJldilcbiAgICBvdmVybGF5LmFwcGVuZENoaWxkKGJ1dHRvbnMubmV4dClcblxuXG4gICAgYmluZChvdmVybGF5LCAnY2xpY2snLCBoaWRlT3ZlcmxheSlcbiAgICBiaW5kKGJ1dHRvbnMucHJldiwgJ2NsaWNrJywgcHJldmlvdXMpXG4gICAgYmluZChidXR0b25zLm5leHQsICdjbGljaycsIG5leHQpXG4gICAgYmluZChkb2MsICdrZXlkb3duJywga2V5UHJlc3NIYW5kbGVyKVxuICB9XG5cbiAgZnVuY3Rpb24gaGlkZU92ZXJsYXkoZSl7XG4gICAgbGV0IGYgPSBmcmFtZS5jb250YWluZXI7XG4gICAgaWYgKChmID09PSBlLnRhcmdldCkgfHwgKCEgZi5jb250YWlucyhlLnRhcmdldCkpKVxuICAgICAgY2xlYW5GcmFtZSgpXG4gIH1cblxuICBmdW5jdGlvbiBjbGVhbkZyYW1lKCl7XG4gICAgaHRtbC5oaWRlKG92ZXJsYXkpXG4gICAgZnJhbWUuaW1hZ2Uuc3JjID0gXCJcIlxuICAgIGFjdGl2ZSA9IGZhbHNlXG4gIH1cblxuICBmdW5jdGlvbiBzaG93T3ZlcmxheShlKXtcbiAgICBlLnByZXZlbnREZWZhdWx0KClcblxuICAgIGFjdGl2ZSA9IHRydWVcbiAgICBodG1sLnNob3cob3ZlcmxheSlcbiAgICBjdXJyZW50TGluayA9IGUudGFyZ2V0LnBhcmVudE5vZGVcblxuICAgIGxvYWRJbWFnZSgpXG5cbiAgICBpZiAoc2luZ2xlKGN1cnJlbnRMaW5rLnBhcmVudE5vZGUuaWQpKSB7XG4gICAgICBodG1sLmhpZGUoYnV0dG9ucy5wcmV2KVxuICAgICAgaHRtbC5oaWRlKGJ1dHRvbnMubmV4dClcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKGN1cnJlbnRMaW5rLnByZXZpb3VzRWxlbWVudFNpYmxpbmcpXG4gICAgICAgIGh0bWwuc2hvdyhidXR0b25zLnByZXYpXG4gICAgICBlbHNlXG4gICAgICAgIGh0bWwuaGlkZShidXR0b25zLnByZXYpXG5cbiAgICAgIGlmIChjdXJyZW50TGluay5uZXh0RWxlbWVudFNpYmxpbmcpXG4gICAgICAgIGh0bWwuc2hvdyhidXR0b25zLm5leHQpXG4gICAgICBlbHNlXG4gICAgICAgIGh0bWwuaGlkZShidXR0b25zLm5leHQpXG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gbmV4dChlKXtcbiAgICBodG1sLnNob3coYnV0dG9ucy5wcmV2KVxuICAgIGlmIChjdXJyZW50TGluay5uZXh0RWxlbWVudFNpYmxpbmcpIHtcbiAgICAgIGN1cnJlbnRMaW5rID0gY3VycmVudExpbmsubmV4dEVsZW1lbnRTaWJsaW5nXG4gICAgICBsb2FkSW1hZ2UoKVxuICAgICAgaWYgKCFjdXJyZW50TGluay5uZXh0RWxlbWVudFNpYmxpbmcpXG4gICAgICAgIGh0bWwuaGlkZShidXR0b25zLm5leHQpXG4gICAgfVxuXG4gICAgZS5zdG9wUHJvcGFnYXRpb24oKVxuICB9XG5cbiAgZnVuY3Rpb24gcHJldmlvdXMoZSl7XG4gICAgaHRtbC5zaG93KGJ1dHRvbnMubmV4dClcbiAgICBpZiAoY3VycmVudExpbmsucHJldmlvdXNFbGVtZW50U2libGluZykge1xuICAgICAgY3VycmVudExpbmsgPSBjdXJyZW50TGluay5wcmV2aW91c0VsZW1lbnRTaWJsaW5nXG4gICAgICBsb2FkSW1hZ2UoKVxuICAgICAgaWYgKCEgY3VycmVudExpbmsucHJldmlvdXNFbGVtZW50U2libGluZylcbiAgICAgICAgaHRtbC5oaWRlKGJ1dHRvbnMucHJldilcbiAgICB9XG5cbiAgICBlLnN0b3BQcm9wYWdhdGlvbigpXG4gIH1cblxuICBmdW5jdGlvbiBsb2FkSW1hZ2UoKXtcbiAgICBmcmFtZS5pbWFnZS5zcmMgPSAnJ1xuICAgIGh0bWwuaGlkZShmcmFtZS5pbWFnZSlcbiAgICBodG1sLnNob3coc3Bpbm5lcilcbiAgICBkb3dubG9hZEltYWdlLm9ubG9hZCA9IGZ1bmN0aW9uKCl7XG4gICAgICBodG1sLnNob3coZnJhbWUuaW1hZ2UpXG4gICAgICBmcmFtZS5pbWFnZS5zcmMgPSB0aGlzLnNyY1xuICAgICAgaHRtbC5oaWRlKHNwaW5uZXIpXG4gICAgfVxuICAgIFxuICAgIGRvd25sb2FkSW1hZ2Uuc3JjID0gY3VycmVudExpbmsuZ2V0QXR0cmlidXRlKCdocmVmJylcbiAgICBmcmFtZS5saW5rLmhyZWYgPSBjdXJyZW50TGluay5nZXRBdHRyaWJ1dGUoJ2hyZWYnKVxuICB9XG5cbiAgLy8gVE9ETzogU3dhcCBbXS5zbGljZSBmb3IgQXJyYXkuZnJvbSAoRVM2KVxuICAvLyBOZWVkIHRvIHRlc3QgaW4gSUU5XG4gIGZ1bmN0aW9uIHNpbmdsZShxdWVyeSl7XG4gICAgY29uc3QgbGlua3MgPSBkb2MuZ2V0RWxlbWVudEJ5SWQocXVlcnkpXG4gICAgICAuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2EnKVxuICAgIHJldHVybiBbXS5zbGljZS5jYWxsKGxpbmtzKS5sZW5ndGggPT0gMVxuICB9XG5cbiAgZnVuY3Rpb24gcnVuKHF1ZXJ5KXtcbiAgICBldmVudEhhbmRsZXJzKHF1ZXJ5KVxuICB9XG5cbiAgZnVuY3Rpb24gZXZlbnRIYW5kbGVycyhxdWVyeSl7XG4gICAgbGV0IGxpbmtzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQocXVlcnkpXG4gICAgICAuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2EnKVxuICAgIGxpbmtzID0gW10uc2xpY2UuY2FsbChsaW5rcylcbiAgICBsaW5rcy5mb3JFYWNoKGxpbmsgPT4ge1xuICAgICAgYmluZChsaW5rLCAnY2xpY2snLCBzaG93T3ZlcmxheSlcbiAgICB9KVxuXG4gIH1cblxuICBmdW5jdGlvbiBrZXlQcmVzc0hhbmRsZXIoZSl7XG4gICAgZSA9IGUgfHwgd2luZG93LmV2ZW50XG5cbiAgICBpZiAoIWFjdGl2ZSlcbiAgICAgIHJldHVyblxuXG4gICAgaWYgKGUua2V5Q29kZSA9PSAnMzcnKVxuICAgICAgcHJldmlvdXMoZSlcbiAgICBlbHNlIGlmIChlLmtleUNvZGUgPT0gJzM5JylcbiAgICAgIG5leHQoZSlcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgcnVuXG4gIH1cbn0pKClcblxubW9kdWxlLmV4cG9ydHMgPSBBdmFsb25ib3hcbiIsImZ1bmN0aW9uIGJpbmQoZWxlbWVudCwgZXZlbnQsIGNhbGxiYWNrLCB1c2VDYXB0dXJlKSB7XG4gIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihldmVudCwgY2FsbGJhY2ssIHVzZUNhcHR1cmUpXG59XG5cbmV4cG9ydCBkZWZhdWx0IGJpbmRcbiIsImltcG9ydCBiaW5kIGZyb20gJy4vYmluZCdcbmNvbnN0IGJveCA9ICdhdmFsb25ib3gnXG5cbmZ1bmN0aW9uIGNyZWF0ZVByZXZpb3VzQnV0dG9uKGRvYyl7XG4gIGNvbnN0IHByZXYgPSBkb2MuY3JlYXRlRWxlbWVudCgnYnV0dG9uJylcbiAgcHJldi5pZCA9IGAke2JveH0tcHJldmBcbiAgcHJldi5jbGFzc05hbWUgPSBgJHtib3h9LW1vdmUtYnV0dG9uICR7Ym94fS1wcmV2LWJ1dHRvbmBcbiAgcHJldi5pbm5lckhUTUwgPSBcIiZsdFwiXG4gIHByZXYudHlwZSA9IFwiYnV0dG9uXCJcbiAgcmV0dXJuIHByZXZcbn1cblxuZnVuY3Rpb24gY3JlYXRlTmV4dEJ1dHRvbihkb2Mpe1xuICBjb25zdCBuZXh0ID0gZG9jLmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpXG4gIG5leHQuaWQgPSBgJHtib3h9LW5leHRgXG4gIG5leHQuY2xhc3NOYW1lID0gYCR7Ym94fS1tb3ZlLWJ1dHRvbiAke2JveH0tbmV4dC1idXR0b25gXG4gIG5leHQuaW5uZXJIVE1MID0gXCImZ3RcIlxuICBuZXh0LnR5cGUgPSBcImJ1dHRvblwiXG4gIHJldHVybiBuZXh0XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVNwaW5uZXIoZG9jKXtcbiAgY29uc3Qgc3Bpbm5lciA9IGRvYy5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICBzcGlubmVyLmlkID0gYCR7Ym94fS1zcGlubmVyYFxuICBzcGlubmVyLmNsYXNzTmFtZSA9IGAke2JveH0tc3Bpbm5lcmBcblxuICByZXR1cm4gc3Bpbm5lclxufVxuXG5mdW5jdGlvbiBjcmVhdGVTcGlubmVyV3JhcHBlcihkb2MpIHtcbiAgY29uc3Qgd3JhcHBlciA9IGRvYy5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICB3cmFwcGVyLmlkID0gYCR7Ym94fS1zcGlubmVyLXdyYXBwZXJgXG4gIHdyYXBwZXIuY2xhc3NOYW1lID0gYCR7Ym94fS1zcGlubmVyLXdyYXBwZXJgXG5cbiAgcmV0dXJuIHdyYXBwZXJcbn1cblxuZnVuY3Rpb24gY3JlYXRlRnJhbWUoZG9jKXtcbiAgY29uc3QgZnJhbWUgPSBkb2MuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgZnJhbWUuaWQgPSBgJHtib3h9LWZyYW1lYFxuICBmcmFtZS5jbGFzc05hbWUgPSBgJHtib3h9LWZyYW1lYFxuXG4gIGNvbnN0IGltYWdlID0gZG9jLmNyZWF0ZUVsZW1lbnQoJ2ltZycpXG4gIGltYWdlLmNsYXNzTmFtZSA9IGAke2JveH0tZnJhbWUtaW1hZ2VgXG4gIGltYWdlLmlkID0gYCR7Ym94fS1mcmFtZS1pbWFnZWBcblxuICBjb25zdCBsaW5rID0gZG9jLmNyZWF0ZUVsZW1lbnQoJ2EnKVxuICBsaW5rLmFwcGVuZENoaWxkKGltYWdlKVxuXG4gIGJpbmQobGluaywgJ2NsaWNrJywgZSA9PiB7IGUucHJldmVudERlZmF1bHQoKSB9KVxuXG4gIGZyYW1lLmFwcGVuZENoaWxkKGxpbmspXG4gIHJldHVybiB7Y29udGFpbmVyOiBmcmFtZSwgaW1hZ2U6IGltYWdlLCBsaW5rOiBsaW5rfVxufVxuXG5mdW5jdGlvbiBjcmVhdGVPdmVybGF5Qm94KGRvYyl7XG4gIGNvbnN0IG92ZXJsYXkgPSBkb2MuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgb3ZlcmxheS5jbGFzc05hbWUgPSBgJHtib3h9LW92ZXJsYXlgXG4gIG92ZXJsYXkuaWQgPSBgJHtib3h9LW92ZXJsYXlgXG4gIHJldHVybiBvdmVybGF5XG59XG5cbmZ1bmN0aW9uIGdldE92ZXJsYXlCb3goZG9jKSB7XG4gIGNvbnN0IG92ZXJsYXkgPSBkb2MuZ2V0RWxlbWVudEJ5SWQoYCR7Ym94fS1vdmVybGF5YClcbiAgcmV0dXJuIG92ZXJsYXlcbn1cblxuZnVuY3Rpb24gaGlkZShlbCkge1xuICBlbC5jbGFzc05hbWUgPSBlbC5jbGFzc05hbWUucmVwbGFjZShgICR7Ym94fS1oaWRlYCwgJycpICsgYCAke2JveH0taGlkZWBcbn1cblxuZnVuY3Rpb24gc2hvdyhlbCkge1xuICBlbC5jbGFzc05hbWUgPSBlbC5jbGFzc05hbWUucmVwbGFjZShgICR7Ym94fS1oaWRlYCwgJycpXG59XG5cbmZ1bmN0aW9uIGFwcGVuZENoaWxkKGRvYywgZWwpIHtcbiAgZG9jLmdldEVsZW1lbnRzQnlUYWdOYW1lKCdib2R5JylbMF0uYXBwZW5kQ2hpbGQoZWwpXG5cbn1cblxuZXhwb3J0IHtcbiAgY3JlYXRlUHJldmlvdXNCdXR0b24sXG4gIGNyZWF0ZU5leHRCdXR0b24sXG4gIGNyZWF0ZUZyYW1lLFxuICBjcmVhdGVPdmVybGF5Qm94LFxuICBjcmVhdGVTcGlubmVyLFxuICBjcmVhdGVTcGlubmVyV3JhcHBlcixcbiAgZ2V0T3ZlcmxheUJveCxcbiAgaGlkZSxcbiAgc2hvdyxcbiAgYXBwZW5kQ2hpbGRcbn1cbiJdfQ==
