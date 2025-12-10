import React from 'react';

const cardStyle = {
  background: '#ffffff22',
  border: '1px solid #ffffff33',
  borderRadius: 6,
  padding: 10,
  marginBottom: 8,
  color: '#fff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between'
};

export default function Card({ card, onDelete }) {
  return (
    <div style={cardStyle}>
      <span>{card.title}</span>
      <button
        onClick={onDelete}
        title="Delete card"
        style={{ background: '#ff4d4f', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 8px', cursor: 'pointer' }}
      >
        Delete
      </button>
    </div>
  );
}