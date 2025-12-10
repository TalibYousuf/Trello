const API_BASE = 'http://localhost:5001/api/board';

export async function fetchBoard() {
  const res = await fetch(`${API_BASE}`);
  if (!res.ok) throw new Error('Failed to fetch board');
  return res.json();
}

export async function moveCardApi({ cardId, fromListId, toListId, newIndex }) {
  const res = await fetch(`${API_BASE}/move`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cardId, fromListId, toListId, newIndex })
  });
  if (!res.ok) throw new Error('Failed to move card');
  return res.json();
}

export async function createCardApi({ listId, title }) {
  const res = await fetch(`${API_BASE}/card`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ listId, title })
  });
  if (!res.ok) throw new Error('Failed to create card');
  return res.json();
}

export async function deleteCardApi(cardId) {
  const res = await fetch(`${API_BASE}/card/${cardId}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete card');
  return res.json();
}

export async function updateListColorApi(listId, color) {
  const res = await fetch(`${API_BASE}/list/${listId}/color`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ color })
  });
  if (!res.ok) throw new Error('Failed to update color');
  return res.json();
}