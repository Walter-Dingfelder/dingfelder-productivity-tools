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
