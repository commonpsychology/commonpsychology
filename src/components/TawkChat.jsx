import { useEffect } from 'react';

const TAWK_PROPERTY_ID = 'YOUR_PROPERTY_ID'; // from tawk.to dashboard
const TAWK_WIDGET_ID = 'YOUR_WIDGET_ID';     // from tawk.to dashboard

function TawkChat() {
  useEffect(() => {
    // Prevent adding the script twice (e.g. React StrictMode double-invoke)
    if (document.getElementById('tawk-script')) return;

    var Tawk_API = window.Tawk_API || {};
    window.Tawk_API = Tawk_API;
    window.Tawk_LoadStart = new Date();

    const s1 = document.createElement('script');
    s1.id = 'tawk-script';
    s1.async = true;
    s1.src = `https://embed.tawk.to/${TAWK_PROPERTY_ID}/${TAWK_WIDGET_ID}`;
    s1.charset = 'UTF-8';
    s1.setAttribute('crossorigin', '*');
    document.body.appendChild(s1);
  }, []);

  return null; // renders nothing visible itself — widget injects its own UI
}

export default TawkChat;