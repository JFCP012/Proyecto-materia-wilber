import { Pedido } from "./Pedido";
import { Producto } from "./Producto";



export interface DetallePedido {
    id_detalleP?: number;
    id_pedido?: Pedido;
    id_producto?: Producto;
    cantidad: number;
    total: number;

}