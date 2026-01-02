import React, { useEffect, useRef, useState } from 'react';
import { BACKEND_SERVERS, SERVER_POLL_INTERVAL, FETCH_TIMEOUT } from '../config';
import { useToaster } from './Toaster';

function fetchWithTimeout(url, timeout = 5000) {
  return new Promise((resolve) => {
    const controller = new AbortController();
    const timer = setTimeout(() => {
      controller.abort();
      resolve({ ok: false, error: 'timeout' });
    }, timeout);

    fetch(url, { method: 'GET', signal: controller.signal })
      .then((res) => {
        clearTimeout(timer);
        resolve({ ok: res.ok, status: res.status });
      })
      .catch(() => {
        clearTimeout(timer);
        resolve({ ok: false, error: 'failed' });
      });
  });
}

export default function ServerStatusChecker() {
  const { showToast, removeToast } = useToaster();
  const toastRefs = useRef({});
  const pollersRef = useRef({});

  useEffect(() => {
    const checkServer = async (svc) => {
      const res = await fetchWithTimeout(svc.url, FETCH_TIMEOUT);

      if (res.ok) {
        // Server is UP
        if (toastRefs.current[svc.name]) {
          removeToast(toastRefs.current[svc.name]);
          toastRefs.current[svc.name] = null;
          showToast(`${svc.name} is now ready! 🚀`, 'success', { duration: 3000 });
        }

        if (pollersRef.current[svc.name]) {
          clearInterval(pollersRef.current[svc.name]);
          delete pollersRef.current[svc.name];
        }
      } else {
        // Server is DOWN/Waking
        if (!toastRefs.current[svc.name]) {
          const id = showToast(`${svc.name} Server is Waking Up... 😴\nFeel free to explore site!`, 'info', { persistent: true });
          toastRefs.current[svc.name] = id;
        }

        if (!pollersRef.current[svc.name]) {
          pollersRef.current[svc.name] = setInterval(() => checkServer(svc), SERVER_POLL_INTERVAL);
        }
      }
    };

    // Initial check for all servers
    BACKEND_SERVERS.forEach(svc => checkServer(svc));

    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      Object.values(pollersRef.current).forEach(clearInterval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
