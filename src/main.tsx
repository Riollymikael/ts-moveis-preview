import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { Play, MessageCircle, MapPin } from 'lucide-react'
import '@fontsource/dm-sans/latin-400.css'
import '@fontsource/dm-sans/latin-500.css'
import '@fontsource/dm-sans/latin-600.css'
import '@fontsource/cormorant-garamond/latin-500.css'
import '@fontsource/cormorant-garamond/latin-500-italic.css'
import Hero, { Header } from './Hero'
import Portfolio from './Portfolio'
import Studio, { FilmModal, type Movie } from './Studio'
import Quote from './Quote'
import { company, greeting, photo } from './data'
import './style.css'

const Showroom = lazy(() => import('./Showroom'))
function App() {
  const [quote, setQuote] = useState<string | null>(null)
  const [movie, setMovie] = useState<Movie | null>(null)
  const [loadRoom, setLoadRoom] = useState(false)
  const showroomRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) { setLoadRoom(true); observer.disconnect() }
    }, { rootMargin: '500px' })
    if (showroomRef.current) observer.observe(showroomRef.current)
    return () => observer.disconnect()
  }, [])
  return <>
    <a href="#projetos" className="skip">Ir para os projetos</a>
    <Header quote={() => setQuote('')}/>
    <main>
      <Hero quote={()=>setQuote('')}/>
      <Portfolio quote={setQuote}/>
      <section className="film-banner" aria-label="Filme dos ambientes">
        <picture style={{display:'contents'}}><source media="(max-width:760px)" srcSet={photo('sala-painel-mobile')}/><img className="film-photo" src={photo('sala-painel')} alt="" loading="lazy" decoding="async"/></picture>
        <div className="wrap film-content"><div><div className="eyebrow light"><i/>Filme de ambientes</div><h2>Um olhar<br/><em>mais próximo.</em></h2></div>
        <button className="play-film" onClick={() => setMovie('tour')}><span><Play size={23} strokeWidth={1.3}/></span>Assistir ao filme</button></div>
      </section>
      <div ref={showroomRef} className="showroom-host">{loadRoom ? <Suspense fallback={<div id="showroom" className="waiting">Carregando showroom 3D…</div>}><Showroom fallbackImage={photo('cozinha-ilha')}/></Suspense> : <div className="waiting" id="showroom">Showroom 3D</div>}</div>
      <Studio play={setMovie}/>
      <section className="featured section"><div className="wrap featured-inner"><div><div className="eyebrow"><i/>Projeto em destaque</div><h2>Um projeto <em>por dentro.</em></h2><p>Acompanhe a visita em vídeo e observe como os móveis se integram ao espaço.</p></div><button className="button outline" onClick={() => setMovie('project')}><Play size={16}/>Assistir à visita</button></div></section>
      <section className="contact section" id="contato"><picture className="contact-picture"><source media="(min-width: 761px)" srcSet={photo('contato-detalhe')}/><img loading="lazy" decoding="async" src={photo('cozinha-gourmet')} alt=""/></picture><div className="wrap contact-content"><div className="eyebrow light"><i/>Contato</div><h2>Seu projeto começa<br/><em>com uma conversa.</em></h2><div className="contact-actions"><button className="button ivory" onClick={() => setQuote('')}>Solicitar orçamento</button><a className="button ghost" href={greeting} target="_blank" rel="noreferrer"><MessageCircle size={17}/>Falar no WhatsApp</a></div></div></section>
    </main>
    <footer><div className="wrap"><div className="footer-grid"><div><img className="brand footer-logo" src="./images/logo.png" alt="TS Móveis Planejados"/><p>Marcenaria sob medida em Garopaba,<br/>Santa Catarina.</p></div>
    <div><h3>Navegação</h3><a href="#inicio">Início</a><a href="#projetos">Projetos</a><a href="#showroom">Showroom 3D</a><a href="#sobre">A TS Móveis</a></div>
    <div><h3>Contato</h3><a href={greeting} target="_blank" rel="noreferrer">{company.phone}</a><a href={'mailto:'+company.email}>{company.email}</a><a href={'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(company.address)} target="_blank" rel="noreferrer"><MapPin size={14}/>{company.address}</a></div></div>
    <div className="footer-base"><span>TS Móveis Planejados</span></div></div></footer>
    <a className="whatsapp" href={greeting} target="_blank" rel="noreferrer" aria-label="Conversar com a TS Móveis no WhatsApp"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.463 3.488A11.831 11.831 0 0 0 12.029 0C5.458 0 .11 5.346.107 11.918c0 2.1.549 4.15 1.593 5.945L.008 24l6.321-1.659a11.882 11.882 0 0 0 5.7 1.451h.005c6.57 0 11.918-5.347 11.921-11.919a11.84 11.84 0 0 0-3.492-8.385zM12.034 21.78h-.004a9.895 9.895 0 0 1-5.031-1.377l-.361-.214-3.75.984 1.001-3.656-.235-.375a9.883 9.883 0 0 1-1.514-5.222c.003-5.456 4.444-9.895 9.902-9.895a9.835 9.835 0 0 1 7 2.903 9.839 9.839 0 0 1 2.9 7.002c-.003 5.457-4.444 9.896-9.908 9.896zm5.43-7.408c-.297-.149-1.758-.868-2.031-.967-.273-.1-.471-.149-.67.149-.198.298-.767.967-.94 1.165-.174.199-.347.224-.644.075-.298-.149-1.257-.463-2.394-1.477-.885-.789-1.482-1.764-1.656-2.062-.173-.297-.018-.458.131-.606.134-.133.298-.347.447-.52.148-.174.198-.298.297-.497.1-.198.05-.372-.025-.52-.074-.15-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.009-.372-.011-.57-.011a1.09 1.09 0 0 0-.793.372c-.273.298-1.04 1.017-1.04 2.48s1.065 2.875 1.213 3.074c.149.198 2.096 3.2 5.077 4.487.71.306 1.264.489 1.696.625.713.226 1.362.194 1.875.118.572-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.174-1.413-.074-.124-.272-.198-.57-.347z"/></svg></a>
    {quote !== null && <Quote initial={quote} close={() => setQuote(null)}/>}
    {movie && <FilmModal movie={movie} close={() => setMovie(null)}/>}
  </>
}
createRoot(document.getElementById('root')!).render(<App/>)
