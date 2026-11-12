type InstallChoice = { outcome: 'accepted' | 'dismissed'; platform: string }

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<InstallChoice>
}

export type PwaState = {
  installed: boolean
  installPromptAvailable: boolean
  updateAvailable: boolean
}

const installedStorageKey = 'culinary-library-installed'
const subscribers = new Set<() => void>()
let installEvent: InstallPromptEvent | null = null
let serviceWorkerRegistration: ServiceWorkerRegistration | null = null
let initialized = false
let reloadAfterUpdate = false

function isStandalone() {
  if (typeof window === 'undefined') return false
  const navigatorWithStandalone = window.navigator as Navigator & { standalone?: boolean }
  return window.matchMedia('(display-mode: standalone)').matches || navigatorWithStandalone.standalone === true
}

function wasPreviouslyInstalled() {
  if (typeof window === 'undefined') return false
  try {
    return window.localStorage.getItem(installedStorageKey) === '1'
  } catch {
    return false
  }
}

let state: PwaState = {
  installed: isStandalone() || wasPreviouslyInstalled(),
  installPromptAvailable: false,
  updateAvailable: false,
}

function publishState() {
  for (const subscriber of subscribers) subscriber()
}

function setState(partial: Partial<PwaState>) {
  state = { ...state, ...partial }
  publishState()
}

function rememberInstalled() {
  try {
    window.localStorage.setItem(installedStorageKey, '1')
  } catch {
    // Standalone detection still prevents showing the invitation when storage is unavailable.
  }
  installEvent = null
  setState({ installed: true, installPromptAvailable: false })
}

async function registerServiceWorker() {
  if (!('serviceWorker' in navigator) || !import.meta.env.PROD) return

  try {
    serviceWorkerRegistration = await navigator.serviceWorker.register(
      `${import.meta.env.BASE_URL}service-worker.js`,
      { scope: import.meta.env.BASE_URL },
    )

    if (serviceWorkerRegistration.waiting && navigator.serviceWorker.controller) {
      setState({ updateAvailable: true })
    }

    serviceWorkerRegistration.addEventListener('updatefound', () => {
      const installingWorker = serviceWorkerRegistration?.installing
      installingWorker?.addEventListener('statechange', () => {
        if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
          setState({ updateAvailable: true })
        }
      })
    })
  } catch (error) {
    console.warn('Service worker registration failed.', error)
  }
}

export function initializePwa() {
  if (typeof window === 'undefined' || initialized) return
  initialized = true

  if (isStandalone()) {
    document.documentElement.classList.add('pwa-standalone')
    rememberInstalled()
  }

  window.addEventListener('beforeinstallprompt', ((event: InstallPromptEvent) => {
    event.preventDefault()
    installEvent = event
    setState({ installPromptAvailable: true })
  }) as EventListener)

  window.addEventListener('appinstalled', rememberInstalled)
  void registerServiceWorker()
}

export function getPwaState() {
  return state
}

export function subscribeToPwaState(subscriber: () => void) {
  subscribers.add(subscriber)
  return () => {
    subscribers.delete(subscriber)
  }
}

export async function requestPwaInstall(): Promise<InstallChoice['outcome'] | null> {
  if (!installEvent) return null

  const promptEvent = installEvent
  installEvent = null
  setState({ installPromptAvailable: false })

  await promptEvent.prompt()
  const choice = await promptEvent.userChoice
  if (choice.outcome === 'accepted') rememberInstalled()
  return choice.outcome
}

export function installPwaUpdate() {
  const waitingWorker = serviceWorkerRegistration?.waiting
  if (!waitingWorker) return

  reloadAfterUpdate = true
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!reloadAfterUpdate) return
    reloadAfterUpdate = false
    window.location.reload()
  }, { once: true })
  waitingWorker.postMessage({ type: 'SKIP_WAITING' })
}
