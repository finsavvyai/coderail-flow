/**
 * Recording script injected into proxied HTML pages.
 *
 * Overrides fetch, XHR, Image.src, and createElement to rewrite URLs
 * through the proxy. Sends user actions (click, fill, select) to the
 * parent frame via postMessage for the Flow Recorder.
 */

export function buildRecordingScript(proxyPrefix: string, targetOrigin: string): string {
  return `<script>(function(){
if(window.__crRec)return;window.__crRec=true;
var PROXY_PREFIX="${proxyPrefix}";
var TARGET_ORIGIN="${targetOrigin}";
var ACTION_COUNTER=0;

function nextActionId(){
  ACTION_COUNTER+=1;
  return 'act-'+Date.now()+'-'+ACTION_COUNTER;
}

function getRecorderTarget(){
  try{
    if(window.opener&&!window.opener.closed)return window.opener;
  }catch(e){}
  try{
    if(window.parent&&window.parent!==window)return window.parent;
  }catch(e){}
  return null;
}

function sendMessage(payload){
  var target=getRecorderTarget();
  if(!target)return;
  try{target.postMessage(payload,'*')}catch(e){}
}

/* ── Rewrite URL helper ── */
function rw(u){
  if(typeof u!=='string')return u;
  /* absolute URL matching target origin */
  if(u.indexOf(TARGET_ORIGIN)===0) return PROXY_PREFIX+u.slice(TARGET_ORIGIN.length);
  /* root-relative URL like /api/login */
  if(u.charAt(0)==='/'&&u.charAt(1)!=='/') return PROXY_PREFIX+u;
  return u;
}

/* ── Override fetch ── */
var origFetch=window.fetch;
window.fetch=function(input,init){
  if(typeof input==='string'){input=rw(input)}
  else if(input&&input.url){input=new Request(rw(input.url),input)}
  return origFetch.call(this,input,init);
};

/* ── Override XHR ── */
var origOpen=XMLHttpRequest.prototype.open;
XMLHttpRequest.prototype.open=function(method,url){
  if(typeof url==='string')url=rw(url);
  return origOpen.apply(this,[method,url].concat(Array.prototype.slice.call(arguments,2)));
};

/* ── Override Image.src ── */
var imgDesc=Object.getOwnPropertyDescriptor(HTMLImageElement.prototype,'src');
if(imgDesc&&imgDesc.set){var origSet=imgDesc.set;Object.defineProperty(HTMLImageElement.prototype,'src',{set:function(v){origSet.call(this,rw(v))},get:imgDesc.get,configurable:true});}

/* ── Override createElement script/link src ── */
var origCreate=document.createElement.bind(document);
function overrideUrlProperty(el,prop){
  var proto=Object.getPrototypeOf(el);
  if(!proto)return;
  var desc=Object.getOwnPropertyDescriptor(proto,prop);
  if(desc&&desc.set){
    var originalSet=desc.set;
    Object.defineProperty(el,prop,{
      set:function(v){originalSet.call(this,rw(v))},
      get:desc.get,
      configurable:true
    });
  }
}
document.createElement=function(tag){
  var el=origCreate(tag);
  if(tag.toLowerCase()==='script'||tag.toLowerCase()==='link'||tag.toLowerCase()==='img'){
    overrideUrlProperty(el,'src');
    overrideUrlProperty(el,'href');
  }
  return el;
};

/* ── Selector helper ── */
function gs(el){
  if(!el||!el.tagName)return'';
  if(el.id)return'#'+el.id;
  if(el.dataset&&el.dataset.testid)return'[data-testid="'+el.dataset.testid+'"]';
  var nm=el.getAttribute&&el.getAttribute('name');
  if(nm)return el.tagName.toLowerCase()+'[name="'+nm+'"]';
  var al=el.getAttribute&&el.getAttribute('aria-label');
  if(al)return'[aria-label="'+al+'"]';
  if(el.classList&&el.classList.length){
    var cls=Array.from(el.classList).filter(function(c){return c&&c.indexOf(':')===-1&&c.length<30}).slice(0,2);
    if(cls.length)return el.tagName.toLowerCase()+'.'+cls.join('.');
  }
  return el.tagName.toLowerCase();
}
function gt(el){
  if(!el)return'';
  var t=el.getAttribute&&(el.getAttribute('aria-label')||el.getAttribute('title')||el.getAttribute('alt'));
  if(t)return t.slice(0,40);
  var tc=(el.innerText||el.textContent||'').replace(/\\s+/g,' ').trim();
  return tc.slice(0,40);
}

/* ── Send actions to recorder shell ── */
function send(a){sendMessage({type:'CODERAIL_ACTION',action:a})}

document.addEventListener('click',function(e){
  var el=e.target;if(!el||!el.tagName)return;
  var tag=el.tagName.toUpperCase();
  if(tag==='INPUT'||tag==='TEXTAREA'||tag==='SELECT')return;
  send({id:nextActionId(),type:'click',timestamp:Date.now(),selector:gs(el),tagName:tag,text:gt(el)});
},true);

document.addEventListener('change',function(e){
  var el=e.target;if(!el)return;var tag=el.tagName.toUpperCase();
  if(tag==='INPUT'||tag==='TEXTAREA'){
    send({id:nextActionId(),type:'fill',timestamp:Date.now(),selector:gs(el),value:el.value,tagName:tag,placeholder:el.placeholder||''});
  }else if(tag==='SELECT'){
    send({id:nextActionId(),type:'select',timestamp:Date.now(),selector:gs(el),value:el.value,tagName:tag});
  }
},true);

/* visual hover feedback */
var sty=document.createElement('style');
sty.textContent='*:hover{outline:2px solid rgba(59,130,246,0.35)!important;outline-offset:2px!important}';
document.head.appendChild(sty);

sendMessage({type:'CODERAIL_CONNECTED'});
})()</script>`;
}
