"""Gleicht das Vorher-Foto des Waschtischs per affiner Transformation an die
Perspektive des Nachher-Fotos an (6 manuell gesetzte Passpunkte, kleinste Quadrate).
  python3 photos/align-washstand.py /pfad/zu/originalen
Ergebnis: ws-before-aligned.png im selben Ordner."""
import sys, numpy as np
from PIL import Image
d = sys.argv[1] if len(sys.argv) > 1 else '.'
B = np.array([(82,140),(605,52),(793,243),(322,860),(745,680),(545,357)], float)  # Vorher (Pixel)
A = np.array([(80,163),(794,86),(1010,355),(323,1114),(905,947),(648,487)], float)  # Nachher (Pixel)
X = np.hstack([A, np.ones((len(A),1))]); M, *_ = np.linalg.lstsq(X, B, rcond=None)
a, dd = M[0]; b, e = M[1]; c, f = M[2]
bef = Image.open(f'{d}/ws-before.jpg').convert('RGB'); aft = Image.open(f'{d}/ws-after.jpg').convert('RGB')
bef.transform(aft.size, Image.AFFINE, (a, b, c, dd, e, f), resample=Image.BICUBIC, fillcolor=(20, 40, 20)).save(f'{d}/ws-before-aligned.png')
