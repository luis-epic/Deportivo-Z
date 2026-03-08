import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export type PaymentMethod = 'Pago Móvil' | 'Efectivo' | 'Divisa';
export type PaymentType = 'Inscripción' | 'Arbitraje' | 'Tarjeta' | 'Otro';

export interface Payment {
  id: string;
  playerId: string;
  playerName: string;
  league: string;
  description: string;
  type: PaymentType;
  amount: number;
  method: PaymentMethod;
  date: string;
  status: 'Pagado' | 'Pendiente';
  captureUrl: string | null;
  linkedCardId?: string;
}

const defaultPayments: Payment[] = [
  { 
    id: '1', 
    playerId: '1', 
    playerName: 'Carlos Martínez', 
    league: 'Liga Central', 
    description: 'Pago de inscripción temporada 2024', 
    type: 'Inscripción', 
    amount: 50.00, 
    method: 'Pago Móvil', 
    date: '2023-10-01', 
    status: 'Pagado', 
    captureUrl: 'https://picsum.photos/seed/pay1/400/600' 
  },
  { 
    id: '2', 
    playerId: '2', 
    playerName: 'Luis García', 
    league: 'Torneo Relámpago', 
    description: 'Cuota de arbitraje jornada 5', 
    type: 'Arbitraje', 
    amount: 15.00, 
    method: 'Efectivo', 
    date: '2023-10-15', 
    status: 'Pendiente', 
    captureUrl: null 
  },
];

export function useFinances() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      const { data, error } = await supabase
        .from('app_data')
        .select('content')
        .eq('id', 'finances')
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          await supabase.from('app_data').insert([{ id: 'finances', content: defaultPayments }]);
          setPayments(defaultPayments);
        } else {
          console.error('Error fetching finances:', error);
          const saved = localStorage.getItem('dz_finances_v1');
          if (saved) setPayments(JSON.parse(saved));
        }
      } else if (data) {
        setPayments(data.content);
      }
      setLoading(false);
    };

    fetchPayments();

    const channel = supabase
      .channel('finances_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'app_data', filter: 'id=eq.finances' },
        (payload) => {
          if (payload.new && (payload.new as any).content) {
            setPayments((payload.new as any).content);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const save = async (newPayments: Payment[]) => {
    setPayments(newPayments);
    localStorage.setItem('dz_finances_v1', JSON.stringify(newPayments));
    
    const { error } = await supabase
      .from('app_data')
      .upsert([{ id: 'finances', content: newPayments }], { onConflict: 'id' });
    
    if (error) console.error('Error saving finances to Supabase:', error);
  };

  const addPayment = (data: Omit<Payment, 'id'>) => {
    const newPayment: Payment = {
      ...data,
      id: Date.now().toString(),
    };
    save([...payments, newPayment]);
    return newPayment;
  };

  const updatePayment = (id: string, data: Partial<Payment>) => {
    save(payments.map(p => p.id === id ? { ...p, ...data } : p));
  };

  const deletePayment = (id: string) => {
    save(payments.filter(p => p.id !== id));
  };

  return { payments, addPayment, updatePayment, deletePayment };
}
