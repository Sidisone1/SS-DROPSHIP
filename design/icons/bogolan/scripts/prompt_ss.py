"""Consigne de génération d'une planche d'icônes SS DROPSHIP style Bogolan (16 icônes, 4 x 4).
Usage : python3 prompt_ss.py 1   (planches 1 à 4)"""
import json, os, sys
ICI = os.path.dirname(os.path.abspath(__file__))
ICONES = json.load(open(os.path.join(ICI, 'icones_ss.json')))
def planche(n):
    return ICONES[(n-1)*16:n*16]
def prompt(n):
    it = planche(n)
    rows = "\n".join(f"Row {r+1}: " + " | ".join(f'"{nom}"' for _, nom in it[r*4:r*4+4]) for r in range(4))
    return f"""Square app icon sheet for the brand "SS DROPSHIP" (cross-border shopping and shipping app), in the style of a West African "Collection Bogolan" icon family.

Background: pure white page. At the top, centered: bold rounded heading "SS DROPSHIP" in night blue (#10213D), and below it a small line "Icônes Bogolan" in blue (#0077C8). At the very bottom, a thin night-blue band with a repeating white bogolan pattern of zigzags, dots and short triple vertical bars.

Grid: exactly 16 icons in 4 rows of 4 columns, evenly spaced. Each icon sits on its own separate rounded-square tile (corner radius about 20%), tile color very light cool grey (#F4F6F8) with a soft diffuse shadow, tiles never touching. Under each tile, its French label in bold rounded night-blue sans-serif, verbatim.

Icon style (identical for all): premium soft 3D clay render, chunky rounded volumes, matte surface, gentle top-left light, soft drop shadow, no black outlines. Object colors: main blue #0077C8, red #F21A16 for accents, white, night blue #10213D. Each object carries one small bogolan detail: an earthy brown band (#6B3E26) decorated with a white zigzag line and small white dots. Strictly NO yellow, NO gold, NO orange anywhere. Objects centered, about 65% of the tile, simple and readable at small size. People have brown skin, simplified faces without features.

Icons and labels, in reading order:
{rows}

Constraints: exactly 16 tiles, labels spelled exactly as given in French, no extra icons, no English labels, no real brand logos, no photorealism, no yellow."""
if __name__ == '__main__':
    print(prompt(int(sys.argv[1])))
