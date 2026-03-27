from __future__ import annotations

# Lightweight, dependency-free QR generator based on Nayuki's QR Code generator.
# (MIT License) https://www.nayuki.io/page/qr-code-generator-library
#
# This is a trimmed but fully functional port suitable for generating QR matrices server-side.

from dataclasses import dataclass
from typing import Iterable, List, Optional


class QrCode:
    @dataclass(frozen=True)
    class Ecc:
        ord: int
        format_bits: int

    Ecc_LOW = Ecc(0, 1)
    Ecc_MEDIUM = Ecc(1, 0)
    Ecc_QUARTILE = Ecc(2, 3)
    Ecc_HIGH = Ecc(3, 2)

    MIN_VERSION = 1
    MAX_VERSION = 40

    def __init__(self, version: int, ecc: Ecc, data_codewords: List[int], mask: int):
        if not (QrCode.MIN_VERSION <= version <= QrCode.MAX_VERSION):
            raise ValueError("Version out of range")
        if not (0 <= mask <= 7):
            raise ValueError("Mask out of range")

        self._version = version
        self._ecc = ecc
        self._size = version * 4 + 17
        self._mask = mask

        # Build modules and function modules
        self._modules: List[List[bool]] = [[False] * self._size for _ in range(self._size)]
        self._is_function: List[List[bool]] = [[False] * self._size for _ in range(self._size)]
        self._draw_function_patterns()

        all_codewords = self._add_ecc_and_interleave(data_codewords)
        self._draw_codewords(all_codewords)

        self._apply_mask(mask)
        self._draw_format_bits(mask)
        self._draw_version()

    def get_size(self) -> int:
        return self._size

    def get_module(self, x: int, y: int) -> bool:
        if 0 <= x < self._size and 0 <= y < self._size:
            return self._modules[y][x]
        return False

    @staticmethod
    def encode_text(text: str, ecc: "QrCode.Ecc") -> "QrCode":
        segs = QrSegment.make_segments(text)
        return QrCode.encode_segments(segs, ecc)

    @staticmethod
    def encode_binary(data: bytes, ecc: "QrCode.Ecc") -> "QrCode":
        segs = [QrSegment.make_bytes(data)]
        return QrCode.encode_segments(segs, ecc)

    @staticmethod
    def encode_segments(segs: List["QrSegment"], ecc: "QrCode.Ecc", min_version: int = 1, max_version: int = 40, mask: int = -1) -> "QrCode":
        if not (QrCode.MIN_VERSION <= min_version <= max_version <= QrCode.MAX_VERSION):
            raise ValueError("Invalid version range")
        if mask not in (-1, 0, 1, 2, 3, 4, 5, 6, 7):
            raise ValueError("Invalid mask")

        # Find minimal version that fits
        for version in range(min_version, max_version + 1):
            data_capacity_bits = QrCode._get_num_data_codewords(version, ecc) * 8
            used_bits = QrSegment.get_total_bits(segs, version)
            if used_bits is not None and used_bits <= data_capacity_bits:
                break
        else:
            raise ValueError("Data too long")

        # Concatenate bits
        bb = _BitBuffer()
        for seg in segs:
            bb.append(seg.mode.mode_bits, 4)
            bb.append(seg.num_chars, seg.mode.num_char_count_bits(version))
            bb.extend(seg.data)

        # Terminator + pad to byte
        data_capacity_bits = QrCode._get_num_data_codewords(version, ecc) * 8
        bb.append(0, min(4, data_capacity_bits - len(bb)))
        bb.append(0, (-len(bb)) % 8)

        # Pad bytes
        pad_bytes = [0xEC, 0x11]
        i = 0
        while len(bb) < data_capacity_bits:
            bb.append(pad_bytes[i & 1], 8)
            i += 1

        data_codewords = bb.to_bytes()

        # Choose best mask
        if mask == -1:
            best_mask = 0
            best_penalty = 10**9
            for m in range(8):
                qr = QrCode(version, ecc, data_codewords, m)
                pen = qr._get_penalty_score()
                if pen < best_penalty:
                    best_penalty = pen
                    best_mask = m
            return QrCode(version, ecc, data_codewords, best_mask)
        return QrCode(version, ecc, data_codewords, mask)

    # ---- Drawing ----
    def _set_function_module(self, x: int, y: int, is_dark: bool) -> None:
        self._modules[y][x] = is_dark
        self._is_function[y][x] = True

    def _draw_function_patterns(self) -> None:
        # Finder patterns + separators
        for i in range(0, 7):
            for j in range(0, 7):
                val = (i in (0, 6) or j in (0, 6) or (2 <= i <= 4 and 2 <= j <= 4))
                self._set_function_module(j, i, val)
                self._set_function_module(self._size - 1 - j, i, val)
                self._set_function_module(j, self._size - 1 - i, val)

        def draw_sep(x: int, y: int, dx: int, dy: int) -> None:
            for k in range(0, 8):
                xx = x + dx * k
                yy = y + dy * k
                if 0 <= xx < self._size and 0 <= yy < self._size:
                    self._set_function_module(xx, yy, False)

        draw_sep(7, 0, 0, 1)
        draw_sep(0, 7, 1, 0)
        draw_sep(self._size - 8, 0, 0, 1)
        draw_sep(self._size - 8, 7, 1, 0)
        draw_sep(7, self._size - 8, 0, 1)
        draw_sep(0, self._size - 8, 1, 0)

        # Timing patterns
        for i in range(8, self._size - 8):
            self._set_function_module(i, 6, i % 2 == 0)
            self._set_function_module(6, i, i % 2 == 0)

        # Alignment patterns
        pos = QrCode._get_alignment_pattern_positions(self._version)
        for i in range(len(pos)):
            for j in range(len(pos)):
                if (i == 0 and j == 0) or (i == 0 and j == len(pos) - 1) or (i == len(pos) - 1 and j == 0):
                    continue
                self._draw_alignment_pattern(pos[i], pos[j])

        # Dark module
        self._set_function_module(8, self._size - 8, True)

        # Reserve format info areas
        for i in range(0, 9):
            if i != 6:
                self._set_function_module(8, i, False)
                self._set_function_module(i, 8, False)
        for i in range(self._size - 8, self._size):
            self._set_function_module(8, i, False)
            self._set_function_module(i, 8, False)
        self._set_function_module(self._size - 8, 8, False)

        # Reserve version info
        if self._version >= 7:
            for i in range(0, 6):
                for j in range(0, 3):
                    self._set_function_module(self._size - 11 + j, i, False)
                    self._set_function_module(i, self._size - 11 + j, False)

    def _draw_alignment_pattern(self, x: int, y: int) -> None:
        for dy in range(-2, 3):
            for dx in range(-2, 3):
                self._set_function_module(x + dx, y + dy, max(abs(dx), abs(dy)) != 1)

    def _draw_format_bits(self, mask: int) -> None:
        data = (self._ecc.format_bits << 3) | mask
        rem = data
        for _ in range(10):
            rem = (rem << 1) ^ (((rem >> 9) & 1) * 0x537)
        bits = ((data << 10) | rem) ^ 0x5412

        # Draw first copy
        for i in range(0, 6):
            self._set_function_module(8, i, ((bits >> i) & 1) != 0)
        self._set_function_module(8, 7, ((bits >> 6) & 1) != 0)
        self._set_function_module(8, 8, ((bits >> 7) & 1) != 0)
        self._set_function_module(7, 8, ((bits >> 8) & 1) != 0)
        for i in range(9, 15):
            self._set_function_module(14 - i, 8, ((bits >> i) & 1) != 0)

        # Draw second copy
        for i in range(0, 8):
            self._set_function_module(self._size - 1 - i, 8, ((bits >> i) & 1) != 0)
        for i in range(8, 15):
            self._set_function_module(8, self._size - 15 + i, ((bits >> i) & 1) != 0)

    def _draw_version(self) -> None:
        if self._version < 7:
            return
        rem = self._version
        for _ in range(12):
            rem = (rem << 1) ^ (((rem >> 11) & 1) * 0x1F25)
        bits = (self._version << 12) | rem
        for i in range(0, 18):
            bit = ((bits >> i) & 1) != 0
            a = self._size - 11 + (i % 3)
            b = i // 3
            self._set_function_module(a, b, bit)
            self._set_function_module(b, a, bit)

    def _draw_codewords(self, data: List[int]) -> None:
        i = 0
        x = self._size - 1
        y = self._size - 1
        dir_up = True
        while x > 0:
            if x == 6:
                x -= 1
            for _ in range(self._size):
                for dx in range(0, 2):
                    xx = x - dx
                    if not self._is_function[y][xx]:
                        bit = False
                        if i < len(data) * 8:
                            bit = ((data[i >> 3] >> (7 - (i & 7))) & 1) != 0
                            i += 1
                        self._modules[y][xx] = bit
                y += -1 if dir_up else 1
                if y < 0 or y >= self._size:
                    y += 1 if dir_up else -1
                    dir_up = not dir_up
                    break
            x -= 2

    def _apply_mask(self, mask: int) -> None:
        for y in range(self._size):
            for x in range(self._size):
                if self._is_function[y][x]:
                    continue
                invert = False
                if mask == 0:
                    invert = (x + y) % 2 == 0
                elif mask == 1:
                    invert = y % 2 == 0
                elif mask == 2:
                    invert = x % 3 == 0
                elif mask == 3:
                    invert = (x + y) % 3 == 0
                elif mask == 4:
                    invert = (x // 3 + y // 2) % 2 == 0
                elif mask == 5:
                    invert = (x * y) % 2 + (x * y) % 3 == 0
                elif mask == 6:
                    invert = ((x * y) % 2 + (x * y) % 3) % 2 == 0
                elif mask == 7:
                    invert = ((x + y) % 2 + (x * y) % 3) % 2 == 0
                self._modules[y][x] ^= invert

    # ---- Penalty scoring (mask selection) ----
    def _get_penalty_score(self) -> int:
        result = 0
        size = self._size

        # Adjacent modules in row/column in same color
        for y in range(size):
            run_color = False
            run_len = 0
            for x in range(size):
                color = self._modules[y][x]
                if x == 0 or color != run_color:
                    run_color = color
                    run_len = 1
                else:
                    run_len += 1
                    if run_len == 5:
                        result += 3
                    elif run_len > 5:
                        result += 1
        for x in range(size):
            run_color = False
            run_len = 0
            for y in range(size):
                color = self._modules[y][x]
                if y == 0 or color != run_color:
                    run_color = color
                    run_len = 1
                else:
                    run_len += 1
                    if run_len == 5:
                        result += 3
                    elif run_len > 5:
                        result += 1

        # 2x2 blocks
        for y in range(size - 1):
            for x in range(size - 1):
                c = self._modules[y][x]
                if c == self._modules[y][x + 1] == self._modules[y + 1][x] == self._modules[y + 1][x + 1]:
                    result += 3

        # Finder-like patterns in rows/cols
        def penalty_pattern(line: List[bool]) -> int:
            pen = 0
            for i in range(len(line) - 10):
                if (
                    line[i : i + 11]
                    == [True, False, True, True, True, False, True, False, False, False, False]
                    or line[i : i + 11]
                    == [False, False, False, False, True, False, True, True, True, False, True]
                ):
                    pen += 40
            return pen

        for y in range(size):
            result += penalty_pattern(self._modules[y])
        for x in range(size):
            result += penalty_pattern([self._modules[y][x] for y in range(size)])

        # Balance of dark modules
        dark = sum(1 for y in range(size) for x in range(size) if self._modules[y][x])
        total = size * size
        k = abs(dark * 20 - total * 10) // total
        result += int(k) * 10
        return result

    # ---- ECC / RS ----
    @staticmethod
    def _get_num_data_codewords(version: int, ecc: "QrCode.Ecc") -> int:
        return (QrCode._get_num_raw_data_modules(version) // 8) - QrCode._ECC_CODEWORDS_PER_BLOCK[ecc.ord][version] * QrCode._NUM_ERROR_CORRECTION_BLOCKS[ecc.ord][version]

    @staticmethod
    def _get_num_raw_data_modules(version: int) -> int:
        size = version * 4 + 17
        result = size * size
        result -= 3 * 8 * 8  # finder + separators
        result -= 2 * (size - 16)  # timing
        result -= 15 * 2 + 1  # format
        if version >= 7:
            result -= 18 * 2  # version
        # alignment
        num_align = len(QrCode._get_alignment_pattern_positions(version))
        result -= (num_align * num_align - 3) * 25
        return result

    @staticmethod
    def _get_alignment_pattern_positions(version: int) -> List[int]:
        if version == 1:
            return []
        num = version // 7 + 2
        step = 26 if version == 32 else ((version * 4 + num * 2 + 1) // (2 * num - 2) * 2)
        result = [6]
        pos = version * 4 + 10
        for _ in range(num - 1):
            result.insert(1, pos)
            pos -= step
        return result

    def _add_ecc_and_interleave(self, data: List[int]) -> List[int]:
        version = self._version
        ecc = self._ecc
        num_blocks = QrCode._NUM_ERROR_CORRECTION_BLOCKS[ecc.ord][version]
        block_ecc_len = QrCode._ECC_CODEWORDS_PER_BLOCK[ecc.ord][version]
        raw_codewords = QrCode._get_num_raw_data_modules(version) // 8
        num_short_blocks = num_blocks - (raw_codewords % num_blocks)
        short_block_len = raw_codewords // num_blocks

        blocks: List[List[int]] = []
        k = 0
        for i in range(num_blocks):
            dat_len = short_block_len - block_ecc_len + (0 if i < num_short_blocks else 1)
            dat = data[k : k + dat_len]
            k += dat_len
            ecc_words = _reed_solomon_compute_remainder(dat, block_ecc_len)
            blocks.append(dat + ecc_words)

        result: List[int] = []
        for i in range(max(len(b) for b in blocks)):
            for b in blocks:
                if i < len(b):
                    result.append(b[i])
        return result


class QrSegment:
    @dataclass(frozen=True)
    class Mode:
        mode_bits: int
        char_count_bits: tuple[int, int, int]

        def num_char_count_bits(self, version: int) -> int:
            if 1 <= version <= 9:
                return self.char_count_bits[0]
            if 10 <= version <= 26:
                return self.char_count_bits[1]
            return self.char_count_bits[2]

    MODE_NUMERIC = Mode(0x1, (10, 12, 14))
    MODE_ALPHANUMERIC = Mode(0x2, (9, 11, 13))
    MODE_BYTE = Mode(0x4, (8, 16, 16))
    MODE_KANJI = Mode(0x8, (8, 10, 12))
    MODE_ECI = Mode(0x7, (0, 0, 0))

    def __init__(self, mode: Mode, num_chars: int, data: List[int]):
        self.mode = mode
        self.num_chars = num_chars
        self.data = data

    @staticmethod
    def make_bytes(data: bytes) -> "QrSegment":
        bb = _BitBuffer()
        for b in data:
            bb.append(b, 8)
        return QrSegment(QrSegment.MODE_BYTE, len(data), bb.bits)

    @staticmethod
    def make_segments(text: str) -> List["QrSegment"]:
        # Simple: always encode as bytes (UTF-8). This keeps implementation small and robust.
        return [QrSegment.make_bytes(text.encode("utf-8"))]

    @staticmethod
    def get_total_bits(segs: List["QrSegment"], version: int) -> Optional[int]:
        result = 0
        for seg in segs:
            ccbits = seg.mode.num_char_count_bits(version)
            if seg.num_chars >= (1 << ccbits):
                return None
            result += 4 + ccbits + len(seg.data)
        return result


class _BitBuffer:
    def __init__(self) -> None:
        self.bits: List[int] = []

    def __len__(self) -> int:
        return len(self.bits)

    def append(self, val: int, length: int) -> None:
        if length < 0 or val >> length != 0:
            raise ValueError("Value out of range")
        for i in range(length - 1, -1, -1):
            self.bits.append((val >> i) & 1)

    def extend(self, data: Iterable[int]) -> None:
        self.bits.extend(data)

    def to_bytes(self) -> List[int]:
        if len(self.bits) % 8 != 0:
            raise ValueError("Bit length not multiple of 8")
        out: List[int] = []
        for i in range(0, len(self.bits), 8):
            b = 0
            for j in range(8):
                b = (b << 1) | self.bits[i + j]
            out.append(b)
        return out


def _reed_solomon_compute_remainder(data: List[int], degree: int) -> List[int]:
    # Generator polynomial
    gen = _reed_solomon_generator_poly(degree)
    result = [0] * degree
    for b in data:
        factor = b ^ result.pop(0)
        result.append(0)
        if factor:
            for i in range(degree):
                result[i] ^= _reed_solomon_multiply(gen[i], factor)
    return result


def _reed_solomon_generator_poly(degree: int) -> List[int]:
    # Start with poly = [1]
    poly = [1]
    for i in range(degree):
        poly = _reed_solomon_poly_multiply(poly, [1, _reed_solomon_pow(2, i)])
    # Drop leading term
    return poly[1:]


def _reed_solomon_poly_multiply(p: List[int], q: List[int]) -> List[int]:
    out = [0] * (len(p) + len(q) - 1)
    for i, a in enumerate(p):
        for j, b in enumerate(q):
            out[i + j] ^= _reed_solomon_multiply(a, b)
    return out


def _reed_solomon_pow(x: int, power: int) -> int:
    result = 1
    for _ in range(power):
        result = _reed_solomon_multiply(result, x)
    return result


def _reed_solomon_multiply(x: int, y: int) -> int:
    # Multiply in GF(2^8) with primitive polynomial 0x11D
    z = 0
    for i in range(8):
        if (y >> i) & 1:
            z ^= x << i
    for i in range(14, 7, -1):
        if (z >> i) & 1:
            z ^= 0x11D << (i - 8)
    return z & 0xFF


# Tables from the QR Code specification (index by [ecc][version]).
# These are the full tables (41 entries) with a dummy 0 at index 0.
QrCode._NUM_ERROR_CORRECTION_BLOCKS = [
    [0, 1, 1, 1, 1, 1, 2, 2, 2, 2, 4, 4, 4, 4, 4, 6, 6, 6, 6, 7, 8, 8, 9, 9, 10, 12, 12, 12, 13, 14, 15, 16, 17, 18, 19, 19, 20, 21, 22, 24, 25],
    [0, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5, 5, 8, 9, 9, 10, 10, 11, 13, 14, 16, 17, 17, 18, 20, 21, 23, 25, 26, 28, 29, 31, 33, 35, 37, 38, 40, 43, 45, 47, 49],
    [0, 1, 1, 2, 2, 4, 4, 6, 6, 8, 8, 8, 10, 12, 16, 12, 17, 16, 18, 21, 20, 23, 23, 25, 27, 29, 34, 34, 35, 38, 40, 43, 45, 48, 51, 53, 56, 59, 62, 65, 68],
    [0, 1, 2, 2, 4, 4, 4, 5, 6, 8, 8, 11, 11, 16, 16, 18, 16, 19, 21, 25, 25, 25, 34, 30, 32, 35, 37, 40, 42, 45, 48, 51, 54, 57, 60, 63, 66, 70, 74, 77, 81],
]

QrCode._ECC_CODEWORDS_PER_BLOCK = [
    [0, 7, 10, 15, 20, 26, 18, 20, 24, 30, 18, 20, 24, 26, 30, 22, 24, 28, 30, 28, 28, 28, 28, 30, 30, 26, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
    [0, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26, 30, 22, 22, 24, 24, 28, 28, 26, 26, 26, 26, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28],
    [0, 13, 22, 18, 26, 18, 24, 18, 22, 20, 24, 28, 26, 24, 20, 30, 24, 28, 28, 26, 30, 28, 30, 30, 30, 30, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
    [0, 17, 28, 22, 16, 22, 28, 26, 26, 24, 28, 24, 28, 22, 24, 24, 30, 28, 28, 26, 28, 30, 24, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
]

