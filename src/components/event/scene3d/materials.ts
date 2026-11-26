import { useEffect, useState } from 'react'
import * as THREE from 'three'
import { PALETTE } from './types'

export interface PbrTextureSet {
    map: THREE.CanvasTexture
    bumpMap: THREE.CanvasTexture
    roughnessMap?: THREE.CanvasTexture
}

function makeCanvas(width: number, height: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')!
    return [canvas, ctx]
}

function configureTexture(
    canvas: HTMLCanvasElement,
    repeatX: number,
    repeatY: number,
    isColor: boolean
): THREE.CanvasTexture {
    const tex = new THREE.CanvasTexture(canvas)
    tex.wrapS = THREE.RepeatWrapping
    tex.wrapT = THREE.RepeatWrapping
    tex.repeat.set(repeatX, repeatY)
    tex.anisotropy = 8
    tex.colorSpace = isColor ? THREE.SRGBColorSpace : THREE.NoColorSpace
    tex.needsUpdate = true
    return tex
}

function seededRand(seed: number) {
    let s = seed % 2147483647
    if (s <= 0) s += 2147483646
    return () => {
        s = (s * 16807) % 2147483647
        return (s - 1) / 2147483646
    }
}

let cachedOakFloor: PbrTextureSet | null = null
export function getOakFloorTextures(): PbrTextureSet {
    if (cachedOakFloor) return cachedOakFloor
    const size = 512
    const [cColor, gColor] = makeCanvas(size, size)
    const [cBump, gBump] = makeCanvas(size, size)
    const [cRough, gRough] = makeCanvas(size, size)
    const rand = seededRand(101)

    const planks = 6
    const plankH = size / planks

    for (let p = 0; p < planks; p++) {
        const y0 = p * plankH
        const toneShift = (rand() - 0.5) * 18
        const r = Math.round(182 + toneShift)
        const g = Math.round(145 + toneShift * 0.8)
        const b = Math.round(108 + toneShift * 0.65)

        gColor.fillStyle = `rgb(${r},${g},${b})`
        gColor.fillRect(0, y0, size, plankH)

        const roughBase = Math.round(138 + (rand() - 0.5) * 26)
        gRough.fillStyle = `rgb(${roughBase},${roughBase},${roughBase})`
        gRough.fillRect(0, y0, size, plankH)

        gBump.fillStyle = 'rgb(145,145,145)'
        gBump.fillRect(0, y0, size, plankH)

        // Veios finos da madeira
        for (let i = 0; i < 42; i++) {
            const gy = y0 + rand() * plankH
            const alpha = 0.06 + rand() * 0.1
            gColor.strokeStyle = rand() > 0.4 ? `rgba(90,59,46,${alpha})` : `rgba(243,231,214,${alpha * 0.7})`
            gColor.lineWidth = 0.8 + rand() * 1.8
            gColor.beginPath()
            gColor.moveTo(0, gy)
            gColor.bezierCurveTo(size * 0.33, gy + (rand() - 0.5) * 6, size * 0.66, gy + (rand() - 0.5) * 6, size, gy)
            gColor.stroke()

            gBump.strokeStyle = `rgba(110,110,110,${alpha * 1.4})`
            gBump.lineWidth = 1
            gBump.beginPath()
            gBump.moveTo(0, gy)
            gBump.lineTo(size, gy)
            gBump.stroke()
        }

        // Junta horizontal entre tábuas
        gColor.fillStyle = 'rgba(43,27,20,0.45)'
        gColor.fillRect(0, y0, size, 2)
        gBump.fillStyle = 'rgb(30,30,30)'
        gBump.fillRect(0, y0, size, 3)

        // Junta vertical escalonada
        const jointX = Math.round(((p * 173 + 90) % size))
        gColor.fillRect(jointX, y0, 2, plankH)
        gBump.fillRect(jointX, y0, 3, plankH)
    }

    cachedOakFloor = {
        map: configureTexture(cColor, 4, 4, true),
        bumpMap: configureTexture(cBump, 4, 4, false),
        roughnessMap: configureTexture(cRough, 4, 4, false),
    }
    return cachedOakFloor
}

