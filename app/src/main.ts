import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient } from '@angular/common/http';
import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { AppComponent } from './app/app.component';
import { importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import routes from './app/app.routes';

import {MatButtonModule} from '@angular/material/button'; 
import {MatIconModule } from '@angular/material/icon';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatCardModule} from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { CommonModule } from '@angular/common';


const materialComponents = [
    MatButtonModule,
    MatToolbarModule,
    MatIconModule,
    MatCardModule,
    MatListModule,
    
];

bootstrapApplication(AppComponent, {
    providers: [
        importProvidersFrom(
            BrowserModule, 
            ...materialComponents, 
            FormsModule,
            CommonModule,            
        ),
        provideAnimationsAsync(),
        provideHttpClient(),
        provideAnimations(),
        provideRouter(routes)
    ]
})
  .catch(err => console.error(err));
