import { useState } from 'react'
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react'
import Modal from './Modal'

const projects = [
  ['Closet iluminado', 'Closets', 'closet-luxo-iluminado', 'As portas de vidro deixam as peças à vista. A penteadeira central reúne espelho iluminado e gavetas para os itens de uso diário.'],
  ['Cozinha sob medida', 'Cozinhas', 'cozinha-madeira-planejada', 'O acabamento amadeirado contorna a janela e acompanha a bancada. A iluminação sob os armários destaca a área de trabalho.'],
  ['Painel de TV ripado', 'Salas', 'painel-tv-ripado', 'Painel claro com ripas verticais, prateleiras e gaveteiro suspenso. A composição aproveita a parede ao lado da porta.'],
  ['Escritório planejado', 'Escritórios', 'escritorio-painel-madeira', 'Uma bancada contínua cria espaço para trabalhar e guardar materiais. O painel ripado delimita a área de trabalho.'],
  ['Cabeceira iluminada', 'Dormitórios', 'quarto-cabeceira-led', 'Duas mesas de cabeceira suspensas acompanham o painel de madeira. A linha de luz marca a transição para a parede.'],
  ['Quarto infantil', 'Infantis', 'quarto-infantil-beliche', 'O espaço vertical acomoda o beliche e a escada lateral. A iluminação suave acompanha a parte inferior da estrutura.'],
  ['Espaço gourmet', 'Gourmet', 'adega-espelho-iluminado', 'A cristaleira e o nicho para bebidas enquadram a bancada. O espelho recebe iluminação nas bordas.'],
]
const categories = ['Todos', ...projects.map(project => project[1])]
const projectPhoto = (name: string) => './images/projetos/' + name + '.jpg'
export default function Portfolio({ quote }: { quote: (room: string) => void }) {
  const [filter, setFilter] = useState('Todos')
  const [expanded, setExpanded] = useState(false)
  const [index, setIndex] = useState<number | null>(null)
  const filtered = projects.filter(item => filter === 'Todos' || item[1] === filter)
  const visible = expanded ? filtered : filtered.slice(0,3)
  const active = index === null ? null : filtered[index]
  const change = (n: number) => setIndex(i => ((i ?? 0) + n + filtered.length) % filtered.length)
  return <section className="section portfolio" id="projetos"><div className="wrap">
    <div className="section-intro"><div><div className="eyebrow"><i/>Portfólio</div><h2>Ambientes que<br/><em>contam histórias.</em></h2></div>
      <p>Cada projeto nasce de uma necessidade e ganha forma em cada detalhe. Conheça de perto a marcenaria da TS.</p></div>
    <div className="filters" aria-label="Filtrar projetos por ambiente">{categories.map(category => <button key={category} aria-pressed={filter === category} onClick={() => {setFilter(category); setExpanded(false)}}>{category}</button>)}</div>
    <div className="project-grid">{visible.map(project => <button key={project[2]} className="project" onClick={() => setIndex(filtered.indexOf(project))}>
      <div className="project-photo"><img loading="lazy" src={projectPhoto(project[2])} alt={project[0]}/><span className="expand-mark"><Plus size={20}/></span></div>
      <div className="project-info"><span>{project[1]}</span><h3>{project[0]}</h3></div>
    </button>)}</div>
    {filtered.length > 3 && <div className="gallery-more"><button className="button outline" onClick={() => setExpanded(!expanded)}>{expanded ? 'Recolher galeria' : 'Ver todos os projetos'}</button></div>}
  </div>
  {active && <Modal title={active[0]} close={() => setIndex(null)} wide>
    <div className="photo-detail" onKeyDown={e => { if (e.key === 'ArrowRight') change(1); if (e.key === 'ArrowLeft') change(-1) }}>
      <img src={projectPhoto(active[2])} alt={active[0]}/>
      <div><div className="eyebrow">{active[1]}</div><h2>{active[0]}</h2><p>{active[3]}</p>
      <button className="button dark" onClick={() => {setIndex(null); quote(active[1])}}>Planejar meu ambiente</button>
      {filtered.length > 1 && <div className="gallery-nav"><button className="circle" aria-label="Projeto anterior" onClick={() => change(-1)}><ChevronLeft/></button><span>{(index ?? 0)+1} / {filtered.length}</span><button className="circle" aria-label="Próximo projeto" onClick={() => change(1)}><ChevronRight/></button></div>}</div>
    </div></Modal>}
  </section>
}
