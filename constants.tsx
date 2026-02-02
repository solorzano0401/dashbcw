
import { Task, HistoricalData } from './types';

export const TEAM_MEMBERS = [
  'Steven Díaz',
  'Sofia Sandoval',
  'Stephanie Delgago',
  'Dayana Portillo',
  'Diana Arteaga'
];

export const INITIAL_TASKS: Task[] = [
  { id: '1', nombre: 'Reporte Mensual Q1', responsable: 'Steven Díaz', prodAsig: 150, prodTrab: 120, pais: 'SV', prioridad: 'Alta', fechaInicio: '2024-02-01', fecha: '2024-02-15', estatus: 'En Proceso' },
  { id: '2', nombre: 'Auditoría Inventario', responsable: 'Sofia Sandoval', prodAsig: 80, prodTrab: 0, pais: 'GT', prioridad: 'Media', fechaInicio: '2024-02-05', fecha: '2024-02-10', estatus: 'Pendiente' },
  { id: '3', nombre: 'Carga de Catálogo', responsable: 'Stephanie Delgago', prodAsig: 200, prodTrab: 50, pais: 'CR', prioridad: 'Alta', fechaInicio: '2024-02-08', fecha: '2024-02-14', estatus: 'En Proceso' },
  { id: '4', nombre: 'Soporte Regional', responsable: 'Dayana Portillo', prodAsig: 100, prodTrab: 0, pais: 'Reg', prioridad: 'Baja', fechaInicio: '2024-01-15', fecha: '2024-01-20', estatus: 'Pendiente' },
  { id: '5', nombre: 'Actualización Precios', responsable: 'Diana Arteaga', prodAsig: 300, prodTrab: 250, pais: 'SV', prioridad: 'Media', fechaInicio: '2024-02-20', fecha: '2024-02-28', estatus: 'En Proceso' },
];

export const INITIAL_HISTORIAL: Task[] = [
  { id: 'h1', nombre: 'Limpieza Datos 2023', responsable: 'Steven Díaz', prodAsig: 100, prodTrab: 100, pais: 'GT', prioridad: 'Media', fechaInicio: '2024-01-01', fecha: '2024-01-05', estatus: 'Terminado' },
  { id: 'h2', nombre: 'Migración DB', responsable: 'Sofia Sandoval', prodAsig: 50, prodTrab: 50, pais: 'CR', prioridad: 'Alta', fechaInicio: '2024-01-10', fecha: '2024-01-12', estatus: 'Terminado' },
];

export const MOCK_HISTORY_TREND: HistoricalData[] = [
  { mes: 'Oct', totalTrabajados: 450 },
  { mes: 'Nov', totalTrabajados: 520 },
  { mes: 'Dic', totalTrabajados: 480 },
  { mes: 'Ene', totalTrabajados: 600 },
];
