// ==UserScript==
// @name        ChatGPT Debug Helper 1.3.1
// @author      Dustin Miller <dustin@llmimagineers.com>
// @namespace   https://spdustin.substack.com
// @version     1.3.1
// @description Adds some helpful debugging tools to the ChatGPT UI
// @run-at      document-idle
// @match       https://chat.openai.com/*
// @grant       none
// ==/UserScript==

/* #region(collapsed)  Highlight.js */
var hljs = (function () {
  'use strict';
  function e(n) {
    return (
      n instanceof Map
        ? (n.clear =
            n.delete =
            n.set =
              () => {
                throw Error('map is read-only');
              })
        : n instanceof Set &&
          (n.add =
            n.clear =
            n.delete =
              () => {
                throw Error('set is read-only');
              }),
      Object.freeze(n),
      Object.getOwnPropertyNames(n).forEach((t) => {
        const i = n[t],
          a = typeof i;
        ('object' !== a && 'function' !== a) || Object.isFrozen(i) || e(i);
      }),
      n
    );
  }
  function n(e) {
    return e
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');
  }
  function t(e, ...n) {
    const t = Object.create(null);
    for (const n in e) t[n] = e[n];
    return (
      n.forEach((e) => {
        for (const n in e) t[n] = e[n];
      }),
      t
    );
  }
  function i(e) {
    return e ? ('string' == typeof e ? e : e.source) : null;
  }
  function a(e) {
    return o('(?=', e, ')');
  }
  function r(e) {
    return o('(?:', e, ')*');
  }
  function s(e) {
    return o('(?:', e, ')?');
  }
  function o(...e) {
    return e.map((e) => i(e)).join('');
  }
  function l(...e) {
    const n = ((e) => {
      const n = e[e.length - 1];
      return 'object' == typeof n && n.constructor === Object ? (e.splice(e.length - 1, 1), n) : {};
    })(e);
    return '(' + (n.capture ? '' : '?:') + e.map((e) => i(e)).join('|') + ')';
  }
  function c(e) {
    return RegExp(e.toString() + '|').exec('').length - 1;
  }
  function d(e, { joinWith: n }) {
    let t = 0;
    return e
      .map((e) => {
        t += 1;
        const n = t;
        let a = i(e),
          r = '';
        for (; a.length > 0; ) {
          const e = M.exec(a);
          if (!e) {
            r += a;
            break;
          }
          (r += a.substring(0, e.index)),
            (a = a.substring(e.index + e[0].length)),
            '\\' === e[0][0] && e[1]
              ? (r += '\\' + (Number(e[1]) + n))
              : ((r += e[0]), '(' === e[0] && t++);
        }
        return r;
      })
      .map((e) => `(${e})`)
      .join(n);
  }
  function g(e, n) {
    '.' === e.input[e.index - 1] && n.ignoreMatch();
  }
  function u(e, n) {
    void 0 !== e.className && ((e.scope = e.className), delete e.className);
  }
  function b(e, n) {
    n &&
      e.beginKeywords &&
      ((e.begin = '\\b(' + e.beginKeywords.split(' ').join('|') + ')(?!\\.)(?=\\b|\\s)'),
      (e.__beforeBegin = g),
      (e.keywords = e.keywords || e.beginKeywords),
      delete e.beginKeywords,
      void 0 === e.relevance && (e.relevance = 0));
  }
  function h(e, n) {
    Array.isArray(e.illegal) && (e.illegal = l(...e.illegal));
  }
  function p(e, n) {
    if (e.match) {
      if (e.begin || e.end) throw Error('begin & end are not supported with match');
      (e.begin = e.match), delete e.match;
    }
  }
  function m(e, n) {
    void 0 === e.relevance && (e.relevance = 1);
  }
  function f(e, n, t = G) {
    function i(e, t) {
      n && (t = t.map((e) => e.toLowerCase())),
        t.forEach((n) => {
          const t = n.split('|');
          a[t[0]] = [e, y(t[0], t[1])];
        });
    }
    const a = Object.create(null);
    return (
      'string' == typeof e
        ? i(t, e.split(' '))
        : Array.isArray(e)
        ? i(t, e)
        : Object.keys(e).forEach((t) => {
            Object.assign(a, f(e[t], n, t));
          }),
      a
    );
  }
  function y(e, n) {
    return n ? Number(n) : ((e) => Z.includes(e.toLowerCase()))(e) ? 0 : 1;
  }
  function E(e, n, { key: t }) {
    let i = 0;
    const a = e[t],
      r = {},
      s = {};
    for (let e = 1; e <= n.length; e++) (s[e + i] = a[e]), (r[e + i] = !0), (i += c(n[e - 1]));
    (e[t] = s), (e[t]._emit = r), (e[t]._multi = !0);
  }
  function _(e) {
    ((e) => {
      e.scope &&
        'object' == typeof e.scope &&
        null !== e.scope &&
        ((e.beginScope = e.scope), delete e.scope);
    })(e),
      'string' == typeof e.beginScope && (e.beginScope = { _wrap: e.beginScope }),
      'string' == typeof e.endScope && (e.endScope = { _wrap: e.endScope }),
      ((e) => {
        if (Array.isArray(e.begin)) {
          if (e.skip || e.excludeBegin || e.returnBegin)
            throw (W('skip, excludeBegin, returnBegin not compatible with beginScope: {}'), J);
          if ('object' != typeof e.beginScope || null === e.beginScope)
            throw (W('beginScope must be object'), J);
          E(e, e.begin, { key: 'beginScope' }), (e.begin = d(e.begin, { joinWith: '' }));
        }
      })(e),
      ((e) => {
        if (Array.isArray(e.end)) {
          if (e.skip || e.excludeEnd || e.returnEnd)
            throw (W('skip, excludeEnd, returnEnd not compatible with endScope: {}'), J);
          if ('object' != typeof e.endScope || null === e.endScope)
            throw (W('endScope must be object'), J);
          E(e, e.end, { key: 'endScope' }), (e.end = d(e.end, { joinWith: '' }));
        }
      })(e);
  }
  function v(e) {
    function n(n, t) {
      return RegExp(
        i(n),
        'm' + (e.case_insensitive ? 'i' : '') + (e.unicodeRegex ? 'u' : '') + (t ? 'g' : ''),
      );
    }
    class a {
      constructor() {
        (this.matchIndexes = {}), (this.regexes = []), (this.matchAt = 1), (this.position = 0);
      }
      addRule(e, n) {
        (n.position = this.position++),
          (this.matchIndexes[this.matchAt] = n),
          this.regexes.push([n, e]),
          (this.matchAt += c(e) + 1);
      }
      compile() {
        0 === this.regexes.length && (this.exec = () => null);
        const e = this.regexes.map((e) => e[1]);
        (this.matcherRe = n(d(e, { joinWith: '|' }), !0)), (this.lastIndex = 0);
      }
      exec(e) {
        this.matcherRe.lastIndex = this.lastIndex;
        const n = this.matcherRe.exec(e);
        if (!n) return null;
        const t = n.findIndex((e, n) => n > 0 && void 0 !== e),
          i = this.matchIndexes[t];
        return n.splice(0, t), Object.assign(n, i);
      }
    }
    class r {
      constructor() {
        (this.rules = []),
          (this.multiRegexes = []),
          (this.count = 0),
          (this.lastIndex = 0),
          (this.regexIndex = 0);
      }
      getMatcher(e) {
        if (this.multiRegexes[e]) return this.multiRegexes[e];
        const n = new a();
        return (
          this.rules.slice(e).forEach(([e, t]) => n.addRule(e, t)),
          n.compile(),
          (this.multiRegexes[e] = n),
          n
        );
      }
      resumingScanAtSamePosition() {
        return 0 !== this.regexIndex;
      }
      considerAll() {
        this.regexIndex = 0;
      }
      addRule(e, n) {
        this.rules.push([e, n]), 'begin' === n.type && this.count++;
      }
      exec(e) {
        const n = this.getMatcher(this.regexIndex);
        n.lastIndex = this.lastIndex;
        let t = n.exec(e);
        if (this.resumingScanAtSamePosition())
          if (t && t.index === this.lastIndex);
          else {
            const n = this.getMatcher(0);
            (n.lastIndex = this.lastIndex + 1), (t = n.exec(e));
          }
        return (
          t &&
            ((this.regexIndex += t.position + 1),
            this.regexIndex === this.count && this.considerAll()),
          t
        );
      }
    }
    if (
      (e.compilerExtensions || (e.compilerExtensions = []),
      e.contains && e.contains.includes('self'))
    )
      throw Error(
        'ERR: contains `self` is not supported at the top-level of a language.  See documentation.',
      );
    return (
      (e.classNameAliases = t(e.classNameAliases || {})),
      (function a(s, o) {
        const l = s;
        if (s.isCompiled) return l;
        [u, p, _, F].forEach((e) => e(s, o)),
          e.compilerExtensions.forEach((e) => e(s, o)),
          (s.__beforeBegin = null),
          [b, h, m].forEach((e) => e(s, o)),
          (s.isCompiled = !0);
        let c = null;
        return (
          'object' == typeof s.keywords &&
            s.keywords.$pattern &&
            ((s.keywords = Object.assign({}, s.keywords)),
            (c = s.keywords.$pattern),
            delete s.keywords.$pattern),
          (c = c || /\w+/),
          s.keywords && (s.keywords = f(s.keywords, e.case_insensitive)),
          (l.keywordPatternRe = n(c, !0)),
          o &&
            (s.begin || (s.begin = /\B|\b/),
            (l.beginRe = n(l.begin)),
            s.end || s.endsWithParent || (s.end = /\B|\b/),
            s.end && (l.endRe = n(l.end)),
            (l.terminatorEnd = i(l.end) || ''),
            s.endsWithParent &&
              o.terminatorEnd &&
              (l.terminatorEnd += (s.end ? '|' : '') + o.terminatorEnd)),
          s.illegal && (l.illegalRe = n(s.illegal)),
          s.contains || (s.contains = []),
          (s.contains = [].concat(
            ...s.contains.map((e) =>
              ((e) => (
                e.variants &&
                  !e.cachedVariants &&
                  (e.cachedVariants = e.variants.map((n) => t(e, { variants: null }, n))),
                e.cachedVariants
                  ? e.cachedVariants
                  : w(e)
                  ? t(e, { starts: e.starts ? t(e.starts) : null })
                  : Object.isFrozen(e)
                  ? t(e)
                  : e
              ))('self' === e ? s : e),
            ),
          )),
          s.contains.forEach((e) => {
            a(e, l);
          }),
          s.starts && a(s.starts, o),
          (l.matcher = ((e) => {
            const n = new r();
            return (
              e.contains.forEach((e) => n.addRule(e.begin, { rule: e, type: 'begin' })),
              e.terminatorEnd && n.addRule(e.terminatorEnd, { type: 'end' }),
              e.illegal && n.addRule(e.illegal, { type: 'illegal' }),
              n
            );
          })(l)),
          l
        );
      })(e)
    );
  }
  function w(e) {
    return !!e && (e.endsWithParent || w(e.starts));
  }
  class x {
    constructor(e) {
      void 0 === e.data && (e.data = {}), (this.data = e.data), (this.isMatchIgnored = !1);
    }
    ignoreMatch() {
      this.isMatchIgnored = !0;
    }
  }
  const k = (e) => !!e.scope;
  class N {
    constructor(e, n) {
      (this.buffer = ''), (this.classPrefix = n.classPrefix), e.walk(this);
    }
    addText(e) {
      this.buffer += n(e);
    }
    openNode(e) {
      if (!k(e)) return;
      const n = ((e, { prefix: n }) => {
        if (e.startsWith('language:')) return e.replace('language:', 'language-');
        if (e.includes('.')) {
          const t = e.split('.');
          return [`${n}${t.shift()}`, ...t.map((e, n) => `${e}${'_'.repeat(n + 1)}`)].join(' ');
        }
        return `${n}${e}`;
      })(e.scope, { prefix: this.classPrefix });
      this.span(n);
    }
    closeNode(e) {
      k(e) && (this.buffer += '</span>');
    }
    value() {
      return this.buffer;
    }
    span(e) {
      this.buffer += `<span class="${e}">`;
    }
  }
  const A = (e = {}) => {
    const n = { children: [] };
    return Object.assign(n, e), n;
  };
  class S {
    constructor() {
      (this.rootNode = A()), (this.stack = [this.rootNode]);
    }
    get top() {
      return this.stack[this.stack.length - 1];
    }
    get root() {
      return this.rootNode;
    }
    add(e) {
      this.top.children.push(e);
    }
    openNode(e) {
      const n = A({ scope: e });
      this.add(n), this.stack.push(n);
    }
    closeNode() {
      if (this.stack.length > 1) return this.stack.pop();
    }
    closeAllNodes() {
      for (; this.closeNode(); );
    }
    toJSON() {
      return JSON.stringify(this.rootNode, null, 4);
    }
    walk(e) {
      return this.constructor._walk(e, this.rootNode);
    }
    static _walk(e, n) {
      return (
        'string' == typeof n
          ? e.addText(n)
          : n.children &&
            (e.openNode(n), n.children.forEach((n) => this._walk(e, n)), e.closeNode(n)),
        e
      );
    }
    static _collapse(e) {
      'string' != typeof e &&
        e.children &&
        (e.children.every((e) => 'string' == typeof e)
          ? (e.children = [e.children.join('')])
          : e.children.forEach((e) => {
              S._collapse(e);
            }));
    }
  }
  class O extends S {
    constructor(e) {
      super(), (this.options = e);
    }
    addText(e) {
      '' !== e && this.add(e);
    }
    startScope(e) {
      this.openNode(e);
    }
    endScope() {
      this.closeNode();
    }
    __addSublanguage(e, n) {
      const t = e.root;
      n && (t.scope = 'language:' + n), this.add(t);
    }
    toHTML() {
      return new N(this, this.options).value();
    }
    finalize() {
      return this.closeAllNodes(), !0;
    }
  }
  const M = /\[(?:[^\\\]]|\\.)*\]|\(\??|\\([1-9][0-9]*)|\\./,
    R = '[a-zA-Z]\\w*',
    T = '[a-zA-Z_]\\w*',
    B = '\\b\\d+(\\.\\d+)?',
    C = '(-?)(\\b0[xX][a-fA-F0-9]+|(\\b\\d+(\\.\\d*)?|\\.\\d+)([eE][-+]?\\d+)?)',
    I = '\\b(0b[01]+)',
    L = { begin: '\\\\[\\s\\S]', relevance: 0 },
    j = { scope: 'string', begin: "'", end: "'", illegal: '\\n', contains: [L] },
    $ = { scope: 'string', begin: '"', end: '"', illegal: '\\n', contains: [L] },
    D = (e, n, i = {}) => {
      const a = t({ scope: 'comment', begin: e, end: n, contains: [] }, i);
      a.contains.push({
        scope: 'doctag',
        begin: '[ ]*(?=(TODO|FIXME|NOTE|BUG|OPTIMIZE|HACK|XXX):)',
        end: /(TODO|FIXME|NOTE|BUG|OPTIMIZE|HACK|XXX):/,
        excludeBegin: !0,
        relevance: 0,
      });
      const r = l(
        'I',
        'a',
        'is',
        'so',
        'us',
        'to',
        'at',
        'if',
        'in',
        'it',
        'on',
        /[A-Za-z]+['](d|ve|re|ll|t|s|n)/,
        /[A-Za-z]+[-][a-z]+/,
        /[A-Za-z][a-z]{2,}/,
      );
      return a.contains.push({ begin: o(/[ ]+/, '(', r, /[.]?[:]?([.][ ]|[ ])/, '){3}') }), a;
    },
    z = D('//', '$'),
    P = D('/\\*', '\\*/'),
    U = D('#', '$');
  var H = Object.freeze({
    __proto__: null,
    APOS_STRING_MODE: j,
    BACKSLASH_ESCAPE: L,
    BINARY_NUMBER_MODE: { scope: 'number', begin: I, relevance: 0 },
    BINARY_NUMBER_RE: I,
    COMMENT: D,
    C_BLOCK_COMMENT_MODE: P,
    C_LINE_COMMENT_MODE: z,
    C_NUMBER_MODE: { scope: 'number', begin: C, relevance: 0 },
    C_NUMBER_RE: C,
    END_SAME_AS_BEGIN: (e) =>
      Object.assign(e, {
        'on:begin': (e, n) => {
          n.data._beginMatch = e[1];
        },
        'on:end': (e, n) => {
          n.data._beginMatch !== e[1] && n.ignoreMatch();
        },
      }),
    HASH_COMMENT_MODE: U,
    IDENT_RE: R,
    MATCH_NOTHING_RE: /\b\B/,
    METHOD_GUARD: { begin: '\\.\\s*' + T, relevance: 0 },
    NUMBER_MODE: { scope: 'number', begin: B, relevance: 0 },
    NUMBER_RE: B,
    PHRASAL_WORDS_MODE: {
      begin:
        /\b(a|an|the|are|I'm|isn't|don't|doesn't|won't|but|just|should|pretty|simply|enough|gonna|going|wtf|so|such|will|you|your|they|like|more)\b/,
    },
    QUOTE_STRING_MODE: $,
    REGEXP_MODE: {
      scope: 'regexp',
      begin: /\/(?=[^/\n]*\/)/,
      end: /\/[gimuy]*/,
      contains: [L, { begin: /\[/, end: /\]/, relevance: 0, contains: [L] }],
    },
    RE_STARTERS_RE:
      '!|!=|!==|%|%=|&|&&|&=|\\*|\\*=|\\+|\\+=|,|-|-=|/=|/|:|;|<<|<<=|<=|<|===|==|=|>>>=|>>=|>=|>>>|>>|>|\\?|\\[|\\{|\\(|\\^|\\^=|\\||\\|=|\\|\\||~',
    SHEBANG: (e = {}) => {
      const n = /^#![ ]*\//;
      return (
        e.binary && (e.begin = o(n, /.*\b/, e.binary, /\b.*/)),
        t(
          {
            scope: 'meta',
            begin: n,
            end: /$/,
            relevance: 0,
            'on:begin': (e, n) => {
              0 !== e.index && n.ignoreMatch();
            },
          },
          e,
        )
      );
    },
    TITLE_MODE: { scope: 'title', begin: R, relevance: 0 },
    UNDERSCORE_IDENT_RE: T,
    UNDERSCORE_TITLE_MODE: { scope: 'title', begin: T, relevance: 0 },
  });
  const F = (e, n) => {
      if (!e.beforeMatch) return;
      if (e.starts) throw Error('beforeMatch cannot be used with starts');
      const t = Object.assign({}, e);
      Object.keys(e).forEach((n) => {
        delete e[n];
      }),
        (e.keywords = t.keywords),
        (e.begin = o(t.beforeMatch, a(t.begin))),
        (e.starts = { relevance: 0, contains: [Object.assign(t, { endsParent: !0 })] }),
        (e.relevance = 0),
        delete t.beforeMatch;
    },
    Z = ['of', 'and', 'for', 'in', 'not', 'or', 'if', 'then', 'parent', 'list', 'value'],
    G = 'keyword',
    K = {},
    W = (e) => {
      console.error(e);
    },
    X = (e, ...n) => {
      console.log('WARN: ' + e, ...n);
    },
    q = (e, n) => {
      K[`${e}/${n}`] || (console.log(`Deprecated as of ${e}. ${n}`), (K[`${e}/${n}`] = !0));
    },
    J = Error();
  class Q extends Error {
    constructor(e, n) {
      super(e), (this.name = 'HTMLInjectionError'), (this.html = n);
    }
  }
  const V = n,
    Y = t,
    ee = Symbol('nomatch'),
    ne = (n) => {
      function t(e) {
        return N.noHighlightRe.test(e);
      }
      function i(e, n, t) {
        let i = '',
          a = '';
        'object' == typeof n
          ? ((i = e), (t = n.ignoreIllegals), (a = n.language))
          : (q('10.7.0', 'highlight(lang, code, ...args) has been deprecated.'),
            q(
              '10.7.0',
              'Please use highlight(code, options) instead.\nhttps://github.com/highlightjs/highlight.js/issues/2277',
            ),
            (a = e),
            (i = n)),
          void 0 === t && (t = !0);
        const r = { code: i, language: a };
        m('before:highlight', r);
        const s = r.result ? r.result : c(r.language, r.code, t);
        return (s.code = r.code), m('after:highlight', s), s;
      }
      function c(e, n, t, i) {
        function a() {
          if (!S.keywords) return void M.addText(R);
          let e = 0;
          S.keywordPatternRe.lastIndex = 0;
          let n = S.keywordPatternRe.exec(R),
            t = '';
          for (; n; ) {
            t += R.substring(e, n.index);
            const a = E.case_insensitive ? n[0].toLowerCase() : n[0],
              r = ((i = a), S.keywords[i]);
            if (r) {
              const [e, i] = r;
              if (
                (M.addText(t),
                (t = ''),
                (m[a] = (m[a] || 0) + 1),
                m[a] <= 7 && (T += i),
                e.startsWith('_'))
              )
                t += n[0];
              else {
                const t = E.classNameAliases[e] || e;
                s(n[0], t);
              }
            } else t += n[0];
            (e = S.keywordPatternRe.lastIndex), (n = S.keywordPatternRe.exec(R));
          }
          var i;
          (t += R.substring(e)), M.addText(t);
        }
        function r() {
          null != S.subLanguage
            ? (() => {
                if ('' === R) return;
                let e = null;
                if ('string' == typeof S.subLanguage) {
                  if (!f[S.subLanguage]) return void M.addText(R);
                  (e = c(S.subLanguage, R, !0, O[S.subLanguage])), (O[S.subLanguage] = e._top);
                } else e = d(R, S.subLanguage.length ? S.subLanguage : null);
                S.relevance > 0 && (T += e.relevance), M.__addSublanguage(e._emitter, e.language);
              })()
            : a(),
            (R = '');
        }
        function s(e, n) {
          '' !== e && (M.startScope(n), M.addText(e), M.endScope());
        }
        function o(e, n) {
          let t = 1;
          const i = n.length - 1;
          for (; t <= i; ) {
            if (!e._emit[t]) {
              t++;
              continue;
            }
            const i = E.classNameAliases[e[t]] || e[t],
              r = n[t];
            i ? s(r, i) : ((R = r), a(), (R = '')), t++;
          }
        }
        function l(e, n) {
          return (
            e.scope &&
              'string' == typeof e.scope &&
              M.openNode(E.classNameAliases[e.scope] || e.scope),
            e.beginScope &&
              (e.beginScope._wrap
                ? (s(R, E.classNameAliases[e.beginScope._wrap] || e.beginScope._wrap), (R = ''))
                : e.beginScope._multi && (o(e.beginScope, n), (R = ''))),
            (S = Object.create(e, { parent: { value: S } })),
            S
          );
        }
        function g(e, n, t) {
          let i = ((e, n) => {
            const t = e && e.exec(n);
            return t && 0 === t.index;
          })(e.endRe, t);
          if (i) {
            if (e['on:end']) {
              const t = new x(e);
              e['on:end'](n, t), t.isMatchIgnored && (i = !1);
            }
            if (i) {
              for (; e.endsParent && e.parent; ) e = e.parent;
              return e;
            }
          }
          if (e.endsWithParent) return g(e.parent, n, t);
        }
        function u(e) {
          return 0 === S.matcher.regexIndex ? ((R += e[0]), 1) : ((I = !0), 0);
        }
        function h(e) {
          const t = e[0],
            i = n.substring(e.index),
            a = g(S, e, i);
          if (!a) return ee;
          const c = S;
          S.endScope && S.endScope._wrap
            ? (r(), s(t, S.endScope._wrap))
            : S.endScope && S.endScope._multi
            ? (r(), o(S.endScope, e))
            : c.skip
            ? (R += t)
            : (c.returnEnd || c.excludeEnd || (R += t), r(), c.excludeEnd && (R = t));
          do {
            S.scope && M.closeNode(), S.skip || S.subLanguage || (T += S.relevance), (S = S.parent);
          } while (S !== a.parent);
          return a.starts && l(a.starts, e), c.returnEnd ? 0 : t.length;
        }
        function p(i, a) {
          const s = a && a[0];
          if (((R += i), null == s)) return r(), 0;
          if ('begin' === y.type && 'end' === a.type && y.index === a.index && '' === s) {
            if (((R += n.slice(a.index, a.index + 1)), !_)) {
              const n = Error(`0 width match regex (${e})`);
              throw ((n.languageName = e), (n.badRule = y.rule), n);
            }
            return 1;
          }
          if (((y = a), 'begin' === a.type))
            return ((e) => {
              const n = e[0],
                t = e.rule,
                i = new x(t),
                a = [t.__beforeBegin, t['on:begin']];
              for (const t of a) if (t && (t(e, i), i.isMatchIgnored)) return u(n);
              return (
                t.skip
                  ? (R += n)
                  : (t.excludeBegin && (R += n), r(), t.returnBegin || t.excludeBegin || (R = n)),
                l(t, e),
                t.returnBegin ? 0 : n.length
              );
            })(a);
          if ('illegal' === a.type && !t) {
            const e = Error(
              'Illegal lexeme "' + s + '" for mode "' + (S.scope || '<unnamed>') + '"',
            );
            throw ((e.mode = S), e);
          }
          if ('end' === a.type) {
            const e = h(a);
            if (e !== ee) return e;
          }
          if ('illegal' === a.type && '' === s) return 1;
          if (C > 1e5 && C > 3 * a.index)
            throw Error('potential infinite loop, way more iterations than matches');
          return (R += s), s.length;
        }
        const m = Object.create(null);
        let y = {};
        const E = b(e);
        if (!E) throw (W(w.replace('{}', e)), Error('Unknown language: "' + e + '"'));
        const k = v(E);
        let A = '',
          S = i || k;
        const O = {},
          M = new N.__emitter(N);
        (() => {
          const e = [];
          for (let n = S; n !== E; n = n.parent) n.scope && e.unshift(n.scope);
          e.forEach((e) => M.openNode(e));
        })();
        let R = '',
          T = 0,
          B = 0,
          C = 0,
          I = !1;
        try {
          if (E.__emitTokens) E.__emitTokens(n, M);
          else {
            for (S.matcher.considerAll(); ; ) {
              C++, I ? (I = !1) : S.matcher.considerAll(), (S.matcher.lastIndex = B);
              const e = S.matcher.exec(n);
              if (!e) break;
              const t = p(n.substring(B, e.index), e);
              B = e.index + t;
            }
            p(n.substring(B));
          }
          return (
            M.finalize(),
            (A = M.toHTML()),
            { language: e, value: A, relevance: T, illegal: !1, _emitter: M, _top: S }
          );
        } catch (t) {
          if (t.message && t.message.includes('Illegal'))
            return {
              language: e,
              value: V(n),
              illegal: !0,
              relevance: 0,
              _illegalBy: {
                message: t.message,
                index: B,
                context: n.slice(B - 100, B + 100),
                mode: t.mode,
                resultSoFar: A,
              },
              _emitter: M,
            };
          if (_)
            return {
              language: e,
              value: V(n),
              illegal: !1,
              relevance: 0,
              errorRaised: t,
              _emitter: M,
              _top: S,
            };
          throw t;
        }
      }
      function d(e, n) {
        n = n || N.languages || Object.keys(f);
        const t = ((e) => {
            const n = {
              value: V(e),
              illegal: !1,
              relevance: 0,
              _top: k,
              _emitter: new N.__emitter(N),
            };
            return n._emitter.addText(e), n;
          })(e),
          i = n
            .filter(b)
            .filter(p)
            .map((n) => c(n, e, !1));
        i.unshift(t);
        const a = i.sort((e, n) => {
            if (e.relevance !== n.relevance) return n.relevance - e.relevance;
            if (e.language && n.language) {
              if (b(e.language).supersetOf === n.language) return 1;
              if (b(n.language).supersetOf === e.language) return -1;
            }
            return 0;
          }),
          [r, s] = a,
          o = r;
        return (o.secondBest = s), o;
      }
      function g(e) {
        let n = null;
        const a = ((e) => {
          let n = e.className + ' ';
          n += e.parentNode ? e.parentNode.className : '';
          const i = N.languageDetectRe.exec(n);
          if (i) {
            const n = b(i[1]);
            return (
              n ||
                (X(w.replace('{}', i[1])),
                X('Falling back to no-highlight mode for this block.', e)),
              n ? i[1] : 'no-highlight'
            );
          }
          return n.split(/\s+/).find((e) => t(e) || b(e));
        })(e);
        if (t(a)) return;
        if ((m('before:highlightElement', { el: e, language: a }), e.dataset.highlighted))
          return void console.log(
            'Element previously highlighted. To highlight again, first unset `dataset.highlighted`.',
            e,
          );
        if (
          e.children.length > 0 &&
          (N.ignoreUnescapedHTML ||
            (console.warn(
              'One of your code blocks includes unescaped HTML. This is a potentially serious security risk.',
            ),
            console.warn('https://github.com/highlightjs/highlight.js/wiki/security'),
            console.warn('The element with unescaped HTML:'),
            console.warn(e)),
          N.throwUnescapedHTML)
        )
          throw new Q('One of your code blocks includes unescaped HTML.', e.innerHTML);
        n = e;
        const r = n.textContent,
          s = a ? i(r, { language: a, ignoreIllegals: !0 }) : d(r);
        (e.innerHTML = s.value),
          (e.dataset.highlighted = 'yes'),
          ((e, n, t) => {
            const i = (n && y[n]) || t;
            e.classList.add('hljs'), e.classList.add('language-' + i);
          })(e, a, s.language),
          (e.result = { language: s.language, re: s.relevance, relevance: s.relevance }),
          s.secondBest &&
            (e.secondBest = { language: s.secondBest.language, relevance: s.secondBest.relevance }),
          m('after:highlightElement', { el: e, result: s, text: r });
      }
      function u() {
        'loading' !== document.readyState
          ? document.querySelectorAll(N.cssSelector).forEach(g)
          : (A = !0);
      }
      function b(e) {
        return (e = (e || '').toLowerCase()), f[e] || f[y[e]];
      }
      function h(e, { languageName: n }) {
        'string' == typeof e && (e = [e]),
          e.forEach((e) => {
            y[e.toLowerCase()] = n;
          });
      }
      function p(e) {
        const n = b(e);
        return n && !n.disableAutodetect;
      }
      function m(e, n) {
        const t = e;
        E.forEach((e) => {
          e[t] && e[t](n);
        });
      }
      const f = Object.create(null),
        y = Object.create(null),
        E = [];
      let _ = !0;
      const w =
          "Could not find the language '{}', did you forget to load/include a language module?",
        k = { disableAutodetect: !0, name: 'Plain text', contains: [] };
      let N = {
          ignoreUnescapedHTML: !1,
          throwUnescapedHTML: !1,
          noHighlightRe: /^(no-?highlight)$/i,
          languageDetectRe: /\blang(?:uage)?-([\w-]+)\b/i,
          classPrefix: 'hljs-',
          cssSelector: 'pre code',
          languages: null,
          __emitter: O,
        },
        A = !1;
      'undefined' != typeof window &&
        window.addEventListener &&
        window.addEventListener(
          'DOMContentLoaded',
          () => {
            A && u();
          },
          !1,
        ),
        Object.assign(n, {
          highlight: i,
          highlightAuto: d,
          highlightAll: u,
          highlightElement: g,
          highlightBlock: (e) => (
            q('10.7.0', 'highlightBlock will be removed entirely in v12.0'),
            q('10.7.0', 'Please use highlightElement now.'),
            g(e)
          ),
          configure: (e) => {
            N = Y(N, e);
          },
          initHighlighting: () => {
            u(), q('10.6.0', 'initHighlighting() deprecated.  Use highlightAll() now.');
          },
          initHighlightingOnLoad: () => {
            u(), q('10.6.0', 'initHighlightingOnLoad() deprecated.  Use highlightAll() now.');
          },
          registerLanguage: (e, t) => {
            let i = null;
            try {
              i = t(n);
            } catch (t) {
              if ((W("Language definition for '{}' could not be registered.".replace('{}', e)), !_))
                throw t;
              W(t), (i = k);
            }
            i.name || (i.name = e),
              (f[e] = i),
              (i.rawDefinition = t.bind(null, n)),
              i.aliases && h(i.aliases, { languageName: e });
          },
          unregisterLanguage: (e) => {
            delete f[e];
            for (const n of Object.keys(y)) y[n] === e && delete y[n];
          },
          listLanguages: () => Object.keys(f),
          getLanguage: b,
          registerAliases: h,
          autoDetection: p,
          inherit: Y,
          addPlugin: (e) => {
            ((e) => {
              e['before:highlightBlock'] &&
                !e['before:highlightElement'] &&
                (e['before:highlightElement'] = (n) => {
                  e['before:highlightBlock'](Object.assign({ block: n.el }, n));
                }),
                e['after:highlightBlock'] &&
                  !e['after:highlightElement'] &&
                  (e['after:highlightElement'] = (n) => {
                    e['after:highlightBlock'](Object.assign({ block: n.el }, n));
                  });
            })(e),
              E.push(e);
          },
          removePlugin: (e) => {
            const n = E.indexOf(e);
            -1 !== n && E.splice(n, 1);
          },
        }),
        (n.debugMode = () => {
          _ = !1;
        }),
        (n.safeMode = () => {
          _ = !0;
        }),
        (n.versionString = '11.9.0'),
        (n.regex = { concat: o, lookahead: a, either: l, optional: s, anyNumberOfTimes: r });
      for (const n in H) 'object' == typeof H[n] && e(H[n]);
      return Object.assign(n, H), n;
    },
    te = ne({});
  return (te.newInstance = () => ne({})), te;
})();
'object' == typeof exports && 'undefined' != typeof module && (module.exports = hljs),
  (() => {
    var e = (() => {
      'use strict';
      const e = '[A-Za-z$_][0-9A-Za-z$_]*',
        n = [
          'as',
          'in',
          'of',
          'if',
          'for',
          'while',
          'finally',
          'var',
          'new',
          'function',
          'do',
          'return',
          'void',
          'else',
          'break',
          'catch',
          'instanceof',
          'with',
          'throw',
          'case',
          'default',
          'try',
          'switch',
          'continue',
          'typeof',
          'delete',
          'let',
          'yield',
          'const',
          'class',
          'debugger',
          'async',
          'await',
          'static',
          'import',
          'from',
          'export',
          'extends',
        ],
        t = ['true', 'false', 'null', 'undefined', 'NaN', 'Infinity'],
        i = [
          'Object',
          'Function',
          'Boolean',
          'Symbol',
          'Math',
          'Date',
          'Number',
          'BigInt',
          'String',
          'RegExp',
          'Array',
          'Float32Array',
          'Float64Array',
          'Int8Array',
          'Uint8Array',
          'Uint8ClampedArray',
          'Int16Array',
          'Int32Array',
          'Uint16Array',
          'Uint32Array',
          'BigInt64Array',
          'BigUint64Array',
          'Set',
          'Map',
          'WeakSet',
          'WeakMap',
          'ArrayBuffer',
          'SharedArrayBuffer',
          'Atomics',
          'DataView',
          'JSON',
          'Promise',
          'Generator',
          'GeneratorFunction',
          'AsyncFunction',
          'Reflect',
          'Proxy',
          'Intl',
          'WebAssembly',
        ],
        a = [
          'Error',
          'EvalError',
          'InternalError',
          'RangeError',
          'ReferenceError',
          'SyntaxError',
          'TypeError',
          'URIError',
        ],
        r = [
          'setInterval',
          'setTimeout',
          'clearInterval',
          'clearTimeout',
          'require',
          'exports',
          'eval',
          'isFinite',
          'isNaN',
          'parseFloat',
          'parseInt',
          'decodeURI',
          'decodeURIComponent',
          'encodeURI',
          'encodeURIComponent',
          'escape',
          'unescape',
        ],
        s = [
          'arguments',
          'this',
          'super',
          'console',
          'window',
          'document',
          'localStorage',
          'sessionStorage',
          'module',
          'global',
        ],
        o = [].concat(r, i, a);
      return (l) => {
        const c = l.regex,
          d = e,
          g = {
            begin: /<[A-Za-z0-9\\._:-]+/,
            end: /\/[A-Za-z0-9\\._:-]+>|\/>/,
            isTrulyOpeningTag: (e, n) => {
              const t = e[0].length + e.index,
                i = e.input[t];
              if ('<' === i || ',' === i) return void n.ignoreMatch();
              let a;
              '>' === i &&
                (((e, { after: n }) => {
                  const t = '</' + e[0].slice(1);
                  return -1 !== e.input.indexOf(t, n);
                })(e, { after: t }) ||
                  n.ignoreMatch());
              const r = e.input.substring(t);
              ((a = r.match(/^\s*=/)) || ((a = r.match(/^\s+extends\s+/)) && 0 === a.index)) &&
                n.ignoreMatch();
            },
          },
          u = { $pattern: e, keyword: n, literal: t, built_in: o, 'variable.language': s },
          b = '[0-9](_?[0-9])*',
          h = `\\.(${b})`,
          p = '0|[1-9](_?[0-9])*|0[0-7]*[89][0-9]*',
          m = {
            className: 'number',
            variants: [
              { begin: `(\\b(${p})((${h})|\\.)?|(${h}))[eE][+-]?(${b})\\b` },
              { begin: `\\b(${p})\\b((${h})\\b|\\.)?|(${h})\\b` },
              { begin: '\\b(0|[1-9](_?[0-9])*)n\\b' },
              { begin: '\\b0[xX][0-9a-fA-F](_?[0-9a-fA-F])*n?\\b' },
              { begin: '\\b0[bB][0-1](_?[0-1])*n?\\b' },
              { begin: '\\b0[oO][0-7](_?[0-7])*n?\\b' },
              { begin: '\\b0[0-7]+n?\\b' },
            ],
            relevance: 0,
          },
          f = { className: 'subst', begin: '\\$\\{', end: '\\}', keywords: u, contains: [] },
          y = {
            begin: 'html`',
            end: '',
            starts: {
              end: '`',
              returnEnd: !1,
              contains: [l.BACKSLASH_ESCAPE, f],
              subLanguage: 'xml',
            },
          },
          E = {
            begin: 'css`',
            end: '',
            starts: {
              end: '`',
              returnEnd: !1,
              contains: [l.BACKSLASH_ESCAPE, f],
              subLanguage: 'css',
            },
          },
          _ = {
            begin: 'gql`',
            end: '',
            starts: {
              end: '`',
              returnEnd: !1,
              contains: [l.BACKSLASH_ESCAPE, f],
              subLanguage: 'graphql',
            },
          },
          v = { className: 'string', begin: '`', end: '`', contains: [l.BACKSLASH_ESCAPE, f] },
          w = {
            className: 'comment',
            variants: [
              l.COMMENT(/\/\*\*(?!\/)/, '\\*/', {
                relevance: 0,
                contains: [
                  {
                    begin: '(?=@[A-Za-z]+)',
                    relevance: 0,
                    contains: [
                      { className: 'doctag', begin: '@[A-Za-z]+' },
                      {
                        className: 'type',
                        begin: '\\{',
                        end: '\\}',
                        excludeEnd: !0,
                        excludeBegin: !0,
                        relevance: 0,
                      },
                      {
                        className: 'variable',
                        begin: d + '(?=\\s*(-)|$)',
                        endsParent: !0,
                        relevance: 0,
                      },
                      { begin: /(?=[^\n])\s/, relevance: 0 },
                    ],
                  },
                ],
              }),
              l.C_BLOCK_COMMENT_MODE,
              l.C_LINE_COMMENT_MODE,
            ],
          },
          x = [l.APOS_STRING_MODE, l.QUOTE_STRING_MODE, y, E, _, v, { match: /\$\d+/ }, m];
        f.contains = x.concat({
          begin: /\{/,
          end: /\}/,
          keywords: u,
          contains: ['self'].concat(x),
        });
        const k = [].concat(w, f.contains),
          N = k.concat([{ begin: /\(/, end: /\)/, keywords: u, contains: ['self'].concat(k) }]),
          A = {
            className: 'params',
            begin: /\(/,
            end: /\)/,
            excludeBegin: !0,
            excludeEnd: !0,
            keywords: u,
            contains: N,
          },
          S = {
            variants: [
              {
                match: [
                  /class/,
                  /\s+/,
                  d,
                  /\s+/,
                  /extends/,
                  /\s+/,
                  c.concat(d, '(', c.concat(/\./, d), ')*'),
                ],
                scope: { 1: 'keyword', 3: 'title.class', 5: 'keyword', 7: 'title.class.inherited' },
              },
              { match: [/class/, /\s+/, d], scope: { 1: 'keyword', 3: 'title.class' } },
            ],
          },
          O = {
            relevance: 0,
            match: c.either(
              /\bJSON/,
              /\b[A-Z][a-z]+([A-Z][a-z]*|\d)*/,
              /\b[A-Z]{2,}([A-Z][a-z]+|\d)+([A-Z][a-z]*)*/,
              /\b[A-Z]{2,}[a-z]+([A-Z][a-z]+|\d)*([A-Z][a-z]*)*/,
            ),
            className: 'title.class',
            keywords: { _: [...i, ...a] },
          },
          M = {
            variants: [
              { match: [/function/, /\s+/, d, /(?=\s*\()/] },
              { match: [/function/, /\s*(?=\()/] },
            ],
            className: { 1: 'keyword', 3: 'title.function' },
            label: 'func.def',
            contains: [A],
            illegal: /%/,
          },
          R = {
            match: c.concat(
              /\b/,
              ((T = [...r, 'super', 'import']), c.concat('(?!', T.join('|'), ')')),
              d,
              c.lookahead(/\(/),
            ),
            className: 'title.function',
            relevance: 0,
          };
        var T;
        const B = {
            begin: c.concat(/\./, c.lookahead(c.concat(d, /(?![0-9A-Za-z$_(])/))),
            end: d,
            excludeBegin: !0,
            keywords: 'prototype',
            className: 'property',
            relevance: 0,
          },
          C = {
            match: [/get|set/, /\s+/, d, /(?=\()/],
            className: { 1: 'keyword', 3: 'title.function' },
            contains: [{ begin: /\(\)/ }, A],
          },
          I =
            '(\\([^()]*(\\([^()]*(\\([^()]*\\)[^()]*)*\\)[^()]*)*\\)|' +
            l.UNDERSCORE_IDENT_RE +
            ')\\s*=>',
          L = {
            match: [/const|var|let/, /\s+/, d, /\s*/, /=\s*/, /(async\s*)?/, c.lookahead(I)],
            keywords: 'async',
            className: { 1: 'keyword', 3: 'title.function' },
            contains: [A],
          };
        return {
          name: 'JavaScript',
          aliases: ['js', 'jsx', 'mjs', 'cjs'],
          keywords: u,
          exports: { PARAMS_CONTAINS: N, CLASS_REFERENCE: O },
          illegal: /#(?![$_A-z])/,
          contains: [
            l.SHEBANG({ label: 'shebang', binary: 'node', relevance: 5 }),
            {
              label: 'use_strict',
              className: 'meta',
              relevance: 10,
              begin: /^\s*['"]use (strict|asm)['"]/,
            },
            l.APOS_STRING_MODE,
            l.QUOTE_STRING_MODE,
            y,
            E,
            _,
            v,
            w,
            { match: /\$\d+/ },
            m,
            O,
            { className: 'attr', begin: d + c.lookahead(':'), relevance: 0 },
            L,
            {
              begin: '(' + l.RE_STARTERS_RE + '|\\b(case|return|throw)\\b)\\s*',
              keywords: 'return throw case',
              relevance: 0,
              contains: [
                w,
                l.REGEXP_MODE,
                {
                  className: 'function',
                  begin: I,
                  returnBegin: !0,
                  end: '\\s*=>',
                  contains: [
                    {
                      className: 'params',
                      variants: [
                        { begin: l.UNDERSCORE_IDENT_RE, relevance: 0 },
                        { className: null, begin: /\(\s*\)/, skip: !0 },
                        {
                          begin: /\(/,
                          end: /\)/,
                          excludeBegin: !0,
                          excludeEnd: !0,
                          keywords: u,
                          contains: N,
                        },
                      ],
                    },
                  ],
                },
                { begin: /,/, relevance: 0 },
                { match: /\s+/, relevance: 0 },
                {
                  variants: [
                    { begin: '<>', end: '</>' },
                    { match: /<[A-Za-z0-9\\._:-]+\s*\/>/ },
                    { begin: g.begin, 'on:begin': g.isTrulyOpeningTag, end: g.end },
                  ],
                  subLanguage: 'xml',
                  contains: [{ begin: g.begin, end: g.end, skip: !0, contains: ['self'] }],
                },
              ],
            },
            M,
            { beginKeywords: 'while if switch catch for' },
            {
              begin:
                '\\b(?!function)' +
                l.UNDERSCORE_IDENT_RE +
                '\\([^()]*(\\([^()]*(\\([^()]*\\)[^()]*)*\\)[^()]*)*\\)\\s*\\{',
              returnBegin: !0,
              label: 'func.def',
              contains: [A, l.inherit(l.TITLE_MODE, { begin: d, className: 'title.function' })],
            },
            { match: /\.\.\./, relevance: 0 },
            B,
            { match: '\\$' + d, relevance: 0 },
            {
              match: [/\bconstructor(?=\s*\()/],
              className: { 1: 'title.function' },
              contains: [A],
            },
            R,
            { relevance: 0, match: /\b[A-Z][A-Z_0-9]+\b/, className: 'variable.constant' },
            S,
            C,
            { match: /\$[(.]/ },
          ],
        };
      };
    })();
    hljs.registerLanguage('javascript', e);
  })(),
  (() => {
    var e = (() => {
      'use strict';
      return (e) => {
        const n = ['true', 'false', 'null'],
          t = { scope: 'literal', beginKeywords: n.join(' ') };
        return {
          name: 'JSON',
          keywords: { literal: n },
          contains: [
            { className: 'attr', begin: /"(\\.|[^\\"\r\n])*"(?=\s*:)/, relevance: 1.01 },
            { match: /[{}[\],:]/, className: 'punctuation', relevance: 0 },
            e.QUOTE_STRING_MODE,
            t,
            e.C_NUMBER_MODE,
            e.C_LINE_COMMENT_MODE,
            e.C_BLOCK_COMMENT_MODE,
          ],
          illegal: '\\S',
        };
      };
    })();
    hljs.registerLanguage('json', e);
  })(),
  (() => {
    var e = (() => {
      'use strict';
      return (e) => {
        const n = { begin: /<\/?[A-Za-z_]/, end: '>', subLanguage: 'xml', relevance: 0 },
          t = {
            variants: [
              { begin: /\[.+?\]\[.*?\]/, relevance: 0 },
              {
                begin: /\[.+?\]\(((data|javascript|mailto):|(?:http|ftp)s?:\/\/).*?\)/,
                relevance: 2,
              },
              {
                begin: e.regex.concat(/\[.+?\]\(/, /[A-Za-z][A-Za-z0-9+.-]*/, /:\/\/.*?\)/),
                relevance: 2,
              },
              { begin: /\[.+?\]\([./?&#].*?\)/, relevance: 1 },
              { begin: /\[.*?\]\(.*?\)/, relevance: 0 },
            ],
            returnBegin: !0,
            contains: [
              { match: /\[(?=\])/ },
              {
                className: 'string',
                relevance: 0,
                begin: '\\[',
                end: '\\]',
                excludeBegin: !0,
                returnEnd: !0,
              },
              {
                className: 'link',
                relevance: 0,
                begin: '\\]\\(',
                end: '\\)',
                excludeBegin: !0,
                excludeEnd: !0,
              },
              {
                className: 'symbol',
                relevance: 0,
                begin: '\\]\\[',
                end: '\\]',
                excludeBegin: !0,
                excludeEnd: !0,
              },
            ],
          },
          i = {
            className: 'strong',
            contains: [],
            variants: [
              { begin: /_{2}(?!\s)/, end: /_{2}/ },
              { begin: /\*{2}(?!\s)/, end: /\*{2}/ },
            ],
          },
          a = {
            className: 'emphasis',
            contains: [],
            variants: [
              { begin: /\*(?![*\s])/, end: /\*/ },
              { begin: /_(?![_\s])/, end: /_/, relevance: 0 },
            ],
          },
          r = e.inherit(i, { contains: [] }),
          s = e.inherit(a, { contains: [] });
        i.contains.push(s), a.contains.push(r);
        let o = [n, t];
        return (
          [i, a, r, s].forEach((e) => {
            e.contains = e.contains.concat(o);
          }),
          (o = o.concat(i, a)),
          {
            name: 'Markdown',
            aliases: ['md', 'mkdown', 'mkd'],
            contains: [
              {
                className: 'section',
                variants: [
                  { begin: '^#{1,6}', end: '$', contains: o },
                  {
                    begin: '(?=^.+?\\n[=-]{2,}$)',
                    contains: [{ begin: '^[=-]*$' }, { begin: '^', end: '\\n', contains: o }],
                  },
                ],
              },
              n,
              {
                className: 'bullet',
                begin: '^[ \t]*([*+-]|(\\d+\\.))(?=\\s+)',
                end: '\\s+',
                excludeEnd: !0,
              },
              i,
              a,
              { className: 'quote', begin: '^>\\s+', contains: o, end: '$' },
              {
                className: 'code',
                variants: [
                  { begin: '(`{3,})[^`](.|\\n)*?\\1`*[ ]*' },
                  { begin: '(~{3,})[^~](.|\\n)*?\\1~*[ ]*' },
                  { begin: '```', end: '```+[ ]*$' },
                  { begin: '~~~', end: '~~~+[ ]*$' },
                  { begin: '`.+?`' },
                  {
                    begin: '(?=^( {4}|\\t))',
                    contains: [{ begin: '^( {4}|\\t)', end: '(\\n)$' }],
                    relevance: 0,
                  },
                ],
              },
              { begin: '^[-\\*]{3,}', end: '$' },
              t,
              {
                begin: /^\[[^\n]+\]:/,
                returnBegin: !0,
                contains: [
                  { className: 'symbol', begin: /\[/, end: /\]/, excludeBegin: !0, excludeEnd: !0 },
                  { className: 'link', begin: /:\s*/, end: /$/, excludeBegin: !0 },
                ],
              },
            ],
          }
        );
      };
    })();
    hljs.registerLanguage('markdown', e);
  })(),
  (() => {
    var e = (() => {
      'use strict';
      return (e) => {
        const n = e.regex,
          t = /[\p{XID_Start}_]\p{XID_Continue}*/u,
          i = [
            'and',
            'as',
            'assert',
            'async',
            'await',
            'break',
            'case',
            'class',
            'continue',
            'def',
            'del',
            'elif',
            'else',
            'except',
            'finally',
            'for',
            'from',
            'global',
            'if',
            'import',
            'in',
            'is',
            'lambda',
            'match',
            'nonlocal|10',
            'not',
            'or',
            'pass',
            'raise',
            'return',
            'try',
            'while',
            'with',
            'yield',
          ],
          a = {
            $pattern: /[A-Za-z]\w+|__\w+__/,
            keyword: i,
            built_in: [
              '__import__',
              'abs',
              'all',
              'any',
              'ascii',
              'bin',
              'bool',
              'breakpoint',
              'bytearray',
              'bytes',
              'callable',
              'chr',
              'classmethod',
              'compile',
              'complex',
              'delattr',
              'dict',
              'dir',
              'divmod',
              'enumerate',
              'eval',
              'exec',
              'filter',
              'float',
              'format',
              'frozenset',
              'getattr',
              'globals',
              'hasattr',
              'hash',
              'help',
              'hex',
              'id',
              'input',
              'int',
              'isinstance',
              'issubclass',
              'iter',
              'len',
              'list',
              'locals',
              'map',
              'max',
              'memoryview',
              'min',
              'next',
              'object',
              'oct',
              'open',
              'ord',
              'pow',
              'print',
              'property',
              'range',
              'repr',
              'reversed',
              'round',
              'set',
              'setattr',
              'slice',
              'sorted',
              'staticmethod',
              'str',
              'sum',
              'super',
              'tuple',
              'type',
              'vars',
              'zip',
            ],
            literal: ['__debug__', 'Ellipsis', 'False', 'None', 'NotImplemented', 'True'],
            type: [
              'Any',
              'Callable',
              'Coroutine',
              'Dict',
              'List',
              'Literal',
              'Generic',
              'Optional',
              'Sequence',
              'Set',
              'Tuple',
              'Type',
              'Union',
            ],
          },
          r = { className: 'meta', begin: /^(>>>|\.\.\.) / },
          s = { className: 'subst', begin: /\{/, end: /\}/, keywords: a, illegal: /#/ },
          o = { begin: /\{\{/, relevance: 0 },
          l = {
            className: 'string',
            contains: [e.BACKSLASH_ESCAPE],
            variants: [
              {
                begin: /([uU]|[bB]|[rR]|[bB][rR]|[rR][bB])?'''/,
                end: /'''/,
                contains: [e.BACKSLASH_ESCAPE, r],
                relevance: 10,
              },
              {
                begin: /([uU]|[bB]|[rR]|[bB][rR]|[rR][bB])?"""/,
                end: /"""/,
                contains: [e.BACKSLASH_ESCAPE, r],
                relevance: 10,
              },
              {
                begin: /([fF][rR]|[rR][fF]|[fF])'''/,
                end: /'''/,
                contains: [e.BACKSLASH_ESCAPE, r, o, s],
              },
              {
                begin: /([fF][rR]|[rR][fF]|[fF])"""/,
                end: /"""/,
                contains: [e.BACKSLASH_ESCAPE, r, o, s],
              },
              { begin: /([uU]|[rR])'/, end: /'/, relevance: 10 },
              { begin: /([uU]|[rR])"/, end: /"/, relevance: 10 },
              { begin: /([bB]|[bB][rR]|[rR][bB])'/, end: /'/ },
              { begin: /([bB]|[bB][rR]|[rR][bB])"/, end: /"/ },
              {
                begin: /([fF][rR]|[rR][fF]|[fF])'/,
                end: /'/,
                contains: [e.BACKSLASH_ESCAPE, o, s],
              },
              {
                begin: /([fF][rR]|[rR][fF]|[fF])"/,
                end: /"/,
                contains: [e.BACKSLASH_ESCAPE, o, s],
              },
              e.APOS_STRING_MODE,
              e.QUOTE_STRING_MODE,
            ],
          },
          c = '[0-9](_?[0-9])*',
          d = `(\\b(${c}))?\\.(${c})|\\b(${c})\\.`,
          g = '\\b|' + i.join('|'),
          u = {
            className: 'number',
            relevance: 0,
            variants: [
              { begin: `(\\b(${c})|(${d}))[eE][+-]?(${c})[jJ]?(?=${g})` },
              { begin: `(${d})[jJ]?` },
              { begin: `\\b([1-9](_?[0-9])*|0+(_?0)*)[lLjJ]?(?=${g})` },
              { begin: `\\b0[bB](_?[01])+[lL]?(?=${g})` },
              { begin: `\\b0[oO](_?[0-7])+[lL]?(?=${g})` },
              { begin: `\\b0[xX](_?[0-9a-fA-F])+[lL]?(?=${g})` },
              { begin: `\\b(${c})[jJ](?=${g})` },
            ],
          },
          b = {
            className: 'comment',
            begin: n.lookahead(/# type:/),
            end: /$/,
            keywords: a,
            contains: [{ begin: /# type:/ }, { begin: /#/, end: /\b\B/, endsWithParent: !0 }],
          },
          h = {
            className: 'params',
            variants: [
              { className: '', begin: /\(\s*\)/, skip: !0 },
              {
                begin: /\(/,
                end: /\)/,
                excludeBegin: !0,
                excludeEnd: !0,
                keywords: a,
                contains: ['self', r, u, l, e.HASH_COMMENT_MODE],
              },
            ],
          };
        return (
          (s.contains = [l, u, r]),
          {
            name: 'Python',
            aliases: ['py', 'gyp', 'ipython'],
            unicodeRegex: !0,
            keywords: a,
            illegal: /(<\/|\?)|=>/,
            contains: [
              r,
              u,
              { begin: /\bself\b/ },
              { beginKeywords: 'if', relevance: 0 },
              { match: /\bor\b/, scope: 'keyword' },
              l,
              b,
              e.HASH_COMMENT_MODE,
              {
                match: [/\bdef/, /\s+/, t],
                scope: { 1: 'keyword', 3: 'title.function' },
                contains: [h],
              },
              {
                variants: [
                  { match: [/\bclass/, /\s+/, t, /\s*/, /\(\s*/, t, /\s*\)/] },
                  { match: [/\bclass/, /\s+/, t] },
                ],
                scope: { 1: 'keyword', 3: 'title.class', 6: 'title.class.inherited' },
              },
              { className: 'meta', begin: /^[\t ]*@/, end: /(?=#)|$/, contains: [u, h, l] },
            ],
          }
        );
      };
    })();
    hljs.registerLanguage('python', e);
  })(),
  (() => {
    var t = (() => {
      'use strict';
      return (t) => ({ name: 'Plain text', aliases: ['text', 'txt'], disableAutodetect: !0 });
    })();
    hljs.registerLanguage('plaintext', t);
  })();
hljs.registerLanguage('chatgpt_tools', function (hljs) {
  const FUNCTION_NAMES = 'search back scroll quote_lines open_url click text2im'; // Add more function names as needed

  return {
    contains: [
      {
        className: 'function',
        begin: '\\b(' + FUNCTION_NAMES.replace(/ /g, '|') + ')\\b\\(',
        end: '\\)',
        keywords: FUNCTION_NAMES,
        contains: [
          {
            className: 'params',
            begin: '\\(',
            end: '\\)',
            contains: [hljs.NUMBER_MODE, hljs.APOS_STRING_MODE, hljs.QUOTE_STRING_MODE],
          },
        ],
      },
    ],
  };
});

/* #endregion */

/* eslint-disable no-nested-ternary */
const DEBUG_TRANSCRIPT_FILENAME = 'autoexpert_debugger_transcript.json';
const DEBUG_STATUS_LABEL_COLORS = {
  in_progress: 'p-1 bg-yellow-100 text-yellow-700',
  finished_successfully: 'p-1 bg-green-100 text-green-700',
};
const escapeHtml = (html) => {
  const escapeMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  return html.replace(/[&<>"']/g, (match) => escapeMap[match]);
};
const collapsingFormatter = (text, highlight = true) => {
  const content = highlight ? hljs.highlightAuto(text) : { value: text, language: 'contents' };
  const panelHtml = `<details open><summary>Toggle ${
    typeof content.language === 'undefined' ? 'contents' : content.language
  }</summary><div class="hljs whitespace-pre-wrap">${content.value}</div></details>`;
  return panelHtml;
};
const debugFormatter = (parts) => {
  const formattedParts = parts.map((part) => {
    if (typeof part !== 'string') {
      return hljs.highlightAuto(JSON.stringify(part, null, 2), {
        language: 'json',
        ignoreIllegals: true,
      }).value;
    }
    return collapsingFormatter(part);
  });
  const panelHtml = formattedParts.join('<br><br>');
  return panelHtml;
};

const DEBUG_PATHS = [
  {
    label: 'From',
    paths: [
      ['author', 'role'],
      ['author', 'name'],
    ],
    formatter: (role, name) =>
      `${role} ${
        !name
          ? ''
          : `<br/> (${
              name.includes('__') ? `${name.split('__')[0]}.${name.split('.')[1]}()` : name
            })`
      }`,
    textClasses: ['text-green-700', 'font-bold'],
  },
  {
    label: 'To',
    paths: [['recipient']],
    formatter: (name) => {
      if (name.includes('__')) {
        return `${name.split('__')[0]}.${name.split('.')[1]}()`;
      }
      return name;
    },
    textClasses: ['text-red-700', 'font-bold'],
  },
  {
    label: 'Created',
    paths: [['create_time']],
    formatter: (timestamp) => {
      const date = new Date(Math.round(timestamp * 1000));
      return date.toLocaleString();
    },
  },
  {
    label: 'Status',
    paths: [['status']],
    textClass: (status) => DEBUG_STATUS_LABEL_COLORS[status],
  },
  {
    label: 'Msg Type',
    paths: [['metadata', 'message_type']],
  },
  {
    label: 'Model',
    paths: [['metadata', 'model_slug']],
  },
  {
    label: 'Cont. Type',
    paths: [
      ['content', 'content_type'],
      ['content', 'language'],
    ],
    formatter: (type, language) => `${type} ${!language ? '' : `(${language})`}`,
  },
  {
    label: '——Domain',
    paths: [['content', 'domain']],
  },
  {
    label: '——URL',
    paths: [['content', 'url']],
  },
  {
    label: '——Title',
    paths: [['content', 'title']],
  },
  {
    label: '——Text',
    paths: [['content', 'text']],
    formatter: collapsingFormatter,
    textClasses: ['break-all'],
  },
  {
    label: '——Summary',
    paths: [['content', 'summary']],
  },
  {
    label: '——Results',
    paths: [['content', 'result']],
    formatter: collapsingFormatter,
    textClasses: ['break-all'],
  },
  {
    label: '——Assets',
    paths: [['content', 'assets']],
    formatter: debugFormatter,
  },
  {
    label: 'Command',
    paths: [
      ['metadata', 'command'],
      ['metadata', 'args'],
    ],
    formatter: (command, args) => `${command}(${args.join(',')})`,
    textClasses: ['text-green-700'],
  },
  {
    label: '——Status',
    paths: [['metadata', 'status']],
  },
  {
    label: 'Plugin',
    paths: [['metadata', 'jit_plugin_data', 'from_server', 'type']],
  },
  {
    label: '——Display',
    paths: [['metadata', 'jit_plugin_data', 'from_server', 'body', 'display_message']],
  },
  {
    label: '——Data',
    paths: [['metadata', 'jit_plugin_data', 'from_server', 'body', 'data']],
    formatter: debugFormatter,
  },
  {
    label: '——Domain',
    paths: [['metadata', 'jit_plugin_data', 'from_server', 'body', 'domain']],
  },
  {
    label: '——Conseq.',
    paths: [['metadata', 'jit_plugin_data', 'from_server', 'body', 'is_consequential']],
  },
  {
    label: '——Privacy',
    paths: [['metadata', 'jit_plugin_data', 'from_server', 'body', 'privacy_policy']],
  },
  {
    label: '——Method',
    paths: [['metadata', 'jit_plugin_data', 'from_server', 'body', 'method']],
  },
  {
    label: '——Path',
    paths: [['metadata', 'jit_plugin_data', 'from_server', 'body', 'path']],
  },
  {
    label: '——Operation',
    paths: [['metadata', 'jit_plugin_data', 'from_server', 'body', 'operation']],
  },
  {
    label: '——Params',
    paths: [['metadata', 'jit_plugin_data', 'from_server', 'body', 'params']],
    formatter: debugFormatter,
  },
  {
    label: '——Actions',
    paths: [['metadata', 'jit_plugin_data', 'from_server', 'body', 'actions']],
    formatter: debugFormatter,
  },
  {
    label: 'Response',
    paths: [['content', 'parts']],
    formatter: debugFormatter,
    textClasses: ['break-all', 'whitespace-pre-wrap'],
  },
  {
    label: 'Citations',
    paths: [['metadata', 'citations']],
    formatter: debugFormatter,
    textClasses: ['break-all', 'whitespace-pre-wrap'],
  },
];

const createDomElementFromHTML = (htmlString) => {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = htmlString;
  return tempDiv.firstElementChild;
};

const debugPanel = createDomElementFromHTML(
  '<div id="ae_debug_panel" style="width: 33vw; opacity:0.95; margin:0; resize: horizontal;" class="fixed top-0 left-0 bottom-0 z-40 h-screen p-4 overflow-y-auto transition-transform -translate-x-full bg-gray-50 dark:bg-gray-950 text-xs font-mono" tabindex="-1"> </div>',
);

function downloadJson(variable, filename) {
  const jsonString = JSON.stringify(variable, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function createDebugButton(buttonData) {
  const buttonHtml = `
  <button
    title="${buttonData.title}"
    id="${buttonData.id}"
    class="btn relative btn-neutral btn-small flex h-9 w-9 items-center justify-center whitespace-nowrap rounded-lg border border-token-border-medium focus:ring-0 ${
      buttonData.hideForGPTs ? ' hideForGPTs' : ''
    }" >
    ${buttonData.emoji}
  </button>
  `;

  const button = createDomElementFromHTML(buttonHtml);
  button.addEventListener('click', buttonData.handler, true);
  return button;
}

function renderHtmlFromJson(jsonData, options) {
  function getNestedProperties(obj, paths) {
    return paths.map((path) => path.reduce((acc, part) => acc && acc[part], obj));
  }

  let html = '<dl class="debug_dl">';

  options.forEach((option) => {
    const { paths, formatter, textClass, textClasses } = option;
    const values = getNestedProperties(jsonData, paths);

    if (values.some((value) => value === undefined)) {
      return;
    }

    const formattedValue = formatter ? formatter(...values) : values.join(' ');
    const formattedValueWithClass = textClasses
      ? `<span class="${textClasses.join(' ')}">${formattedValue}</span>`
      : textClass
      ? `<span class="${textClass(formattedValue)}">${formattedValue}</span>`
      : `${formattedValue}`;

    html += `<dt class="col-span-1">${option.label}:</dt>`;
    html += `<dd class="col-span-4">${formattedValueWithClass}</dd>`;
  });

  html += '</dl>';
  return html;
}

function render(key, value) {
  let entry = document.getElementById(`debug-${key}`);
  const newHTML = renderHtmlFromJson(value, DEBUG_PATHS);
  if (!entry) {
    newEl = true;
    entry = document.createElement('div');
    entry.id = `debug-${key}`;
    entry.classList = 'debug_entry';
    debugPanel.appendChild(entry);
  }
  entry.innerHTML = newHTML;
}

class AEDebugLog extends Map {
  set(key, value) {
    render(key, value);
    return super.set(key, value);
  }
}
let messages = new AEDebugLog();

function decodeEventStream(event) {
  const decodedEvents = new TextDecoder().decode(event);
  const parsedEvents = decodedEvents
    .replace(/^data: /, '')
    .split('\n')
    .filter(Boolean)
    .map((eventData) => {
      try {
        const parsedEvent = JSON.parse(eventData);
        messages.set(parsedEvent.message.id, parsedEvent.message);
        return parsedEvent;
      } catch (error) {
        return null;
      }
    })
    .filter(Boolean);
  return parsedEvents;
}

async function logEventStream(response) {
  const reader = response.body.getReader();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        while (true) {
          const { done, value } = await reader.read();
          decodeEventStream(value);
          controller.enqueue(value);
          if (done) {
            break;
          }
        }
      } finally {
        controller.close();
        reader.releaseLock();
      }
    },
  });

  return new Response(stream, {
    headers: response.headers,
  });
}

const originalFetch = window.fetch;
window.fetch = async (...args) => {
  const response = await originalFetch(...args);
  if (response.headers.get('content-type') === 'text/event-stream; charset=utf-8') {
    logEventStream(response.clone());
  }
  return response;
};

const debugToolbarButtons = [
  {
    title: 'Clear debug message log',
    id: 'ae_clearMessages',
    emoji:
      '<svg width="18" height="18" viewBox="0 0 448 512" fill="none"><path fill="currentColor" d="M135.2 17.7C140.6 6.8 151.7 0 163.8 0h120.4c12.1 0 23.2 6.8 28.6 17.7L320 32h96c17.7 0 32 14.3 32 32s-14.3 32-32 32H32C14.3 96 0 81.7 0 64s14.3-32 32-32h96l7.2-14.3zM32 128h384v320c0 35.3-28.7 64-64 64H96c-35.3 0-64-28.7-64-64V128zm96 64c-8.8 0-16 7.2-16 16v224c0 8.8 7.2 16 16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16zm96 0c-8.8 0-16 7.2-16 16v224c0 8.8 7.2 16 16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16zm96 0c-8.8 0-16 7.2-16 16v224c0 8.8 7.2 16 16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16z"/></svg>',
    hideForGPTs: false,
    handler: () => {
      debugPanel.innerHTML = '';
      messages = new AEDebugLog();
    },
  },
  {
    title: 'Download debug message log',
    id: 'ae_DownloadLog',
    emoji:
      '<svg width="18" height="18" viewBox="0 0 576 512" fill="none"><path fill="currentColor" d="M0 64C0 28.7 28.7 0 64 0h160v128c0 17.7 14.3 32 32 32h128v128H216c-13.3 0-24 10.7-24 24s10.7 24 24 24h168v112c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V64zm384 272v-48h110.1l-39-39c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l80 80c9.4 9.4 9.4 24.6 0 33.9l-80 80c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l39-39H384zm0-208H256V0l128 128z"/></svg>',
    hideForGPTs: false,
    handler: () => {
      const messageLog = Object.fromEntries(messages);
      downloadJson(messageLog, DEBUG_TRANSCRIPT_FILENAME);
    },
  },
  {
    title: 'Show debug message log',
    id: 'ae_debug',
    emoji:
      '<svg width="18" height="18" viewBox="0 0 512 512" fill="none"><path fill="currentColor" d="M256 0c53 0 96 43 96 96v3.6c0 15.7-12.7 28.4-28.4 28.4H188.4c-15.7 0-28.4-12.7-28.4-28.4V96c0-53 43-96 96-96zM41.4 105.4c12.5-12.5 32.8-12.5 45.3 0l64 64c.7.7 1.3 1.4 1.9 2.1 14.2-7.3 30.4-11.4 47.5-11.4H312c17.1 0 33.2 4.1 47.5 11.4.6-.7 1.2-1.4 1.9-2.1l64-64c12.5-12.5 32.8-12.5 45.3 0s12.5 32.8 0 45.3l-64 64c-.7.7-1.4 1.3-2.1 1.9 6.2 12 10.1 25.3 11.1 39.5H480c17.7 0 32 14.3 32 32s-14.3 32-32 32h-64c0 24.6-5.5 47.8-15.4 68.6 2.2 1.3 4.2 2.9 6 4.8l64 64c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0l-63.1-63.1c-24.5 21.8-55.8 36.2-90.3 39.6V240c0-8.8-7.2-16-16-16s-16 7.2-16 16v239.2c-34.5-3.4-65.8-17.8-90.3-39.6l-63 63c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3l64-64c1.9-1.9 3.9-3.4 6-4.8C101.5 367.8 96 344.6 96 320H32c-17.7 0-32-14.3-32-32s14.3-32 32-32h64.3c1.1-14.1 5-27.5 11.1-39.5-.7-.6-1.4-1.2-2.1-1.9l-64-64c-12.5-12.5-12.5-32.8 0-45.3z"/></svg>',
    hideForGPTs: false,
    handler: () => debugPanel.classList.toggle('-translate-x-full'),
  },
];
const debugToolbar = createDomElementFromHTML(
  '<div id="ae_floatingButtons" class="absolute p-2 top-8 mt-3 right-3 bg-transparent flex flex-col space-y-2"> <!--Debug toolbar icons via Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2023 Fonticons, Inc.--> </div>',
);

Object.keys(debugToolbarButtons).forEach((key) => {
  const buttonToAdd = createDebugButton(debugToolbarButtons[key]);
  debugToolbar.appendChild(buttonToAdd);
});
document.body.appendChild(debugPanel);
document.body.appendChild(debugToolbar);

const style = document.createElement('style');
style.innerHTML =
  '.prose.dark a { color: #AACCFF !important; text-decoration: underline !important; text-underline-offset: 2px !important; } .debug_entry { --tw-bg-opacity: 1; background-color: rgba(255,255,255,0.1); border-width: 1px; font-family: ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono","Courier New",monospace; margin-bottom: 2.5rem; --tw-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),0 4px 6px -2px rgba(0, 0, 0, 0.05); -webkit-box-shadow: var(--tw-ring-offset-shadow,0 0 #0000),var(--tw-ring-shadow,0 0 #0000),var(--tw-shadow); box-shadow: var(--tw-ring-offset-shadow,0 0 #0000),var(--tw-ring-shadow,0 0 #0000),var(--tw-shadow); --tw-text-opacity: 1; } .debug_dl { --tw-bg-opacity: 1; background-color: rgba(255,255,255,0.1); display: grid; padding: .5rem; gap: .5rem; grid-template-columns: repeat(5,minmax(0,1fr)) } .debug_dl dt { grid-column: span 1/span 1 } .debug_dl dd { grid-column: span 4/span 4 }';
document.head.appendChild(style);
