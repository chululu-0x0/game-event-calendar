const APP_VERSION="v30";
const FETCH_WIKI_EVENTS_ENDPOINT="https://vdcnicyobhnqwqswsspw.supabase.co/functions/v1/fetch-wiki-events";
const now=()=>new Date();
const today=now();

const GAME_DEFS=[
  {
    id:"genshin",game:"原神",icon:"✦",color:"blue",
    sourceUrl:"https://wikiwiki.jp/genshinwiki/%E3%82%A4%E3%83%99%E3%83%B3%E3%83%88%E4%B8%80%E8%A6%A7"
  },
  {
    id:"starrail",game:"スターレイル",icon:"🎫",color:"purple",
    sourceUrl:"https://wikiwiki.jp/star-rail/%E3%82%A4%E3%83%99%E3%83%B3%E3%83%88"
  },
  {
    id:"zzz",game:"ゼンゼロ",icon:"📺",color:"pink",
    sourceUrl:"https://wikiwiki.jp/zenless/%E3%82%A4%E3%83%99%E3%83%B3%E3%83%88"
  },
  {
    id:"arknights",game:"アークナイツ",icon:"△",color:"blue",
    sourceUrl:"https://arknights.wikiru.jp/?%E3%82%A4%E3%83%99%E3%83%B3%E3%83%88%E4%B8%80%E8%A6%A7"
  },
  {
    id:"ff14",game:"FF14",icon:"◆",color:"purple",
    sourceUrl:"https://ff14wiki.info/?%E5%85%AC%E5%BC%8F%E3%82%A4%E3%83%99%E3%83%B3%E3%83%88"
  }
];

