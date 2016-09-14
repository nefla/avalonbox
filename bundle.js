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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwYWdlcy9qcy9hcHAuanMiLCJzcmMvc2NyaXB0cy9hdmFsb25ib3guanMiLCJzcmMvc2NyaXB0cy9iaW5kLmpzIiwic3JjL3NjcmlwdHMvaHRtbC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUE7Ozs7OztBQUVBLFNBQVMsa0JBQVQsR0FBOEIsWUFBVTtBQUN0QyxNQUFHLFNBQVMsVUFBVCxLQUF3QixVQUEzQixFQUFzQztBQUNwQyx3QkFBVSxHQUFWLENBQWMsc0JBQWQ7QUFDQSx3QkFBVSxHQUFWLENBQWMsd0JBQWQ7QUFDQSx3QkFBVSxHQUFWLENBQWMsb0JBQWQ7QUFDRDtBQUNGLENBTkQ7Ozs7O0FDRkE7O0lBQWEsSTs7QUFDYjs7Ozs7Ozs7QUFFQSxJQUFNLFlBQWEsWUFBVTtBQUMzQixNQUFNLE1BQU0sUUFBWjtBQUNBLE1BQU0sTUFBTSxXQUFaO0FBQ0EsTUFBTSxVQUFVLEVBQWhCO0FBQ0EsTUFBTSxVQUFVLEtBQUssZ0JBQUwsQ0FBc0IsR0FBdEIsRUFBMkIsR0FBM0IsQ0FBaEI7QUFDQSxNQUFNLFFBQVEsS0FBSyxXQUFMLENBQWlCLEdBQWpCLEVBQXNCLEdBQXRCLENBQWQ7QUFDQSxNQUFNLFVBQVUsS0FBSyxhQUFMLENBQW1CLEdBQW5CLEVBQXdCLEdBQXhCLENBQWhCO0FBQ0EsTUFBTSxpQkFBaUIsS0FBSyxvQkFBTCxDQUEwQixHQUExQixFQUErQixHQUEvQixDQUF2Qjs7QUFFQSxNQUFJLGVBQUo7QUFDQSxNQUFJLG9CQUFKOztBQUVBOztBQUVBLFdBQVMsVUFBVCxHQUFxQjtBQUNuQixhQUFTLEtBQVQ7QUFDQSxTQUFLLFdBQUwsQ0FBaUIsR0FBakIsRUFBc0IsT0FBdEI7QUFDQSxZQUFRLElBQVIsR0FBZSxLQUFLLG9CQUFMLENBQTBCLEdBQTFCLEVBQStCLEdBQS9CLENBQWY7QUFDQSxZQUFRLElBQVIsR0FBZSxLQUFLLGdCQUFMLENB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QXJCLEVBQTBCLEVBQTFCLEVBQThCO0FBQzVCLE1BQUksb0JBQUosQ0FBeUIsTUFBekIsRUFBaUMsQ0FBakMsRUFBb0MsV0FBcEMsQ0FBZ0QsRUFBaEQ7QUFFRDs7UUFHQyxvQixHQUFBLG9CO1FBQ0EsZ0IsR0FBQSxnQjtRQUNBLFcsR0FBQSxXO1FBQ0EsZ0IsR0FBQSxnQjtRQUNBLGEsR0FBQSxhO1FBQ0Esb0IsR0FBQSxvQjtRQUNBLGEsR0FBQSxhO1FBQ0EsSSxHQUFBLEk7UUFDQSxJLEdBQUEsSTtRQUNBLFcsR0FBQSxXIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImltcG9ydCBhdmFsb25ib3ggZnJvbSAnLi4vLi4vc3JjL3NjcmlwdHMvYXZhbG9uYm94JztcblxuZG9jdW1lbnQub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24oKXtcbiAgaWYoZG9jdW1lbnQucmVhZHlTdGF0ZSA9PT0gJ2NvbXBsZXRlJyl7XG4gICAgYXZhbG9uYm94LnJ1bignaW1hZ2UtZ2FsbGVyeS1zaW5nbGUnKTtcbiAgICBhdmFsb25ib3gucnVuKCdpbWFnZS1nYWxsZXJ5LW11bHRpcGxlJyk7XG4gICAgYXZhbG9uYm94LnJ1bignaW1hZ2UtZ2FsbGVyeS1tYW55Jyk7XG4gIH1cbn1cbiIsImltcG9ydCAgKiBhcyBodG1sIGZyb20gJy4vaHRtbCdcbmltcG9ydCBiaW5kIGZyb20gJy4vYmluZCdcblxuY29uc3QgQXZhbG9uYm94ID0gKGZ1bmN0aW9uKCl7XG4gIGNvbnN0IGRvYyA9IGRvY3VtZW50XG4gIGNvbnN0IGJveCA9ICdhdmFsb25ib3gnXG4gIGNvbnN0IGJ1dHRvbnMgPSB7fVxuICBjb25zdCBvdmVybGF5ID0gaHRtbC5jcmVhdGVPdmVybGF5Qm94KGRvYywgYm94KVxuICBjb25zdCBmcmFtZSA9IGh0bWwuY3JlYXRlRnJhbWUoZG9jLCBib3gpXG4gIGNvbnN0IHNwaW5uZXIgPSBodG1sLmNyZWF0ZVNwaW5uZXIoZG9jLCBib3gpXG4gIGNvbnN0IHNwaW5uZXJXcmFwcGVyID0gaHRtbC5jcmVhdGVTcGlubmVyV3JhcHBlcihkb2MsIGJveClcblxuICBsZXQgYWN0aXZlXG4gIGxldCBjdXJyZW50TGlua1xuXG4gIGluaXRpYWxpemUoKVxuXG4gIGZ1bmN0aW9uIGluaXRpYWxpemUoKXtcbiAgICBhY3RpdmUgPSBmYWxzZVxuICAgIGh0bWwuYXBwZW5kQ2hpbGQoZG9jLCBvdmVybGF5KVxuICAgIGJ1dHRvbnMucHJldiA9IGh0bWwuY3JlYXRlUHJldmlvdXNCdXR0b24oZG9jLCBib3gpXG4gICAgYnV0dG9ucy5uZXh0ID0gaHRtbC5jcmVhdGVOZXh0QnV0dG9uKGRvYywgYm94KVxuICAgIHNwaW5uZXJXcmFwcGVyLmFwcGVuZENoaWxkKHNwaW5uZXIpXG4gICAgb3ZlcmxheS5hcHBlbmRDaGlsZChmcmFtZS5jb250YWluZXIpXG4gICAgb3ZlcmxheS5hcHBlbmRDaGlsZChzcGlubmVyV3JhcHBlcilcbiAgICBvdmVybGF5LmFwcGVuZENoaWxkKGJ1dHRvbnMucHJldilcbiAgICBvdmVybGF5LmFwcGVuZENoaWxkKGJ1dHRvbnMubmV4dClcblxuXG4gICAgYmluZChvdmVybGF5LCAnY2xpY2snLCBoaWRlT3ZlcmxheSlcbiAgICBiaW5kKGJ1dHRvbnMucHJldiwgJ2NsaWNrJywgcHJldmlvdXMpXG4gICAgYmluZChidXR0b25zLm5leHQsICdjbGljaycsIG5leHQpXG4gICAgYmluZChkb2MsICdrZXlkb3duJywga2V5UHJlc3NIYW5kbGVyKVxuICB9XG5cbiAgZnVuY3Rpb24gaGlkZU92ZXJsYXkoZSl7XG4gICAgbGV0IGYgPSBmcmFtZS5jb250YWluZXI7XG4gICAgaWYgKChmID09PSBlLnRhcmdldCkgfHwgKCEgZi5jb250YWlucyhlLnRhcmdldCkpKVxuICAgICAgY2xlYW5GcmFtZSgpXG4gIH1cblxuICBmdW5jdGlvbiBjbGVhbkZyYW1lKCl7XG4gICAgb3ZlcmxheS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnXG4gICAgZnJhbWUuaW1hZ2Uuc3JjID0gXCJcIlxuICAgIGFjdGl2ZSA9IGZhbHNlXG4gIH1cblxuICBmdW5jdGlvbiBzaG93T3ZlcmxheShlKXtcbiAgICBlLnByZXZlbnREZWZhdWx0KClcblxuICAgIGFjdGl2ZSA9IHRydWVcbiAgICBvdmVybGF5LnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snXG4gICAgY3VycmVudExpbmsgPSBlLnRhcmdldC5wYXJlbnROb2RlXG5cbiAgICBsb2FkSW1hZ2UoKVxuXG4gICAgaWYgKHNpbmdsZShjdXJyZW50TGluay5wYXJlbnROb2RlLmlkKSkge1xuICAgICAgaHRtbC5oaWRlKGJ1dHRvbnMucHJldilcbiAgICAgIGh0bWwuaGlkZShidXR0b25zLm5leHQpXG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChjdXJyZW50TGluay5wcmV2aW91c0VsZW1lbnRTaWJsaW5nKVxuICAgICAgICBodG1sLnNob3coYnV0dG9ucy5wcmV2KVxuICAgICAgZWxzZVxuICAgICAgICBodG1sLmhpZGUoYnV0dG9ucy5wcmV2KVxuXG4gICAgICBpZiAoY3VycmVudExpbmsubmV4dEVsZW1lbnRTaWJsaW5nKVxuICAgICAgICBodG1sLnNob3coYnV0dG9ucy5uZXh0KVxuICAgICAgZWxzZVxuICAgICAgICBodG1sLmhpZGUoYnV0dG9ucy5uZXh0KVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIG5leHQoZSl7XG4gICAgaHRtbC5zaG93KGJ1dHRvbnMucHJldilcbiAgICBpZiAoY3VycmVudExpbmsubmV4dEVsZW1lbnRTaWJsaW5nKSB7XG4gICAgICBjdXJyZW50TGluayA9IGN1cnJlbnRMaW5rLm5leHRFbGVtZW50U2libGluZ1xuICAgICAgbG9hZEltYWdlKClcbiAgICAgIGlmICghY3VycmVudExpbmsubmV4dEVsZW1lbnRTaWJsaW5nKVxuICAgICAgICBodG1sLmhpZGUoYnV0dG9ucy5uZXh0KVxuICAgIH1cblxuICAgIGUuc3RvcFByb3BhZ2F0aW9uKClcbiAgfVxuXG4gIGZ1bmN0aW9uIHByZXZpb3VzKGUpe1xuICAgIGh0bWwuc2hvdyhidXR0b25zLm5leHQpXG4gICAgaWYgKGN1cnJlbnRMaW5rLnByZXZpb3VzRWxlbWVudFNpYmxpbmcpIHtcbiAgICAgIGN1cnJlbnRMaW5rID0gY3VycmVudExpbmsucHJldmlvdXNFbGVtZW50U2libGluZ1xuICAgICAgbG9hZEltYWdlKClcbiAgICAgIGlmICghIGN1cnJlbnRMaW5rLnByZXZpb3VzRWxlbWVudFNpYmxpbmcpXG4gICAgICAgIGh0bWwuaGlkZShidXR0b25zLnByZXYpXG4gICAgfVxuXG4gICAgZS5zdG9wUHJvcGFnYXRpb24oKVxuICB9XG5cbiAgZnVuY3Rpb24gbG9hZEltYWdlKCl7XG4gICAgZnJhbWUuaW1hZ2Uuc3JjID0gJydcbiAgICBzcGlubmVyLmNsYXNzTmFtZSA9IHNwaW5uZXIuY2xhc3NOYW1lLnJlcGxhY2UoJyBoaWRlJywgJycpXG4gICAgbGV0IGRvd25sb2FkSW1hZ2UgPSBuZXcgSW1hZ2UoKVxuICAgIGRvd25sb2FkSW1hZ2Uub25sb2FkID0gZnVuY3Rpb24oKXtcbiAgICAgIGZyYW1lLmltYWdlLnNyYyA9IHRoaXMuc3JjXG4gICAgICBzcGlubmVyLmNsYXNzTmFtZSA9IHNwaW5uZXIuY2xhc3NOYW1lICsgJyBoaWRlJ1xuICAgIH1cblxuICAgIGRvd25sb2FkSW1hZ2Uuc3JjID0gY3VycmVudExpbmsuZ2V0QXR0cmlidXRlKCdocmVmJylcbiAgICBmcmFtZS5saW5rLmhyZWYgPSBjdXJyZW50TGluay5nZXRBdHRyaWJ1dGUoJ2hyZWYnKVxuICB9XG5cbiAgLy8gVE9ETzogU3dhcCBbXS5zbGljZSBmb3IgQXJyYXkuZnJvbSAoRVM2KVxuICAvLyBOZWVkIHRvIHRlc3QgaW4gSUU5XG4gIGZ1bmN0aW9uIHNpbmdsZShxdWVyeSl7XG4gICAgY29uc3QgbGlua3MgPSBkb2MuZ2V0RWxlbWVudEJ5SWQocXVlcnkpXG4gICAgICAuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2EnKVxuICAgIHJldHVybiBbXS5zbGljZS5jYWxsKGxpbmtzKS5sZW5ndGggPT0gMVxuICB9XG5cbiAgZnVuY3Rpb24gcnVuKHF1ZXJ5KXtcbiAgICBldmVudEhhbmRsZXJzKHF1ZXJ5KVxuICB9XG5cbiAgZnVuY3Rpb24gZXZlbnRIYW5kbGVycyhxdWVyeSl7XG4gICAgbGV0IGxpbmtzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQocXVlcnkpXG4gICAgICAuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2EnKVxuICAgIGxpbmtzID0gW10uc2xpY2UuY2FsbChsaW5rcylcbiAgICBsaW5rcy5mb3JFYWNoKGxpbmsgPT4ge1xuICAgICAgYmluZChsaW5rLCAnY2xpY2snLCBzaG93T3ZlcmxheSlcbiAgICB9KVxuXG4gIH1cblxuICBmdW5jdGlvbiBrZXlQcmVzc0hhbmRsZXIoZSl7XG4gICAgZSA9IGUgfHwgd2luZG93LmV2ZW50XG5cbiAgICBpZiAoIWFjdGl2ZSlcbiAgICAgIHJldHVyblxuXG4gICAgaWYgKGUua2V5Q29kZSA9PSAnMzcnKVxuICAgICAgcHJldmlvdXMoZSlcbiAgICBlbHNlIGlmIChlLmtleUNvZGUgPT0gJzM5JylcbiAgICAgIG5leHQoZSlcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgcnVuXG4gIH1cbn0pKClcblxubW9kdWxlLmV4cG9ydHMgPSBBdmFsb25ib3hcbiIsImZ1bmN0aW9uIGJpbmQoZWxlbWVudCwgZXZlbnQsIGNhbGxiYWNrLCB1c2VDYXB0dXJlKSB7XG4gIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihldmVudCwgY2FsbGJhY2ssIHVzZUNhcHR1cmUpXG59XG5cbmV4cG9ydCBkZWZhdWx0IGJpbmRcbiIsImltcG9ydCBiaW5kIGZyb20gJy4vYmluZCdcblxuZnVuY3Rpb24gY3JlYXRlUHJldmlvdXNCdXR0b24oZG9jLCBib3gpe1xuICBjb25zdCBwcmV2ID0gZG9jLmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpXG4gIHByZXYuaWQgPSBcInByZXZpb3VzXCJcbiAgcHJldi5jbGFzc05hbWUgPSBgJHtib3h9LXByZXYtYnV0dG9uYFxuICBwcmV2LmlubmVySFRNTCA9IFwiJmx0XCJcbiAgcHJldi50eXBlID0gXCJidXR0b25cIlxuICByZXR1cm4gcHJldlxufVxuXG5mdW5jdGlvbiBjcmVhdGVOZXh0QnV0dG9uKGRvYywgYm94KXtcbiAgY29uc3QgbmV4dCA9IGRvYy5jcmVhdGVFbGVtZW50KCdidXR0b24nKVxuICBuZXh0LmlkID0gXCJuZXh0XCJcbiAgbmV4dC5jbGFzc05hbWUgPSBgJHtib3h9LW5leHQtYnV0dG9uYFxuICBuZXh0LmlubmVySFRNTCA9IFwiJmd0XCJcbiAgbmV4dC50eXBlID0gXCJidXR0b25cIlxuICByZXR1cm4gbmV4dFxufVxuXG5mdW5jdGlvbiBjcmVhdGVTcGlubmVyKGRvYywgYm94KXtcbiAgY29uc3Qgc3Bpbm5lciA9IGRvYy5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICBzcGlubmVyLmlkID0gYCR7Ym94fS1zcGlubmVyYFxuICBzcGlubmVyLmNsYXNzTmFtZSA9IGAke2JveH0tc3Bpbm5lcmBcblxuICByZXR1cm4gc3Bpbm5lclxufVxuXG5mdW5jdGlvbiBjcmVhdGVTcGlubmVyV3JhcHBlcihkb2MsIGJveCkge1xuICBjb25zdCB3cmFwcGVyID0gZG9jLmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gIHdyYXBwZXIuaWQgPSBgJHtib3h9LXNwaW5uZXItd3JhcHBlcmBcbiAgd3JhcHBlci5jbGFzc05hbWUgPSBgJHtib3h9LXNwaW5uZXItd3JhcHBlcmBcblxuICByZXR1cm4gd3JhcHBlclxufVxuXG5mdW5jdGlvbiBjcmVhdGVGcmFtZShkb2MsIGJveCl7XG4gIGNvbnN0IGZyYW1lID0gZG9jLmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gIGZyYW1lLmlkID0gYCR7Ym94fS1mcmFtZWBcbiAgZnJhbWUuY2xhc3NOYW1lID0gYCR7Ym94fS1mcmFtZWBcblxuICBjb25zdCBpbWFnZSA9IGRvYy5jcmVhdGVFbGVtZW50KCdpbWcnKVxuICBpbWFnZS5jbGFzc05hbWUgPSBgJHtib3h9LWZyYW1lLWltYWdlYFxuICBpbWFnZS5pZCA9IGAke2JveH0tZnJhbWUtaW1hZ2VgXG5cbiAgY29uc3QgbGluayA9IGRvYy5jcmVhdGVFbGVtZW50KCdhJylcbiAgbGluay5hcHBlbmRDaGlsZChpbWFnZSlcblxuICBiaW5kKGxpbmssICdjbGljaycsIGUgPT4geyBlLnByZXZlbnREZWZhdWx0KCkgfSlcblxuICBmcmFtZS5hcHBlbmRDaGlsZChsaW5rKVxuICByZXR1cm4ge2NvbnRhaW5lcjogZnJhbWUsIGltYWdlOiBpbWFnZSwgbGluazogbGlua31cbn1cblxuZnVuY3Rpb24gY3JlYXRlT3ZlcmxheUJveChkb2MsIGJveCl7XG4gIGNvbnN0IG92ZXJsYXkgPSBkb2MuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgb3ZlcmxheS5jbGFzc05hbWUgPSBgJHtib3h9LW92ZXJsYXlgXG4gIG92ZXJsYXkuaWQgPSBgJHtib3h9LW92ZXJsYXlgXG4gIHJldHVybiBvdmVybGF5XG59XG5cbmZ1bmN0aW9uIGdldE92ZXJsYXlCb3goZG9jLCBib3gpIHtcbiAgY29uc3Qgb3ZlcmxheSA9IGRvYy5nZXRFbGVtZW50QnlJZChgJHtib3h9LW92ZXJsYXlgKVxuICByZXR1cm4gb3ZlcmxheVxufVxuXG5mdW5jdGlvbiBoaWRlKGVsKSB7XG4gIGVsLmNsYXNzTmFtZSA9IGVsLmNsYXNzTmFtZS5yZXBsYWNlKCcgaGlkZScsICcnKSArICcgaGlkZSdcbn1cblxuZnVuY3Rpb24gc2hvdyhlbCkge1xuICBlbC5jbGFzc05hbWUgPSBlbC5jbGFzc05hbWUucmVwbGFjZSgnIGhpZGUnLCAnJylcbn1cblxuZnVuY3Rpb24gYXBwZW5kQ2hpbGQoZG9jLCBlbCkge1xuICBkb2MuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2JvZHknKVswXS5hcHBlbmRDaGlsZChlbClcblxufVxuXG5leHBvcnQge1xuICBjcmVhdGVQcmV2aW91c0J1dHRvbixcbiAgY3JlYXRlTmV4dEJ1dHRvbixcbiAgY3JlYXRlRnJhbWUsXG4gIGNyZWF0ZU92ZXJsYXlCb3gsXG4gIGNyZWF0ZVNwaW5uZXIsXG4gIGNyZWF0ZVNwaW5uZXJXcmFwcGVyLFxuICBnZXRPdmVybGF5Qm94LFxuICBoaWRlLFxuICBzaG93LFxuICBhcHBlbmRDaGlsZFxufVxuIl19
