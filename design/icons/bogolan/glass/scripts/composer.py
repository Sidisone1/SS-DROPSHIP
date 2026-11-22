"""Icône finale : tuile en verre Glass Icon (OriginKit) + objet Bogolan détouré.
Usage : python3 composer.py <tuile.png> <png sources> <sortie> [taille=256]"""
import sys, os, numpy as np
from PIL import Image, ImageDraw, ImageFilter
from scipy import ndimage as nd
from scipy.spatial import ConvexHull
tuile_png, src, out = sys.argv[1:4]; T = int(sys.argv[4]) if len(sys.argv) > 4 else 256
os.makedirs(out, exist_ok=True)
SIMPLE = {'back', 'link', 'search', 'share', 'phone', 'chev'}
TOUT = False
PLEIN = {'bientot', 'chart', 'copy', 'devis', 'doc', 'file', 'mail', 'qr', 'star', 'store', 'plane', 'wifi', 'home', 'globe', 'chat'}
t = np.array(Image.open(tuile_png).convert('RGB')).astype(int)
# zone de la tuile : écart à la plaque (bord flou) -> boîte
plaque = np.array(Image.open(tuile_png.replace('-tuile', '-plaque')).convert('RGB')).astype(int)
diff = nd.binary_fill_holes(np.abs(t - plaque).sum(2) > 18)
ys, xs = np.where(diff); y0, y1, x0, x1 = ys.min(), ys.max(), xs.min(), xs.max()
c = Image.fromarray(t[y0:y1, x0:x1].astype('uint8')).resize((T * 2, T * 2), Image.LANCZOS)
S = T * 2; R = int(S * 0.22)
masque = Image.new('L', (S, S), 0); ImageDraw.Draw(masque).rounded_rectangle([0, 0, S - 1, S - 1], R, fill=255)
# reflets du verre : liseré clair en haut, ombre interne en bas
reflet = Image.new('RGBA', (S, S), (0, 0, 0, 0)); d = ImageDraw.Draw(reflet)
d.rounded_rectangle([3, 3, S - 4, S - 4], R - 3, outline=(255, 255, 255, 120), width=5)
grad = Image.new('L', (1, S)); grad.putdata([int(70 * max(0, 1 - y / (S * 0.45))) for y in range(S)])
haut = Image.new('RGBA', (S, S), (255, 255, 255, 0)); haut.putalpha(grad.resize((S, S)))
base = c.convert('RGBA'); base = Image.alpha_composite(base, haut); base = Image.alpha_composite(base, reflet)
for f in sorted(os.listdir(src)):
    if not f.endswith('.png'): continue
    a = np.array(Image.open(os.path.join(src, f)).convert('RGBA').resize((512, 512), Image.LANCZOS)).astype(int)
    tuile = a[..., 3] > 200
    anneau = nd.binary_erosion(tuile, iterations=14) & ~nd.binary_erosion(tuile, iterations=34)
    bg = np.median(a[anneau][:, :3], 0)
    dd = np.abs(a[..., :3] - bg).sum(2)
    interieur = nd.binary_erosion(tuile, iterations=12)
    rgb = a[..., :3]; mx = rgb.max(2); sat = mx - rgb.min(2)
    gris = (sat < 22) & (mx > 140) & (mx < 236)   # ombres portées grises de la tuile d'origine
    lum = rgb.mean(2); bgl = bg.mean()
    graine = (dd > 40) & ~gris & nd.binary_erosion(a[..., 3] > 200, iterations=12)
    pts = np.argwhere(graine)[:, ::-1]
    hull = pts[ConvexHull(pts).vertices] if len(pts) > 10 else pts
    env = Image.new('L', (512, 512), 0); ImageDraw.Draw(env).polygon([tuple(map(int, p)) for p in hull], fill=255)
    blob = np.array(env) > 0   # enveloppe convexe des parties colorées
    blancs = nd.binary_erosion(blob, iterations=3) & ((lum > bgl + 2) | (gris & (lum < bgl - 8))) & (sat < 30)   # blancs de l'objet : plus clairs que le fond de tuile
    nom = f[:-4]
    if nom in SIMPLE:   # objets sans partie blanche : pas d'ombrés gris (sinon traces d'ombre portée)
        blancs = nd.binary_erosion(blob, iterations=3) & (lum > bgl + 4) & (sat < 30)
    if nom in PLEIN or TOUT:    # feuilles blanches proches du fond : détourage GrabCut (OpenCV)
        import cv2
        gm = np.full((512, 512), cv2.GC_BGD, np.uint8)
        gm[nd.binary_erosion(tuile, iterations=40)] = cv2.GC_PR_BGD
        gm[nd.binary_dilation(blob, iterations=45) & interieur] = cv2.GC_PR_FGD
        gm[graine] = cv2.GC_FGD
        bm, fm = np.zeros((1, 65)), np.zeros((1, 65))
        cv2.grabCut(np.ascontiguousarray(rgb[..., ::-1].astype(np.uint8)), gm, None, bm, fm, 6, cv2.GC_INIT_WITH_MASK)
        blancs = nd.binary_fill_holes(nd.binary_opening((gm == cv2.GC_FGD) | (gm == cv2.GC_PR_FGD), iterations=2))
    blancs = nd.binary_opening(blancs, iterations=2)
    dur = (dd > 40) & interieur & ~gris
    dur = nd.binary_opening(dur, iterations=1)
    lab, n = nd.label(dur)
    if n:
        sz = nd.sum(dur, lab, range(1, n + 1)); dur = np.isin(lab, [i + 1 for i, s in enumerate(sz) if s > max(60, sz.max() * 0.01)])
    dur = dur | blancs
    plein = nd.binary_fill_holes(nd.binary_closing(dur, iterations=2))
    alpha = np.clip((dd - 18) / 30, 0, 1) * interieur * ~gris
    alpha = np.maximum(alpha * nd.binary_dilation(plein, iterations=2), plein * 1.0)
    obj = a.copy().astype('uint8'); obj[..., 3] = (alpha * 255).astype('uint8')
    obj = Image.fromarray(obj)
    bb = obj.getbbox(); obj = obj.crop(bb)
    k = S * 0.74 / max(obj.size); obj = obj.resize((max(1, int(obj.width * k)), max(1, int(obj.height * k))), Image.LANCZOS)
    im = base.copy()
    ox, oy = (S - obj.width) // 2, (S - obj.height) // 2
    ombre = Image.new('RGBA', (S, S), (0, 0, 0, 0)); sh = Image.new('RGBA', obj.size, (10, 30, 70, 150)); sh.putalpha(obj.split()[3].point(lambda v: v * 150 // 255))
    ombre.paste(sh, (ox + S // 60, oy + S // 30), sh); ombre = ombre.filter(ImageFilter.GaussianBlur(S / 70))
    im = Image.alpha_composite(im, ombre); im.paste(obj, (ox, oy), obj)
    im.putalpha(masque)
    im.resize((T, T), Image.LANCZOS).save(os.path.join(out, f))
print('icônes composées :', len(os.listdir(out)))
