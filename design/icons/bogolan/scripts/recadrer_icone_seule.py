"""Recadre une image contenant une seule tuile d'icône (fond blanc) en PNG 256 x 256 transparent.
Usage : python3 recadrer_icone_seule.py ../planches/ss-wifi.png ../png/wifi.png"""
import sys
import numpy as np
from PIL import Image, ImageDraw
im = Image.open(sys.argv[1]).convert('RGB'); a = np.asarray(im).astype(int)
ys, xs = np.where(np.abs(a - 255).sum(2) > 14)   # pixels nettement plus foncés que le blanc
x0, x1, y0, y1 = xs.min(), xs.max(), ys.min(), ys.max()
c = im.crop((x0 + 4, y0 + 4, x1 - 4, y1 - 12)).convert('RGBA'); w, h = c.size   # -12 : sans l'ombre du bas
m = Image.new('L', (w, h), 0); ImageDraw.Draw(m).rounded_rectangle((0, 0, w - 1, h - 1), radius=int(min(w, h) * 0.2), fill=255)
c.putalpha(m); s = max(w, h)
sq = Image.new('RGBA', (s, s), (0, 0, 0, 0)); sq.paste(c, ((s - w) // 2, (s - h) // 2), c)
sq.resize((256, 256), Image.LANCZOS).save(sys.argv[2])
