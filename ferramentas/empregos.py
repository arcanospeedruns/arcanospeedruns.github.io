"""Gera src/empregos-dados.json: saldo de empregos formais (Novo CAGED) por município, mês e setor.

Uso:  python3 ferramentas/empregos.py 2026 [pasta-de-trabalho]
Baixa os microdados do espelho do Novo CAGED no HuggingFace (o mesmo que o pacote datacaged usa),
soma as movimentações do mês (MOV), as declaradas fora do prazo (FOR) e desconta as excluídas (EXC).
Precisa de: pip install pandas py7zr

A malha (src/empregos-mapa.json) vem do geodata-br (CC0), simplificada e projetada com o mapshaper:
  npx mapshaper geojs-100-mun.json -each 'cod=String(id).slice(0,6), uf=String(id).slice(0,2), delete id, delete description' \
    -simplify 4% keep-shapes -proj webmercator -o mun.json format=topojson quantization=8000
  npx mapshaper mun.json -dissolve uf -o uf.json format=topojson quantization=8000
  npx mapshaper -i mun.json uf.json combine-files -rename-layers mun,uf -o src/empregos-mapa.json format=topojson quantization=8000
"""
import json, os, sys, urllib.request
from collections import defaultdict
import pandas as pd, py7zr

ANO = sys.argv[1] if len(sys.argv) > 1 else "2026"
PASTA = sys.argv[2] if len(sys.argv) > 2 else "/tmp/caged"
BASE = "https://huggingface.co/datasets/alexsandroprado/caged/resolve/main/NOVO_CAGED"
API = "https://huggingface.co/api/datasets/alexsandroprado/caged/tree/main/NOVO_CAGED"
SETORES = ["Agropecuária", "Indústria", "Construção", "Comércio", "Serviços", "Não identificado"]
def setor(secao):
    if secao == "A": return 0
    if secao in "BCDE": return 1
    if secao == "F": return 2
    if secao == "G": return 3
    if secao in "HIJKLMNOPQRSTU": return 4
    return 5

os.makedirs(PASTA, exist_ok=True)
meses = sorted(x["path"].split("/")[-1] for x in json.load(urllib.request.urlopen(f"{API}/{ANO}")) if x["type"] == "directory")
print("competências:", meses)
COLS = ["competênciamov", "município", "seção", "saldomovimentação"]
saldo = defaultdict(int); adm = defaultdict(int); desl = defaultdict(int)   # chave: (município, mês, setor)

for comp in meses:
    for tipo in ("MOV", "FOR", "EXC"):
        nome = f"CAGED{tipo}{comp}"
        z = os.path.join(PASTA, nome + ".7z")
        if not os.path.exists(z) or os.path.getsize(z) == 0:
            print("baixando", nome); urllib.request.urlretrieve(f"{BASE}/{ANO}/{comp}/{nome}.7z", z)
        with py7zr.SevenZipFile(z) as a: a.extractall(PASTA)
        txt = os.path.join(PASTA, nome + ".txt")
        sinal = -1 if tipo == "EXC" else 1
        for df in pd.read_csv(txt, sep=";", usecols=COLS, dtype={"seção": str}, chunksize=2_000_000, encoding="utf-8"):
            df = df[df["competênciamov"].astype(str).str.startswith(ANO)]
            df["mes"] = df["competênciamov"] % 100
            df["setor"] = df["seção"].fillna("Z").map(setor)
            g = df.groupby(["município", "mes", "setor", "saldomovimentação"]).size()
            for (mun, mes, st, s), n in g.items():
                k = (int(mun), int(mes), int(st))
                saldo[k] += sinal * s * n
                if s > 0: adm[k] += sinal * n
                else: desl[k] += sinal * n
        os.remove(txt)
        print(nome, "ok")

nm = int(meses[-1][4:])
muns = sorted({k[0] for k in saldo})
# por município: saldo[mês][setor], admissões[mês] e desligamentos[mês]
dados = {}
for m in muns:
    dados[m] = {
        "s": [[saldo.get((m, mes, st), 0) for st in range(6)] for mes in range(1, nm + 1)],
        "a": [sum(adm.get((m, mes, st), 0) for st in range(6)) for mes in range(1, nm + 1)],
        "d": [sum(desl.get((m, mes, st), 0) for st in range(6)) for mes in range(1, nm + 1)],
    }
saida = {"ano": int(ANO), "meses": nm, "setores": SETORES, "fonte": "Novo CAGED/MTE", "mun": dados}
with open("src/empregos-dados.json", "w", encoding="utf-8") as f: json.dump(saida, f, separators=(",", ":"))
tot = sum(sum(sum(x) for x in d["s"]) for d in dados.values())
print("municípios:", len(muns), "| saldo Brasil no ano:", tot)
for cod, n in [(355030, "São Paulo"), (353440, "Osasco"), (350950, "Campinas"), (351110, "Catanduva"), (353980, "Poá")]:
    print(n, sum(sum(x) for x in dados[cod]["s"]))
