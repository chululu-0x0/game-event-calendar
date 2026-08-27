const APP_VERSION="v21";
const FETCH_WIKI_EVENTS_ENDPOINT="https://vdcnicyobhnqwqswsspw.supabase.co/functions/v1/fetch-wiki-events";
const now=()=>new Date();
const today=now();

const GAME_DEFS=[
  {id:"genshin",game:"原神",icon:"✦",color:"blue"},
  {id:"starrail",game:"スターレイル",icon:"🎫",color:"purple"},
  {id:"zzz",game:"ゼンゼロ",icon:"📺",color:"pink"}
];

const STORAGE_EVENTS="game-event-calendar.events.v20";
const STORAGE_SOURCES="game-event-calendar.sources.v20";

function emptyEventData(){
  return GAME_DEFS.map(g=>({...g,events:[]}));
}

function loadEventData(){
  try{
    const saved=JSON.parse(localStorage.getItem(STORAGE_EVENTS)||"null");
    if(!Array.isArray(saved)) return emptyEventData();
    return GAME_DEFS.map(def=>{
      const found=saved.find(x=>x && (x.id===def.id || x.game===def.game));
      return {...def,events:Array.isArray(found?.events)?found.events:[]};
    });
  }catch{
    return emptyEventData();
  }
}

function saveEventData(){
  localStorage.setItem(STORAGE_EVENTS,JSON.stringify(eventData));
}

let eventData=loadEventData();

const PIXEL_FRAME_SRC=i=>`assets/ui/frames/minidot-8-${i}.png`;

function tileImgs(i,count){
  return Array.from({length:count},()=>`<img src="${PIXEL_FRAME_SRC(i)}" alt="" class="pixel-tile-img">`).join("");
}

function pixelFrameMarkup(html,size=16,extraClass=""){
  const hCount=48;
  const vCount=size===32?40:72;
  return `<table class="pixel-frame-table ${size===32?"pixel-size-32":"pixel-size-16"} ${extraClass}" role="presentation">
    <tbody>
      <tr>
        <td class="pf-corner"><img src="${PIXEL_FRAME_SRC(1)}" alt="" class="pixel-tile-img"></td>
        <td class="pf-edge-x"><div class="pf-strip-x">${tileImgs(2,hCount)}</div></td>
        <td class="pf-corner"><img src="${PIXEL_FRAME_SRC(3)}" alt="" class="pixel-tile-img"></td>
      </tr>
      <tr>
        <td class="pf-edge-y"><div class="pf-strip-y">${tileImgs(4,vCount)}</div></td>
        <td class="pf-center"><div class="pf-content">${html}</div></td>
        <td class="pf-edge-y"><div class="pf-strip-y">${tileImgs(6,vCount)}</div></td>
      </tr>
      <tr>
        <td class="pf-corner"><img src="${PIXEL_FRAME_SRC(7)}" alt="" class="pixel-tile-img"></td>
        <td class="pf-edge-x"><div class="pf-strip-x">${tileImgs(8,hCount)}</div></td>
        <td class="pf-corner"><img src="${PIXEL_FRAME_SRC(9)}" alt="" class="pixel-tile-img"></td>
      </tr>
    </tbody>
  </table>`;
}

function upgradeStaticFrames(){
  document.querySelectorAll(".frame9").forEach(frame=>{
    const oldCenter=frame.querySelector(":scope > .frame9-grid > .f5");
    if(!oldCenter)return;
    const html=oldCenter.innerHTML;
    const size=frame.classList.contains("detail-panel")?32:16;
    frame.innerHTML=pixelFrameMarkup(html,size);
  });
}

function upgradeTopTabTables(){
  document.querySelectorAll(".tab-frame-img-table").forEach(table=>{
    table.classList.add("pixel-frame-table","pixel-size-16","top-pixel-table");
    table.querySelectorAll("img").forEach(img=>{
      const m=img.src.match(/minidot-8-([1-9])\.png/);
      if(m) img.classList.add("pixel-tile-img");
    });
  });
}

upgradeStaticFrames();
upgradeTopTabTables();

