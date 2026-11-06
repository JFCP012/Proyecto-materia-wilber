import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-admin',
  imports: [CommonModule, RouterLink],
  templateUrl: './admin.html',
  styleUrl: './admin.css'
})
export class AdminComponent implements OnInit {
  private router = inject(Router);

  nombreUsuario = signal<string>('Administrador');
  mostrarModalLogout = signal<boolean>(false);

  ngOnInit(): void {
    this.cargarUsuarioSesion();
  }

  cargarUsuarioSesion(): void {
    const sesion = localStorage.getItem('usuario');
    if (sesion) {
      const u = JSON.parse(sesion);
      this.nombreUsuario.set(u.nombre_usuario || 'Administrador');
    }
  }

  abrirModalLogout(): void {
    this.mostrarModalLogout.set(true);
  }

  cerrarModalLogout(): void {
    this.mostrarModalLogout.set(false);
  }

  confirmarCerrarSesion(): void {
    localStorage.removeItem('usuario');
    this.router.navigate(['/login']);
  }
}
