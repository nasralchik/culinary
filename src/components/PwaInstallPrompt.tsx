import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { getPwaState, installPwaUpdate, requestPwaInstall, subscribeToPwaState } from '../pwa/installPrompt'

function manualInstallInstructions() {
  const userAgent = navigator.userAgent
  if (/iPhone|iPad|iPod/.test(userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) {
    return 'Нажмите «Поделиться», затем выберите «На экран Домой».'
  }
  return 'Откройте меню браузера ⋮ и выберите «Установить приложение» или «Добавить на главный экран».'
}

export function PwaInstallPrompt() {
  const [pwaState, setPwaState] = useState(getPwaState)
  const [dismissed, setDismissed] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [updateDismissed, setUpdateDismissed] = useState(false)

  useEffect(() => subscribeToPwaState(() => setPwaState(getPwaState())), [])

  const install = async () => {
    if (showHelp) {
      setDismissed(true)
      return
    }

    try {
      const outcome = await requestPwaInstall()
      if (outcome === null) setShowHelp(true)
      else setDismissed(true)
    } catch {
      setShowHelp(true)
    }
  }

  if (typeof document === 'undefined') return null

  return createPortal(
    <>
      {!pwaState.installed && !dismissed && <div className="pwa-install-wrap">
        {showHelp && <aside className="pwa-install-help" role="status">
          <span>{manualInstallInstructions()}</span>
          <button type="button" aria-label="Закрыть подсказку" onClick={() => setDismissed(true)}>×</button>
        </aside>}
        <button className="pwa-install-prompt" type="button" onClick={() => void install()}>
          <span className="pwa-install-prompt-icon" aria-hidden="true">📱</span>
          <span>Установить приложение</span>
        </button>
      </div>}

      {pwaState.updateAvailable && !updateDismissed && <aside className="pwa-update-notification" role="status">
        <span>Доступна новая версия библиотеки.</span>
        <button type="button" onClick={installPwaUpdate}>Обновить</button>
        <button className="pwa-prompt-close" type="button" aria-label="Закрыть" onClick={() => setUpdateDismissed(true)}>×</button>
      </aside>}
    </>,
    document.body,
  )
}
