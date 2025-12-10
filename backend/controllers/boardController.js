const List = require('../models/List');
const Card = require('../models/Card');

// Getting full board
const getBoard = async (req, res) => {
  try {
    const lists = await List.find().sort({ position: 1 });
    const result = [];

    for (const list of lists) {
      const cards = await Card.find({ listId: list._id }).sort({ position: 1 });
      result.push({ ...list.toObject(), cards });
    }

    res.json({ lists: result });
  } catch (err) {
    console.error('Error fetching board:', err);
    res.status(500).json({ message: 'Failed to fetch board' });
  }
};

// Move a card (change list or position)
const moveCard = async (req, res) => {
  try {
    const { cardId, fromListId, toListId, newIndex } = req.body;

    const card = await Card.findById(cardId);
    if (!card) return res.status(404).json({ message: 'Card not found' });

    const movingBetweenLists = String(card.listId) !== String(toListId);

    // Remove from source list ordering if moving across lists
    if (movingBetweenLists) {
      const sourceCards = await Card.find({ listId: fromListId }).sort({ position: 1 });
      const filteredSource = sourceCards.filter(c => String(c._id) !== String(cardId));
      for (let i = 0; i < filteredSource.length; i++) {
        if (filteredSource[i].position !== i) {
          filteredSource[i].position = i;
          await filteredSource[i].save();
        }
      }
    } else {
      // Moving within the same list: remove card from its old position
      const sameListCards = await Card.find({ listId: fromListId }).sort({ position: 1 });
      const without = sameListCards.filter(c => String(c._id) !== String(cardId));
      // Insert placeholder at newIndex and reassign positions
      without.splice(newIndex, 0, card);
      for (let i = 0; i < without.length; i++) {
        const c = without[i];
        if (c.position !== i) {
          c.position = i;
          if (String(c._id) === String(cardId)) {
            c.listId = toListId; // stays same list
          }
          await c.save();
        }
      }
      return res.json({ message: 'Card moved successfully' });
    }

    // Now insert into destination list at newIndex and renumber
    const destCards = await Card.find({ listId: toListId }).sort({ position: 1 });
    // Place the moving card into destination
    card.listId = toListId;
    // Build new ordered array
    const ordered = [...destCards];
    ordered.splice(newIndex, 0, card);

    for (let i = 0; i < ordered.length; i++) {
      const c = ordered[i];
      if (c.position !== i || String(c.listId) !== String(toListId)) {
        c.position = i;
        c.listId = toListId;
        await c.save();
      }
    }

    res.json({ message: 'Card moved successfully' });
  } catch (err) {
    console.error('Error moving card:', err);
    res.status(500).json({ message: 'Failed to move card' });
  }
};

// Create a new card in a list (append at end)
const createCard = async (req, res) => {
  try {
    const { listId, title } = req.body;
    if (!listId || !title || String(title).trim() === '') {
      return res.status(400).json({ message: 'listId and non-empty title required' });
    }

    const list = await List.findById(listId);
    if (!list) return res.status(404).json({ message: 'List not found' });

    const count = await Card.countDocuments({ listId });
    const card = await Card.create({ title: String(title).trim(), listId, position: count });
    res.status(201).json({ card });
  } catch (err) {
    console.error('Error creating card:', err);
    res.status(500).json({ message: 'Failed to create card' });
  }
};

// Delete a card by id
const deleteCard = async (req, res) => {
  try {
    const { id } = req.params;
    const card = await Card.findById(id);
    if (!card) return res.status(404).json({ message: 'Card not found' });

    const listId = card.listId;
    await card.deleteOne();

    // Re-number remaining cards in the list
    const remaining = await Card.find({ listId }).sort({ position: 1 });
    for (let i = 0; i < remaining.length; i++) {
      if (remaining[i].position !== i) {
        remaining[i].position = i;
        await remaining[i].save();
      }
    }

    res.json({ message: 'Card deleted' });
  } catch (err) {
    console.error('Error deleting card:', err);
    res.status(500).json({ message: 'Failed to delete card' });
  }
};

// Update list color
const updateListColor = async (req, res) => {
  try {
    const { id } = req.params;
    const { color } = req.body;
    if (!color || typeof color !== 'string') {
      return res.status(400).json({ message: 'Valid color required' });
    }
    const list = await List.findById(id);
    if (!list) return res.status(404).json({ message: 'List not found' });
    list.color = color;
    await list.save();
    res.json({ list });
  } catch (err) {
    console.error('Error updating list color:', err);
    res.status(500).json({ message: 'Failed to update list color' });
  }
};

// Seed demo data: three lists and sample cards
const seedBoard = async (req, res) => {
  try {
    await Card.deleteMany({});
    await List.deleteMany({});

    const lists = [
      { title: 'Todo', position: 0, color: '#3d2a00' },
      { title: 'In Progress', position: 1, color: '#0f3d2e' },
      { title: 'Done', position: 2, color: '#1b1b1b' },
    ];

    const createdLists = await List.insertMany(lists);
    const map = Object.fromEntries(createdLists.map(l => [l.title, l._id]));

    const cards = [
      { title: 'Setup project', listId: map['Todo'], position: 0 },
      { title: 'Create layout', listId: map['Todo'], position: 1 },
      { title: 'Implement drag & drop', listId: map['In Progress'], position: 0 },
      { title: 'Connect backend API', listId: map['In Progress'], position: 1 },
      { title: 'Project scaffolding', listId: map['Done'], position: 0 },
    ];

    await Card.insertMany(cards);

    res.json({ message: 'Seeded demo data' });
  } catch (err) {
    console.error('Error seeding board:', err);
    res.status(500).json({ message: 'Failed to seed board' });
  }
};

const deleteCardBody = async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) return res.status(400).json({ message: 'id required' });
    req.params.id = id;
    return deleteCard(req, res);
  } catch (e) {
    console.error('Error deleteCardBody:', e);
    res.status(500).json({ message: 'Failed to delete card' });
  }
};

const updateListColorBody = async (req, res) => {
  try {
    const { listId, color } = req.body;
    if (!listId || !color) return res.status(400).json({ message: 'listId and color required' });
    req.params.id = listId;
    req.body.color = color;
    return updateListColor(req, res);
  } catch (e) {
    console.error('Error updateListColorBody:', e);
    res.status(500).json({ message: 'Failed to update list color' });
  }
};

module.exports = { getBoard, moveCard, createCard, deleteCard, updateListColor, seedBoard, deleteCardBody, updateListColorBody };