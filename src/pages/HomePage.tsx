import React from 'react'
import '../styles/adonai-home.css'
import FloatingTicketBar from '../components/home/FloatingTicketBar'
import CountdownBar from '../components/home/CountdownBar'
import HeroSection from '../components/home/HeroSection'
import EditorialSection from '../components/home/EditorialSection'
import ExperienceSection from '../components/home/ExperienceSection'
import HoliSection from '../components/home/HoliSection'
import PreachingSection from '../components/home/PreachingSection'
import EucharistSection from '../components/home/EucharistSection'
import GalleryGridSection from '../components/home/GalleryGridSection'
import TicketsSection from '../components/home/TicketsSection'
import FAQAccordionSection from '../components/home/FAQAccordionSection'

export const HomePage: React.FC = () => {
    return (
        <main className="adonai-home-wrapper">
            <FloatingTicketBar />
            <CountdownBar />
            <HeroSection />
            <EditorialSection />
            <ExperienceSection />
            <HoliSection />
            <PreachingSection />
            <EucharistSection />
            <GalleryGridSection />
            <TicketsSection />
            <FAQAccordionSection />
        </main>
    )
}

export default HomePage
