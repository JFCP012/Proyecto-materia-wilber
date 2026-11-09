import { Injectable } from '@angular/core';
import { API_BASE_URL } from '../config/api.config';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Pedido } from '../Models/Pedido';
import { PedidoBodegaDTO } from '../Models/PedidoBodegaDTO';

@Injectable({ providedIn: 'root' })
export class pedidoService {

    private apiUrl = `${API_BASE_URL}/Pedido`;

    constructor(private http: HttpClient) { }

    buscarPorEstado(estado: string = 'Todos', fecha: string = '', anio: string = '', mes: string = ''): Observable<PedidoBodegaDTO[]> {
        return this.http.get<PedidoBodegaDTO[]>(`${this.apiUrl}/BuscarPedidoEstado?estado=${estado}&fecha=${fecha}&anio=${anio}&mes=${mes}`);
    }

    filtrarPorNombre(nombre: string = '', cedula: string = ''): Observable<PedidoBodegaDTO[]> {
        const nom = encodeURIComponent(nombre.trim());
        const ced = encodeURIComponent(cedula.trim());
        return this.http.get<PedidoBodegaDTO[]>(`${this.apiUrl}/FiltrarPorNombre?nombre=${nom}&cedula=${ced}`);
    }

    cambiarEstado(id: number, nuevoEstado: string, justificacion: string = ''): Observable<Pedido> {
        let url = `${this.apiUrl}/CambiarEstadoPedido/${id}?nuevoEstado=${encodeURIComponent(nuevoEstado)}`;
        if (justificacion && justificacion.trim()) {
            url += `&justificacion=${encodeURIComponent(justificacion.trim())}`;
        }
        return this.http.put<Pedido>(url, {});
    }

    crearPedido(pedidoDTO: any): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/CrearPedido`, pedidoDTO);
    }

}
