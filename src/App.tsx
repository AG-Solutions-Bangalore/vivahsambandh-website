import Footer from './components/Footer'
import Header from './components/Header'
import { HomePage } from './module/home'

export default function App() {
  return (
    <div className="min-h-screen bg-cream-50">
      <Header />
      <main>
        <HomePage />
      </main>
      <Footer />
    </div>
  )
}
