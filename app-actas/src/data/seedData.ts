// src/data/seedData.ts
import { SeedData, Acta, SignedActa } from '../types';

export const seedData: SeedData = {
  allies: [
    {
      id: 'asoandes',
      name: 'Asoandes',
      category: 'Gremio',
      contactName: 'Carlos Mario Gómez',
      contactEmail: 'direccion@asoandes.org',
      commitments: [
        {
          id: 'aso-c1',
          activity: 'Presentación formal de la propuesta técnica y financiera del diplomado en gestión cafetera',
          responsible: 'Ana García (UAM)',
          dueDate: '2024-09-15',
          status: 'CUMPLIDO',
          completed: true,
          completedAt: '2024-09-14',
          actaNumber: '3',
          allyId: 'asoandes'
        },
        {
          id: 'aso-c2',
          activity: 'Remisión de la base de datos de asociados caracterizados para convocatorias formativas',
          responsible: 'Carlos Mario Gómez (Asoandes)',
          dueDate: '2024-09-22',
          status: 'CUMPLIDO',
          completed: true,
          completedAt: '2024-09-20',
          actaNumber: '3',
          allyId: 'asoandes'
        },
        {
          id: 'aso-c3',
          activity: 'Diseño metodológico y estructura curricular de las 40 horas prácticas de campo',
          responsible: 'María López (UAM)',
          dueDate: '2024-10-05',
          status: 'EN_PROCESO',
          completed: false,
          actaNumber: '3',
          allyId: 'asoandes'
        },
        {
          id: 'aso-c4',
          activity: 'Consolidación del convenio marco de cooperación interinstitucional con asesoría jurídica UAM',
          responsible: 'Juan Pérez (UAM - Jurídica)',
          dueDate: '2024-10-15',
          status: 'EN_PROCESO',
          completed: false,
          actaNumber: '3',
          allyId: 'asoandes'
        },
        {
          id: 'aso-c5',
          activity: 'Gestión de espacios y auditorios en el campus central para el evento de lanzamiento',
          responsible: 'Laura Méndez (Dirección Alianzas UAM)',
          dueDate: '2024-10-25',
          status: 'PENDIENTE',
          completed: false,
          actaNumber: '3',
          allyId: 'asoandes'
        },
        {
          id: 'aso-c6',
          activity: 'Definición del plan de socialización conjunto en medios regionales y canales digitales',
          responsible: 'Sofía Torres (Comunicaciones Asoandes)',
          dueDate: '2024-11-02',
          status: 'PENDIENTE',
          completed: false,
          actaNumber: '3',
          allyId: 'asoandes'
        },
        {
          id: 'aso-c7',
          activity: 'Firma protocolaria y cierre presupuestal de la primera fase del proyecto',
          responsible: 'Diego Salazar (UAM) / Carlos Gómez (Asoandes)',
          dueDate: '2024-11-15',
          status: 'PENDIENTE',
          completed: false,
          actaNumber: '3',
          allyId: 'asoandes'
        }
      ]
    },
    {
      id: 'armetales',
      name: 'Armetales',
      category: 'Empresa',
      contactName: 'Ing. Roberto Duplat',
      contactEmail: 'rduplat@armetales.com.co',
      commitments: [
        {
          id: 'arm-c1',
          activity: 'Revisión técnica de especificaciones de resistencia de materiales para prototipos mecánicos',
          responsible: 'Luis Pérez (Armetales)',
          dueDate: '2024-10-20',
          status: 'EN_PROCESO',
          completed: false,
          actaNumber: '1',
          allyId: 'armetales'
        },
        {
          id: 'arm-c2',
          activity: 'Visita técnica de docentes investigadores de ingeniería UAM a la planta industrial',
          responsible: 'Dr. Fernando Osorio (UAM)',
          dueDate: '2024-10-28',
          status: 'PENDIENTE',
          completed: false,
          actaNumber: '1',
          allyId: 'armetales'
        }
      ]
    },
    {
      id: 'alcaldia-manizales',
      name: 'Alcaldía de Manizales',
      category: 'Gobierno',
      contactName: 'Dra. Valentina Quintero',
      contactEmail: 'tic@manizales.gov.co',
      commitments: [
        {
          id: 'alc-c1',
          activity: 'Mesa de trabajo para articulación del plan Manizales Ciudad Inteligente 2030',
          responsible: 'Equipo Dirección de Alianzas UAM',
          dueDate: '2024-10-18',
          status: 'EN_PROCESO',
          completed: false,
          actaNumber: '2',
          allyId: 'alcaldia-manizales'
        }
      ]
    }
  ]
};

export const seedActas: Acta[] = [
  {
    id: 'asoandes-3',
    number: '3',
    date: '2024-09-02',
    allyId: 'asoandes',
    subject: 'Seguimiento estratégico y formulación del diplomado en gestión cafetera sostenible',
    sourceFileName: '2024-09-02_Asoandes_Acta_3.docx',
    fingerprint: 'asoandes-acta-3-seed-fingerprint',
    commitments: seedData.allies[0].commitments
  },
  {
    id: 'armetales-1',
    number: '1',
    date: '2024-09-10',
    allyId: 'armetales',
    subject: 'Alianza I+D+i para análisis metalmecánico y pasantías de estudiantes de ingeniería',
    sourceFileName: '2024-09-10_Armetales_Acta_1.docx',
    fingerprint: 'armetales-acta-1-seed-fingerprint',
    commitments: seedData.allies[1].commitments
  }
];

export const seedSignedActas: SignedActa[] = [
  {
    id: 'signed-asoandes-2',
    actaNumber: '2',
    allyId: 'asoandes',
    pdfFileName: 'Acta_02_Asoandes_Firmada_Rectoria.pdf',
    pdfUrl: '#',
    fingerprint: 'signed-asoandes-2-fp',
    uploadDate: '2024-08-20'
  }
];
