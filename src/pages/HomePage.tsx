import React, { useEffect, useState } from 'react'
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
import EventPage from './EventPage'
import { fetchActiveEvent } from '../services/eventService'
import { EventItem } from '../types/database'

// Home = página do evento ativo. A landing do ADONAI fica em /adonai.
export const HomePage: React.FC = () => {
    const [event, setEvent] = useState<EventItem | null>(null)
    useEffect(() => { fetchActiveEvent().then(setEvent) }, [])
    if (!event) return <div className="min-h-screen" />
    return event.slug === 'adonai-2026' ? <AdonaiLandingPage /> : <EventPage event={event} />
}

export const AdonaiLandingPage: React.FC = () => {
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
