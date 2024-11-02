import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { HttpClient, provideHttpClient } from '@angular/common/http';
import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { AppComponent } from './app/app.component';
import { importProvidersFrom, inject } from '@angular/core';
import { provideRouter, UrlSerializer } from '@angular/router';
import routes from './app/app.routes';

import {MatButtonModule} from '@angular/material/button'; 
import {MatIconModule } from '@angular/material/icon';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatCardModule} from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { CommonModule } from '@angular/common';
import { provideNamedApollo } from 'apollo-angular';

import { GraphQLClients } from './app/app.constants';
import { ApolloService } from './app/services/apollo.service';
import { CustomUrlSerializer } from './app/services/serializers/url-serializer.service';


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
        provideRouter(routes),
        provideNamedApollo(() => {
            const http = inject(HttpClient);
            return {
                [GraphQLClients.default.name]: ApolloService.getDefaultApolloClient(),
                [GraphQLClients.github.name]: ApolloService.getGithubApolloClient(http),
            };
        }),
        {
            provide: UrlSerializer,
            useClass: CustomUrlSerializer
        }        
        
    ]
})
  .catch(err => console.error(err));
