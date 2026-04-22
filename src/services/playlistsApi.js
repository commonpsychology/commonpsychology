const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export const playlists = {
  getAll: () =>
    fetch(`${BASE}/playlists`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
    }).then(r => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      return r.json()
    }),

  getVideos: (playlistId) =>
    fetch(`${BASE}/playlists/${playlistId}/videos`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
    }).then(r => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      return r.json()
    }),

  unlock: (playlistId, pin) =>
    fetch(`${BASE}/playlists/${playlistId}/unlock`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
      body: JSON.stringify({ pin }),
    }).then(r => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      return r.json()
    }),
}
