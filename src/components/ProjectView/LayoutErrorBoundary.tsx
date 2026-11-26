import { Component, type ReactNode } from 'react'
import { useT } from '../../i18n/context'
import styles from './ProjectView.module.css'

/** Si el chunk del layout no carga, el diálogo sigue abierto y se puede cerrar o recargar. */
export default class LayoutErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  render() {
    return this.state.failed ? <LoadError /> : this.props.children
  }
}

function LoadError() {
  const { lang } = useT()
  return (
    <div className={styles.loadError} role="alert">
      <p>{lang === 'es' ? 'No se pudo cargar este proyecto.' : 'This project could not be loaded.'}</p>
      <button type="button" className={styles.reload} onClick={() => window.location.reload()}>
        {lang === 'es' ? 'Recargar' : 'Reload'}
      </button>
    </div>
  )
}
