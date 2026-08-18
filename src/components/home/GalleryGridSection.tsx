import React from 'react'

interface GalleryImage {
    src: string
    alt: string
}

const GALLERY_IMAGES: GalleryImage[] = [
    {
        src: 'https://www.festivaladonai.com.br/wp-content/uploads/2026/08/482249267_1064251255741917_8368824039255334219_n.jpg',
        alt: 'Jovens cantando e celebrando no Festival Adonai',
    },
    {
        src: 'https://www.festivaladonai.com.br/wp-content/uploads/2026/08/482251203_1064251442408565_8860648684017782862_n.jpg',
        alt: 'Apresentação musical e louvor no palco Adonai',
    },
    {
        src: 'https://www.festivaladonai.com.br/wp-content/uploads/2026/08/486604107_1074649104702132_6753569390061113184_n-1.jpg',
        alt: 'Momento de oração em grupo e comunhão',
    },
    {
        src: 'https://www.festivaladonai.com.br/wp-content/uploads/2026/08/486611519_1074648908035485_3130047290730636898_n-1.jpg',
        alt: 'Galera reunida em adoração',
    },
    {
        src: 'https://www.festivaladonai.com.br/wp-content/uploads/2026/08/0b471165-0f96-4e0c-92ce-b54d6711c3ec.jpg',
        alt: 'Público jovem unido no retiro Adonai',
    },
    {
        src: 'https://www.festivaladonai.com.br/wp-content/uploads/2026/08/495086145_1108592794641096_5489144302593018585_n-1.jpg',
        alt: 'Festa das Cores Holi com explosão de cores',
    },
    {
        src: 'https://www.festivaladonai.com.br/wp-content/uploads/2026/08/484816427_1064253812408328_7976388588891716218_n.jpg',
        alt: 'Show católico e animação no palco',
    },
    {
        src: 'https://www.festivaladonai.com.br/wp-content/uploads/2026/08/484791295_1064252372408472_3823837486130695994_n.jpg',
        alt: 'Ministração e pregação para juventude',
    },
    {
        src: 'https://www.festivaladonai.com.br/wp-content/uploads/2026/08/484946477_1064254209074955_1384199723278727056_n.jpg',
        alt: 'Jovens sorrindo e confraternizando no acampamento',
    },
    {
        src: 'https://www.festivaladonai.com.br/wp-content/uploads/2026/08/495164051_1108582497975459_5461005247402044767_n-1.jpg',
        alt: 'Momento de partilha e oração comunitária',
    },
    {
        src: 'https://www.festivaladonai.com.br/wp-content/uploads/2026/08/IMG_1100.jpg',
        alt: 'Adoração ao Santíssimo Sacramento durante a noite',
    },
    {
        src: 'https://www.festivaladonai.com.br/wp-content/uploads/2026/08/484802785_1064254242408285_3551650081489993860_n.jpg',
        alt: 'Celebração e alegria no encerramento do retiro',
    },
]

export const GalleryGridSection: React.FC = () => {
    return (
        <section className="adonai-gallery" aria-label="Galeria de Fotos do Adonai">
            <span
                style={{
                    color: 'var(--sziget-pink)',
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: 900,
                    letterSpacing: '3px',
                    textTransform: 'uppercase',
                }}
            >
                MOMENTOS QUE GUARDAMOS NA MEMÓRIA
            </span>

            <h2
                style={{
                    fontSize: 'clamp(2.2rem, 5vw, 3.8rem)',
                    fontWeight: 900,
                    margin: '10px auto 50px auto',
                    textTransform: 'uppercase',
                }}
            >
                REGISTROS DA NOSSA GALERA
            </h2>

            <div className="adonai-gallery-grid">
                {GALLERY_IMAGES.map((img, idx) => (
                    <div key={idx}>
                        <img src={img.src} alt={img.alt} loading="lazy" />
                    </div>
                ))}
            </div>
        </section>
    )
}

export default GalleryGridSection
