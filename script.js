const today = new Date("2025-05-24T12:00:00");

const eventData = [
  {
    game: "原神",
    icon: "✦",
    color: "blue",
    events: [
      {
        id: "genshin-rose",
        title: "薔薇と銃士",
        start: "2025-05-10T05:00:00",
        end: "2025-05-26T04:59:00",
        progress: 80,
        memo: "限定報酬つきの戦闘イベント。交換所の確認も忘れずに。",
        related: "ゲームイベント：薔薇と銃士",
        source: "https://example.com/genshin/rose"
      },
      {
        id: "genshin-spiral",
        title: "深境螺旋リセット",
        start: "2025-05-16T05:00:00",
        end: "2025-06-01T04:59:00",
        progress: 55,
        memo: "定期更新。報酬回収の確認用。",
        related: "コンテンツ更新",
        source: "https://example.com/genshin/spiral"
      }
    ]
  },
  {
    game: "スターレイル",
    icon: "🎫",
    color: "purple",
    events: [
      {
        id: "sr-gold",
        title: "模擬宇宙：黄金と機械",
        start: "2025-05-22T05:00:00",
        end: "2025-05-25T03:59:00",
        progress: 92,
        memo: "明日終了。週課とあわせて確認。",
        related: "模擬宇宙イベント",
        source: "https://example.com/starrail/gold"
      },
      {
        id: "sr-gift",
        title: "巡星の礼",
        start: "2025-05-14T05:00:00",
        end: "2025-05-31T23:59:00",
        progress: 40,
        memo: "ログイン系。取り逃し防止に。",
        related: "ログインボーナス",
        source: "https://example.com/starrail/gift"
      }
    ]
  },
  {
    game: "ゼンゼロ",
    icon: "📺",
    color: "pink",
    events: [
      {
        id: "zzz-comeback",
        title: "カムバック！プロキシ",
        start: "2025-05-18T05:00:00",
        end: "2025-05-24T23:59:00",
        progress: 75,
        memo: "あと数時間。ショップ解放の確認向け。",
        related: "復帰支援イベント",
        source: "https://example.com/zzz/comeback"
      }
    ]
  }
];

const screens = {
  ongoing: document.getElementById("screen-ongoing"),
  calendar: document.getElementById("screen-calendar"),
  favorites: document.getElementById("screen-favorites"),
  settings: document.getElementById("screen-settings")
};

const topTabs = document.querySelectorAll(".top-tab");
const bottomNavBtns = document.querySelectorAll(".bottom-nav-btn");

const ongoingList = document.getElementById("ongoingList");
const todayLabel = document.getElementById("todayLabel");
const contentScroll = document.getElementById("contentScroll");

const calendarHeader = document.getElementById("calendarHeader");
const calendarBody = document.getElementById("calendarBody");
const calendarGameRows = document.getElementById("calendarGameRows");
const todayLine = document.getElementById("todayLine");
const calendarHeaderScroll = document.getElementById("calendarHeaderScroll");
const calendarBodyScroll = document.getElementById("calendarBodyScroll");

const detailSheet = document.getElementById("detailSheet");
const detailOverlay = document.getElementById("detailOverlay");
const closeDetailBtn = document.getElementById("closeDetailBtn");
const closeDetailBtnBottom = document.getElementById("closeDetailBtnBottom");

const detailTitle = document.getElementById("detailTitle");
const detailGame = document.getElementById("detailGame");
const detailRemain = document.getElementById("detailRemain");
const detailDate = document.getElementById("detailDate");
const detailRelated = document.getElementById("detailRelated");
const detailMemo = document.getElementById("detailMemo");
const detailSource = document.getElementById("detailSource");

function toDate(str) {
  return new Date(str);
}

