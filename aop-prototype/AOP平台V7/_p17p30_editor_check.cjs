const { spawn } = require('child_process');
const path = require('path');
const http = require('http');
const edge = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const file = 'file:///C:/Users/admin/week_xingzheng/aop-prototype/AOP%E5%B9%B3%E5%8F%B0V7/aop-full.html';
const userDir = path.join(process.cwd(), '_edge_p17p30_editor');
const port = 9357;
const child = spawn(edge, ['--headless=new','--disable-gpu','--no-first-run','--no-default-browser-check','--allow-file-access-from-files','--disable-extensions',`--remote-debugging-port=${port}`,`--user-data-dir=${userDir}`,file], {stdio:'ignore'});
function getJson(url){return new Promise((res,rej)=>{http.get(url,r=>{let d='';r.on('data',c=>d+=c);r.on('end',()=>res(JSON.parse(d)));}).on('error',rej);});}
async function waitFor(fn,timeout=20000){const t=Date.now();while(Date.now()-t<timeout){try{const v=await fn();if(v)return v;}catch(e){}await new Promise(r=>setTimeout(r,300));}throw new Error('timeout');}
(async()=>{
  const pages=await waitFor(async()=>{const l=await getJson(`http://127.0.0.1:${port}/json`);return l&&l.length?l:null;});
  const page=pages.find(p=>p.type==='page')||pages[0];
  const ws=new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((res,rej)=>{ws.onopen=res;ws.onerror=rej;});
  let seq=0;const pending=new Map();const logs=[];
  ws.onmessage=ev=>{const m=JSON.parse(ev.data);if(m.method==='Runtime.exceptionThrown')logs.push('EX: '+(m.params.exceptionDetails.exception&&m.params.exceptionDetails.exception.description||m.params.exceptionDetails.text));if(m.method==='Runtime.consoleAPICalled')logs.push('CONSOLE: '+m.params.args.map(a=>a.value||a.description||'').join(' '));if(m.id&&pending.has(m.id)){pending.get(m.id)(m);pending.delete(m.id);}};
  function send(method,params={}){return new Promise(res=>{const id=++seq;pending.set(id,res);ws.send(JSON.stringify({id,method,params}));});}
  async function ev(expression){const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.result&&r.result.exceptionDetails)throw new Error(JSON.stringify(r.result.exceptionDetails));return r.result&&r.result.result?r.result.result.value:undefined;}
  await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});
  await waitFor(async()=>await ev("typeof switchPanel === 'function'"));
  await ev("switchPanel('p17')");
  await waitFor(async()=>await ev("document.querySelectorAll('#p17List .p17-item').length")>0);
  const p17=await ev(`(()=>{
    document.querySelector('#p17 .p17-bar-new').click();
    const ov=document.getElementById('policyEditorOverlay');
    const html=ov?ov.innerHTML:'';
    const text=ov?ov.innerText:'';
    const cat=document.getElementById('polEditCat');
    const catHtml=cat?cat.outerHTML:'';
    const opts=cat?[...cat.options].map(o=>({v:o.value,t:o.textContent})):null;
    if(ov) closePolicyEditor();
    return {exists:!!ov,text:text.slice(0,600),html:html.slice(0,800),catHtml:catHtml.slice(0,800),opts};
  })()`);
  await ev("switchPanel('p30')");
  await waitFor(async()=>await ev("document.querySelectorAll('#p30List .p17-item').length")>0);
  const p30=await ev(`(()=>{
    document.querySelector('#p30 .p17-bar-new').click();
    const ov=document.getElementById('policyEditorOverlay');
    const text=ov?ov.innerText:'';
    const cat=document.getElementById('polEditCat');
    const opts=cat?[...cat.options].map(o=>({v:o.value,t:o.textContent})):null;
    if(ov) closePolicyEditor();
    return {exists:!!ov,text:text.slice(0,600),opts};
  })()`);
  console.log(JSON.stringify({p17,p30,logs},null,2));
  ws.close();child.kill();process.exit(0);
})().catch(e=>{console.error('ERR',e&&e.message?e.message:e);child.kill();process.exit(1);});