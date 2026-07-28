#!/usr/bin/env python3
"""Regenerate the self-hosted woff2 files in public/fonts.

Run by hand, not by `npm run build` — it needs network access and a Python
toolchain that the deploy environment does not have:

    python3 -m venv .cache/venv
    .cache/venv/bin/pip install fonttools brotli
    .cache/venv/bin/python scripts/subset-fonts.py

Sources are downloaded into .cache/fonts (gitignored). Outputs are committed.

Four files come out:

  inter-var-latin.woff2      Inter 4.1 variable, wght 400-500, Google's `latin`
  inter-var-latin-ext.woff2  ... and its `latin-ext` range. Loaded on demand
                             (pinyin diacritics, European names).
  noto-sans-sc-core.woff2    Noto Sans SC variable, wght 400-500, the hanzi this
                             site actually uses plus a common-character floor.
  noto-sans-sc-ext.woff2     Every remaining GB2312 level-1 hanzi, so a character
                             we did not anticipate still renders in the right
                             face instead of falling back to PingFang SC.

fonts.css declares ext first and core second: for a character in both ranges the
later @font-face wins, so a page whose text sits inside core never fetches ext.
Re-run this after adding Chinese content — the core file shrinks to fit.
"""

import re
import sys
import urllib.request
from pathlib import Path

from fontTools.subset import Options, Subsetter
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

ROOT = Path(__file__).resolve().parent.parent
CACHE = ROOT / ".cache" / "fonts"
OUT = ROOT / "public" / "fonts"

INTER = "https://github.com/rsms/inter/releases/download/v4.1/Inter-4.1.zip"
NOTO_SC = "https://github.com/google/fonts/raw/main/ofl/notosanssc/NotoSansSC%5Bwght%5D.ttf"
CHAR_FREQ = "https://lingua.mtsu.edu/chinese-computing/statistics/char/download.php?Which=MO"

# Google's subset ranges, so our unicode-range values match a well-trodden split.
LATIN = (
    "U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,"
    "U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,"
    "U+FEFF,U+FFFD"
)
LATIN_EXT = (
    "U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,"
    "U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,"
    "U+2113,U+2C60-2C7F,U+A720-A7FF"
)

# Punctuation and fullwidth forms Chinese text needs regardless of vocabulary.
CJK_PUNCT = [chr(c) for c in range(0x3000, 0x3040)] + list(
    "！＂＃＄％＆＇（）＊＋，－．／０１２３４５６７８９：；＜＝＞？＠［＼］＾＿｛｜｝～"
)

# Words this site is certain to set, whatever the works turn out to be. Cheap
# insurance against the core subset missing a nav item or a discipline name.
DOMAIN = (
    "央艺作品项目课程计划关于联系首页工作室学院申请服务新闻日志"
    "建筑空间插画设计视觉平面产品交互影像摄影装置景观室内展览策展城市规划研究"
    "材料结构模型家具陶瓷纺织时装珠宝动画游戏声音表演绘画雕塑版画书法数字媒体艺术工业"
    "完成进行私密公开内部年月日编号类型状态地点客户团队角色指导导师学生合作时间尺寸材质版本"
    "集辅一对课时周期班入取院校本科硕士博面试推荐信文书语言成绩"
    "零一二三四五六七八九十百千万第〇"
)

CORE_FLOOR = 800  # most frequent hanzi kept in core even if unused today
EXT_CEILING = 3500  # tail of the frequency list; beyond this PingFang SC covers us


def fetch(url: str, name: str) -> Path:
    path = CACHE / name
    if not path.exists():
        CACHE.mkdir(parents=True, exist_ok=True)
        print(f"downloading {name}")
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req) as r, open(path, "wb") as f:
            f.write(r.read())
    return path


def unicodes(spec: str) -> list[int]:
    out: set[int] = set()
    for part in spec.split(","):
        part = part.strip()[2:]
        if "-" in part:
            lo, hi = part.split("-")
            out |= set(range(int(lo, 16), int(hi, 16) + 1))
        else:
            out.add(int(part, 16))
    return sorted(out)


def subset(src: Path, chars: list[int], out_name: str) -> None:
    font = TTFont(src)
    options = Options()
    options.layout_features = ["*"]
    options.notdef_outline = True
    options.drop_tables += ["DSIG"]
    subsetter = Subsetter(options=options)
    subsetter.populate(unicodes=chars)
    subsetter.subset(font)
    # One file covering both weights the design system uses. opsz is pinned to
    # Inter's text design; the display role is set in the same cut as the index.
    limits: dict[str, object] = {"wght": (400, 500)}
    if "fvar" in font and any(a.axisTag == "opsz" for a in font["fvar"].axes):
        limits["opsz"] = 14.0
    font = instancer.instantiateVariableFont(font, limits)
    font.flavor = "woff2"
    path = OUT / out_name
    font.save(path)
    print(f"{out_name}: {len(chars)} glyphs, {path.stat().st_size / 1024:.0f} KB")


def frequency_list() -> list[str]:
    raw = fetch(CHAR_FREQ, "charfreq.txt").read_bytes().decode("gb18030")
    chars = []
    for line in raw.splitlines():
        if line.startswith("/*"):
            continue
        parts = line.split("\t")
        if len(parts) > 1 and len(parts[1]) == 1:
            chars.append(parts[1])
    return chars


def gb2312_level1() -> set[str]:
    out = set()
    for row in range(0xB0, 0xD8):
        for cell in range(0xA1, 0xFF):
            try:
                out.add(bytes([row, cell]).decode("gb2312"))
            except UnicodeDecodeError:
                pass
    return out


def content_hanzi() -> set[str]:
    found: set[str] = set()
    for path in (ROOT / "src").rglob("*.ts*"):
        found |= set(re.findall(r"[㐀-鿿]", path.read_text(encoding="utf-8")))
    return found


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)

    import zipfile

    zip_path = fetch(INTER, "Inter-4.1.zip")
    inter_ttf = CACHE / "InterVariable.ttf"
    if not inter_ttf.exists():
        with zipfile.ZipFile(zip_path) as z:
            inter_ttf.write_bytes(z.read("InterVariable.ttf"))

    subset(inter_ttf, unicodes(LATIN), "inter-var-latin.woff2")
    subset(inter_ttf, unicodes(LATIN_EXT), "inter-var-latin-ext.woff2")

    noto = fetch(NOTO_SC, "NotoSansSC.ttf")
    freq = frequency_list()
    core = set(CJK_PUNCT) | set(DOMAIN) | content_hanzi() | set(freq[:CORE_FLOOR])
    ext = (gb2312_level1() | set(freq[:EXT_CEILING])) - core

    subset(noto, sorted(ord(c) for c in core), "noto-sans-sc-core.woff2")
    subset(noto, sorted(ord(c) for c in ext), "noto-sans-sc-ext.woff2")

    print("\nunicode-range for the core face (paste into fonts.css):")
    print(",".join(f"U+{ord(c):04X}" for c in sorted(core)))


if __name__ == "__main__":
    sys.exit(main())
