const a = `/* basic theme */
:root {
  --scalar-text-decoration: underline;
  --scalar-text-decoration-hover: underline;
}
.light-mode {
  --scalar-background-1: #f0f2f5;
  --scalar-background-2: #eaecf0;
  --scalar-background-3: #e0e2e6;
  --scalar-border-color: rgb(213 213 213);

  --scalar-color-1: rgb(9, 9, 11);
  --scalar-color-2: rgb(113, 113, 122);
  --scalar-color-3: rgba(25, 25, 28, 0.5);

  --scalar-color-accent: var(--scalar-color-1);
  --scalar-background-accent: #8ab4f81f;
}
.light-mode .scalar-card.dark-mode,
.dark-mode {
  --scalar-background-1: #000e23;
  --scalar-background-2: #01132e;
  --scalar-background-3: #03193b;
  --scalar-border-color: #2e394c;

  --scalar-color-1: #fafafa;
  --scalar-color-2: rgb(161, 161, 170);
  --scalar-color-3: rgba(255, 255, 255, 0.533);

  --scalar-color-accent: var(--scalar-color-1);
  --scalar-background-accent: #8ab4f81f;

  --scalar-code-language-color-supersede: var(--scalar-color-1);
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
  --scalar-sidebar-color-active: var(--scalar-color-accent);

  --scalar-sidebar-search-background: rgba(255, 255, 255, 0.1);
  --scalar-sidebar-search-border-color: var(--scalar-border-color);
  --scalar-sidebar-search-color: var(--scalar-color-3);
  z-index: 1;
}
.light-mode .t-doc__sidebar {
  --scalar-sidebar-search-background: white;
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
/* Custom theme */
/* Document header */
@keyframes headerbackground {
  from {
    background: transparent;
    backdrop-filter: none;
  }
  to {
    background: var(--header-background-1);
    backdrop-filter: blur(12px);
  }
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
/* Hero Section Flare */
.section-flare-item:nth-of-type(1) {
  --c1: #ffffff;
  --c2: #babfd8;
  --c3: #2e8bb2;
  --c4: #1a8593;
  --c5: #0a143e;
  --c6: #0a0f52;
  --c7: #2341b8;

  --solid: var(--c1), var(--c2), var(--c3), var(--c4), var(--c5), var(--c6),
    var(--c7);
  --solid-wrap: var(--solid), var(--c1);
  --trans: var(--c1), transparent, var(--c2), transparent, var(--c3),
    transparent, var(--c4), transparent, var(--c5), transparent, var(--c6),
    transparent, var(--c7);
  --trans-wrap: var(--trans), transparent, var(--c1);

  background: radial-gradient(circle, var(--trans)),
    conic-gradient(from 180deg, var(--trans-wrap)),
    radial-gradient(circle, var(--trans)), conic-gradient(var(--solid-wrap));
  width: 70vw;
  height: 700px;
  border-radius: 50%;
  filter: blur(100px);
  z-index: 0;
  right: 0;
  position: absolute;
  transform: rotate(-45deg);
  top: -300px;
  opacity: 0.3;
}
.section-flare-item:nth-of-type(3) {
  --star-color: #6b9acc;
  --star-color2: #446b8d;
  --star-color3: #3e5879;
  background-image: radial-gradient(
      2px 2px at 20px 30px,
      var(--star-color2),
      rgba(0, 0, 0, 0)
    ),
    radial-gradient(2px 2px at 40px 70px, var(--star-color), rgba(0, 0, 0, 0)),
    radial-gradient(
      2px 2px at 50px 160px,
      var(--star-color3),
      rgba(0, 0, 0, 0)
    ),
    radial-gradient(2px 2px at 90px 40px, var(--star-color), rgba(0, 0, 0, 0)),
    radial-gradient(2px 2px at 130px 80px, var(--star-color), rgba(0, 0, 0, 0)),
    radial-gradient(
      2px 2px at 160px 120px,
      var(--star-color3),
      rgba(0, 0, 0, 0)
    );
  background-repeat: repeat;
  background-size: 200px 200px;
  width: 100%;
  height: 100%;
  mask-image: radial-gradient(ellipse at 100% 0%, black 40%, transparent 70%);
}
.section-flare {
  top: -150px !important;
  height: 100vh;
  background: linear-gradient(#000, var(--scalar-background-1));
  width: 100vw;
  overflow-x: hidden;
}
.light-mode .section-flare {
  display: none;
}
.light-mode .scalar-card {
  --scalar-background-1: #fff;
  --scalar-background-2: #fff;
  --scalar-background-3: #fff;
}

*::selection {
  background-color: color-mix(
    in srgb,
    var(--scalar-color-blue),
    transparent 60%
  );
}
`
export { a as default }
