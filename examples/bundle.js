(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _avalonbox = require('../../src/scripts/avalonbox');

var _avalonbox2 = _interopRequireDefault(_avalonbox);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

document.onreadystatechange = function () {
  if (document.readyState === 'complete') {
    _avalonbox2.default.init('#image-gallery');
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

  var active = void 0;
  var current_link = void 0;

  initialize();

  function initialize() {
    active = false;
    html.appendChild(doc, overlay);
    buttons.prev = html.createPreviousButton(doc, box);
    buttons.next = html.createNextButton(doc, box);
    frame.container.appendChild(buttons.prev);
    frame.container.appendChild(buttons.next);
    overlay.appendChild(frame.container);

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
    current_link = e.target.parentNode;
    frame.image.src = current_link.getAttribute('href');
    frame.link.href = current_link.getAttribute('href');

    if (single(current_link.parentNode.id)) {
      html.hide(buttons.prev);
      html.hide(buttons.next);
    } else {
      html.show(buttons.prev);
      html.show(buttons.next);
    }
  }

  function next(e) {
    current_link = current_link.nextElementSibling ? current_link.nextElementSibling : current_link;
    if (current_link) {
      frame.image.src = current_link.getAttribute('href');
      frame.link.href = current_link.getAttribute('href');
    }

    e.stopPropagation();
  }

  function previous(e) {
    current_link = current_link.previousElementSibling ? current_link.previousElementSibling : current_link;
    if (current_link) {
      frame.image.src = current_link.getAttribute('href');
      frame.link.href = current_link.getAttribute('href');
    }

    e.stopPropagation();
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
exports.appendChild = exports.show = exports.hide = exports.getOverlayBox = exports.createOverlayBox = exports.createFrame = exports.createNextButton = exports.createPreviousButton = undefined;

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
exports.getOverlayBox = getOverlayBox;
exports.hide = hide;
exports.show = show;
exports.appendChild = appendChild;

},{"./bind":3}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwYWdlcy9qcy9hcHAuanMiLCJzcmMvc2NyaXB0cy9hdmFsb25ib3guanMiLCJzcmMvc2NyaXB0cy9iaW5kLmpzIiwic3JjL3NjcmlwdHMvaHRtbC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUE7Ozs7OztBQUVBLFNBQVMsa0JBQVQsR0FBOEIsWUFBVTtBQUN0QyxNQUFHLFNBQVMsVUFBVCxLQUF3QixVQUEzQixFQUFzQztBQUNwQyx3QkFBVSxJQUFWLENBQWUsZ0JBQWY7QUFDRDtBQUNGLENBSkQ7Ozs7O0FDRkE7O0lBQWEsSTs7QUFDYjs7Ozs7Ozs7QUFFQSxJQUFNLFlBQWEsWUFBVTtBQUMzQixNQUFNLE1BQU0sUUFBWjtBQUNBLE1BQU0sTUFBTSxXQUFaO0FBQ0EsTUFBTSxVQUFVLEVBQWhCO0FBQ0EsTUFBTSxVQUFVLEtBQUssZ0JBQUwsQ0FBc0IsR0FBdEIsRUFBMkIsR0FBM0IsQ0FBaEI7QUFDQSxNQUFNLFFBQVEsS0FBSyxXQUFMLENBQWlCLEdBQWpCLEVBQXNCLEdBQXRCLENBQWQ7O0FBRUEsTUFBSSxlQUFKO0FBQ0EsTUFBSSxxQkFBSjs7QUFFQTs7QUFFQSxXQUFTLFVBQVQsR0FBcUI7QUFDbkIsYUFBUyxLQUFUO0FBQ0EsU0FBSyxXQUFMLENBQWlCLEdBQWpCLEVBQXNCLE9BQXRCO0FBQ0EsWUFBUSxJQUFSLEdBQWUsS0FBSyxvQkFBTCxDQUEwQixHQUExQixFQUErQixHQUEvQixDQUFmO0FBQ0EsWUFBUSxJQUFSLEdBQWUsS0FBSyxnQkFBTCxDQUFzQixHQUF0QixFQUEyQixHQUEzQixDQUFmO0FBQ0EsVUFBTSxTQUFOLENBQWdCLFdBQWhCLENBQTRCLFFBQVEsSUFBcEM7QUFDQSxVQUFNLFNBQU4sQ0FBZ0IsV0FBaEIsQ0FBNEIsUUFBUSxJQUFwQztBQUNBLFlBQVEsV0FBUixDQUFvQixNQUFNLFNBQTFCOztBQUVBLHdCQUFLLE9BQUwsRUFB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RDs7QUFFRCxTQUFTLFdBQVQsQ0FBcUIsR0FBckIsRUFBMEIsRUFBMUIsRUFBOEI7QUFDNUIsTUFBSSxvQkFBSixDQUF5QixNQUF6QixFQUFpQyxDQUFqQyxFQUFvQyxXQUFwQyxDQUFnRCxFQUFoRDtBQUVEOztRQUdDLG9CLEdBQUEsb0I7UUFDQSxnQixHQUFBLGdCO1FBQ0EsVyxHQUFBLFc7UUFDQSxnQixHQUFBLGdCO1FBQ0EsYSxHQUFBLGE7UUFDQSxJLEdBQUEsSTtRQUNBLEksR0FBQSxJO1FBQ0EsVyxHQUFBLFciLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiaW1wb3J0IGF2YWxvbmJveCBmcm9tICcuLi8uLi9zcmMvc2NyaXB0cy9hdmFsb25ib3gnO1xuXG5kb2N1bWVudC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbigpe1xuICBpZihkb2N1bWVudC5yZWFkeVN0YXRlID09PSAnY29tcGxldGUnKXtcbiAgICBhdmFsb25ib3guaW5pdCgnI2ltYWdlLWdhbGxlcnknKTtcbiAgfVxufVxuIiwiaW1wb3J0ICAqIGFzIGh0bWwgZnJvbSAnLi9odG1sJ1xuaW1wb3J0IGJpbmQgZnJvbSAnLi9iaW5kJ1xuXG5jb25zdCBBdmFsb25ib3ggPSAoZnVuY3Rpb24oKXtcbiAgY29uc3QgZG9jID0gZG9jdW1lbnRcbiAgY29uc3QgYm94ID0gJ2F2YWxvbmJveCdcbiAgY29uc3QgYnV0dG9ucyA9IHt9XG4gIGNvbnN0IG92ZXJsYXkgPSBodG1sLmNyZWF0ZU92ZXJsYXlCb3goZG9jLCBib3gpXG4gIGNvbnN0IGZyYW1lID0gaHRtbC5jcmVhdGVGcmFtZShkb2MsIGJveClcblxuICBsZXQgYWN0aXZlXG4gIGxldCBjdXJyZW50X2xpbmtcblxuICBpbml0aWFsaXplKClcblxuICBmdW5jdGlvbiBpbml0aWFsaXplKCl7XG4gICAgYWN0aXZlID0gZmFsc2VcbiAgICBodG1sLmFwcGVuZENoaWxkKGRvYywgb3ZlcmxheSlcbiAgICBidXR0b25zLnByZXYgPSBodG1sLmNyZWF0ZVByZXZpb3VzQnV0dG9uKGRvYywgYm94KVxuICAgIGJ1dHRvbnMubmV4dCA9IGh0bWwuY3JlYXRlTmV4dEJ1dHRvbihkb2MsIGJveClcbiAgICBmcmFtZS5jb250YWluZXIuYXBwZW5kQ2hpbGQoYnV0dG9ucy5wcmV2KVxuICAgIGZyYW1lLmNvbnRhaW5lci5hcHBlbmRDaGlsZChidXR0b25zLm5leHQpXG4gICAgb3ZlcmxheS5hcHBlbmRDaGlsZChmcmFtZS5jb250YWluZXIpXG5cbiAgICBiaW5kKG92ZXJsYXksICdjbGljaycsIGhpZGVPdmVybGF5KVxuICAgIGJpbmQoYnV0dG9ucy5wcmV2LCAnY2xpY2snLCBwcmV2aW91cylcbiAgICBiaW5kKGJ1dHRvbnMubmV4dCwgJ2NsaWNrJywgbmV4dClcbiAgICBiaW5kKGRvYywgJ2tleWRvd24nLCBrZXlQcmVzc0hhbmRsZXIpXG4gIH1cblxuICBmdW5jdGlvbiBoaWRlT3ZlcmxheShlKXtcbiAgICBsZXQgZiA9IGZyYW1lLmNvbnRhaW5lcjtcbiAgICBpZiAoKGYgPT09IGUudGFyZ2V0KSB8fCAoISBmLmNvbnRhaW5zKGUudGFyZ2V0KSkpXG4gICAgICBjbGVhbkZyYW1lKClcbiAgfVxuXG4gIGZ1bmN0aW9uIGNsZWFuRnJhbWUoKXtcbiAgICBvdmVybGF5LnN0eWxlLmRpc3BsYXkgPSAnbm9uZSdcbiAgICBmcmFtZS5pbWFnZS5zcmMgPSBcIlwiXG4gICAgYWN0aXZlID0gZmFsc2VcbiAgfVxuXG4gIGZ1bmN0aW9uIHNob3dPdmVybGF5KGUpe1xuICAgIGUucHJldmVudERlZmF1bHQoKVxuXG4gICAgYWN0aXZlID0gdHJ1ZVxuICAgIG92ZXJsYXkuc3R5bGUuZGlzcGxheSA9ICdibG9jaydcbiAgICBjdXJyZW50X2xpbmsgPSBlLnRhcmdldC5wYXJlbnROb2RlXG4gICAgZnJhbWUuaW1hZ2Uuc3JjID0gY3VycmVudF9saW5rLmdldEF0dHJpYnV0ZSgnaHJlZicpXG4gICAgZnJhbWUubGluay5ocmVmID0gY3VycmVudF9saW5rLmdldEF0dHJpYnV0ZSgnaHJlZicpXG5cbiAgICBpZiAoc2luZ2xlKGN1cnJlbnRfbGluay5wYXJlbnROb2RlLmlkKSkge1xuICAgICAgaHRtbC5oaWRlKGJ1dHRvbnMucHJldilcbiAgICAgIGh0bWwuaGlkZShidXR0b25zLm5leHQpXG4gICAgfSBlbHNlIHtcbiAgICAgIGh0bWwuc2hvdyhidXR0b25zLnByZXYpXG4gICAgICBodG1sLnNob3coYnV0dG9ucy5uZXh0KVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIG5leHQoZSl7XG4gICAgY3VycmVudF9saW5rID0gY3VycmVudF9saW5rLm5leHRFbGVtZW50U2libGluZ1xuICAgICAgPyBjdXJyZW50X2xpbmsubmV4dEVsZW1lbnRTaWJsaW5nXG4gICAgICA6IGN1cnJlbnRfbGlua1xuICAgIGlmIChjdXJyZW50X2xpbmspIHtcbiAgICAgIGZyYW1lLmltYWdlLnNyYyA9IGN1cnJlbnRfbGluay5nZXRBdHRyaWJ1dGUoJ2hyZWYnKVxuICAgICAgZnJhbWUubGluay5ocmVmID0gY3VycmVudF9saW5rLmdldEF0dHJpYnV0ZSgnaHJlZicpXG4gICAgfVxuICAgIFxuICAgIGUuc3RvcFByb3BhZ2F0aW9uKClcbiAgfVxuXG4gIGZ1bmN0aW9uIHByZXZpb3VzKGUpe1xuICAgIGN1cnJlbnRfbGluayA9IGN1cnJlbnRfbGluay5wcmV2aW91c0VsZW1lbnRTaWJsaW5nXG4gICAgICA/IGN1cnJlbnRfbGluay5wcmV2aW91c0VsZW1lbnRTaWJsaW5nXG4gICAgICA6IGN1cnJlbnRfbGlua1xuICAgIGlmIChjdXJyZW50X2xpbmspIHtcbiAgICAgIGZyYW1lLmltYWdlLnNyYyA9IGN1cnJlbnRfbGluay5nZXRBdHRyaWJ1dGUoJ2hyZWYnKVxuICAgICAgZnJhbWUubGluay5ocmVmID0gY3VycmVudF9saW5rLmdldEF0dHJpYnV0ZSgnaHJlZicpXG4gICAgfVxuXG4gICAgZS5zdG9wUHJvcGFnYXRpb24oKVxuICB9XG5cbiAgLy8gVE9ETzogU3dhcCBbXS5zbGljZSBmb3IgQXJyYXkuZnJvbSAoRVM2KVxuICAvLyBOZWVkIHRvIHRlc3QgaW4gSUU5XG4gIGZ1bmN0aW9uIHNpbmdsZShxdWVyeSl7XG4gICAgY29uc3QgbGlua3MgPSBkb2MuZ2V0RWxlbWVudEJ5SWQocXVlcnkpXG4gICAgICAuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2EnKVxuICAgIHJldHVybiBbXS5zbGljZS5jYWxsKGxpbmtzKS5sZW5ndGggPT0gMVxuICB9XG5cbiAgZnVuY3Rpb24gcnVuKHF1ZXJ5KXtcbiAgICBldmVudEhhbmRsZXJzKHF1ZXJ5KVxuICB9XG5cbiAgZnVuY3Rpb24gZXZlbnRIYW5kbGVycyhxdWVyeSl7XG4gICAgbGV0IGxpbmtzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQocXVlcnkpXG4gICAgICAuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2EnKVxuICAgIGxpbmtzID0gW10uc2xpY2UuY2FsbChsaW5rcylcbiAgICBsaW5rcy5mb3JFYWNoKGxpbmsgPT4ge1xuICAgICAgYmluZChsaW5rLCAnY2xpY2snLCBzaG93T3ZlcmxheSlcbiAgICB9KVxuXG4gIH1cblxuICBmdW5jdGlvbiBrZXlQcmVzc0hhbmRsZXIoZSl7XG4gICAgZSA9IGUgfHwgd2luZG93LmV2ZW50XG5cbiAgICBpZiAoIWFjdGl2ZSlcbiAgICAgIHJldHVyblxuXG4gICAgaWYgKGUua2V5Q29kZSA9PSAnMzcnKVxuICAgICAgcHJldmlvdXMoKVxuICAgIGVsc2UgaWYgKGUua2V5Q29kZSA9PSAnMzknKVxuICAgICAgbmV4dCgpXG4gIH1cblxuICByZXR1cm4ge1xuICAgIHJ1blxuICB9XG59KSgpXG5cbm1vZHVsZS5leHBvcnRzID0gQXZhbG9uYm94XG4iLCJmdW5jdGlvbiBiaW5kKGVsZW1lbnQsIGV2ZW50LCBjYWxsYmFjaywgdXNlQ2FwdHVyZSkge1xuICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoZXZlbnQsIGNhbGxiYWNrLCB1c2VDYXB0dXJlKVxufVxuXG5leHBvcnQgZGVmYXVsdCBiaW5kXG4iLCJpbXBvcnQgYmluZCBmcm9tICcuL2JpbmQnXG5cbmZ1bmN0aW9uIGNyZWF0ZVByZXZpb3VzQnV0dG9uKGRvYywgYm94KXtcbiAgY29uc3QgcHJldiA9IGRvYy5jcmVhdGVFbGVtZW50KCdidXR0b24nKVxuICBwcmV2LmlkID0gXCJwcmV2aW91c1wiXG4gIHByZXYuY2xhc3NOYW1lID0gYCR7Ym94fS1wcmV2LWJ1dHRvbmBcbiAgcHJldi5pbm5lckhUTUwgPSBcIiZsdFwiXG4gIHByZXYudHlwZSA9IFwiYnV0dG9uXCJcbiAgcmV0dXJuIHByZXZcbn1cblxuZnVuY3Rpb24gY3JlYXRlTmV4dEJ1dHRvbihkb2MsIGJveCl7XG4gIGNvbnN0IG5leHQgPSBkb2MuY3JlYXRlRWxlbWVudCgnYnV0dG9uJylcbiAgbmV4dC5pZCA9IFwibmV4dFwiXG4gIG5leHQuY2xhc3NOYW1lID0gYCR7Ym94fS1uZXh0LWJ1dHRvbmBcbiAgbmV4dC5pbm5lckhUTUwgPSBcIiZndFwiXG4gIG5leHQudHlwZSA9IFwiYnV0dG9uXCJcbiAgcmV0dXJuIG5leHRcbn1cblxuZnVuY3Rpb24gY3JlYXRlRnJhbWUoZG9jLCBib3gpe1xuICBjb25zdCBmcmFtZSA9IGRvYy5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICBmcmFtZS5pZCA9IGAke2JveH0tZnJhbWVgXG4gIGZyYW1lLmNsYXNzTmFtZSA9IGAke2JveH0tZnJhbWVgXG5cbiAgY29uc3QgaW1hZ2UgPSBkb2MuY3JlYXRlRWxlbWVudCgnaW1nJylcbiAgaW1hZ2UuY2xhc3NOYW1lID0gYCR7Ym94fS1mcmFtZS1pbWFnZWBcbiAgaW1hZ2UuaWQgPSBgJHtib3h9LWZyYW1lLWltYWdlYFxuXG4gIGNvbnN0IGxpbmsgPSBkb2MuY3JlYXRlRWxlbWVudCgnYScpXG4gIGxpbmsuYXBwZW5kQ2hpbGQoaW1hZ2UpXG5cbiAgYmluZChsaW5rLCAnY2xpY2snLCBlID0+IHsgZS5wcmV2ZW50RGVmYXVsdCgpIH0pXG5cbiAgZnJhbWUuYXBwZW5kQ2hpbGQobGluaylcbiAgcmV0dXJuIHtjb250YWluZXI6IGZyYW1lLCBpbWFnZTogaW1hZ2UsIGxpbms6IGxpbmt9XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZU92ZXJsYXlCb3goZG9jLCBib3gpe1xuICBjb25zdCBvdmVybGF5ID0gZG9jLmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gIG92ZXJsYXkuY2xhc3NOYW1lID0gYCR7Ym94fS1vdmVybGF5YFxuICBvdmVybGF5LmlkID0gYCR7Ym94fS1vdmVybGF5YFxuICByZXR1cm4gb3ZlcmxheVxufVxuXG5mdW5jdGlvbiBnZXRPdmVybGF5Qm94KGRvYywgYm94KSB7XG4gIGNvbnN0IG92ZXJsYXkgPSBkb2MuZ2V0RWxlbWVudEJ5SWQoYCR7Ym94fS1vdmVybGF5YClcbiAgcmV0dXJuIG92ZXJsYXlcbn1cblxuZnVuY3Rpb24gaGlkZShlbCkge1xuICBlbC5jbGFzc05hbWUgPSBlbC5jbGFzc05hbWUucmVwbGFjZSgnIGhpZGUnLCAnJykgKyAnIGhpZGUnXG59XG5cbmZ1bmN0aW9uIHNob3coZWwpIHtcbiAgZWwuY2xhc3NOYW1lID0gZWwuY2xhc3NOYW1lLnJlcGxhY2UoJyBoaWRlJywgJycpXG59XG5cbmZ1bmN0aW9uIGFwcGVuZENoaWxkKGRvYywgZWwpIHtcbiAgZG9jLmdldEVsZW1lbnRzQnlUYWdOYW1lKCdib2R5JylbMF0uYXBwZW5kQ2hpbGQoZWwpXG5cbn1cblxuZXhwb3J0IHtcbiAgY3JlYXRlUHJldmlvdXNCdXR0b24sXG4gIGNyZWF0ZU5leHRCdXR0b24sXG4gIGNyZWF0ZUZyYW1lLFxuICBjcmVhdGVPdmVybGF5Qm94LFxuICBnZXRPdmVybGF5Qm94LFxuICBoaWRlLFxuICBzaG93LFxuICBhcHBlbmRDaGlsZFxufVxuIl19