let cachedWalnut: PbrTextureSet | null = null
export function getWalnutTextures(): PbrTextureSet {
    if (cachedWalnut) return cachedWalnut
    const size = 512
    const [cColor, gColor] = makeCanvas(size, size)
    const [cBump, gBump] = makeCanvas(size, size)
    const [cRough, gRough] = makeCanvas(size, size)
    const rand = seededRand(202)

    gColor.fillStyle = '#533426'
    gColor.fillRect(0, 0, size, size)
    gBump.fillStyle = 'rgb(135,135,135)'
    gBump.fillRect(0, 0, size, size)
    gRough.fillStyle = 'rgb(112,112,112)'
    gRough.fillRect(0, 0, size, size)

    for (let i = 0; i < 160; i++) {
        const y = rand() * size
        const dark = rand() > 0.28
        gColor.strokeStyle = dark
            ? `rgba(34,18,12,${0.08 + rand() * 0.22})`
            : `rgba(154,107,78,${0.06 + rand() * 0.14})`
        gColor.lineWidth = 0.8 + rand() * 2.5
        gColor.beginPath()
        gColor.moveTo(0, y)
        gColor.bezierCurveTo(
            size * 0.3,
            y + (rand() - 0.5) * 14,
            size * 0.7,
            y + (rand() - 0.5) * 14,
            size,
            y
        )
        gColor.stroke()

        const bVal = dark ? 95 : 165
        gBump.strokeStyle = `rgba(${bVal},${bVal},${bVal},0.25)`
        gBump.lineWidth = 1.2
        gBump.beginPath()
        gBump.moveTo(0, y)
        gBump.lineTo(size, y)
        gBump.stroke()

        const rVal = dark ? 132 : 95
        gRough.strokeStyle = `rgba(${rVal},${rVal},${rVal},0.3)`
        gRough.lineWidth = 1.5
        gRough.beginPath()
        gRough.moveTo(0, y)
        gRough.lineTo(size, y)
        gRough.stroke()
    }

    cachedWalnut = {
        map: configureTexture(cColor, 2, 2, true),
        bumpMap: configureTexture(cBump, 2, 2, false),
        roughnessMap: configureTexture(cRough, 2, 2, false),
    }
    return cachedWalnut
}

let cachedPlaster: PbrTextureSet | null = null
export function getCreamPlasterTextures(): PbrTextureSet {
    if (cachedPlaster) return cachedPlaster
    const size = 512
    const [cColor, gColor] = makeCanvas(size, size)
    const [cBump, gBump] = makeCanvas(size, size)
    const rand = seededRand(303)

    gColor.fillStyle = '#E8D9C5'
    gColor.fillRect(0, 0, size, size)
    gBump.fillStyle = 'rgb(128,128,128)'
    gBump.fillRect(0, 0, size, size)

    for (let i = 0; i < 600; i++) {
        const x = rand() * size
        const y = rand() * size
        const rad = 6 + rand() * 26
        const warm = rand() > 0.5
        gColor.fillStyle = warm ? 'rgba(246,237,223,0.08)' : 'rgba(182,155,128,0.06)'
        gColor.beginPath()
        gColor.arc(x, y, rad, 0, Math.PI * 2)
        gColor.fill()

        const bv = Math.round(118 + rand() * 22)
        gBump.fillStyle = `rgba(${bv},${bv},${bv},0.16)`
        gBump.beginPath()
        gBump.arc(x, y, rad * 0.7, 0, Math.PI * 2)
        gBump.fill()
    }

    cachedPlaster = {
        map: configureTexture(cColor, 3, 2, true),
        bumpMap: configureTexture(cBump, 3, 2, false),
    }
    return cachedPlaster
}

let cachedBoucle: PbrTextureSet | null = null
export function getBoucleFabricTextures(): PbrTextureSet {
    if (cachedBoucle) return cachedBoucle
    const size = 256
    const [cColor, gColor] = makeCanvas(size, size)
    const [cBump, gBump] = makeCanvas(size, size)
    const rand = seededRand(404)

    gColor.fillStyle = '#EDE0CE'
    gColor.fillRect(0, 0, size, size)
    gBump.fillStyle = 'rgb(120,120,120)'
    gBump.fillRect(0, 0, size, size)

    for (let y = 0; y < size; y += 4) {
        for (let x = 0; x < size; x += 4) {
            const v = Math.round(220 + (rand() - 0.5) * 28)
            gColor.fillStyle = `rgb(${v},${v - 11},${v - 26})`
            gColor.fillRect(x, y, 3, 3)

            const bv = Math.round(105 + rand() * 55)
            gBump.fillStyle = `rgb(${bv},${bv},${bv})`
            gBump.fillRect(x, y, 2, 2)
        }
    }

    cachedBoucle = {
        map: configureTexture(cColor, 6, 6, true),
        bumpMap: configureTexture(cBump, 6, 6, false),
    }
    return cachedBoucle
}

