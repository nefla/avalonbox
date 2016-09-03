(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _avalonbox = require('../../src/avalonbox');

var _avalonbox2 = _interopRequireDefault(_avalonbox);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

document.onreadystatechange = function () {
  if (document.readyState === 'complete') {
    _avalonbox2.default.init('#image-gallery');
  }
};

},{"../../src/avalonbox":2}],2:[function(require,module,exports){
'use strict';

var Avalonbox = function () {
  var active = false,
      overlay = void 0,
      frame = void 0,
      current_link = void 0,
      box = 'avalonbox',
      buttons = {};

  function hideOverlay(e) {
    if (!frame.container.contains(e.target)) {
      cleanFrame();
    }
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
  }

  function next(e) {
    current_link = current_link.nextElementSibling ? current_link.nextElementSibling : current_link;
    if (current_link) {
      frame.image.src = current_link.getAttribute('href');
      frame.link.href = current_link.getAttribute('href');
    }
  }

  function previous(e) {
    current_link = current_link.previousElementSibling ? current_link.previousElementSibling : current_link;
    if (current_link) {
      frame.image.src = current_link.getAttribute('href');
      frame.link.href = current_link.getAttribute('href');
    }
  }

  function createPreviousButton() {
    var prev = document.createElement('button');
    prev.id = "previous";
    prev.className = box + '-prev-button';
    prev.innerHTML = "&lt";
    prev.type = "button";
    return prev;
  }

  function createNextButton() {
    var next = document.createElement('button');
    next.id = "next";
    next.className = box + '-next-button';
    next.innerHTML = "&gt";
    next.type = "button";
    return next;
  }

  function createFrame(target) {
    var frame = document.createElement('div');
    frame.id = box + '-frame';
    frame.className = box + '-frame';

    var image = document.createElement('img');
    image.className = box + '-frame-image';
    image.id = box + '-frame-image';

    var link = document.createElement('a');
    link.appendChild(image);

    bind(link, 'click', function (e) {
      e.preventDefault();
    });

    frame.appendChild(link);
    return { container: frame, image: image, link: link };
  }

  function createOverlayBox() {
    var overlay = document.createElement('div');
    overlay.className = box + '-overlay';
    overlay.id = box + '-overlay';
    document.getElementsByTagName('body')[0].appendChild(overlay);
    return overlay;
  }

  function init(query) {
    overlay = createOverlayBox();
    frame = createFrame();
    buttons.prev = createPreviousButton();
    buttons.next = createNextButton();
    frame.container.appendChild(buttons.prev);
    frame.container.appendChild(buttons.next);
    overlay.appendChild(frame.container);

    eventHandlers(query);
  }

  function eventHandlers(query) {
    var links = document.getElementById(query.replace('#', '')).getElementsByTagName('a');
    links = [].slice.call(links);
    links.forEach(function (link) {
      bind(link, 'click', showOverlay);
    });

    bind(overlay, 'click', hideOverlay);
    bind(buttons.prev, 'click', previous);
    bind(buttons.next, 'click', next);
    bind(document, 'keydown', keyPressHandler);
  }

  function keyPressHandler(e) {
    e = e || window.event;

    if (!active) return;

    if (e.keyCode == '37') previous();else if (e.keyCode == '39') next();
  }

  function bind(element, event, callback, useCapture) {
    element.addEventListener(event, callback, useCapture);
  }

  return {
    init: init
  };
}();

module.exports = Avalonbox;

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJleGFtcGxlcy9qcy9hcHAuanMiLCJzcmMvYXZhbG9uYm94LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQTs7Ozs7O0FBRUEsU0FBUyxrQkFBVCxHQUE4QixZQUFVO0FBQ3RDLE1BQUcsU0FBUyxVQUFULEtBQXdCLFVBQTNCLEVBQXNDO0FBQ3BDLHdCQUFVLElBQVYsQ0FBZSxnQkFBZjtBQUNEO0FBQ0YsQ0FKRDs7Ozs7QUNGQSxJQUFNLFlBQWEsWUFBVTtBQUMzQixNQUFJLFNBQVMsS0FBYjtBQUFBLE1BQ0ksZ0JBREo7QUFBQSxNQUVJLGNBRko7QUFBQSxNQUdJLHFCQUhKO0FBQUEsTUFJSSxNQUFNLFdBSlY7QUFBQSxNQUtJLFVBQVUsRUFMZDs7QUFPQSxXQUFTLFdBQVQsQ0FBcUIsQ0FBckIsRUFBdUI7QUFDckIsUUFBSSxDQUFDLE1BQU0sU0FBTixDQUFnQixRQUFoQixDQUF5QixFQUFFLE1BQTNCLENBQUwsRUFBd0M7QUFDdEM7QUFDRDtBQUNGOztBQUVELFdBQVMsVUFBVCxHQUFxQjtBQUNuQixZQUFRLEtBQVIsQ0FBYyxPQUFkLEdBQXdCLE1BQXhCO0FBQ0EsVUFBTSxLQUFOLENBQVksR0FBWixHQUFrQixFQUFsQjtBQUNBLGFBQVMsS0FBVDtBQUNEOztBQUVELFdBQVMsV0FBVCxDQUFxQixDQUFyQixFQUF1QjtBQUNyQixNQUFFLGNBQUY7QUFDQSxhQUFTLElBQVQ7QUFDQSxZQUFRLEtBQVIsQ0FBYyxPQUFkLEdBQXdCLE9BQXhCO0FBQ0EsbUJBQWUsRUFBRSxNQUFGLENBQVMsVUFBeEI7QUFDQSxVQUFNLEtBQU4sQ0FBWSxHQUFaLEdBQWtCLGFBQWEsWUFBYixDQUEwQixNQUExQixDQUFsQjtBQUNBLFVBQU0sSUFBTixDQUFXLElBQVgsR0FBa0IsYUFBYSxZQUFiLENBQTBCLE1BQTFCLENBQWxCO0FBQ0Q7O0FBRUQsV0FBUyxJQUFULENBQWMsQ0FB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QixNQUFNLE9BQU4sQ0FBYyxHQUFkLEVBQW1CLEVBQW5CLENBQXhCLEVBQ1Qsb0JBRFMsQ0FDWSxHQURaLENBQVo7QUFFQSxZQUFRLEdBQUcsS0FBSCxDQUFTLElBQVQsQ0FBYyxLQUFkLENBQVI7QUFDQSxVQUFNLE9BQU4sQ0FBYyxnQkFBUTtBQUNwQixXQUFLLElBQUwsRUFBVyxPQUFYLEVBQW9CLFdBQXBCO0FBQ0QsS0FGRDs7QUFJQSxTQUFLLE9BQUwsRUFBYyxPQUFkLEVBQXVCLFdBQXZCO0FBQ0EsU0FBSyxRQUFRLElBQWIsRUFBbUIsT0FBbkIsRUFBNEIsUUFBNUI7QUFDQSxTQUFLLFFBQVEsSUFBYixFQUFtQixPQUFuQixFQUE0QixJQUE1QjtBQUNBLFNBQUssUUFBTCxFQUFlLFNBQWYsRUFBMEIsZUFBMUI7QUFDRDs7QUFFRCxXQUFTLGVBQVQsQ0FBeUIsQ0FBekIsRUFBMkI7QUFDekIsUUFBSSxLQUFLLE9BQU8sS0FBaEI7O0FBRUEsUUFBSSxDQUFDLE1BQUwsRUFDRTs7QUFFRixRQUFJLEVBQUUsT0FBRixJQUFhLElBQWpCLEVBQ0UsV0FERixLQUVLLElBQUksRUFBRSxPQUFGLElBQWEsSUFBakIsRUFDSDtBQUNIOztBQUVELFdBQVMsSUFBVCxDQUFjLE9BQWQsRUFBdUIsS0FBdkIsRUFBOEIsUUFBOUIsRUFBd0MsVUFBeEMsRUFBb0Q7QUFDbEQsWUFBUSxnQkFBUixDQUF5QixLQUF6QixFQUFnQyxRQUFoQyxFQUEwQyxVQUExQztBQUNEOztBQUVELFNBQU87QUFDTCxVQUFNO0FBREQsR0FBUDtBQUdELENBMUlpQixFQUFsQjs7QUE0SUEsT0FBTyxPQUFQLEdBQWlCLFNBQWpCIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImltcG9ydCBhdmFsb25ib3ggZnJvbSAnLi4vLi4vc3JjL2F2YWxvbmJveCc7XG5cbmRvY3VtZW50Lm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uKCl7XG4gIGlmKGRvY3VtZW50LnJlYWR5U3RhdGUgPT09ICdjb21wbGV0ZScpe1xuICAgIGF2YWxvbmJveC5pbml0KCcjaW1hZ2UtZ2FsbGVyeScpO1xuICB9XG59XG4iLCJjb25zdCBBdmFsb25ib3ggPSAoZnVuY3Rpb24oKXtcbiAgbGV0IGFjdGl2ZSA9IGZhbHNlLFxuICAgICAgb3ZlcmxheSxcbiAgICAgIGZyYW1lLFxuICAgICAgY3VycmVudF9saW5rLFxuICAgICAgYm94ID0gJ2F2YWxvbmJveCcsXG4gICAgICBidXR0b25zID0ge31cblxuICBmdW5jdGlvbiBoaWRlT3ZlcmxheShlKXtcbiAgICBpZiAoIWZyYW1lLmNvbnRhaW5lci5jb250YWlucyhlLnRhcmdldCkpe1xuICAgICAgY2xlYW5GcmFtZSgpXG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gY2xlYW5GcmFtZSgpe1xuICAgIG92ZXJsYXkuc3R5bGUuZGlzcGxheSA9ICdub25lJ1xuICAgIGZyYW1lLmltYWdlLnNyYyA9IFwiXCJcbiAgICBhY3RpdmUgPSBmYWxzZVxuICB9XG5cbiAgZnVuY3Rpb24gc2hvd092ZXJsYXkoZSl7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgYWN0aXZlID0gdHJ1ZVxuICAgIG92ZXJsYXkuc3R5bGUuZGlzcGxheSA9ICdibG9jaydcbiAgICBjdXJyZW50X2xpbmsgPSBlLnRhcmdldC5wYXJlbnROb2RlXG4gICAgZnJhbWUuaW1hZ2Uuc3JjID0gY3VycmVudF9saW5rLmdldEF0dHJpYnV0ZSgnaHJlZicpXG4gICAgZnJhbWUubGluay5ocmVmID0gY3VycmVudF9saW5rLmdldEF0dHJpYnV0ZSgnaHJlZicpXG4gIH1cblxuICBmdW5jdGlvbiBuZXh0KGUpe1xuICAgIGN1cnJlbnRfbGluayA9IGN1cnJlbnRfbGluay5uZXh0RWxlbWVudFNpYmxpbmdcbiAgICAgID8gY3VycmVudF9saW5rLm5leHRFbGVtZW50U2libGluZ1xuICAgICAgOiBjdXJyZW50X2xpbmtcbiAgICBpZiAoY3VycmVudF9saW5rKSB7XG4gICAgICBmcmFtZS5pbWFnZS5zcmMgPSBjdXJyZW50X2xpbmsuZ2V0QXR0cmlidXRlKCdocmVmJylcbiAgICAgIGZyYW1lLmxpbmsuaHJlZiA9IGN1cnJlbnRfbGluay5nZXRBdHRyaWJ1dGUoJ2hyZWYnKVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHByZXZpb3VzKGUpe1xuICAgIGN1cnJlbnRfbGluayA9IGN1cnJlbnRfbGluay5wcmV2aW91c0VsZW1lbnRTaWJsaW5nXG4gICAgICA/IGN1cnJlbnRfbGluay5wcmV2aW91c0VsZW1lbnRTaWJsaW5nXG4gICAgICA6IGN1cnJlbnRfbGlua1xuICAgIGlmIChjdXJyZW50X2xpbmspIHtcbiAgICAgIGZyYW1lLmltYWdlLnNyYyA9IGN1cnJlbnRfbGluay5nZXRBdHRyaWJ1dGUoJ2hyZWYnKVxuICAgICAgZnJhbWUubGluay5ocmVmID0gY3VycmVudF9saW5rLmdldEF0dHJpYnV0ZSgnaHJlZicpXG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gY3JlYXRlUHJldmlvdXNCdXR0b24oKXtcbiAgICBsZXQgcHJldiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpXG4gICAgcHJldi5pZCA9IFwicHJldmlvdXNcIlxuICAgIHByZXYuY2xhc3NOYW1lID0gYCR7Ym94fS1wcmV2LWJ1dHRvbmBcbiAgICBwcmV2LmlubmVySFRNTCA9IFwiJmx0XCJcbiAgICBwcmV2LnR5cGUgPSBcImJ1dHRvblwiXG4gICAgcmV0dXJuIHByZXZcbiAgfVxuXG4gIGZ1bmN0aW9uIGNyZWF0ZU5leHRCdXR0b24oKXtcbiAgICBsZXQgbmV4dCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpXG4gICAgbmV4dC5pZCA9IFwibmV4dFwiXG4gICAgbmV4dC5jbGFzc05hbWUgPSBgJHtib3h9LW5leHQtYnV0dG9uYFxuICAgIG5leHQuaW5uZXJIVE1MID0gXCImZ3RcIlxuICAgIG5leHQudHlwZSA9IFwiYnV0dG9uXCJcbiAgICByZXR1cm4gbmV4dFxuICB9XG5cbiAgZnVuY3Rpb24gY3JlYXRlRnJhbWUodGFyZ2V0KXtcbiAgICBsZXQgZnJhbWUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICAgIGZyYW1lLmlkID0gYCR7Ym94fS1mcmFtZWBcbiAgICBmcmFtZS5jbGFzc05hbWUgPSBgJHtib3h9LWZyYW1lYFxuXG4gICAgbGV0IGltYWdlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW1nJylcbiAgICBpbWFnZS5jbGFzc05hbWUgPSBgJHtib3h9LWZyYW1lLWltYWdlYFxuICAgIGltYWdlLmlkID0gYCR7Ym94fS1mcmFtZS1pbWFnZWBcblxuICAgIGxldCBsaW5rID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpXG4gICAgbGluay5hcHBlbmRDaGlsZChpbWFnZSlcblxuICAgIGJpbmQobGluaywgJ2NsaWNrJywgZSA9PiB7IGUucHJldmVudERlZmF1bHQoKSB9KVxuXG4gICAgZnJhbWUuYXBwZW5kQ2hpbGQobGluaylcbiAgICByZXR1cm4ge2NvbnRhaW5lcjogZnJhbWUsIGltYWdlOiBpbWFnZSwgbGluazogbGlua31cbiAgfVxuXG4gIGZ1bmN0aW9uIGNyZWF0ZU92ZXJsYXlCb3goKXtcbiAgICBsZXQgb3ZlcmxheSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gICAgb3ZlcmxheS5jbGFzc05hbWUgPSBgJHtib3h9LW92ZXJsYXlgXG4gICAgb3ZlcmxheS5pZCA9IGAke2JveH0tb3ZlcmxheWBcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnYm9keScpWzBdLmFwcGVuZENoaWxkKG92ZXJsYXkpXG4gICAgcmV0dXJuIG92ZXJsYXlcbiAgfVxuXG4gIGZ1bmN0aW9uIGluaXQocXVlcnkpe1xuICAgIG92ZXJsYXkgPSBjcmVhdGVPdmVybGF5Qm94KClcbiAgICBmcmFtZSA9IGNyZWF0ZUZyYW1lKClcbiAgICBidXR0b25zLnByZXYgPSBjcmVhdGVQcmV2aW91c0J1dHRvbigpXG4gICAgYnV0dG9ucy5uZXh0ID0gY3JlYXRlTmV4dEJ1dHRvbigpXG4gICAgZnJhbWUuY29udGFpbmVyLmFwcGVuZENoaWxkKGJ1dHRvbnMucHJldilcbiAgICBmcmFtZS5jb250YWluZXIuYXBwZW5kQ2hpbGQoYnV0dG9ucy5uZXh0KVxuICAgIG92ZXJsYXkuYXBwZW5kQ2hpbGQoZnJhbWUuY29udGFpbmVyKVxuXG4gICAgZXZlbnRIYW5kbGVycyhxdWVyeSlcbiAgfVxuXG4gIGZ1bmN0aW9uIGV2ZW50SGFuZGxlcnMocXVlcnkpe1xuICAgIGxldCBsaW5rcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHF1ZXJ5LnJlcGxhY2UoJyMnLCAnJykpXG4gICAgICAuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2EnKVxuICAgIGxpbmtzID0gW10uc2xpY2UuY2FsbChsaW5rcylcbiAgICBsaW5rcy5mb3JFYWNoKGxpbmsgPT4ge1xuICAgICAgYmluZChsaW5rLCAnY2xpY2snLCBzaG93T3ZlcmxheSlcbiAgICB9KVxuXG4gICAgYmluZChvdmVybGF5LCAnY2xpY2snLCBoaWRlT3ZlcmxheSlcbiAgICBiaW5kKGJ1dHRvbnMucHJldiwgJ2NsaWNrJywgcHJldmlvdXMpXG4gICAgYmluZChidXR0b25zLm5leHQsICdjbGljaycsIG5leHQpXG4gICAgYmluZChkb2N1bWVudCwgJ2tleWRvd24nLCBrZXlQcmVzc0hhbmRsZXIpXG4gIH1cblxuICBmdW5jdGlvbiBrZXlQcmVzc0hhbmRsZXIoZSl7XG4gICAgZSA9IGUgfHwgd2luZG93LmV2ZW50XG5cbiAgICBpZiAoIWFjdGl2ZSlcbiAgICAgIHJldHVyblxuXG4gICAgaWYgKGUua2V5Q29kZSA9PSAnMzcnKVxuICAgICAgcHJldmlvdXMoKVxuICAgIGVsc2UgaWYgKGUua2V5Q29kZSA9PSAnMzknKVxuICAgICAgbmV4dCgpXG4gIH1cblxuICBmdW5jdGlvbiBiaW5kKGVsZW1lbnQsIGV2ZW50LCBjYWxsYmFjaywgdXNlQ2FwdHVyZSkge1xuICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihldmVudCwgY2FsbGJhY2ssIHVzZUNhcHR1cmUpXG4gIH1cblxuICByZXR1cm4ge1xuICAgIGluaXQ6IGluaXRcbiAgfVxufSkoKVxuXG5tb2R1bGUuZXhwb3J0cyA9IEF2YWxvbmJveFxuIl19