const $=s=>document.querySelector(s), $$=s=>document.querySelectorAll(s);
const screens={ongoing:$("#screen-ongoing"),calendar:$("#screen-calendar"),favorites:$("#screen-favorites"),settings:$("#screen-settings")};
const ongoingList=$("#ongoingList"),todayLabel=$("#todayLabel"),contentScroll=$("#contentScroll");
const calendarHeader=$("#calendarHeader"),calendarBody=$("#calendarBody"),calendarGameRows=$("#calendarGameRows"),todayLine=$("#todayLine"),calendarHeaderScroll=$("#calendarHeaderScroll"),calendarBodyScroll=$("#calendarBodyScroll");
const detailSheet=$("#detailSheet"),detailOverlay=$("#detailOverlay"),detailTitle=$("#detailTitle"),detailGame=$("#detailGame"),detailRemain=$("#detailRemain"),detailDate=$("#detailDate"),detailType=$("#detailType"),detailReward=$("#detailReward"),detailRelated=$("#detailRelated"),detailMemo=$("#detailMemo"),detailSource=$("#detailSource");

const toDate=s=>(s==null||s==="")?new Date(NaN):new Date(s);
function formatTodayLabel(d){const w=["日","月","火","水","木","金","土"];return `${d.getFullYear()}/${String(d.getMonth()+1).padStart(2,"0")}/${String(d.getDate()).padStart(2,"0")}（${w[d.getDay()]}）`}
function formatRange(a,b){
  const s=toDate(a),e=toDate(b);
  if(Number.isNaN(e.getTime()))return "終了日時不明";
  const endText=`${String(e.getMonth()+1).padStart(2,"0")}/${String(e.getDate()).padStart(2,"0")} ${String(e.getHours()).padStart(2,"0")}:${String(e.getMinutes()).padStart(2,"0")}`;
  if(Number.isNaN(s.getTime()))return `開始日時不明 ～ ${endText}`;
  return `${String(s.getMonth()+1).padStart(2,"0")}/${String(s.getDate()).padStart(2,"0")} ～ ${endText}`;
}
function formatEventRange(event){
  const s=toDate(event.start),e=toDate(event.end);
  if(!Number.isNaN(s.getTime()))return formatRange(event.start,event.end);
  const startText=event.startText||"開始日時不明";
  const endText=event.endText||(!Number.isNaN(e.getTime())?`${String(e.getMonth()+1).padStart(2,"0")}/${String(e.getDate()).padStart(2,"0")} ${String(e.getHours()).padStart(2,"0")}:${String(e.getMinutes()).padStart(2,"0")}`:"終了日時不明");
  return `${startText} ～ ${endText}`;
}
function formatShortRange(a,b){const s=toDate(a),e=toDate(b);return `${s.getMonth()+1}/${s.getDate()} ～ ${e.getMonth()+1}/${e.getDate()}`}
function remain(end){const ms=toDate(end)-now(),h=Math.floor(ms/36e5),d=Math.floor(ms/864e5);if(ms<=0)return{prefix:"",big:"終了",tone:"orange"};if(h<24)return{prefix:"あと",big:`${h}時間`,tone:"orange"};if(d<2)return{prefix:"明日",big:"終了",tone:"pink"};return{prefix:"残り",big:`${d}日`,tone:d<=3?"pink":"blue"}}
function frame9(cls,html){return `<div class="frame9 ${cls}">${pixelFrameMarkup(html,16)}</div>`}

function openChipTab(label){
  return `<div class="game-chip-tab-open">
    <table class="pixel-frame-table pixel-size-16 game-tab-open-table" role="presentation">
      <tbody>
        <tr>
          <td class="pf-corner"><img src="${PIXEL_FRAME_SRC(1)}" alt="" class="pixel-tile-img"></td>
          <td class="pf-edge-x"><div class="pf-strip-x">${tileImgs(2,32)}</div></td>
          <td class="pf-corner"><img src="${PIXEL_FRAME_SRC(3)}" alt="" class="pixel-tile-img"></td>
        </tr>
        <tr>
          <td class="pf-edge-y"><div class="pf-strip-y">${tileImgs(4,12)}</div></td>
          <td class="pf-center"><div class="pf-content"></div></td>
          <td class="pf-edge-y"><div class="pf-strip-y">${tileImgs(6,12)}</div></td>
        </tr>
      </tbody>
    </table>
    <div class="game-chip-text-overlay">${label}</div>
  </div>`;
}

