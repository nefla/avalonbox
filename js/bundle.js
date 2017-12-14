(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){

/* **********************************************
     Begin prism-core.js
********************************************** */

var _self = (typeof window !== 'undefined')
	? window   // if in browser
	: (
		(typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope)
		? self // if in worker
		: {}   // if in node js
	);

/**
 * Prism: Lightweight, robust, elegant syntax highlighting
 * MIT license http://www.opensource.org/licenses/mit-license.php/
 * @author Lea Verou http://lea.verou.me
 */

var Prism = (function(){

// Private helper vars
var lang = /\blang(?:uage)?-(\w+)\b/i;
var uniqueId = 0;

var _ = _self.Prism = {
	util: {
		encode: function (tokens) {
			if (tokens instanceof Token) {
				return new Token(tokens.type, _.util.encode(tokens.content), tokens.alias);
			} else if (_.util.type(tokens) === 'Array') {
				return tokens.map(_.util.encode);
			} else {
				return tokens.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/\u00a0/g, ' ');
			}
		},

		type: function (o) {
			return Object.prototype.toString.call(o).match(/\[object (\w+)\]/)[1];
		},

		objId: function (obj) {
			if (!obj['__id']) {
				Object.defineProperty(obj, '__id', { value: ++uniqueId });
			}
			return obj['__id'];
		},

		// Deep clone a language definition (e.g. to extend it)
		clone: function (o) {
			var type = _.util.type(o);

			switch (type) {
				case 'Object':
					var clone = {};

					for (var key in o) {
						if (o.hasOwnProperty(key)) {
							clone[key] = _.util.clone(o[key]);
						}
					}

					return clone;

				case 'Array':
					// Check for existence for IE8
					return o.map && o.map(function(v) { return _.util.clone(v); });
			}

			return o;
		}
	},

	languages: {
		extend: function (id, redef) {
			var lang = _.util.clone(_.languages[id]);

			for (var key in redef) {
				lang[key] = redef[key];
			}

			return lang;
		},

		/**
		 * Insert a token before another token in a language literal
		 * As this needs to recreate the object (we cannot actually insert before keys in object literals),
		 * we cannot just provide an object, we need anobject and a key.
		 * @param inside The key (or language id) of the parent
		 * @param before The key to insert before. If not provided, the function appends instead.
		 * @param insert Object with the key/value pairs to insert
		 * @param root The object that contains `inside`. If equal to Prism.languages, it can be omitted.
		 */
		insertBefore: function (inside, before, insert, root) {
			root = root || _.languages;
			var grammar = root[inside];

			if (arguments.length == 2) {
				insert = arguments[1];

				for (var newToken in insert) {
					if (insert.hasOwnProperty(newToken)) {
						grammar[newToken] = insert[newToken];
					}
				}

				return grammar;
			}

			var ret = {};

			for (var token in grammar) {

				if (grammar.hasOwnProperty(token)) {

					if (token == before) {

						for (var newToken in insert) {

							if (insert.hasOwnProperty(newToken)) {
								ret[newToken] = insert[newToken];
							}
						}
					}

					ret[token] = grammar[token];
				}
			}

			// Update references in other language definitions
			_.languages.DFS(_.languages, function(key, value) {
				if (value === root[inside] && key != inside) {
					this[key] = ret;
				}
			});

			return root[inside] = ret;
		},

		// Traverse a language definition with Depth First Search
		DFS: function(o, callback, type, visited) {
			visited = visited || {};
			for (var i in o) {
				if (o.hasOwnProperty(i)) {
					callback.call(o, i, o[i], type || i);

					if (_.util.type(o[i]) === 'Object' && !visited[_.util.objId(o[i])]) {
						visited[_.util.objId(o[i])] = true;
						_.languages.DFS(o[i], callback, null, visited);
					}
					else if (_.util.type(o[i]) === 'Array' && !visited[_.util.objId(o[i])]) {
						visited[_.util.objId(o[i])] = true;
						_.languages.DFS(o[i], callback, i, visited);
					}
				}
			}
		}
	},
	plugins: {},

	highlightAll: function(async, callback) {
		var env = {
			callback: callback,
			selector: 'code[class*="language-"], [class*="language-"] code, code[class*="lang-"], [class*="lang-"] code'
		};

		_.hooks.run("before-highlightall", env);

		var elements = env.elements || document.querySelectorAll(env.selector);

		for (var i=0, element; element = elements[i++];) {
			_.highlightElement(element, async === true, env.callback);
		}
	},

	highlightElement: function(element, async, callback) {
		// Find language
		var language, grammar, parent = element;

		while (parent && !lang.test(parent.className)) {
			parent = parent.parentNode;
		}

		if (parent) {
			language = (parent.className.match(lang) || [,''])[1].toLowerCase();
			grammar = _.languages[language];
		}

		// Set language on the element, if not present
		element.className = element.className.replace(lang, '').replace(/\s+/g, ' ') + ' language-' + language;

		// Set language on the parent, for styling
		parent = element.parentNode;

		if (/pre/i.test(parent.nodeName)) {
			parent.className = parent.className.replace(lang, '').replace(/\s+/g, ' ') + ' language-' + language;
		}

		var code = element.textContent;

		var env = {
			element: element,
			language: language,
			grammar: grammar,
			code: code
		};

		_.hooks.run('before-sanity-check', env);

		if (!env.code || !env.grammar) {
			if (env.code) {
				env.element.textContent = env.code;
			}
			_.hooks.run('complete', env);
			return;
		}

		_.hooks.run('before-highlight', env);

		if (async && _self.Worker) {
			var worker = new Worker(_.filename);

			worker.onmessage = function(evt) {
				env.highlightedCode = evt.data;

				_.hooks.run('before-insert', env);

				env.element.innerHTML = env.highlightedCode;

				callback && callback.call(env.element);
				_.hooks.run('after-highlight', env);
				_.hooks.run('complete', env);
			};

			worker.postMessage(JSON.stringify({
				language: env.language,
				code: env.code,
				immediateClose: true
			}));
		}
		else {
			env.highlightedCode = _.highlight(env.code, env.grammar, env.language);

			_.hooks.run('before-insert', env);

			env.element.innerHTML = env.highlightedCode;

			callback && callback.call(element);

			_.hooks.run('after-highlight', env);
			_.hooks.run('complete', env);
		}
	},

	highlight: function (text, grammar, language) {
		var tokens = _.tokenize(text, grammar);
		return Token.stringify(_.util.encode(tokens), language);
	},

	tokenize: function(text, grammar, language) {
		var Token = _.Token;

		var strarr = [text];

		var rest = grammar.rest;

		if (rest) {
			for (var token in rest) {
				grammar[token] = rest[token];
			}

			delete grammar.rest;
		}

		tokenloop: for (var token in grammar) {
			if(!grammar.hasOwnProperty(token) || !grammar[token]) {
				continue;
			}

			var patterns = grammar[token];
			patterns = (_.util.type(patterns) === "Array") ? patterns : [patterns];

			for (var j = 0; j < patterns.length; ++j) {
				var pattern = patterns[j],
					inside = pattern.inside,
					lookbehind = !!pattern.lookbehind,
					greedy = !!pattern.greedy,
					lookbehindLength = 0,
					alias = pattern.alias;

				if (greedy && !pattern.pattern.global) {
					// Without the global flag, lastIndex won't work
					var flags = pattern.pattern.toString().match(/[imuy]*$/)[0];
					pattern.pattern = RegExp(pattern.pattern.source, flags + "g");
				}

				pattern = pattern.pattern || pattern;

				// Don’t cache length as it changes during the loop
				for (var i=0, pos = 0; i<strarr.length; pos += strarr[i].length, ++i) {

					var str = strarr[i];

					if (strarr.length > text.length) {
						// Something went terribly wrong, ABORT, ABORT!
						break tokenloop;
					}

					if (str instanceof Token) {
						continue;
					}

					pattern.lastIndex = 0;

					var match = pattern.exec(str),
					    delNum = 1;

					// Greedy patterns can override/remove up to two previously matched tokens
					if (!match && greedy && i != strarr.length - 1) {
						pattern.lastIndex = pos;
						match = pattern.exec(text);
						if (!match) {
							break;
						}

						var from = match.index + (lookbehind ? match[1].length : 0),
						    to = match.index + match[0].length,
						    k = i,
						    p = pos;

						for (var len = strarr.length; k < len && p < to; ++k) {
							p += strarr[k].length;
							// Move the index i to the element in strarr that is closest to from
							if (from >= p) {
								++i;
								pos = p;
							}
						}

						/*
						 * If strarr[i] is a Token, then the match starts inside another Token, which is invalid
						 * If strarr[k - 1] is greedy we are in conflict with another greedy pattern
						 */
						if (strarr[i] instanceof Token || strarr[k - 1].greedy) {
							continue;
						}

						// Number of tokens to delete and replace with the new match
						delNum = k - i;
						str = text.slice(pos, p);
						match.index -= pos;
					}

					if (!match) {
						continue;
					}

					if(lookbehind) {
						lookbehindLength = match[1].length;
					}

					var from = match.index + lookbehindLength,
					    match = match[0].slice(lookbehindLength),
					    to = from + match.length,
					    before = str.slice(0, from),
					    after = str.slice(to);

					var args = [i, delNum];

					if (before) {
						args.push(before);
					}

					var wrapped = new Token(token, inside? _.tokenize(match, inside) : match, alias, match, greedy);

					args.push(wrapped);

					if (after) {
						args.push(after);
					}

					Array.prototype.splice.apply(strarr, args);
				}
			}
		}

		return strarr;
	},

	hooks: {
		all: {},

		add: function (name, callback) {
			var hooks = _.hooks.all;

			hooks[name] = hooks[name] || [];

			hooks[name].push(callback);
		},

		run: function (name, env) {
			var callbacks = _.hooks.all[name];

			if (!callbacks || !callbacks.length) {
				return;
			}

			for (var i=0, callback; callback = callbacks[i++];) {
				callback(env);
			}
		}
	}
};

var Token = _.Token = function(type, content, alias, matchedStr, greedy) {
	this.type = type;
	this.content = content;
	this.alias = alias;
	// Copy of the full string this token was created from
	this.length = (matchedStr || "").length|0;
	this.greedy = !!greedy;
};

Token.stringify = function(o, language, parent) {
	if (typeof o == 'string') {
		return o;
	}

	if (_.util.type(o) === 'Array') {
		return o.map(function(element) {
			return Token.stringify(element, language, o);
		}).join('');
	}

	var env = {
		type: o.type,
		content: Token.stringify(o.content, language, parent),
		tag: 'span',
		classes: ['token', o.type],
		attributes: {},
		language: language,
		parent: parent
	};

	if (env.type == 'comment') {
		env.attributes['spellcheck'] = 'true';
	}

	if (o.alias) {
		var aliases = _.util.type(o.alias) === 'Array' ? o.alias : [o.alias];
		Array.prototype.push.apply(env.classes, aliases);
	}

	_.hooks.run('wrap', env);

	var attributes = Object.keys(env.attributes).map(function(name) {
		return name + '="' + (env.attributes[name] || '').replace(/"/g, '&quot;') + '"';
	}).join(' ');

	return '<' + env.tag + ' class="' + env.classes.join(' ') + '"' + (attributes ? ' ' + attributes : '') + '>' + env.content + '</' + env.tag + '>';

};

if (!_self.document) {
	if (!_self.addEventListener) {
		// in Node.js
		return _self.Prism;
	}
 	// In worker
	_self.addEventListener('message', function(evt) {
		var message = JSON.parse(evt.data),
		    lang = message.language,
		    code = message.code,
		    immediateClose = message.immediateClose;

		_self.postMessage(_.highlight(code, _.languages[lang], lang));
		if (immediateClose) {
			_self.close();
		}
	}, false);

	return _self.Prism;
}

//Get current script and highlight
var script = document.currentScript || [].slice.call(document.getElementsByTagName("script")).pop();

if (script) {
	_.filename = script.src;

	if (document.addEventListener && !script.hasAttribute('data-manual')) {
		if(document.readyState !== "loading") {
			if (window.requestAnimationFrame) {
				window.requestAnimationFrame(_.highlightAll);
			} else {
				window.setTimeout(_.highlightAll, 16);
			}
		}
		else {
			document.addEventListener('DOMContentLoaded', _.highlightAll);
		}
	}
}

return _self.Prism;

})();

if (typeof module !== 'undefined' && module.exports) {
	module.exports = Prism;
}

// hack for components to work correctly in node.js
if (typeof global !== 'undefined') {
	global.Prism = Prism;
}


/* **********************************************
     Begin prism-markup.js
********************************************** */

Prism.languages.markup = {
	'comment': /<!--[\w\W]*?-->/,
	'prolog': /<\?[\w\W]+?\?>/,
	'doctype': /<!DOCTYPE[\w\W]+?>/i,
	'cdata': /<!\[CDATA\[[\w\W]*?]]>/i,
	'tag': {
		pattern: /<\/?(?!\d)[^\s>\/=$<]+(?:\s+[^\s>\/=]+(?:=(?:("|')(?:\\\1|\\?(?!\1)[\w\W])*\1|[^\s'">=]+))?)*\s*\/?>/i,
		inside: {
			'tag': {
				pattern: /^<\/?[^\s>\/]+/i,
				inside: {
					'punctuation': /^<\/?/,
					'namespace': /^[^\s>\/:]+:/
				}
			},
			'attr-value': {
				pattern: /=(?:('|")[\w\W]*?(\1)|[^\s>]+)/i,
				inside: {
					'punctuation': /[=>"']/
				}
			},
			'punctuation': /\/?>/,
			'attr-name': {
				pattern: /[^\s>\/]+/,
				inside: {
					'namespace': /^[^\s>\/:]+:/
				}
			}

		}
	},
	'entity': /&#?[\da-z]{1,8};/i
};

// Plugin to make entity title show the real entity, idea by Roman Komarov
Prism.hooks.add('wrap', function(env) {

	if (env.type === 'entity') {
		env.attributes['title'] = env.content.replace(/&amp;/, '&');
	}
});

Prism.languages.xml = Prism.languages.markup;
Prism.languages.html = Prism.languages.markup;
Prism.languages.mathml = Prism.languages.markup;
Prism.languages.svg = Prism.languages.markup;


/* **********************************************
     Begin prism-css.js
********************************************** */

Prism.languages.css = {
	'comment': /\/\*[\w\W]*?\*\//,
	'atrule': {
		pattern: /@[\w-]+?.*?(;|(?=\s*\{))/i,
		inside: {
			'rule': /@[\w-]+/
			// See rest below
		}
	},
	'url': /url\((?:(["'])(\\(?:\r\n|[\w\W])|(?!\1)[^\\\r\n])*\1|.*?)\)/i,
	'selector': /[^\{\}\s][^\{\};]*?(?=\s*\{)/,
	'string': {
		pattern: /("|')(\\(?:\r\n|[\w\W])|(?!\1)[^\\\r\n])*\1/,
		greedy: true
	},
	'property': /(\b|\B)[\w-]+(?=\s*:)/i,
	'important': /\B!important\b/i,
	'function': /[-a-z0-9]+(?=\()/i,
	'punctuation': /[(){};:]/
};

Prism.languages.css['atrule'].inside.rest = Prism.util.clone(Prism.languages.css);

if (Prism.languages.markup) {
	Prism.languages.insertBefore('markup', 'tag', {
		'style': {
			pattern: /(<style[\w\W]*?>)[\w\W]*?(?=<\/style>)/i,
			lookbehind: true,
			inside: Prism.languages.css,
			alias: 'language-css'
		}
	});
	
	Prism.languages.insertBefore('inside', 'attr-value', {
		'style-attr': {
			pattern: /\s*style=("|').*?\1/i,
			inside: {
				'attr-name': {
					pattern: /^\s*style/i,
					inside: Prism.languages.markup.tag.inside
				},
				'punctuation': /^\s*=\s*['"]|['"]\s*$/,
				'attr-value': {
					pattern: /.+/i,
					inside: Prism.languages.css
				}
			},
			alias: 'language-css'
		}
	}, Prism.languages.markup.tag);
}

/* **********************************************
     Begin prism-clike.js
********************************************** */

Prism.languages.clike = {
	'comment': [
		{
			pattern: /(^|[^\\])\/\*[\w\W]*?\*\//,
			lookbehind: true
		},
		{
			pattern: /(^|[^\\:])\/\/.*/,
			lookbehind: true
		}
	],
	'string': {
		pattern: /(["'])(\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/,
		greedy: true
	},
	'class-name': {
		pattern: /((?:\b(?:class|interface|extends|implements|trait|instanceof|new)\s+)|(?:catch\s+\())[a-z0-9_\.\\]+/i,
		lookbehind: true,
		inside: {
			punctuation: /(\.|\\)/
		}
	},
	'keyword': /\b(if|else|while|do|for|return|in|instanceof|function|new|try|throw|catch|finally|null|break|continue)\b/,
	'boolean': /\b(true|false)\b/,
	'function': /[a-z0-9_]+(?=\()/i,
	'number': /\b-?(?:0x[\da-f]+|\d*\.?\d+(?:e[+-]?\d+)?)\b/i,
	'operator': /--?|\+\+?|!=?=?|<=?|>=?|==?=?|&&?|\|\|?|\?|\*|\/|~|\^|%/,
	'punctuation': /[{}[\];(),.:]/
};


/* **********************************************
     Begin prism-javascript.js
********************************************** */

Prism.languages.javascript = Prism.languages.extend('clike', {
	'keyword': /\b(as|async|await|break|case|catch|class|const|continue|debugger|default|delete|do|else|enum|export|extends|finally|for|from|function|get|if|implements|import|in|instanceof|interface|let|new|null|of|package|private|protected|public|return|set|static|super|switch|this|throw|try|typeof|var|void|while|with|yield)\b/,
	'number': /\b-?(0x[\dA-Fa-f]+|0b[01]+|0o[0-7]+|\d*\.?\d+([Ee][+-]?\d+)?|NaN|Infinity)\b/,
	// Allow for all non-ASCII characters (See http://stackoverflow.com/a/2008444)
	'function': /[_$a-zA-Z\xA0-\uFFFF][_$a-zA-Z0-9\xA0-\uFFFF]*(?=\()/i,
	'operator': /--?|\+\+?|!=?=?|<=?|>=?|==?=?|&&?|\|\|?|\?|\*\*?|\/|~|\^|%|\.{3}/
});

Prism.languages.insertBefore('javascript', 'keyword', {
	'regex': {
		pattern: /(^|[^/])\/(?!\/)(\[.+?]|\\.|[^/\\\r\n])+\/[gimyu]{0,5}(?=\s*($|[\r\n,.;})]))/,
		lookbehind: true,
		greedy: true
	}
});

Prism.languages.insertBefore('javascript', 'string', {
	'template-string': {
		pattern: /`(?:\\\\|\\?[^\\])*?`/,
		greedy: true,
		inside: {
			'interpolation': {
				pattern: /\$\{[^}]+\}/,
				inside: {
					'interpolation-punctuation': {
						pattern: /^\$\{|\}$/,
						alias: 'punctuation'
					},
					rest: Prism.languages.javascript
				}
			},
			'string': /[\s\S]+/
		}
	}
});

if (Prism.languages.markup) {
	Prism.languages.insertBefore('markup', 'tag', {
		'script': {
			pattern: /(<script[\w\W]*?>)[\w\W]*?(?=<\/script>)/i,
			lookbehind: true,
			inside: Prism.languages.javascript,
			alias: 'language-javascript'
		}
	});
}

Prism.languages.js = Prism.languages.javascript;

/* **********************************************
     Begin prism-file-highlight.js
********************************************** */

(function () {
	if (typeof self === 'undefined' || !self.Prism || !self.document || !document.querySelector) {
		return;
	}

	self.Prism.fileHighlight = function() {

		var Extensions = {
			'js': 'javascript',
			'py': 'python',
			'rb': 'ruby',
			'ps1': 'powershell',
			'psm1': 'powershell',
			'sh': 'bash',
			'bat': 'batch',
			'h': 'c',
			'tex': 'latex'
		};

		if(Array.prototype.forEach) { // Check to prevent error in IE8
			Array.prototype.slice.call(document.querySelectorAll('pre[data-src]')).forEach(function (pre) {
				var src = pre.getAttribute('data-src');

				var language, parent = pre;
				var lang = /\blang(?:uage)?-(?!\*)(\w+)\b/i;
				while (parent && !lang.test(parent.className)) {
					parent = parent.parentNode;
				}

				if (parent) {
					language = (pre.className.match(lang) || [, ''])[1];
				}

				if (!language) {
					var extension = (src.match(/\.(\w+)$/) || [, ''])[1];
					language = Extensions[extension] || extension;
				}

				var code = document.createElement('code');
				code.className = 'language-' + language;

				pre.textContent = '';

				code.textContent = 'Loading…';

				pre.appendChild(code);

				var xhr = new XMLHttpRequest();

				xhr.open('GET', src, true);

				xhr.onreadystatechange = function () {
					if (xhr.readyState == 4) {

						if (xhr.status < 400 && xhr.responseText) {
							code.textContent = xhr.responseText;

							Prism.highlightElement(code);
						}
						else if (xhr.status >= 400) {
							code.textContent = '✖ Error ' + xhr.status + ' while fetching file: ' + xhr.statusText;
						}
						else {
							code.textContent = '✖ Error: File does not exist or is empty';
						}
					}
				};

				xhr.send(null);
			});
		}

	};

	document.addEventListener('DOMContentLoaded', self.Prism.fileHighlight);

})();

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],2:[function(require,module,exports){
'use strict';

var _avalonbox = require('../../src/scripts/avalonbox');

var _avalonbox2 = _interopRequireDefault(_avalonbox);

var _prismjs = require('prismjs');

var _prismjs2 = _interopRequireDefault(_prismjs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

document.onreadystatechange = function () {
  if (document.readyState === 'complete') {

    _avalonbox2.default.run('image-gallery-single');
    _avalonbox2.default.run('image-gallery-multiple');
    _avalonbox2.default.run('image-gallery-many');
  }
};

},{"../../src/scripts/avalonbox":4,"prismjs":1}],3:[function(require,module,exports){
module.exports={
  "mode": "prod"
}

},{}],4:[function(require,module,exports){
'use strict';

var _html = require('./core/html');

var html = _interopRequireWildcard(_html);

var _bind = require('./core/bind');

var _bind2 = _interopRequireDefault(_bind);

var _delegate = require('./core/delegate');

var _delegate2 = _interopRequireDefault(_delegate);

var _Direction = require('./constants/Direction');

var _Direction2 = _interopRequireDefault(_Direction);

var _AppConstants = require('./constants/AppConstants');

var _AppConstants2 = _interopRequireDefault(_AppConstants);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var config = require('./appconfig');

var box = 'avalonbox';
var isDev = config.mode === _AppConstants2.default.DEV;

var Avalonbox = function () {
  var doc = document;
  var buttons = {};
  var overlay = html.createOverlayBox(doc);
  var frame = html.createFrame(doc);
  frame.image.addEventListener('animationend', onImageAnimationEnd, false);
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
    cleanFrame();
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

  function onImageAnimationEnd(e) {
    downloadImage.src = currentLink.getAttribute('href');
    frame.link.href = currentLink.getAttribute('href');
  }

  function fetchImage(DIRECTION) {
    downloadImage.onload = function () {
      onLoadImage.bind(this, DIRECTION)();
    };
    if (DIRECTION) {
      html.slideOut(frame.image, DIRECTION);
    } else {
      downloadImage.src = currentLink.getAttribute('href');
      frame.link.href = currentLink.getAttribute('href');
    }

    html.show(spinner);
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

},{"./appconfig":3,"./constants/AppConstants":5,"./constants/Direction":6,"./core/bind":7,"./core/delegate":8,"./core/html":9}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var AppConstants = {
  DEV: 'dev',
  PROD: 'prod'
};

exports.default = AppConstants;

},{}],6:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var Direction = {
  LEFT: 'left',
  RIGHT: 'right'
};

exports.default = Direction;

},{}],7:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
function bind(element, event, callback, useCapture) {
  element.addEventListener(event, callback, useCapture);
}

exports.default = bind;

},{}],8:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var delegate = function delegate(criteria, listener) {
  return function (e) {
    var el = e.target;
    do {
      if (!criteria(el)) continue;
      e.delegateTarget = el;
      listener.apply(this, arguments);
      return;
    } while (el = el.parentNode);
  };
};

exports.default = delegate;

},{}],9:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.appendChild = exports.slideOut = exports.slideIn = exports.show = exports.hide = exports.getOverlayBox = exports.createSpinnerWrapper = exports.createSpinner = exports.createOverlayBox = exports.createFrame = exports.createNextButton = exports.createPreviousButton = undefined;

var _bind = require('./bind');

var _bind2 = _interopRequireDefault(_bind);

var _Direction = require('../constants/Direction');

var _Direction2 = _interopRequireDefault(_Direction);

var _capitalize = require('../utils/capitalize');

var _capitalize2 = _interopRequireDefault(_capitalize);

var _oppositeDirection = require('../utils/opposite-direction');

var _oppositeDirection2 = _interopRequireDefault(_oppositeDirection);

var _icons = require('../icons');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var box = 'avalonbox';

function createPreviousButton(doc) {
  var prev = doc.createElement('button');
  prev.id = box + '-prev';
  prev.className = box + '-move-button ' + box + '-prev-button';
  prev.innerHTML = _icons.LeftIcon;
  prev.type = 'button';
  return prev;
}

function createNextButton(doc) {
  var next = doc.createElement('button');
  next.id = box + '-next';
  next.className = box + '-move-button ' + box + '-next-button';
  next.innerHTML = _icons.RightIcon;
  next.type = 'button';
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
  image.src = '';
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
  el.classList.remove('show');
  el.classList.add('hide');
}

function show(el) {
  el.classList.remove('hide');
  el.classList.add('show');
}

function appendChild(doc, el) {
  doc.getElementsByTagName('body')[0].appendChild(el);
}

function slideIn(el, DIRECTION) {
  el.classList.remove('hide' + (0, _capitalize2.default)((0, _oppositeDirection2.default)(DIRECTION)));
  el.classList.add('show' + (0, _capitalize2.default)(DIRECTION));
}

function slideOut(el, DIRECTION) {
  el.classList.remove('show' + (0, _capitalize2.default)(DIRECTION));
  el.classList.add('hide' + (0, _capitalize2.default)((0, _oppositeDirection2.default)(DIRECTION)));
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
exports.slideIn = slideIn;
exports.slideOut = slideOut;
exports.appendChild = appendChild;

},{"../constants/Direction":6,"../icons":10,"../utils/capitalize":11,"../utils/opposite-direction":12,"./bind":7}],10:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var svgHeader = "xmlns=\"http://www.w3.org/2000/svg\"\n  viewBox=\"0 0 100 125\" x=\"0px\" y=\"0px\"";

var LeftIcon = "\n  <div class='svgOuter'>\n  <svg " + svgHeader + " class='icon svgInner' preserveAspectRatio=\"xMinYMin meet\">\n  <g>\n    <path d=\"M70.59,95.41a2,2,0,0,0,2.83-2.83L30.83,50,73.41,7.41a2,2,0,0,0-2.83-2.83l-44,44a2,2,0,0,0,0,2.83Z\"/></g>\n  </svg>\n  </div>\n  ";

var RightIcon = "\n  <div class='svgOuter'>\n    <svg " + svgHeader + " class='icon svgInner'>\n      <g>\n        <path           d=\"M26.59,95.41a2,2,0,0,0,2.83,0l44-44a2,2,0,0,0,0-2.83l-44-44a2,2,0,0,0-2.83,2.83L69.17,50,26.59,92.59A2,2,0,0,0,26.59,95.41Z\"/>\n      </g>\n    </svg>\n  </div>\n  ";

exports.LeftIcon = LeftIcon;
exports.RightIcon = RightIcon;

},{}],11:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
function capitalize(string) {
  return string.charAt(0).toUpperCase() + string.substring(1);
}

exports.default = capitalize;

},{}],12:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _Direction = require('../constants/Direction');

var _Direction2 = _interopRequireDefault(_Direction);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function oppositeDirection(DIRECTION) {
  return DIRECTION === _Direction2.default.LEFT ? _Direction2.default.RIGHT : _Direction2.default.LEFT;
}

exports.default = oppositeDirection;

},{"../constants/Direction":6}]},{},[2])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvcHJpc21qcy9wcmlzbS5qcyIsInBhZ2VzL2pzL2FwcC5qcyIsInNyYy9zY3JpcHRzL2FwcGNvbmZpZy5qc29uIiwic3JjL3NjcmlwdHMvYXZhbG9uYm94LmpzIiwic3JjL3NjcmlwdHMvY29uc3RhbnRzL0FwcENvbnN0YW50cy5qcyIsInNyYy9zY3JpcHRzL2NvbnN0YW50cy9EaXJlY3Rpb24uanMiLCJzcmMvc2NyaXB0cy9jb3JlL2JpbmQuanMiLCJzcmMvc2NyaXB0cy9jb3JlL2RlbGVnYXRlLmpzIiwic3JjL3NjcmlwdHMvY29yZS9odG1sLmpzIiwic3JjL3NjcmlwdHMvaWNvbnMvaW5kZXguanMiLCJzcmMvc2NyaXB0cy91dGlscy9jYXBpdGFsaXplLmpzIiwic3JjL3NjcmlwdHMvdXRpbHMvb3Bwb3NpdGUtZGlyZWN0aW9uLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7QUMzeEJBOzs7O0FBQ0E7Ozs7OztBQUdBLFNBQVMsa0JBQVQsR0FBOEIsWUFBVTtB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RUFBaUIsV0FBakIsS0FBaUMsT0FBTyxTQUFQLENBQWlCLENBQWpCLENBQXhDO0FBQ0Q7O2tCQUVjLFU7Ozs7Ozs7OztBQ0pmOzs7Ozs7QUFFQSxTQUFTLGlCQUFULENBQTJCLFNBQTNCLEVBQXNDO0FBQ3BDLFNBQU8sY0FBYyxvQkFBVSxJQUF4QixHQUErQixvQkFBVSxLQUF6QyxHQUFpRCxvQkFBVSxJQUFsRTtBQUNEOztrQkFFYyxpQiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJcbi8qICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICAgQmVnaW4gcHJpc20tY29yZS5qc1xuKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiAqL1xuXG52YXIgX3NlbGYgPSAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcpXG5cdD8gd2luZG93ICAgLy8gaWYgaW4gYnJvd3NlclxuXHQ6IChcblx0XHQodHlwZW9mIFdvcmtlckdsb2JhbFNjb3BlICE9PSAndW5kZWZpbmVkJyAmJiBzZWxmIGluc3RhbmNlb2YgV29ya2VyR2xvYmFsU2NvcGUpXG5cdFx0PyBzZWxmIC8vIGlmIGluIHdvcmtlclxuXHRcdDoge30gICAvLyBpZiBpbiBub2RlIGpzXG5cdCk7XG5cbi8qKlxuICogUHJpc206IExpZ2h0d2VpZ2h0LCByb2J1c3QsIGVsZWdhbnQgc3ludGF4IGhpZ2hsaWdodGluZ1xuICogTUlUIGxpY2Vuc2UgaHR0cDovL3d3dy5vcGVuc291cmNlLm9yZy9saWNlbnNlcy9taXQtbGljZW5zZS5waHAvXG4gKiBAYXV0aG9yIExlYSBWZXJvdSBodHRwOi8vbGVhLnZlcm91Lm1lXG4gKi9cblxudmFyIFByaXNtID0gKGZ1bmN0aW9uKCl7XG5cbi8vIFByaXZhdGUgaGVscGVyIHZhcnNcbnZhciBsYW5nID0gL1xcYmxhbmcoPzp1YWdlKT8tKFxcdyspXFxiL2k7XG52YXIgdW5pcXVlSWQgPSAwO1xuXG52YXIgXyA9IF9zZWxmLlByaXNtID0ge1xuXHR1dGlsOiB7XG5cdFx0ZW5jb2RlOiBmdW5jdGlvbiAodG9rZW5zKSB7XG5cdFx0XHRpZiAodG9rZW5zIGluc3RhbmNlb2YgVG9rZW4pIHtcblx0XHRcdFx0cmV0dXJuIG5ldyBUb2tlbih0b2tlbnMudHlwZSwgXy51dGlsLmVuY29kZSh0b2tlbnMuY29udGVudCksIHRva2Vucy5hbGlhcyk7XG5cdFx0XHR9IGVsc2UgaWYgKF8udXRpbC50eXBlKHRva2VucykgPT09ICdBcnJheScpIHtcblx0XHRcdFx0cmV0dXJuIHRva2Vucy5tYXAoXy51dGlsLmVuY29kZSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRyZXR1cm4gdG9rZW5zLnJlcGxhY2UoLyYvZywgJyZhbXA7JykucmVwbGFjZSgvPC9nLCAnJmx0OycpLnJlcGxhY2UoL1xcdTAwYTAvZywgJyAnKTtcblx0XHRcdH1cblx0XHR9LFxuXG5cdFx0dHlwZTogZnVuY3Rpb24gKG8pIHtcblx0XHRcdHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwobykubWF0Y2goL1xcW29iamVjdCAoXFx3KylcXF0vKVsxXTtcblx0XHR9LFxuXG5cdFx0b2JqSWQ6IGZ1bmN0aW9uIChvYmopIHtcblx0XHRcdGlmICghb2JqWydfX2lkJ10pIHtcblx0XHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KG9iaiwgJ19faWQnLCB7IHZhbHVlOiArK3VuaXF1ZUlkIH0pO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIG9ialsnX19pZCddO1xuXHRcdH0sXG5cblx0XHQvLyBEZWVwIGNsb25lIGEgbGFuZ3VhZ2UgZGVmaW5pdGlvbiAoZS5nLiB0byBleHRlbmQgaXQpXG5cdFx0Y2xvbmU6IGZ1bmN0aW9uIChvKSB7XG5cdFx0XHR2YXIgdHlwZSA9IF8udXRpbC50eXBlKG8pO1xuXG5cdFx0XHRzd2l0Y2ggKHR5cGUpIHtcblx0XHRcdFx0Y2FzZSAnT2JqZWN0Jzpcblx0XHRcdFx0XHR2YXIgY2xvbmUgPSB7fTtcblxuXHRcdFx0XHRcdGZvciAodmFyIGtleSBpbiBvKSB7XG5cdFx0XHRcdFx0XHRpZiAoby5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG5cdFx0XHRcdFx0XHRcdGNsb25lW2tleV0gPSBfLnV0aWwuY2xvbmUob1trZXldKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRyZXR1cm4gY2xvbmU7XG5cblx0XHRcdFx0Y2FzZSAnQXJyYXknOlxuXHRcdFx0XHRcdC8vIENoZWNrIGZvciBleGlzdGVuY2UgZm9yIElFOFxuXHRcdFx0XHRcdHJldHVybiBvLm1hcCAmJiBvLm1hcChmdW5jdGlvbih2KSB7IHJldHVybiBfLnV0aWwuY2xvbmUodik7IH0pO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gbztcblx0XHR9XG5cdH0sXG5cblx0bGFuZ3VhZ2VzOiB7XG5cdFx0ZXh0ZW5kOiBmdW5jdGlvbiAoaWQsIHJlZGVmKSB7XG5cdFx0XHR2YXIgbGFuZyA9IF8udXRpbC5jbG9uZShfLmxhbmd1YWdlc1tpZF0pO1xuXG5cdFx0XHRmb3IgKHZhciBrZXkgaW4gcmVkZWYpIHtcblx0XHRcdFx0bGFuZ1trZXldID0gcmVkZWZba2V5XTtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIGxhbmc7XG5cdFx0fSxcblxuXHRcdC8qKlxuXHRcdCAqIEluc2VydCBhIHRva2VuIGJlZm9yZSBhbm90aGVyIHRva2VuIGluIGEgbGFuZ3VhZ2UgbGl0ZXJhbFxuXHRcdCAqIEFzIHRoaXMgbmVlZHMgdG8gcmVjcmVhdGUgdGhlIG9iamVjdCAod2UgY2Fubm90IGFjdHVhbGx5IGluc2VydCBiZWZvcmUga2V5cyBpbiBvYmplY3QgbGl0ZXJhbHMpLFxuXHRcdCAqIHdlIGNhbm5vdCBqdXN0IHByb3ZpZGUgYW4gb2JqZWN0LCB3ZSBuZWVkIGFub2JqZWN0IGFuZCBhIGtleS5cblx0XHQgKiBAcGFyYW0gaW5zaWRlIFRoZSBrZXkgKG9yIGxhbmd1YWdlIGlkKSBvZiB0aGUgcGFyZW50XG5cdFx0ICogQHBhcmFtIGJlZm9yZSBUaGUga2V5IHRvIGluc2VydCBiZWZvcmUuIElmIG5vdCBwcm92aWRlZCwgdGhlIGZ1bmN0aW9uIGFwcGVuZHMgaW5zdGVhZC5cblx0XHQgKiBAcGFyYW0gaW5zZXJ0IE9iamVjdCB3aXRoIHRoZSBrZXkvdmFsdWUgcGFpcnMgdG8gaW5zZXJ0XG5cdFx0ICogQHBhcmFtIHJvb3QgVGhlIG9iamVjdCB0aGF0IGNvbnRhaW5zIGBpbnNpZGVgLiBJZiBlcXVhbCB0byBQcmlzbS5sYW5ndWFnZXMsIGl0IGNhbiBiZSBvbWl0dGVkLlxuXHRcdCAqL1xuXHRcdGluc2VydEJlZm9yZTogZnVuY3Rpb24gKGluc2lkZSwgYmVmb3JlLCBpbnNlcnQsIHJvb3QpIHtcblx0XHRcdHJvb3QgPSByb290IHx8IF8ubGFuZ3VhZ2VzO1xuXHRcdFx0dmFyIGdyYW1tYXIgPSByb290W2luc2lkZV07XG5cblx0XHRcdGlmIChhcmd1bWVudHMubGVuZ3RoID09IDIpIHtcblx0XHRcdFx0aW5zZXJ0ID0gYXJndW1lbnRzWzFdO1xuXG5cdFx0XHRcdGZvciAodmFyIG5ld1Rva2VuIGluIGluc2VydCkge1xuXHRcdFx0XHRcdGlmIChpbnNlcnQuaGFzT3duUHJvcGVydHkobmV3VG9rZW4pKSB7XG5cdFx0XHRcdFx0XHRncmFtbWFyW25ld1Rva2VuXSA9IGluc2VydFtuZXdUb2tlbl07XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0cmV0dXJuIGdyYW1tYXI7XG5cdFx0XHR9XG5cblx0XHRcdHZhciByZXQgPSB7fTtcblxuXHRcdFx0Zm9yICh2YXIgdG9rZW4gaW4gZ3JhbW1hcikge1xuXG5cdFx0XHRcdGlmIChncmFtbWFyLmhhc093blByb3BlcnR5KHRva2VuKSkge1xuXG5cdFx0XHRcdFx0aWYgKHRva2VuID09IGJlZm9yZSkge1xuXG5cdFx0XHRcdFx0XHRmb3IgKHZhciBuZXdUb2tlbiBpbiBpbnNlcnQpIHtcblxuXHRcdFx0XHRcdFx0XHRpZiAoaW5zZXJ0Lmhhc093blByb3BlcnR5KG5ld1Rva2VuKSkge1xuXHRcdFx0XHRcdFx0XHRcdHJldFtuZXdUb2tlbl0gPSBpbnNlcnRbbmV3VG9rZW5dO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0cmV0W3Rva2VuXSA9IGdyYW1tYXJbdG9rZW5dO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdC8vIFVwZGF0ZSByZWZlcmVuY2VzIGluIG90aGVyIGxhbmd1YWdlIGRlZmluaXRpb25zXG5cdFx0XHRfLmxhbmd1YWdlcy5ERlMoXy5sYW5ndWFnZXMsIGZ1bmN0aW9uKGtleSwgdmFsdWUpIHtcblx0XHRcdFx0aWYgKHZhbHVlID09PSByb290W2luc2lkZV0gJiYga2V5ICE9IGluc2lkZSkge1xuXHRcdFx0XHRcdHRoaXNba2V5XSA9IHJldDtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cblx0XHRcdHJldHVybiByb290W2luc2lkZV0gPSByZXQ7XG5cdFx0fSxcblxuXHRcdC8vIFRyYXZlcnNlIGEgbGFuZ3VhZ2UgZGVmaW5pdGlvbiB3aXRoIERlcHRoIEZpcnN0IFNlYXJjaFxuXHRcdERGUzogZnVuY3Rpb24obywgY2FsbGJhY2ssIHR5cGUsIHZpc2l0ZWQpIHtcblx0XHRcdHZpc2l0ZWQgPSB2aXNpdGVkIHx8IHt9O1xuXHRcdFx0Zm9yICh2YXIgaSBpbiBvKSB7XG5cdFx0XHRcdGlmIChvLmhhc093blByb3BlcnR5KGkpKSB7XG5cdFx0XHRcdFx0Y2FsbGJhY2suY2FsbChvLCBpLCBvW2ldLCB0eXBlIHx8IGkpO1xuXG5cdFx0XHRcdFx0aWYgKF8udXRpbC50eXBlKG9baV0pID09PSAnT2JqZWN0JyAmJiAhdmlzaXRlZFtfLnV0aWwub2JqSWQob1tpXSldKSB7XG5cdFx0XHRcdFx0XHR2aXNpdGVkW18udXRpbC5vYmpJZChvW2ldKV0gPSB0cnVlO1xuXHRcdFx0XHRcdFx0Xy5sYW5ndWFnZXMuREZTKG9baV0sIGNhbGxiYWNrLCBudWxsLCB2aXNpdGVkKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0ZWxzZSBpZiAoXy51dGlsLnR5cGUob1tpXSkgPT09ICdBcnJheScgJiYgIXZpc2l0ZWRbXy51dGlsLm9iaklkKG9baV0pXSkge1xuXHRcdFx0XHRcdFx0dmlzaXRlZFtfLnV0aWwub2JqSWQob1tpXSldID0gdHJ1ZTtcblx0XHRcdFx0XHRcdF8ubGFuZ3VhZ2VzLkRGUyhvW2ldLCBjYWxsYmFjaywgaSwgdmlzaXRlZCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9LFxuXHRwbHVnaW5zOiB7fSxcblxuXHRoaWdobGlnaHRBbGw6IGZ1bmN0aW9uKGFzeW5jLCBjYWxsYmFjaykge1xuXHRcdHZhciBlbnYgPSB7XG5cdFx0XHRjYWxsYmFjazogY2FsbGJhY2ssXG5cdFx0XHRzZWxlY3RvcjogJ2NvZGVbY2xhc3MqPVwibGFuZ3VhZ2UtXCJdLCBbY2xhc3MqPVwibGFuZ3VhZ2UtXCJdIGNvZGUsIGNvZGVbY2xhc3MqPVwibGFuZy1cIl0sIFtjbGFzcyo9XCJsYW5nLVwiXSBjb2RlJ1xuXHRcdH07XG5cblx0XHRfLmhvb2tzLnJ1bihcImJlZm9yZS1oaWdobGlnaHRhbGxcIiwgZW52KTtcblxuXHRcdHZhciBlbGVtZW50cyA9IGVudi5lbGVtZW50cyB8fCBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKGVudi5zZWxlY3Rvcik7XG5cblx0XHRmb3IgKHZhciBpPTAsIGVsZW1lbnQ7IGVsZW1lbnQgPSBlbGVtZW50c1tpKytdOykge1xuXHRcdFx0Xy5oaWdobGlnaHRFbGVtZW50KGVsZW1lbnQsIGFzeW5jID09PSB0cnVlLCBlbnYuY2FsbGJhY2spO1xuXHRcdH1cblx0fSxcblxuXHRoaWdobGlnaHRFbGVtZW50OiBmdW5jdGlvbihlbGVtZW50LCBhc3luYywgY2FsbGJhY2spIHtcblx0XHQvLyBGaW5kIGxhbmd1YWdlXG5cdFx0dmFyIGxhbmd1YWdlLCBncmFtbWFyLCBwYXJlbnQgPSBlbGVtZW50O1xuXG5cdFx0d2hpbGUgKHBhcmVudCAmJiAhbGFuZy50ZXN0KHBhcmVudC5jbGFzc05hbWUpKSB7XG5cdFx0XHRwYXJlbnQgPSBwYXJlbnQucGFyZW50Tm9kZTtcblx0XHR9XG5cblx0XHRpZiAocGFyZW50KSB7XG5cdFx0XHRsYW5ndWFnZSA9IChwYXJlbnQuY2xhc3NOYW1lLm1hdGNoKGxhbmcpIHx8IFssJyddKVsxXS50b0xvd2VyQ2FzZSgpO1xuXHRcdFx0Z3JhbW1hciA9IF8ubGFuZ3VhZ2VzW2xhbmd1YWdlXTtcblx0XHR9XG5cblx0XHQvLyBTZXQgbGFuZ3VhZ2Ugb24gdGhlIGVsZW1lbnQsIGlmIG5vdCBwcmVzZW50XG5cdFx0ZWxlbWVudC5jbGFzc05hbWUgPSBlbGVtZW50LmNsYXNzTmFtZS5yZXBsYWNlKGxhbmcsICcnKS5yZXBsYWNlKC9cXHMrL2csICcgJykgKyAnIGxhbmd1YWdlLScgKyBsYW5ndWFnZTtcblxuXHRcdC8vIFNldCBsYW5ndWFnZSBvbiB0aGUgcGFyZW50LCBmb3Igc3R5bGluZ1xuXHRcdHBhcmVudCA9IGVsZW1lbnQucGFyZW50Tm9kZTtcblxuXHRcdGlmICgvcHJlL2kudGVzdChwYXJlbnQubm9kZU5hbWUpKSB7XG5cdFx0XHRwYXJlbnQuY2xhc3NOYW1lID0gcGFyZW50LmNsYXNzTmFtZS5yZXBsYWNlKGxhbmcsICcnKS5yZXBsYWNlKC9cXHMrL2csICcgJykgKyAnIGxhbmd1YWdlLScgKyBsYW5ndWFnZTtcblx0XHR9XG5cblx0XHR2YXIgY29kZSA9IGVsZW1lbnQudGV4dENvbnRlbnQ7XG5cblx0XHR2YXIgZW52ID0ge1xuXHRcdFx0ZWxlbWVudDogZWxlbWVudCxcblx0XHRcdGxhbmd1YWdlOiBsYW5ndWFnZSxcblx0XHRcdGdyYW1tYXI6IGdyYW1tYXIsXG5cdFx0XHRjb2RlOiBjb2RlXG5cdFx0fTtcblxuXHRcdF8uaG9va3MucnVuKCdiZWZvcmUtc2FuaXR5LWNoZWNrJywgZW52KTtcblxuXHRcdGlmICghZW52LmNvZGUgfHwgIWVudi5ncmFtbWFyKSB7XG5cdFx0XHRpZiAoZW52LmNvZGUpIHtcblx0XHRcdFx0ZW52LmVsZW1lbnQudGV4dENvbnRlbnQgPSBlbnYuY29kZTtcblx0XHRcdH1cblx0XHRcdF8uaG9va3MucnVuKCdjb21wbGV0ZScsIGVudik7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0Xy5ob29rcy5ydW4oJ2JlZm9yZS1oaWdobGlnaHQnLCBlbnYpO1xuXG5cdFx0aWYgKGFzeW5jICYmIF9zZWxmLldvcmtlcikge1xuXHRcdFx0dmFyIHdvcmtlciA9IG5ldyBXb3JrZXIoXy5maWxlbmFtZSk7XG5cblx0XHRcdHdvcmtlci5vbm1lc3NhZ2UgPSBmdW5jdGlvbihldnQpIHtcblx0XHRcdFx0ZW52LmhpZ2hsaWdodGVkQ29kZSA9IGV2dC5kYXRhO1xuXG5cdFx0XHRcdF8uaG9va3MucnVuKCdiZWZvcmUtaW5zZXJ0JywgZW52KTtcblxuXHRcdFx0XHRlbnYuZWxlbWVudC5pbm5lckhUTUwgPSBlbnYuaGlnaGxpZ2h0ZWRDb2RlO1xuXG5cdFx0XHRcdGNhbGxiYWNrICYmIGNhbGxiYWNrLmNhbGwoZW52LmVsZW1lbnQpO1xuXHRcdFx0XHRfLmhvb2tzLnJ1bignYWZ0ZXItaGlnaGxpZ2h0JywgZW52KTtcblx0XHRcdFx0Xy5ob29rcy5ydW4oJ2NvbXBsZXRlJywgZW52KTtcblx0XHRcdH07XG5cblx0XHRcdHdvcmtlci5wb3N0TWVzc2FnZShKU09OLnN0cmluZ2lmeSh7XG5cdFx0XHRcdGxhbmd1YWdlOiBlbnYubGFuZ3VhZ2UsXG5cdFx0XHRcdGNvZGU6IGVudi5jb2RlLFxuXHRcdFx0XHRpbW1lZGlhdGVDbG9zZTogdHJ1ZVxuXHRcdFx0fSkpO1xuXHRcdH1cblx0XHRlbHNlIHtcblx0XHRcdGVudi5oaWdobGlnaHRlZENvZGUgPSBfLmhpZ2hsaWdodChlbnYuY29kZSwgZW52LmdyYW1tYXIsIGVudi5sYW5ndWFnZSk7XG5cblx0XHRcdF8uaG9va3MucnVuKCdiZWZvcmUtaW5zZXJ0JywgZW52KTtcblxuXHRcdFx0ZW52LmVsZW1lbnQuaW5uZXJIVE1MID0gZW52LmhpZ2hsaWdodGVkQ29kZTtcblxuXHRcdFx0Y2FsbGJhY2sgJiYgY2FsbGJhY2suY2FsbChlbGVtZW50KTtcblxuXHRcdFx0Xy5ob29rcy5ydW4oJ2FmdGVyLWhpZ2hsaWdodCcsIGVudik7XG5cdFx0XHRfLmhvb2tzLnJ1bignY29tcGxldGUnLCBlbnYpO1xuXHRcdH1cblx0fSxcblxuXHRoaWdobGlnaHQ6IGZ1bmN0aW9uICh0ZXh0LCBncmFtbWFyLCBsYW5ndWFnZSkge1xuXHRcdHZhciB0b2tlbnMgPSBfLnRva2VuaXplKHRleHQsIGdyYW1tYXIpO1xuXHRcdHJldHVybiBUb2tlbi5zdHJpbmdpZnkoXy51dGlsLmVuY29kZSh0b2tlbnMpLCBsYW5ndWFnZSk7XG5cdH0sXG5cblx0dG9rZW5pemU6IGZ1bmN0aW9uKHRleHQsIGdyYW1tYXIsIGxhbmd1YWdlKSB7XG5cdFx0dmFyIFRva2VuID0gXy5Ub2tlbjtcblxuXHRcdHZhciBzdHJhcnIgPSBbdGV4dF07XG5cblx0XHR2YXIgcmVzdCA9IGdyYW1tYXIucmVzdDtcblxuXHRcdGlmIChyZXN0KSB7XG5cdFx0XHRmb3IgKHZhciB0b2tlbiBpbiByZXN0KSB7XG5cdFx0XHRcdGdyYW1tYXJbdG9rZW5dID0gcmVzdFt0b2tlbl07XG5cdFx0XHR9XG5cblx0XHRcdGRlbGV0ZSBncmFtbWFyLnJlc3Q7XG5cdFx0fVxuXG5cdFx0dG9rZW5sb29wOiBmb3IgKHZhciB0b2tlbiBpbiBncmFtbWFyKSB7XG5cdFx0XHRpZighZ3JhbW1hci5oYXNPd25Qcm9wZXJ0eSh0b2tlbikgfHwgIWdyYW1tYXJbdG9rZW5dKSB7XG5cdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0fVxuXG5cdFx0XHR2YXIgcGF0dGVybnMgPSBncmFtbWFyW3Rva2VuXTtcblx0XHRcdHBhdHRlcm5zID0gKF8udXRpbC50eXBlKHBhdHRlcm5zKSA9PT0gXCJBcnJheVwiKSA/IHBhdHRlcm5zIDogW3BhdHRlcm5zXTtcblxuXHRcdFx0Zm9yICh2YXIgaiA9IDA7IGogPCBwYXR0ZXJucy5sZW5ndGg7ICsraikge1xuXHRcdFx0XHR2YXIgcGF0dGVybiA9IHBhdHRlcm5zW2pdLFxuXHRcdFx0XHRcdGluc2lkZSA9IHBhdHRlcm4uaW5zaWRlLFxuXHRcdFx0XHRcdGxvb2tiZWhpbmQgPSAhIXBhdHRlcm4ubG9va2JlaGluZCxcblx0XHRcdFx0XHRncmVlZHkgPSAhIXBhdHRlcm4uZ3JlZWR5LFxuXHRcdFx0XHRcdGxvb2tiZWhpbmRMZW5ndGggPSAwLFxuXHRcdFx0XHRcdGFsaWFzID0gcGF0dGVybi5hbGlhcztcblxuXHRcdFx0XHRpZiAoZ3JlZWR5ICYmICFwYXR0ZXJuLnBhdHRlcm4uZ2xvYmFsKSB7XG5cdFx0XHRcdFx0Ly8gV2l0aG91dCB0aGUgZ2xvYmFsIGZsYWcsIGxhc3RJbmRleCB3b24ndCB3b3JrXG5cdFx0XHRcdFx0dmFyIGZsYWdzID0gcGF0dGVybi5wYXR0ZXJuLnRvU3RyaW5nKCkubWF0Y2goL1tpbXV5XSokLylbMF07XG5cdFx0XHRcdFx0cGF0dGVybi5wYXR0ZXJuID0gUmVnRXhwKHBhdHRlcm4ucGF0dGVybi5zb3VyY2UsIGZsYWdzICsgXCJnXCIpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0cGF0dGVybiA9IHBhdHRlcm4ucGF0dGVybiB8fCBwYXR0ZXJuO1xuXG5cdFx0XHRcdC8vIERvbuKAmXQgY2FjaGUgbGVuZ3RoIGFzIGl0IGNoYW5nZXMgZHVyaW5nIHRoZSBsb29wXG5cdFx0XHRcdGZvciAodmFyIGk9MCwgcG9zID0gMDsgaTxzdHJhcnIubGVuZ3RoOyBwb3MgKz0gc3RyYXJyW2ldLmxlbmd0aCwgKytpKSB7XG5cblx0XHRcdFx0XHR2YXIgc3RyID0gc3RyYXJyW2ldO1xuXG5cdFx0XHRcdFx0aWYgKHN0cmFyci5sZW5ndGggPiB0ZXh0Lmxlbmd0aCkge1xuXHRcdFx0XHRcdFx0Ly8gU29tZXRoaW5nIHdlbnQgdGVycmlibHkgd3JvbmcsIEFCT1JULCBBQk9SVCFcblx0XHRcdFx0XHRcdGJyZWFrIHRva2VubG9vcDtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRpZiAoc3RyIGluc3RhbmNlb2YgVG9rZW4pIHtcblx0XHRcdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdHBhdHRlcm4ubGFzdEluZGV4ID0gMDtcblxuXHRcdFx0XHRcdHZhciBtYXRjaCA9IHBhdHRlcm4uZXhlYyhzdHIpLFxuXHRcdFx0XHRcdCAgICBkZWxOdW0gPSAxO1xuXG5cdFx0XHRcdFx0Ly8gR3JlZWR5IHBhdHRlcm5zIGNhbiBvdmVycmlkZS9yZW1vdmUgdXAgdG8gdHdvIHByZXZpb3VzbHkgbWF0Y2hlZCB0b2tlbnNcblx0XHRcdFx0XHRpZiAoIW1hdGNoICYmIGdyZWVkeSAmJiBpICE9IHN0cmFyci5sZW5ndGggLSAxKSB7XG5cdFx0XHRcdFx0XHRwYXR0ZXJuLmxhc3RJbmRleCA9IHBvcztcblx0XHRcdFx0XHRcdG1hdGNoID0gcGF0dGVybi5leGVjKHRleHQpO1xuXHRcdFx0XHRcdFx0aWYgKCFtYXRjaCkge1xuXHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0dmFyIGZyb20gPSBtYXRjaC5pbmRleCArIChsb29rYmVoaW5kID8gbWF0Y2hbMV0ubGVuZ3RoIDogMCksXG5cdFx0XHRcdFx0XHQgICAgdG8gPSBtYXRjaC5pbmRleCArIG1hdGNoWzBdLmxlbmd0aCxcblx0XHRcdFx0XHRcdCAgICBrID0gaSxcblx0XHRcdFx0XHRcdCAgICBwID0gcG9zO1xuXG5cdFx0XHRcdFx0XHRmb3IgKHZhciBsZW4gPSBzdHJhcnIubGVuZ3RoOyBrIDwgbGVuICYmIHAgPCB0bzsgKytrKSB7XG5cdFx0XHRcdFx0XHRcdHAgKz0gc3RyYXJyW2tdLmxlbmd0aDtcblx0XHRcdFx0XHRcdFx0Ly8gTW92ZSB0aGUgaW5kZXggaSB0byB0aGUgZWxlbWVudCBpbiBzdHJhcnIgdGhhdCBpcyBjbG9zZXN0IHRvIGZyb21cblx0XHRcdFx0XHRcdFx0aWYgKGZyb20gPj0gcCkge1xuXHRcdFx0XHRcdFx0XHRcdCsraTtcblx0XHRcdFx0XHRcdFx0XHRwb3MgPSBwO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdC8qXG5cdFx0XHRcdFx0XHQgKiBJZiBzdHJhcnJbaV0gaXMgYSBUb2tlbiwgdGhlbiB0aGUgbWF0Y2ggc3RhcnRzIGluc2lkZSBhbm90aGVyIFRva2VuLCB3aGljaCBpcyBpbnZhbGlkXG5cdFx0XHRcdFx0XHQgKiBJZiBzdHJhcnJbayAtIDFdIGlzIGdyZWVkeSB3ZSBhcmUgaW4gY29uZmxpY3Qgd2l0aCBhbm90aGVyIGdyZWVkeSBwYXR0ZXJuXG5cdFx0XHRcdFx0XHQgKi9cblx0XHRcdFx0XHRcdGlmIChzdHJhcnJbaV0gaW5zdGFuY2VvZiBUb2tlbiB8fCBzdHJhcnJbayAtIDFdLmdyZWVkeSkge1xuXHRcdFx0XHRcdFx0XHRjb250aW51ZTtcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0Ly8gTnVtYmVyIG9mIHRva2VucyB0byBkZWxldGUgYW5kIHJlcGxhY2Ugd2l0aCB0aGUgbmV3IG1hdGNoXG5cdFx0XHRcdFx0XHRkZWxOdW0gPSBrIC0gaTtcblx0XHRcdFx0XHRcdHN0ciA9IHRleHQuc2xpY2UocG9zLCBwKTtcblx0XHRcdFx0XHRcdG1hdGNoLmluZGV4IC09IHBvcztcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRpZiAoIW1hdGNoKSB7XG5cdFx0XHRcdFx0XHRjb250aW51ZTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRpZihsb29rYmVoaW5kKSB7XG5cdFx0XHRcdFx0XHRsb29rYmVoaW5kTGVuZ3RoID0gbWF0Y2hbMV0ubGVuZ3RoO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdHZhciBmcm9tID0gbWF0Y2guaW5kZXggKyBsb29rYmVoaW5kTGVuZ3RoLFxuXHRcdFx0XHRcdCAgICBtYXRjaCA9IG1hdGNoWzBdLnNsaWNlKGxvb2tiZWhpbmRMZW5ndGgpLFxuXHRcdFx0XHRcdCAgICB0byA9IGZyb20gKyBtYXRjaC5sZW5ndGgsXG5cdFx0XHRcdFx0ICAgIGJlZm9yZSA9IHN0ci5zbGljZSgwLCBmcm9tKSxcblx0XHRcdFx0XHQgICAgYWZ0ZXIgPSBzdHIuc2xpY2UodG8pO1xuXG5cdFx0XHRcdFx0dmFyIGFyZ3MgPSBbaSwgZGVsTnVtXTtcblxuXHRcdFx0XHRcdGlmIChiZWZvcmUpIHtcblx0XHRcdFx0XHRcdGFyZ3MucHVzaChiZWZvcmUpO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdHZhciB3cmFwcGVkID0gbmV3IFRva2VuKHRva2VuLCBpbnNpZGU/IF8udG9rZW5pemUobWF0Y2gsIGluc2lkZSkgOiBtYXRjaCwgYWxpYXMsIG1hdGNoLCBncmVlZHkpO1xuXG5cdFx0XHRcdFx0YXJncy5wdXNoKHdyYXBwZWQpO1xuXG5cdFx0XHRcdFx0aWYgKGFmdGVyKSB7XG5cdFx0XHRcdFx0XHRhcmdzLnB1c2goYWZ0ZXIpO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdEFycmF5LnByb3RvdHlwZS5zcGxpY2UuYXBwbHkoc3RyYXJyLCBhcmdzKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiBzdHJhcnI7XG5cdH0sXG5cblx0aG9va3M6IHtcblx0XHRhbGw6IHt9LFxuXG5cdFx0YWRkOiBmdW5jdGlvbiAobmFtZSwgY2FsbGJhY2spIHtcblx0XHRcdHZhciBob29rcyA9IF8uaG9va3MuYWxsO1xuXG5cdFx0XHRob29rc1tuYW1lXSA9IGhvb2tzW25hbWVdIHx8IFtdO1xuXG5cdFx0XHRob29rc1tuYW1lXS5wdXNoKGNhbGxiYWNrKTtcblx0XHR9LFxuXG5cdFx0cnVuOiBmdW5jdGlvbiAobmFtZSwgZW52KSB7XG5cdFx0XHR2YXIgY2FsbGJhY2tzID0gXy5ob29rcy5hbGxbbmFtZV07XG5cblx0XHRcdGlmICghY2FsbGJhY2tzIHx8ICFjYWxsYmFja3MubGVuZ3RoKSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblxuXHRcdFx0Zm9yICh2YXIgaT0wLCBjYWxsYmFjazsgY2FsbGJhY2sgPSBjYWxsYmFja3NbaSsrXTspIHtcblx0XHRcdFx0Y2FsbGJhY2soZW52KTtcblx0XHRcdH1cblx0XHR9XG5cdH1cbn07XG5cbnZhciBUb2tlbiA9IF8uVG9rZW4gPSBmdW5jdGlvbih0eXBlLCBjb250ZW50LCBhbGlhcywgbWF0Y2hlZFN0ciwgZ3JlZWR5KSB7XG5cdHRoaXMudHlwZSA9IHR5cGU7XG5cdHRoaXMuY29udGVudCA9IGNvbnRlbnQ7XG5cdHRoaXMuYWxpYXMgPSBhbGlhcztcblx0Ly8gQ29weSBvZiB0aGUgZnVsbCBzdHJpbmcgdGhpcyB0b2tlbiB3YXMgY3JlYXRlZCBmcm9tXG5cdHRoaXMubGVuZ3RoID0gKG1hdGNoZWRTdHIgfHwgXCJcIikubGVuZ3RofDA7XG5cdHRoaXMuZ3JlZWR5ID0gISFncmVlZHk7XG59O1xuXG5Ub2tlbi5zdHJpbmdpZnkgPSBmdW5jdGlvbihvLCBsYW5ndWFnZSwgcGFyZW50KSB7XG5cdGlmICh0eXBlb2YgbyA9PSAnc3RyaW5nJykge1xuXHRcdHJldHVybiBvO1xuXHR9XG5cblx0aWYgKF8udXRpbC50eXBlKG8pID09PSAnQXJyYXknKSB7XG5cdFx0cmV0dXJuIG8ubWFwKGZ1bmN0aW9uKGVsZW1lbnQpIHtcblx0XHRcdHJldHVybiBUb2tlbi5zdHJpbmdpZnkoZWxlbWVudCwgbGFuZ3VhZ2UsIG8pO1xuXHRcdH0pLmpvaW4oJycpO1xuXHR9XG5cblx0dmFyIGVudiA9IHtcblx0XHR0eXBlOiBvLnR5cGUsXG5cdFx0Y29udGVudDogVG9rZW4uc3RyaW5naWZ5KG8uY29udGVudCwgbGFuZ3VhZ2UsIHBhcmVudCksXG5cdFx0dGFnOiAnc3BhbicsXG5cdFx0Y2xhc3NlczogWyd0b2tlbicsIG8udHlwZV0sXG5cdFx0YXR0cmlidXRlczoge30sXG5cdFx0bGFuZ3VhZ2U6IGxhbmd1YWdlLFxuXHRcdHBhcmVudDogcGFyZW50XG5cdH07XG5cblx0aWYgKGVudi50eXBlID09ICdjb21tZW50Jykge1xuXHRcdGVudi5hdHRyaWJ1dGVzWydzcGVsbGNoZWNrJ10gPSAndHJ1ZSc7XG5cdH1cblxuXHRpZiAoby5hbGlhcykge1xuXHRcdHZhciBhbGlhc2VzID0gXy51dGlsLnR5cGUoby5hbGlhcykgPT09ICdBcnJheScgPyBvLmFsaWFzIDogW28uYWxpYXNdO1xuXHRcdEFycmF5LnByb3RvdHlwZS5wdXNoLmFwcGx5KGVudi5jbGFzc2VzLCBhbGlhc2VzKTtcblx0fVxuXG5cdF8uaG9va3MucnVuKCd3cmFwJywgZW52KTtcblxuXHR2YXIgYXR0cmlidXRlcyA9IE9iamVjdC5rZXlzKGVudi5hdHRyaWJ1dGVzKS5tYXAoZnVuY3Rpb24obmFtZSkge1xuXHRcdHJldHVybiBuYW1lICsgJz1cIicgKyAoZW52LmF0dHJpYnV0ZXNbbmFtZV0gfHwgJycpLnJlcGxhY2UoL1wiL2csICcmcXVvdDsnKSArICdcIic7XG5cdH0pLmpvaW4oJyAnKTtcblxuXHRyZXR1cm4gJzwnICsgZW52LnRhZyArICcgY2xhc3M9XCInICsgZW52LmNsYXNzZXMuam9pbignICcpICsgJ1wiJyArIChhdHRyaWJ1dGVzID8gJyAnICsgYXR0cmlidXRlcyA6ICcnKSArICc+JyArIGVudi5jb250ZW50ICsgJzwvJyArIGVudi50YWcgKyAnPic7XG5cbn07XG5cbmlmICghX3NlbGYuZG9jdW1lbnQpIHtcblx0aWYgKCFfc2VsZi5hZGRFdmVudExpc3RlbmVyKSB7XG5cdFx0Ly8gaW4gTm9kZS5qc1xuXHRcdHJldHVybiBfc2VsZi5QcmlzbTtcblx0fVxuIFx0Ly8gSW4gd29ya2VyXG5cdF9zZWxmLmFkZEV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCBmdW5jdGlvbihldnQpIHtcblx0XHR2YXIgbWVzc2FnZSA9IEpTT04ucGFyc2UoZXZ0LmRhdGEpLFxuXHRcdCAgICBsYW5nID0gbWVzc2FnZS5sYW5ndWFnZSxcblx0XHQgICAgY29kZSA9IG1lc3NhZ2UuY29kZSxcblx0XHQgICAgaW1tZWRpYXRlQ2xvc2UgPSBtZXNzYWdlLmltbWVkaWF0ZUNsb3NlO1xuXG5cdFx0X3NlbGYucG9zdE1lc3NhZ2UoXy5oaWdobGlnaHQoY29kZSwgXy5sYW5ndWFnZXNbbGFuZ10sIGxhbmcpKTtcblx0XHRpZiAoaW1tZWRpYXRlQ2xvc2UpIHtcblx0XHRcdF9zZWxmLmNsb3NlKCk7XG5cdFx0fVxuXHR9LCBmYWxzZSk7XG5cblx0cmV0dXJuIF9zZWxmLlByaXNtO1xufVxuXG4vL0dldCBjdXJyZW50IHNjcmlwdCBhbmQgaGlnaGxpZ2h0XG52YXIgc2NyaXB0ID0gZG9jdW1lbnQuY3VycmVudFNjcmlwdCB8fCBbXS5zbGljZS5jYWxsKGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKFwic2NyaXB0XCIpKS5wb3AoKTtcblxuaWYgKHNjcmlwdCkge1xuXHRfLmZpbGVuYW1lID0gc2NyaXB0LnNyYztcblxuXHRpZiAoZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lciAmJiAhc2NyaXB0Lmhhc0F0dHJpYnV0ZSgnZGF0YS1tYW51YWwnKSkge1xuXHRcdGlmKGRvY3VtZW50LnJlYWR5U3RhdGUgIT09IFwibG9hZGluZ1wiKSB7XG5cdFx0XHRpZiAod2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSkge1xuXHRcdFx0XHR3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKF8uaGlnaGxpZ2h0QWxsKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHdpbmRvdy5zZXRUaW1lb3V0KF8uaGlnaGxpZ2h0QWxsLCAxNik7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGVsc2Uge1xuXHRcdFx0ZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsIF8uaGlnaGxpZ2h0QWxsKTtcblx0XHR9XG5cdH1cbn1cblxucmV0dXJuIF9zZWxmLlByaXNtO1xuXG59KSgpO1xuXG5pZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcgJiYgbW9kdWxlLmV4cG9ydHMpIHtcblx0bW9kdWxlLmV4cG9ydHMgPSBQcmlzbTtcbn1cblxuLy8gaGFjayBmb3IgY29tcG9uZW50cyB0byB3b3JrIGNvcnJlY3RseSBpbiBub2RlLmpzXG5pZiAodHlwZW9mIGdsb2JhbCAhPT0gJ3VuZGVmaW5lZCcpIHtcblx0Z2xvYmFsLlByaXNtID0gUHJpc207XG59XG5cblxuLyogKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgICBCZWdpbiBwcmlzbS1tYXJrdXAuanNcbioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogKi9cblxuUHJpc20ubGFuZ3VhZ2VzLm1hcmt1cCA9IHtcblx0J2NvbW1lbnQnOiAvPCEtLVtcXHdcXFddKj8tLT4vLFxuXHQncHJvbG9nJzogLzxcXD9bXFx3XFxXXSs/XFw/Pi8sXG5cdCdkb2N0eXBlJzogLzwhRE9DVFlQRVtcXHdcXFddKz8+L2ksXG5cdCdjZGF0YSc6IC88IVxcW0NEQVRBXFxbW1xcd1xcV10qP11dPi9pLFxuXHQndGFnJzoge1xuXHRcdHBhdHRlcm46IC88XFwvPyg/IVxcZClbXlxccz5cXC89JDxdKyg/OlxccytbXlxccz5cXC89XSsoPzo9KD86KFwifCcpKD86XFxcXFxcMXxcXFxcPyg/IVxcMSlbXFx3XFxXXSkqXFwxfFteXFxzJ1wiPj1dKykpPykqXFxzKlxcLz8+L2ksXG5cdFx0aW5zaWRlOiB7XG5cdFx0XHQndGFnJzoge1xuXHRcdFx0XHRwYXR0ZXJuOiAvXjxcXC8/W15cXHM+XFwvXSsvaSxcblx0XHRcdFx0aW5zaWRlOiB7XG5cdFx0XHRcdFx0J3B1bmN0dWF0aW9uJzogL148XFwvPy8sXG5cdFx0XHRcdFx0J25hbWVzcGFjZSc6IC9eW15cXHM+XFwvOl0rOi9cblx0XHRcdFx0fVxuXHRcdFx0fSxcblx0XHRcdCdhdHRyLXZhbHVlJzoge1xuXHRcdFx0XHRwYXR0ZXJuOiAvPSg/OignfFwiKVtcXHdcXFddKj8oXFwxKXxbXlxccz5dKykvaSxcblx0XHRcdFx0aW5zaWRlOiB7XG5cdFx0XHRcdFx0J3B1bmN0dWF0aW9uJzogL1s9PlwiJ10vXG5cdFx0XHRcdH1cblx0XHRcdH0sXG5cdFx0XHQncHVuY3R1YXRpb24nOiAvXFwvPz4vLFxuXHRcdFx0J2F0dHItbmFtZSc6IHtcblx0XHRcdFx0cGF0dGVybjogL1teXFxzPlxcL10rLyxcblx0XHRcdFx0aW5zaWRlOiB7XG5cdFx0XHRcdFx0J25hbWVzcGFjZSc6IC9eW15cXHM+XFwvOl0rOi9cblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0fVxuXHR9LFxuXHQnZW50aXR5JzogLyYjP1tcXGRhLXpdezEsOH07L2lcbn07XG5cbi8vIFBsdWdpbiB0byBtYWtlIGVudGl0eSB0aXRsZSBzaG93IHRoZSByZWFsIGVudGl0eSwgaWRlYSBieSBSb21hbiBLb21hcm92XG5QcmlzbS5ob29rcy5hZGQoJ3dyYXAnLCBmdW5jdGlvbihlbnYpIHtcblxuXHRpZiAoZW52LnR5cGUgPT09ICdlbnRpdHknKSB7XG5cdFx0ZW52LmF0dHJpYnV0ZXNbJ3RpdGxlJ10gPSBlbnYuY29udGVudC5yZXBsYWNlKC8mYW1wOy8sICcmJyk7XG5cdH1cbn0pO1xuXG5QcmlzbS5sYW5ndWFnZXMueG1sID0gUHJpc20ubGFuZ3VhZ2VzLm1hcmt1cDtcblByaXNtLmxhbmd1YWdlcy5odG1sID0gUHJpc20ubGFuZ3VhZ2VzLm1hcmt1cDtcblByaXNtLmxhbmd1YWdlcy5tYXRobWwgPSBQcmlzbS5sYW5ndWFnZXMubWFya3VwO1xuUHJpc20ubGFuZ3VhZ2VzLnN2ZyA9IFByaXNtLmxhbmd1YWdlcy5tYXJrdXA7XG5cblxuLyogKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgICBCZWdpbiBwcmlzbS1jc3MuanNcbioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogKi9cblxuUHJpc20ubGFuZ3VhZ2VzLmNzcyA9IHtcblx0J2NvbW1lbnQnOiAvXFwvXFwqW1xcd1xcV10qP1xcKlxcLy8sXG5cdCdhdHJ1bGUnOiB7XG5cdFx0cGF0dGVybjogL0BbXFx3LV0rPy4qPyg7fCg/PVxccypcXHspKS9pLFxuXHRcdGluc2lkZToge1xuXHRcdFx0J3J1bGUnOiAvQFtcXHctXSsvXG5cdFx0XHQvLyBTZWUgcmVzdCBiZWxvd1xuXHRcdH1cblx0fSxcblx0J3VybCc6IC91cmxcXCgoPzooW1wiJ10pKFxcXFwoPzpcXHJcXG58W1xcd1xcV10pfCg/IVxcMSlbXlxcXFxcXHJcXG5dKSpcXDF8Lio/KVxcKS9pLFxuXHQnc2VsZWN0b3InOiAvW15cXHtcXH1cXHNdW15cXHtcXH07XSo/KD89XFxzKlxceykvLFxuXHQnc3RyaW5nJzoge1xuXHRcdHBhdHRlcm46IC8oXCJ8JykoXFxcXCg/OlxcclxcbnxbXFx3XFxXXSl8KD8hXFwxKVteXFxcXFxcclxcbl0pKlxcMS8sXG5cdFx0Z3JlZWR5OiB0cnVlXG5cdH0sXG5cdCdwcm9wZXJ0eSc6IC8oXFxifFxcQilbXFx3LV0rKD89XFxzKjopL2ksXG5cdCdpbXBvcnRhbnQnOiAvXFxCIWltcG9ydGFudFxcYi9pLFxuXHQnZnVuY3Rpb24nOiAvWy1hLXowLTldKyg/PVxcKCkvaSxcblx0J3B1bmN0dWF0aW9uJzogL1soKXt9OzpdL1xufTtcblxuUHJpc20ubGFuZ3VhZ2VzLmNzc1snYXRydWxlJ10uaW5zaWRlLnJlc3QgPSBQcmlzbS51dGlsLmNsb25lKFByaXNtLmxhbmd1YWdlcy5jc3MpO1xuXG5pZiAoUHJpc20ubGFuZ3VhZ2VzLm1hcmt1cCkge1xuXHRQcmlzbS5sYW5ndWFnZXMuaW5zZXJ0QmVmb3JlKCdtYXJrdXAnLCAndGFnJywge1xuXHRcdCdzdHlsZSc6IHtcblx0XHRcdHBhdHRlcm46IC8oPHN0eWxlW1xcd1xcV10qPz4pW1xcd1xcV10qPyg/PTxcXC9zdHlsZT4pL2ksXG5cdFx0XHRsb29rYmVoaW5kOiB0cnVlLFxuXHRcdFx0aW5zaWRlOiBQcmlzbS5sYW5ndWFnZXMuY3NzLFxuXHRcdFx0YWxpYXM6ICdsYW5ndWFnZS1jc3MnXG5cdFx0fVxuXHR9KTtcblx0XG5cdFByaXNtLmxhbmd1YWdlcy5pbnNlcnRCZWZvcmUoJ2luc2lkZScsICdhdHRyLXZhbHVlJywge1xuXHRcdCdzdHlsZS1hdHRyJzoge1xuXHRcdFx0cGF0dGVybjogL1xccypzdHlsZT0oXCJ8JykuKj9cXDEvaSxcblx0XHRcdGluc2lkZToge1xuXHRcdFx0XHQnYXR0ci1uYW1lJzoge1xuXHRcdFx0XHRcdHBhdHRlcm46IC9eXFxzKnN0eWxlL2ksXG5cdFx0XHRcdFx0aW5zaWRlOiBQcmlzbS5sYW5ndWFnZXMubWFya3VwLnRhZy5pbnNpZGVcblx0XHRcdFx0fSxcblx0XHRcdFx0J3B1bmN0dWF0aW9uJzogL15cXHMqPVxccypbJ1wiXXxbJ1wiXVxccyokLyxcblx0XHRcdFx0J2F0dHItdmFsdWUnOiB7XG5cdFx0XHRcdFx0cGF0dGVybjogLy4rL2ksXG5cdFx0XHRcdFx0aW5zaWRlOiBQcmlzbS5sYW5ndWFnZXMuY3NzXG5cdFx0XHRcdH1cblx0XHRcdH0sXG5cdFx0XHRhbGlhczogJ2xhbmd1YWdlLWNzcydcblx0XHR9XG5cdH0sIFByaXNtLmxhbmd1YWdlcy5tYXJrdXAudGFnKTtcbn1cblxuLyogKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgICBCZWdpbiBwcmlzbS1jbGlrZS5qc1xuKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiAqL1xuXG5QcmlzbS5sYW5ndWFnZXMuY2xpa2UgPSB7XG5cdCdjb21tZW50JzogW1xuXHRcdHtcblx0XHRcdHBhdHRlcm46IC8oXnxbXlxcXFxdKVxcL1xcKltcXHdcXFddKj9cXCpcXC8vLFxuXHRcdFx0bG9va2JlaGluZDogdHJ1ZVxuXHRcdH0sXG5cdFx0e1xuXHRcdFx0cGF0dGVybjogLyhefFteXFxcXDpdKVxcL1xcLy4qLyxcblx0XHRcdGxvb2tiZWhpbmQ6IHRydWVcblx0XHR9XG5cdF0sXG5cdCdzdHJpbmcnOiB7XG5cdFx0cGF0dGVybjogLyhbXCInXSkoXFxcXCg/OlxcclxcbnxbXFxzXFxTXSl8KD8hXFwxKVteXFxcXFxcclxcbl0pKlxcMS8sXG5cdFx0Z3JlZWR5OiB0cnVlXG5cdH0sXG5cdCdjbGFzcy1uYW1lJzoge1xuXHRcdHBhdHRlcm46IC8oKD86XFxiKD86Y2xhc3N8aW50ZXJmYWNlfGV4dGVuZHN8aW1wbGVtZW50c3x0cmFpdHxpbnN0YW5jZW9mfG5ldylcXHMrKXwoPzpjYXRjaFxccytcXCgpKVthLXowLTlfXFwuXFxcXF0rL2ksXG5cdFx0bG9va2JlaGluZDogdHJ1ZSxcblx0XHRpbnNpZGU6IHtcblx0XHRcdHB1bmN0dWF0aW9uOiAvKFxcLnxcXFxcKS9cblx0XHR9XG5cdH0sXG5cdCdrZXl3b3JkJzogL1xcYihpZnxlbHNlfHdoaWxlfGRvfGZvcnxyZXR1cm58aW58aW5zdGFuY2VvZnxmdW5jdGlvbnxuZXd8dHJ5fHRocm93fGNhdGNofGZpbmFsbHl8bnVsbHxicmVha3xjb250aW51ZSlcXGIvLFxuXHQnYm9vbGVhbic6IC9cXGIodHJ1ZXxmYWxzZSlcXGIvLFxuXHQnZnVuY3Rpb24nOiAvW2EtejAtOV9dKyg/PVxcKCkvaSxcblx0J251bWJlcic6IC9cXGItPyg/OjB4W1xcZGEtZl0rfFxcZCpcXC4/XFxkKyg/OmVbKy1dP1xcZCspPylcXGIvaSxcblx0J29wZXJhdG9yJzogLy0tP3xcXCtcXCs/fCE9Pz0/fDw9P3w+PT98PT0/PT98JiY/fFxcfFxcfD98XFw/fFxcKnxcXC98fnxcXF58JS8sXG5cdCdwdW5jdHVhdGlvbic6IC9be31bXFxdOygpLC46XS9cbn07XG5cblxuLyogKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgICBCZWdpbiBwcmlzbS1qYXZhc2NyaXB0LmpzXG4qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqICovXG5cblByaXNtLmxhbmd1YWdlcy5qYXZhc2NyaXB0ID0gUHJpc20ubGFuZ3VhZ2VzLmV4dGVuZCgnY2xpa2UnLCB7XG5cdCdrZXl3b3JkJzogL1xcYihhc3xhc3luY3xhd2FpdHxicmVha3xjYXNlfGNhdGNofGNsYXNzfGNvbnN0fGNvbnRpbnVlfGRlYnVnZ2VyfGRlZmF1bHR8ZGVsZXRlfGRvfGVsc2V8ZW51bXxleHBvcnR8ZXh0ZW5kc3xmaW5hbGx5fGZvcnxmcm9tfGZ1bmN0aW9ufGdldHxpZnxpbXBsZW1lbnRzfGltcG9ydHxpbnxpbnN0YW5jZW9mfGludGVyZmFjZXxsZXR8bmV3fG51bGx8b2Z8cGFja2FnZXxwcml2YXRlfHByb3RlY3RlZHxwdWJsaWN8cmV0dXJufHNldHxzdGF0aWN8c3VwZXJ8c3dpdGNofHRoaXN8dGhyb3d8dHJ5fHR5cGVvZnx2YXJ8dm9pZHx3aGlsZXx3aXRofHlpZWxkKVxcYi8sXG5cdCdudW1iZXInOiAvXFxiLT8oMHhbXFxkQS1GYS1mXSt8MGJbMDFdK3wwb1swLTddK3xcXGQqXFwuP1xcZCsoW0VlXVsrLV0/XFxkKyk/fE5hTnxJbmZpbml0eSlcXGIvLFxuXHQvLyBBbGxvdyBmb3IgYWxsIG5vbi1BU0NJSSBjaGFyYWN0ZXJzIChTZWUgaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL2EvMjAwODQ0NClcblx0J2Z1bmN0aW9uJzogL1tfJGEtekEtWlxceEEwLVxcdUZGRkZdW18kYS16QS1aMC05XFx4QTAtXFx1RkZGRl0qKD89XFwoKS9pLFxuXHQnb3BlcmF0b3InOiAvLS0/fFxcK1xcKz98IT0/PT98PD0/fD49P3w9PT89P3wmJj98XFx8XFx8P3xcXD98XFwqXFwqP3xcXC98fnxcXF58JXxcXC57M30vXG59KTtcblxuUHJpc20ubGFuZ3VhZ2VzLmluc2VydEJlZm9yZSgnamF2YXNjcmlwdCcsICdrZXl3b3JkJywge1xuXHQncmVnZXgnOiB7XG5cdFx0cGF0dGVybjogLyhefFteL10pXFwvKD8hXFwvKShcXFsuKz9dfFxcXFwufFteL1xcXFxcXHJcXG5dKStcXC9bZ2lteXVdezAsNX0oPz1cXHMqKCR8W1xcclxcbiwuO30pXSkpLyxcblx0XHRsb29rYmVoaW5kOiB0cnVlLFxuXHRcdGdyZWVkeTogdHJ1ZVxuXHR9XG59KTtcblxuUHJpc20ubGFuZ3VhZ2VzLmluc2VydEJlZm9yZSgnamF2YXNjcmlwdCcsICdzdHJpbmcnLCB7XG5cdCd0ZW1wbGF0ZS1zdHJpbmcnOiB7XG5cdFx0cGF0dGVybjogL2AoPzpcXFxcXFxcXHxcXFxcP1teXFxcXF0pKj9gLyxcblx0XHRncmVlZHk6IHRydWUsXG5cdFx0aW5zaWRlOiB7XG5cdFx0XHQnaW50ZXJwb2xhdGlvbic6IHtcblx0XHRcdFx0cGF0dGVybjogL1xcJFxce1tefV0rXFx9Lyxcblx0XHRcdFx0aW5zaWRlOiB7XG5cdFx0XHRcdFx0J2ludGVycG9sYXRpb24tcHVuY3R1YXRpb24nOiB7XG5cdFx0XHRcdFx0XHRwYXR0ZXJuOiAvXlxcJFxce3xcXH0kLyxcblx0XHRcdFx0XHRcdGFsaWFzOiAncHVuY3R1YXRpb24nXG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRyZXN0OiBQcmlzbS5sYW5ndWFnZXMuamF2YXNjcmlwdFxuXHRcdFx0XHR9XG5cdFx0XHR9LFxuXHRcdFx0J3N0cmluZyc6IC9bXFxzXFxTXSsvXG5cdFx0fVxuXHR9XG59KTtcblxuaWYgKFByaXNtLmxhbmd1YWdlcy5tYXJrdXApIHtcblx0UHJpc20ubGFuZ3VhZ2VzLmluc2VydEJlZm9yZSgnbWFya3VwJywgJ3RhZycsIHtcblx0XHQnc2NyaXB0Jzoge1xuXHRcdFx0cGF0dGVybjogLyg8c2NyaXB0W1xcd1xcV10qPz4pW1xcd1xcV10qPyg/PTxcXC9zY3JpcHQ+KS9pLFxuXHRcdFx0bG9va2JlaGluZDogdHJ1ZSxcblx0XHRcdGluc2lkZTogUHJpc20ubGFuZ3VhZ2VzLmphdmFzY3JpcHQsXG5cdFx0XHRhbGlhczogJ2xhbmd1YWdlLWphdmFzY3JpcHQnXG5cdFx0fVxuXHR9KTtcbn1cblxuUHJpc20ubGFuZ3VhZ2VzLmpzID0gUHJpc20ubGFuZ3VhZ2VzLmphdmFzY3JpcHQ7XG5cbi8qICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICAgQmVnaW4gcHJpc20tZmlsZS1oaWdobGlnaHQuanNcbioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogKi9cblxuKGZ1bmN0aW9uICgpIHtcblx0aWYgKHR5cGVvZiBzZWxmID09PSAndW5kZWZpbmVkJyB8fCAhc2VsZi5QcmlzbSB8fCAhc2VsZi5kb2N1bWVudCB8fCAhZG9jdW1lbnQucXVlcnlTZWxlY3Rvcikge1xuXHRcdHJldHVybjtcblx0fVxuXG5cdHNlbGYuUHJpc20uZmlsZUhpZ2hsaWdodCA9IGZ1bmN0aW9uKCkge1xuXG5cdFx0dmFyIEV4dGVuc2lvbnMgPSB7XG5cdFx0XHQnanMnOiAnamF2YXNjcmlwdCcsXG5cdFx0XHQncHknOiAncHl0aG9uJyxcblx0XHRcdCdyYic6ICdydWJ5Jyxcblx0XHRcdCdwczEnOiAncG93ZXJzaGVsbCcsXG5cdFx0XHQncHNtMSc6ICdwb3dlcnNoZWxsJyxcblx0XHRcdCdzaCc6ICdiYXNoJyxcblx0XHRcdCdiYXQnOiAnYmF0Y2gnLFxuXHRcdFx0J2gnOiAnYycsXG5cdFx0XHQndGV4JzogJ2xhdGV4J1xuXHRcdH07XG5cblx0XHRpZihBcnJheS5wcm90b3R5cGUuZm9yRWFjaCkgeyAvLyBDaGVjayB0byBwcmV2ZW50IGVycm9yIGluIElFOFxuXHRcdFx0QXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgncHJlW2RhdGEtc3JjXScpKS5mb3JFYWNoKGZ1bmN0aW9uIChwcmUpIHtcblx0XHRcdFx0dmFyIHNyYyA9IHByZS5nZXRBdHRyaWJ1dGUoJ2RhdGEtc3JjJyk7XG5cblx0XHRcdFx0dmFyIGxhbmd1YWdlLCBwYXJlbnQgPSBwcmU7XG5cdFx0XHRcdHZhciBsYW5nID0gL1xcYmxhbmcoPzp1YWdlKT8tKD8hXFwqKShcXHcrKVxcYi9pO1xuXHRcdFx0XHR3aGlsZSAocGFyZW50ICYmICFsYW5nLnRlc3QocGFyZW50LmNsYXNzTmFtZSkpIHtcblx0XHRcdFx0XHRwYXJlbnQgPSBwYXJlbnQucGFyZW50Tm9kZTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmIChwYXJlbnQpIHtcblx0XHRcdFx0XHRsYW5ndWFnZSA9IChwcmUuY2xhc3NOYW1lLm1hdGNoKGxhbmcpIHx8IFssICcnXSlbMV07XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAoIWxhbmd1YWdlKSB7XG5cdFx0XHRcdFx0dmFyIGV4dGVuc2lvbiA9IChzcmMubWF0Y2goL1xcLihcXHcrKSQvKSB8fCBbLCAnJ10pWzFdO1xuXHRcdFx0XHRcdGxhbmd1YWdlID0gRXh0ZW5zaW9uc1tleHRlbnNpb25dIHx8IGV4dGVuc2lvbjtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHZhciBjb2RlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY29kZScpO1xuXHRcdFx0XHRjb2RlLmNsYXNzTmFtZSA9ICdsYW5ndWFnZS0nICsgbGFuZ3VhZ2U7XG5cblx0XHRcdFx0cHJlLnRleHRDb250ZW50ID0gJyc7XG5cblx0XHRcdFx0Y29kZS50ZXh0Q29udGVudCA9ICdMb2FkaW5n4oCmJztcblxuXHRcdFx0XHRwcmUuYXBwZW5kQ2hpbGQoY29kZSk7XG5cblx0XHRcdFx0dmFyIHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuXG5cdFx0XHRcdHhoci5vcGVuKCdHRVQnLCBzcmMsIHRydWUpO1xuXG5cdFx0XHRcdHhoci5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0aWYgKHhoci5yZWFkeVN0YXRlID09IDQpIHtcblxuXHRcdFx0XHRcdFx0aWYgKHhoci5zdGF0dXMgPCA0MDAgJiYgeGhyLnJlc3BvbnNlVGV4dCkge1xuXHRcdFx0XHRcdFx0XHRjb2RlLnRleHRDb250ZW50ID0geGhyLnJlc3BvbnNlVGV4dDtcblxuXHRcdFx0XHRcdFx0XHRQcmlzbS5oaWdobGlnaHRFbGVtZW50KGNvZGUpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0ZWxzZSBpZiAoeGhyLnN0YXR1cyA+PSA0MDApIHtcblx0XHRcdFx0XHRcdFx0Y29kZS50ZXh0Q29udGVudCA9ICfinJYgRXJyb3IgJyArIHhoci5zdGF0dXMgKyAnIHdoaWxlIGZldGNoaW5nIGZpbGU6ICcgKyB4aHIuc3RhdHVzVGV4dDtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRjb2RlLnRleHRDb250ZW50ID0gJ+KcliBFcnJvcjogRmlsZSBkb2VzIG5vdCBleGlzdCBvciBpcyBlbXB0eSc7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9O1xuXG5cdFx0XHRcdHhoci5zZW5kKG51bGwpO1xuXHRcdFx0fSk7XG5cdFx0fVxuXG5cdH07XG5cblx0ZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsIHNlbGYuUHJpc20uZmlsZUhpZ2hsaWdodCk7XG5cbn0pKCk7XG4iLCJpbXBvcnQgYXZhbG9uYm94IGZyb20gJy4uLy4uL3NyYy9zY3JpcHRzL2F2YWxvbmJveCc7XG5pbXBvcnQgcHJpc20gZnJvbSAncHJpc21qcydcblxuXG5kb2N1bWVudC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbigpe1xuICBpZihkb2N1bWVudC5yZWFkeVN0YXRlID09PSAnY29tcGxldGUnKXtcblxuICAgIGF2YWxvbmJveC5ydW4oJ2ltYWdlLWdhbGxlcnktc2luZ2xlJyk7XG4gICAgYXZhbG9uYm94LnJ1bignaW1hZ2UtZ2FsbGVyeS1tdWx0aXBsZScpO1xuICAgIGF2YWxvbmJveC5ydW4oJ2ltYWdlLWdhbGxlcnktbWFueScpO1xuICB9XG59XG4iLCJtb2R1bGUuZXhwb3J0cz17XG4gIFwibW9kZVwiOiBcInByb2RcIlxufVxuIiwiaW1wb3J0ICogYXMgaHRtbCBmcm9tICcuL2NvcmUvaHRtbCdcbmltcG9ydCBiaW5kIGZyb20gJy4vY29yZS9iaW5kJ1xuaW1wb3J0IGRlbGVnYXRlIGZyb20gJy4vY29yZS9kZWxlZ2F0ZSdcblxuaW1wb3J0IERpcmVjdGlvbiBmcm9tICcuL2NvbnN0YW50cy9EaXJlY3Rpb24nXG5pbXBvcnQgQXBwQ29uc3RhbnRzIGZyb20gJy4vY29uc3RhbnRzL0FwcENvbnN0YW50cydcbmNvbnN0IGNvbmZpZyA9IHJlcXVpcmUoJy4vYXBwY29uZmlnJylcblxuY29uc3QgYm94ID0gJ2F2YWxvbmJveCdcbmNvbnN0IGlzRGV2ID0gY29uZmlnLm1vZGUgPT09IEFwcENvbnN0YW50cy5ERVZcblxuY29uc3QgQXZhbG9uYm94ID0gKGZ1bmN0aW9uKCkge1xuICBjb25zdCBkb2MgPSBkb2N1bWVudFxuICBjb25zdCBidXR0b25zID0ge31cbiAgY29uc3Qgb3ZlcmxheSA9IGh0bWwuY3JlYXRlT3ZlcmxheUJveChkb2MpXG4gIGNvbnN0IGZyYW1lID0gaHRtbC5jcmVhdGVGcmFtZShkb2MpXG4gIGZyYW1lLmltYWdlLmFkZEV2ZW50TGlzdGVuZXIoJ2FuaW1hdGlvbmVuZCcsIG9uSW1hZ2VBbmltYXRpb25FbmQsIGZhbHNlKVxuICBjb25zdCBzcGlubmVyID0gaHRtbC5jcmVhdGVTcGlubmVyKGRvYylcbiAgY29uc3Qgc3Bpbm5lcldyYXBwZXIgPSBodG1sLmNyZWF0ZVNwaW5uZXJXcmFwcGVyKGRvYylcbiAgY29uc3QgZG93bmxvYWRJbWFnZSA9IG5ldyBJbWFnZSgpXG5cbiAgbGV0IGFjdGl2ZVxuICBsZXQgY3VycmVudExpbmtcblxuICBpbml0aWFsaXplKClcblxuICBmdW5jdGlvbiBpbml0aWFsaXplKCkge1xuICAgIGFjdGl2ZSA9IGZhbHNlXG4gICAgaHRtbC5hcHBlbmRDaGlsZChkb2MsIG92ZXJsYXkpXG4gICAgYnV0dG9ucy5wcmV2ID0gaHRtbC5jcmVhdGVQcmV2aW91c0J1dHRvbihkb2MpXG4gICAgYnV0dG9ucy5uZXh0ID0gaHRtbC5jcmVhdGVOZXh0QnV0dG9uKGRvYylcbiAgICBzcGlubmVyV3JhcHBlci5hcHBlbmRDaGlsZChzcGlubmVyKVxuICAgIG92ZXJsYXkuYXBwZW5kQ2hpbGQoZnJhbWUuY29udGFpbmVyKVxuICAgIG92ZXJsYXkuYXBwZW5kQ2hpbGQoc3Bpbm5lcldyYXBwZXIpXG4gICAgb3ZlcmxheS5hcHBlbmRDaGlsZChidXR0b25zLnByZXYpXG4gICAgb3ZlcmxheS5hcHBlbmRDaGlsZChidXR0b25zLm5leHQpXG5cbiAgICBiaW5kKG92ZXJsYXksICdjbGljaycsIGhpZGVPdmVybGF5KVxuICAgIGJpbmQoYnV0dG9ucy5wcmV2LCAnY2xpY2snLCBwcmV2aW91cylcbiAgICBiaW5kKGJ1dHRvbnMubmV4dCwgJ2NsaWNrJywgbmV4dClcbiAgICBiaW5kKGRvYywgJ2tleWRvd24nLCBrZXlQcmVzc0hhbmRsZXIpXG4gIH1cblxuICBmdW5jdGlvbiBoaWRlT3ZlcmxheShlKSB7XG4gICAgbGV0IGYgPSBmcmFtZS5jb250YWluZXJcbiAgICBpZiAoZiA9PT0gZS50YXJnZXQgfHwgIWYuY29udGFpbnMoZS50YXJnZXQpKSBjbGVhbkZyYW1lKClcbiAgfVxuXG4gIGZ1bmN0aW9uIGNsZWFuRnJhbWUoKSB7XG4gICAgaHRtbC5oaWRlKG92ZXJsYXkpXG4gICAgZnJhbWUuaW1hZ2UuY2xhc3NMaXN0LnJlbW92ZSgnc2hvd1JpZ2h0JywgJ3Nob3dMZWZ0JywgJ3Nob3cnKVxuICAgIGZyYW1lLmltYWdlLnNyYyA9ICcnXG4gICAgYWN0aXZlID0gZmFsc2VcbiAgfVxuXG4gIGZ1bmN0aW9uIHNob3dPdmVybGF5KGUpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICBjbGVhbkZyYW1lKClcbiAgICBhY3RpdmUgPSB0cnVlXG4gICAgaHRtbC5zaG93KG92ZXJsYXkpXG4gICAgY3VycmVudExpbmsgPSBlLmRlbGVnYXRlVGFyZ2V0XG4gICAgZmV0Y2hJbWFnZSgpXG5cbiAgICBpZiAoc2luZ2xlKGUuY3VycmVudFRhcmdldC5pZCkpIHtcbiAgICAgIGh0bWwuaGlkZShidXR0b25zLnByZXYpXG4gICAgICBodG1sLmhpZGUoYnV0dG9ucy5uZXh0KVxuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoY3VycmVudExpbmsucHJldmlvdXNFbGVtZW50U2libGluZykgaHRtbC5zaG93KGJ1dHRvbnMucHJldilcbiAgICAgIGVsc2UgaHRtbC5oaWRlKGJ1dHRvbnMucHJldilcblxuICAgICAgaWYgKGN1cnJlbnRMaW5rLm5leHRFbGVtZW50U2libGluZykgaHRtbC5zaG93KGJ1dHRvbnMubmV4dClcbiAgICAgIGVsc2UgaHRtbC5oaWRlKGJ1dHRvbnMubmV4dClcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBuZXh0KGUpIHtcbiAgICBmcmFtZS5pbWFnZS5jbGFzc0xpc3QucmVtb3ZlKCdzaG93TGVmdCcsICdzaG93JylcbiAgICBodG1sLnNob3coYnV0dG9ucy5wcmV2KVxuICAgIGlmIChjdXJyZW50TGluay5uZXh0RWxlbWVudFNpYmxpbmcpIHtcbiAgICAgIGN1cnJlbnRMaW5rID0gY3VycmVudExpbmsubmV4dEVsZW1lbnRTaWJsaW5nXG4gICAgICBmZXRjaEltYWdlKERpcmVjdGlvbi5SSUdIVClcbiAgICAgIGlmICghY3VycmVudExpbmsubmV4dEVsZW1lbnRTaWJsaW5nKSBodG1sLmhpZGUoYnV0dG9ucy5uZXh0KVxuICAgIH1cblxuICAgIGUuc3RvcFByb3BhZ2F0aW9uKClcbiAgfVxuXG4gIGZ1bmN0aW9uIHByZXZpb3VzKGUpIHtcbiAgICBmcmFtZS5pbWFnZS5jbGFzc0xpc3QucmVtb3ZlKCdzaG93UmlnaHQnLCAnc2hvdycpXG4gICAgaHRtbC5zaG93KGJ1dHRvbnMubmV4dClcbiAgICBpZiAoY3VycmVudExpbmsucHJldmlvdXNFbGVtZW50U2libGluZykge1xuICAgICAgY3VycmVudExpbmsgPSBjdXJyZW50TGluay5wcmV2aW91c0VsZW1lbnRTaWJsaW5nXG4gICAgICBmZXRjaEltYWdlKERpcmVjdGlvbi5MRUZUKVxuICAgICAgaWYgKCFjdXJyZW50TGluay5wcmV2aW91c0VsZW1lbnRTaWJsaW5nKSBodG1sLmhpZGUoYnV0dG9ucy5wcmV2KVxuICAgIH1cblxuICAgIGUuc3RvcFByb3BhZ2F0aW9uKClcbiAgfVxuXG4gIGZ1bmN0aW9uIG9uSW1hZ2VBbmltYXRpb25FbmQoZSkge1xuICAgIGRvd25sb2FkSW1hZ2Uuc3JjID0gY3VycmVudExpbmsuZ2V0QXR0cmlidXRlKCdocmVmJylcbiAgICBmcmFtZS5saW5rLmhyZWYgPSBjdXJyZW50TGluay5nZXRBdHRyaWJ1dGUoJ2hyZWYnKVxuICB9XG5cbiAgZnVuY3Rpb24gZmV0Y2hJbWFnZShESVJFQ1RJT04pIHtcbiAgICBkb3dubG9hZEltYWdlLm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgb25Mb2FkSW1hZ2UuYmluZCh0aGlzLCBESVJFQ1RJT04pKClcbiAgICB9XG4gICAgaWYgKERJUkVDVElPTikge1xuICAgICAgaHRtbC5zbGlkZU91dChmcmFtZS5pbWFnZSwgRElSRUNUSU9OKVxuICAgIH0gZWxzZSB7XG4gICAgICBkb3dubG9hZEltYWdlLnNyYyA9IGN1cnJlbnRMaW5rLmdldEF0dHJpYnV0ZSgnaHJlZicpXG4gICAgICBmcmFtZS5saW5rLmhyZWYgPSBjdXJyZW50TGluay5nZXRBdHRyaWJ1dGUoJ2hyZWYnKVxuICAgIH1cblxuICAgIGh0bWwuc2hvdyhzcGlubmVyKVxuICB9XG5cbiAgZnVuY3Rpb24gb25Mb2FkSW1hZ2UoRElSRUNUSU9OKSB7XG4gICAgaWYgKGlzRGV2KSB7XG4gICAgICBzZXRUaW1lb3V0KGxvYWRJbWFnZS5iaW5kKHRoaXMsIERJUkVDVElPTiksIDEwMDApXG4gICAgfSBlbHNlIHtcbiAgICAgIGxvYWRJbWFnZS5iaW5kKHRoaXMsIERJUkVDVElPTikoKVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGxvYWRJbWFnZShESVJFQ1RJT04pIHtcbiAgICBpZiAoRElSRUNUSU9OKSBodG1sLnNsaWRlSW4oZnJhbWUuaW1hZ2UsIERJUkVDVElPTilcbiAgICBlbHNlIGh0bWwuc2hvdyhmcmFtZS5pbWFnZSlcbiAgICBmcmFtZS5pbWFnZS5zcmMgPSB0aGlzLnNyY1xuICAgIGh0bWwuaGlkZShzcGlubmVyKVxuICB9XG5cbiAgLy8gVE9ETzogU3dhcCBbXS5zbGljZSBmb3IgQXJyYXkuZnJvbSAoRVM2KVxuICAvLyBOZWVkIHRvIHRlc3QgaW4gSUU5XG4gIGZ1bmN0aW9uIHNpbmdsZShxdWVyeSkge1xuICAgIGNvbnN0IGxpbmtzID0gZG9jLmdldEVsZW1lbnRCeUlkKHF1ZXJ5KS5nZXRFbGVtZW50c0J5VGFnTmFtZSgnYScpXG4gICAgcmV0dXJuIFtdLnNsaWNlLmNhbGwobGlua3MpLmxlbmd0aCA9PSAxXG4gIH1cblxuICBmdW5jdGlvbiBydW4ocXVlcnkpIHtcbiAgICBldmVudEhhbmRsZXJzKHF1ZXJ5KVxuICB9XG5cbiAgZnVuY3Rpb24gZXZlbnRIYW5kbGVycyhxdWVyeSkge1xuICAgIGNvbnN0IGVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQocXVlcnkpXG4gICAgY29uc3QgZmlsdGVyTGlua3MgPSB4ID0+IHgudGFnTmFtZS50b0xvd2VyQ2FzZSgpID09ICdhJ1xuICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZGVsZWdhdGUoZmlsdGVyTGlua3MsIHNob3dPdmVybGF5KSlcbiAgfVxuXG4gIGZ1bmN0aW9uIGtleVByZXNzSGFuZGxlcihldmVudCkge1xuICAgIGNvbnN0IGUgPSBldmVudCB8fCB3aW5kb3cuZXZlbnRcblxuICAgIGlmICghYWN0aXZlKSByZXR1cm5cblxuICAgIGlmIChlLmtleUNvZGUgPT0gJzM3JykgcHJldmlvdXMoZSlcbiAgICBlbHNlIGlmIChlLmtleUNvZGUgPT0gJzM5JykgbmV4dChlKVxuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBydW5cbiAgfVxufSkoKVxuXG5tb2R1bGUuZXhwb3J0cyA9IEF2YWxvbmJveFxuIiwiY29uc3QgQXBwQ29uc3RhbnRzID0ge1xuICBERVY6ICdkZXYnLFxuICBQUk9EOiAncHJvZCdcbn1cblxuZXhwb3J0IGRlZmF1bHQgQXBwQ29uc3RhbnRzXG4iLCJjb25zdCBEaXJlY3Rpb24gPSB7XG4gIExFRlQ6ICdsZWZ0JyxcbiAgUklHSFQ6ICdyaWdodCdcbn1cblxuZXhwb3J0IGRlZmF1bHQgRGlyZWN0aW9uXG4iLCJmdW5jdGlvbiBiaW5kKGVsZW1lbnQsIGV2ZW50LCBjYWxsYmFjaywgdXNlQ2FwdHVyZSkge1xuICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoZXZlbnQsIGNhbGxiYWNrLCB1c2VDYXB0dXJlKVxufVxuXG5leHBvcnQgZGVmYXVsdCBiaW5kXG4iLCJjb25zdCBkZWxlZ2F0ZSA9IGZ1bmN0aW9uKGNyaXRlcmlhLCBsaXN0ZW5lcikge1xuICByZXR1cm4gZnVuY3Rpb24oZSkge1xuICAgIGxldCBlbCA9IGUudGFyZ2V0XG4gICAgZG8ge1xuICAgICAgaWYgKCFjcml0ZXJpYShlbCkpXG4gICAgICAgIGNvbnRpbnVlXG4gICAgICBlLmRlbGVnYXRlVGFyZ2V0ID0gZWxcbiAgICAgIGxpc3RlbmVyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cylcbiAgICAgIHJldHVyblxuICAgIH0gd2hpbGUoKGVsID0gZWwucGFyZW50Tm9kZSkpXG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgZGVsZWdhdGVcbiIsImltcG9ydCBiaW5kIGZyb20gJy4vYmluZCdcbmltcG9ydCBEaXJlY3Rpb24gZnJvbSAnLi4vY29uc3RhbnRzL0RpcmVjdGlvbidcbmltcG9ydCBjYXBpdGFsaXplIGZyb20gJy4uL3V0aWxzL2NhcGl0YWxpemUnXG5pbXBvcnQgb3Bwb3NpdGVEaXJlY3Rpb24gZnJvbSAnLi4vdXRpbHMvb3Bwb3NpdGUtZGlyZWN0aW9uJ1xuaW1wb3J0IHsgTGVmdEljb24sIFJpZ2h0SWNvbiB9IGZyb20gJy4uL2ljb25zJ1xuY29uc3QgYm94ID0gJ2F2YWxvbmJveCdcblxuZnVuY3Rpb24gY3JlYXRlUHJldmlvdXNCdXR0b24oZG9jKSB7XG4gIGNvbnN0IHByZXYgPSBkb2MuY3JlYXRlRWxlbWVudCgnYnV0dG9uJylcbiAgcHJldi5pZCA9IGAke2JveH0tcHJldmBcbiAgcHJldi5jbGFzc05hbWUgPSBgJHtib3h9LW1vdmUtYnV0dG9uICR7Ym94fS1wcmV2LWJ1dHRvbmBcbiAgcHJldi5pbm5lckhUTUwgPSBMZWZ0SWNvblxuICBwcmV2LnR5cGUgPSAnYnV0dG9uJ1xuICByZXR1cm4gcHJldlxufVxuXG5mdW5jdGlvbiBjcmVhdGVOZXh0QnV0dG9uKGRvYykge1xuICBjb25zdCBuZXh0ID0gZG9jLmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpXG4gIG5leHQuaWQgPSBgJHtib3h9LW5leHRgXG4gIG5leHQuY2xhc3NOYW1lID0gYCR7Ym94fS1tb3ZlLWJ1dHRvbiAke2JveH0tbmV4dC1idXR0b25gXG4gIG5leHQuaW5uZXJIVE1MID0gUmlnaHRJY29uXG4gIG5leHQudHlwZSA9ICdidXR0b24nXG4gIHJldHVybiBuZXh0XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVNwaW5uZXIoZG9jKSB7XG4gIGNvbnN0IHNwaW5uZXIgPSBkb2MuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgc3Bpbm5lci5pZCA9IGAke2JveH0tc3Bpbm5lcmBcbiAgc3Bpbm5lci5jbGFzc05hbWUgPSBgJHtib3h9LXNwaW5uZXJgXG5cbiAgcmV0dXJuIHNwaW5uZXJcbn1cblxuZnVuY3Rpb24gY3JlYXRlU3Bpbm5lcldyYXBwZXIoZG9jKSB7XG4gIGNvbnN0IHdyYXBwZXIgPSBkb2MuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgd3JhcHBlci5pZCA9IGAke2JveH0tc3Bpbm5lci13cmFwcGVyYFxuICB3cmFwcGVyLmNsYXNzTmFtZSA9IGAke2JveH0tc3Bpbm5lci13cmFwcGVyYFxuXG4gIHJldHVybiB3cmFwcGVyXG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUZyYW1lKGRvYykge1xuICBjb25zdCBmcmFtZSA9IGRvYy5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICBmcmFtZS5pZCA9IGAke2JveH0tZnJhbWVgXG4gIGZyYW1lLmNsYXNzTmFtZSA9IGAke2JveH0tZnJhbWVgXG5cbiAgY29uc3QgaW1hZ2UgPSBkb2MuY3JlYXRlRWxlbWVudCgnaW1nJylcbiAgaW1hZ2Uuc3JjID0gJydcbiAgaW1hZ2UuY2xhc3NOYW1lID0gYCR7Ym94fS1mcmFtZS1pbWFnZWBcbiAgaW1hZ2UuaWQgPSBgJHtib3h9LWZyYW1lLWltYWdlYFxuXG4gIGNvbnN0IGxpbmsgPSBkb2MuY3JlYXRlRWxlbWVudCgnYScpXG4gIGxpbmsuYXBwZW5kQ2hpbGQoaW1hZ2UpXG5cbiAgYmluZChsaW5rLCAnY2xpY2snLCBlID0+IHtcbiAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgfSlcblxuICBmcmFtZS5hcHBlbmRDaGlsZChsaW5rKVxuICByZXR1cm4geyBjb250YWluZXI6IGZyYW1lLCBpbWFnZTogaW1hZ2UsIGxpbms6IGxpbmsgfVxufVxuXG5mdW5jdGlvbiBjcmVhdGVPdmVybGF5Qm94KGRvYykge1xuICBjb25zdCBvdmVybGF5ID0gZG9jLmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gIG92ZXJsYXkuY2xhc3NOYW1lID0gYCR7Ym94fS1vdmVybGF5YFxuICBvdmVybGF5LmlkID0gYCR7Ym94fS1vdmVybGF5YFxuICByZXR1cm4gb3ZlcmxheVxufVxuXG5mdW5jdGlvbiBnZXRPdmVybGF5Qm94KGRvYykge1xuICBjb25zdCBvdmVybGF5ID0gZG9jLmdldEVsZW1lbnRCeUlkKGAke2JveH0tb3ZlcmxheWApXG4gIHJldHVybiBvdmVybGF5XG59XG5cbmZ1bmN0aW9uIGhpZGUoZWwpIHtcbiAgZWwuY2xhc3NMaXN0LnJlbW92ZSgnc2hvdycpXG4gIGVsLmNsYXNzTGlzdC5hZGQoJ2hpZGUnKVxufVxuXG5mdW5jdGlvbiBzaG93KGVsKSB7XG4gIGVsLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGUnKVxuICBlbC5jbGFzc0xpc3QuYWRkKCdzaG93Jylcbn1cblxuZnVuY3Rpb24gYXBwZW5kQ2hpbGQoZG9jLCBlbCkge1xuICBkb2MuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2JvZHknKVswXS5hcHBlbmRDaGlsZChlbClcbn1cblxuZnVuY3Rpb24gc2xpZGVJbihlbCwgRElSRUNUSU9OKSB7XG4gIGVsLmNsYXNzTGlzdC5yZW1vdmUoYGhpZGUke2NhcGl0YWxpemUob3Bwb3NpdGVEaXJlY3Rpb24oRElSRUNUSU9OKSl9YClcbiAgZWwuY2xhc3NMaXN0LmFkZChgc2hvdyR7Y2FwaXRhbGl6ZShESVJFQ1RJT04pfWApXG59XG5cbmZ1bmN0aW9uIHNsaWRlT3V0KGVsLCBESVJFQ1RJT04pIHtcbiAgZWwuY2xhc3NMaXN0LnJlbW92ZShgc2hvdyR7Y2FwaXRhbGl6ZShESVJFQ1RJT04pfWApXG4gIGVsLmNsYXNzTGlzdC5hZGQoYGhpZGUke2NhcGl0YWxpemUob3Bwb3NpdGVEaXJlY3Rpb24oRElSRUNUSU9OKSl9YClcbn1cblxuZXhwb3J0IHtcbiAgY3JlYXRlUHJldmlvdXNCdXR0b24sXG4gIGNyZWF0ZU5leHRCdXR0b24sXG4gIGNyZWF0ZUZyYW1lLFxuICBjcmVhdGVPdmVybGF5Qm94LFxuICBjcmVhdGVTcGlubmVyLFxuICBjcmVhdGVTcGlubmVyV3JhcHBlcixcbiAgZ2V0T3ZlcmxheUJveCxcbiAgaGlkZSxcbiAgc2hvdyxcbiAgc2xpZGVJbixcbiAgc2xpZGVPdXQsXG4gIGFwcGVuZENoaWxkXG59XG4iLCJjb25zdCBzdmdIZWFkZXIgPSBgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiXG4gIHZpZXdCb3g9XCIwIDAgMTAwIDEyNVwiIHg9XCIwcHhcIiB5PVwiMHB4XCJgXG5cbmNvbnN0IExlZnRJY29uID0gYFxuICA8ZGl2IGNsYXNzPSdzdmdPdXRlcic+XG4gIDxzdmcgJHtzdmdIZWFkZXJ9IGNsYXNzPSdpY29uIHN2Z0lubmVyJyBwcmVzZXJ2ZUFzcGVjdFJhdGlvPVwieE1pbllNaW4gbWVldFwiPlxuICA8Zz5cbiAgICA8cGF0aCBkPVwiTTcwLjU5LDk1LjQxYTIsMiwwLDAsMCwyLjgzLTIuODNMMzAuODMsNTAsNzMuNDEsNy40MWEyLDIsMCwwLDAtMi44My0yLjgzbC00NCw0NGEyLDIsMCwwLDAsMCwyLjgzWlwiLz48L2c+XG4gIDwvc3ZnPlxuICA8L2Rpdj5cbiAgYFxuXG5jb25zdCBSaWdodEljb24gPSBgXG4gIDxkaXYgY2xhc3M9J3N2Z091dGVyJz5cbiAgICA8c3ZnICR7c3ZnSGVhZGVyfSBjbGFzcz0naWNvbiBzdmdJbm5lcic+XG4gICAgICA8Zz5cbiAgICAgICAgPHBhdGggICAgICAgICAgIGQ9XCJNMjYuNTksOTUuNDFhMiwyLDAsMCwwLDIuODMsMGw0NC00NGEyLDIsMCwwLDAsMC0yLjgzbC00NC00NGEyLDIsMCwwLDAtMi44MywyLjgzTDY5LjE3LDUwLDI2LjU5LDkyLjU5QTIsMiwwLDAsMCwyNi41OSw5NS40MVpcIi8+XG4gICAgICA8L2c+XG4gICAgPC9zdmc+XG4gIDwvZGl2PlxuICBgXG5cbmV4cG9ydCB7IExlZnRJY29uLCBSaWdodEljb24gfVxuIiwiZnVuY3Rpb24gY2FwaXRhbGl6ZShzdHJpbmcpIHtcbiAgcmV0dXJuIHN0cmluZy5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIHN0cmluZy5zdWJzdHJpbmcoMSlcbn1cblxuZXhwb3J0IGRlZmF1bHQgY2FwaXRhbGl6ZVxuIiwiaW1wb3J0IERpcmVjdGlvbiBmcm9tICcuLi9jb25zdGFudHMvRGlyZWN0aW9uJ1xuXG5mdW5jdGlvbiBvcHBvc2l0ZURpcmVjdGlvbihESVJFQ1RJT04pIHtcbiAgcmV0dXJuIERJUkVDVElPTiA9PT0gRGlyZWN0aW9uLkxFRlQgPyBEaXJlY3Rpb24uUklHSFQgOiBEaXJlY3Rpb24uTEVGVFxufVxuXG5leHBvcnQgZGVmYXVsdCBvcHBvc2l0ZURpcmVjdGlvblxuIl19
