from __future__ import annotations

from app.utils.qrcodegen import QrCode


def make_qr_svg(*, data: str, size: int = 256, border: int = 3) -> str:
    # Encode as QR (medium ECC is a good balance for posters/screens).
    qr = QrCode.encode_text(data, QrCode.Ecc_MEDIUM)
    n = qr.get_size()
    border_ = max(0, int(border))
    scale = max(1, int(size // (n + border_ * 2)))
    dim = (n + border_ * 2) * scale

    parts: list[str] = []
    parts.append(f'<svg xmlns="http://www.w3.org/2000/svg" width="{dim}" height="{dim}" viewBox="0 0 {n + border_ * 2} {n + border_ * 2}" shape-rendering="crispEdges">')
    parts.append('<rect width="100%" height="100%" fill="#ffffff"/>')
    # Render modules as a single path for compactness.
    path: list[str] = []
    for y in range(n):
        for x in range(n):
            if qr.get_module(x, y):
                xx = x + border_
                yy = y + border_
                path.append(f"M{xx},{yy}h1v1h-1z")
    parts.append(f'<path d="{" ".join(path)}" fill="#000000"/>')
    parts.append("</svg>")
    return "".join(parts)

