import { inject } from "@angular/core";
import { AuthService } from "../services/auth.service";

export const notAuthGuardFn = () => {
  const auth = inject(AuthService);

  return !auth.isLoggedIn;
}
