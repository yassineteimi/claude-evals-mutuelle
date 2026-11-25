/*
 * Expand button for Mermaid diagrams in Material for MkDocs.
 *
 * Material renders each diagram as <div class="mermaid"> holding the SVG in a
 * closed shadow root, so page CSS can't reach the SVG and script can't copy it.
 * The enlarged view therefore moves the host element itself into a
 * full-viewport overlay and scales the host, which scales the SVG inside it.
 * A placeholder holds the host's place in the page until the overlay closes.
 *
 * No dependencies. Works with or without Material's instant navigation.
 */
(function () {
  "use strict";

  var HOST_SELECTOR = "div.mermaid";
  var PAD = 24; // px between the diagram and the viewport edge
  var MIN_USEFUL_SCALE = 1.5; // below this, fitting to the viewport gains too little
  var NARROW_SCALE = 3; // used instead on narrow screens; the reader pans sideways
  var MAX_SCALE = 4;

  var ICON_EXPAND =
    '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>';
  var ICON_CLOSE =
    '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>';

  var overlay = null; // built once, reused
  var state = null; // { host, opener, placeholder, width, height }

  function makeButton(className, label, icon) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = className;
    b.setAttribute("aria-label", label);
    b.title = label;
    b.innerHTML = icon;
    return b;
  }

  function enhance(host) {
    if (host.hasAttribute("data-diagram-expand")) return;
    host.setAttribute("data-diagram-expand", "");

    var wrap = document.createElement("div");
    wrap.className = "diagram-expand";
    host.parentNode.insertBefore(wrap, host);
    wrap.appendChild(host);

    var opener = makeButton("diagram-expand__open", "Expand diagram", ICON_EXPAND);
    opener.addEventListener("click", function () {
      open(host, opener);
    });
    wrap.appendChild(opener);
  }

  function scan(root) {
    var hosts = (root || document).querySelectorAll(HOST_SELECTOR);
    for (var i = 0; i < hosts.length; i++) enhance(hosts[i]);
  }

  function buildOverlay() {
    overlay = document.createElement("div");
    overlay.className = "diagram-expand-overlay";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-label", "Enlarged diagram");
    overlay.hidden = true;
    overlay.innerHTML =
      '<div class="diagram-expand-overlay__stage">' +
      '<div class="diagram-expand-overlay__sizer"></div></div>';

    var closer = makeButton("diagram-expand-overlay__close", "Close enlarged diagram", ICON_CLOSE);
    closer.addEventListener("click", close);
    overlay.appendChild(closer);

    // A click on the empty area around the diagram closes the overlay too.
    overlay.querySelector(".diagram-expand-overlay__stage").addEventListener("click", function (e) {
      if (e.target === e.currentTarget) close();
    });
    document.body.appendChild(overlay);
  }

  function layout() {
    if (!state) return;
    var sizer = overlay.querySelector(".diagram-expand-overlay__sizer");
    var availW = window.innerWidth - 2 * PAD;
    var availH = window.innerHeight - 2 * PAD;
    var fit = Math.min(availW / state.width, availH / state.height);
    var scale = fit;
    if (fit < MIN_USEFUL_SCALE) {
      // Narrow screens: a wide diagram can't grow much within the width, so
      // fit it to the height instead and let the reader scroll sideways.
      scale = Math.max(fit, Math.min(availH / state.height, NARROW_SCALE));
    }
    scale = Math.min(scale, MAX_SCALE);
    sizer.style.width = state.width * scale + "px";
    sizer.style.height = state.height * scale + "px";
    state.host.style.width = state.width + "px";
    state.host.style.transform = "scale(" + scale + ")";
  }

  function open(host, opener) {
    if (state) close();
    if (!overlay) buildOverlay();

    var rect = host.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    var placeholder = document.createElement("div");
    placeholder.className = "diagram-expand__placeholder";
    placeholder.style.height = rect.height + "px";
    host.parentNode.insertBefore(placeholder, host);

    state = { host: host, opener: opener, placeholder: placeholder, width: rect.width, height: rect.height };
    overlay.querySelector(".diagram-expand-overlay__sizer").appendChild(host);
    host.classList.add("diagram-expand__host--enlarged");

    overlay.hidden = false;
    document.documentElement.classList.add("diagram-expand--locked");
    layout();
    overlay.querySelector(".diagram-expand-overlay__stage").scrollTo(0, 0);
    overlay.querySelector(".diagram-expand-overlay__close").focus();
  }

  function close() {
    if (!state) return;
    var s = state;
    state = null;
    s.host.classList.remove("diagram-expand__host--enlarged");
    s.host.style.width = "";
    s.host.style.transform = "";
    if (!s.host.getAttribute("style")) s.host.removeAttribute("style");
    s.placeholder.parentNode.replaceChild(s.host, s.placeholder);
    overlay.hidden = true;
    document.documentElement.classList.remove("diagram-expand--locked");
    if (document.contains(s.opener)) s.opener.focus();
  }

  document.addEventListener("keydown", function (e) {
    if (!state) return;
    if (e.key === "Escape") {
      e.preventDefault();
      close();
    } else if (e.key === "Tab") {
      // The close button is the only control in the dialog: keep focus on it.
      e.preventDefault();
      overlay.querySelector(".diagram-expand-overlay__close").focus();
    }
  });

  window.addEventListener("resize", layout);

  // Material renders diagrams asynchronously, after the page is ready, so
  // watch for hosts as they appear rather than scanning once.
  function start() {
    scan(document);
    new MutationObserver(function (mutations) {
      for (var i = 0; i < mutations.length; i++) {
        var added = mutations[i].addedNodes;
        for (var j = 0; j < added.length; j++) {
          var node = added[j];
          if (node.nodeType !== 1) continue;
          if (node.matches(HOST_SELECTOR)) enhance(node);
          else if (node.querySelector) scan(node);
        }
      }
    }).observe(document.body, { childList: true, subtree: true });
  }

  if (typeof window.document$ !== "undefined" && window.document$.subscribe) {
    // Material emits on the first load and after every instant navigation.
    var started = false;
    window.document$.subscribe(function () {
      close();
      if (!started) {
        started = true;
        start();
      } else {
        scan(document);
      }
    });
  } else if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
