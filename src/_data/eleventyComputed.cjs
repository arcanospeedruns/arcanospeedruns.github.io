// Páginas bilíngues: cada modelo gera a versão em português e a em inglês
// (pagination por "idiomas"). Daqui saem a língua, o endereço da outra versão
// e os campos que mudam por idioma (meta.pt / meta.en no cabeçalho do modelo).
const POR_IDIOMA = ["titulo", "descricao", "ogTitulo", "ogDescricao", "ogImagem", "scripts", "preload"];

const computado = {
  lang: (d) => (d.idioma ? (d.idioma === "en" ? "en" : "pt-BR") : d.lang),
  par: (d) => (d.idioma && d.caminho ? (d.idioma === "en" ? d.caminho : "/en" + d.caminho) : d.par),
  prints: (d) => (d.printsPorIdioma && d.idioma ? d.printsPorIdioma[d.idioma] : d.prints),
};
for (const k of POR_IDIOMA) {
  computado[k] = (d) => (d.meta && d.idioma && d.meta[d.idioma] && k in d.meta[d.idioma] ? d.meta[d.idioma][k] : d[k]);
}
module.exports = computado;
