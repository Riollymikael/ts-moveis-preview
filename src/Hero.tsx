import { useEffect, useRef, useState } from 'react'
import { MapPin, Menu, Mouse, X } from 'lucide-react'
import './heroAssembly.css'
import { makePhotoSequence } from './photoAssembly'
import { photo } from './data'


const navigation = [['Projetos', '#projetos'], ['Showroom 3D', '#showroom'], ['A TS Móveis', '#sobre'], ['Processo', '#processo'], ['Contato', '#contato']]
export function Header({ quote }: { quote: () => void }) {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 40)
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false) }
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('keydown', escape)
    return () => { window.removeEventListener('scroll', update); window.removeEventListener('keydown', escape) }
  }, [])
  return <header className={'header' + (scrolled || open ? ' solid' : '')}>
    <div className="header-inner">
      <a href="#inicio" aria-label="TS Móveis Planejados, início" onClick={() => setOpen(false)}><img className="brand" src="./images/logo.png" alt="TS Móveis Planejados"/></a>
      <nav className={open ? 'navigation open' : 'navigation'} id="menu" aria-label="Navegação principal">{navigation.map(([title, href]) => <a key={href} href={href} onClick={() => setOpen(false)}>{title}</a>)}</nav>
      <button className="header-quote" onClick={() => { setOpen(false); quote() }}>Solicitar orçamento</button>
      <button className="menu-toggle" aria-expanded={open} aria-controls="menu" aria-label={open ? 'Fechar menu' : 'Abrir menu'} onClick={() => setOpen(!open)}>{open ? <X/> : <Menu/>}</button>
    </div>
  </header>
}

const phases=[
  [0,'Parede de concreto'],[1,'Painel ripado'],[53,'Nicho de pedra'],
  [83,'Rack suspenso'],[113,'Televisão'],[138,'Mesa e objetos'],[167,'Iluminação'],
  [180,'Sala com painel ripado'],
] as const
const lastFrame=180

