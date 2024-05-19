import { inject } from "@angular/core";
import { AuthService } from "../services/auth.service";
import { Router } from "@angular/router";

export const authGuardFn = (inverseResult : boolean = false) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.isLoggedIn;
}
