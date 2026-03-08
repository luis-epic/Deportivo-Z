import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCards = async () => {
      const { data, error } = await supabase
        .from('app_data')
        .select('content')
        .eq('id', 'discipline')
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          await supabase.from('app_data').insert([{ id: 'discipline', content: defaultCards }]);
          setCards(defaultCards);
        } else {
          console.error('Error fetching discipline:', error);
          const saved = localStorage.getItem('dz_discipline_v1');
          if (saved) setCards(JSON.parse(saved));
        }
      } else if (data) {
        setCards(data.content);
      }
      setLoading(false);
    };

    fetchCards();

    const channel = supabase
      .channel('discipline_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'app_data', filter: 'id=eq.discipline' },
        (payload) => {
          if (payload.new && (payload.new as any).content) {
            setCards((payload.new as any).content);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const save = async (newCards: Card[]) => {
    setCards(newCards);
    localStorage.setItem('dz_discipline_v1', JSON.stringify(newCards));
    
    const { error } = await supabase
      .from('app_data')
      .upsert([{ id: 'discipline', content: newCards }], { onConflict: 'id' });
    
    if (error) console.error('Error saving discipline to Supabase:', error);
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