function renderOngoing(){
  ongoingList.innerHTML="";
  eventData.forEach(group=>{
    const section=document.createElement("section");
    section.className=`game-section ${group.color}`;
    /*
      8px素材なのでタブ幅も8px単位に丸める。
      文字数が変わっても横へ伸ばせる。
    */
    const rawTabWidth=Math.max(112,group.game.length*19+40);
    const tabWidth=Math.ceil(rawTabWidth/8)*8;

    section.style.setProperty(
      "--game-tab-w",
      `${tabWidth}px`
    );
    const tab=openChipTab(group.game);
    const card=frame9("frame-card game-card",`<div class="game-events"></div>`);
    section.innerHTML=tab+frame9("frame-chip game-shell",card);
    const eventsEl=section.querySelector(".game-events");
    if(!group.events.length){
      eventsEl.innerHTML=`<div class="event-empty">イベント未取得<br><small>右上の「更新」から取得できます</small></div>`;
    }

    group.events.slice().sort((a,b)=>new Date(a.end)-new Date(b.end)).forEach(event=>{
      const r=remain(event.end), btn=document.createElement("button");
      const p=countdownProgress(event);
      btn.type="button"; btn.className="event-row";
      const tone=r.tone==="blue"?"blue":r.tone==="orange"?"orange":"";
      btn.innerHTML=`<span class="event-icon">${group.icon}</span>
      <span class="event-main"><span class="event-title">${event.title}</span>
      <span class="progress-line"><span class="progress-mini"><span class="progress-mini-fill progress-${p.tone}" style="width:${p.pct??0}%"></span></span><span class="progress-label">${p.pct==null?"進行度 --":`進行度 ${p.pct}%`}</span></span>
      <span class="event-range">${escapeHtml(formatEventRange(event))}</span></span>
      <span class="event-remain ${tone}"><span class="remain-prefix">${r.prefix}</span><span class="remain-big">${r.big}</span></span>`;
      btn.addEventListener("click",()=>openDetail({...event,game:group.game}));
      eventsEl.appendChild(btn);
    });
    ongoingList.appendChild(section);
  });
}

