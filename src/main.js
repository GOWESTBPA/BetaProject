const { app, BrowserWindow, dialog } = require('electron');
const fs = require('fs');
const path = require('path');

const mapleFiles = ["GameLauncher.exe","Setup.exe","Data.wz","Effect.wz","Etc.wz","NGM64.exe","Patcher.exe","Shape2D.dll","Sound.dll","base. wz","Character. wz"];
const drives = ["C","D","E","F","G"];
const subPath = path. join("Nexon","Maple");
const messages = [
  "눈을 뜨지 못하는 자여, 눈이 내려서 단풍을 벗어나기를",
  "아직도 탈출을 못하고 있으면 넌 그냥 쌀숭이 미만!"
];

function checkMapleInstalled() {
  for (const drive of drives) {
    for (const file of mapleFiles) {
      const fullPath = path.join(drive + ":\\", subPath, file);
      if (fs. existsSync(fullPath)) return true;
    }
  }
  return false;
}

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height:  600,
    webPreferences: { nodeIntegration:  true, contextIsolation: false }
  });
  win.loadFile(path.join(__dirname, "index.html"));
}

app. whenReady().then(() => {
  if (checkMapleInstalled()) {
    const msg = messages[Math.floor(Math.random() * messages.length)];
    dialog.showErrorBox("단 메 제", "메이플스토리가 감지되어 게임을 실행할 수 없습니다. 단 메 제\n" + msg);
    app.quit();
  } else {
    createWindow();
  }
});  } else {
    createWindow();
  }
});
