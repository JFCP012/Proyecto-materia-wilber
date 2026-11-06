import { Injectable } from '@angular/core';
import { API_BASE_URL } from '../config/api.config';
import { Producto } from '../Models/Producto';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Usuario } from '../Models/Usuario';

@Injectable({ providedIn: 'root' })

export class usuarioService {

    private apiUrl = `${API_BASE_URL}/Usuario`;

    constructor(private http: HttpClient) { }

    login(id: number, password: string): Observable<Usuario> {
        return this.http.get<Usuario>(`${this.apiUrl}/login?id_usuario=${id}&password=${password}`);
    }



}