function renderCalendar(){
  const dayWidth=parseInt(getComputedStyle(document.documentElement).getPropertyValue("--day-width"));
  const center=new Date(now()); center.setHours(0,0,0,0);
  const allEvents=eventData.flatMap(g=>g.events);
  const starts=allEvents.map(e=>toDate(e.start)).filter(d=>!Number.isNaN(d.getTime()));
  const ends=allEvents.map(e=>toDate(e.end)).filter(d=>!Number.isNaN(d.getTime()));
  const startDate=new Date(starts.length?Math.min(center,...starts):center);
  const endDate=new Date(ends.length?Math.max(new Date(center).setDate(center.getDate()+21),...ends):new Date(center).setDate(center.getDate()+21));
  startDate.setDate(startDate.getDate()-3); startDate.setHours(0,0,0,0);
  endDate.setDate(endDate.getDate()+3); endDate.setHours(0,0,0,0);
  const days=[];
  for(let d=new Date(startDate);d<=endDate;d.setDate(d.getDate()+1))days.push(new Date(d));
  calendarHeader.innerHTML="";calendarBody.innerHTML="";calendarGameRows.innerHTML="";calendarGameRows.style.setProperty("--game-count",eventData.length);calendarBody.style.setProperty("--game-count",eventData.length);
  days.forEach(d=>{const c=document.createElement("div"),is=d.toDateString()===now().toDateString();c.className=`day-cell ${is?"today":""}`;c.innerHTML=`<span class="day-month">${d.getMonth()+1}月</span><span>${d.getDate()}</span>`;calendarHeader.appendChild(c)});
  calendarBody.style.width=`${days.length*dayWidth}px`;calendarBody.dataset.startDate=startDate.toISOString();
  eventData.forEach(group=>{
    const left=document.createElement("div");left.className="calendar-game-cell";left.innerHTML=`<span class="calendar-game-icon">${group.icon}</span><span class="calendar-game-name">${group.game}</span>`;calendarGameRows.appendChild(left);
    const row=document.createElement("div");row.className="calendar-row";
    let visibleIndex=0;
    group.events.forEach((event)=>{
      const s=toDate(event.start),e=toDate(event.end);
      if(Number.isNaN(s.getTime())||Number.isNaN(e.getTime()))return;
      const so=Math.floor((s-startDate)/864e5),eo=Math.ceil((e-startDate)/864e5),bar=document.createElement("button");
      bar.className=`event-bar ${group.color}`;bar.style.left=`${Math.max(0,so*dayWidth+5)}px`;bar.style.top=`${13+visibleIndex*48}px`;bar.style.width=`${Math.max(dayWidth*1.5,(eo-so+1)*dayWidth-10)}px`;bar.innerHTML=`<span>${group.icon}</span><span class="event-bar-title"><span>${event.title}</span><small>${formatShortRange(event.start,event.end)}</small></span>`;bar.addEventListener("click",()=>openDetail({...event,game:group.game}));row.appendChild(bar);visibleIndex++;
    });
    calendarBody.appendChild(row);
  });
  const off=Math.floor((new Date(now()).setHours(0,0,0,0)-startDate)/864e5);todayLine.style.left=`${off*dayWidth+dayWidth/2}px`;requestAnimationFrame(()=>todayLine.style.height=`${calendarBody.offsetHeight}px`);
}
function jumpToToday(){
  const w=parseInt(getComputedStyle(document.documentElement).getPropertyValue("--day-width"));
  const first=calendarHeader.querySelector(".day-cell");
  if(!first)return;
  const startText=calendarBody.dataset.startDate;
  const s=startText?new Date(startText):new Date(now());
  const o=Math.floor((new Date(now()).setHours(0,0,0,0)-s)/864e5);
  const x=o*w-calendarBodyScroll.clientWidth/2+w/2;
  calendarBodyScroll.scrollTo({left:Math.max(0,x),behavior:"smooth"});
}
function openDetail(event){
  const r=remain(event.end);
  detailGame.textContent=event.game;detailTitle.textContent=event.title;detailRemain.textContent=r.prefix?`${r.prefix} ${r.big}`:r.big;
  detailDate.textContent=formatEventRange(event);
  detailType.textContent=event.type||"情報なし";
  detailReward.textContent=event.limitedReward||"情報なし";
  detailRelated.textContent=event.related||"関連イベントなし";detailMemo.textContent=event.memo||"メモはありません。";
  detailSource.href=event.source||event.sourceUrl||"#";detailOverlay.classList.add("open");detailSheet.classList.add("open");detailSheet.setAttribute("aria-hidden","false");
}
function closeDetail(){detailOverlay.classList.remove("open");detailSheet.classList.remove("open");detailSheet.setAttribute("aria-hidden","true")}
function setScreen(name){Object.entries(screens).forEach(([k,e])=>e.classList.toggle("active",k===name));$$(".top-tab,.bottom-nav-btn").forEach(b=>b.classList.toggle("active",b.dataset.screen===name));contentScroll.scrollTop=0;if(name==="calendar"){renderCalendar();requestAnimationFrame(jumpToToday)}}
function syncCalendar(){let lock=false;calendarBodyScroll.addEventListener("scroll",()=>{if(lock)return;lock=true;calendarHeaderScroll.scrollLeft=calendarBodyScroll.scrollLeft;lock=false});calendarHeaderScroll.addEventListener("scroll",()=>{if(lock)return;lock=true;calendarBodyScroll.scrollLeft=calendarHeaderScroll.scrollLeft;lock=false})}

todayLabel.textContent=formatTodayLabel(now());renderOngoing();renderCalendar();syncCalendar();
$$(".top-tab,.bottom-nav-btn").forEach(b=>b.addEventListener("click",()=>setScreen(b.dataset.screen)));
$("#refreshMockBtn").addEventListener("click",openFetchSheet);$("#closeDetailBtn").addEventListener("click",closeDetail);$("#closeDetailBtnBottom").addEventListener("click",closeDetail);detailOverlay.addEventListener("click",closeDetail);setScreen("ongoing");




/* =========================================================
   v20: live date / URL import / accordion selector
   ========================================================= */

