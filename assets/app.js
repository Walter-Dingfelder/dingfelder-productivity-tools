(function(){
  const TEASER_KEY = "de_teaser_hidden_v1";

  function qs(sel, root=document){ return root.querySelector(sel); }
  function qsa(sel, root=document){ return Array.from(root.querySelectorAll(sel)); }

  // Teaser strip hide
  const teaser = qs("#deTeaser");
  if(teaser){
    const hidden = localStorage.getItem(TEASER_KEY) === "1";
    if(hidden) teaser.classList.add("de-hide");

    const hideBtn = qs("[data-teaser-hide]");
    if(hideBtn){
      hideBtn.addEventListener("click", ()=>{
        localStorage.setItem(TEASER_KEY, "1");
        teaser.classList.add("de-hide");
      });
    }

    const openBtn = qs("[data-open-customize]");
    if(openBtn){
      openBtn.addEventListener("click", ()=> openModal("customizeModal"));
    }
  }

  // Modal helpers
  function openModal(id){
    const mask = qs(`#${id}`);
    if(!mask) return;
    mask.classList.remove("de-hide");
    document.body.style.overflow = "hidden";
  }
  function closeModal(id){
    const mask = qs(`#${id}`);
    if(!mask) return;
    mask.classList.add("de-hide");
    document.body.style.overflow = "";
  }

  window.DE = { openModal, closeModal };

  qsa("[data-close-modal]").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      const id = btn.getAttribute("data-close-modal");
      closeModal(id);
    });
  });

  // (Stub) Customize package form – wire to Netlify Forms or a function later
  const form = qs("#deCustomizeForm");
  if(form){
    form.addEventListener("submit", (e)=>{
      e.preventDefault();
      const data = Object.fromEntries(new FormData(form).entries());
      console.log("Customize request (stub):", data);

      const msg = qs("#deCustomizeMsg");
      if(msg){
        msg.textContent = "Request captured (local stub). Wire this to Netlify Forms or /api/customize when ready.";
      }
    });
  }
})();


/* ============================================================
   Netlify Identity (optional)
   - Shows login status in header if #deAuthArea exists
   - Handles invite_token links by opening the widget
   ============================================================ */
(function(){
  function q(id){ return document.getElementById(id); }

  function setAuthUI(user){
    var loginBtn = q('deLoginBtn');
    var logoutBtn = q('deLogoutBtn');
    var emailEl = q('deAuthEmail');
    if(!loginBtn || !logoutBtn || !emailEl) return;

    if(user){
      loginBtn.style.display = 'none';
      logoutBtn.style.display = '';
      emailEl.style.display = '';
      emailEl.textContent = user.email || (user.user_metadata && user.user_metadata.full_name) || 'Signed in';
    }else{
      loginBtn.style.display = '';
      logoutBtn.style.display = 'none';
      emailEl.style.display = 'none';
      emailEl.textContent = '';
    }
  }

  function currentUser(){
    try{
      return window.netlifyIdentity && window.netlifyIdentity.currentUser && window.netlifyIdentity.currentUser();
    }catch(e){ return null; }
  }

  // Scoped localStorage helper (anon vs per-user)
  function scopeKey(key){
    var user = currentUser();
    var scope = user && user.email ? ('user:' + user.email.toLowerCase()) : 'anon';
    return 'de:' + scope + ':' + key;
  }
  window.DEStore = {
    key: scopeKey,
    get: function(key, fallback){
      try{
        var v = localStorage.getItem(scopeKey(key));
        return v === null ? fallback : JSON.parse(v);
      }catch(e){ return fallback; }
    },
    set: function(key, value){
      try{ localStorage.setItem(scopeKey(key), JSON.stringify(value)); }catch(e){}
    },
    remove: function(key){
      try{ localStorage.removeItem(scopeKey(key)); }catch(e){}
    },
    userEmail: function(){
      var u = currentUser();
      return u && u.email ? u.email : null;
    }
  };

  // Identity wiring
  if(window.netlifyIdentity){
    window.netlifyIdentity.on('init', function(user){ setAuthUI(user); });
    window.netlifyIdentity.on('login', function(user){ setAuthUI(user); window.netlifyIdentity.close(); });
    window.netlifyIdentity.on('logout', function(){ setAuthUI(null); });
    window.netlifyIdentity.init();

    var loginBtn = q('deLoginBtn');
    var logoutBtn = q('deLogoutBtn');
    if(loginBtn) loginBtn.addEventListener('click', function(){ window.netlifyIdentity.open('login'); });
    if(logoutBtn) logoutBtn.addEventListener('click', function(){ window.netlifyIdentity.logout(); });

    // If the site is opened with an invite token, open signup flow
    if(typeof window.location !== 'undefined' && window.location.hash && window.location.hash.indexOf('invite_token=') !== -1){
      // Give the widget a tick to init, then open
      setTimeout(function(){ window.netlifyIdentity.open('signup'); }, 250);
    }
  }else{
    // No Identity widget loaded; still render anon state
    setAuthUI(null);
  }
})();

