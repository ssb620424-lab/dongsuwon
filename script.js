/* =========================================================
   동수원노인전문요양원 — script.js
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* ── 공지 배너 닫기 ── */
  const noticeBannerClose = document.getElementById('noticeBannerClose');
  const noticeBanner = document.getElementById('noticeBanner');
  if (noticeBannerClose && noticeBanner) {
    noticeBannerClose.addEventListener('click', () => {
      noticeBanner.style.maxHeight = noticeBanner.offsetHeight + 'px';
      requestAnimationFrame(() => {
        noticeBanner.style.transition = 'max-height 0.3s ease, opacity 0.3s ease';
        noticeBanner.style.maxHeight = '0';
        noticeBanner.style.opacity = '0';
        noticeBanner.style.overflow = 'hidden';
      });
      setTimeout(() => noticeBanner.style.display = 'none', 350);
    });
  }

  /* ── HERO SLIDER ── */
  const slidesTrack  = document.getElementById('slidesTrack');
  const slides       = document.querySelectorAll('.slide');
  const dots         = document.querySelectorAll('.slider-dot');
  const progressBar  = document.getElementById('sliderProgress');
  const prevBtn      = document.getElementById('sliderPrev');
  const nextBtn      = document.getElementById('sliderNext');

  let currentSlide   = 0;
  let sliderTimer    = null;
  let progressTimer  = null;
  const SLIDE_DURATION = 5000;

  function goToSlide(idx) {
    slides[currentSlide].classList.remove('active');
    dots[currentSlide].classList.remove('active');
    dots[currentSlide].setAttribute('aria-selected', 'false');
    currentSlide = (idx + slides.length) % slides.length;
    slides[currentSlide].classList.add('active');
    dots[currentSlide].classList.add('active');
    dots[currentSlide].setAttribute('aria-selected', 'true');
    resetProgress();
  }

  function resetProgress() {
    if (progressBar) {
      progressBar.style.transition = 'none';
      progressBar.style.width = '0%';
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          progressBar.style.transition = `width ${SLIDE_DURATION}ms linear`;
          progressBar.style.width = '100%';
        });
      });
    }
  }

  function startSlider() {
    stopSlider();
    sliderTimer = setInterval(() => goToSlide(currentSlide + 1), SLIDE_DURATION);
    resetProgress();
  }

  function stopSlider() {
    clearInterval(sliderTimer);
    if (progressBar) {
      progressBar.style.transition = 'none';
    }
  }

  if (slides.length) {
    if (prevBtn) prevBtn.addEventListener('click', () => { goToSlide(currentSlide - 1); startSlider(); });
    if (nextBtn) nextBtn.addEventListener('click', () => { goToSlide(currentSlide + 1); startSlider(); });
    dots.forEach(dot => {
      dot.addEventListener('click', () => { goToSlide(+dot.dataset.slide); startSlider(); });
    });
    // Touch swipe
    let touchStartX = 0;
    const heroEl = document.getElementById('heroSlider');
    if (heroEl) {
      heroEl.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].screenX; }, { passive: true });
      heroEl.addEventListener('touchend', e => {
        const diff = touchStartX - e.changedTouches[0].screenX;
        if (Math.abs(diff) > 50) { goToSlide(diff > 0 ? currentSlide + 1 : currentSlide - 1); startSlider(); }
      });
    }
    startSlider();
  }

  /* ── HEADER SCROLL ── */
  const siteHeader = document.getElementById('siteHeader');
  window.addEventListener('scroll', () => {
    if (siteHeader) siteHeader.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

  /* ── MOBILE MENU ── */
  const hamburger    = document.getElementById('hamburger');
  const mobileMenu   = document.getElementById('mobileMenu');
  const mobileClose  = document.getElementById('mobileClose');
  const mobileOverlay= document.getElementById('mobileOverlay');

  function openMenu() {
    mobileMenu.classList.add('open');
    mobileOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    hamburger.classList.add('active');
    hamburger.setAttribute('aria-expanded', 'true');
  }
  function closeMenu() {
    mobileMenu.classList.remove('open');
    mobileOverlay.classList.remove('open');
    document.body.style.overflow = '';
    hamburger.classList.remove('active');
    hamburger.setAttribute('aria-expanded', 'false');
  }

  if (hamburger)    hamburger.addEventListener('click', openMenu);
  if (mobileClose)  mobileClose.addEventListener('click', closeMenu);
  if (mobileOverlay)mobileOverlay.addEventListener('click', closeMenu);

  // Mobile accordion sub-menus
  document.querySelectorAll('.mobile-nav-parent').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.mobileParent;
      const sub = document.getElementById(`mobile-sub-${key}`);
      const isOpen = sub.classList.contains('open');
      // close all
      document.querySelectorAll('.mobile-sub').forEach(s => s.classList.remove('open'));
      document.querySelectorAll('.mobile-nav-parent').forEach(b => b.classList.remove('open'));
      if (!isOpen && sub) { sub.classList.add('open'); btn.classList.add('open'); }
    });
  });

  /* ── PAGE ROUTING ── */
  function showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const target = document.getElementById(`page-${pageId}`);
    if (target) {
      target.classList.add('active');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    // Highlight active nav
    document.querySelectorAll('.nav-link').forEach(link => {
      link.closest('.nav-item').classList.remove('active');
      if (link.dataset.page === pageId) link.closest('.nav-item').classList.add('active');
    });
    closeMenu();

    // Init page-specific logic
    if (pageId === 'home') {
      startSlider();
      initScrollReveal();
      loadHomeNews();
    } else {
      stopSlider();
    }
    if (pageId === 'privacy') { /* 정적 페이지, 별도 로드 불필요 */ }

    // 개인정보 토글 버튼 초기화
    if (pageId === 'consult') {
      setTimeout(() => {
        document.querySelectorAll('.privacy-toggle-btn').forEach(btn => {
          btn.addEventListener('click', () => {
            const targetId = btn.dataset.target;
            const content  = document.getElementById(targetId);
            if (!content) return;
            const isOpen = content.style.display !== 'none';
            content.style.display = isOpen ? 'none' : 'block';
            btn.textContent = isOpen ? '내용 보기 ▼' : '내용 닫기 ▲';
          });
        });
      }, 100);
    }
    if (pageId === 'notices') loadBoard('notices');
    if (pageId === 'news')    loadBoard('news');
    if (pageId === 'gallery') initGallery();
    if (pageId === 'intro')   loadPageContent('intro');
    if (pageId === 'vision')  loadPageContent('vision');
    if (pageId === 'services') loadPageContent('services');
    if (pageId === 'programs') loadPrograms();
    if (pageId === 'program-detail') { /* 상세보기는 loadPrograms에서 처리 */ }
    if (pageId === 'admission-process') loadPageContent('admission-process');
    if (pageId === 'admission-docs')    loadPageContent('admission-docs');
  }

  // Delegate all [data-page] clicks
  document.addEventListener('click', e => {
    const el = e.target.closest('[data-page]');
    if (el) {
      e.preventDefault();
      showPage(el.dataset.page);
    }
  });

  /* ── SPACE GALLERY TABS ── */
  document.querySelectorAll('.space-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.space-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.space-panel').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      const panel = document.getElementById(`space-${tab.dataset.space}`);
      if (panel) panel.classList.add('active');
    });
  });

  /* ── FLOOR TABS ── */
  document.querySelectorAll('.floor-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.floor-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.floor-panel').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      const panel = document.getElementById(`floor-${tab.dataset.floor}`);
      if (panel) panel.classList.add('active');
    });
  });

  /* ── STAT COUNTER ANIMATION ── */
  function animateCounter(el) {
    const target = parseInt(el.dataset.count);
    const duration = 1600;
    const start = performance.now();
    function update(time) {
      const elapsed = time - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target);
      if (progress < 1) requestAnimationFrame(update);
      else el.textContent = target;
    }
    requestAnimationFrame(update);
  }

  let countersStarted = false;
  function tryStartCounters() {
    if (countersStarted) return;
    const statsRow = document.querySelector('.stats-row');
    if (!statsRow) return;
    const rect = statsRow.getBoundingClientRect();
    if (rect.top < window.innerHeight - 80) {
      countersStarted = true;
      document.querySelectorAll('.stat-num[data-count]').forEach(animateCounter);
    }
  }
  window.addEventListener('scroll', tryStartCounters, { passive: true });
  tryStartCounters();

  /* ── SCROLL REVEAL ── */
  function initScrollReveal() {
    const revealEls = document.querySelectorAll('.reveal-section');
    revealEls.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top > window.innerHeight) el.classList.add('reveal-hidden');
    });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.remove('reveal-hidden');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    revealEls.forEach(el => observer.observe(el));
  }
  initScrollReveal();

  /* ── BACK TO TOP ── */
  const backToTop = document.getElementById('backToTop');
  window.addEventListener('scroll', () => {
    if (backToTop) backToTop.style.display = window.scrollY > 400 ? 'flex' : 'none';
  }, { passive: true });
  if (backToTop) {
    backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  /* ══════════════════════════════════════════
     Firebase 실시간 연동 — 모든 동적 콘텐츠
     ══════════════════════════════════════════ */

  // 날짜 포맷 헬퍼
  function fmtKR(ts) {
    if (!ts) return '';
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' });
  }

  /* ── 홈 뉴스피드 (Firebase) ── */
  let homeAllPosts = [];
  async function loadHomeNews() {
    const container = document.getElementById('homeNewsList');
    if (!container || !window.db) return;
    try {
      const [nSnap, newsSnap] = await Promise.all([
        window.db.collection('notices').orderBy('createdAt','desc').limit(4).get(),
        window.db.collection('news').orderBy('createdAt','desc').limit(4).get(),
      ]);
      homeAllPosts = [
        ...nSnap.docs.map(d => ({ ...d.data(), type: 'notice', date: fmtKR(d.data().createdAt) })),
        ...newsSnap.docs.map(d => ({ ...d.data(), type: 'news', date: fmtKR(d.data().createdAt) })),
      ].sort((a, b) => {
        const ta = a.createdAt?.toDate?.() || new Date(0);
        const tb = b.createdAt?.toDate?.() || new Date(0);
        return tb - ta;
      }).slice(0, 6);

      renderHomeNews('all');
    } catch(e) { console.warn('홈 뉴스 로드 실패:', e); }
  }

  function renderHomeNews(cat) {
    const container = document.getElementById('homeNewsList');
    if (!container) return;
    const filtered = cat === 'all' ? homeAllPosts
      : homeAllPosts.filter(p => cat === 'notice' ? p.type === 'notice' : p.type === 'news');
    if (!filtered.length) {
      container.innerHTML = '<div class="board-empty" style="padding:32px;text-align:center;color:#999;">등록된 게시글이 없습니다</div>';
      return;
    }
    container.innerHTML = filtered.map(item => `
      <div class="news-card">
        <div class="news-card-meta">
          <span class="news-tag ${item.type === 'notice' ? 'news-tag-notice' : 'news-tag-event'}">${item.type === 'notice' ? '공지' : '소식'}</span>
          <span class="news-date">${item.date}</span>
        </div>
        <h4>${item.title}</h4>
        <p>${(item.content || '').substring(0, 80)}${(item.content || '').length > 80 ? '...' : ''}</p>
      </div>
    `).join('');
  }

  // 홈 뉴스 카테고리 필터
  document.querySelectorAll('.news-cat-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.news-cat-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderHomeNews(btn.dataset.cat);
    });
  });

  /* ── 프로그램 게시판 ── */
  async function loadPrograms() {
    if (!window.db) return;
    const grid = document.getElementById('prog-posts-grid');
    const empty = document.getElementById('prog-empty');
    if (!grid) return;
    grid.innerHTML = '<div class="prog-loading">불러오는 중...</div>';
    try {
      const snap = await window.db.collection('program-posts').orderBy('createdAt', 'desc').get();
      if (snap.empty) {
        grid.style.display = 'none';
        if (empty) empty.style.display = 'block';
        return;
      }
      grid.style.display = 'grid';
      if (empty) empty.style.display = 'none';
      grid.innerHTML = snap.docs.map(doc => {
        const d = doc.data();
        const thumb = d.images && d.images.length > 0 ? d.images[0] : 'img-hall.jpg';
        const date = d.createdAt ? new Date(d.createdAt.seconds * 1000).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' }) : '';
        return `<div class="prog-blog-item" onclick="openProgramDetail('${doc.id}')">
          <div class="prog-blog-thumb"><img src="${thumb}" alt="${d.title}" loading="lazy"></div>
          <div class="prog-blog-info">
            <p class="prog-blog-title">${d.title}</p>
            <span class="prog-blog-date">${date}</span>
          </div>
        </div>`;
      }).join('');
    } catch(e) { grid.innerHTML = '<div class="prog-loading">불러오기 실패</div>'; }
  }

  window.openProgramDetail = async function(postId) {
    if (!window.db) return;
    try {
      const doc = await window.db.collection('program-posts').doc(postId).get();
      if (!doc.exists) return;
      const d = doc.data();
      const date = d.createdAt ? new Date(d.createdAt.seconds * 1000).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' }) : '';

      document.getElementById('prog-detail-title').textContent = d.title;
      document.getElementById('prog-detail-hero-title').textContent = d.title;
      document.getElementById('prog-detail-breadcrumb').textContent = d.title;
      document.getElementById('prog-detail-date').textContent = date;
      document.getElementById('prog-detail-content').innerHTML = d.content ? d.content.replace(/\n/g, '<br>') : '';

      // 사진 그리드
      const imgWrap = document.getElementById('prog-detail-images');
      if (d.images && d.images.length > 0) {
        imgWrap.innerHTML = `<div class="prog-detail-img-grid">${d.images.map(src => `<div class="prog-detail-img-item"><img src="${src}" alt="프로그램 사진"></div>`).join('')}</div>`;
      } else { imgWrap.innerHTML = ''; }

      // 상세 페이지 표시
      document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
      const detailPage = document.getElementById('page-program-detail');
      detailPage.style.display = 'block';
      window.scrollTo(0, 0);
    } catch(e) { console.error(e); }
  };

  /* ── 페이지 콘텐츠 로더 (Firebase) ── */
  async function loadPageContent(pageId) {
    if (!window.db) return;
    try {
      const doc = await window.db.collection('pages').doc(pageId).get();
      if (!doc.exists) return; // Firebase에 없으면 기본값 유지
      const d = doc.data();

      if (pageId === 'intro') {
        const bodyEl = document.getElementById('intro-body');
        if (bodyEl && d.body) bodyEl.innerHTML = d.body;

      } else if (pageId === 'vision') {
        const stmtEl = document.getElementById('vision-statement');
        if (stmtEl && d.statement) stmtEl.innerHTML = d.statement;
        const gridEl = document.getElementById('values-grid');
        if (gridEl && d.values) {
          gridEl.innerHTML = d.values.map((v, i) => `
            <div class="value-card">
              <div class="value-num">0${i+1}</div>
              <h3>${v.title}</h3>
              <p>${v.content}</p>
            </div>`).join('');
        }

      } else if (pageId === 'services') {
        const el = document.getElementById('services-detail-content');
        if (el && d.services) {
          el.innerHTML = `<div class="services-detail-grid">${d.services.map(s => `
            <div class="service-detail-card">
              <div class="service-detail-icon"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg></div>
              <div><h3>${s.title}</h3><ul>${s.items.map(item => `<li>${item}</li>`).join('')}</ul></div>
            </div>`).join('')}</div>`;
        }

      } else if (pageId === 'programs') {
        const el = document.getElementById('programs-content');
        if (el && d.days) {
          el.innerHTML = `<div class="weekly-schedule">${d.days.map(day => `
            <div class="schedule-day">
              <div class="schedule-day-label">${day.name}</div>
              <div class="schedule-items">${day.items.map(item => `
                <div class="schedule-item">
                  <span class="time">${item.time}</span>
                  <span class="prog prog-cognitive">${item.name}</span>
                </div>`).join('')}
              </div>
            </div>`).join('')}</div>`;
        }

      } else if (pageId === 'admission-process') {
        const el = document.getElementById('admission-process-content');
        if (el && d.steps) {
          let html = '<div class="process-steps">';
          d.steps.forEach((step, i) => {
            if (i > 0) html += '<div class="process-arrow">↓</div>';
            html += `<div class="process-step">
              <div class="step-num">0${i+1}</div>
              <div class="step-content"><h3>${step.title}</h3><p>${step.content}</p></div>
            </div>`;
          });
          html += '</div>';
          el.innerHTML = html;
        }

      } else if (pageId === 'admission-docs') {
        const el = document.getElementById('admission-docs-content');
        if (el && d.required) {
          el.innerHTML = `
            <div class="docs-section">
              <div class="docs-card">
                <h3>필수 서류</h3>
                <ul class="docs-list">${d.required.map(doc => `
                  <li><span class="doc-icon">📄</span><div><strong>${doc.name}</strong><p>${doc.desc}</p></div></li>`).join('')}
                </ul>
              </div>
              ${d.additional ? `<div class="docs-card">
                <h3>추가 서류 (해당자)</h3>
                <ul class="docs-list">${d.additional.map(doc => `
                  <li><span class="doc-icon">📑</span><div><strong>${doc.name}</strong><p>${doc.desc}</p></div></li>`).join('')}
                </ul>
              </div>` : ''}
            </div>
            <div class="docs-note"><p>📌 서류 준비에 어려움이 있으시면 담당자가 자세히 안내해 드립니다. <a href="tel:031-212-2929">031-212-2929</a></p></div>`;
        }
      }
    } catch(e) { console.warn('페이지 콘텐츠 로드 실패:', e); }
  }

  /* ── 게시판 로더 (Firebase) ── */
  function renderBoard(containerId, data) {
    const container = document.getElementById(containerId);
    if (!container) return;
    if (!data.length) { container.innerHTML = '<div class="board-empty">등록된 게시글이 없습니다</div>'; return; }
    container.innerHTML = data.map(item => `
      <div class="board-item">
        <div class="board-item-meta">
          <span class="news-tag ${item.type === 'notice' ? 'news-tag-notice' : 'news-tag-event'}">${item.type === 'notice' ? '공지' : '소식'}</span>
          <span class="news-date">${item.date}</span>
        </div>
        <h4>${item.title}</h4>
        <p>${item.content}</p>
      </div>
    `).join('');
  }

  function loadBoard(type) {
    const containerId = type === 'notices' ? 'noticesList' : 'newsList';
    const container   = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '<div class="board-loading">불러오는 중...</div>';
    if (!window.db) { container.innerHTML = '<div class="board-empty">데이터를 불러올 수 없습니다</div>'; return; }
    window.db.collection(type === 'notices' ? 'notices' : 'news')
      .orderBy('createdAt', 'desc').limit(30).get()
      .then(snap => {
        if (snap.empty) { container.innerHTML = '<div class="board-empty">등록된 게시글이 없습니다</div>'; return; }
        renderBoard(containerId, snap.docs.map(doc => {
          const d = doc.data();
          return { title: d.title, date: fmtKR(d.createdAt), content: d.content || '', type: type === 'notices' ? 'notice' : 'news' };
        }));
      })
      .catch(() => { container.innerHTML = '<div class="board-empty">불러오기 실패. 새로고침 해주세요</div>'; });
  }

  /* ── 갤러리 (Firebase 우선, 하드코딩 fallback) ── */
  let galleryData = [];

  async function initGallery() {
    const grid = document.getElementById('galleryGrid');
    if (!grid) return;

    // Firebase에서 갤러리 로드
    if (window.db) {
      try {
        const snap = await window.db.collection('gallery').orderBy('createdAt','desc').get();
        if (!snap.empty) {
          galleryData = snap.docs.map(doc => {
            const d = doc.data();
            return { img: d.url, caption: d.caption || '', category: d.category || 'lounge' };
          });
          renderGallery('all');
          initGalleryFilter();
          initLightbox();
          return;
        }
      } catch(e) { console.warn('갤러리 로드 실패:', e); }
    }
    // fallback: 기존 하드코딩 아이템 유지
    galleryData = [...grid.querySelectorAll('.gallery-item')].map(el => ({
      img: el.dataset.img, caption: el.dataset.caption, category: el.dataset.category,
    }));
    initGalleryFilter();
    initLightbox();
  }

  function renderGallery(filter) {
    const grid = document.getElementById('galleryGrid');
    if (!grid) return;
    const filtered = filter === 'all' ? galleryData : galleryData.filter(i => i.category === filter);
    if (!filtered.length) { grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:48px;color:#999;">등록된 사진이 없습니다</div>'; return; }
    grid.innerHTML = filtered.map((item, idx) => `
      <div class="gallery-item" data-idx="${idx}" data-category="${item.category}" data-img="${item.img}" data-caption="${item.caption}">
        <div class="gallery-thumb" style="background-image:url('${item.img}')">
          <div class="gallery-overlay"><span>+</span></div>
        </div>
      </div>
    `).join('');
    // 클릭 이벤트 재바인딩
    grid.querySelectorAll('.gallery-item').forEach((el, idx) => {
      el.addEventListener('click', () => openLightbox(idx, filter === 'all' ? galleryData : galleryData.filter(i => i.category === filter)));
    });
  }

  function initGalleryFilter() {
    document.querySelectorAll('.gallery-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.gallery-filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderGallery(btn.dataset.filter);
      });
    });
  }

  let lbData = [], lbIdx = 0;
  function openLightbox(idx, data) {
    lbData = data; lbIdx = idx;
    const lbImg = document.getElementById('lightboxImg');
    const lbCap = document.getElementById('lightboxCaption');
    const lb    = document.getElementById('lightbox');
    if (!lb) return;
    lbImg.src = lbData[lbIdx].img;
    lbCap.textContent = lbData[lbIdx].caption;
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeLightbox() {
    document.getElementById('lightbox')?.classList.remove('open');
    document.body.style.overflow = '';
  }
  function initLightbox() {
    document.getElementById('lightboxClose')?.addEventListener('click', closeLightbox);
    document.getElementById('lightboxPrev')?.addEventListener('click', () => {
      lbIdx = (lbIdx - 1 + lbData.length) % lbData.length;
      document.getElementById('lightboxImg').src = lbData[lbIdx].img;
      document.getElementById('lightboxCaption').textContent = lbData[lbIdx].caption;
    });
    document.getElementById('lightboxNext')?.addEventListener('click', () => {
      lbIdx = (lbIdx + 1) % lbData.length;
      document.getElementById('lightboxImg').src = lbData[lbIdx].img;
      document.getElementById('lightboxCaption').textContent = lbData[lbIdx].caption;
    });
    document.getElementById('lightbox')?.addEventListener('click', e => { if (e.target.id === 'lightbox') closeLightbox(); });
    document.addEventListener('keydown', e => {
      if (!document.getElementById('lightbox')?.classList.contains('open')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft')  { lbIdx = (lbIdx - 1 + lbData.length) % lbData.length; document.getElementById('lightboxImg').src = lbData[lbIdx].img; }
      if (e.key === 'ArrowRight') { lbIdx = (lbIdx + 1) % lbData.length; document.getElementById('lightboxImg').src = lbData[lbIdx].img; }
    });
  }

  /* ── CONSULT FORM ── */
  const consultForm = document.getElementById('consultForm');
  if (consultForm) {
    consultForm.addEventListener('submit', async e => {
      e.preventDefault();
      const submitText    = document.getElementById('submitText');
      const submitLoading = document.getElementById('submitLoading');
      const successMsg    = document.getElementById('consultSuccess');
      const errorMsg      = document.getElementById('consultError');

      // Validation
      const guardianName = document.getElementById('guardianName').value.trim();
      const phone        = document.getElementById('phone').value.trim();
      const patientName  = document.getElementById('patientName').value.trim();
      const privacyAgree = document.getElementById('privacyAgree').checked;

      if (!guardianName || !phone || !patientName) {
        alert('필수 항목을 모두 입력해 주세요.');
        return;
      }
      if (!privacyAgree) {
        alert('개인정보 수집·이용에 동의해 주세요.');
        return;
      }

      submitText.style.display    = 'none';
      submitLoading.style.display = 'inline';
      successMsg.style.display    = 'none';
      errorMsg.style.display      = 'none';

      const formData = {
        guardianName,
        phone,
        patientName,
        patientAge:     document.getElementById('patientAge').value,
        careGrade:      document.getElementById('careGrade').value,
        admissionDate:  document.getElementById('admissionDate').value,
        message:        document.getElementById('message').value,
        createdAt:      new Date().toISOString(),
        status:         'pending',
      };

      try {
        if (window.db) {
          await window.db.collection('consultations').add(formData);
        }
        submitText.style.display    = 'inline';
        submitLoading.style.display = 'none';
        successMsg.style.display    = 'block';
        consultForm.reset();
      } catch (err) {
        console.error(err);
        submitText.style.display    = 'inline';
        submitLoading.style.display = 'none';
        errorMsg.style.display      = 'block';
      }
    });
  }

  /* ── MENU TABLE NAV ── */
  /* ── MENU TABLE (Firebase 연동) ── */
  let weekOffset = 0;

  function getWeekDates(offset) {
    const now = new Date();
    const monday = new Date(now);
    const day = now.getDay() === 0 ? 7 : now.getDay();
    monday.setDate(now.getDate() - day + 1 + offset * 7);
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      days.push(d);
    }
    return { monday, days };
  }

  function fmt(d) { return `${d.getMonth()+1}/${d.getDate()}`; }
  function fmtISO(d) { return d.toISOString().split('T')[0]; }

  async function loadMenuTable() {
    const container = document.getElementById('menuTableContainer');
    const labelEl   = document.getElementById('menuWeekLabel');
    if (!container) return;

    const { monday, days } = getWeekDates(weekOffset);
    const sunday = days[6];
    if (labelEl) labelEl.textContent = weekOffset === 0
      ? `이번 주 식단 (${fmt(monday)} ~ ${fmt(sunday)})`
      : `${fmt(monday)} ~ ${fmt(sunday)} 식단`;

    const dateStrings = days.map(fmtISO);
    const dayLabels = ['월', '화', '수', '목', '금', '토', '일'];
    const mealTypes = ['아침', '점심', '저녁'];

    // Firebase에서 해당 주 데이터 불러오기
    let rows = { '아침': {}, '점심': {}, '저녁': {} };
    let hasData = false;

    if (window.db) {
      try {
        const snap = await window.db.collection('menus')
          .where('date', '>=', dateStrings[0])
          .where('date', '<=', dateStrings[6])
          .get();

        snap.docs.forEach(doc => {
          const d = doc.data();
          if (rows[d.mealType]) {
            rows[d.mealType][d.date] = d.items;
            hasData = true;
          }
        });
      } catch(e) { console.warn('메뉴 로드 실패:', e); }
    }

    const dayNames = ['월', '화', '수', '목', '금', '토', '일'];
    const mealIcons = { '아침': '🌅', '점심': '☀️', '저녁': '🌙' };
    const mealColors = { '아침': '#E8F5E9', '점심': '#FFF8E1', '저녁': '#EDE7F6' };
    const mealTextColors = { '아침': '#2E7D32', '점심': '#F57F17', '저녁': '#4527A0' };

    if (!hasData) {
      container.innerHTML = `
        <div style="text-align:center;padding:64px 24px;background:var(--cream);border-radius:12px;border:2px dashed var(--border);">
          <div style="font-size:2.5rem;margin-bottom:12px;">🍽️</div>
          <p style="font-size:1rem;font-weight:600;color:var(--forest);margin-bottom:6px;">등록된 식단이 없습니다</p>
          <p style="font-size:0.85rem;color:var(--text-light);">관리자 페이지 → 식단표 관리에서 등록해주세요</p>
        </div>`;
      return;
    }

    // 날짜 표시 (월/일)
    const dayFmt = d => `${d.getMonth()+1}/${d.getDate()}`;

    let html = `
    <div class="menu-table-wrap">
      <table class="menu-table menu-table-new">
        <thead>
          <tr>
            <th class="menu-th-type">식사</th>
            ${days.map((d, i) => {
              const isToday = fmtISO(d) === fmtISO(new Date());
              const isSat = i === 5, isSun = i === 6;
              return `<th class="menu-th-day ${isToday ? 'menu-today' : ''} ${isSat ? 'menu-sat' : ''} ${isSun ? 'menu-sun' : ''}">
                <span class="menu-day-name">${dayNames[i]}</span>
                <span class="menu-day-date">${dayFmt(d)}</span>
              </th>`;
            }).join('')}
          </tr>
        </thead>
        <tbody>`;

    mealTypes.forEach(meal => {
      html += `<tr>
        <td class="meal-type-new" style="background:${mealColors[meal]};color:${mealTextColors[meal]}">
          <span class="meal-icon">${mealIcons[meal]}</span>
          <span class="meal-label">${meal}</span>
        </td>`;
      days.forEach((d, i) => {
        const dateStr = fmtISO(d);
        const items = rows[meal][dateStr];
        const isToday = dateStr === fmtISO(new Date());
        const isSat = i === 5, isSun = i === 6;
        html += `<td class="menu-cell ${isToday ? 'menu-cell-today' : ''} ${isSat ? 'menu-cell-sat' : ''} ${isSun ? 'menu-cell-sun' : ''}">
          ${items ? items.split('\n').map(item => `<span class="menu-item-chip">${item.trim()}</span>`).join('') : '<span class="menu-empty">-</span>'}
        </td>`;
      });
      html += '</tr>';
    });

    html += `</tbody></table></div>`;
    container.innerHTML = html;
  }

  const menuPrevWeek = document.getElementById('menuPrevWeek');
  const menuNextWeek = document.getElementById('menuNextWeek');
  if (menuPrevWeek) menuPrevWeek.addEventListener('click', () => { weekOffset--; loadMenuTable(); });
  if (menuNextWeek) menuNextWeek.addEventListener('click', () => { weekOffset++; loadMenuTable(); });
  loadMenuTable();

  /* ── INIT DEFAULT PAGE ── */
  showPage('home');

}); // end DOMContentLoaded


