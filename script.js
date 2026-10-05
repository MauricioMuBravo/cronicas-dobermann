(function(){
  // progress bar
  var fill = document.getElementById('progressFill');
  function onScroll(){
    try{
      var h = document.documentElement;
      var scrolled = h.scrollTop;
      var height = h.scrollHeight - h.clientHeight;
      var pct = height > 0 ? (scrolled/height)*100 : 0;
      fill.style.width = pct + '%';
    }catch(e){}
  }
  document.addEventListener('scroll', onScroll, {passive:true});
  onScroll();

  // reveal on scroll
  var revealEls = document.querySelectorAll('.reveal');
  if('IntersectionObserver' in window){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if(en.isIntersecting){ en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, {threshold:0.15, rootMargin:'0px 0px -8% 0px'});
    revealEls.forEach(function(el){ io.observe(el); });
  } else {
    revealEls.forEach(function(el){ el.classList.add('in'); });
  }

  // scrollspy nav
  var navDots = document.querySelectorAll('.nav-dot');
  var sections = ['hero','origen','anatomia','genetica','personalidad','cuidados','cierre'].map(function(id){return document.getElementById(id);}).filter(Boolean);
  if('IntersectionObserver' in window){
    var spy = new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if(en.isIntersecting){
          var id = en.target.id;
          navDots.forEach(function(d){ d.classList.toggle('active', d.dataset.target === id); });
        }
      });
    }, {rootMargin:'-45% 0px -45% 0px'});
    sections.forEach(function(s){ spy.observe(s); });
  }

  // timeline nodes
  document.querySelectorAll('.tl-node').forEach(function(node){
    node.addEventListener('click', function(){
      node.classList.toggle('open');
    });
  });

  // age growth staircase
  var ageSteps = document.querySelectorAll('.stair-step');
  var ageDetail = document.getElementById('ageDetail');
  ageSteps.forEach(function(step){
    step.addEventListener('click', function(){
      ageSteps.forEach(function(s){ s.classList.remove('active'); });
      step.classList.add('active');
      if(ageDetail){ ageDetail.textContent = step.dataset.detail || ''; }
    });
  });

  // color swatches — recolor the interactive emblem
  var swatchRow = document.getElementById('swatchRow');
  var swatchDetail = document.getElementById('swatchDetail');
  var coatMain = document.getElementById('coatMain');
  var earNaturalPath = document.getElementById('earNatural');
  var earCroppedPath = document.getElementById('earCropped');
  var coatBrow = document.getElementById('coatBrow');
  var coatMuzzle = document.getElementById('coatMuzzle');
  var dogPhoto = document.getElementById('dogPhoto');
  var dogPhotoOriginalSrc = dogPhoto ? dogPhoto.src : null;
  var photoKeyByCoat = {'#141210':'negro','#5a2f1e':'rojo','#4a5560':'azul','#a68a6d':'isabela'};
  if(swatchRow){
    swatchRow.querySelectorAll('.swatch').forEach(function(btn){
      btn.addEventListener('click', function(){
        swatchRow.querySelectorAll('.swatch').forEach(function(b){ b.classList.remove('active'); });
        btn.classList.add('active');
        swatchDetail.textContent = btn.dataset.color + ' — ' + btn.dataset.desc;
        var coat = btn.dataset.coat, fuego = btn.dataset.fuego;
        [coatMain, earNaturalPath, earCroppedPath].forEach(function(el){ if(el) el.setAttribute('fill', coat); });
        [coatBrow, coatMuzzle].forEach(function(el){ if(el) el.setAttribute('fill', fuego); });
        document.querySelectorAll('.illus-coat').forEach(function(el){ el.setAttribute('fill', coat); });
        document.querySelectorAll('.illus-tan').forEach(function(el){ el.setAttribute('fill', fuego); });
        if(dogPhoto){
          var key = photoKeyByCoat[coat];
          if(key === 'negro'){
            dogPhoto.src = dogPhotoOriginalSrc;
          } else if(key){
            var variant = dogPhoto.getAttribute('data-photo-'+key);
            if(variant) dogPhoto.src = variant;
          }
        }
      });
    });
  }

  // medical accordion
  document.querySelectorAll('.med-row button').forEach(function(btn){
    btn.addEventListener('click', function(){
      var row = btn.closest('.med-row');
      var isOpen = row.classList.toggle('open');
      btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  });

  // animated bars
  var barFills = document.querySelectorAll('.bar-fill');
  if(barFills.length){
    if('IntersectionObserver' in window){
      var barIo = new IntersectionObserver(function(entries){
        entries.forEach(function(en){
          if(en.isIntersecting){
            var el = en.target;
            el.style.width = el.dataset.pct + '%';
            barIo.unobserve(el);
          }
        });
      }, {threshold:0.4});
      barFills.forEach(function(el){ barIo.observe(el); });
    } else {
      barFills.forEach(function(el){ el.style.width = el.dataset.pct + '%'; });
    }
  }

  // ember particles drifting up through the hero, like fireflies near the lantern
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var canvas = document.getElementById('emberCanvas');
  if(canvas && !reduceMotion){
    try{
      var ctx = canvas.getContext('2d');
      var hero = document.getElementById('hero');
      var particles = [];
      var dpr = Math.min(window.devicePixelRatio || 1, 2);

      function sizeCanvas(){
        var r = hero.getBoundingClientRect();
        canvas.width = r.width * dpr;
        canvas.height = r.height * dpr;
        canvas.style.width = r.width + 'px';
        canvas.style.height = r.height + 'px';
        ctx.setTransform(dpr,0,0,dpr,0,0);
        return r;
      }
      var rect = sizeCanvas();

      function makeParticle(spawnAtBottom){
        return {
          x: Math.random() * rect.width * 0.7 + rect.width * 0.05,
          y: spawnAtBottom ? rect.height + Math.random()*40 : Math.random() * rect.height,
          r: Math.random() * 1.6 + 0.5,
          speed: Math.random() * 0.35 + 0.12,
          sway: Math.random() * 0.6 + 0.2,
          swayOff: Math.random() * Math.PI * 2,
          alpha: Math.random() * 0.5 + 0.25
        };
      }
      var count = rect.width < 640 ? 24 : 42;
      for(var i=0;i<count;i++){ particles.push(makeParticle(false)); }

      var t = 0;
      function tick(){
        t += 0.016;
        ctx.clearRect(0,0,rect.width,rect.height);
        for(var j=0;j<particles.length;j++){
          var p = particles[j];
          p.y -= p.speed;
          var x = p.x + Math.sin(t*p.sway + p.swayOff) * 8;
          if(p.y < -10){ Object.assign(p, makeParticle(true)); }
          var fadeTop = Math.max(0, Math.min(1, p.y / (rect.height*0.25)));
          ctx.beginPath();
          ctx.arc(x, p.y, p.r, 0, Math.PI*2);
          ctx.fillStyle = 'rgba(232,162,60,' + (p.alpha*fadeTop).toFixed(3) + ')';
          ctx.fill();
        }
        requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);

      var resizeTimer;
      window.addEventListener('resize', function(){
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function(){ rect = sizeCanvas(); }, 200);
      });
    }catch(e){}
  }

  // subtle parallax: hero layers drift with the pointer, content settles back on scroll
  var heroEl = document.getElementById('hero');
  var heroContent = document.getElementById('heroContent');
  var lampEl = document.querySelector('.hero-lamp');
  var skylineEl = document.querySelector('.hero-skyline');
  if(heroEl && window.matchMedia && !window.matchMedia('(pointer: coarse)').matches && !reduceMotion){
    heroEl.addEventListener('mousemove', function(e){
      var r = heroEl.getBoundingClientRect();
      var mx = (e.clientX - r.left) / r.width - 0.5;
      var my = (e.clientY - r.top) / r.height - 0.5;
      if(heroContent) heroContent.style.transform = 'translate(' + (mx*-10) + 'px,' + (my*-6) + 'px)';
      if(lampEl) lampEl.style.transform = 'translate(' + (mx*6) + 'px,0)';
      if(skylineEl) skylineEl.style.transform = 'translate(' + (mx*4) + 'px,0)';
    }, {passive:true});
    heroEl.addEventListener('mouseleave', function(){
      if(heroContent) heroContent.style.transform = '';
      if(lampEl) lampEl.style.transform = '';
      if(skylineEl) skylineEl.style.transform = '';
    });
  }

  // ---------- interactive anatomy illustration ----------
  (function(){
    var detailPanel = document.getElementById('hotspotDetail');
    var facts = {
      cabeza: {label:'1 · Cabeza y expresión', text:'Hocico largo y profundo con labios firmes, un "stop" (quiebre entre frente y hocico) bien marcado y ojos almendrados casi negros: la mordida cierra en tijera con 42 dientes.'},
      orejas: {label:'2 · Orejas', text:'De nacimiento son caídas; el corte quirúrgico para pararlas es una tradición de exhibición cada vez más restringida por ley.'},
      cuello: {label:'3 · Cuello', text:'Arqueado, musculoso y seco, se afina con elegancia desde los hombros hasta la nuca — una de las líneas más reconocibles de la raza.'},
      dorso: {label:'4 · Dorso', text:'Corto, firme y con una línea superior recta que no se hunde ni se arquea: es la base de una zancada eficiente y sin desperdicio de energía.'},
      pecho: {label:'5 · Pecho profundo', text:'La caja torácica es profunda y estrecha, ideal para correr — pero ese mismo pecho profundo predispone al Dobermann a la torsión gástrica (bloat).'},
      abdomen: {label:'6 · Abdomen recogido', text:'La cintura se estrecha notablemente detrás de las costillas ("tucked-up"): rasgo típico de un perro criado para la velocidad, no para el fondo.'},
      traseros: {label:'7 · Cuartos traseros', text:'Muslos potentes y bien angulados que funcionan como el motor de la raza: dan el impulso para acelerar y saltar.'},
      cola: {label:'8 · Cola', text:'Nace larga; tradicionalmente se mochaba a los pocos días de vida. Hoy esa práctica está prohibida en buena parte de Europa y Oceanía.'},
      patas: {label:'9 · Patas y "calcetines"', text:'Delanteras rectas como columnas, con hueso fuerte que absorbe el impacto de cada zancada. Los puntos color fuego aparecen por un gen de color independiente del tono base.'}
    };
    var hotspotEls = {};
    Object.keys(facts).forEach(function(key){ hotspotEls[key] = document.getElementById('hs-'+key); });
    Object.keys(hotspotEls).forEach(function(key){
      var el = hotspotEls[key];
      if(!el) return;
      el.addEventListener('click', function(){
        Object.values(hotspotEls).forEach(function(e){ if(e) e.classList.remove('active'); });
        el.classList.add('active');
        var f = facts[key];
        if(f && detailPanel) detailPanel.innerHTML = '<strong>' + f.label + '</strong>' + f.text;
      });
    });
  })();

  // ---------- interactive Apolda map ----------
  (function(){
    var card = document.getElementById('apoldaMapCard');
    var btn = document.getElementById('apoldaMapBtn');
    var toggleHint = document.getElementById('apoldaMapToggle');
    if(!card || !btn || !toggleHint) return;

    function toggleMap(){
      var open = card.classList.toggle('map-open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    }
    btn.addEventListener('click', toggleMap);
    toggleHint.addEventListener('click', toggleMap);
  })();

  // ---------- fullscreen photo lightbox ----------
  (function(){
    var viewFullBtn = document.getElementById('viewFullBtn');
    var lightbox = document.getElementById('photoLightbox');
    var lightboxImg = document.getElementById('lightboxImg');
    var lightboxClose = document.getElementById('lightboxClose');
    var dogPhotoEl = document.getElementById('dogPhoto');
    if(!viewFullBtn || !lightbox || !lightboxImg || !lightboxClose || !dogPhotoEl) return;

    var lastFocused = null;

    function openLightbox(){
      lightboxImg.src = dogPhotoEl.src;
      lightbox.classList.add('open');
      document.body.style.overflow = 'hidden';
      lastFocused = document.activeElement;
      lightboxClose.focus();
    }
    function closeLightbox(){
      lightbox.classList.remove('open');
      document.body.style.overflow = '';
      if(lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
    }

    viewFullBtn.addEventListener('click', openLightbox);
    lightboxClose.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', function(e){
      if(e.target === lightbox) closeLightbox();
    });
    document.addEventListener('keydown', function(e){
      if(e.key === 'Escape' && lightbox.classList.contains('open')) closeLightbox();
    });

    // keep the fullscreen image in sync if the color swatch changes while open
    var mo = new MutationObserver(function(){
      if(lightbox.classList.contains('open')) lightboxImg.src = dogPhotoEl.src;
    });
    mo.observe(dogPhotoEl, {attributes:true, attributeFilter:['src']});
  })();
})();
