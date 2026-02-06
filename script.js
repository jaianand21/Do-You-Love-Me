// Utility: get random int between min and max
function rand(min, max){return Math.floor(Math.random()*(max-min+1))+min}

// Move element to a random visible position (fixed positioning)
function moveToRandomSafe(el){
  const w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
  const h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
  const rect = el.getBoundingClientRect();
  const maxLeft = Math.max(8, w - rect.width - 8);
  const maxTop = Math.max(8, h - rect.height - 8);
  const left = rand(8, maxLeft);
  const top = rand(8, maxTop);
  el.style.position = 'fixed';
  el.style.left = left + 'px';
  el.style.top = top + 'px';
}

// Attach evasive behavior to all elements with .btn-no
function attachNoEvasion(){
  // Exclude static No buttons (index page) from evasion
  document.querySelectorAll('.btn-no:not(.no-static)').forEach(el => {
    // initialize counter
    if(!el.dataset.evadeCount) el.dataset.evadeCount = '0';

    // move on mouseenter, focus, or touchstart; stop after a few moves so it's clickable
    ['mouseenter','focus','touchstart'].forEach(evt=>{
      el.addEventListener(evt, ()=>{
        let count = parseInt(el.dataset.evadeCount || '0', 10);
        if(count >= 4) return; // stop evading after 4 attempts
        moveToRandomSafe(el);
        el.dataset.evadeCount = String(count + 1);
      }, {passive:true});
    });

    // ensure click always follows href (even if it moved)
    el.addEventListener('click', (e)=>{
      const href = el.getAttribute('href');
      if(!href || href === '#'){
        e.preventDefault();
        // gentle feedback when link is not navigable
        el.classList.add('shake');
        setTimeout(()=>el.classList.remove('shake'),600);
        return;
      }
      // explicit navigation to ensure it works despite movement
      e.preventDefault();
      window.location.href = href;
    });
  });

  // Make sure static No buttons behave normally and always navigate.
  document.querySelectorAll('.no-static').forEach(el => {
    el.addEventListener('click', (e)=>{
      e.preventDefault();
      const href = el.getAttribute('href');
      if(href && href !== '#') window.location.href = href;
      else {
        el.classList.add('shake');
        setTimeout(()=>el.classList.remove('shake'),600);
      }
    });
  });
}

// Confetti burst
function burstConfetti(amount = 36){
  const colors = ['#FFD166','#06D6A0','#EF476F','#118AB2','#FFD6E0','#FFC6A5'];
  for(let i=0;i<amount;i++){
    const c = document.createElement('div');
    c.className = 'confetti';
    c.style.left = (Math.random()*100)+'vw';
    c.style.background = colors[rand(0,colors.length-1)];
    c.style.width = (rand(6,12))+'px';
    c.style.height = (rand(6,12))+'px';
    c.style.animationDelay = (Math.random()*600)+'ms';
    document.body.appendChild(c);
    setTimeout(()=>c.remove(), 4000);
  }
}

// On load: attach handlers and run confetti if celebratory page
document.addEventListener('DOMContentLoaded', ()=>{
  attachNoEvasion();

  // If body has .celebrate class, burst confetti
  if(document.body.classList.contains('celebrate')){
    burstConfetti(48);
  }

  // Add hearts on click for primary buttons
  document.querySelectorAll('.btn-primary').forEach(btn=>{
    btn.addEventListener('click', (e)=>{
      // If on index page, open modal instead of immediate navigation
      if(btn.id === 'open-yes'){
        e.preventDefault();
        openYesModal();
        return;
      }
      // create small heart burst around center of viewport
      burstHearts(8);
    });
  });

  // Accessibility: move No button if focused via keyboard
  document.addEventListener('keydown', (e)=>{
    if(e.key === 'Tab') attachNoEvasion();
  });
});

// Small heart burst animation
function burstHearts(amount=8){
  for(let i=0;i<amount;i++){
    const h = document.createElement('div');
    h.className = 'heart-bubble';
    h.textContent = '❤️';
    h.style.left = (50 + (Math.random()*40 - 20)) + 'vw';
    h.style.top = (50 + (Math.random()*40 - 20)) + 'vh';
    h.style.fontSize = (10 + Math.random()*22) + 'px';
    h.style.opacity = String(0.8 + Math.random()*0.4);
    h.style.animationDelay = (Math.random()*200)+'ms';
    document.body.appendChild(h);
    setTimeout(()=>h.remove(),1400);
  }
}

// Modal: open/close and focus management for Yes choice
function openYesModal(){
  const modal = document.getElementById('yes-modal');
  if(!modal) return;
  modal.hidden = false;
  // trap focus: focus first actionable element
  const first = modal.querySelector('.num-btn, #confirm-yes, #cancel-yes');
  first && first.focus();

  // backdrop click to close
  const backdrop = document.getElementById('modal-backdrop');
  function close(){
    modal.hidden = true;
    backdrop.removeEventListener('click', close);
    document.removeEventListener('keydown', onKey);
    document.getElementById('open-yes') && document.getElementById('open-yes').focus();
  }
  function onKey(e){
    if(e.key === 'Escape') close();
  }
  backdrop.addEventListener('click', close);
  document.addEventListener('keydown', onKey);

  // Cancel button
  const cancel = modal.querySelector('#cancel-yes');
  cancel && cancel.addEventListener('click', (ev)=>{ev.preventDefault(); close();});

  // confirm yes behavior: navigate to yes.html
  const confirm = modal.querySelector('#confirm-yes');
  confirm && confirm.addEventListener('click', ()=>{ modal.hidden = true; burstConfetti(36); });
}