let cachedTravertine: PbrTextureSet | null = null
export function getTravertineTextures(): PbrTextureSet {
    if (cachedTravertine) return cachedTravertine
    const size = 512
    const [cColor, gColor] = makeCanvas(size, size)
    const [cBump, gBump] = makeCanvas(size, size)
    const [cRough, gRough] = makeCanvas(size, size)
    const rand = seededRand(505)

    gColor.fillStyle = '#DFCDBA'
    gColor.fillRect(0, 0, size, size)
    gBump.fillStyle = 'rgb(140,140,140)'
    gBump.fillRect(0, 0, size, size)
    gRough.fillStyle = 'rgb(160,160,160)'
    gRough.fillRect(0, 0, size, size)

    // Lajotas quadradas suaves
    const tiles = 4
    const step = size / tiles
    for (let ty = 0; ty < tiles; ty++) {
        for (let tx = 0; tx < tiles; tx++) {
            const delta = (rand() - 0.5) * 14
            gColor.fillStyle = `rgb(${Math.round(224 + delta)},${Math.round(205 + delta)},${Math.round(182 + delta)})`
            gColor.fillRect(tx * step + 2, ty * step + 2, step - 4, step - 4)
        }
    }

    for (let i = 0; i < 240; i++) {
        const y = rand() * size
        gColor.strokeStyle = rand() > 0.5 ? 'rgba(247,237,225,0.22)' : 'rgba(145,118,96,0.12)'
        gColor.lineWidth = 1 + rand() * 2.5
        gColor.beginPath()
        gColor.moveTo(0, y)
        gColor.lineTo(size, y + (rand() - 0.5) * 8)
        gColor.stroke()

        gBump.fillStyle = 'rgba(95,95,95,0.2)'
        gBump.fillRect(rand() * size, rand() * size, 6 + rand() * 14, 2)
    }

    gColor.strokeStyle = 'rgba(139,106,85,0.35)'
    gColor.lineWidth = 3
    for (let i = 0; i <= tiles; i++) {
        const p = i * step
        gColor.beginPath()
        gColor.moveTo(p, 0)
        gColor.lineTo(p, size)
        gColor.moveTo(0, p)
        gColor.lineTo(size, p)
        gColor.stroke()
    }

    cachedTravertine = {
        map: configureTexture(cColor, 4, 3, true),
        bumpMap: configureTexture(cBump, 4, 3, false),
        roughnessMap: configureTexture(cRough, 4, 3, false),
    }
    return cachedTravertine
}

let cachedVinyl: PbrTextureSet | null = null
export function getVinylGrooveTextures(): PbrTextureSet {
    if (cachedVinyl) return cachedVinyl
    const size = 512
    const cx = size / 2
    const [cColor, gColor] = makeCanvas(size, size)
    const [cBump, gBump] = makeCanvas(size, size)

    gColor.fillStyle = '#15100E'
    gColor.fillRect(0, 0, size, size)
    gBump.fillStyle = 'rgb(128,128,128)'
    gBump.fillRect(0, 0, size, size)

    for (let r = 86; r < 248; r += 2) {
        const shine = Math.sin(r * 0.45) * 10 + (r % 28 === 0 ? 18 : 0)
        const v = Math.max(12, Math.min(54, 22 + shine))
        gColor.strokeStyle = `rgb(${v},${v - 2},${v - 4})`
        gColor.lineWidth = 1.1
        gColor.beginPath()
        gColor.arc(cx, cx, r, 0, Math.PI * 2)
        gColor.stroke()

        const bv = r % 2 === 0 ? 155 : 95
        gBump.strokeStyle = `rgb(${bv},${bv},${bv})`
        gBump.lineWidth = 1
        gBump.beginPath()
        gBump.arc(cx, cx, r, 0, Math.PI * 2)
        gBump.stroke()
    }

    // Reflexo anisotrópico sutil em arco
    const grad = gColor.createLinearGradient(0, 0, size, size)
    grad.addColorStop(0, 'rgba(255,235,210,0.10)')
    grad.addColorStop(0.5, 'rgba(255,235,210,0.0)')
    grad.addColorStop(1, 'rgba(255,235,210,0.09)')
    gColor.fillStyle = grad
    gColor.fillRect(0, 0, size, size)

    cachedVinyl = {
        map: configureTexture(cColor, 1, 1, true),
        bumpMap: configureTexture(cBump, 1, 1, false),
    }
    return cachedVinyl
}

