const today=new Date("2025-05-24T12:00:00");
const eventData=[
{game:"原神",icon:"✦",color:"blue",events:[
{id:"genshin-rose",title:"薔薇と銃士",start:"2025-05-10T05:00:00",end:"2025-05-26T04:59:00",progress:80,memo:"限定報酬つきの戦闘イベント。交換所の確認も忘れずに。",related:"ゲームイベント：薔薇と銃士",source:"https://example.com/genshin/rose"},
{id:"genshin-spiral",title:"深境螺旋リセット",start:"2025-05-16T05:00:00",end:"2025-06-01T04:59:00",progress:55,memo:"定期更新。報酬回収の確認用。",related:"コンテンツ更新",source:"https://example.com/genshin/spiral"}]},
{game:"スターレイル",icon:"🎫",color:"purple",events:[
{id:"sr-gold",title:"模擬宇宙：黄金と機械",start:"2025-05-22T05:00:00",end:"2025-05-25T03:59:00",progress:92,memo:"明日終了。週課とあわせて確認。",related:"模擬宇宙イベント",source:"https://example.com/starrail/gold"},
{id:"sr-gift",title:"巡星の礼",start:"2025-05-14T05:00:00",end:"2025-05-31T23:59:00",progress:40,memo:"ログイン系。取り逃し防止に。",related:"ログインボーナス",source:"https://example.com/starrail/gift"}]},
{game:"ゼンゼロ",icon:"📺",color:"pink",events:[
{id:"zzz-comeback",title:"カムバック！プロキシ",start:"2025-05-18T05:00:00",end:"2025-05-24T23:59:00",progress:75,memo:"あと数時間。ショップ解放の確認向け。",related:"復帰支援イベント",source:"https://example.com/zzz/comeback"}]}
];


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
const detailSheet=$("#detailSheet"),detailOverlay=$("#detailOverlay"),detailTitle=$("#detailTitle"),detailGame=$("#detailGame"),detailRemain=$("#detailRemain"),detailDate=$("#detailDate"),detailRelated=$("#detailRelated"),detailMemo=$("#detailMemo"),detailSource=$("#detailSource");

const toDate=s=>new Date(s);
function formatTodayLabel(d){const w=["日","月","火","水","木","金","土"];return `${d.getFullYear()}/${String(d.getMonth()+1).padStart(2,"0")}/${String(d.getDate()).padStart(2,"0")}（${w[d.getDay()]}）`}
function formatRange(a,b){const s=toDate(a),e=toDate(b);return `${String(s.getMonth()+1).padStart(2,"0")}/${String(s.getDate()).padStart(2,"0")} ～ ${String(e.getMonth()+1).padStart(2,"0")}/${String(e.getDate()).padStart(2,"0")} ${String(e.getHours()).padStart(2,"0")}:${String(e.getMinutes()).padStart(2,"0")}`}
function formatShortRange(a,b){const s=toDate(a),e=toDate(b);return `${s.getMonth()+1}/${s.getDate()} ～ ${e.getMonth()+1}/${e.getDate()}`}
function remain(end){const ms=toDate(end)-today,h=Math.floor(ms/36e5),d=Math.floor(ms/864e5);if(ms<=0)return{prefix:"",big:"終了",tone:"orange"};if(h<24)return{prefix:"あと",big:`${h}時間`,tone:"orange"};if(d<2)return{prefix:"明日",big:"終了",tone:"pink"};return{prefix:"残り",big:`${d}日`,tone:d<=3?"pink":"blue"}}
function frame9(cls,html){return `<div class="frame9 ${cls}">${pixelFrameMarkup(html,16)}</div>`}

function openChipTab(label){
  return `<div class="game-chip-tab-open">${pixelFrameMarkup(`<span class="game-chip-text">${label}</span>`,16,"game-tab-table")}</div>`;
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

    group.events.slice().sort((a,b)=>new Date(a.end)-new Date(b.end)).forEach(event=>{
      const r=remain(event.end), btn=document.createElement("button");
      btn.type="button"; btn.className="event-row";
      const tone=r.tone==="blue"?"blue":r.tone==="orange"?"orange":"";
      btn.innerHTML=`<span class="event-icon">${group.icon}</span>
      <span class="event-main"><span class="event-title">${event.title}</span>
      <span class="progress-line"><span class="progress-mini"><span class="progress-mini-fill ${group.color==="blue"?"blue":""}" style="width:${event.progress}%"></span></span><span class="progress-label">進行度 ${event.progress}%</span></span>
      <span class="event-range">${formatRange(event.start,event.end)}</span></span>
      <span class="event-remain ${tone}"><span class="remain-prefix">${r.prefix}</span><span class="remain-big">${r.big}</span></span>`;
      btn.addEventListener("click",()=>openDetail({...event,game:group.game}));
      eventsEl.appendChild(btn);
    });
    ongoingList.appendChild(section);
  });
}

