import React, { useEffect, useRef } from 'react';
import { BACKEND_SERVERS, SERVER_POLL_INTERVAL, FETCH_TIMEOUT } from '../config';
import { useToaster } from './Toaster';

function fetchWithTimeout(url, timeout = 5000) {
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve({ ok: false, error: 'timeout' }), timeout);
    fetch(url, { method: 'GET' })
      .then((res) => {
        clearTimeout(timer);
        resolve({ ok: res.ok, status: res.status });
      })
      .catch((err) => {
        clearTimeout(timer);
        resolve({ ok: false, error: String(err) });
      });
  });
}

export default function ServerStatusChecker() {
  const { showToast, updateToast, removeToast } = useToaster();
  const pollerRefs = useRef({});
  const toastRefs = useRef({});

  useEffect(() => {
    // Immediate check on mount
    BACKEND_SERVERS.forEach((svc) => {
      const check = async () => {
        const res = await fetchWithTimeout(svc.url, FETCH_TIMEOUT);
        if (res.ok) {
          // If there was a persistent toast for this server, remove/update it
          if (toastRefs.current[svc.name]) {
            // remove persistent warning and show success briefly
            removeToast(toastRefs.current[svc.name]);
            toastRefs.current[svc.name] = null;
          }
          showToast(`${svc.name} server is reachable.`, 'success', { duration: 3000 });
          // stop any poller
          if (pollerRefs.current[svc.name]) {
            clearInterval(pollerRefs.current[svc.name]);
            pollerRefs.current[svc.name] = null;
          }
        } else {
          // server is down/sleeping
          const id = showToast(`${svc.name} appears to be sleeping — please wait, it's waking up...`, 'info', { persistent: true });
          toastRefs.current[svc.name] = id;

          // start polling if not already polling
          if (!pollerRefs.current[svc.name]) {
            pollerRefs.current[svc.name] = setInterval(async () => {
              const r = await fetchWithTimeout(svc.url, FETCH_TIMEOUT);
              if (r.ok) {
                // update UI
                if (toastRefs.current[svc.name]) {
                  removeToast(toastRefs.current[svc.name]);
                  toastRefs.current[svc.name] = null;
                }
                showToast(`${svc.name} server is awake and reachable now.`, 'success');
                clearInterval(pollerRefs.current[svc.name]);
                pollerRefs.current[svc.name] = null;
              } else {
                // optional: update persistent toast text to show polling/attempt count — keep it simple
                updateToast(toastRefs.current[svc.name], { text: `${svc.name} is still waking — trying again...` });
              }
            }, SERVER_POLL_INTERVAL);
          }
        }
      };

      check();
    });

    return () => {
      // cleanup intervals and toasts
      Object.values(pollerRefs.current).forEach((id) => id && clearInterval(id));
      Object.values(toastRefs.current).forEach((id) => id && removeToast(id));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null; // no UI here — toaster handles messages
}
