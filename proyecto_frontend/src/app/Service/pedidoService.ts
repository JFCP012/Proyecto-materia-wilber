import { Injectable } from '@angular/core';
import { API_BASE_URL } from '../config/api.config';
import { Producto } from '../Models/Producto';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Pedido } from '../Models/Pedido';

@Injectable({ providedIn: 'root' })
export class pedidoService {

    private apiUrl = `${API_BASE_URL}/Pedido`;

    constructor(private http: HttpClient) { }

    buscarPorEstado(estado: string): Observable<Pedido[]> {
        return this.http.get<Pedido[]>(`${this.apiUrl}/BuscarPedidoEstado?estado=${estado}`);
    }

    cambiarEstado(id: number, nuevoEstado: string): Observable<Pedido> {
        return this.http.put<Pedido>(`${this.apiUrl}/CambiarEstadoPedido/${id}?nuevoEstado=${nuevoEstado}`, {});
    }

    crearPedido(pedidoDTO: any): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/CrearPedido`, pedidoDTO);
    }

}