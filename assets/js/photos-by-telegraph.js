/* Tiny enhancement for the CSS :target lightbox: Escape and backdrop already
   go back via links; this only intercepts the Escape key so keyboard users
   can close without hunting for the Close control. */
(function () {
  function closeLightbox() {
    var open = document.querySelector(".telegraph-lightbox:target");
    if (!open) return;
    var close = open.querySelector(".telegraph-lightbox-close");
    if (close) close.click();
  }
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") closeLightbox();
  });
})();
