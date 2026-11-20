import { useState } from 'react'
import { Play, Plus, Star } from 'lucide-react'
import Modal from './Modal'
import { faq, photo, processSteps } from './data'

export const movies = {
  tour: ['Percurso pelos ambientes', './videos/ambientes-ts.mp4'],
  studio: ['Conheça a TS Móveis', './videos/apresentacao.mp4'],
  work: ['A fabricação na TS Móveis', './videos/fabricacao.mp4'],
  project: ['Um projeto por dentro', './videos/projeto.mp4'],
}
export type Movie = keyof typeof movies
export function FilmModal({ movie, close }: { movie: Movie; close: () => void }) {
  const [name, url] = movies[movie]
  return <Modal title={name} close={close} wide><div className="film-modal"><video aria-label={name} controls autoPlay playsInline preload="metadata" src={url}/><div><h3>{name}</h3>{movie === 'tour' && <a href={url} download>Baixar filme</a>}</div></div></Modal>
}

const testimonials = [
  ['Elisiane Pereira de Souza', 'Ótimo atendimento, móveis de alta qualidade e preço acessível, indico de olhos fechados!!!'],
  ['Tainá Santos', 'Equipe competente. Bom atendimento no pré e no pós trabalho, o proprietário é muito acessível e todas dúvidas são esclarecidas. Agilidade na entrega e o preço justo. Indico o trabalho do Tiago e da equipe pra quem é exigente pois os móveis ficam impecáveis.'],
  ['Mariana & Carlos', 'O nível de detalhamento que a TS Móveis entregou na nossa cozinha é surreal. Cada gaveta, cada acabamento, tudo reflete a qualidade premium que eles prometem. Foi a melhor decisão para nossa casa nova.'],
]
export default function Studio({ play }: { play: (key: Movie) => void }) {
  const [step, setStep] = useState(0)
  return <>
    <section className="section" id="sobre"><div className="wrap story-grid">
      <div className="portrait"><img src="./images/fundadores.jpg" alt="Tiago Santos e Maria Luísa, da TS Móveis Planejados" loading="lazy"/></div>
      <div className="story-copy"><div className="eyebrow"><i/>A TS Móveis</div><h2>Por trás de<br/><em>cada projeto.</em></h2>
      <p>Em Garopaba, Tiago Santos e Maria Luísa trabalham juntos para criar móveis que fazem sentido na rotina de cada família.</p>
      <p>Tiago fundou a TS e lidera a administração e a produção. Maria Luísa cuida do marketing e do comercial, acompanhando a conversa que dá início a cada ambiente.</p>
      <button className="text-link" onClick={() => play('studio')}><Play size={15}/>Assistir à apresentação</button></div>
    </div></section>
    <section className="process section" id="processo"><div className="wrap process-grid"><div><div className="eyebrow light"><i/>Nosso processo</div><h2>Do conceito<br/><em>à realidade.</em></h2>
    <div className="step-list">{processSteps.map(([name, description],i) => <div key={name} className={'step' + (step === i ? ' active' : '')}><button aria-expanded={step === i} onClick={() => setStep(step === i ? -1 : i)}><small>0{i+1}</small>{name}<Plus size={17}/></button>{step === i && <p>{description}</p>}</div>)}</div></div>
    <div className="craft"><img loading="lazy" src={photo('cozinha-ilha')} alt="Detalhe da bancada e das frentes em madeira"/><div className="craft-caption"><h3>Cada detalhe nasce da precisão.</h3><p>Do corte à inspeção final, veja de perto o trabalho da nossa fábrica.</p><button className="button ghost" onClick={() => play('work')}><Play size={15}/>Ver fabricação</button></div></div>
    </div></section>
    <section className="section feedback" id="depoimentos"><div className="wrap">
      <div className="eyebrow"><i/>Depoimentos</div><h2>Quem confia, <em>recomenda.</em></h2>
      <div className="feedback-grid">{testimonials.map(([name,quote],i)=><figure className="feedback-card" key={name}>
        <span className="feedback-stars" role="img" aria-label="5 de 5 estrelas">{Array.from({length:5},(_,j)=><Star key={j} size={16} fill="currentColor" aria-hidden="true"/>)}</span>
        <blockquote>“{quote}”</blockquote>
        <figcaption>{i===0?<span className="feedback-avatar" aria-hidden="true">E</span>:<img src={'./images/avatar-'+(i===1?'taina':'mariana-carlos')+'.png'} width="48" height="48" loading="lazy" alt=""/>}
          <span>{name}<small>{i===2?'Proprietários':'Cliente'}</small></span>
        </figcaption>
      </figure>)}</div></div></section>
    <section className="section faq"><div className="wrap faq-grid"><div><div className="eyebrow"><i/>Antes de começar</div><h2>Dúvidas<br/><em>frequentes.</em></h2></div><div>{faq.map(([q,a]) => <details key={q}><summary>{q}<Plus size={18}/></summary><p>{a}</p></details>)}</div></div></section>
  </>
}