function countdownProgress(event){
  const start=toDate(event.start);
  const end=toDate(event.end);
  const current=now();
  if(Number.isNaN(end.getTime())) return {pct:null,tone:"low"};
  if(Number.isNaN(start.getTime())) return {pct:null,tone:"high"};
  const total=end-start;
  if(!Number.isFinite(total) || total<=0) return {pct:null,tone:"low"};
  let ratio=(end-current)/total;
  if(current<start) ratio=1;
  ratio=Math.max(0,Math.min(1,ratio));
  return {
    pct:Math.round(ratio*100),
    tone:ratio>0.66?"high":ratio>0.33?"mid":"low"
  };
}

function setupGameTabWidths(){
  document.querySelectorAll(".game-section").forEach(section=>{
    const labelEl=section.querySelector(".game-chip-text-overlay");
    if(!labelEl)return;
    const text=labelEl.textContent.trim();
    const probe=document.createElement("span");
    probe.className="game-tab-measure";
    probe.textContent=text;
    document.body.appendChild(probe);
    const measured=Math.ceil(probe.getBoundingClientRect().width);
    probe.remove();
    const width=Math.max(80,Math.ceil((measured+42)/8)*8);
    section.style.setProperty("--game-tab-w",`${width}px`);
  });
}

function loadSourceState(){
  try{
    const s=JSON.parse(localStorage.getItem(STORAGE_SOURCES)||"{}");
    return s && typeof s==="object"?s:{};
  }catch{return {};}
}
let sourceState=loadSourceState();
const fetchedCandidates={};

function saveSourceState(){
  localStorage.setItem(STORAGE_SOURCES,JSON.stringify(sourceState));
}

function openFetchSheet(){
  renderFetchAccordions();
  $("#fetchOverlay").classList.add("open");
  $("#fetchSheet").classList.add("open");
  $("#fetchOverlay").setAttribute("aria-hidden","false");
  $("#fetchSheet").setAttribute("aria-hidden","false");
}

function closeFetchSheet(){
  $("#fetchOverlay").classList.remove("open");
  $("#fetchSheet").classList.remove("open");
  $("#fetchOverlay").setAttribute("aria-hidden","true");
  $("#fetchSheet").setAttribute("aria-hidden","true");
}

function renderFetchAccordions(){
  const host=$("#fetchGameAccordions");
  host.innerHTML="";
  GAME_DEFS.forEach((game,index)=>{
    const details=document.createElement("details");
    details.className="fetch-game";
    if(index===0)details.open=true;
    const urls=Array.isArray(sourceState[game.id])?sourceState[game.id].join("\n"):"";
    const sourceArea=game.id==="genshin"
      ? `<div class="fetch-relay-source"><strong>取得元</strong><span>原神 Wiki → Supabase中継</span></div>`
      : `<label class="fetch-label" for="source-${game.id}">取得元URL</label>
        <textarea id="source-${game.id}" class="fetch-url-input" rows="2" placeholder="1行に1URL">${escapeHtml(urls)}</textarea>`;
    details.innerHTML=`
      <summary>
        <span class="fetch-game-icon">${game.icon}</span>
        <span>${game.game}</span>
        <span class="fetch-game-count">${(fetchedCandidates[game.id]||[]).length}件</span>
      </summary>
      <div class="fetch-game-body">
        ${sourceArea}
        <div class="fetch-game-actions">
          <button type="button" class="fetch-run-btn" data-fetch-game="${game.id}">${game.id==="genshin"?"Wikiから取得":"このゲームを取得"}</button>
          <button type="button" class="fetch-clear-btn" data-clear-game="${game.id}">候補を消す</button>
        </div>
        <div class="fetch-candidates" id="candidates-${game.id}">
          ${candidateMarkup(game.id)}
        </div>
      </div>`;
    host.appendChild(details);
  });

  host.querySelectorAll("[data-fetch-game]").forEach(btn=>{
    btn.addEventListener("click",()=>fetchGameCandidates(btn.dataset.fetchGame));
  });
  host.querySelectorAll("[data-clear-game]").forEach(btn=>{
    btn.addEventListener("click",()=>{
      fetchedCandidates[btn.dataset.clearGame]=[];
      renderFetchAccordions();
    });
  });
}

