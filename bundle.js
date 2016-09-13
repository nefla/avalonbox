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

  var active = void 0;
  var currentLink = void 0;

  initialize();

  function initialize() {
    active = false;
    html.appendChild(doc, overlay);
    buttons.prev = html.createPreviousButton(doc, box);
    buttons.next = html.createNextButton(doc, box);
    frame.container.appendChild(buttons.prev);
    frame.container.appendChild(buttons.next);
    overlay.appendChild(frame.container);
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
    frame.image.src = "";
    var downloadImage = new Image();
    downloadImage.onload = function () {
      frame.image.src = this.src;
    };

    setTimeout(function () {
      downloadImage.src = currentLink.getAttribute('href');
    }, 100);

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwYWdlcy9qcy9hcHAuanMiLCJzcmMvc2NyaXB0cy9hdmFsb25ib3guanMiLCJzcmMvc2NyaXB0cy9iaW5kLmpzIiwic3JjL3NjcmlwdHMvaHRtbC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUE7Ozs7OztBQUVBLFNBQVMsa0JBQVQsR0FBOEIsWUFBVTtBQUN0QyxNQUFHLFNBQVMsVUFBVCxLQUF3QixVQUEzQixFQUFzQztBQUNwQyx3QkFBVSxHQUFWLENBQWMsc0JBQWQ7QUFDQSx3QkFBVSxHQUFWLENBQWMsd0JBQWQ7QUFDQSx3QkFBVSxHQUFWLENBQWMsb0JBQWQ7QUFDRDtBQUNGLENBTkQ7Ozs7O0FDRkE7O0lBQWEsSTs7QUFDYjs7Ozs7Ozs7QUFFQSxJQUFNLFlBQWEsWUFBVTtBQUMzQixNQUFNLE1BQU0sUUFBWjtBQUNBLE1BQU0sTUFBTSxXQUFaO0FBQ0EsTUFBTSxVQUFVLEVBQWhCO0FBQ0EsTUFBTSxVQUFVLEtBQUssZ0JBQUwsQ0FBc0IsR0FBdEIsRUFBMkIsR0FBM0IsQ0FBaEI7QUFDQSxNQUFNLFFBQVEsS0FBSyxXQUFMLENBQWlCLEdBQWpCLEVBQXNCLEdBQXRCLENBQWQ7O0FBRUEsTUFBSSxlQUFKO0FBQ0EsTUFBSSxvQkFBSjs7QUFFQTs7QUFFQSxXQUFTLFVBQVQsR0FBcUI7QUFDbkIsYUFBUyxLQUFUO0FBQ0EsU0FBSyxXQUFMLENBQWlCLEdBQWpCLEVBQXNCLE9BQXRCO0FBQ0EsWUFBUSxJQUFSLEdBQWUsS0FBSyxvQkFBTCxDQUEwQixHQUExQixFQUErQixHQUEvQixDQUFmO0FBQ0EsWUFBUSxJQUFSLEdBQWUsS0FBSyxnQkFBTCxDQUFzQixHQUF0QixFQUEyQixHQUEzQixDQUFmO0FBQ0EsVUFBTSxTQUFOLENBQWdCLFdBQWhCLENBQTRCLFFBQVEsSUFBcEM7QUFDQSxVQUFNLFNBQU4sQ0FBZ0IsV0FBaEIsQ0FBNEIsUUFBUSxJQUFw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UixHQUFnQixHQUFoQjtBQUNBLFNBQU8sT0FBUDtBQUNEOztBQUVELFNBQVMsYUFBVCxDQUF1QixHQUF2QixFQUE0QixHQUE1QixFQUFpQztBQUMvQixNQUFNLFVBQVUsSUFBSSxjQUFKLENBQXNCLEdBQXRCLGNBQWhCO0FBQ0EsU0FBTyxPQUFQO0FBQ0Q7O0FBRUQsU0FBUyxJQUFULENBQWMsRUFBZCxFQUFrQjtBQUNoQixLQUFHLFNBQUgsR0FBZSxHQUFHLFNBQUgsQ0FBYSxPQUFiLENBQXFCLE9BQXJCLEVBQThCLEVBQTlCLElBQW9DLE9BQW5EO0FBQ0Q7O0FBRUQsU0FBUyxJQUFULENBQWMsRUFBZCxFQUFrQjtBQUNoQixLQUFHLFNBQUgsR0FBZSxHQUFHLFNBQUgsQ0FBYSxPQUFiLENBQXFCLE9BQXJCLEVBQThCLEVBQTlCLENBQWY7QUFDRDs7QUFFRCxTQUFTLFdBQVQsQ0FBcUIsR0FBckIsRUFBMEIsRUFBMUIsRUFBOEI7QUFDNUIsTUFBSSxvQkFBSixDQUF5QixNQUF6QixFQUFpQyxDQUFqQyxFQUFvQyxXQUFwQyxDQUFnRCxFQUFoRDtBQUVEOztRQUdDLG9CLEdBQUEsb0I7UUFDQSxnQixHQUFBLGdCO1FBQ0EsVyxHQUFBLFc7UUFDQSxnQixHQUFBLGdCO1FBQ0EsYSxHQUFBLGE7UUFDQSxJLEdBQUEsSTtRQUNBLEksR0FBQSxJO1FBQ0EsVyxHQUFBLFciLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiaW1wb3J0IGF2YWxvbmJveCBmcm9tICcuLi8uLi9zcmMvc2NyaXB0cy9hdmFsb25ib3gnO1xuXG5kb2N1bWVudC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbigpe1xuICBpZihkb2N1bWVudC5yZWFkeVN0YXRlID09PSAnY29tcGxldGUnKXtcbiAgICBhdmFsb25ib3gucnVuKCdpbWFnZS1nYWxsZXJ5LXNpbmdsZScpO1xuICAgIGF2YWxvbmJveC5ydW4oJ2ltYWdlLWdhbGxlcnktbXVsdGlwbGUnKTtcbiAgICBhdmFsb25ib3gucnVuKCdpbWFnZS1nYWxsZXJ5LW1hbnknKTtcbiAgfVxufVxuIiwiaW1wb3J0ICAqIGFzIGh0bWwgZnJvbSAnLi9odG1sJ1xuaW1wb3J0IGJpbmQgZnJvbSAnLi9iaW5kJ1xuXG5jb25zdCBBdmFsb25ib3ggPSAoZnVuY3Rpb24oKXtcbiAgY29uc3QgZG9jID0gZG9jdW1lbnRcbiAgY29uc3QgYm94ID0gJ2F2YWxvbmJveCdcbiAgY29uc3QgYnV0dG9ucyA9IHt9XG4gIGNvbnN0IG92ZXJsYXkgPSBodG1sLmNyZWF0ZU92ZXJsYXlCb3goZG9jLCBib3gpXG4gIGNvbnN0IGZyYW1lID0gaHRtbC5jcmVhdGVGcmFtZShkb2MsIGJveClcblxuICBsZXQgYWN0aXZlXG4gIGxldCBjdXJyZW50TGlua1xuXG4gIGluaXRpYWxpemUoKVxuXG4gIGZ1bmN0aW9uIGluaXRpYWxpemUoKXtcbiAgICBhY3RpdmUgPSBmYWxzZVxuICAgIGh0bWwuYXBwZW5kQ2hpbGQoZG9jLCBvdmVybGF5KVxuICAgIGJ1dHRvbnMucHJldiA9IGh0bWwuY3JlYXRlUHJldmlvdXNCdXR0b24oZG9jLCBib3gpXG4gICAgYnV0dG9ucy5uZXh0ID0gaHRtbC5jcmVhdGVOZXh0QnV0dG9uKGRvYywgYm94KVxuICAgIGZyYW1lLmNvbnRhaW5lci5hcHBlbmRDaGlsZChidXR0b25zLnByZXYpXG4gICAgZnJhbWUuY29udGFpbmVyLmFwcGVuZENoaWxkKGJ1dHRvbnMubmV4dClcbiAgICBvdmVybGF5LmFwcGVuZENoaWxkKGZyYW1lLmNvbnRhaW5lcilcbiAgICBvdmVybGF5LmFwcGVuZENoaWxkKGJ1dHRvbnMucHJldilcbiAgICBvdmVybGF5LmFwcGVuZENoaWxkKGJ1dHRvbnMubmV4dClcblxuXG4gICAgYmluZChvdmVybGF5LCAnY2xpY2snLCBoaWRlT3ZlcmxheSlcbiAgICBiaW5kKGJ1dHRvbnMucHJldiwgJ2NsaWNrJywgcHJldmlvdXMpXG4gICAgYmluZChidXR0b25zLm5leHQsICdjbGljaycsIG5leHQpXG4gICAgYmluZChkb2MsICdrZXlkb3duJywga2V5UHJlc3NIYW5kbGVyKVxuICB9XG5cbiAgZnVuY3Rpb24gaGlkZU92ZXJsYXkoZSl7XG4gICAgbGV0IGYgPSBmcmFtZS5jb250YWluZXI7XG4gICAgaWYgKChmID09PSBlLnRhcmdldCkgfHwgKCEgZi5jb250YWlucyhlLnRhcmdldCkpKVxuICAgICAgY2xlYW5GcmFtZSgpXG4gIH1cblxuICBmdW5jdGlvbiBjbGVhbkZyYW1lKCl7XG4gICAgb3ZlcmxheS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnXG4gICAgZnJhbWUuaW1hZ2Uuc3JjID0gXCJcIlxuICAgIGFjdGl2ZSA9IGZhbHNlXG4gIH1cblxuICBmdW5jdGlvbiBzaG93T3ZlcmxheShlKXtcbiAgICBlLnByZXZlbnREZWZhdWx0KClcblxuICAgIGFjdGl2ZSA9IHRydWVcbiAgICBvdmVybGF5LnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snXG4gICAgY3VycmVudExpbmsgPSBlLnRhcmdldC5wYXJlbnROb2RlXG5cbiAgICBsb2FkSW1hZ2UoKVxuXG4gICAgaWYgKHNpbmdsZShjdXJyZW50TGluay5wYXJlbnROb2RlLmlkKSkge1xuICAgICAgaHRtbC5oaWRlKGJ1dHRvbnMucHJldilcbiAgICAgIGh0bWwuaGlkZShidXR0b25zLm5leHQpXG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChjdXJyZW50TGluay5wcmV2aW91c0VsZW1lbnRTaWJsaW5nKVxuICAgICAgICBodG1sLnNob3coYnV0dG9ucy5wcmV2KVxuICAgICAgZWxzZVxuICAgICAgICBodG1sLmhpZGUoYnV0dG9ucy5wcmV2KVxuXG4gICAgICBpZiAoY3VycmVudExpbmsubmV4dEVsZW1lbnRTaWJsaW5nKVxuICAgICAgICBodG1sLnNob3coYnV0dG9ucy5uZXh0KVxuICAgICAgZWxzZVxuICAgICAgICBodG1sLmhpZGUoYnV0dG9ucy5uZXh0KVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIG5leHQoZSl7XG4gICAgaHRtbC5zaG93KGJ1dHRvbnMucHJldilcbiAgICBpZiAoY3VycmVudExpbmsubmV4dEVsZW1lbnRTaWJsaW5nKSB7XG4gICAgICBjdXJyZW50TGluayA9IGN1cnJlbnRMaW5rLm5leHRFbGVtZW50U2libGluZ1xuICAgICAgbG9hZEltYWdlKClcbiAgICAgIGlmICghY3VycmVudExpbmsubmV4dEVsZW1lbnRTaWJsaW5nKVxuICAgICAgICBodG1sLmhpZGUoYnV0dG9ucy5uZXh0KVxuICAgIH1cblxuICAgIGUuc3RvcFByb3BhZ2F0aW9uKClcbiAgfVxuXG4gIGZ1bmN0aW9uIHByZXZpb3VzKGUpe1xuICAgIGh0bWwuc2hvdyhidXR0b25zLm5leHQpXG4gICAgaWYgKGN1cnJlbnRMaW5rLnByZXZpb3VzRWxlbWVudFNpYmxpbmcpIHtcbiAgICAgIGN1cnJlbnRMaW5rID0gY3VycmVudExpbmsucHJldmlvdXNFbGVtZW50U2libGluZ1xuICAgICAgbG9hZEltYWdlKClcbiAgICAgIGlmICghIGN1cnJlbnRMaW5rLnByZXZpb3VzRWxlbWVudFNpYmxpbmcpXG4gICAgICAgIGh0bWwuaGlkZShidXR0b25zLnByZXYpXG4gICAgfVxuXG4gICAgZS5zdG9wUHJvcGFnYXRpb24oKVxuICB9XG5cbiAgZnVuY3Rpb24gbG9hZEltYWdlKCl7XG4gICAgZnJhbWUuaW1hZ2Uuc3JjID0gXCJcIjtcbiAgICBsZXQgZG93bmxvYWRJbWFnZSA9IG5ldyBJbWFnZSgpXG4gICAgZG93bmxvYWRJbWFnZS5vbmxvYWQgPSBmdW5jdGlvbigpe1xuICAgICAgZnJhbWUuaW1hZ2Uuc3JjID0gdGhpcy5zcmNcbiAgICB9XG5cbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIGRvd25sb2FkSW1hZ2Uuc3JjID0gY3VycmVudExpbmsuZ2V0QXR0cmlidXRlKCdocmVmJylcbiAgICB9LCAxMDApXG5cbiAgICBmcmFtZS5saW5rLmhyZWYgPSBjdXJyZW50TGluay5nZXRBdHRyaWJ1dGUoJ2hyZWYnKVxuICB9XG5cbiAgLy8gVE9ETzogU3dhcCBbXS5zbGljZSBmb3IgQXJyYXkuZnJvbSAoRVM2KVxuICAvLyBOZWVkIHRvIHRlc3QgaW4gSUU5XG4gIGZ1bmN0aW9uIHNpbmdsZShxdWVyeSl7XG4gICAgY29uc3QgbGlua3MgPSBkb2MuZ2V0RWxlbWVudEJ5SWQocXVlcnkpXG4gICAgICAuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2EnKVxuICAgIHJldHVybiBbXS5zbGljZS5jYWxsKGxpbmtzKS5sZW5ndGggPT0gMVxuICB9XG5cbiAgZnVuY3Rpb24gcnVuKHF1ZXJ5KXtcbiAgICBldmVudEhhbmRsZXJzKHF1ZXJ5KVxuICB9XG5cbiAgZnVuY3Rpb24gZXZlbnRIYW5kbGVycyhxdWVyeSl7XG4gICAgbGV0IGxpbmtzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQocXVlcnkpXG4gICAgICAuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2EnKVxuICAgIGxpbmtzID0gW10uc2xpY2UuY2FsbChsaW5rcylcbiAgICBsaW5rcy5mb3JFYWNoKGxpbmsgPT4ge1xuICAgICAgYmluZChsaW5rLCAnY2xpY2snLCBzaG93T3ZlcmxheSlcbiAgICB9KVxuXG4gIH1cblxuICBmdW5jdGlvbiBrZXlQcmVzc0hhbmRsZXIoZSl7XG4gICAgZSA9IGUgfHwgd2luZG93LmV2ZW50XG5cbiAgICBpZiAoIWFjdGl2ZSlcbiAgICAgIHJldHVyblxuXG4gICAgaWYgKGUua2V5Q29kZSA9PSAnMzcnKVxuICAgICAgcHJldmlvdXMoKVxuICAgIGVsc2UgaWYgKGUua2V5Q29kZSA9PSAnMzknKVxuICAgICAgbmV4dCgpXG4gIH1cblxuICByZXR1cm4ge1xuICAgIHJ1blxuICB9XG59KSgpXG5cbm1vZHVsZS5leHBvcnRzID0gQXZhbG9uYm94XG4iLCJmdW5jdGlvbiBiaW5kKGVsZW1lbnQsIGV2ZW50LCBjYWxsYmFjaywgdXNlQ2FwdHVyZSkge1xuICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoZXZlbnQsIGNhbGxiYWNrLCB1c2VDYXB0dXJlKVxufVxuXG5leHBvcnQgZGVmYXVsdCBiaW5kXG4iLCJpbXBvcnQgYmluZCBmcm9tICcuL2JpbmQnXG5cbmZ1bmN0aW9uIGNyZWF0ZVByZXZpb3VzQnV0dG9uKGRvYywgYm94KXtcbiAgY29uc3QgcHJldiA9IGRvYy5jcmVhdGVFbGVtZW50KCdidXR0b24nKVxuICBwcmV2LmlkID0gXCJwcmV2aW91c1wiXG4gIHByZXYuY2xhc3NOYW1lID0gYCR7Ym94fS1wcmV2LWJ1dHRvbmBcbiAgcHJldi5pbm5lckhUTUwgPSBcIiZsdFwiXG4gIHByZXYudHlwZSA9IFwiYnV0dG9uXCJcbiAgcmV0dXJuIHByZXZcbn1cblxuZnVuY3Rpb24gY3JlYXRlTmV4dEJ1dHRvbihkb2MsIGJveCl7XG4gIGNvbnN0IG5leHQgPSBkb2MuY3JlYXRlRWxlbWVudCgnYnV0dG9uJylcbiAgbmV4dC5pZCA9IFwibmV4dFwiXG4gIG5leHQuY2xhc3NOYW1lID0gYCR7Ym94fS1uZXh0LWJ1dHRvbmBcbiAgbmV4dC5pbm5lckhUTUwgPSBcIiZndFwiXG4gIG5leHQudHlwZSA9IFwiYnV0dG9uXCJcbiAgcmV0dXJuIG5leHRcbn1cblxuZnVuY3Rpb24gY3JlYXRlRnJhbWUoZG9jLCBib3gpe1xuICBjb25zdCBmcmFtZSA9IGRvYy5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICBmcmFtZS5pZCA9IGAke2JveH0tZnJhbWVgXG4gIGZyYW1lLmNsYXNzTmFtZSA9IGAke2JveH0tZnJhbWVgXG5cbiAgY29uc3QgaW1hZ2UgPSBkb2MuY3JlYXRlRWxlbWVudCgnaW1nJylcbiAgaW1hZ2UuY2xhc3NOYW1lID0gYCR7Ym94fS1mcmFtZS1pbWFnZWBcbiAgaW1hZ2UuaWQgPSBgJHtib3h9LWZyYW1lLWltYWdlYFxuXG4gIGNvbnN0IGxpbmsgPSBkb2MuY3JlYXRlRWxlbWVudCgnYScpXG4gIGxpbmsuYXBwZW5kQ2hpbGQoaW1hZ2UpXG5cbiAgYmluZChsaW5rLCAnY2xpY2snLCBlID0+IHsgZS5wcmV2ZW50RGVmYXVsdCgpIH0pXG5cbiAgZnJhbWUuYXBwZW5kQ2hpbGQobGluaylcbiAgcmV0dXJuIHtjb250YWluZXI6IGZyYW1lLCBpbWFnZTogaW1hZ2UsIGxpbms6IGxpbmt9XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZU92ZXJsYXlCb3goZG9jLCBib3gpe1xuICBjb25zdCBvdmVybGF5ID0gZG9jLmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gIG92ZXJsYXkuY2xhc3NOYW1lID0gYCR7Ym94fS1vdmVybGF5YFxuICBvdmVybGF5LmlkID0gYCR7Ym94fS1vdmVybGF5YFxuICByZXR1cm4gb3ZlcmxheVxufVxuXG5mdW5jdGlvbiBnZXRPdmVybGF5Qm94KGRvYywgYm94KSB7XG4gIGNvbnN0IG92ZXJsYXkgPSBkb2MuZ2V0RWxlbWVudEJ5SWQoYCR7Ym94fS1vdmVybGF5YClcbiAgcmV0dXJuIG92ZXJsYXlcbn1cblxuZnVuY3Rpb24gaGlkZShlbCkge1xuICBlbC5jbGFzc05hbWUgPSBlbC5jbGFzc05hbWUucmVwbGFjZSgnIGhpZGUnLCAnJykgKyAnIGhpZGUnXG59XG5cbmZ1bmN0aW9uIHNob3coZWwpIHtcbiAgZWwuY2xhc3NOYW1lID0gZWwuY2xhc3NOYW1lLnJlcGxhY2UoJyBoaWRlJywgJycpXG59XG5cbmZ1bmN0aW9uIGFwcGVuZENoaWxkKGRvYywgZWwpIHtcbiAgZG9jLmdldEVsZW1lbnRzQnlUYWdOYW1lKCdib2R5JylbMF0uYXBwZW5kQ2hpbGQoZWwpXG5cbn1cblxuZXhwb3J0IHtcbiAgY3JlYXRlUHJldmlvdXNCdXR0b24sXG4gIGNyZWF0ZU5leHRCdXR0b24sXG4gIGNyZWF0ZUZyYW1lLFxuICBjcmVhdGVPdmVybGF5Qm94LFxuICBnZXRPdmVybGF5Qm94LFxuICBoaWRlLFxuICBzaG93LFxuICBhcHBlbmRDaGlsZFxufVxuIl19
