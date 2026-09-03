export const scrollToTopOfContent = (contentRef) => {
  const el = contentRef?.current;
  if (!el) return;
  el.scrollTo({ top: 0, behavior: "smooth" });
};