function renderCalendar(){
  const dayWidth=parseInt(getComputedStyle(document.documentElement).getPropertyValue("--day-width"));
  const startDate=new Date("2025-05-18T00:00:00"),endDate=new Date("2025-06-08T00:00:00"),days=[];
  for(let d=new Date(startDate);d<=endDate;d.setDate(d.getDate()+1))days.push(new Date(d));
  calendarHeader.innerHTML="";calendarBody.innerHTML="";calendarGameRows.innerHTML="";calendarGameRows.style.setProperty("--game-count",eventData.length);calendarBody.style.setProperty("--game-count",eventData.length);
  days.forEach(d=>{const c=document.createElement("div"),is=d.toDateString()===today.toDateString();c.className=`day-cell ${is?"today":""}`;c.innerHTML=`<span class="day-month">${d.getMonth()+1}月</span><span>${d.getDate()}</span>`;calendarHeader.appendChild(c)});
  calendarBody.style.width=`${days.length*dayWidth}px`;
  eventData.forEach(group=>{
    const left=document.createElement("div");left.className="calendar-game-cell";left.innerHTML=`<span class="calendar-game-icon">${group.icon}</span><span class="calendar-game-name">${group.game}</span>`;calendarGameRows.appendChild(left);
    const row=document.createElement("div");row.className="calendar-row";
    group.events.forEach((event,i)=>{const s=toDate(event.start),e=toDate(event.end),so=Math.floor((s-startDate)/864e5),eo=Math.ceil((e-startDate)/864e5),bar=document.createElement("button");bar.className=`event-bar ${group.color}`;bar.style.left=`${Math.max(0,so*dayWidth+5)}px`;bar.style.top=`${13+i*48}px`;bar.style.width=`${Math.max(dayWidth*1.5,(eo-so+1)*dayWidth-10)}px`;bar.innerHTML=`<span>${group.icon}</span><span class="event-bar-title"><span>${event.title}</span><small>${formatShortRange(event.start,event.end)}</small></span>`;bar.addEventListener("click",()=>openDetail({...event,game:group.game}));row.appendChild(bar)});
    calendarBody.appendChild(row);
  });
  const off=Math.floor((today-startDate)/864e5);todayLine.style.left=`${off*dayWidth+dayWidth/2}px`;requestAnimationFrame(()=>todayLine.style.height=`${calendarBody.offsetHeight}px`);
}
function jumpToToday(){const w=parseInt(getComputedStyle(document.documentElement).getPropertyValue("--day-width")),s=new Date("2025-05-18T00:00:00"),o=Math.floor((today-s)/864e5),x=o*w-calendarBodyScroll.clientWidth/2+w/2;calendarBodyScroll.scrollTo({left:Math.max(0,x),behavior:"smooth"})}
function openDetail(event){const r=remain(event.end);detailGame.textContent=event.game;detailTitle.textContent=event.title;detailRemain.textContent=r.prefix?`${r.prefix} ${r.big}`:r.big;detailDate.textContent=formatRange(event.start,event.end);detailRelated.textContent=event.related||"関連イベントなし";detailMemo.textContent=event.memo||"メモはありません。";detailSource.href=event.source||"#";detailOverlay.classList.add("open");detailSheet.classList.add("open");detailSheet.setAttribute("aria-hidden","false")}
function closeDetail(){detailOverlay.classList.remove("open");detailSheet.classList.remove("open");detailSheet.setAttribute("aria-hidden","true")}
function setScreen(name){Object.entries(screens).forEach(([k,e])=>e.classList.toggle("active",k===name));$$(".top-tab,.bottom-nav-btn").forEach(b=>b.classList.toggle("active",b.dataset.screen===name));contentScroll.scrollTop=0;if(name==="calendar"){renderCalendar();requestAnimationFrame(jumpToToday)}}
function syncCalendar(){let lock=false;calendarBodyScroll.addEventListener("scroll",()=>{if(lock)return;lock=true;calendarHeaderScroll.scrollLeft=calendarBodyScroll.scrollLeft;lock=false});calendarHeaderScroll.addEventListener("scroll",()=>{if(lock)return;lock=true;calendarBodyScroll.scrollLeft=calendarHeaderScroll.scrollLeft;lock=false})}

todayLabel.textContent=formatTodayLabel(today);renderOngoing();renderCalendar();syncCalendar();
$$(".top-tab,.bottom-nav-btn").forEach(b=>b.addEventListener("click",()=>setScreen(b.dataset.screen)));
$("#refreshMockBtn").addEventListener("click",renderOngoing);$("#closeDetailBtn").addEventListener("click",closeDetail);$("#closeDetailBtnBottom").addEventListener("click",closeDetail);detailOverlay.addEventListener("click",closeDetail);setScreen("ongoing");
