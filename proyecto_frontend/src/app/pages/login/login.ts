import { Component, inject, signal, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { usuarioService } from '../../Service/usuarioService';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class LoginComponent {
  private usuarioService = inject(usuarioService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  id_usuario: number | null = null;
  password = '';

  cargando = signal<boolean>(false);
  errorMensaje = signal<string>('');

  iniciarSesion(): void {
    if (!this.id_usuario || !this.password.trim()) {
      this.errorMensaje.set('Por favor, ingresa tu ID de usuario y contraseña.');
      return;
    }

    this.cargando.set(true);
    this.errorMensaje.set('');

    this.usuarioService.login(this.id_usuario, this.password).subscribe({
      next: (usuario) => {
        this.cargando.set(false);

        if (!usuario) {
          this.errorMensaje.set('Credenciales incorrectas. Verifica tu ID y contraseña.');
          this.cdr.markForCheck();
          return;
        }

        // Guardamos los datos de la sesión para usarlos en pedidos u otros módulos
        localStorage.setItem('usuario', JSON.stringify(usuario));

        console.log('Login exitoso:', usuario);

        const rol = (usuario.rol || '').toLowerCase();
        if (rol.includes('admin')) {
          this.router.navigate(['/admin']);
        } else if (rol.includes('vendedor')) {
          this.router.navigate(['/vendedor']);
        } else {
          this.router.navigate(['/inventario']);
        }

        // Redirige al catálogo de productos
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error en el login:', err);
        this.errorMensaje.set('Error al conectar con el servidor. Verifica que el backend esté encendido.');
        this.cargando.set(false);
        this.cdr.markForCheck();
      },
    });
  }
}