function candidateMarkup(gameId){
  const list=fetchedCandidates[gameId]||[];
  if(!list.length)return `<div class="fetch-candidate-empty">まだ候補はありません。</div>`;
  return list.map((c,i)=>`
    <label class="fetch-candidate">
      <input type="checkbox" data-candidate-game="${gameId}" data-candidate-index="${i}" checked>
      <span class="fetch-candidate-main">
        <strong>${escapeHtml(c.title||"名称未取得")}</strong>
        <span class="fetch-candidate-meta">
          ${c.type?`<small class="fetch-meta-chip">${escapeHtml(c.type)}</small>`:""}
          ${c.limitedReward?`<small class="fetch-reward">限定報酬：${escapeHtml(c.limitedReward)}</small>`:""}
        </span>
        <small>${escapeHtml(c.dateText||[c.startText,c.endText].filter(Boolean).join(" ～ ")||"日付未検出")}</small>
        <span class="fetch-candidate-dates">
          <input type="datetime-local" data-candidate-start="${gameId}:${i}" value="${toLocalInputValue(c.start)}" aria-label="開始日時">
          <span>→</span>
          <input type="datetime-local" data-candidate-end="${gameId}:${i}" value="${toLocalInputValue(c.end)}" aria-label="終了日時">
        </span>
        ${!c.start&&c.startText?`<small class="fetch-date-note">開始：${escapeHtml(c.startText)}（日時未確定のまま反映できます）</small>`:""}
      </span>
    </label>`).join("");
}

async function fetchGameCandidates(gameId){
  const game=GAME_DEFS.find(g=>g.id===gameId);
  setFetchStatus(`${game.game}を取得中…`,"working");

  if(gameId==="genshin"){
    try{
      const candidates=await fetchGenshinCandidatesFromRelay();
      fetchedCandidates[gameId]=dedupeCandidates(candidates).slice(0,80);
      renderFetchAccordions();
      setFetchStatus(`${game.game}: ${fetchedCandidates[gameId].length}件の候補を中継から取得しました。`,"ok");
    }catch(err){
      setFetchStatus(`${game.game}: 取得できませんでした。${err.message}`,"warn");
    }
    return;
  }

  const input=document.querySelector(`#source-${gameId}`);
  const urls=(input?.value||"").split(/\n+/).map(x=>x.trim()).filter(Boolean);
  sourceState[gameId]=urls;
  saveSourceState();
  if(!urls.length){
    setFetchStatus(`${game.game}: URLを入力してください。`,"warn");
    return;
  }
  const all=[];
  const errors=[];
  for(const url of urls){
    try{all.push(...await fetchCandidatesFromUrl(url));}
    catch(err){errors.push(`${url}：${err.message}`);}
  }
  fetchedCandidates[gameId]=dedupeCandidates(all).slice(0,80);
  renderFetchAccordions();
  if(fetchedCandidates[gameId].length){
    setFetchStatus(`${game.game}: ${fetchedCandidates[gameId].length}件の候補を取得しました。${errors.length?" 一部URLは取得できませんでした。":""}`,"ok");
  }else{
    setFetchStatus(`${game.game}: 候補を取得できませんでした。${errors[0]||"ページ形式を判別できませんでした。"}`,"warn");
  }
}

async function fetchGenshinCandidatesFromRelay(){
  const res=await fetch(FETCH_WIKI_EVENTS_ENDPOINT,{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:"{}"
  });
  if(!res.ok){
    if(res.status===401)throw new Error("中継関数が401を返しました。Supabase側のJWT検証設定を確認してください。");
    throw new Error(`中継 HTTP ${res.status}`);
  }
  const data=await res.json();
  if(!data?.ok)throw new Error(data?.error||"中継側で取得に失敗しました。");
  if(!Array.isArray(data.events))throw new Error("中継からイベント配列が返りませんでした。");
  return data.events.map(event=>({
    title:cleanText(event.title),
    type:cleanText(event.type)||null,
    limitedReward:cleanText(event.limitedReward)||null,
    start:event.start||"",
    end:event.end||"",
    startText:cleanText(event.startText)||null,
    endText:cleanText(event.endText)||null,
    dateText:[event.startText,event.endText].filter(Boolean).join(" ～ "),
    source:event.sourceUrl||data.source||""
  })).filter(event=>event.title&&event.end);
}