export default function Hero({quote}:{quote:()=>void}) {
  const section=useRef<HTMLElement>(null)
  const canvas=useRef<HTMLCanvasElement>(null)
  const plate=useRef<HTMLImageElement>(null)
  const controls=useRef({advance:()=>{}})
  const [phase,setPhase]=useState(0)
  useEffect(()=>{
    const host=section.current!, screen=canvas.current!, base=plate.current!
    const media=matchMedia('(prefers-reduced-motion: reduce)')
    const mobile=matchMedia('(max-width: 760px)').matches
    let target=0, current=0, frame=-1, raf=0, finishedAt=0, disposed=false
    let render:((frame:number)=>void)|undefined
    let failed=false
    function paint(){
      raf=0
      current+= (target-current)*.35
      if(Math.abs(target-current)<.3)current=target
      const next=Math.round(current)
      if(frame!==next){
        frame=next
        render?.(frame)
        host.style.setProperty('--assembly-progress',String(frame/lastFrame))
        host.dataset.dark=String(frame>=39)
        host.dataset.frame=String(frame)
        let active=0
        for(let i=1;i<phases.length;i++) if(frame>=phases[i][0]) active=i
        setPhase(active)
        if(frame===lastFrame) finishedAt=performance.now()
      }
      if(target!==current) request()
    }
    function request(){if(!raf)raf=requestAnimationFrame(paint)}
    function seek(value:number){
      target=Math.max(0,Math.min(lastFrame,value))
      request()
    }
    const accessibleMode=()=>{
      if(media.matches||failed){
        current=target=lastFrame
        base.removeAttribute('srcset')
        base.src=photo('sala-ripada'+(mobile?'-mobile':''))
      }else if(!render){base.src=photo('sala-concreto')}
      frame=-1
      request()
    }
    accessibleMode()
    const load=async(stem:string)=>{
      const img=new Image()
      img.src=photo(stem+(mobile?'-mobile':''))
      await img.decode()
      return img
    }
    // Decode and prepare the masks once. A scroll frame never waits on image loading.
    Promise.all([load('sala-concreto'),load('sala-ripado-vazio'),load('sala-ripada')]).then(images=>{
      if(disposed)return
      render=makePhotoSequence(screen,...images)
      render(Math.max(0,frame))
      screen.hidden=false
    }).catch(()=>{if(!disposed){failed=true;accessibleMode()}})
    function atIntro(){
      return !media.matches && !failed && window.scrollY<=1
        && !document.querySelector('dialog[open], .navigation.open')
        && Math.abs(host.getBoundingClientRect().top)<=1
    }
    function consume(delta:number){
      if(!atIntro()||!delta)return false
      if(delta<0 && target===0)return false
      if(delta>0 && target===lastFrame){
        return frame<lastFrame || performance.now()-finishedAt<280
      }
      seek(target+delta)
      return true
    }
    function wheel(e:WheelEvent){
      if(!e.cancelable || e.ctrlKey || Math.abs(e.deltaX)>Math.abs(e.deltaY))return
      const pixels=e.deltaY*(e.deltaMode===1?18:e.deltaMode===2?window.innerHeight:1)
      if(consume(Math.max(-24,Math.min(24,pixels/9)))) e.preventDefault()
    }
    let previousY=0,previousX=0,captured=false
    function touchStart(e:TouchEvent){
      captured=false
      if(e.touches.length!==1)return
      previousY=e.touches[0].clientY;previousX=e.touches[0].clientX
    }
    function touchMove(e:TouchEvent){
      if(e.touches.length!==1||!e.cancelable||!atIntro())return
      const finger=e.touches[0],dy=previousY-finger.clientY,dx=previousX-finger.clientX
      previousY=finger.clientY;previousX=finger.clientX
      if(!captured&&Math.abs(dx)>Math.abs(dy))return
      if(consume(dy/5.2))captured=true
      // A fresh swipe after the completed frame can move down the page natively.
      if(captured)e.preventDefault()
    }
    function key(e:KeyboardEvent){
      if(e.ctrlKey||e.metaKey||e.altKey||e.defaultPrevented)return
      if((e.target as HTMLElement)?.closest('button,a,input,textarea,select,[contenteditable="true"]'))return
      const direction:Record<string,number>={ArrowDown:9,ArrowUp:-9,PageDown:32,PageUp:-32,' ':e.shiftKey?-32:32}
      if(consume(direction[e.key]))e.preventDefault()
    }
    controls.current.advance=()=>{
      const stops=phases.slice(2).map(([f])=>f===lastFrame?f:f-1)
      const next=stops.find(f=>f>target)
      if(next===undefined){document.getElementById('projetos')?.scrollIntoView();return}
      seek(next)
    }
    window.addEventListener('wheel',wheel,{passive:false})
    host.addEventListener('touchstart',touchStart,{passive:true})
    host.addEventListener('touchmove',touchMove,{passive:false})
    window.addEventListener('keydown',key)
    media.addEventListener('change',accessibleMode)
    return ()=>{
      disposed=true;cancelAnimationFrame(raf)
      window.removeEventListener('wheel',wheel);window.removeEventListener('keydown',key)
      host.removeEventListener('touchstart',touchStart);host.removeEventListener('touchmove',touchMove)
      media.removeEventListener('change',accessibleMode)
    }
  },[])
  return <section id="inicio" ref={section} className="hero assembly-stage" aria-label="Montagem fotográfica da sala">
    <div className="assembly-picture" role="img" aria-label="Sala com parede de concreto branco. A rolagem revela o painel ripado, o nicho, o rack e os demais móveis da fotografia.">
      <img ref={plate} src={photo('sala-concreto')} srcSet={photo('sala-concreto-mobile')+' 1080w, '+photo('sala-concreto')+' 1484w'} sizes="(max-width: 760px) 360px, 100vw" alt="" fetchPriority="high"/>
      <canvas ref={canvas} hidden aria-hidden="true"/>
    </div>
    <div className="assembly-shade" aria-hidden="true"/>
    <div className="hero-content wrap"><div className="intro-content">
      <div className="eyebrow"><i/>Marcenaria sob medida</div>
      <h1>Seu espaço.<br/><em>Sua essência.</em></h1>
      <p>Móveis planejados que transformam ambientes<br className="desktop-br"/> em experiências únicas.</p>
      <div className="hero-actions"><a className="button ivory" href="#projetos">Explorar projetos</a><button className="button ghost" onClick={quote}>Solicitar orçamento</button></div>
    </div></div>
    <div className="assembly-foot wrap">
      <div className="assembly-rail" aria-hidden="true"><i/></div>
      <span className="assembly-caption">{phases[phase][1]}</span>
      <button className="assembly-next" onClick={()=>controls.current.advance()}>{phase===phases.length-1?'Ver projetos':<><Mouse size={16}/>{phase===0?'Role para montar a sala':'Continuar montagem'}</>}</button>
      <span className="hero-location"><MapPin size={15}/>Garopaba, Santa Catarina</span>
    </div>
  </section>
}

