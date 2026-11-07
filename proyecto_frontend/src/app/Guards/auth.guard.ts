import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';

/**
 * Guard para proteger rutas que requieren inicio de sesión y permisos por rol.
 * Si el usuario no ha iniciado sesión, se le redirige a /login.
 * Si no tiene el rol necesario, se le redirige a la pantalla que le corresponde según su rol.
 */
export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const router = inject(Router);
  const usuarioJson = localStorage.getItem('usuario');

  if (!usuarioJson) {
    router.navigate(['/login']);
    return false;
  }

  try {
    const usuario = JSON.parse(usuarioJson);

    if (!usuario || !usuario.rol) {
      localStorage.removeItem('usuario');
      router.navigate(['/login']);
      return false;
    }

    const rolUsuario = (usuario.rol || '').trim().toLowerCase();
    const rolesPermitidos = (route.data?.['roles'] as string[]) || [];

    // Si la ruta especifica roles permitidos, comprobamos si el usuario tiene permiso
    if (rolesPermitidos.length > 0) {
      const tienePermiso = rolesPermitidos.some((r) => rolUsuario.includes(r.toLowerCase()));

      if (!tienePermiso) {
        // Redirigir a la vista correspondiente al rol del usuario
        if (rolUsuario.includes('admin')) {
          router.navigate(['/admin']);
        } else if (rolUsuario.includes('vendedor')) {
          router.navigate(['/vendedor']);
        } else {
          router.navigate(['/inventario']);
        }
        return false;
      }
    }

    return true;
  } catch {
    localStorage.removeItem('usuario');
    router.navigate(['/login']);
    return false;
  }
};

/**
 * Guard para la ruta de login.
 * Si el usuario ya tiene una sesión activa, lo envía directamente a su panel.
 */
export const publicGuard: CanActivateFn = () => {
  const router = inject(Router);
  const usuarioJson = localStorage.getItem('usuario');

  if (usuarioJson) {
    try {
      const usuario = JSON.parse(usuarioJson);
      const rolUsuario = (usuario?.rol || '').trim().toLowerCase();

      if (rolUsuario.includes('admin')) {
        router.navigate(['/admin']);
        return false;
      } else if (rolUsuario.includes('vendedor')) {
        router.navigate(['/vendedor']);
        return false;
      } else if (rolUsuario.length > 0) {
        router.navigate(['/inventario']);
        return false;
      }
    } catch {
      localStorage.removeItem('usuario');
    }
  }

  return true;
};