async function fetchCandidatesFromUrl(url){
  let parsed;
  try{parsed=new URL(url);}catch{throw new Error("URL形式が正しくありません");}

  if(parsed.pathname.includes("/wiki/")){
    const title=decodeURIComponent(parsed.pathname.split("/wiki/")[1]||"").split("#")[0];
    if(title){
      const api=`${parsed.origin}/api.php?action=parse&page=${encodeURIComponent(title)}&prop=text|displaytitle&format=json&origin=*`;
      try{
        const res=await fetch(api,{mode:"cors"});
        if(res.ok){
          const json=await res.json();
          const html=json?.parse?.text?.["*"];
          if(html){
            return extractCandidatesFromHtml(html,url);
          }
        }
      }catch{}
    }
  }

  const res=await fetch(url,{mode:"cors"});
  if(!res.ok)throw new Error(`HTTP ${res.status}`);
  const type=res.headers.get("content-type")||"";
  if(type.includes("json")){
    return extractCandidatesFromJson(await res.json(),url);
  }
  return extractCandidatesFromHtml(await res.text(),url);
}

function extractCandidatesFromJson(data,url){
  const found=[];
  const seen=new Set();
  function walk(v,depth=0){
    if(depth>7 || v==null)return;
    if(Array.isArray(v)){v.forEach(x=>walk(x,depth+1));return;}
    if(typeof v!=="object")return;

    const title=v.title||v.name||v.eventName||v.event_name||v.label;
    const start=v.start||v.startDate||v.start_date||v.begin||v.from;
    const end=v.end||v.endDate||v.end_date||v.finish||v.to;
    if(typeof title==="string" && (start||end)){
      const key=`${title}|${start}|${end}`;
      if(!seen.has(key)){
        seen.add(key);
        found.push({
          title:cleanText(title),
          start:normalizeDateValue(start),
          end:normalizeDateValue(end),
          dateText:[start,end].filter(Boolean).join(" ～ "),
          source:url
        });
      }
    }
    Object.values(v).forEach(x=>walk(x,depth+1));
  }
  walk(data);
  return found;
}

function extractCandidatesFromHtml(html,url){
  const doc=new DOMParser().parseFromString(html,"text/html");
  doc.querySelectorAll("script,style,noscript,nav,footer,header,svg").forEach(n=>n.remove());

  const blocks=[...doc.querySelectorAll("tr,li,article,section,.event,.event-item,.event-card,.card")];
  const found=[];

  for(const block of blocks){
    const text=cleanText(block.textContent);
    if(text.length<8 || text.length>700)continue;
    const range=parseDateRangeFromText(text);
    if(!range)continue;

    const titleNode=block.querySelector("h1,h2,h3,h4,strong,b,a,[class*='title'],[class*='name']");
    let title=cleanText(titleNode?.textContent||text.split(/[｜|•・\n]/)[0]);
    title=title.replace(/\s{2,}/g," ").slice(0,80);
    if(title.length<2)continue;

    found.push({
      title,
      start:range.start?.toISOString()||"",
      end:range.end?.toISOString()||"",
      dateText:range.raw,
      source:url
    });
  }
  return found;
}

function parseDateRangeFromText(text){
  const currentYear=now().getFullYear();
  const tokenRe=/((?:20\d{2})[\/.\-年]\s*\d{1,2}[\/.\-月]\s*\d{1,2}日?(?:\s*[ T]?\s*\d{1,2}:\d{2})?|\d{1,2}月\s*\d{1,2}日(?:\s*\d{1,2}:\d{2})?)/g;
  const tokens=[...text.matchAll(tokenRe)].map(m=>m[1]);
  if(tokens.length<2)return null;
  const start=parseLooseDate(tokens[0],currentYear);
  let end=parseLooseDate(tokens[1],currentYear);
  if(!start||!end)return null;
  if(end<start){
    end=new Date(end);
    end.setFullYear(end.getFullYear()+1);
  }
  return {start,end,raw:`${tokens[0]} ～ ${tokens[1]}`};
}

