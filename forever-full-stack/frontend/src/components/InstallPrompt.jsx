import React, { useEffect, useState } from 'react'

const isIosDevice = () => /iphone|ipad|ipod/i.test(window.navigator.userAgent)

const isStandaloneMode = () =>
  window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true

const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [showIosHelp, setShowIosHelp] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (isStandaloneMode()) {
      setIsInstalled(true)
      return
    }

    setShowIosHelp(isIosDevice())

    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault()
      setDeferredPrompt(event)
    }

    const handleInstalled = () => {
      setIsInstalled(true)
      setDeferredPrompt(null)
      setShowIosHelp(false)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleInstalled)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) {
      return
    }

    await deferredPrompt.prompt()
    await deferredPrompt.userChoice
    setDeferredPrompt(null)
  }

  if (isInstalled || dismissed || (!deferredPrompt && !showIosHelp)) {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 sm:left-auto sm:w-[360px]">
      <div className="rounded-2xl border border-gray-200 bg-white/95 p-4 shadow-xl backdrop-blur">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-gray-900">Install Kiddy Vogue</p>
            <p className="mt-1 text-sm text-gray-600">
              {deferredPrompt
                ? 'Add the app to your desktop or mobile home screen for a faster shopping experience.'
                : 'On iPhone or iPad, tap Share and then choose Add to Home Screen.'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="text-lg leading-none text-gray-400"
            aria-label="Close install prompt"
          >
            x
          </button>
        </div>

        <div className="mt-4 flex items-center gap-3">
          {deferredPrompt ? (
            <button
              type="button"
              onClick={handleInstall}
              className="rounded-full bg-black px-5 py-2 text-sm font-medium text-white"
            >
              Install App
            </button>
          ) : (
            <div className="text-sm text-gray-500">
              Share -&gt; Add to Home Screen
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default InstallPrompt
