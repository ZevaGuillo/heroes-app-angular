import { Injectable } from '@angular/core';
import { CanMatch, CanActivate, Route, UrlSegment, UrlTree, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable, map, tap } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({providedIn: 'root'})
export class PublicGuard implements CanMatch, CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router) { }

  private checkAuth(): boolean | Observable<boolean> {
    return this.authService.checkAuth()
      .pipe(
        tap(isAuth => {
          if (isAuth) {
            this.router.navigate(['./']);
          }
        }),
        map(isAuth => !isAuth)
      )
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | Observable<boolean> {
    return this.checkAuth();
  }

  canMatch(route: Route, segments: UrlSegment[]): boolean | Observable<boolean> {
    return this.checkAuth();
  }
}
