import { useState, useEffect } from 'react';

export type CardType = 'yellow' | 'red';

export interface Card {
  id: string;
  playerId: string;
  playerName: string;
  type: CardType;
  date: string;
  reason: string;
  match: string;
  league: string;
  isPaid: boolean;
  amount: number;
}

const defaultCards: Card[] = [
  { id: '1', playerId: '1', playerName: 'Carlos Martínez', type: 'yellow', date: '2023-10-12', reason: 'Falta táctica', match: 'Jornada 5', league: 'Liga Central', isPaid: true, amount: 5.00 },
  { id: '2', playerId: '2', playerName: 'Luis García', type: 'red', date: '2023-10-05', reason: 'Doble amarilla', match: 'Jornada 4', league: 'Torneo Relámpago', isPaid: false, amount: 10.00 },
  { id: '3', playerId: '3', playerName: 'Andrés Pérez', type: 'yellow', date: '2023-09-28', reason: 'Reclamo al árbitro', match: 'Jornada 3', league: 'Liga Central', isPaid: true, amount: 5.00 },
  { id: '4', playerId: '1', playerName: 'Carlos Martínez', type: 'yellow', date: '2023-09-21', reason: 'Falta fuerte', match: 'Jornada 2', league: 'Liga Central', isPaid: false, amount: 5.00 },
];

export function useDiscipline() {
  const [cards, setCards] = useState<Card[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('dz_discipline_v1');
    if (saved) {
      setCards(JSON.parse(saved));
    } else {
      setCards(defaultCards);
    }
  }, []);

  const save = (newCards: Card[]) => {
    setCards(newCards);
    localStorage.setItem('dz_discipline_v1', JSON.stringify(newCards));
  };

  const addCard = (data: Omit<Card, 'id'>) => {
    const newCard: Card = {
      ...data,
      id: Date.now().toString(),
    };
    save([...cards, newCard]);
    return newCard;
  };

  const updateCard = (id: string, data: Partial<Card>) => {
    save(cards.map(c => c.id === id ? { ...c, ...data } : c));
  };

  const deleteCard = (id: string) => {
    save(cards.filter(c => c.id !== id));
  };

  const togglePaid = (id: string) => {
    save(cards.map(c => c.id === id ? { ...c, isPaid: !c.isPaid } : c));
  };

  return { cards, addCard, updateCard, deleteCard, togglePaid };
}
