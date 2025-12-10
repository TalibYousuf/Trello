import React, { useEffect, useState } from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import List from './List';
import { fetchBoard, moveCardApi } from '../api';

const boardStyle = {
  display: 'flex',
  gap: '12px',
  alignItems: 'flex-start',
  padding: '12px'
};

function Board() {
  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    fetchBoard()
      .then(data => {
        if (!mounted) return;
        setBoard(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || 'Failed to load');
        setLoading(false);
      });
    return () => { mounted = false; };
  }, []);

  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;

    const fromListId = source.droppableId;
    const toListId = destination.droppableId;
    const newIndex = destination.index;

    // Optimistic UI update
    setBoard(prev => {
      if (!prev) return prev;
      const next = { ...prev, lists: prev.lists.map(l => ({ ...l, cards: [...l.cards] })) };
      const fromList = next.lists.find(l => String(l._id) === String(fromListId));
      const toList = next.lists.find(l => String(l._id) === String(toListId));
      if (!fromList || !toList) return prev;

      const cardIndex = fromList.cards.findIndex(c => String(c._id) === String(draggableId));
      if (cardIndex === -1) return prev;
      const [moved] = fromList.cards.splice(cardIndex, 1);
      toList.cards.splice(newIndex, 0, moved);
      return next;
    });

    try {
      await moveCardApi({
        cardId: draggableId,
        fromListId,
        toListId,
        newIndex
      });
    } catch (err) {
      // Reload board on failure to sync state
      fetchBoard().then(setBoard).catch(() => {});
    }
  };

  if (loading) return <div style={{ padding: 16 }}>Loading…</div>;
  if (error) return <div style={{ padding: 16, color: 'red' }}>Error: {error}</div>;
  if (!board) return null;

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div style={boardStyle}>
        {board.lists.map(list => (
          <List key={list._id} list={list} setBoard={setBoard} />
        ))}
      </div>
    </DragDropContext>
  );
}

export default Board;