export function createNoticeBoardTexture(lines: string[]): THREE.CanvasTexture {
    const [canvas, g] = makeCanvas(768, 960)
    // Papel creme artesanal
    g.fillStyle = '#F7EFE2'
    g.fillRect(0, 0, canvas.width, canvas.height)

    // Borda dupla fina
    g.strokeStyle = '#8B6A55'
    g.lineWidth = 4
    g.strokeRect(28, 28, canvas.width - 56, canvas.height - 56)
    g.strokeStyle = 'rgba(139,106,85,0.35)'
    g.lineWidth = 2
    g.strokeRect(42, 42, canvas.width - 84, canvas.height - 84)

    g.fillStyle = '#8B6A55'
    g.font = '600 22px Montserrat, sans-serif'
    g.textAlign = 'center'
    g.fillText('QUADRO DE AVISOS • RETIRO DNA 2026', canvas.width / 2, 108)

    g.fillStyle = '#2B1B14'
    g.font = 'italic 54px "Playfair Display", Georgia, serif'
    g.fillText('A Casa que Acolhe', canvas.width / 2, 184)

    g.strokeStyle = 'rgba(90,59,46,0.28)'
    g.lineWidth = 2
    g.beginPath()
    g.moveTo(140, 224)
    g.lineTo(canvas.width - 140, 224)
    g.stroke()

    const items = lines.length ? lines.slice(0, 6) : ['12 e 13 de dezembro', 'Comunidade Voz de Deus']
    g.textAlign = 'left'
    let y = 305
    for (const rawLine of items) {
        g.fillStyle = '#2B1B14'
        g.font = '600 30px Montserrat, sans-serif'
        const words = rawLine.split(' ')
        let current = ''
        for (const word of words) {
            const test = current ? `${current} ${word}` : word
            if (g.measureText(test).width > canvas.width - 160) {
                g.fillText(current, 80, y)
                y += 42
                current = word
            } else {
                current = test
            }
        }
        if (current) {
            g.fillText(current, 80, y)
            y += 66
        }
    }

    g.fillStyle = '#5A3B2E'
    g.font = 'italic 26px "Playfair Display", Georgia, serif'
    g.textAlign = 'center'
    g.fillText('Toque para ver a programação completa +', canvas.width / 2, 884)

    const tex = new THREE.CanvasTexture(canvas)
    tex.colorSpace = THREE.SRGBColorSpace
    tex.anisotropy = 8
    tex.needsUpdate = true
    return tex
}

export function createPosterTexture(lines: string[]): THREE.CanvasTexture {
    const [canvas, g] = makeCanvas(640, 840)
    g.fillStyle = PALETTE.cream
    g.fillRect(0, 0, canvas.width, canvas.height)

    g.strokeStyle = PALETTE.walnut
    g.lineWidth = 6
    g.strokeRect(24, 24, canvas.width - 48, canvas.height - 48)

    g.fillStyle = PALETTE.cinnamon
    g.font = '700 20px Montserrat, sans-serif'
    g.textAlign = 'center'
    g.fillText('COMUNIDADE VOZ DE DEUS', canvas.width / 2, 92)

    g.fillStyle = PALETTE.espresso
    g.font = '300 72px Montserrat, sans-serif'
    g.fillText('RETIRO DNA', canvas.width / 2, 200)

    g.fillStyle = PALETTE.cinnamon
    g.font = 'italic 58px "Playfair Display", Georgia, serif'
    g.fillText('2026', canvas.width / 2, 272)

    // Arco decorativo central
    g.strokeStyle = PALETTE.walnut
    g.lineWidth = 4
    g.beginPath()
    g.arc(canvas.width / 2, 465, 110, Math.PI, 0)
    g.lineTo(canvas.width / 2 + 110, 560)
    g.lineTo(canvas.width / 2 - 110, 560)
    g.closePath()
    g.stroke()

    g.fillStyle = PALETTE.brass
    g.beginPath()
    g.arc(canvas.width / 2, 465, 36, 0, Math.PI * 2)
    g.fill()

    g.fillStyle = PALETTE.espresso
    g.font = '600 26px Montserrat, sans-serif'
    g.fillText(lines[0] || '12 e 13 de dezembro', canvas.width / 2, 640)

    g.fillStyle = PALETTE.espresso
    g.fillRect(150, 695, canvas.width - 300, 68)
    g.fillStyle = PALETTE.cream
    g.font = '700 24px Montserrat, sans-serif'
    g.fillText('GARANTIR VAGA', canvas.width / 2, 738)

    const tex = new THREE.CanvasTexture(canvas)
    tex.colorSpace = THREE.SRGBColorSpace
    tex.anisotropy = 8
    tex.needsUpdate = true
    return tex
}

