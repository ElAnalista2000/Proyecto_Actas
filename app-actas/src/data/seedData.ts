// src/data/seedData.ts
import { SeedData } from '../types';

export const seedData: SeedData = {
  allies: [
    {
      id: 'asoandes',
      name: 'Asoandes',
      commitments: [
        {
          id: 'c1',
          activity: 'Revisión de reporte financiero',
          responsible: 'Ana García',
          dueDate: '2024-09-15',
        },
        {
          id: 'c2',
          activity: 'Actualización de plan de alianzas',
          responsible: 'Juan Pérez',
          dueDate: '2024-09-20',
        },
        {
          id: 'c3',
          activity: 'Entrega de minutas de reunión',
          responsible: 'María López',
          dueDate: '2024-09-18',
        }
        // ...añadir los 4 compromisos restantes según el Acta N° 3
      ],
    },
    {
      id: 'armetales',
      name: 'Armetales',
      commitments: [
        {
          id: 'c4',
          activity: 'Actualización de normativa interna',
          responsible: 'Luis Pérez',
          dueDate: '2024-10-01',
        }
      ],
    },
  ],
};
