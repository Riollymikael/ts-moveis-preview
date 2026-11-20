import { useState, type FormEvent } from 'react'
import Modal from './Modal'
import { company } from './data'

export default function Quote({ initial, close }: { initial: string; close: () => void }) {
  const [url, setUrl] = useState('')
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const fields = ['Nome', 'WhatsApp', 'Cidade', 'Ambiente', 'Projeto', 'Investimento']
    const message = ['Olá, TS Móveis! Gostaria de solicitar um orçamento.', ...fields.filter(k => String(data.get(k) ?? '').trim()).map(k => k + ': ' + String(data.get(k)).trim())].join('\n')
    const target = company.whatsapp + '?text=' + encodeURIComponent(message)
    setUrl(target)
    window.open(target, '_blank', 'noopener,noreferrer')
  }
  return <Modal close={close} title="Solicitar orçamento"><div className="quote">
    <div className="eyebrow"><i/>Orçamento</div><h2>Conte sobre<br/><em>seu projeto.</em></h2>
    <p>Prepare os detalhes para conversar com a equipe pelo WhatsApp.</p>
    <form onSubmit={submit} onChange={() => setUrl('')}>
      <label>Seu nome<input name="Nome" autoComplete="name" required maxLength={100}/></label>
      <div className="form-pair"><label>WhatsApp com DDD<input name="WhatsApp" type="tel" autoComplete="tel" placeholder="(48) 99999-9999" pattern="[+0-9 ()\-]{10,20}" minLength={10} maxLength={20} required/></label>
      <label>Cidade<input name="Cidade" autoComplete="address-level2" required maxLength={100}/></label></div>
      <label>Tipo de ambiente<select name="Ambiente" required defaultValue={initial}><option value="" disabled>Selecione um ambiente</option>{['Cozinhas','Dormitórios','Closets','Salas','Escritórios','Infantis','Gourmet','Outro ambiente'].map(k => <option key={k}>{k}</option>)}</select></label>
      <label>O que você tem em mente?<textarea name="Projeto" required rows={3} maxLength={1600} placeholder="Conte um pouco sobre o espaço e como gostaria de usá-lo."/></label>
      <label>Faixa de investimento (opcional)<input name="Investimento" maxLength={90}/></label>
      <button className="button dark" type="submit">Continuar no WhatsApp</button>
      {url && <a className="text-link" href={url} target="_blank" rel="noreferrer">Abrir a mensagem preparada</a>}
    </form></div></Modal>
}
