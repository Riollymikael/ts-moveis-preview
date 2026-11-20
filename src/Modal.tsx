import { useEffect, useRef, type ReactNode } from 'react'
import { X } from 'lucide-react'

export default function Modal({ children, close, title, wide = false }: {
  children: ReactNode; close: () => void; title: string; wide?: boolean
}) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const element = ref.current
    const active = document.activeElement as HTMLElement | null
    element?.showModal()
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      element?.close()
      document.body.style.overflow = overflow
      active?.focus({ preventScroll: true })
    }
  }, [])
  return <dialog ref={ref} className={'dialog' + (wide ? ' wide' : '')} aria-label={title}
    onCancel={close} onClick={event => { if (event.target === ref.current) close() }}>
    <div className="dialog-body">
      <button className="dialog-close circle" aria-label="Fechar" onClick={close}><X size={20}/></button>
      {children}
    </div>
  </dialog>
}
