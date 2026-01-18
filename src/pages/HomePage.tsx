import Hero from '../components/Hero'
import HeroTitle from '../components/HeroTitle'
import MobileNavigationGuide from '../components/MobileNavigationGuide'
import Features from '../components/Features'
import AboutSection from '../components/AboutSection'
import InfoSection from '../components/InfoSection'
import Newspaper from '../components/Newspaper'
import CalendarSection from '../components/CalendarSection'
import GallerySection from '../components/GallerySection'
import RegistrationSection from '../components/RegistrationSection'

const HomePage = () => {
    return (
        <div className="flex flex-col">
            <Hero />
            <HeroTitle />
            <MobileNavigationGuide />
            <AboutSection />
            <Features />
            <InfoSection />
            <div className="hidden md:block">
                <Newspaper />
            </div>
            <CalendarSection />
            <GallerySection />
            <RegistrationSection />
        </div>
    )
}

export default HomePage
