import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LoginFormComponent } from '../../components/login-form/login-form.component';
import { AuthResponse } from '../../interfaces/backend/auth.interface';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, LoginFormComponent],
  // Inline template to ensure the form is rendered
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  constructor(private router: Router) {}

  onLoggedIn(_res: AuthResponse) {
    // Navigate to home (adjust if a different route is desired)
    this.router.navigateByUrl('/');
  }
}
