(() => {
  const playVideo = (container, focus = false) => {
    let video = container.querySelector('[data-custom-product-video-player]');
    if (!video) {
      const template = container.querySelector('template');
      if (!template) return;
      container.appendChild(template.content.cloneNode(true));
      container.querySelector('.custom-product-video-poster')?.remove();
      video = container.querySelector('[data-custom-product-video-player]');
    }
    video.muted = true;
    if (focus) video.focus();
    const playing = video.play();
    if (playing) playing.catch(() => {});
  };

  const pauseVideos = (gallery) => {
    gallery.querySelectorAll('[data-custom-product-video-player]').forEach((video) => video.pause());
  };

  const playCurrentVideo = (gallery) => {
    pauseVideos(gallery);
    const container = gallery.querySelector('.slick-current [data-custom-product-video]');
    if (container) playVideo(container);
  };

  document.addEventListener('click', (event) => {
    const toggle = event.target.closest('.related-articles-toggle');
    if (toggle) {
      const block = toggle.closest('.product-related-articles');
      const expanded = block.classList.toggle('related-articles-expanded');
      toggle.setAttribute('aria-expanded', String(expanded));
      return;
    }

    const poster = event.target.closest('.custom-product-video-poster');
    if (!poster) return;
    playVideo(poster.closest('[data-custom-product-video]'), true);
  });

  // Delegation also covers galleries inserted by the theme editor or AJAX.
  window.jQuery(document).on(
    'beforeChange.customProductVideos destroy.customProductVideos',
    '.productView-nav',
    function () {
      pauseVideos(this);
    }
  );

  window.jQuery(document).on(
    'init.customProductVideos reInit.customProductVideos afterChange.customProductVideos',
    '.productView-nav',
    function () {
      playCurrentVideo(this);
    }
  );

  // theme.js may have initialized galleries before this deferred script ran.
  window.jQuery(() => {
    document.querySelectorAll('.productView-nav.slick-initialized').forEach(playCurrentVideo);
  });
})();
