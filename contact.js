'use strict';
(()=>{
const form=document.querySelector('#contact-form'),status=document.querySelector('#form-status'),button=form.querySelector('button[type=submit]');
let mode='email';
function setMode(value){mode=value;button.innerHTML=value==='email'?'Prepare an email <span>↗</span>':'Send enquiry <span>↗</span>';status.textContent=value==='email'?'Opens a draft in your email app. You can also copy my email address.':'Your name, email, and message will be used to respond to your enquiry.';}
const config=window.PORTFOLIO_SITE||{};
if(config.contactMode==='netlify'||(config.contactMode==='auto'&&location.hostname.endsWith('.netlify.app')))setMode('netlify');
else if((['localhost','127.0.0.1'].includes(location.hostname)||config.contactMode==='server'||config.contactMode==='auto')&&location.protocol!=='file:')fetch('/api/config').then(r=>r.ok?r.json():null).then(c=>{if(c?.contactEnabled)setMode('server');}).catch(()=>{});
document.querySelector('#copy-email').addEventListener('click',async()=>{const feedback=document.querySelector('#copy-status');try{await navigator.clipboard.writeText('shahzebmohd092@gmail.com');feedback.textContent='Email address copied.';}catch{feedback.textContent='Copy this address: shahzebmohd092@gmail.com';}});
form.addEventListener('submit',async e=>{e.preventDefault();const data=new FormData(form);if(data.get('website'))return;
if(mode==='email'){const subject='Portfolio enquiry from '+data.get('name');const body=`Hi Shahzeb,\n\n${data.get('message')}\n\nFrom: ${data.get('name')}\nReply to: ${data.get('email')}`;location.href=`mailto:shahzebmohd092@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;status.textContent='Review and send the draft in your email app. If it did not open, use Copy email address.';return;}
button.disabled=true;status.textContent='Sending your enquiry…';
try{const response=mode==='netlify'?await fetch('/',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams(data).toString()}):await fetch('/api/contact',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:data.get('name'),email:data.get('email'),message:data.get('message'),website:data.get('website')})});
if(!response.ok)throw new Error('Delivery could not be confirmed. Please use the email link or Copy email address.');
status.textContent='Your enquiry has been received. Thank you.';form.reset();
}catch(error){status.textContent=error.message||'Please use the email link to get in touch.';}finally{button.disabled=false;}
});
})();
