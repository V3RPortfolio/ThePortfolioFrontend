import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ContactFormData } from '../interfaces/backend/contact.interface';

@Injectable({ providedIn: 'root' })
export class ContactService {
  /**
   * Submits the contact form data.
   * Currently a mock implementation that logs the payload and returns success.
   * Replace the body of this method with an actual HTTP call when the backend
   * endpoint is available, e.g.:
   *   return this.http.post<void>(`${environment.GATEWAY_BACKEND_API}/contact`, data);
   */
  submitContactForm(data: ContactFormData): Observable<void> {
    console.log('Contact form submitted:', data);
    return of(undefined);
  }
}
