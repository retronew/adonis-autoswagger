const a = `/* basic theme */
.light-mode {
  --scalar-background-1: #fff;
  --scalar-background-2: #f6f6f6;
  --scalar-background-3: #e7e7e7;
  --scalar-background-accent: #8ab4f81f;

  --scalar-color-1: #2a2f45;
  --scalar-color-2: #757575;
  --scalar-color-3: #8e8e8e;

  --scalar-color-accent: #0099ff;
  --scalar-border-color: #dfdfdf;
}
.dark-mode {
  --scalar-background-1: #0f0f0f;
  --scalar-background-2: #1a1a1a;
  --scalar-background-3: #272727;

  --scalar-color-1: #e7e7e7;
  --scalar-color-2: #a4a4a4;
  --scalar-color-3: #797979;

  --scalar-color-accent: #3ea6ff;
  --scalar-background-accent: #3ea6ff1f;

  --scalar-border-color: #2d2d2d;
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

  --scalar-sidebar-item-active-background: var(--scalar-background-2);
  --scalar-sidebar-color-active: var(--scalar-color-1);

  --scalar-sidebar-search-background: transparent;
  --scalar-sidebar-search-color: var(--scalar-color-3);
  --scalar-sidebar-search-border-color: var(--scalar-border-color);
}
/* advanced */
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

  --scalar-danger-color: color-mix(
    in srgb,
    var(--scalar-color-red),
    var(--scalar-color-1) 20%
  );
}
.dark-mode {
  --scalar-color-green: #00b648;
  --scalar-color-red: #dc1b19;
  --scalar-color-yellow: #ffc90d;
  --scalar-color-blue: #4eb3ec;
  --scalar-color-orange: #ff8d4d;
  --scalar-color-purple: #b191f9;

  --scalar-button-1: rgba(255, 255, 255, 1);
  --scalar-button-1-hover: rgba(255, 255, 255, 0.9);
  --scalar-button-1-color: black;

  --scalar-danger-color: color-mix(
    in srgb,
    var(--scalar-color-red),
    var(--scalar-background-1) 20%
  );
}
`
export { a as default }
