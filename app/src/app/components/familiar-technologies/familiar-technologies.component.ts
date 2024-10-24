import { Component } from '@angular/core';
import { ParallaxDirective } from '../../directives/parallax.directive';

@Component({
    selector: 'app-familiar-technologies',
    templateUrl: './familiar-technologies.component.html',
    styleUrl: './familiar-technologies.component.scss',
    standalone: true,
    imports: [
      ParallaxDirective
    ]
})
export class FamiliarTechnologiesComponent {
  technologyImagePath = 'icons/technologies';
  familiarTechnologies  = {

    languages: [
      {
        name: 'Python',
        level: '80%',
        icon: 'python.svg'
      },
      {
        name: 'C#',
        level: '80%',
        icon: 'c_sharp.svg'
      },
      {
        name: 'JavaScript',
        level: '90%',
        icon: 'javascript.svg'
      },
      {
        name: 'TypeScript',
        level: '80%',
        icon: 'typescript.svg'
      },
      {
        name: 'HTML',
        level: '90%',
        icon: 'html.svg'
      },
      {
        name: 'CSS',
        level: '90%',
        icon: 'css.svg'
      },
      {
        name: 'SQL',
        level: '80%',
        icon: 'sql.svg'
      },
      
    ],

    frameworks: [
      {
        name: '.NET MVC',
        level: '90%',
        icon: 'net_mvc.svg'
      },
      {
        name: '.NET Core',
        level: '80%',
        icon: 'net_core.svg'
      },
      {
        name: 'Django',
        level: '90%',
        icon: 'django.svg'
      }, 
      {
        name: 'Keycloak',
        level: '70%',
        icon: 'spring.svg'
      },     
      {
        name: 'ExpressJS',
        level: '80%',
        icon: 'express.svg'
      },
      {
        name: 'NestJS',
        level: '90%',
        icon: 'nest_js.svg'
      },
      {
        name: 'Angular',
        level: '80%',
        icon: 'angular.svg'
      },
      {
        name: 'jQuery',
        level: '90%',
        icon: 'jQuery.svg'
      },
      // {
      //   name: 'Symfony',
      //   level: '70%',
      //   icon: 'symfony.svg'
      // },
      {
        name: 'WordPress',
        level: '70%',
        icon: 'wordPress.svg'
      },
    ],

    deployments: [
      {
        name: 'Docker',
        level: '80%',
        icon: 'docker.svg'
      },
      {
        name: 'AWS',
        level: '70%',
        icon: 'aws.svg'
      },
      {
        name: 'Azure',
        level: '70%',
        icon: 'azure.svg'
      },
      {
        name: 'Serverless',
        level: '80%',
        icon: 'serverless.svg'
      },
      {
        name: 'Terraform',
        level: '80%',
        icon: 'terraform.svg'
      },
      {
        name: 'Github Actions',
        level: '80%',
        icon: 'github.svg'
      }
    ]
  };
}
