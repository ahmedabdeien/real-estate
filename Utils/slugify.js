export default function slugify(text) {
  return text
    .toString()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[؀-ۿ]/g, (c) => c)
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w؀-ۿ-]/g, "")
    .replace(/--+/g, "-")
    + "-" + Date.now();
}
