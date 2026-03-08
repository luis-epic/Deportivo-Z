import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface Match {
  id: string;
  date: string;
  time: string;
  opponent: string;
  location: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  score?: {
    home: number;
    away: number;
  };
  isHome: boolean;
}

const defaultMatches: Match[] = [
  {
    id: '1',
    date: '2024-03-15',
    time: '10:00',
    opponent: 'Titanes FC',
    location: 'Cancha Principal',
    status: 'upcoming',
    isHome: true
  },
  {
    id: '2',
    date: '2024-03-01',
    time: '09:00',
    opponent: 'Leones del Norte',
    location: 'Estadio Municipal',
    status: 'completed',
    score: { home: 3, away: 1 },
    isHome: true
  }
];

export function useMatches() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatches = async () => {
      const { data, error } = await supabase
        .from('app_data')
        .select('content')
        .eq('id', 'matches')
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          await supabase.from('app_data').insert([{ id: 'matches', content: defaultMatches }]);
          setMatches(defaultMatches);
        } else {
          console.error('Error fetching matches:', error);
          const saved = localStorage.getItem('dz_matches_v1');
          if (saved) setMatches(JSON.parse(saved));
        }
      } else if (data) {
        setMatches(data.content);
      }
      setLoading(false);
    };

    fetchMatches();

    const channel = supabase
      .channel('matches_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'app_data', filter: 'id=eq.matches' },
        (payload) => {
          if (payload.new && (payload.new as any).content) {
            setMatches((payload.new as any).content);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const save = async (newMatches: Match[]) => {
    setMatches(newMatches);
    localStorage.setItem('dz_matches_v1', JSON.stringify(newMatches));
    
    const { error } = await supabase
      .from('app_data')
      .upsert([{ id: 'matches', content: newMatches }], { onConflict: 'id' });
    
    if (error) console.error('Error saving matches to Supabase:', error);
  };

  const addMatch = (match: Omit<Match, 'id'>) => {
    const newMatch = { ...match, id: Date.now().toString() };
    save([...matches, newMatch]);
  };

  const updateMatch = (id: string, data: Partial<Match>) => {
    save(matches.map(m => m.id === id ? { ...m, ...data } : m));
  };

  const deleteMatch = (id: string) => {
    save(matches.filter(m => m.id !== id));
  };

  const completeMatch = (id: string, score: { home: number; away: number }) => {
    save(matches.map(m => m.id === id ? { ...m, status: 'completed', score } : m));
  };

  return { matches, addMatch, updateMatch, deleteMatch, completeMatch };
}
