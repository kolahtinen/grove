// The loading page while grove starts (G-01 FR-032): fills the bar from /api/starting and opens the
// page that was asked for once grove is ready.
const bar = document.querySelector('.starting-bar');

async function poll() {
  try {
    const res = await fetch('/api/starting', { cache: 'no-store' });
    if (res.ok) {
      const { ready, progress } = await res.json();
      bar.value = progress;
      if (ready) {
        location.reload();
        return;
      }
    }
  } catch {
    // grove may not be answering yet; try again.
  }
  setTimeout(poll, 300);
}

poll();
