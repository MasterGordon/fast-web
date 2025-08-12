document.addEventListener("pointerdown", (e) => {
  const target = e.target;
  if (target instanceof HTMLElement) {
    if (target.tagName == "A" && !target.getAttribute("target")) {
      e.preventDefault();
      e.stopPropagation();
      const href = target.getAttribute("href")!;
      window.history.pushState({}, "", href);
      fetch(href).then(async (res) => {
        window.document.documentElement.innerHTML = await res.text();
      });
    }
  }
});
