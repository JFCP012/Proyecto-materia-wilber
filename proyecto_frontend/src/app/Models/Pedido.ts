import { Usuario } from "./Usuario";

export interface Pedido {
    id_pedido?: number;
    nombre_pedido?: string;
    estado_pedido?: string;
    fecha_pedido: Date | string;
    usuario?: Usuario;
}