export function createVinylCoverTexture(
    title: string,
    subtitle: string,
    bgTop: string,
    bgBottom: string,
    accent: string
): THREE.CanvasTexture {
    const [canvas, g] = makeCanvas(384, 384)
    const grad = g.createLinearGradient(0, 0, 0, 384)
    grad.addColorStop(0, bgTop)
    grad.addColorStop(1, bgBottom)
    g.fillStyle = grad
    g.fillRect(0, 0, 384, 384)

    // Sol / círculo poético
    g.fillStyle = accent
    g.globalAlpha = 0.85
    g.beginPath()
    g.arc(192, 168, 72, 0, Math.PI * 2)
    g.fill()
    g.globalAlpha = 1

    g.strokeStyle = 'rgba(243,231,214,0.35)'
    g.lineWidth = 3
    g.strokeRect(18, 18, 348, 348)

    g.fillStyle = '#FAF3E8'
    g.font = 'italic 34px "Playfair Display", Georgia, serif'
    g.textAlign = 'center'
    g.fillText(title, 192, 294)

    g.fillStyle = 'rgba(243,231,214,0.8)'
    g.font = '600 15px Montserrat, sans-serif'
    g.fillText(subtitle.toUpperCase(), 192, 330)

    const tex = new THREE.CanvasTexture(canvas)
    tex.colorSpace = THREE.SRGBColorSpace
    tex.anisotropy = 4
    tex.needsUpdate = true
    return tex
}

const emblemCache = new Map<string, THREE.CanvasTexture>()

/**
 * Carrega o emblema da Comunidade Voz de Deus e converte a luminancia em alpha transparente.
 */
export function useCommunityLogoTexture(
    url = '/images/logo-comunidade-emblema.png',
    tintHex = '#F5E6CC'
): THREE.CanvasTexture | null {
    const cacheKey = `${url}:${tintHex}`
    const [tex, setTex] = useState<THREE.CanvasTexture | null>(() => emblemCache.get(cacheKey) || null)

    useEffect(() => {
        if (emblemCache.has(cacheKey)) {
            setTex(emblemCache.get(cacheKey)!)
            return
        }
        let cancelled = false
        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.onload = () => {
            if (cancelled) return
            const size = 512
            const [canvas, g] = makeCanvas(size, size)
            g.clearRect(0, 0, size, size)
            g.drawImage(img, 0, 0, size, size)

            const imgData = g.getImageData(0, 0, size, size)
            const data = imgData.data
            const tint = new THREE.Color(tintHex)
            const tr = Math.round(tint.r * 255)
            const tg = Math.round(tint.g * 255)
            const tb = Math.round(tint.b * 255)

            for (let i = 0; i < data.length; i += 4) {
                const lum = (data[i] + data[i + 1] + data[i + 2]) / 3
                // Fundo escuro vira transparente; traço branco vira opaco na cor desejada
                const alpha = Math.max(0, Math.min(255, Math.round(((lum - 24) / 215) * 255)))
                data[i] = tr
                data[i + 1] = tg
                data[i + 2] = tb
                data[i + 3] = alpha
            }
            g.putImageData(imgData, 0, 0)

            const out = new THREE.CanvasTexture(canvas)
            out.colorSpace = THREE.SRGBColorSpace
            out.anisotropy = 8
            out.needsUpdate = true
            emblemCache.set(cacheKey, out)
            setTex(out)
        }
        img.src = url
        return () => {
            cancelled = true
        }
    }, [cacheKey, tintHex, url])

    return tex
}
