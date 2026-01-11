const Background = () => (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Ink Splashes */}
        <div className="absolute top-0 left-0 w-96 h-96 ink-splash-1 transform -translate-x-1/2 -translate-y-1/2 opacity-10"></div>
        <div className="absolute top-1/2 right-0 w-[500px] h-[500px] ink-splash-2 transform translate-x-1/3 opacity-10"></div>
        <div className="absolute bottom-0 left-20 w-80 h-80 ink-splash-1 transform rotate-45 opacity-5"></div>

        {/* Ink Drops with Clip Paths */}
        <div className="ink-drop w-32 h-32 bg-holi-primary top-[15%] left-[10%] opacity-20 mix-blend-screen"
            style={{ clipPath: 'polygon(39% 0%, 100% 38%, 82% 100%, 8% 82%, 0% 38%)' }}></div>
        <div className="ink-drop w-24 h-24 bg-holi-secondary top-[45%] right-[20%] opacity-20 mix-blend-screen"
            style={{ clipPath: 'circle(50% at 50% 50%)', transform: 'scale(1.5, 1)' }}></div>
        <div className="ink-drop w-40 h-40 bg-holi-accent top-[75%] left-[5%] opacity-10 mix-blend-screen"
            style={{ clipPath: 'ellipse(50% 40% at 50% 50%)', transform: 'rotate(45deg)' }}></div>
        <div className="ink-drop w-16 h-16 bg-holi-green top-[30%] left-[40%] opacity-20 mix-blend-overlay rounded-full blur-md"></div>
        <div className="ink-drop w-64 h-64 bg-purple-600 bottom-[10%] right-[30%] opacity-10 mix-blend-overlay filter blur-3xl"></div>

        {/* Blurred Color Blobs */}
        <div className="absolute top-[20%] left-[30%] w-64 h-64 bg-holi-primary rounded-full mix-blend-overlay filter blur-[90px] opacity-20"></div>
        <div className="absolute bottom-[40%] right-[20%] w-72 h-72 bg-holi-secondary rounded-full mix-blend-overlay filter blur-[80px] opacity-15"></div>
        <div className="absolute top-[80%] left-[10%] w-96 h-96 bg-holi-accent rounded-full mix-blend-overlay filter blur-[100px] opacity-10"></div>

        {/* Noise Texture Overlay */}
        <div className="absolute inset-0 bg-noise opacity-10 pointer-events-none"></div>
    </div>
)

export default Background