const STORAGE_EVENTS="game-event-calendar.events.v20";
const STORAGE_SOURCES="game-event-calendar.sources.v20";
const STORAGE_IMPORT_EXCLUSIONS="game-event-calendar.import-exclusions.v1";

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
  [...document.querySelectorAll(".frame9")].reverse().forEach(frame=>{
    const oldCenter=frame.querySelector(":scope > .frame9-grid > .f5");
    if(!oldCenter)return;
    const html=oldCenter.innerHTML;
    // v28: 更新画面と追加/編集画面の外枠だけ32px。
    // 詳細画面の外枠と、各画面の内枠は16pxのまま。
    const size=(frame.classList.contains("fetch-outer-frame") || frame.classList.contains("edit-outer-frame")) ? 32 : 16;
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

/* Unified smartphone zoom suppression for iOS gesture events. */
["gesturestart","gesturechange","gestureend"].forEach(type=>{
  document.addEventListener(type,event=>event.preventDefault(),{passive:false});
});

const $=s=>document.querySelector(s), $$=s=>document.querySelectorAll(s);
const screens={ongoing:$("#screen-ongoing"),calendar:$("#screen-calendar"),favorites:$("#screen-favorites"),settings:$("#screen-settings")};
const ongoingList=$("#ongoingList"),todayLabel=$("#todayLabel"),contentScroll=$("#contentScroll");
const calendarHeader=$("#calendarHeader"),calendarBody=$("#calendarBody"),calendarGameRows=$("#calendarGameRows"),calendarGameScroll=$("#calendarGameScroll"),calendarHeaderScroll=$("#calendarHeaderScroll"),calendarBodyScroll=$("#calendarBodyScroll");
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
function remain(end){
  const e=toDate(end);
  if(Number.isNaN(e.getTime()))return{prefix:"",big:"終了未定",tone:"blue"};
  const ms=e-now(),h=Math.floor(ms/36e5),d=Math.floor(ms/864e5);
  if(ms<=0)return{prefix:"",big:"終了",tone:"orange"};
  if(h<24)return{prefix:"あと",big:`${h}時間`,tone:"orange"};
  if(d<2)return{prefix:"明日",big:"終了",tone:"pink"};
  return{prefix:"残り",big:`${d}日`,tone:d<=3?"pink":"blue"};
}
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

function compareOngoingOrder(a,b){
  const ae=toDate(a.end),be=toDate(b.end);
  const av=Number.isNaN(ae.getTime())?Number.POSITIVE_INFINITY:ae.getTime();
  const bv=Number.isNaN(be.getTime())?Number.POSITIVE_INFINITY:be.getTime();
  if(av!==bv)return av-bv;
  const as=toDate(a.start),bs=toDate(b.start);
  const asv=Number.isNaN(as.getTime())?Number.POSITIVE_INFINITY:as.getTime();
  const bsv=Number.isNaN(bs.getTime())?Number.POSITIVE_INFINITY:bs.getTime();
  return asv-bsv || cleanText(a.title).localeCompare(cleanText(b.title),"ja");
}

function renderOngoing(){
  ongoingList.innerHTML="";
  eventData.forEach(group=>{
    const section=document.createElement("section");
    section.className=`game-section ${group.color}`;
    const rawTabWidth=Math.max(112,group.game.length*19+40);
    const tabWidth=Math.ceil(rawTabWidth/8)*8;
    section.style.setProperty("--game-tab-w",`${tabWidth}px`);

    const tab=openChipTab(group.game);
    const card=frame9("frame-card game-card",`<div class="game-events"></div>`);
    section.innerHTML=tab+frame9("frame-chip game-shell",card);

    const eventsEl=section.querySelector(".game-events");
    if(!group.events.length){
      eventsEl.innerHTML=`<div class="event-empty">イベント未取得<br><small>右上の「更新」から取得できます</small></div>`;
    }

    group.events
      .slice()
      .sort(compareOngoingOrder)
      .forEach(event=>{
        const r=remain(event.end);
        const p=countdownProgress(event);
        const btn=document.createElement("button");
        btn.type="button";
        btn.className="event-row";
        const tone=r.tone==="blue"?"blue":r.tone==="orange"?"orange":"";

        btn.innerHTML=`<span class="event-icon event-edit-trigger" role="button" aria-label="${escapeHtml(event.title)}を編集" title="編集">
            <span class="event-game-mark">${group.icon}</span>
            <span class="event-edit-mark">✎</span>
          </span>
          <span class="event-main">
            <span class="event-title">${escapeHtml(event.title)}</span>
            <span class="progress-line" aria-label="残り期間の進行バー">
              <span class="progress-mini"><span class="progress-mini-fill progress-${p.tone}" style="width:${p.pct??0}%"></span></span>
            </span>
            <span class="event-range">${escapeHtml(formatEventRange(event))}</span>
          </span>
          <span class="event-remain ${tone}">
            <span class="remain-prefix">${r.prefix}</span>
            <span class="remain-big">${r.big}</span>
          </span>`;

        btn.addEventListener("click",()=>openDetail({...event,game:group.game,gameId:group.id}));
        const editTrigger=btn.querySelector(".event-edit-trigger");
        editTrigger?.addEventListener("click",ev=>{
          ev.preventDefault();
          ev.stopPropagation();
          openEditEvent(group.id,event.id);
        });

        eventsEl.appendChild(btn);
      });

    ongoingList.appendChild(section);
  });
}

function fitCalendarGameName(el){
  if(!el)return;
  el.style.fontSize="12px";
  const min=8.5;
  let size=12;
  while(size>min && el.scrollWidth>el.clientWidth){
    size-=.5;
    el.style.fontSize=`${size}px`;
  }
}

function renderCalendar(){
  const dayWidth=parseInt(getComputedStyle(document.documentElement).getPropertyValue("--day-width"))||64;
  const startDate=new Date(now());
  startDate.setHours(0,0,0,0);

  const lastDate=new Date(startDate);
  lastDate.setDate(lastDate.getDate()+30);
  lastDate.setHours(23,59,59,999);

  const days=[];
  for(let i=0;i<=30;i++){
    const d=new Date(startDate);
    d.setDate(startDate.getDate()+i);
    days.push(d);
  }

  calendarHeader.innerHTML="";
  calendarBody.innerHTML="";
  calendarGameRows.innerHTML="";

  days.forEach((d,index)=>{
    const cell=document.createElement("div");
    cell.className=`day-cell ${index===0?"today":""}`;
    cell.innerHTML=`<span class="day-month">${d.getMonth()+1}月</span><span>${d.getDate()}</span>`;
    calendarHeader.appendChild(cell);
  });

  const fullWidth=days.length*dayWidth;
  calendarHeader.style.width=`${fullWidth}px`;
  calendarBody.style.width=`${fullWidth}px`;
  calendarBody.dataset.startDate=startDate.toISOString();

  let totalHeight=0;

  eventData.forEach(group=>{
    const visible=group.events
      .filter(event=>{
        const s=toDate(event.start),e=toDate(event.end);
        if(Number.isNaN(s.getTime())||Number.isNaN(e.getTime()))return false;
        return e>=startDate && s<=lastDate;
      })
      .slice()
      .sort(compareOngoingOrder);

    // 1イベント=1レーン。順番は開催中画面と同一なのでバー同士は重ならない。
    const laneCount=Math.max(1,visible.length);
    const titleBoost=cleanText(group.game).length>=9?8:0;
    const groupHeight=Math.max(62+titleBoost,12+laneCount*31);

    const left=document.createElement("div");
    left.className="calendar-game-cell";
    left.style.height=`${groupHeight}px`;
    left.innerHTML=`<span class="calendar-game-icon">${group.icon}</span><span class="calendar-game-name">${escapeHtml(group.game)}</span>`;
    calendarGameRows.appendChild(left);
    requestAnimationFrame(()=>fitCalendarGameName(left.querySelector(".calendar-game-name")));

    const row=document.createElement("div");
    row.className="calendar-row";
    row.style.height=`${groupHeight}px`;

    visible.forEach((event,index)=>{
      const s=toDate(event.start),e=toDate(event.end);
      const clippedStart=s<startDate?startDate:s;
      const clippedEnd=e>lastDate?lastDate:e;
      const startOffset=Math.max(0,(clippedStart-startDate)/864e5);
      const endOffset=Math.max(startOffset,(clippedEnd-startDate)/864e5);
      const leftPx=Math.max(2,startOffset*dayWidth+2);
      const widthPx=Math.max(
        dayWidth*.8,
        Math.min(fullWidth-leftPx,(endOffset-startOffset)*dayWidth+dayWidth-4)
      );

      const bar=document.createElement("button");
      bar.type="button";
      bar.className=`event-bar ${group.color}`;
      bar.style.left=`${leftPx}px`;
      bar.style.top=`${6+index*31}px`;
      bar.style.width=`${widthPx}px`;
      bar.innerHTML=`<span class="event-bar-icon">${group.icon}</span><span class="event-bar-title"><span>${escapeHtml(event.title)}</span><small>${formatShortRange(event.start,event.end)}</small></span>`;
      bar.addEventListener("click",()=>openDetail({...event,game:group.game,gameId:group.id}));
      row.appendChild(bar);
    });

    calendarBody.appendChild(row);
    totalHeight+=groupHeight;
  });

  const bodyHeight=Math.max(totalHeight,calendarBodyScroll.clientHeight);
  calendarBody.style.height=`${bodyHeight}px`;
  calendarGameRows.style.height=`${totalHeight}px`;

  calendarHeaderScroll.scrollLeft=0;
  calendarBodyScroll.scrollLeft=0;
  calendarGameScroll.scrollTop=0;
  calendarBodyScroll.scrollTop=0;
}

function jumpToToday(){
  calendarHeaderScroll.scrollLeft=0;
  calendarBodyScroll.scrollLeft=0;
}

let currentDetailRef=null;
function openDetail(event){
  const r=remain(event.end);
  currentDetailRef={gameId:event.gameId,eventId:event.id};

  detailGame.textContent=event.game;
  detailTitle.textContent=event.title;
  detailRemain.textContent=r.prefix?`${r.prefix} ${r.big}`:r.big;
  detailDate.textContent=formatEventRange(event);
  detailType.textContent=event.type||"情報なし";
  detailReward.textContent=event.limitedReward||"情報なし";
  detailRelated.textContent=event.related||"関連イベントなし";
  detailMemo.textContent=event.memo||"メモはありません。";
  detailSource.href=event.source||event.sourceUrl||"#";

  detailOverlay.classList.add("open");
  detailSheet.classList.add("open");
  detailSheet.setAttribute("aria-hidden","false");
}

function closeDetail(){
  detailOverlay.classList.remove("open");
  detailSheet.classList.remove("open");
  detailSheet.setAttribute("aria-hidden","true");
  currentDetailRef=null;
}

function setScreen(name){
  Object.entries(screens).forEach(([k,e])=>e.classList.toggle("active",k===name));
  $$(".top-tab,.bottom-nav-btn").forEach(b=>b.classList.toggle("active",b.dataset.screen===name));
  document.querySelector(".app-shell")?.classList.toggle("calendar-mode",name==="calendar");
  contentScroll.scrollTop=0;
  if(name==="calendar"){
    renderCalendar();
    requestAnimationFrame(jumpToToday);
  }
}

function syncCalendar(){
  let lock=false;
  calendarBodyScroll.addEventListener("scroll",()=>{
    if(lock)return;
    lock=true;
    calendarHeaderScroll.scrollLeft=calendarBodyScroll.scrollLeft;
    lock=false;
  });
  calendarHeaderScroll.addEventListener("scroll",()=>{
    if(lock)return;
    lock=true;
    calendarBodyScroll.scrollLeft=calendarHeaderScroll.scrollLeft;
    lock=false;
  });
  calendarGameScroll.addEventListener("scroll",()=>{
    calendarBodyScroll.scrollTop=calendarGameScroll.scrollTop;
  });
}

function preventScrollBounce(el,axis){
  if(!el)return;
  let last=0;
  el.addEventListener("touchstart",event=>{
    const touch=event.touches[0];
    last=axis==="x"?touch.clientX:touch.clientY;
  },{passive:true});
  el.addEventListener("touchmove",event=>{
    const touch=event.touches[0];
    const current=axis==="x"?touch.clientX:touch.clientY;
    const delta=current-last;
    last=current;
    const pos=axis==="x"?el.scrollLeft:el.scrollTop;
    const max=axis==="x"?el.scrollWidth-el.clientWidth:el.scrollHeight-el.clientHeight;
    const atStart=pos<=.5;
    const atEnd=pos>=max-.5;
    if((atStart&&delta>0)||(atEnd&&delta<0))event.preventDefault();
  },{passive:false});
}

todayLabel.textContent=formatTodayLabel(now());renderOngoing();renderCalendar();syncCalendar();
$$(".top-tab,.bottom-nav-btn").forEach(b=>b.addEventListener("click",()=>setScreen(b.dataset.screen)));
$("#addEventBtn").addEventListener("click",openAddEvent);$("#refreshMockBtn").addEventListener("click",openFetchSheet);$("#closeDetailBtn").addEventListener("click",closeDetail);$("#closeDetailBtnBottom").addEventListener("click",closeDetail);detailOverlay.addEventListener("click",closeDetail);setScreen("ongoing");




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

function loadImportExclusions(){
  try{
    const saved=JSON.parse(localStorage.getItem(STORAGE_IMPORT_EXCLUSIONS)||"{}");
    return saved && typeof saved==="object" ? saved : {};
  }catch{return {};}
}
let importExclusions=loadImportExclusions();

function saveImportExclusions(){
  localStorage.setItem(STORAGE_IMPORT_EXCLUSIONS,JSON.stringify(importExclusions));
}

function candidateFingerprint(candidate){
  return comparableEvent(candidate);
}

function isImportExcluded(gameId,candidate){
  const list=Array.isArray(importExclusions[gameId])?importExclusions[gameId]:[];
  return list.includes(candidateFingerprint(candidate));
}

function addImportExclusion(gameId,candidate){
  const fingerprint=candidateFingerprint(candidate);
  const list=Array.isArray(importExclusions[gameId])?[...importExclusions[gameId]]:[];
  if(!list.includes(fingerprint))list.push(fingerprint);
  // 個人利用でも無制限に増えないよう、各ゲーム最新500件まで。
  importExclusions[gameId]=list.slice(-500);
}

function saveSourceState(){
  localStorage.setItem(STORAGE_SOURCES,JSON.stringify(sourceState));
}

const fetchProgressState=Object.fromEntries(GAME_DEFS.map(game=>[game.id,"waiting"]));
let fetchAllRunning=false;

function resetFetchProgress(){
  GAME_DEFS.forEach(game=>{fetchProgressState[game.id]="waiting";});
}

function openFetchSheet(){
  resetFetchProgress();
  renderFetchProgress();
  renderFetchAccordions();
  updateFetchSelectionCount();
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

function fetchStateLabel(state){
  if(state==="checking")return "チェック中…";
  if(state==="done")return "完了";
  if(state==="error")return "エラー";
  return "待機中";
}

function fetchStateIcon(state){
  if(state==="checking")return "◌";
  if(state==="done")return "✓";
  if(state==="error")return "!";
  return "◷";
}

function renderFetchProgress(){
  const host=$("#fetchProgressGames");
  if(!host)return;

  host.innerHTML=GAME_DEFS.map(game=>{
    const state=fetchProgressState[game.id]||"waiting";
    return `<div class="check-game-row" data-progress-game="${game.id}">
      <button type="button" class="check-game-icon-btn" data-check-game="${game.id}" aria-label="${escapeHtml(game.game)}だけチェック" title="${escapeHtml(game.game)}だけチェック">
        <span>${game.icon}</span>
      </button>
      <span class="check-game-name">${escapeHtml(game.game)}</span>
      <span class="check-game-state is-${state}">
        <span>${fetchStateLabel(state)}</span>
        <span class="check-game-state-icon" aria-hidden="true">${fetchStateIcon(state)}</span>
      </span>
    </div>`;
  }).join("");

  host.querySelectorAll("[data-check-game]").forEach(btn=>{
    btn.addEventListener("click",()=>{
      if(fetchAllRunning)return;
      fetchGameCandidates(btn.dataset.checkGame);
    });
  });

  const processed=GAME_DEFS.filter(game=>["done","error"].includes(fetchProgressState[game.id])).length;
  const percent=Math.round(processed/GAME_DEFS.length*100);
  const fill=$("#checkProgressFill"),count=$("#checkProgressCount");
  if(fill)fill.style.width=`${percent}%`;
  if(count)count.textContent=`${processed} / ${GAME_DEFS.length} ゲーム`;

  const allBtn=$("#fetchAllGamesBtn");
  if(allBtn){
    allBtn.disabled=fetchAllRunning;
    allBtn.textContent=fetchAllRunning?"チェック中…":"全ゲームチェック";
  }
}

function renderFetchAccordions(){
  const host=$("#fetchGameAccordions");
  host.innerHTML="";

  GAME_DEFS.forEach(game=>{
    const list=fetchedCandidates[game.id]||[];
    const wrapper=document.createElement("div");
    wrapper.className="check-result-frame";

    // v29: ゲームごとの結果は minidot フレームを1枚だけ使用。
    // 候補件数と候補一覧は、そのゲームフレームの中へ直接配置する。
    const detailsMarkup=`<details class="fetch-game check-result-game" ${list.length?"open":""}>
      <summary>
        <span class="fetch-game-icon">${game.icon}</span>
        <span class="check-result-game-name">${escapeHtml(game.game)}</span>
        <span class="fetch-game-count">${list.length?`候補 ${list.length}件`:"候補なし"}</span>
      </summary>
      <div class="fetch-game-body check-result-body check-result-candidate-panel">
        <div class="check-result-count">候補イベント：${list.length}件</div>
        <div class="fetch-candidates" id="candidates-${game.id}">
          ${candidateMarkup(game.id)}
        </div>
      </div>
    </details>`;

    wrapper.innerHTML=pixelFrameMarkup(detailsMarkup,16,"check-result-pixel-table");
    host.appendChild(wrapper);
  });

  host.querySelectorAll('input[type="checkbox"][data-candidate-game]').forEach(input=>{
    input.addEventListener("change",updateFetchSelectionCount);
  });
  updateFetchSelectionCount();
}

function formatImportDateValue(value,text=""){
  if(value){
    const d=toDate(value);
    if(!Number.isNaN(d.getTime())){
      const p=n=>String(n).padStart(2,"0");
      return `${d.getFullYear()}/${p(d.getMonth()+1)}/${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
    }
  }
  return cleanText(text)||"日時未定";
}

function formatImportRange(candidate){
  const start=formatImportDateValue(candidate.start,candidate.startText);
  const end=formatImportDateValue(candidate.end,candidate.endText);
  return `${start} ～ ${end}`;
}

function candidateMarkup(gameId){
  const list=fetchedCandidates[gameId]||[];
  if(!list.length)return `<div class="fetch-candidate-empty">新規・変更されたイベントはありません。</div>`;

  return list.map((c,i)=>{
    const badge=c.changeType==="update"?"変更":"新規";
    const badgeClass=c.changeType==="update"?"is-change":"is-new";
    return `<label class="fetch-candidate check-result-candidate ${c.changeType==="update"?"is-update":""}">
      <input type="checkbox" data-candidate-game="${gameId}" data-candidate-index="${i}" checked>
      <span class="fetch-candidate-main">
        <span class="fetch-candidate-title-row">
          <small class="fetch-change-badge ${badgeClass}">${badge}</small>
          <strong>${escapeHtml(c.title||"名称未取得")}</strong>
        </span>
        <small class="check-result-date">${escapeHtml(formatImportRange(c))}</small>
      </span>
    </label>`;
  }).join("");
}

function updateFetchSelectionCount(){
  const selected=$$('#fetchGameAccordions input[type="checkbox"][data-candidate-game]:checked').length;
  const button=$("#applyFetchedEventsBtn");
  if(button)button.textContent=`選択したイベントを登録（${selected}件）`;
}

async function fetchGameCandidates(gameId){
  const game=GAME_DEFS.find(g=>g.id===gameId);
  if(!game)return;

  fetchProgressState[gameId]="checking";
  renderFetchProgress();
  setFetchStatus(`${game.game}をチェック中…`,"working");

  try{
    const raw=await fetchCandidatesFromRelay(gameId);
    const candidates=classifyFetchedCandidates(gameId,dedupeCandidates(raw)).slice(0,100);
    fetchedCandidates[gameId]=candidates;
    fetchProgressState[gameId]="done";
    renderFetchAccordions();
    renderFetchProgress();
    setFetchStatus(`${game.game}: ${candidates.length}件の候補`,"ok");
    return true;
  }catch(err){
    fetchProgressState[gameId]="error";
    renderFetchProgress();
    setFetchStatus(`${game.game}: ${err.message}`,"warn");
    return false;
  }
}

async function fetchAllGames(){
  if(fetchAllRunning)return;
  fetchAllRunning=true;
  GAME_DEFS.forEach(game=>{fetchProgressState[game.id]="waiting";});
  renderFetchProgress();

  for(const game of GAME_DEFS){
    await fetchGameCandidates(game.id);
  }

  fetchAllRunning=false;
  renderFetchProgress();
  updateFetchSelectionCount();
  const failed=GAME_DEFS.filter(game=>fetchProgressState[game.id]==="error").length;
  setFetchStatus(failed?`全ゲームチェック完了（${failed}ゲームでエラー）`:"全ゲームチェック完了","ok");
}

async function fetchCandidatesFromRelay(gameId){
  const res=await fetch(FETCH_WIKI_EVENTS_ENDPOINT,{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({game:gameId})
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
  })).filter(event=>event.title&&(event.end||event.endText));
}

function comparableEvent(event){
  const hasExactStart=Boolean(event.start);
  const hasExactEnd=Boolean(event.end);
  return JSON.stringify({
    title:cleanText(event.title),
    type:cleanText(event.type)||"",
    limitedReward:cleanText(event.limitedReward)||"",
    start:event.start||"",
    end:event.end||"",
    // 日時をDate化できている場合、Wiki上の表記ゆれだけでは「変更」にしない。
    // 「Ver.x.xアプデ後」など絶対日時がない時だけ元表記を比較する。
    startText:hasExactStart?"":(cleanText(event.startText)||""),
    endText:hasExactEnd?"":(cleanText(event.endText)||"")
  });
}

function classifyFetchedCandidates(gameId,list){
  const group=eventData.find(g=>g.id===gameId);
  const existing=group?.events||[];
  const result=[];

  list.forEach(candidate=>{
    const sameTitleEvents=existing.filter(event=>cleanText(event.title)===cleanText(candidate.title));

    // 登録済みイベントと内容まで完全一致するものは候補に出さない。
    const exactRegistered=sameTitleEvents.find(event=>comparableEvent(event)===comparableEvent(candidate));
    if(exactRegistered)return;

    // 前回ユーザーが明示的に除外した「同じ内容」の候補も出さない。
    // 内容が変われば fingerprint も変わるため、再び候補として現れる。
    if(isImportExcluded(gameId,candidate))return;

    // 同名の登録済みイベントがあり、内容に差がある時だけ「変更」。
    if(sameTitleEvents.length){
      const sameTitle=sameTitleEvents[0];
      result.push({
        ...candidate,
        changeType:"update",
        existingId:sameTitle.id
      });
      return;
    }

    result.push({...candidate,changeType:"new"});
  });

  return result;
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
  let excluded=0;

  GAME_DEFS.forEach(game=>{
    const candidates=fetchedCandidates[game.id]||[];
    const target=eventData.find(g=>g.id===game.id);
    if(!target)return;

    candidates.forEach((c,i)=>{
      const check=document.querySelector(`[data-candidate-game="${game.id}"][data-candidate-index="${i}"]`);

      // チェックを外した候補は「今回は登録しない」だけでなく、
      // 同じ内容が次回取得された時にも表示しないよう記録する。
      if(!check?.checked){
        addImportExclusion(game.id,c);
        excluded++;
        return;
      }

      const start=c.start?toDate(c.start):null;
      const end=c.end?toDate(c.end):null;
      const hasStart=start && !Number.isNaN(start.getTime());
      const hasEnd=end && !Number.isNaN(end.getTime());

      if(hasStart&&hasEnd&&end<=start){
        skipped++;
        return;
      }
      if(!hasEnd&&!c.endText){
        skipped++;
        return;
      }

      const existing=c.existingId
        ? target.events.find(event=>event.id===c.existingId)
        : target.events.find(event=>cleanText(event.title)===cleanText(c.title));

      const imported={
        title:c.title,
        type:c.type||null,
        limitedReward:c.limitedReward||null,
        start:hasStart?start.toISOString():null,
        end:hasEnd?end.toISOString():null,
        startText:c.startText||null,
        endText:c.endText||null,
        source:c.source||"",
        sourceUrl:c.source||""
      };

      if(existing){
        const preserved={
          id:existing.id,
          memo:existing.memo||"Wiki取得イベント",
          related:existing.related||"取得イベント"
        };
        Object.assign(existing,imported,preserved);
      }else{
        const idStart=hasStart?start.getTime():slugify(c.startText||"unknown-start");
        target.events.push({
          id:`${game.id}-${slugify(c.title)}-${idStart}`,
          ...imported,
          memo:"Wiki取得イベント",
          related:"取得イベント"
        });
      }

      changed++;
    });
  });

  if(excluded)saveImportExclusions();

  if(!changed && !excluded){
    setFetchStatus(`登録・除外するイベントがありません。${skipped?" 日時の整合性を確認してください。":""}`,"warn");
    return;
  }

  if(changed)saveEventData();
  todayLabel.textContent=formatTodayLabel(now());
  renderOngoing();
  renderCalendar();
  setupGameTabWidths();

  GAME_DEFS.forEach(game=>{
    fetchedCandidates[game.id]=classifyFetchedCandidates(game.id,fetchedCandidates[game.id]||[]);
  });
  renderFetchAccordions();
  updateFetchSelectionCount();

  const parts=[];
  if(changed)parts.push(`${changed}件を登録`);
  if(excluded)parts.push(`${excluded}件を次回から除外`);
  if(skipped)parts.push(`${skipped}件は日時の整合性でスキップ`);
  setFetchStatus(`${parts.join("・")}しました。`,"ok");
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


let editingEventRef=null;
let editMode="edit";

function getStoredEvent(gameId,eventId){
  const group=eventData.find(g=>g.id===gameId);
  const event=group?.events.find(e=>e.id===eventId);
  return {group,event};
}

function openEditSheetBase(){
  $("#editStatus").textContent="";
  $("#editOverlay").classList.add("open");
  $("#editSheet").classList.add("open");
  $("#editOverlay").setAttribute("aria-hidden","false");
  $("#editSheet").setAttribute("aria-hidden","false");
  requestAnimationFrame(()=>$("#editTitle").focus({preventScroll:true}));
}

function openAddEvent(){
  editMode="add";
  editingEventRef=null;
  $("#editSheetTitle").textContent="イベント追加";
  $("#editSubmitBtn").textContent="追加";
  $("#editGameLabel").hidden=true;
  $("#editGameField").hidden=false;
  $("#editGameSelect").innerHTML=GAME_DEFS.map(game=>`<option value="${game.id}">${escapeHtml(game.game)}</option>`).join("");
  $("#editTitle").value="";
  $("#editType").value="";
  $("#editReward").value="";
  $("#editStart").value="";
  $("#editEnd").value="";
  $("#editStartText").value="";
  $("#editEndText").value="";
  $("#editMemo").value="";
  $("#editSource").value="";
  openEditSheetBase();
}

function openEditEvent(gameId,eventId){
  const {group,event}=getStoredEvent(gameId,eventId);
  if(!group||!event)return;

  editMode="edit";
  editingEventRef={gameId,eventId};
  $("#editSheetTitle").textContent="イベント編集";
  $("#editSubmitBtn").textContent="保存";
  $("#editGameLabel").hidden=false;
  $("#editGameField").hidden=true;
  $("#editGameLabel").textContent=group.game;
  $("#editTitle").value=event.title||"";
  $("#editType").value=event.type||"";
  $("#editReward").value=event.limitedReward||"";
  $("#editStart").value=toLocalInputValue(event.start);
  $("#editEnd").value=toLocalInputValue(event.end);
  $("#editStartText").value=event.startText||"";
  $("#editEndText").value=event.endText||"";
  $("#editMemo").value=event.memo||"";
  $("#editSource").value=event.source||event.sourceUrl||"";
  openEditSheetBase();
}

function closeEditEvent(){
  $("#editOverlay").classList.remove("open");
  $("#editSheet").classList.remove("open");
  $("#editOverlay").setAttribute("aria-hidden","true");
  $("#editSheet").setAttribute("aria-hidden","true");
  editingEventRef=null;
  editMode="edit";
}

function readEditFormValues(){
  const title=cleanText($("#editTitle").value);
  if(!title)return {error:"イベント名を入力してください。"};

  const startValue=$("#editStart").value;
  const endValue=$("#editEnd").value;
  const start=startValue?new Date(startValue):null;
  const end=endValue?new Date(endValue):null;

  if(start&&Number.isNaN(start.getTime()))return {error:"開始日時を確認してください。"};
  if(end&&Number.isNaN(end.getTime()))return {error:"終了日時を確認してください。"};
  if(start&&end&&end<=start)return {error:"終了日時は開始日時より後にしてください。"};

  const source=$("#editSource").value.trim();
  return {values:{
    title,
    type:cleanText($("#editType").value)||null,
    limitedReward:cleanText($("#editReward").value)||null,
    start:start?start.toISOString():null,
    end:end?end.toISOString():null,
    startText:cleanText($("#editStartText").value)||null,
    endText:cleanText($("#editEndText").value)||null,
    memo:$("#editMemo").value.trim(),
    source,
    sourceUrl:source
  }};
}

function saveEditedEvent(ev){
  ev.preventDefault();
  const result=readEditFormValues();
  if(result.error){
    $("#editStatus").textContent=result.error;
    return;
  }
  const values=result.values;

  if(editMode==="add"){
    const gameId=$("#editGameSelect").value;
    const group=eventData.find(g=>g.id===gameId);
    if(!group){
      $("#editStatus").textContent="追加先のゲームを選択してください。";
      return;
    }
    const event={
      id:`${gameId}-manual-${Date.now()}-${slugify(values.title)}`,
      ...values,
      related:"手動追加イベント"
    };
    group.events.push(event);
    saveEventData();
    renderOngoing();
    renderCalendar();
    setupGameTabWidths();
    closeEditEvent();
    return;
  }

  if(!editingEventRef)return;
  const {group,event}=getStoredEvent(editingEventRef.gameId,editingEventRef.eventId);
  if(!group||!event){
    $("#editStatus").textContent="編集対象が見つかりませんでした。";
    return;
  }

  Object.assign(event,values);
  saveEventData();
  renderOngoing();
  renderCalendar();
  setupGameTabWidths();

  const detailWasOpen=detailSheet.classList.contains("open") &&
    currentDetailRef?.gameId===group.id &&
    currentDetailRef?.eventId===event.id;

  closeEditEvent();
  if(detailWasOpen)openDetail({...event,game:group.game,gameId:group.id});
}

/* current date keeps changing even if app stays open across midnight */
setInterval(()=>{
  todayLabel.textContent=formatTodayLabel(now());
  renderOngoing();
  setupGameTabWidths();
  if(screens.calendar.classList.contains("active"))renderCalendar();
},60000);

window.addEventListener("load",()=>{
  document.querySelector(".app-version").textContent=APP_VERSION;
  todayLabel.textContent=formatTodayLabel(now());
  setupGameTabWidths();

  preventScrollBounce(calendarGameScroll,"y");
  preventScrollBounce(calendarBodyScroll,"x");
  preventScrollBounce(calendarHeaderScroll,"x");

  $("#fetchOverlay").addEventListener("click",closeFetchSheet);
  $("#closeFetchBtn").addEventListener("click",closeFetchSheet);
  $("#fetchAllGamesBtn").addEventListener("click",event=>{
    event.preventDefault();
    event.stopPropagation();
    fetchAllGames();
  });
  $("#applyFetchedEventsBtn").addEventListener("click",applyFetchedEvents);

  $("#editDetailBtn").addEventListener("click",()=>{
    if(currentDetailRef)openEditEvent(currentDetailRef.gameId,currentDetailRef.eventId);
  });
  $("#editOverlay").addEventListener("click",closeEditEvent);
  $("#closeEditBtn").addEventListener("click",closeEditEvent);
  $("#cancelEditBtn").addEventListener("click",closeEditEvent);
  $("#editEventForm").addEventListener("submit",saveEditedEvent);
});
