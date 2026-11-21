(() => {
  const countdown=document.querySelector('.hero-countdown');
  if(!countdown)return;
  const raw=countdown.dataset.start;
  const target=raw&&/(Z|[+-]\d{2}:\d{2})$/.test(raw)?Date.parse(raw):NaN;
  if(!Number.isFinite(target))return;
  const timer=countdown.querySelector('[role="timer"]');
  const note=countdown.querySelector('.countdown-note');
  note.textContent=(countdown.dataset.test==='true'?'Test date · ':'')+new Intl.DateTimeFormat('en-GB',{dateStyle:'long',timeStyle:'short',timeZone:'Europe/Budapest'}).format(new Date(target))+' · Hungary time';
  let interval;
  function tick(){
    const remaining=Math.max(0,Math.ceil((target-Date.now())/1000));
    const values={days:Math.floor(remaining/86400),hours:Math.floor(remaining/3600)%24,minutes:Math.floor(remaining/60)%60,seconds:remaining%60};
    for(const [unit,value] of Object.entries(values))countdown.querySelector(`[data-unit="${unit}"]`).textContent=String(value).padStart(2,'0');
    timer.setAttribute('aria-label',`${values.days} days, ${values.hours} hours, ${values.minutes} minutes and ${values.seconds} seconds until camp`);
    if(remaining===0){countdown.querySelector('#countdown-title').textContent='THE ADVENTURE HAS BEGUN';timer.setAttribute('aria-label','The camp has started');clearInterval(interval);return false;}
    return true;
  }
  if(tick())interval=setInterval(()=>{if(!document.hidden)tick()},1000);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)tick()});
})();
