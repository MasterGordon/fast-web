interface DevWindow extends Window {
  devListening?: boolean;
}

declare const window: DevWindow;

if (!window.devListening) {
  const ws = new WebSocket("ws://localhost:8081/ws");
  ws.addEventListener("message", () => {
    fetch(window.location.href).then(async (res) => {
      window.document.documentElement.innerHTML = await res.text();
    });
  });
  window.devListening = true;
}
