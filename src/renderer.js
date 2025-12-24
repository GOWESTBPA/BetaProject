const fs = require('fs');
const path = require('path');

const SONGS_DIR = path.join(__dirname, "..", "songs");
const SONGS_JSON_PATH = path.join(__dirname, "..", "songs.json");

async function fetchSongs() {
  try {
    const data = fs.readFileSync(SONGS_JSON_PATH, 'utf-8');
    const songs = JSON.parse(data);
    
    for (const song of songs) {
      const localMp4 = path.join(SONGS_DIR, song.file);
      const localNotes = path.join(SONGS_DIR, song.notes);
      if (!fs.existsSync(localMp4) || !fs.existsSync(localNotes)) {
        console.log("다운로드 필요:", song.title);
      }
    }
    displaySongList(songs);
  } catch(e) { console.error(e); }
}

function displaySongList(songs) {
  const container = document.getElementById("song-list");
  container.innerHTML = "";
  songs.forEach(song => {
    const btn = document.createElement("button");
    btn.textContent = song.title + " - " + song.artist;
    btn.onclick = () => startGame(song);
    container.appendChild(btn);
  });
}

function startGame(song) {
  console.log("게임 시작:", song.title);
  const gameWindow = window.open("game.html", "_blank", "width=800,height=600");
  gameWindow.songData = song;
}

window.onload = () => {
  fetchSongs();
}