function parseLooseDate(s,fallbackYear){
  const nums=(s.match(/\d+/g)||[]).map(Number);
  if(nums.length<2)return null;
  let year,month,day,hour=0,minute=0;
  if(nums[0]>=2000){
    [year,month,day,hour=0,minute=0]=nums;
  }else{
    year=fallbackYear;
    [month,day,hour=0,minute=0]=nums;
  }
  const d=new Date(year,month-1,day,hour,minute,0,0);
  return Number.isNaN(d.getTime())?null:d;
}

function normalizeDateValue(v){
  const d=new Date(v);
  return Number.isNaN(d.getTime())?"":d.toISOString();
}

function dedupeCandidates(list){
  const map=new Map();
  list.forEach(c=>{
    const key=`${cleanText(c.title)}|${c.start||""}|${c.end||""}`;
    if(!map.has(key))map.set(key,c);
  });
  return [...map.values()];
}

function applyFetchedEvents(){
  let changed=0;
  let skipped=0;

  GAME_DEFS.forEach(game=>{
    const candidates=fetchedCandidates[game.id]||[];
    const selected=[];
    candidates.forEach((c,i)=>{
      const check=document.querySelector(`[data-candidate-game="${game.id}"][data-candidate-index="${i}"]`);
      if(!check?.checked)return;
      const startInput=document.querySelector(`[data-candidate-start="${game.id}:${i}"]`);
      const endInput=document.querySelector(`[data-candidate-end="${game.id}:${i}"]`);
      const start=startInput?.value?new Date(startInput.value):(c.start?toDate(c.start):null);
      const end=endInput?.value?new Date(endInput.value):toDate(c.end);
      const hasStart=start && !Number.isNaN(start.getTime());
      if(Number.isNaN(end.getTime()) || (hasStart && end<=start)){
        skipped++;
        return;
      }
      const startIso=hasStart?start.toISOString():null;
      selected.push({
        id:`${game.id}-${slugify(c.title)}-${hasStart?start.getTime():slugify(c.startText||"unknown-start")}`,
        title:c.title,
        type:c.type||null,
        limitedReward:c.limitedReward||null,
        start:startIso,
        end:end.toISOString(),
        startText:c.startText||null,
        endText:c.endText||null,
        memo:"Wiki取得イベント",
        related:"取得イベント",
        source:c.source||""
      });
    });

    if(selected.length){
      const target=eventData.find(g=>g.id===game.id);
      target.events=selected;
      changed+=selected.length;
    }
  });

  if(!changed){
    setFetchStatus(`反映できるイベントがありません。${skipped?" 終了日時が不足している候補があります。":""}`,"warn");
    return;
  }

  saveEventData();
  todayLabel.textContent=formatTodayLabel(now());
  renderOngoing();
  renderCalendar();
  setupGameTabWidths();
  setFetchStatus(`${changed}件を反映しました。${skipped?`${skipped}件は日時不足でスキップしました。`:""}`,"ok");
  setTimeout(closeFetchSheet,450);
}

function setFetchStatus(text,tone=""){
  const el=$("#fetchStatus");
  el.textContent=text;
  el.dataset.tone=tone;
}

function cleanText(s){
  return String(s||"").replace(/\s+/g," ").trim();
}

function escapeHtml(s){
  return String(s||"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
}

function toLocalInputValue(value){
  if(!value)return "";
  const d=new Date(value);
  if(Number.isNaN(d.getTime()))return "";
  const p=n=>String(n).padStart(2,"0");
  return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

function slugify(s){
  return cleanText(s).toLowerCase().replace(/[^\p{L}\p{N}]+/gu,"-").replace(/^-|-$/g,"").slice(0,40)||"event";
}

/* current date keeps changing even if app stays open across midnight */
setInterval(()=>{
  todayLabel.textContent=formatTodayLabel(now());
  renderOngoing();
  setupGameTabWidths();
},60000);

window.addEventListener("load",()=>{
  document.querySelector(".app-version").textContent=APP_VERSION;
  todayLabel.textContent=formatTodayLabel(now());
  setupGameTabWidths();

  $("#fetchOverlay").addEventListener("click",closeFetchSheet);
  $("#closeFetchBtn").addEventListener("click",closeFetchSheet);
  $("#closeFetchBtnBottom").addEventListener("click",closeFetchSheet);
  $("#applyFetchedEventsBtn").addEventListener("click",applyFetchedEvents);
});
