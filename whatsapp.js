'use strict';
(()=>{
  const button=document.querySelector('.whatsapp-float');
  if(!button)return;

  // Reveal after the initial hero moment so it feels intentional rather than intrusive.
  const reveal=()=>button.classList.add('is-ready');
  if(document.readyState==='complete')setTimeout(reveal,650);
  else window.addEventListener('load',()=>setTimeout(reveal,650),{once:true});

  // Reuse the site's existing custom cursor vocabulary.
  const cursor=document.querySelector('.cursor');
  const cursorLabel=cursor?.querySelector('span');
  button.addEventListener('pointerenter',()=>{
    if(!cursor)return;
    cursor.classList.add('active');
    if(cursorLabel)cursorLabel.textContent='Chat';
  });
  button.addEventListener('pointerleave',()=>{
    if(!cursor)return;
    cursor.classList.remove('active');
    if(cursorLabel)cursorLabel.textContent='Explore';
  });

  // Give analytics hooks without requiring any analytics provider.
  button.addEventListener('click',()=>{
    window.dispatchEvent(new CustomEvent('portfolio:whatsapp-click',{
      detail:{source:'floating-button'}
    }));
  });
})();