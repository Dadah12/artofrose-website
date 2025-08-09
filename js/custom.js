(function ($) {
  "use strict";

  // ===== AOS (animations) =====
  if (window.AOS) AOS.init();

  // ===== Navbar: auto-collapse on link click =====
  $(".navbar-nav .nav-link").on("click", function () {
    $(".navbar-collapse").collapse("hide");
  });

  // ===== Smooth anchor scroll =====
  $('a[href*="#"]').on("click", function (event) {
    const samePath =
      location.pathname.replace(/^\//, "") === this.pathname.replace(/^\//, "");
    const sameHost = location.hostname === this.hostname;

    if (samePath && sameHost) {
      let target = $(this.hash);
      target = target.length ? target : $("[name=" + this.hash.slice(1) + "]");
      if (target.length) {
        event.preventDefault();
        $("html, body").animate({ scrollTop: target.offset().top - 66 }, 1000);
      }
    }
  });

  // ===== Helper: collect PhotoSwipe items per swiper container =====
  function getPswpItems(swiperContainer) {
    const items = [];
    swiperContainer.querySelectorAll(".pswp-link").forEach(function (link) {
      items.push({
        src: link.getAttribute("href"),
        w: parseInt(link.getAttribute("data-pswp-width"), 10) || 800,
        h: parseInt(link.getAttribute("data-pswp-height"), 10) || 1000,
        alt: link.querySelector("img") ? link.querySelector("img").alt : "",
      });
    });
    return items;
  }

  // ===== One Swiper init per .portfolio-swiper + PhotoSwipe hookup =====
  document.querySelectorAll(".portfolio-swiper").forEach(function (container) {
    const swiper = new Swiper(container, {
      slidesPerView: 1,
      spaceBetween: 20,
      navigation: {
        nextEl: container.querySelector(".swiper-button-next"),
        prevEl: container.querySelector(".swiper-button-prev"),
      },
      breakpoints: {
        0: { slidesPerView: 1 },
        600: { slidesPerView: 1.2 },
        768: { slidesPerView: 2.5 },
        992: { slidesPerView: 3 },
        1200: { slidesPerView: 4 },
      },
      grabCursor: true,
    });

    // PhotoSwipe integration (only if PS is loaded)
    const pswpItems = getPswpItems(container);
    function openPhotoSwipe(index) {
      if (!window.PhotoSwipe) return;
      const pswp = new PhotoSwipe({
        dataSource: pswpItems,
        index: index,
        showHideAnimationType: "zoom",
        pswpModule: PhotoSwipe,
      });
      pswp.init();
    }

    // Arrow click → open PS at current slide (delay to let Swiper update index)
    const nextBtn = container.querySelector(".swiper-button-next");
    const prevBtn = container.querySelector(".swiper-button-prev");
    if (nextBtn)
      nextBtn.addEventListener("click", () =>
        setTimeout(() => openPhotoSwipe(swiper.activeIndex), 120)
      );
    if (prevBtn)
      prevBtn.addEventListener("click", () =>
        setTimeout(() => openPhotoSwipe(swiper.activeIndex), 120)
      );

    // Image click → open PS at that index
    container.querySelectorAll(".pswp-link").forEach(function (link, idx) {
      link.addEventListener("click", function (e) {
        e.preventDefault();
        openPhotoSwipe(idx);
      });
    });
  });
})(window.jQuery);
