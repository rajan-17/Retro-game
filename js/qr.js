// Lightweight Pure-JS QR Code Generator (ISO/IEC 18004 Byte Mode, Versions 1-8, EC Level L)
(function(global) {
    'use strict';

    // GF(256) with polynomial 0x11d
    const EXP = new Uint8Array(512);
    const LOG = new Uint8Array(256);
    let x = 1;
    for (let i = 0; i < 255; i++) {
        EXP[i] = x;
        LOG[x] = i;
        x <<= 1;
        if (x & 0x100) x ^= 0x11d;
    }
    for (let i = 255; i < 512; i++) EXP[i] = EXP[i - 255];

    function gfMul(a, b) {
        if (a === 0 || b === 0) return 0;
        return EXP[LOG[a] + LOG[b]];
    }

    function rsPoly(ecLen) {
        let p = [1];
        for (let i = 0; i < ecLen; i++) {
            const next = new Array(p.length + 1).fill(0);
            const factor = EXP[i];
            for (let j = 0; j < p.length; j++) {
                next[j] ^= p[j];
                next[j + 1] ^= gfMul(p[j], factor);
            }
            p = next;
        }
        return p;
    }

    function rsEncode(data, ecLen) {
        const gen = rsPoly(ecLen);
        const res = new Uint8Array(data.length + ecLen);
        res.set(data);
        for (let i = 0; i < data.length; i++) {
            const c = res[i];
            if (c !== 0) {
                for (let j = 0; j < gen.length; j++) {
                    res[i + j] ^= gfMul(gen[j], c);
                }
            }
        }
        return res.slice(data.length);
    }

    // Version specs for EC Level L: [totalCodewords, ecPerBlock, numBlocksGroup1, dataPerBlockGroup1, numBlocksGroup2, dataPerBlockGroup2, alignCoords]
    const VERSIONS = {
        1: [26, 7, 1, 19, 0, 0, []],
        2: [44, 10, 1, 34, 0, 0, [6, 18]],
        3: [70, 15, 1, 55, 0, 0, [6, 22]],
        4: [100, 20, 1, 80, 0, 0, [6, 26]],
        5: [134, 26, 1, 108, 0, 0, [6, 30]],
        6: [172, 18, 2, 68, 0, 0, [6, 34]],
        7: [196, 20, 2, 78, 0, 0, [6, 22, 38]],
        8: [242, 24, 2, 97, 0, 0, [6, 24, 42]],
        9: [292, 30, 2, 116, 0, 0, [6, 26, 46]],
        10: [346, 18, 2, 68, 2, 69, [6, 28, 50]]
    };

    function pickVersion(byteLen) {
        for (let v = 1; v <= 10; v++) {
            const spec = VERSIONS[v];
            const dataCap = spec[2] * spec[3] + spec[4] * spec[5];
            const countBits = v < 10 ? 8 : 16;
            const availBytes = Math.floor((dataCap * 8 - 4 - countBits) / 8);
            if (byteLen <= availBytes) return v;
        }
        return 10;
    }

    function encodeData(text, version) {
        const bytes = new TextEncoder().encode(text);
        const spec = VERSIONS[version];
        const totalData = spec[2] * spec[3] + spec[4] * spec[5];
        const bits = [];
        const pushBits = (val, n) => {
            for (let i = n - 1; i >= 0; i--) bits.push((val >> i) & 1);
        };

        // Mode indicator: Byte (0100)
        pushBits(0b0100, 4);
        // Character count
        pushBits(bytes.length, version < 10 ? 8 : 16);
        // Data bytes
        for (let b of bytes) pushBits(b, 8);
        // Terminator
        const maxBits = totalData * 8;
        for (let i = 0; i < 4 && bits.length < maxBits; i++) bits.push(0);
        while (bits.length % 8 !== 0) bits.push(0);
        let padToggle = true;
        while (bits.length < maxBits) {
            pushBits(padToggle ? 0xEC : 0x11, 8);
            padToggle = !padToggle;
        }

        const codewords = new Uint8Array(totalData);
        for (let i = 0; i < totalData; i++) {
            let b = 0;
            for (let j = 0; j < 8; j++) b = (b << 1) | bits[i * 8 + j];
            codewords[i] = b;
        }

        const ecLen = spec[1];
        const blocks = [];
        const ecs = [];
        let offset = 0;
        for (let i = 0; i < spec[2]; i++) {
            const slice = codewords.slice(offset, offset + spec[3]);
            blocks.push(slice);
            ecs.push(rsEncode(slice, ecLen));
            offset += spec[3];
        }
        for (let i = 0; i < spec[4]; i++) {
            const slice = codewords.slice(offset, offset + spec[5]);
            blocks.push(slice);
            ecs.push(rsEncode(slice, ecLen));
            offset += spec[5];
        }

        const interleaved = [];
        const maxDataLen = Math.max(spec[3], spec[5]);
        for (let i = 0; i < maxDataLen; i++) {
            for (let blk of blocks) {
                if (i < blk.length) interleaved.push(blk[i]);
            }
        }
        for (let i = 0; i < ecLen; i++) {
            for (let ec of ecs) interleaved.push(ec[i]);
        }
        return interleaved;
    }

    function buildMatrix(text) {
        const version = pickVersion(new TextEncoder().encode(text).length);
        const size = version * 4 + 17;
        const mat = Array.from({ length: size }, () => new Int8Array(size).fill(-1));
        const reserved = Array.from({ length: size }, () => new Uint8Array(size));

        const setMod = (r, c, val, isRes = true) => {
            if (r >= 0 && r < size && c >= 0 && c < size) {
                mat[r][c] = val ? 1 : 0;
                if (isRes) reserved[r][c] = 1;
            }
        };

        const placeFinder = (r0, c0) => {
            for (let r = -1; r <= 7; r++) {
                for (let c = -1; c <= 7; c++) {
                    const rr = r0 + r, cc = c0 + c;
                    if (rr < 0 || rr >= size || cc < 0 || cc >= size) continue;
                    const inOuter = r >= 0 && r <= 6 && c >= 0 && c <= 6;
                    const onBorder = r === 0 || r === 6 || c === 0 || c === 6;
                    const inCore = r >= 2 && r <= 4 && c >= 2 && c <= 4;
                    setMod(rr, cc, inOuter && (onBorder || inCore), true);
                }
            }
        };

        placeFinder(0, 0);
        placeFinder(0, size - 7);
        placeFinder(size - 7, 0);

        // Alignment patterns
        const coords = VERSIONS[version][6];
        for (let r of coords) {
            for (let c of coords) {
                if (reserved[r][c]) continue;
                for (let dr = -2; dr <= 2; dr++) {
                    for (let dc = -2; dc <= 2; dc++) {
                        const dark = Math.abs(dr) === 2 || Math.abs(dc) === 2 || (dr === 0 && dc === 0);
                        setMod(r + dr, c + dc, dark, true);
                    }
                }
            }
        }

        // Timing patterns
        for (let i = 8; i < size - 8; i++) {
            const bit = i % 2 === 0 ? 1 : 0;
            if (!reserved[6][i]) setMod(6, i, bit, true);
            if (!reserved[i][6]) setMod(i, 6, bit, true);
        }

        // Dark module
        setMod(4 * version + 9, 8, 1, true);

        // Reserve format info strips
        for (let i = 0; i < 9; i++) {
            if (i !== 6) {
                reserved[8][i] = 1;
                reserved[i][8] = 1;
            }
        }
        for (let i = size - 8; i < size; i++) {
            reserved[8][i] = 1;
            reserved[i][8] = 1;
        }

        // Data placement
        const data = encodeData(text, version);
        const allBits = [];
        for (let b of data) {
            for (let i = 7; i >= 0; i--) allBits.push((b >> i) & 1);
        }

        let bitIdx = 0;
        let up = true;
        for (let col = size - 1; col > 0; col -= 2) {
            if (col === 6) col--;
            for (let step = 0; step < size; step++) {
                const r = up ? size - 1 - step : step;
                for (let dx = 0; dx < 2; dx++) {
                    const c = col - dx;
                    if (!reserved[r][c]) {
                        const bit = bitIdx < allBits.length ? allBits[bitIdx++] : 0;
                        mat[r][c] = bit;
                    }
                }
            }
            up = !up;
        }

        // Evaluate masks 0..7 and pick lowest penalty
        const maskFns = [
            (r, c) => (r + c) % 2 === 0,
            (r, c) => r % 2 === 0,
            (r, c) => c % 3 === 0,
            (r, c) => (r + c) % 3 === 0,
            (r, c) => (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0,
            (r, c) => ((r * c) % 2) + ((r * c) % 3) === 0,
            (r, c) => (((r * c) % 2) + ((r * c) % 3)) % 2 === 0,
            (r, c) => (((r + c) % 2) + ((r * c) % 3)) % 2 === 0
        ];

        // Precomputed 15-bit format strings for EC Level L (01), masks 0..7
        const FORMAT_L = [
            0x77C4, 0x72F3, 0x7DAA, 0x789D,
            0x662F, 0x6318, 0x6C41, 0x6976
        ];

        const applyMaskAndFormat = (mIdx) => {
            const m = mat.map(row => Int8Array.from(row));
            const fn = maskFns[mIdx];
            for (let r = 0; r < size; r++) {
                for (let c = 0; c < size; c++) {
                    if (!reserved[r][c] && fn(r, c)) m[r][c] ^= 1;
                }
            }
            const fmt = FORMAT_L[mIdx];
            for (let i = 0; i < 6; i++) {
                const bit = (fmt >> (14 - i)) & 1;
                m[8][i] = bit;
                m[size - 1 - i][8] = bit;
            }
            m[8][7] = (fmt >> 8) & 1;
            m[size - 7][8] = (fmt >> 8) & 1;
            m[8][8] = (fmt >> 7) & 1;
            m[7][8] = (fmt >> 6) & 1;
            for (let i = 0; i < 6; i++) {
                const bit = (fmt >> (5 - i)) & 1;
                m[5 - i][8] = bit;
                m[8][size - 6 + i] = bit;
            }
            // Also bit 7 of second strip (col size-7, row 8) and bit 8 (col size-8, row 8)
            m[8][size - 8] = (fmt >> 7) & 1;
            m[8][size - 7] = (fmt >> 6) & 1;
            return m;
        };

        const score = (m) => {
            let p = 0;
            for (let r = 0; r < size; r++) {
                let run = 1;
                for (let c = 1; c < size; c++) {
                    if (m[r][c] === m[r][c - 1]) {
                        run++;
                        if (run === 5) p += 3;
                        else if (run > 5) p++;
                    } else run = 1;
                }
            }
            for (let c = 0; c < size; c++) {
                let run = 1;
                for (let r = 1; r < size; r++) {
                    if (m[r][c] === m[r - 1][c]) {
                        run++;
                        if (run === 5) p += 3;
                        else if (run > 5) p++;
                    } else run = 1;
                }
            }
            return p;
        };

        let bestMat = null;
        let bestScore = Infinity;
        for (let i = 0; i < 8; i++) {
            const candidate = applyMaskAndFormat(i);
            const s = score(candidate);
            if (s < bestScore) {
                bestScore = s;
                bestMat = candidate;
            }
        }
        return bestMat;
    }

    function renderToCanvas(canvas, text, opts = {}) {
        if (!canvas || !text) return;
        const mat = buildMatrix(text);
        const size = mat.length;
        const quiet = (opts.quiet !== undefined) ? opts.quiet : 2;
        const pxSize = opts.size || 160;
        const total = size + quiet * 2;
        const scale = Math.max(2, Math.floor(pxSize / total));
        const dim = total * scale;
        canvas.width = dim;
        canvas.height = dim;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = opts.light || '#ffffff';
        ctx.fillRect(0, 0, dim, dim);
        ctx.fillStyle = opts.dark || '#0a0a12';
        for (let r = 0; r < size; r++) {
            for (let c = 0; c < size; c++) {
                if (mat[r][c]) {
                    ctx.fillRect((c + quiet) * scale, (r + quiet) * scale, scale, scale);
                }
            }
        }
    }

    global.NexusQR = { buildMatrix, renderToCanvas };
})(window);