function formatTodayLabel(date) {
  const week = ["日", "月", "火", "水", "木", "金", "土"];
  return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, "0")}/${String(date.getDate()).padStart(2, "0")}（${week[date.getDay()]}）`;
}

function formatRange(start, end) {
  const s = toDate(start);
  const e = toDate(end);

  return `${String(s.getMonth() + 1).padStart(2, "0")}/${String(s.getDate()).padStart(2, "0")} ～ ${String(e.getMonth() + 1).padStart(2, "0")}/${String(e.getDate()).padStart(2, "0")} ${String(e.getHours()).padStart(2, "0")}:${String(e.getMinutes()).padStart(2, "0")}`;
}

function formatShortRange(start, end) {
  const s = toDate(start);
  const e = toDate(end);
  return `${s.getMonth() + 1}/${s.getDate()} ～ ${e.getMonth() + 1}/${e.getDate()}`;
}

function getRemainingLabel(endStr) {
  const end = toDate(endStr);
  const diffMs = end - today;
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMs <= 0) {
    return { prefix: "", big: "終了", tone: "orange" };
  }

  if (diffHours < 24) {
    return { prefix: "あと", big: `${diffHours}時間`, tone: "orange" };
  }

  if (diffDays < 2) {
    return { prefix: "明日", big: "終了", tone: "pink" };
  }

  return {
    prefix: "残り",
    big: `${diffDays}日`,
    tone: diffDays <= 3 ? "pink" : "blue"
  };
}

function getProgressColorClass(groupColor) {
  return groupColor === "blue" ? "blue" : "";
}

function renderOngoing() {
  ongoingList.innerHTML = "";

  eventData.forEach(group => {
    const section = document.createElement("section");
    section.className = `frame9 frame9-panel game-section ${group.color}`;

    section.innerHTML = `
      <div class="game-sticky-label">${group.game}</div>

      <div class="frame9-grid">
        <div class="f f1"></div>
        <div class="f f2"></div>
        <div class="f f3"></div>

        <div class="f f4"></div>

        <div class="f f5">
          <div class="game-events"></div>
        </div>

        <div class="f f6"></div>

        <div class="f f7"></div>
        <div class="f f8"></div>
        <div class="f f9"></div>
      </div>
    `;

    const eventsEl = section.querySelector(".game-events");

    group.events
      .slice()
      .sort((a, b) => new Date(a.end) - new Date(b.end))
      .forEach(event => {
        const remain = getRemainingLabel(event.end);
        const eventBtn = document.createElement("button");

        eventBtn.type = "button";
        eventBtn.className = "event-row";

        const toneClass =
          remain.tone === "blue"
            ? "blue"
            : remain.tone === "orange"
              ? "orange"
              : "";

        eventBtn.innerHTML = `
          <span class="event-icon" aria-hidden="true">${group.icon}</span>

          <span class="event-main">
            <span class="event-title">${event.title}</span>

            <span class="progress-line">
              <span class="progress-mini">
                <span
                  class="progress-mini-fill ${getProgressColorClass(group.color)}"
                  style="width:${event.progress}%"
                ></span>
              </span>

              <span class="progress-label">進行度 ${event.progress}%</span>
            </span>

            <span class="event-range">${formatRange(event.start, event.end)}</span>
          </span>

          <span class="event-remain ${toneClass}">
            <span class="remain-prefix">${remain.prefix}</span>
            <span class="remain-big">${remain.big}</span>
          </span>
        `;

        eventBtn.addEventListener("click", () => {
          openDetail({
            ...event,
            game: group.game
          });
        });

        eventsEl.appendChild(eventBtn);
      });

    ongoingList.appendChild(section);
  });
}

function renderCalendar() {
  const dayWidth = parseInt(
    getComputedStyle(document.documentElement)
      .getPropertyValue("--day-width")
  );

  const startDate = new Date("2025-05-18T00:00:00");
  const endDate = new Date("2025-06-08T00:00:00");

  const days = [];

  for (
    let d = new Date(startDate);
    d <= endDate;
    d.setDate(d.getDate() + 1)
  ) {
    days.push(new Date(d));
  }

  calendarHeader.innerHTML = "";
  calendarBody.innerHTML = "";
  calendarGameRows.innerHTML = "";

  days.forEach(date => {
    const cell = document.createElement("div");

    const isToday =
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate();

    cell.className = `day-cell ${isToday ? "today" : ""}`;

    cell.innerHTML = `
      <span class="day-month">${date.getMonth() + 1}月</span>
      <span class="day-number">${date.getDate()}</span>
    `;

    calendarHeader.appendChild(cell);
  });

  const totalWidth = days.length * dayWidth;
  calendarBody.style.width = `${totalWidth}px`;

  eventData.forEach(group => {
    const leftCell = document.createElement("div");
    leftCell.className = "calendar-game-cell";

    leftCell.innerHTML = `
      <span class="calendar-game-icon">${group.icon}</span>
      <span class="calendar-game-name">${group.game}</span>
    `;

    calendarGameRows.appendChild(leftCell);

    const row = document.createElement("div");
    row.className = "calendar-row";

    group.events.forEach((event, index) => {
      const start = toDate(event.start);
      const end = toDate(event.end);

      const startOffsetDays = Math.floor(
        (start - startDate) / (1000 * 60 * 60 * 24)
      );

      const endOffsetDays = Math.ceil(
        (end - startDate) / (1000 * 60 * 60 * 24)
      );

      const left = Math.max(0, startOffsetDays * dayWidth + 5);

      const width = Math.max(
        dayWidth * 1.5,
        (endOffsetDays - startOffsetDays + 1) * dayWidth - 10
      );

      const top = 13 + index * 48;

      const bar = document.createElement("button");
      bar.type = "button";
      bar.className = `event-bar ${group.color}`;

      bar.style.left = `${left}px`;
      bar.style.top = `${top}px`;
      bar.style.width = `${width}px`;

      bar.innerHTML = `
        <span class="bar-icon">${group.icon}</span>

        <span class="event-bar-title">
          <span>${event.title}</span>
          <small>${formatShortRange(event.start, event.end)}</small>
        </span>
      `;

      bar.addEventListener("click", () => {
        openDetail({
          ...event,
          game: group.game
        });
      });

      row.appendChild(bar);
    });

    calendarBody.appendChild(row);
  });

  const todayOffsetDays = Math.floor(
    (today - startDate) / (1000 * 60 * 60 * 24)
  );

  todayLine.style.left = `${todayOffsetDays * dayWidth + dayWidth / 2}px`;

  requestAnimationFrame(() => {
    todayLine.style.height = `${calendarBody.offsetHeight}px`;
  });
}

function jumpToToday() {
  const dayWidth = parseInt(
    getComputedStyle(document.documentElement)
      .getPropertyValue("--day-width")
  );

  const startDate = new Date("2025-05-18T00:00:00");

  const todayOffsetDays = Math.floor(
    (today - startDate) / (1000 * 60 * 60 * 24)
  );

  const target =
    todayOffsetDays * dayWidth -
    calendarBodyScroll.clientWidth / 2 +
    dayWidth / 2;

  calendarBodyScroll.scrollTo({
    left: Math.max(0, target),
    behavior: "smooth"
  });
}

function openDetail(event) {
  const remain = getRemainingLabel(event.end);

  detailGame.textContent = event.game;
  detailTitle.textContent = event.title;
  detailRemain.textContent =
    remain.prefix
      ? `${remain.prefix} ${remain.big}`
      : remain.big;

  detailDate.textContent = formatRange(event.start, event.end);
  detailRelated.textContent = event.related || "関連イベントなし";
  detailMemo.textContent = event.memo || "メモはありません。";
  detailSource.textContent = event.source || "Wikiを開く";
  detailSource.href = event.source || "#";

  detailOverlay.classList.add("open");
  detailSheet.classList.add("open");
  detailSheet.setAttribute("aria-hidden", "false");
}

function closeDetail() {
  detailOverlay.classList.remove("open");
  detailSheet.classList.remove("open");
  detailSheet.setAttribute("aria-hidden", "true");
}

function setScreen(name) {
  Object.entries(screens).forEach(([key, element]) => {
    element.classList.toggle("active", key === name);
  });

  topTabs.forEach(button => {
    button.classList.toggle(
      "active",
      button.dataset.screen === name
    );
  });

  bottomNavBtns.forEach(button => {
    button.classList.toggle(
      "active",
      button.dataset.screen === name
    );
  });

  contentScroll.scrollTop = 0;

  if (name === "calendar") {
    renderCalendar();

    requestAnimationFrame(() => {
      jumpToToday();
    });
  }
}

function syncCalendarScroll() {
  let syncing = false;

  calendarBodyScroll.addEventListener("scroll", () => {
    if (syncing) return;

    syncing = true;
    calendarHeaderScroll.scrollLeft = calendarBodyScroll.scrollLeft;
    syncing = false;
  });

  calendarHeaderScroll.addEventListener("scroll", () => {
    if (syncing) return;

    syncing = true;
    calendarBodyScroll.scrollLeft = calendarHeaderScroll.scrollLeft;
    syncing = false;
  });
}

function init() {
  todayLabel.textContent = formatTodayLabel(today);

  renderOngoing();
  renderCalendar();
  syncCalendarScroll();

  topTabs.forEach(button => {
    button.addEventListener("click", () => {
      setScreen(button.dataset.screen);
    });
  });

  bottomNavBtns.forEach(button => {
    button.addEventListener("click", () => {
      setScreen(button.dataset.screen);
    });
  });

  document
    .getElementById("refreshMockBtn")
    .addEventListener("click", renderOngoing);

  document
    .getElementById("todayJumpBtn")
    .addEventListener("click", jumpToToday);

  closeDetailBtn.addEventListener("click", closeDetail);
  closeDetailBtnBottom.addEventListener("click", closeDetail);
  detailOverlay.addEventListener("click", closeDetail);

  setScreen("ongoing");
}

init();
