import React, { useState, useEffect, useRef } from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { createCardApi, deleteCardApi, updateListColorApi } from '../api';

function List({ list, setBoard }) {
  const [newCardTitle, setNewCardTitle] = useState('');
  // applied color drives UI; pending color is what user selects in the menu
  const [appliedColor, setAppliedColor] = useState(list.color || '#ebecf0');
  const [pendingColor, setPendingColor] = useState(list.color || '#ebecf0');
  const [savingColor, setSavingColor] = useState(false);
  const [showColorMenu, setShowColorMenu] = useState(false);
  const [adding, setAdding] = useState(false);
  const menuRef = useRef(null);
  const kebabRef = useRef(null);

  const getTextColor = (hex) => {
    const h = (hex || '#ebecf0').replace('#', '');
    const r = parseInt(h.substring(0, 2), 16);
    const g = parseInt(h.substring(2, 4), 16);
    const b = parseInt(h.substring(4, 6), 16);
    const l = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    return l > 0.6 ? '#000' : '#fff';
  };
  const textColor = getTextColor(appliedColor);

  useEffect(() => {
    if (!showColorMenu) return;
    // Reset pending color to current applied when opening the menu
    setPendingColor(appliedColor);
    const handleOutside = (e) => {
      if (!menuRef.current || !kebabRef.current) return;
      if (menuRef.current.contains(e.target)) return;
      if (kebabRef.current.contains(e.target)) return;
      // Revert any pending changes when closing without apply
      setPendingColor(appliedColor);
      setShowColorMenu(false);
    };
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        setPendingColor(appliedColor);
        setShowColorMenu(false);
      }
    };
    document.addEventListener('mousedown', handleOutside, true);
    document.addEventListener('touchstart', handleOutside, true);
    document.addEventListener('keydown', handleEsc, true);
    return () => {
      document.removeEventListener('mousedown', handleOutside, true);
      document.removeEventListener('touchstart', handleOutside, true);
      document.removeEventListener('keydown', handleEsc, true);
    };
  }, [showColorMenu, appliedColor]);

  const listStyle = {
    backgroundColor: appliedColor,
    padding: '12px',
    borderRadius: '8px',
    width: '280px',
    minWidth: '280px',
    boxSizing: 'border-box'
  };

  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px'
  };

  const kebabButtonStyle = {
    background: 'transparent',
    border: 'none',
    color: textColor,
    cursor: 'pointer',
    fontSize: '20px',
    lineHeight: 1,
    padding: '4px',
    borderRadius: '6px'
  };

  const colorMenuStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '8px',
    padding: '8px',
    border: textColor === '#000' ? '1px solid rgba(0,0,0,0.2)' : '1px solid rgba(255,255,255,0.4)',
    borderRadius: '8px',
    background: textColor === '#000' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.15)'
  };

  const addCard = async () => {
    const title = newCardTitle.trim();
    if (!title) return;

    setBoard(prev => {
      const next = { ...prev, lists: prev.lists.map(l => ({ ...l })) };
      const target = next.lists.find(l => String(l._id) === String(list._id));
      if (!target) return prev;
      const newCard = { _id: `temp-${Date.now()}`, title, listId: list._id, position: target.cards.length };
      target.cards = [...target.cards, newCard];
      return next;
    });

    try {
      const { card } = await createCardApi({ listId: list._id, title });
      setBoard(prev => {
        const next = { ...prev, lists: prev.lists.map(l => ({ ...l })) };
        const target = next.lists.find(l => String(l._id) === String(list._id));
        if (target) {
          target.cards = target.cards.map(c => (String(c._id).startsWith('temp-') && c.title === title ? card : c));
        }
        return next;
      });
      setNewCardTitle('');
      setAdding(false);
    } catch (e) {
      try { const data = await fetch('http://localhost:5001/api/board').then(r => r.json()); setBoard(data); } catch {}
    }
  };

  const deleteCard = async (cardId) => {
    setBoard(prev => {
      const next = { ...prev, lists: prev.lists.map(l => ({ ...l })) };
      const target = next.lists.find(l => String(l._id) === String(list._id));
      if (!target) return prev;
      target.cards = target.cards.filter(c => String(c._id) !== String(cardId));
      target.cards = target.cards.map((c, idx) => ({ ...c, position: idx }));
      return next;
    });
    try {
      await deleteCardApi(cardId);
    } catch (e) {
      try { const data = await fetch('http://localhost:5001/api/board').then(r => r.json()); setBoard(data); } catch {}
    }
  };

  const applyColor = async () => {
    setSavingColor(true);
    // Optimistically update board state with the selected color
    setBoard(prev => {
      const next = { ...prev, lists: prev.lists.map(l => ({ ...l })) };
      const target = next.lists.find(l => String(l._id) === String(list._id));
      if (target) target.color = pendingColor;
      return next;
    });
    try {
      await updateListColorApi(list._id, pendingColor);
      // Apply locally only after successful save
      setAppliedColor(pendingColor);
    } catch (e) {
      // revert on failure
      try { const data = await fetch('http://localhost:5001/api/board').then(r => r.json()); setBoard(data); } catch {}
    } finally {
      setSavingColor(false);
      setShowColorMenu(false);
      // Ensure pending reflects current applied after closing
      setPendingColor(appliedColor);
    }
  };

  return (
    <div style={listStyle}>
      <div style={headerStyle}>
        <h3 style={{ margin: 0, color: textColor }}>{list.title}</h3>
        <button
          ref={kebabRef}
          aria-label="List menu"
          title="List menu"
          style={kebabButtonStyle}
          onClick={() => setShowColorMenu(prev => { if (!prev) setPendingColor(appliedColor); return !prev; })}
        >
          ⋮
        </button>
      </div>

      {showColorMenu && (
        <div ref={menuRef} style={colorMenuStyle}>
          <input
            type="color"
            value={pendingColor}
            onChange={e => setPendingColor(e.target.value)}
          />
          <button onClick={applyColor} disabled={savingColor}>
            {savingColor ? 'Saving…' : 'Apply'}
          </button>
        </div>
      )}

      <Droppable droppableId={String(list._id)}>
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            style={{ minHeight: 220 }}
          >
            {list.cards.map((card, idx) => (
              <Draggable key={card._id} draggableId={String(card._id)} index={idx}>
                {(dragProvided) => (
                  <div
                    ref={dragProvided.innerRef}
                    {...dragProvided.draggableProps}
                    {...dragProvided.dragHandleProps}
                    style={{
                      padding: '8px',
                      background: 'transparent',
                      border: textColor === '#000' ? '1px solid rgba(0,0,0,0.2)' : '1px solid rgba(255,255,255,0.4)',
                      borderRadius: '6px',
                      marginBottom: '8px',
                      color: textColor,
                      ...dragProvided.draggableProps.style
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>{card.title}</span>
                      <button onClick={() => deleteCard(card._id)} style={{ fontSize: 12 }}>Delete</button>
                    </div>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>

      {!adding ? (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
          <button onClick={() => setAdding(true)}>Add</button>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <input
            type="text"
            placeholder="New card title"
            value={newCardTitle}
            onChange={e => setNewCardTitle(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); } }}
          />
          <button onClick={addCard}>Add</button>
          <button onClick={() => { setAdding(false); setNewCardTitle(''); }}>Cancel</button>
        </div>
      )}
    </div>
  );
}

export default List;