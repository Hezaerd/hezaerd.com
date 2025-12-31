import { createFileRoute } from '@tanstack/react-router'
import { About, Contact, Hero, Projects } from '@/components/sections'

export const Route = createFileRoute('/')({ component: App })

function App() {
  return (
    <>
      <Hero />
      <About />
      <Projects />
      <Contact />
    </>
  )
}
