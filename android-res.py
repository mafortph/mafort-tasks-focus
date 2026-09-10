# Gera ícones, ícone de notificação e splash do Android a partir de docs/icons/icon-512.png
import os, glob
from PIL import Image
SRC = 'icon-512.png'
RES = 'android/app/src/main/res'
BG = (46, 94, 99)          # verde-petróleo do app
PAPER = (244, 243, 239)    # fundo claro
base = Image.open(SRC).convert('RGBA')

dens = {'mdpi': 1, 'hdpi': 1.5, 'xhdpi': 2, 'xxhdpi': 3, 'xxxhdpi': 4}
for n, k in dens.items():
    s = int(48 * k); os.makedirs(f'{RES}/mipmap-{n}', exist_ok=True)
    ic = base.resize((s, s), Image.LANCZOS)
    ic.save(f'{RES}/mipmap-{n}/ic_launcher.png'); ic.save(f'{RES}/mipmap-{n}/ic_launcher_round.png')
    # foreground adaptativo: 108dp, conteúdo dentro da zona segura central (66dp)
    f = int(108 * k); fg = Image.new('RGBA', (f, f), (0, 0, 0, 0))
    inner = int(f * 0.62); im = base.resize((inner, inner), Image.LANCZOS)
    fg.paste(im, ((f - inner) // 2, (f - inner) // 2), im); fg.save(f'{RES}/mipmap-{n}/ic_launcher_foreground.png')
    # ícone da notificação: branco sobre transparente (24dp)
    d = int(24 * k); os.makedirs(f'{RES}/drawable-{n}', exist_ok=True)
    sm = base.resize((d, d), Image.LANCZOS); px = sm.load()
    for y in range(d):
        for x in range(d):
            r, g, b, a = px[x, y]
            keep = a > 0 and abs(r - PAPER[0]) + abs(g - PAPER[1]) + abs(b - PAPER[2]) > 30
            px[x, y] = (255, 255, 255, 255 if keep else 0)
    sm.save(f'{RES}/drawable-{n}/ic_stat_icon.png')

# cor de fundo do ícone adaptativo
os.makedirs(f'{RES}/values', exist_ok=True)
open(f'{RES}/values/ic_launcher_background.xml', 'w').write(
    '<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="ic_launcher_background">#2E5E63</color>\n</resources>\n')

# splash: fundo claro com o ícone ao centro
for path in glob.glob(f'{RES}/drawable*/splash.png'):
    W = 1920; sp = Image.new('RGB', (W, W), PAPER)
    ic = base.resize((360, 360), Image.LANCZOS); sp.paste(ic, ((W - 360) // 2, (W - 360) // 2), ic)
    sp.save(path)
print('recursos Android gerados')
