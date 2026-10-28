/* JioTV TizenBrew launcher. ES5-compatible for the Tizen 4 browser engine. */
(function () {
  "use strict";

  var target = "https://jiotv.com/";
  var launch = document.getElementById("launch");
  var status = document.getElementById("status");
  var timer = null;
  var started = false;

  function openJioTV() {
    if (started) return;
    started = true;
    if (timer !== null) {
      window.clearTimeout(timer);
      timer = null;
    }
    window.location.href = target;
  }

  function cancelAutoLaunch() {
    if (timer !== null) {
      window.clearTimeout(timer);
      timer = null;
    }
    if (status) status.textContent = "Launch paused. Press OK to open JioTV.";
  }

  function isBackKey(code) {
    return code === 8 || code === 27 || code === 461 || code === 10009;
  }

  launch.addEventListener("click", function (event) {
    if (event && event.preventDefault) event.preventDefault();
    openJioTV();
  }, false);

  document.addEventListener("keydown", function (event) {
    var code = event.keyCode || event.which;
    if (code === 13 || code === 23) {
      if (event.preventDefault) event.preventDefault();
      openJioTV();
    } else if (isBackKey(code)) {
      cancelAutoLaunch();
      if (event.preventDefault) event.preventDefault();
    }
  }, false);

  window.addEventListener("tizenhwkey", function (event) {
    if (event && event.keyName === "back") {
      cancelAutoLaunch();
      if (event.preventDefault) event.preventDefault();
    }
  }, false);

  timer = window.setTimeout(openJioTV, 1800);
}());
