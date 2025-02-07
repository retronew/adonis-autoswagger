const a = `/* basic theme */
.light-mode {
  --scalar-background-1: #fff;
  --scalar-background-2: #f5f6f8;
  --scalar-background-3: #eceef1;

  --scalar-color-1: #2a2f45;
  --scalar-color-2: #757575;
  --scalar-color-3: #8e8e8e;

  --scalar-color-accent: #5469d4;
  --scalar-background-accent: #5469d41f;

  --scalar-border-color: rgba(215, 215, 206, 0.68);
}
.dark-mode {
  --scalar-background-1: #15171c;
  --scalar-background-2: #1c1e24;
  --scalar-background-3: #22252b;

  --scalar-color-1: #fafafa;
  --scalar-color-2: #c9ced8;
  --scalar-color-3: #8c99ad;

  --scalar-color-accent: #5469d4;
  --scalar-background-accent: #5469d41f;

  --scalar-border-color: #3f4145;
}
/* Document Sidebar */
.light-mode .t-doc__sidebar,
.dark-mode .t-doc__sidebar {
  --scalar-sidebar-background-1: var(--scalar-background-1);
  --scalar-sidebar-color-1: var(--scalar-color-1);
  --scalar-sidebar-color-2: var(--scalar-color-2);
  --scalar-sidebar-border-color: var(--scalar-border-color);

  --scalar-sidebar-item-hover-color: currentColor;
  --scalar-sidebar-item-hover-background: var(--scalar-background-3);

  --scalar-sidebar-item-active-background: var(--scalar-background-accent);
  --scalar-sidebar-color-active: var(--scalar-color-accent);

  --scalar-sidebar-search-background: var(--scalar-background-1);
  --scalar-sidebar-search-color: var(--scalar-color-3);
  --scalar-sidebar-search-border-color: var(--scalar-border-color);
}

/* advanced */
.light-mode {
  --scalar-color-green: #17803d;
  --scalar-color-red: #e10909;
  --scalar-color-yellow: #edbe20;
  --scalar-color-blue: #1763a6;
  --scalar-color-orange: #e25b09;
  --scalar-color-purple: #5c3993;

  --scalar-button-1: rgba(0, 0, 0, 1);
  --scalar-button-1-hover: rgba(0, 0, 0, 0.8);
  --scalar-button-1-color: rgba(255, 255, 255, 0.9);
}
.dark-mode {
  --scalar-color-green: #30a159;
  --scalar-color-red: #dc1b19;
  --scalar-color-yellow: #eec644;
  --scalar-color-blue: #2b7abf;
  --scalar-color-orange: #f07528;
  --scalar-color-purple: #7a59b1;

  --scalar-button-1: rgba(255, 255, 255, 1);
  --scalar-button-1-hover: rgba(255, 255, 255, 0.9);
  --scalar-button-1-color: black;
}
.light-mode *::selection {
  background-color: color-mix(
    in srgb,
    var(--scalar-color-accent),
    transparent 70%
  );
}
.dark-mode *::selection {
  background-color: color-mix(
    in srgb,
    var(--scalar-color-accent),
    transparent 50%
  );
}
`
export { a as default }
