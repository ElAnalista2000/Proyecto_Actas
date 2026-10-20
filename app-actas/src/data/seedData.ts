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
    },
    {
      id: 'fesco-empleos-verdes',
      name: 'FESCO - Empleos Verdes',
      category: 'ONG',
      contactName: 'Dr. Germán Gallego',
      contactEmail: 'direccion@fesco.org.co',
      commitments: [
        {
          id: 'fev-c1',
          activity: 'Compartir con el equipo de FESCO el enlace a la carpeta Drive de la Convocatoria 56, incluyendo Términos de Referencia (TDR) y toda la documentación requerida por cada institución.',
          responsible: 'Jenny Aguirre Salazar (DAYRC – UAM)',
          dueDate: '2026-10-26',
          status: 'PENDIENTE',
          completed: false,
          actaNumber: '1',
          allyId: 'fesco-empleos-verdes',
          comments: 'Plazo original: Corto plazo'
        },
        {
          id: 'fev-c2',
          activity: 'Enviar correo electrónico al equipo FESCO con la relación específica de documentos que deben aportar, con la precisión de que la remisión se realice por correo electrónico y no por carga directa al Drive.',
          responsible: 'Jenny Aguirre Salazar (DAYRC – UAM)',
          dueDate: '2026-10-26',
          status: 'PENDIENTE',
          completed: false,
          actaNumber: '1',
          allyId: 'fesco-empleos-verdes',
          comments: 'Plazo original: Corto plazo'
        },
        {
          id: 'fev-c3',
          activity: 'Revisar la documentación de la Convocatoria 56 remitida por la UAM y crear carpeta propia FESCO con los requisitos solicitados.',
          responsible: 'Dr. Germán Gallego (FESCO)',
          dueDate: '2026-10-26',
          status: 'PENDIENTE',
          completed: false,
          actaNumber: '1',
          allyId: 'fesco-empleos-verdes',
          comments: 'Plazo original: Corto plazo'
        },
        {
          id: 'fev-c4',
          activity: 'Destinar jornada específica durante la semana para la escritura del documento técnico del componente FESCO en la Convocatoria 56, definiendo objetivos, participación específica de FESCO y cadena de valor.',
          responsible: 'Jenny Aguirre (DAYRC – UAM) / Dr. Germán Gallego (FESCO)',
          dueDate: '2026-10-24',
          status: 'PENDIENTE',
          completed: false,
          actaNumber: '1',
          allyId: 'fesco-empleos-verdes',
          comments: 'Plazo original: Esta semana'
        },
        {
          id: 'fev-c5',
          activity: 'Preparar la propuesta técnica y económica consolidada para la presentación a la Convocatoria 56.',
          responsible: 'Equipo UAM / Equipo FESCO',
          dueDate: '2026-10-27',
          status: 'PENDIENTE',
          completed: false,
          actaNumber: '1',
          allyId: 'fesco-empleos-verdes',
          comments: 'Plazo original: Hasta 27/10/2026'
        },
        {
          id: 'fev-c6',
          activity: 'Remitir a la Doctora Patricia Villamil el documento base (nota concepto) de la propuesta de empleos verdes compartido hace aproximadamente 20 días.',
          responsible: 'Dr. Germán Gallego (FESCO)',
          dueDate: '2026-10-26',
          status: 'PENDIENTE',
          completed: false,
          actaNumber: '1',
          allyId: 'fesco-empleos-verdes',
          comments: 'Plazo original: Corto plazo'
        },
        {
          id: 'fev-c7',
          activity: 'Redactar en el curso de la misma tarde las notas y una versión más avanzada de la nota concepto del proyecto de empleos verdes, incluyendo consorcio propuesto, duración y montos del orden de 800.000 euros.',
          responsible: 'Dr. Germán Gallego (FESCO)',
          dueDate: '2026-10-19',
          status: 'PENDIENTE',
          completed: false,
          actaNumber: '1',
          allyId: 'fesco-empleos-verdes',
          comments: 'Plazo original: Mismo día'
        },
        {
          id: 'fev-c8',
          activity: 'Compartir las notas y la nota concepto consolidada en el grupo de trabajo para validación previa a su circulación a los aliados.',
          responsible: 'Dr. Germán Gallego (FESCO)',
          dueDate: '2026-10-26',
          status: 'PENDIENTE',
          completed: false,
          actaNumber: '1',
          allyId: 'fesco-empleos-verdes',
          comments: 'Plazo original: Corto plazo'
        },
        {
          id: 'fev-c9',
          activity: 'Enviar la carta de invitación formal al Colegio Mayor de Antioquia y a la Fundación Greenland como representante del ecosistema de empleos verdes.',
          responsible: 'Dr. Germán Gallego (FESCO)',
          dueDate: '2026-10-26',
          status: 'PENDIENTE',
          completed: false,
          actaNumber: '1',
          allyId: 'fesco-empleos-verdes',
          comments: 'Plazo original: Corto plazo'
        },
        {
          id: 'fev-c10',
          activity: 'Crear grupo de trabajo (Drive y canal de comunicación) para el proyecto Empleos Verdes, integrado por Patricia Villamil, Jenny Aguirre, Ana Milena Amador, Patricia Escobar y Germán Gallego.',
          responsible: 'Dra. Patricia Villamil Rodríguez (DAYRC – UAM)',
          dueDate: '2026-10-19',
          status: 'PENDIENTE',
          completed: false,
          actaNumber: '1',
          allyId: 'fesco-empleos-verdes',
          comments: 'Plazo original: Mismo día'
        },
        {
          id: 'fev-c11',
          activity: 'Generar la carta de invitación formal para los aliados de Costa Rica (Universidad Nacional de Costa Rica y Universidad Estatal a Distancia) y las universidades europeas (Universidad de Vigo y, potencialmente, Universidad Politécnica de Valencia / Universidad de Valencia), adjuntando la nota técnica consolidada.',
          responsible: 'Dra. Patricia Villamil Rodríguez (DAYRC – UAM)',
          dueDate: '2026-10-24',
          status: 'PENDIENTE',
          completed: false,
          actaNumber: '1',
          allyId: 'fesco-empleos-verdes',
          comments: 'Plazo original: Esta semana'
        },
        {
          id: 'fev-c12',
          activity: 'Contactar a los socios potenciales del consorcio Empleos Verdes.',
          responsible: 'Equipo UAM – Equipo FESCO',
          dueDate: '2026-10-24',
          status: 'PENDIENTE',
          completed: false,
          actaNumber: '1',
          allyId: 'fesco-empleos-verdes',
          comments: 'Plazo original: Esta semana'
        },
        {
          id: 'fev-c13',
          activity: 'Programar reunión de seguimiento del Proyecto Erasmus+ Empleos Verdes.',
          responsible: 'Dra. Patricia Villamil Rodríguez (DAYRC – UAM) / Dr. Germán Gallego (FESCO)',
          dueDate: '2026-10-26',
          status: 'PENDIENTE',
          completed: false,
          actaNumber: '1',
          allyId: 'fesco-empleos-verdes',
          comments: 'Plazo original: Próxima semana'
        },
        {
          id: 'fev-c14',
          activity: 'Generar y compartir el acta de la reunión con los compromisos documentados.',
          responsible: 'Ana Milena Amador Pinilla (DAYRC – UAM)',
          dueDate: '2026-10-26',
          status: 'PENDIENTE',
          completed: false,
          actaNumber: '1',
          allyId: 'fesco-empleos-verdes',
          comments: 'Plazo original: Corto plazo'
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
  },
  {
    id: 'fesco-empleos-verdes-1',
    number: '1',
    date: '2026-10-19',
    allyId: 'fesco-empleos-verdes',
    subject: 'Coordinación de convocatorias: SGR 56 y Erasmus+ Empleos Verdes – UAM – FESCO',
    sourceFileName: 'EmpleosVerdesActa01_2026.docx',
    fingerprint: 'fesco-empleos-verdes-acta-1-seed-fingerprint',
    commitments: seedData.allies[3].commitments,
    allyName: 'FESCO - Empleos Verdes',
    category: 'ONG',
    contactName: 'Dr. Germán Gallego'
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
