"""Regenera iconos y splash Android manteniendo la identidad visual de la PWA."""
from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
RES = ROOT / "android" / "app" / "src" / "main" / "res"
GREEN = "#173f35"
PAPER = "#f7f4ec"
GOLD = "#bd7b31"


def book(draw, box, fill=PAPER, accent=GOLD):
    x0, y0, x1, y1 = box
    w, h = x1 - x0, y1 - y0
    cx = (x0 + x1) / 2
    left = [(x0, y0 + h*.08), (cx, y0 + h*.18), (cx, y1), (x0, y1 - h*.08)]
    right = [(cx, y0 + h*.18), (x1, y0 + h*.08), (x1, y1 - h*.08), (cx, y1)]
    draw.polygon(left, fill=fill)
    draw.polygon(right, fill=fill)
    line = max(1, int(w*.035))
    draw.line((cx, y0 + h*.19, cx, y1), fill=accent, width=line)
    draw.arc((x0+w*.13, y0+h*.26, cx-w*.05, y0+h*.58), 205, 325, fill=accent, width=line)
    draw.arc((cx+w*.05, y0+h*.26, x1-w*.13, y0+h*.58), 215, 335, fill=accent, width=line)


def launcher(size, foreground=False):
    scale = 4
    canvas = Image.new("RGBA", (size*scale, size*scale), (0, 0, 0, 0) if foreground else GREEN)
    draw = ImageDraw.Draw(canvas)
    if foreground:
        pad = size * scale * .30
    else:
        pad = size * scale * .20
    book(draw, (pad, pad*.9, size*scale-pad, size*scale-pad*.85))
    return canvas.resize((size, size), Image.Resampling.LANCZOS)


for directory in RES.glob("mipmap-*"):
    for path in directory.glob("ic_launcher*.png"):
        size = Image.open(path).size[0]
        launcher(size, foreground="foreground" in path.name).save(path)


for path in RES.glob("drawable*/splash.png"):
    width, height = Image.open(path).size
    scale = 2
    canvas = Image.new("RGB", (width*scale, height*scale), PAPER)
    draw = ImageDraw.Draw(canvas)
    side = min(width, height) * scale * .28
    cx, cy = width*scale/2, height*scale/2
    radius = side * .22
    draw.rounded_rectangle((cx-side/2, cy-side/2, cx+side/2, cy+side/2), radius=radius, fill=GREEN)
    inset = side * .22
    book(draw, (cx-side/2+inset, cy-side/2+inset*.9, cx+side/2-inset, cy+side/2-inset*.85))
    canvas.resize((width, height), Image.Resampling.LANCZOS).save(path)

print("Iconos y splash Android regenerados.")
