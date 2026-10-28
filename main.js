/* TizenBrew JioTV helper: polyfills for Tizen 4.0 (Chromium 56) + on-screen diagnostics. */
(function () {
  "use strict";

  var W = window;
  var D = document;
  if (W.__TB_JIOTV__) return;
  W.__TB_JIOTV__ = "2.1.0";

  /* ---------------- diagnostics overlay ---------------- */
  var _lines = 0;

  function diag(msg) {
    try {
      var el = D.getElementById("__tb_diag");
      if (!el) {
        el = D.createElement("div");
        el.id = "__tb_diag";
        el.style.cssText =
          "position:fixed;left:0;bottom:0;max-width:100%;max-height:38%;overflow:auto;" +
          "background:rgba(8,8,10,.92);color:#ff9a9a;font:12px/1.4 monospace;" +
          "padding:8px 10px;z-index:2147483647;white-space:pre-wrap;pointer-events:none;";
        (D.body || D.documentElement).appendChild(el);
      }
      if (_lines < 12) {
        el.textContent += msg + "\n";
        _lines++;
      }
    } catch (e) {}
  }
  W.__tbDiag = diag;

  W.addEventListener("error", function (e) {
    var where = e && e.filename ? " @ " + e.filename + ":" + (e.lineno || 0) : "";
    diag("[error] " + ((e && (e.message || (e.target && e.target.src))) || "unknown") + where);
  }, true);

  W.addEventListener("unhandledrejection", function (e) {
    var r = e && e.reason;
    diag("[promise] " + ((r && r.message) || String(r)));
  });

  /* ---------------- polyfills ---------------- */
  if (typeof W.globalThis === "undefined") {
    try { Object.defineProperty(W, "globalThis", { value: W, configurable: true }); } catch (e) { W.globalThis = W; }
  }

  if (!Object.fromEntries) {
    Object.fromEntries = function (iter) {
      var out = {}, arr = Array.from ? Array.from(iter) : iter;
      for (var i = 0; i < arr.length; i++) { out[arr[i][0]] = arr[i][1]; }
      return out;
    };
  }
  if (!Object.hasOwn) {
    Object.hasOwn = function (o, k) { return Object.prototype.hasOwnProperty.call(o, k); };
  }
  if (!Object.groupBy) {
    Object.groupBy = function (list, fn) {
      var out = {};
      list.forEach(function (v, i) {
        var k = fn(v, i);
        (out[k] || (out[k] = [])).push(v);
      });
      return out;
    };
  }

  if (!Array.prototype.flat) {
    Object.defineProperty(Array.prototype, "flat", {
      writable: true, configurable: true,
      value: function (depth) {
        var d = depth === undefined ? 1 : depth;
        var out = [];
        (function walk(a, lvl) {
          for (var i = 0; i < a.length; i++) {
            if (Array.isArray(a[i]) && lvl > 0) walk(a[i], lvl - 1);
            else out.push(a[i]);
          }
        })(this, d);
        return out;
      }
    });
  }
  if (!Array.prototype.flatMap) {
    Object.defineProperty(Array.prototype, "flatMap", {
      writable: true, configurable: true,
      value: function (fn, ctx) {
        var out = [];
        for (var i = 0; i < this.length; i++) {
          var r = fn.call(ctx, this[i], i, this);
          if (Array.isArray(r)) out.push.apply(out, r); else out.push(r);
        }
        return out;
      }
    });
  }
  if (!Array.prototype.at) {
    Object.defineProperty(Array.prototype, "at", {
      writable: true, configurable: true,
      value: function (n) {
        n = Math.trunc(n) || 0;
        if (n < 0) n += this.length;
        return this[n];
      }
    });
  }
  if (!Array.prototype.findLast) {
    Object.defineProperty(Array.prototype, "findLast", {
      writable: true, configurable: true,
      value: function (fn, ctx) {
        for (var i = this.length - 1; i >= 0; i--) { if (fn.call(ctx, this[i], i, this)) return this[i]; }
        return undefined;
      }
    });
  }
  if (!Array.prototype.findLastIndex) {
    Object.defineProperty(Array.prototype, "findLastIndex", {
      writable: true, configurable: true,
      value: function (fn, ctx) {
        for (var i = this.length - 1; i >= 0; i--) { if (fn.call(ctx, this[i], i, this)) return i; }
        return -1;
      }
    });
  }
  if (!Array.prototype.toSorted) {
    Object.defineProperty(Array.prototype, "toSorted", {
      writable: true, configurable: true,
      value: function (cmp) { return this.slice().sort(cmp); }
    });
  }
  if (!Array.prototype.toReversed) {
    Object.defineProperty(Array.prototype, "toReversed", {
      writable: true, configurable: true,
      value: function () { return this.slice().reverse(); }
    });
  }

  if (!String.prototype.at) {
    Object.defineProperty(String.prototype, "at", {
      writable: true, configurable: true,
      value: function (n) {
        n = Math.trunc(n) || 0;
        if (n < 0) n += this.length;
        return this[n];
      }
    });
  }
  if (!String.prototype.replaceAll) {
    Object.defineProperty(String.prototype, "replaceAll", {
      writable: true, configurable: true,
      value: function (find, rep) {
        if (find instanceof RegExp) return this.replace(find, rep);
        return this.split(String(find)).join(rep);
      }
    });
  }
  if (!String.prototype.matchAll) {
    Object.defineProperty(String.prototype, "matchAll", {
      writable: true, configurable: true,
      value: function (re) {
        var s = String(this);
        var flags = re.flags || "";
        var r = new RegExp(re.source, flags.indexOf("g") >= 0 ? flags : flags + "g");
        var out = [], m;
        while ((m = r.exec(s))) {
          out.push(m);
          if (m[0] === "") r.lastIndex++;
        }
        return out;
      }
    });
  }
  if (!String.prototype.trimStart) {
    String.prototype.trimStart = function () { return this.replace(/^\s+/, ""); };
    String.prototype.trimEnd = function () { return this.replace(/\s+$/, ""); };
  }

  if (!Promise.allSettled) {
    Promise.allSettled = function (iter) {
      return Promise.all(Array.from(iter).map(function (p) {
        return Promise.resolve(p).then(
          function (v) { return { status: "fulfilled", value: v }; },
          function (e) { return { status: "rejected", reason: e }; }
        );
      }));
    };
  }
  if (!Promise.any) {
    Promise.any = function (iter) {
      return new Promise(function (resolve, reject) {
        var arr = Array.from(iter), n = 0;
        if (!arr.length) return reject(new Error("All promises were rejected"));
        arr.forEach(function (p) {
          Promise.resolve(p).then(resolve, function () {
            n++;
            if (n === arr.length) reject(new Error("All promises were rejected"));
          });
        });
      });
    };
  }
  if (!Promise.prototype.finally) {
    Promise.prototype.finally = function (cb) {
      var P = this.constructor;
      return this.then(
        function (v) { return P.resolve(cb()).then(function () { return v; }); },
        function (e) { return P.resolve(cb()).then(function () { throw e; }); }
      );
    };
  }
  if (!W.queueMicrotask) {
    W.queueMicrotask = function (cb) {
      Promise.resolve().then(cb).catch(function (e) { setTimeout(function () { throw e; }, 0); });
    };
  }

  if (!W.AbortController) {
    function AbortSignal() { this.aborted = false; this.onabort = null; this._l = []; }
    AbortSignal.prototype.addEventListener = function (t, f) { if (t === "abort") this._l.push(f); };
    AbortSignal.prototype.removeEventListener = function (t, f) {
      var i = this._l.indexOf(f); if (i >= 0) this._l.splice(i, 1);
    };
    function AbortController() { this.signal = new AbortSignal(); }
    AbortController.prototype.abort = function () {
      if (this.signal.aborted) return;
      this.signal.aborted = true;
      var ev = { type: "abort", target: this.signal };
      if (typeof this.signal.onabort === "function") this.signal.onabort(ev);
      for (var i = 0; i < this.signal._l.length; i++) {
        try { this.signal._l[i].call(this.signal, ev); } catch (e) {}
      }
    };
    W.AbortController = AbortController;
    W.AbortSignal = AbortSignal;
  }

  if (!W.ResizeObserver) {
    W.ResizeObserver = function (cb) {
      this._cb = cb;
      this._targets = [];
      this._timer = null;
      var self = this;
      this._tick = function () {
        for (var i = 0; i < self._targets.length; i++) {
          var t = self._targets[i];
          var r = t.getBoundingClientRect();
          var last = t.__tbRO;
          if (!last || last.w !== r.width || last.h !== r.height) {
            t.__tbRO = { w: r.width, h: r.height };
            try {
              self._cb([{
                target: t,
                contentRect: r,
                borderBoxSize: [{ inlineSize: r.width, blockSize: r.height }],
                contentBoxSize: [{ inlineSize: r.width, blockSize: r.height }]
              }], self);
            } catch (e) { diag("[ResizeObserver] " + e.message); }
          }
        }
        self._timer = setTimeout(self._tick, 250);
      };
    };
    W.ResizeObserver.prototype.observe = function (t) {
      if (this._targets.indexOf(t) < 0) { this._targets.push(t); if (!this._timer) this._tick(); }
    };
    W.ResizeObserver.prototype.unobserve = function (t) {
      var i = this._targets.indexOf(t); if (i >= 0) this._targets.splice(i, 1);
    };
    W.ResizeObserver.prototype.disconnect = function () {
      this._targets = [];
      if (this._timer) { clearTimeout(this._timer); this._timer = null; }
    };
  }

  if (!W.requestIdleCallback) {
    W.requestIdleCallback = function (cb) {
      return setTimeout(function () {
        cb({ didTimeout: false, timeRemaining: function () { return 50; } });
      }, 1);
    };
    W.cancelIdleCallback = function (id) { clearTimeout(id); };
  }
  if (!W.structuredClone) {
    W.structuredClone = function (v) { return JSON.parse(JSON.stringify(v)); };
  }
  if (W.crypto && !W.crypto.randomUUID) {
    try {
      W.crypto.randomUUID = function () {
        var b = new Uint8Array(16);
        if (W.crypto.getRandomValues) W.crypto.getRandomValues(b);
        else for (var i = 0; i < 16; i++) b[i] = (Math.random() * 256) | 0;
        b[6] = (b[6] & 15) | 64;
        b[8] = (b[8] & 63) | 128;
        var h = "";
        for (var j = 0; j < 16; j++) {
          h += (b[j] + 256).toString(16).slice(1);
          if (j === 3 || j === 5 || j === 7 || j === 9) h += "-";
        }
        return h;
      };
    } catch (e) {}
  }
  if (!W.reportError) {
    W.reportError = function (e) { setTimeout(function () { throw e; }, 0); };
  }

  if (W.Element) {
    if (!Element.prototype.replaceChildren) {
      Element.prototype.replaceChildren = function () {
        while (this.firstChild) this.removeChild(this.firstChild);
        for (var i = 0; i < arguments.length; i++) this.appendChild(arguments[i]);
      };
    }
    if (!Element.prototype.scrollTo) {
      Element.prototype.scrollTo = function (x, y) {
        if (typeof x === "object" && x !== null) { this.scrollLeft = x.left || 0; this.scrollTop = x.top || 0; }
        else { this.scrollLeft = x; this.scrollTop = y; }
      };
    }
    if (!Element.prototype.append) {
      Element.prototype.append = function () {
        for (var i = 0; i < arguments.length; i++) {
          var n = arguments[i];
          this.appendChild(typeof n === "string" ? D.createTextNode(n) : n);
        }
      };
    }
    if (!Element.prototype.prepend) {
      Element.prototype.prepend = function () {
        for (var i = arguments.length - 1; i >= 0; i--) {
          var n = arguments[i];
          this.insertBefore(typeof n === "string" ? D.createTextNode(n) : n, this.firstChild);
        }
      };
    }
  }

  if (!W.URL || !W.URL.canParse) {
    try {
      if (W.URL) {
        W.URL.canParse = function (u, base) {
          try { new W.URL(u, base); return true; } catch (e) { return false; }
        };
      }
    } catch (e) {}
  }

  /* ---------------- network diagnostics ---------------- */
  if (W.fetch) {
    var _fetch = W.fetch;
    W.fetch = function () {
      var args = arguments;
      return _fetch.apply(this, args).then(
        function (res) {
          if (!res.ok) diag("[http " + res.status + "] " + (res.url || ""));
          return res;
        },
        function (err) {
          diag("[fetch] " + ((err && err.message) || String(err)));
          throw err;
        }
      );
    };
  }

  try {
    var _open = XMLHttpRequest.prototype.open;
    var _send = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.open = function (m, u) {
      this.__tbUrl = u;
      return _open.apply(this, arguments);
    };
    XMLHttpRequest.prototype.send = function () {
      var xhr = this;
      xhr.addEventListener("load", function () {
        if (xhr.status && (xhr.status < 200 || xhr.status >= 400)) {
          diag("[xhr " + xhr.status + "] " + (xhr.__tbUrl || ""));
        }
      });
      xhr.addEventListener("error", function () {
        diag("[xhr failed] " + (xhr.__tbUrl || ""));
      });
      return _send.apply(this, arguments);
    };
  } catch (e) {}

  /* ---------------- injected marker ---------------- */
  try {
    var badge = D.createElement("div");
    badge.textContent = "TizenBrew polyfills 2.1";
    badge.style.cssText =
      "position:fixed;right:14px;top:14px;z-index:2147483647;background:rgba(20,120,60,.85);" +
      "color:#fff;font:13px/1 sans-serif;padding:6px 9px;border-radius:4px;opacity:.9;pointer-events:none;";
    (D.body || D.documentElement).appendChild(badge);
    setTimeout(function () { if (badge.parentNode) badge.parentNode.removeChild(badge); }, 5000);
  } catch (e) {}
})();
