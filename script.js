// —————————————————————————
// CONFIG
// —————————————————————————

// GANTI dengan URL Google Sheets kamu
const SHEET_URL = "https://opensheet.elk.sh/1AbCDeFgHiJKLM12345/GameList";

const MIN_DAILY = 50;
const MAX_DAILY = 98;
const MIN_CHANGE = 0.1;
const MAX_CHANGE = 1;

const UPDATE_INTERVAL = 5 * 60 * 1000; // 5 menit
const STORAGE_KEY = "rtpSystemAuto";


// —————————————————————————
// SYSTEM RTP RANDOM
// —————————————————————————

function loadRTPData() {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    const today = new Date().getDate();

    if (!saved) {
        const base = randomDaily();
        saveRTP(base, base, today);
        return { dailyBase: base, hourly: base, today };
    }

    if (saved.today !== today) {
        const base = randomDaily();
        saveRTP(base, base, today);
        return { dailyBase: base, hourly: base, today };
    }

    return saved;
}

function saveRTP(base, hourly, today) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ dailyBase: base, hourly, today }));
}

function randomDaily() {
    return Number((Math.random() * (MAX_DAILY - MIN_DAILY) + MIN_DAILY).toFixed(2));
}

function randomChange() {
    return Number((Math.random() * (MAX_CHANGE - MIN_CHANGE) + MIN_CHANGE).toFixed(2));
}

function updateRTP() {
    let data = loadRTPData();
    let rtp = data.hourly;

    const change = randomChange();
    const dir = Math.random() < 0.5 ? -1 : 1;

    rtp = Number((rtp + change * dir).toFixed(2));

    if (rtp > 99.9) rtp = 99.9;
    if (rtp < 30) rtp = 30;

    saveRTP(data.dailyBase, rtp, data.today);
}


// —————————————————————————
// FETCH DATA GOOGLE SHEETS
// —————————————————————————

async function getGameList() {
    try {
        const res = await fetch(SHEET_URL);
        return await res.json();
    } catch (e) {
        console.error("Error loading sheets: ", e);
        return [];
    }
}


// —————————————————————————
// RENDER UI
// —————————————————————————

async function renderRTP() {
    const list = await getGameList();
    const container = document.getElementById("rtp-container");
    container.innerHTML = "";

    const data = loadRTPData();
    const rtp = data.hourly;

    list.forEach(item => {
        const card = document.createElement("div");
        card.classList.add("card");

        card.innerHTML = `
            <img src="${item.image_url}">
            <h2>${item.game_name}</h2>
            <div class="rtp">${rtp}%</div>
        `;

        container.appendChild(card);
    });
}


// —————————————————————————
// RUN SYSTEM
// —————————————————————————

renderRTP();

setInterval(() => {
    updateRTP();
    renderRTP();
}, UPDATE_INTERVAL);
