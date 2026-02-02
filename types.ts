
export type Priority = 'Alta' | 'Media' | 'Baja';
export type Country = 'SV' | 'GT' | 'CR' | 'Reg';
export type Status = 'Pendiente' | 'En Proceso' | 'Terminado';

export interface Task {
  id: string;
  nombre: string;
  responsable: string;
  prodAsig: number;
  prodTrab: number;
  pais: Country;
  prioridad: Priority;
  fechaInicio: string;
  fecha: string;
  estatus: Status;
}

export interface HistoricalData {
  mes: string;
  totalTrabajados: number;
}