/* ══════════════════════════════════════════════════
   글자 크기 확대 토글
   - 클릭 시 body에 .font-large 클래스 토글
   - localStorage로 설정 유지 (다음 접속에도 기억)
══════════════════════════════════════════════════ */

(function initFontSizeToggle() {
  const btn = document.getElementById('fontSizeToggle');
  if (!btn) return;

  // 이전 설정 불러오기
  try {
    if (localStorage.getItem('fontLarge') === 'true') {
      document.body.classList.add('font-large');
    }
  } catch(e) {}

  btn.addEventListener('click', function () {
    const isLarge = document.body.classList.toggle('font-large');
    try {
      localStorage.setItem('fontLarge', isLarge ? 'true' : 'false');
    } catch(e) {}
  });
})();


/* ══════════════════════════════════════════════════
   FAQ 아코디언 + 카테고리 필터
══════════════════════════════════════════════════ */

(function initFaq() {

  /* ── 아코디언 ── */
  document.querySelectorAll('.faq-q').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var item   = this.closest('.faq-item');
      var answer = item.querySelector('.faq-a');
      var isOpen = this.getAttribute('aria-expanded') === 'true';

      // 같은 리스트 내 열린 항목 모두 닫기
      var list = item.closest('.faq-list');
      list.querySelectorAll('.faq-q[aria-expanded="true"]').forEach(function (openBtn) {
        if (openBtn !== btn) {
          openBtn.setAttribute('aria-expanded', 'false');
          openBtn.closest('.faq-item').querySelector('.faq-a').classList.remove('open');
        }
      });

      // 현재 항목 토글
      this.setAttribute('aria-expanded', String(!isOpen));
      answer.classList.toggle('open', !isOpen);

      // 열릴 때 부드럽게 스크롤
      if (!isOpen) {
        setTimeout(function () {
          item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
      }
    });
  });

  /* ── 카테고리 필터 ── */
  document.querySelectorAll('.faq-tab').forEach(function (tab) {
    tab.addEventListener('click', function () {
      var cat = this.getAttribute('data-faq-cat');

      // 탭 활성화
      document.querySelectorAll('.faq-tab').forEach(function (t) {
        t.classList.remove('active');
      });
      this.classList.add('active');

      // FAQ 항목 필터링
      document.querySelectorAll('.faq-item').forEach(function (item) {
        var match = (cat === 'all') || (item.getAttribute('data-faq-cat') === cat);
        item.classList.toggle('hidden', !match);

        // 숨겨질 때 열린 답변 닫기
        if (!match) {
          var q = item.querySelector('.faq-q');
          var a = item.querySelector('.faq-a');
          q.setAttribute('aria-expanded', 'false');
          a.classList.remove('open');
        }
      });
    });
  });

})();
