'use client'
import { useSyncExternalStore } from 'react'
function subscribe(callback: () => void) { window.addEventListener('hashchange',callback);return()=>window.removeEventListener('hashchange',callback) }
export function useBrowserLocation() { return useSyncExternalStore(subscribe,()=>window.location.href,()=>'') }
