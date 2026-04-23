import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { finalize } from 'rxjs/operators';
import { ContactService } from '../../services/contact.service';
import { ContactFormData } from '../../interfaces/backend/contact.interface';

@Component({
  selector: 'app-contact-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
  ],
  templateUrl: './contact-form.component.html',
  styleUrl: './contact-form.component.scss',
})
export class ContactFormComponent {
  contactForm: FormGroup;
  loading = false;
  submitted = false;
  errorMessage: string | null = null;

  constructor(private fb: FormBuilder, private contactService: ContactService) {
    this.contactForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: [''],
      description: ['', [Validators.required]],
    });
  }

  onSubmit(): void {
    if (this.contactForm.invalid || this.loading) {
      this.contactForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = null;

    const payload: ContactFormData = {
      firstName: this.contactForm.value.firstName.trim(),
      lastName: this.contactForm.value.lastName.trim(),
      email: this.contactForm.value.email.trim(),
      phoneNumber: this.contactForm.value.phoneNumber?.trim() || undefined,
      description: this.contactForm.value.description.trim(),
    };

    this.contactService
      .submitContactForm(payload)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: () => {
          this.submitted = true;
          this.contactForm.reset();
        },
        error: (err) => {
          this.errorMessage = err?.error?.message || err?.message || 'Failed to send your message. Please try again.';
        },
      });
  }

  resetForm(): void {
    this.submitted = false;
    this.errorMessage = null;
    this.contactForm.reset();
  }
}
