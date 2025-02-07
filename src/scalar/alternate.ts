const a = `/* basic theme */
:root {
  --scalar-text-decoration: underline;
  --scalar-text-decoration-hover: underline;
}
.light-mode,
.light-mode .dark-mode {
  --scalar-background-1: #f9f9f9;
  --scalar-background-2: #f1f1f1;
  --scalar-background-3: #e7e7e7;
  --scalar-background-card: #fff;

  --scalar-color-1: #2a2f45;
  --scalar-color-2: #757575;
  --scalar-color-3: #8e8e8e;

  --scalar-color-accent: var(--scalar-color-1);
  --scalar-background-accent: var(--scalar-background-3);

  --scalar-border-color: rgba(0, 0, 0, 0.1);
}
.dark-mode {
  --scalar-background-1: #131313;
  --scalar-background-2: #1d1d1d;
  --scalar-background-3: #272727;
  --scalar-background-card: #1d1d1d;

  --scalar-color-1: rgba(255, 255, 255, 0.9);
  --scalar-color-2: rgba(255, 255, 255, 0.62);
  --scalar-color-3: rgba(255, 255, 255, 0.44);

  --scalar-color-accent: var(--scalar-color-1);
  --scalar-background-accent: var(--scalar-background-3);

  --scalar-border-color: #2a2b2a;
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

  --scalar-sidebar-item-active-background: var(--scalar-background-accent);
  --scalar-sidebar-color-active: var(--scalar-color-accent);

  --scalar-sidebar-search-background: transparent;
  --scalar-sidebar-search-color: var(--scalar-color-3);
  --scalar-sidebar-search-border-color: var(--scalar-border-color);

  --scalar-sidebar-indent-border: var(--scalar-sidebar-border-color);
  --scalar-sidebar-indent-border-hover: var(--scalar-sidebar-border-color);
  --scalar-sidebar-indent-border-active: var(--scalar-sidebar-border-color);
}
/* advanced */
.light-mode .dark-mode,
.light-mode {
  --scalar-color-green: #069061;
  --scalar-color-red: #ef0006;
  --scalar-color-yellow: #edbe20;
  --scalar-color-blue: #0082d0;
  --scalar-color-orange: #fb892c;
  --scalar-color-purple: #5203d1;

  --scalar-button-1: rgba(0, 0, 0, 1);
  --scalar-button-1-hover: rgba(0, 0, 0, 0.8);
  --scalar-button-1-color: rgba(255, 255, 255, 0.9);
}
.dark-mode {
  --scalar-color-green: #00b648;
  --scalar-color-red: #dd2f2c;
  --scalar-color-yellow: #ffc90d;
  --scalar-color-blue: #4eb3ec;
  --scalar-color-orange: #ff8d4d;
  --scalar-color-purple: #b191f9;

  --scalar-button-1: rgba(255, 255, 255, 1);
  --scalar-button-1-hover: rgba(255, 255, 255, 0.9);
  --scalar-button-1-color: black;
}

.scalar-api-client__item,
.scalar-card,
.dark-mode .dark-mode.scalar-card {
  --scalar-background-1: var(--scalar-background-card);
  --scalar-background-2: var(--scalar-background-1);
  --scalar-background-3: var(--scalar-background-1);
}
.dark-mode .dark-mode.scalar-card {
  --scalar-background-3: var(--scalar-background-3);
}
.t-doc__sidebar {
  --scalar-color-green: var(--scalar-color-1);
  --scalar-color-red: var(--scalar-color-1);
  --scalar-color-yellow: var(--scalar-color-1);
  --scalar-color-blue: var(--scalar-color-1);
  --scalar-color-orange: var(--scalar-color-1);
  --scalar-color-purple: var(--scalar-color-1);
}
.light-mode *::selection {
  background-color: color-mix(
    in srgb,
    var(--scalar-color-blue),
    transparent 70%
  );
}
.dark-mode *::selection {
  background-color: color-mix(
    in srgb,
    var(--scalar-color-blue),
    transparent 50%
  );
}
`
export { a as default }
