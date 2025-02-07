const a = `/* basic theme */
:root {
  --scalar-text-decoration: underline;
  --scalar-text-decoration-hover: underline;
}
.light-mode {
  --scalar-background-1: #f9f6f0;
  --scalar-background-2: #f2efe8;
  --scalar-background-3: #e9e7e2;
  --scalar-border-color: rgba(203, 165, 156, 0.6);

  --scalar-color-1: #c75549;
  --scalar-color-2: #c75549;
  --scalar-color-3: #c75549;

  --scalar-color-accent: #c75549;
  --scalar-background-accent: #dcbfa81f;

  --scalar-code-language-color-supersede: var(--scalar-color-1);
}
.dark-mode {
  --scalar-background-1: #140507;
  --scalar-background-2: #20090c;
  --scalar-background-3: #321116;
  --scalar-border-color: #3c3031;

  --scalar-color-1: rgba(255, 255, 255, 0.9);
  --scalar-color-2: rgba(255, 255, 255, 0.62);
  --scalar-color-3: rgba(255, 255, 255, 0.44);

  --scalar-color-accent: rgba(255, 255, 255, 0.9);
  --scalar-background-accent: #441313;

  --scalar-code-language-color-supersede: var(--scalar-color-1);
}

/* Document Sidebar */
.light-mode .t-doc__sidebar,
.dark-mode .t-doc__sidebar {
  --scalar-sidebar-background-1: var(--scalar-background-1);
  --scalar-sidebar-color-1: var(--scalar-color-1);
  --scalar-sidebar-color-2: var(--scalar-color-2);
  --scalar-sidebar-border-color: var(--scalar-border-color);

  --scalar-sidebar-item-hover-color: currentColor;
  --scalar-sidebar-item-hover-background: var(--scalar-background-2);

  --scalar-sidebar-item-active-background: var(--scalar-background-3);
  --scalar-sidebar-color-active: var(--scalar-color-accent);

  --scalar-sidebar-search-background: rgba(255, 255, 255, 0.1);
  --scalar-sidebar-search-color: var(--scalar-color-3);
  --scalar-sidebar-search-border-color: var(--scalar-border-color);
  z-index: 1;
}
/* advanced */
.light-mode {
  --scalar-color-green: #09533a;
  --scalar-color-red: #aa181d;
  --scalar-color-yellow: #ab8d2b;
  --scalar-color-blue: #19689a;
  --scalar-color-orange: #b26c34;
  --scalar-color-purple: #4c2191;

  --scalar-button-1: rgba(0, 0, 0, 1);
  --scalar-button-1-hover: rgba(0, 0, 0, 0.8);
  --scalar-button-1-color: rgba(255, 255, 255, 0.9);
}
.dark-mode {
  --scalar-color-green: rgba(69, 255, 165, 0.823);
  --scalar-color-red: #ff8589;
  --scalar-color-yellow: #ffcc4d;
  --scalar-color-blue: #6bc1fe;
  --scalar-color-orange: #f98943;
  --scalar-color-purple: #b191f9;

  --scalar-button-1: rgba(255, 255, 255, 1);
  --scalar-button-1-hover: rgba(255, 255, 255, 0.9);
  --scalar-button-1-color: black;
}
/* Custom Theme */
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
.light-mode .t-doc__sidebar {
  --scalar-sidebar-search-background: white;
}
.examples .scalar-card-footer {
  --scalar-background-3: transparent;
  padding-top: 0;
}
/* Hero section flare */
.section-flare {
  overflow-x: hidden;
  height: 100vh;
  left: initial;
}
.section-flare-item:nth-of-type(1) {
  background: #d25019;
  position: relative;
  top: -150px;
  right: -400px;
  width: 80vw;
  height: 500px;
  margin-top: -150px;
  border-radius: 50%;
  filter: blur(100px);
  z-index: 0;
}
.light-mode .section-flare {
  display: none;
}
*::selection {
  background-color: color-mix(
    in srgb,
    var(--scalar-color-red),
    transparent 75%
  );
}
`
export { a as default }
