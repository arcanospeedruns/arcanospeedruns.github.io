// Gerador do site (Eleventy). Fonte em src/, saída em _site/ (publicada pelo GitHub Actions).
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

module.exports = function (config) {
  // arquivos que vão como estão (css, js, imagens, fontes, pdf)
  for (const ext of ["css", "js", "webp", "jpg", "png", "svg", "pdf", "woff2", "txt"]) {
    config.addPassthroughCopy(`src/**/*.${ext}`);
  }
  config.addPassthroughCopy("src/empregos-*.json"); // dados e malha do mapa do emprego
  // "/style.css" -> "/style.css?v=<hash do conteúdo>": o navegador só baixa de novo quando o arquivo muda
  const cache = new Map();
  config.addFilter("versao", (arquivo) => {
    if (!cache.has(arquivo)) {
      const dados = fs.readFileSync(path.join("src", arquivo));
      cache.set(arquivo, crypto.createHash("sha1").update(dados).digest("hex").slice(0, 10));
    }
    return `${arquivo}?v=${cache.get(arquivo)}`;
  });
  config.on("eleventy.before", () => cache.clear());
  config.addFilter("dataISO", (d) => new Date(d).toISOString().slice(0, 10));
  // textos bilíngues: {% tr %}texto em português<!--en-->text in English{% endtr %}
  config.addPairedShortcode("tr", function (conteudo) {
    const [pt, en = ""] = conteudo.split("<!--en-->");
    return this.ctx && this.ctx.idioma === "en" ? en : pt;
  });
  return {
    dir: { input: "src", output: "_site", includes: "_includes", data: "_data" },
    templateFormats: ["njk"],
    htmlTemplateEngine: "njk",
  };
};
