type HistoryArgs = Parameters<History['pushState']>;

/** Patch SPA history so navigation between chats is detected (same-origin). */
export function patchSpaNavigation(onPathChange: () => void): () => void {
  let path = `${location.pathname}${location.search}`;
  const fireIfChanged = () => {
    const next = `${location.pathname}${location.search}`;
    if (next !== path) {
      path = next;
      onPathChange();
    }
  };

  const origPush = history.pushState.bind(history);
  const origReplace = history.replaceState.bind(history);

  history.pushState = (...args: HistoryArgs): void => {
    origPush(...args);
    fireIfChanged();
  };
  history.replaceState = (...args: HistoryArgs): void => {
    origReplace(...args);
    fireIfChanged();
  };

  window.addEventListener('popstate', fireIfChanged);
  window.addEventListener('hashchange', fireIfChanged);

  const interval = window.setInterval(() => {
    fireIfChanged();
  }, 800);

  return () => {
    history.pushState = origPush;
    history.replaceState = origReplace;
    window.removeEventListener('popstate', fireIfChanged);
    window.removeEventListener('hashchange', fireIfChanged);
    clearInterval(interval);
  };
}
