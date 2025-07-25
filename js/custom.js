(function ($) {
  "use strict";

  // AOS ANIMATIONS
  AOS.init();

  // NAVBAR
  $(".navbar-nav .nav-link").click(function () {
    $(".navbar-collapse").collapse("hide");
  });

  // NEWS IMAGE RESIZE
  function NewsImageResize() {
    $(".navbar").scrollspy({ offset: -76 });

    var LargeImage = $(".large-news-image").height();

    var MinusHeight = LargeImage - 6;

    $(".news-two-column").css({ height: MinusHeight - LargeImage / 2 + "px" });
  }

  $(window).on("resize", NewsImageResize);
  $(document).on("ready", NewsImageResize);

  $('a[href*="#"]').click(function (event) {
    if (
      location.pathname.replace(/^\//, "") ==
        this.pathname.replace(/^\//, "") &&
      location.hostname == this.hostname
    ) {
      var target = $(this.hash);
      target = target.length ? target : $("[name=" + this.hash.slice(1) + "]");
      if (target.length) {
        event.preventDefault();
        $("html, body").animate(
          {
            scrollTop: target.offset().top - 66,
          },
          1000
        );
      }
    }
  });

  document
    .querySelectorAll(".portfolio-swiper")
    .forEach(function (swiperContainer) {
      new Swiper(swiperContainer, {
        slidesPerView: 1,
        spaceBetween: 20,
        navigation: {
          nextEl: swiperContainer.querySelector(".swiper-button-next"),
          prevEl: swiperContainer.querySelector(".swiper-button-prev"),
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
    });

  $(document).on("click", "#lightboxOverlay", function (e) {
    var width = $(window).width();
    var x = e.pageX;
    if (x < width / 2) {
      $(".lb-prev").click();
    } else {
      $(".lb-next").click();
    }
  });

  // 1. Collect images for PhotoSwipe gallery per swiper
  function getPswpItems(swiperContainer) {
    let items = [];
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

  // 2. Initialize Swiper and attach arrow events
  document
    .querySelectorAll(".portfolio-swiper")
    .forEach(function (swiperContainer) {
      const swiper = new Swiper(swiperContainer, {
        slidesPerView: 1,
        spaceBetween: 20,
        navigation: {
          nextEl: swiperContainer.querySelector(".swiper-button-next"),
          prevEl: swiperContainer.querySelector(".swiper-button-prev"),
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

      // Prepare PhotoSwipe items
      const pswpItems = getPswpItems(swiperContainer);

      // Prepare function to open PhotoSwipe
      function openPhotoSwipe(index) {
        const pswp = new PhotoSwipe({
          dataSource: pswpItems,
          index: index,
          showHideAnimationType: "zoom",
          pswpModule: PhotoSwipe,
        });
        pswp.init();
      }

      // When arrow is clicked, open PhotoSwipe at the current slide
      swiperContainer
        .querySelector(".swiper-button-next")
        .addEventListener("click", function (e) {
          setTimeout(function () {
            // Give Swiper a moment to update index
            openPhotoSwipe(swiper.activeIndex);
          }, 120);
        });
      swiperContainer
        .querySelector(".swiper-button-prev")
        .addEventListener("click", function (e) {
          setTimeout(function () {
            openPhotoSwipe(swiper.activeIndex);
          }, 120);
        });

      // Optionally, make image click open PhotoSwipe too
      swiperContainer
        .querySelectorAll(".pswp-link")
        .forEach(function (link, idx) {
          link.addEventListener("click", function (e) {
            e.preventDefault();
            openPhotoSwipe(idx);
          });
        });
    });
})(window.jQuery);
