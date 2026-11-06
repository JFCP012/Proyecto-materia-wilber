import { Injectable } from '@angular/core';
import { API_BASE_URL } from '../config/api.config';
import { Producto } from '../Models/Producto';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class productoService {

    private apiUrl = `${API_BASE_URL}/Producto`;

    constructor(private http: HttpClient) { }

    buscarTodo(): Observable<Producto[]> {
        return this.http.get<Producto[]>(`${this.apiUrl}/BuscarTodos`);
    }

    buscarPorId(id: number): Observable<Producto> {
        return this.http.get<Producto>(`${this.apiUrl}/BuscarPorId/${id}`);
    }

    buscarPorNombre(nombre?: string): Observable<Producto[]> {
        if (!nombre || nombre.trim() === '') {
            return this.buscarTodo();
        }
        return this.http.get<Producto[]>(`${this.apiUrl}/BuscarPorNombre`, {
            params: { nombre: nombre.trim() }
        });
    }

    crearProducto(producto: Producto): Observable<Producto> {
        return this.http.post<Producto>(`${this.apiUrl}/CrearProducto`, producto);
    }

    editarProducto(idProducto: number, producto: Producto): Observable<Producto> {
        return this.http.patch<Producto>(`${this.apiUrl}/EditarProducto/${idProducto}`, producto);
    }

    cambiarEstado(idProducto: number): Observable<Producto> {
        return this.http.put<Producto>(`${this.apiUrl}/CambiarEstado/${idProducto}`, null);
    }
}
