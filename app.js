(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var avalonbox = require('avalonbox')

avalonbox.init('image-gallery')

},{"avalonbox":2}],2:[function(require,module,exports){
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
    link.target = "_blank";
    link.appendChild(image);
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
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = links[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var link = _step.value;

        bind(link, 'click', showOverlay);
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }

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
