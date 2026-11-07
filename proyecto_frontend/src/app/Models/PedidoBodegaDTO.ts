export interface PedidoBodegaDTO {
    id_pedido: number;
    nombre_cliente: string;
    cedula_cliente?: string;
    direccion_cliente: string;
    producto: string;
    cantidad: number;
    estado_pedido: string;
    total: number;
    fecha_pedido: string | Date;
    nombre_usuario: string;
}
