(function(){
 const CFG=Object.assign({MOCK:true,API_BASE:""},window.APP_CONFIG||{});
 const MOCK=CFG.MOCK||!CFG.API_BASE;
 const $=id=>document.getElementById(id);
 const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
 const safeUrl=u=>/^https:\/\//.test(u||"")?u:"javascript:void(0)";
 const thDate=d=>d?new Date(d+"T00:00:00").toLocaleDateString("th-TH",{day:"numeric",month:"short",year:"2-digit"}):"";
 const now=()=>new Date().toLocaleString("th-TH",{dateStyle:"medium",timeStyle:"short"});
 const DICT=window.MOCK_DICT||[],IDX=window.MOCK_INDEX||[];
 const name=id=>(DICT.find(d=>d.id===id)||{}).canonical||id;
 const TYPE={countries:"ประเทศ",persons:"บุคคล",orgs:"องค์กร",places:"สถานที่"};
 const ENT=Object.keys(TYPE);
 let ready=true;

 async function api(action,params={}){
  if(MOCK) return mockApi(action,params);
  const u=new URL(CFG.API_BASE);u.searchParams.set("action",action);
  for(const[k,v]of Object.entries(params)){if(Array.isArray(v)){if(v.length)u.searchParams.set(k,v.join(","));}else if(v)u.searchParams.set(k,v);}
  const r=await fetch(u);if(!r.ok)throw new Error("HTTP "+r.status);return r.json();
 }
 // ---- mock backend: ทำตามลำดับใน SEARCH-FIELDS ----
 function mapQ(q){ // ข้อ 2: q → รหัสผ่าน dict, คืนรหัสตามประเภท + คำที่เหลือ
  let rest=q.toLowerCase();const got={};
  DICT.forEach(d=>d.terms.concat(d.canonical).forEach(t=>{t=t.toLowerCase();if(t&&rest.includes(t)){rest=rest.split(t).join(" ");
   const k=Object.keys(TYPE).find(k=>TYPE[k]===d.type);(got[k]=got[k]||new Set()).add(d.id);}}));
  return{got,rest:rest.trim()};
 }
 function search(p){
  const q=(p.q||"").trim(),{got,rest}=mapQ(q);
  const ov=r=>!(p.dateFrom&&r.topic_date_to<p.dateFrom)&&!(p.dateTo&&r.topic_date_from>p.dateTo);
  const any=(arr,sel)=>!sel.length||sel.some(x=>arr.includes(x));
  const base=r=>ov(r)&&ENT.every(k=>any(r[k],p[k]||[]))&&any(r.source_groups,p.groups||[])
   &&(!p.category||r.category===p.category)&&(!p.status||r.status===p.status)
   &&(!p.thread_id||r.thread_id.toLowerCase()===p.thread_id.toLowerCase())
   &&(!p.sender||r.source_senders.some(s=>s.includes(p.sender)))
   &&(!p.hasAttachment||r.attachments.length)&&(!p.ocrOnly||r.ocr_used);
  const viaQ=r=>Object.entries(got).every(([k,s])=>[...s].some(x=>r[k].includes(x)));
  const textHit=(r,s)=>{const h=[r.title,r.summary,...(r.keywords||[])].join(" ").toLowerCase();return s.split(/\s+/).filter(Boolean).every(w=>h.includes(w));};
  let items,fallback=false;
  const mapped=Object.keys(got).length>0;
  if(!q) items=IDX.filter(base);
  else if(mapped){items=IDX.filter(r=>base(r)&&viaQ(r));if(!items.length&&rest){items=IDX.filter(r=>base(r)&&textHit(r,rest));fallback=true;}}
  else {items=IDX.filter(r=>base(r)&&textHit(r,q));fallback=true;}
  items.sort((a,b)=>b.topic_date_to.localeCompare(a.topic_date_to));
  return{items:items.slice(0,50),fallback,mapped:Object.values(got).flatMap(s=>[...s])};
 }
 // getItem: ดึงตามตัวชี้ใน index (txt_url / attachment_ids) — mock คืนข้อความจำลอง
 function getItem(id){const r=IDX.find(x=>x.txt_id===id);if(!r)return{ok:false,error:"ไม่พบรายการ"};
  return{ok:true,txt_id:r.txt_id,txt_url:r.txt_url,attachment_ids:r.attachment_ids,attachment_urls:r.attachment_ids.map(x=>"mock://att/"+x),
   text:`[เนื้อหาจำลองจาก ${r.txt_id}.txt]\n${r.title}\n\n${r.summary}\n\nผู้ส่ง: ${r.source_senders.join(", ")} · กลุ่ม: ${r.source_groups.join(", ")}\n(ข้อความต้นฉบับจริงจะดึงผ่าน backend action=getItem)`,
   attachments:(r.attachment_ids||[]).map((aid,i)=>({id:aid,name:(r.attachments[i]||{}).name||aid}))};}
 // mock ถัง: MOCK_INBOX={remaining, scenario: ok|timeout|error}
 // สัญญา API (ลีน่าล็อก 2 พ.ย. 69): ไม่มี action = inboxStatus · error = {ok:false,action,error} ไม่มี secret
 let cycleRuns=0;
 function mockApi(action,p){action=action||(p&&p.q?"searchIndex":"inboxStatus"); // มี q ไม่มี action = searchIndex
 return new Promise(res=>setTimeout(()=>{
  const ib=window.MOCK_INBOX,st=()=>({inboxEmpty:ib.remaining===0,remaining:ib.remaining});
  if(action==="inboxStatus")res({ok:true,action,...st(),rows:ib.remaining,files:ib.remaining*2});
  else if(action==="runInboxCycle"){cycleRuns++; // จัดอย่างเดียว · หน้าเว็บไม่เรียก continue
   if(ib.scenario==="error"){res({ok:false,action,error:"Gemini ตอบไม่ทัน (จำลอง)"});return;}
   const done=ib.scenario==="timeout"&&cycleRuns===1?2:ib.remaining;ib.remaining-=done;
   res({ok:true,action,...st(),runId:"RUN-MOCK-"+cycleRuns,txtCreated:done,filesMoved:done*2,filesTrashed:0});}
  else if(action==="searchIndex"){if(ib.remaining>0){res({ok:false,action,error:"ถังยังไม่ว่าง — เรียก runInboxCycle ก่อน"});return;}
   const r=search(p),f=r.items.length>0;
   res({ok:true,action,inboxEmpty:true,remaining:0,query:p.q||"",found:f,
    answer:f?`พบ ${r.items.length} เรื่องที่เกี่ยวข้องใน index (จำลอง)`:"ไม่พบในคลัง",
    refs:r.items.map(x=>({txt_id:x.txt_id,title:x.title,summary:x.summary,topic_date_from:x.topic_date_from,topic_date_to:x.topic_date_to,
     category:x.category||"",status:x.status||"",thread_id:x.thread_id||"",source_groups:x.source_groups||[],source_senders:x.source_senders||[],
     keywords:x.keywords||[],txt_url:x.txt_url,has_attachment:(x.attachments||[]).length>0,ocr_used:!!x.ocr_used})), // แนว A (ลีน่าล็อก ~07:47)
    resultText:"(mock) ผลค้นรวม",resultUrl:"",resultFileId:"",resultName:"mock-result.txt",
    _mapped:r.mapped,_fallback:r.fallback});} // ค้นจากแถว index เท่านั้น ไม่เปิดไฟล์
  else if(action==="getItem")res({action,...getItem(p.txt_id)});
  else res({ok:false,action,error:"unknown action"});},action==="runInboxCycle"?2500:200));}

 // ---- สถานะถัง (OPS: เมื่อถังค้าง ข้อ 3) ----
 const POLL_MS=MOCK?2000:20000;let pollT=null,cycling=false,queued=false;
 function setState(kind,text,showSort){ready=kind==="ok";const el=$("status");
  el.className="status "+(kind==="ok"?"ok":kind==="err"?"err":"busy");$("statusText").textContent=text;
  $("btnSort").hidden=!showSort;
  $("btnSearch").textContent=ready?"ค้นหา":(queued?"รับคำค้นแล้ว — จัดเสร็จจะค้นให้":"ค้นหา (จัดถังเสร็จจะค้นให้)");
  $("btnSearch").classList.toggle("wait",!ready);
  $("warn").hidden=ready;$("warn").textContent=kind==="err"?"จัดถังไม่สำเร็จ — แจ้งผู้ดูแลเพื่อจัดซ้ำ ระบบยังตรวจต่อ จัดว่างแล้วจะค้นให้":"admin bot กำลังจัดถังให้ว่าง (ตามวงรอบ หรือถูกปลุกจากหน้าค้น) — พิมพ์/กดค้นไว้ได้ ถังว่างแล้ว bot แจ้ง ระบบค้นให้ทันที";
  if(ready&&queued){queued=false;doSearch();}}
 function schedulePoll(){clearTimeout(pollT);pollT=setTimeout(refresh,POLL_MS);}
 async function runCycle(){if(cycling)return;cycling=true;
  try{const r=await api("runInboxCycle");
   if(!r.ok){setState("err",`จัดถังไม่สำเร็จ — แจ้งผู้ดูแล (${r.error||"ไม่ทราบสาเหตุ"})`,true);schedulePoll();return;}
   if(r.inboxEmpty){setState("ok","ถังว่างแล้ว (admin bot แจ้ง) — ฐานอัปเดตแล้ว พร้อมค้น",false);return;}
   setState("busy",`กำลังปลุก admin bot จัดถังให้ว่าง (ค้าง ${r.remaining}) — จัดรอบต่อไป จัดเสร็จจะค้นให้`,false);schedulePoll();
  }catch(e){setState("err","จัดถังไม่สำเร็จ — แจ้งผู้ดูแล",true);schedulePoll();}
  finally{cycling=false;}}
 let triggered=false;
 async function refresh(){
  try{const s=await api("inboxStatus");
   if(s.inboxEmpty){clearTimeout(pollT);triggered=false;setState("ok","ถังว่างแล้ว (admin bot แจ้ง) — ฐานอัปเดตแล้ว พร้อมค้น",false);return true;}
   if($("status").classList.contains("err")){schedulePoll();return false;} // คงสถานะ error จนผู้ดูแลจัดซ้ำ/ถังว่าง
   if(!cycling)setState("busy",`ถังยังไม่ว่าง — ปลุก admin bot จัดให้ว่าง (ค้าง ${s.remaining}) — จัดเสร็จจะค้นให้`,false);
   if(!cycling)runCycle();else schedulePoll(); // ยังค้าง → ปลุก runInboxCycle รอบใหม่
   return false;
  }catch(e){setState("err","ตรวจสถานะถังไม่ได้ — แจ้งผู้ดูแล",true);schedulePoll();return false;}}

 // ---- ชิป ----
 const sel={countries:new Set(),persons:new Set(),orgs:new Set(),places:new Set(),groups:new Set()};
 function chip(box,key,val,label){const b=document.createElement("button");b.type="button";b.className="chip";b.textContent=label;b.setAttribute("aria-pressed","false");b.dataset.val=val;
  b.onclick=()=>{const on=!sel[key].has(val);on?sel[key].add(val):sel[key].delete(val);b.setAttribute("aria-pressed",on);};box.appendChild(b);}
 document.querySelectorAll(".ent").forEach(el=>{const k=el.dataset.type,box=el.querySelector(".chips");
  if(k==="groups")[...new Set(IDX.flatMap(r=>r.source_groups))].forEach(g=>chip(box,k,g,g));
  else DICT.filter(d=>d.type===TYPE[k]).forEach(d=>chip(box,k,d.id,d.canonical));});
 (window.MOCK_CATEGORIES||[]).forEach(c=>$("cat").add(new Option(c,c)));
 [...new Set(IDX.map(r=>r.thread_id))].sort().forEach(t=>$("threadList").append(new Option(t)));
 [...new Set(IDX.flatMap(r=>r.source_senders))].forEach(t=>$("senderList").append(new Option(t)));

 // ---- ช่วงวัน: สไลด์ภายในปีเดียว (ทางเลือก) | ปฏิทินข้ามปี ----
 const DAY=864e5,iso=t=>new Date(t).toISOString().slice(0,10);
 const ds=IDX.flatMap(r=>[r.topic_date_from,r.topic_date_to]).sort();
 const years=[...new Set(ds.map(d=>d.slice(0,4)))].sort().reverse();if(!years.length)years.push(String(new Date().getFullYear()));
 years.forEach(y=>$("yearSel").add(new Option("พ.ศ. "+(+y+543)+" ("+y+")",y)));
 const rf=$("rFrom"),rt=$("rTo");let t0,N;const dayIso=i=>iso(t0+i*DAY);
 function setYear(y){t0=Date.parse(y+"-01-01T00:00:00Z");N=Math.round((Date.parse((+y+1)+"-01-01T00:00:00Z")-t0)/DAY)-1;
  [rf,rt].forEach(r=>{r.min=0;r.max=N;r.step=1;});rf.value=0;rt.value=N;
  $("minLbl").textContent=thDate(dayIso(0));$("maxLbl").textContent=thDate(dayIso(N));syncRange();}
 function syncRange(e){let a=+rf.value,b=+rt.value;
  if(a>b){if(e&&e.target===rf)rf.value=a=b;else rt.value=b=a;}
  $("lblFrom").textContent=thDate(dayIso(a));$("lblTo").textContent=thDate(dayIso(b));
  $("fill").style.left=a/N*100+"%";$("fill").style.right=(100-b/N*100)+"%";rf.style.zIndex=a>=N?3:2;}
 rf.oninput=rt.oninput=syncRange;
 $("yearSel").onchange=()=>setYear($("yearSel").value);
 $("rReset").onclick=()=>{rf.value=0;rt.value=N;syncRange();};
 const mode=()=>document.querySelector("input[name=dmode]:checked").value;
 function setMode(m){$("modeYear").hidden=m!=="year";$("modeCal").hidden=m!=="cal";}
 document.querySelectorAll("input[name=dmode]").forEach(r=>r.onchange=()=>setMode(mode()));
 setYear(years[0]);
 function dateRange(){ // backend ยังรับ dateFrom/dateTo เหมือนเดิม
  if(mode()==="cal"){let a=$("dFrom").value,b=$("dTo").value;if(a&&b&&a>b)[a,b]=[b,a];return{dateFrom:a,dateTo:b};}
  return{dateFrom:dayIso(+rf.value),dateTo:dayIso(+rt.value)};}

 function params(){return{q:$("q").value,...dateRange(),
  countries:[...sel.countries],persons:[...sel.persons],orgs:[...sel.orgs],places:[...sel.places],groups:[...sel.groups],
  category:$("cat").value,status:$("storyStatus").value,thread_id:$("thread").value.trim(),sender:$("sender").value.trim(),
  hasAttachment:$("hasAtt").checked?"1":"",ocrOnly:$("ocrOnly").checked?"1":""};}

 function render(res){ // เรนเดอร์จาก refs ล้วน — ไม่เรียก getItem ตอนลิสต์
  const items=res.found===false?[]:(res.refs||[]);res.mapped=res._mapped;res.fallback=res._fallback;
  let m=`รายการจาก index ${items.length} เรื่อง (ยังไม่เปิดไฟล์ — กด「รายละเอียด」เพื่อดึงเนื้อหา) · ค้นเมื่อ ${now()}`;
  if(res.mapped&&res.mapped.length)m+=` · คำค้นแมปเป็น: ${res.mapped.map(name).join(", ")}`;
  if(res.fallback&&items.length)m+=" · ค้นจากข้อความ (ชื่อเรื่อง/สรุป)";
  $("meta").textContent=m;
  if(res.answer)m+=` · ${res.answer}`;$("meta").textContent=m;
  if(res.found===false||!items.length){$("results").innerHTML=`<div class="empty">ไม่พบในคลัง ณ ${esc(now())}</div>`;return;}
  const A=v=>Array.isArray(v)?v:(v?String(v).split(","):[]);
  $("results").innerHTML=items.map(r=>`<article class="item"><h3>${esc(r.title)}</h3>
   <div class="info">${esc(thDate(r.topic_date_from))}${r.topic_date_to&&r.topic_date_to!==r.topic_date_from?" – "+esc(thDate(r.topic_date_to)):""} · ${esc(r.txt_id)}${r.thread_id?" · "+esc(r.thread_id):""}</div>
   <p>${esc(r.summary)}</p>
   <div class="tags">${r.status?`<span class="st">${esc(r.status)}</span>`:""}${r.ocr_used?'<span class="ocr">OCR</span>':""}${r.category?`<span>${esc(r.category)}</span>`:""}${A(r.keywords).map(k=>`<span class="ent-tag">${esc(k)}</span>`).join("")}</div>
   <div class="info">แหล่ง: ${esc(A(r.source_groups).join(", "))}${A(r.source_senders).length?" · ผู้ส่ง: "+esc(A(r.source_senders).join(", ")):""}${r.has_attachment?" · มีไฟล์แนบ":""}</div>
   <div class="links"><button type="button" class="btn-detail" data-id="${esc(r.txt_id)}">แสดงรายละเอียด</button></div><div class="detail" hidden></div></article>`).join("");
 }
 // แผงรายละเอียด: รองรับทั้ง mock แบน และ live {ok,action,item:{…}} (สัญญา AI-Admin)
 function normalizeGetItem(d){
  const it=d.item||d, ids=it.attachment_ids||[], urls=it.attachment_urls||[];
  let atts=it.attachments;
  if(!atts) atts=ids.map((id,i)=>({id,name:id,url:urls[i]||""}));
  else atts=atts.map((a,i)=>typeof a==="string"?{id:a,name:a,url:urls[i]||""}:{id:a.id||ids[i]||"",name:a.name||a.id||ids[i]||"",url:a.url||urls[i]||""});
  const text=it.text!=null?String(it.text):[it.title,it.summary].filter(Boolean).join("\n\n");
  return{ok:!!d.ok,txt_id:it.txt_id||"",txt_url:it.txt_url||"",text:text||"(API ไม่ฝังเนื้อหาเต็ม — เปิดลิงก์ต้นฉบับด้านล่าง)",attachments:atts,hasBody:it.text!=null};
 }
 $("results").addEventListener("click",async e=>{const b=e.target.closest(".btn-detail");if(!b)return;
  const box=b.closest(".item").querySelector(".detail");if(!box.hidden){box.hidden=true;b.textContent="แสดงรายละเอียด";return;}
  box.hidden=false;b.textContent="ซ่อนรายละเอียด";box.innerHTML='<div class="dmeta">กำลังดึงตามตัวชี้ใน index…</div>';
  try{const raw=await api("getItem",{txt_id:b.dataset.id});if(!raw.ok)throw new Error(raw.error||"ไม่สำเร็จ");
   const d=normalizeGetItem(raw);
   const attMeta=d.attachments.length?` · แนบ ${d.attachments.length} ไฟล์`:"";
   const txtLink=d.txt_url?` <a href="${esc(safeUrl(d.txt_url))}" target="_blank" rel="noopener">เปิด .txt</a>`:"";
   box.innerHTML=`<div class="dmeta"><code>${esc(d.txt_id)}</code>${txtLink}${attMeta}${d.hasBody?"":' <span class="lockbadge">เนื้อหาเต็มอยู่บน Drive (ยังไม่แชร์ 90)</span>'}</div>
    <pre class="dtext">${esc(d.text)}</pre>
    <div class="dl">${d.hasBody?`<button type="button" class="btn-sm dl-txt">ดาวน์โหลด .txt</button>`:""}${d.attachments.map(a=>a.url?`<a class="btn-sm" href="${esc(safeUrl(a.url))}" target="_blank" rel="noopener">แนบ: ${esc(a.name||a.id)}</a>`:`<button type="button" class="btn-lock" disabled>แนบ: ${esc(a.name||a.id)}</button>`).join("")}</div>`;
   const dl=box.querySelector(".dl-txt");if(dl)dl.onclick=()=>{const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([d.text],{type:"text/plain"}));a.download=(d.txt_id||"item")+".txt";a.click();};
  }catch(err){box.innerHTML='<div class="dmeta">ดึงรายละเอียดไม่สำเร็จ — '+esc(err&&err.message||"โปรดลองใหม่")+'</div>';}});
 async function doSearch(){$("meta").textContent="กำลังค้น…";
  try{const r=await api("searchIndex",params());if(!r.ok){queued=true;$("meta").textContent="รับคำค้นแล้ว — ถังยังไม่ว่าง กำลังปลุก admin bot จัดเสร็จจะค้นให้";ready=false;refresh();return;}render(r);}catch(err){$("meta").textContent="ค้นไม่สำเร็จ — โปรดลองใหม่ภายหลัง";}}
 $("form").addEventListener("submit",async e=>{e.preventDefault();
  if(ready&&await refresh()){doSearch();return;}
  queued=true;$("meta").textContent="รับคำค้นแล้ว — กำลังปลุก admin bot จัดถังให้ว่าง จัดเสร็จจะค้นให้อัตโนมัติ";
  $("btnSearch").textContent="รับคำค้นแล้ว — จัดเสร็จจะค้นให้";if(!ready)return;refresh();});
 $("btnClear").onclick=()=>{$("form").reset();Object.values(sel).forEach(s=>s.clear());document.querySelectorAll(".chip").forEach(c=>c.setAttribute("aria-pressed","false"));setYear(years[0]);setMode("year");};
 $("btnSort").onclick=async()=>{if(MOCK&&window.MOCK_INBOX.scenario==="error")window.MOCK_INBOX.scenario="ok";
  setState("busy","ผู้ดูแลสั่งจัดถัง — กำลังจัดให้ว่าง…",false);triggered=true;await runCycle();};
 if(MOCK){$("mockTag").hidden=false;const b=new URLSearchParams(location.search).get("busy");
  if(b)window.MOCK_INBOX={remaining:3,scenario:b==="timeout"?"timeout":b==="error"?"error":"ok"};}
 // พรีวิว: ?dmode=cal&from=YYYY-MM-DD&to=… | ?year=YYYY&f=วันที่ในปี&t=… | &run=1 ค้นทันที
 {const u=new URLSearchParams(location.search);
  if(u.get("dmode")==="cal"){document.querySelector("input[name=dmode][value=cal]").checked=true;setMode("cal");$("dFrom").value=u.get("from")||"";$("dTo").value=u.get("to")||"";}
  else if(u.get("year")){$("yearSel").value=u.get("year");setYear(u.get("year"));if(u.get("f"))rf.value=u.get("f");if(u.get("t"))rt.value=u.get("t");syncRange();}
  if(u.get("run"))setTimeout(()=>$("form").requestSubmit(),400);}
 refresh();
})();
