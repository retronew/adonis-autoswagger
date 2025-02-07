const a = `/* basic theme */
.light-mode {
  --scalar-background-1: #f3f3ee;
  --scalar-background-2: #e8e8e3;
  --scalar-background-3: #e4e4df;
  --scalar-border-color: rgba(215, 215, 206, 0.85);

  --scalar-color-1: #2a2f45;
  --scalar-color-2: #757575;
  --scalar-color-3: #8e8e8e;

  --scalar-color-accent: #1763a6;
  --scalar-background-accent: #1f648e1f;
}
.dark-mode {
  --scalar-background-1: #09090b;
  --scalar-background-2: #18181b;
  --scalar-background-3: #2c2c30;
  --scalar-border-color: rgba(255, 255, 255, 0.17);

  --scalar-color-1: #fafafa;
  --scalar-color-2: rgb(161, 161, 170);
  --scalar-color-3: rgba(255, 255, 255, 0.533);

  --scalar-color-accent: #4eb3ec;
  --scalar-background-accent: #8ab4f81f;
}
/* Document Sidebar */
.light-mode .t-doc__sidebar,
.dark-mode .t-doc__sidebar {
  --scalar-sidebar-background-1: var(--scalar-background-1);
  --scalar-sidebar-color-1: var(--scalar-color-1);
  --scalar-sidebar-color-2: var(--scalar-color-2);
  --scalar-sidebar-border-color: var(--scalar-border-color);

  --scalar-sidebar-item-hover-background: var(--scalar-background-2);
  --scalar-sidebar-item-hover-color: currentColor;

  --scalar-sidebar-item-active-background: var(--scalar-background-3);
  --scalar-sidebar-color-active: var(--scalar-color-1);

  --scalar-sidebar-search-background: var(--scalar-background-1);
  --scalar-sidebar-search-border-color: var(--scalar-border-color);
  --scalar-sidebar-search-color: var(--scalar-color-3);
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
.dark-mode h2.t-editor__heading,
.dark-mode .t-editor__page-title h1,
.dark-mode h1.section-header:not(::selection),
.dark-mode .markdown h1,
.dark-mode .markdown h2,
.dark-mode .markdown h3,
.dark-mode .markdown h4,
.dark-mode .markdown h5,
.dark-mode .markdown h6 {
  -webkit-text-fill-color: transparent;
  background-image: linear-gradient(
    to right bottom,
    rgb(255, 255, 255) 30%,
    rgba(255, 255, 255, 0.38)
  );
  -webkit-background-clip: text;
  background-clip: text;
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
