import { Component, OnInit } from '@angular/core';
import { NgClass } from '@angular/common';
import { MatDivider } from '@angular/material/divider';
import { MarkdownPreviewerComponent } from '../../components/markdown-previewer/markdown-previewer.component';
import { AuthenticationService } from '../../services/djadmin/documentation.service';
import { ServiceGroupInfoOut, ServiceInfoOut, ServiceOut } from '../../interfaces/djadmin/documentation.interface';

@Component({
  selector: 'app-platforms-and-services',
  templateUrl: './platforms-and-services.component.html',
  styleUrl: './platforms-and-services.component.scss',
  standalone: true,
  imports: [
    NgClass,
    MatDivider,
    MarkdownPreviewerComponent,
  ],
})
export class PlatformsAndServicesComponent implements OnInit {
  serviceGroups: ServiceGroupInfoOut[] = [];
  selectedService: ServiceOut | null = null;
  selectedServiceId: string | null = null;

  isLoadingGroups = false;
  isLoadingService = false;
  groupsError: string | null = null;
  serviceError: string | null = null;

  constructor(private documentationService: AuthenticationService) {}

  ngOnInit(): void {
    this.loadServiceGroups();
  }

  private loadServiceGroups(): void {
    this.isLoadingGroups = true;
    this.groupsError = null;

    this.documentationService.getServiceGroups().subscribe({
      next: (groups) => {
        this.serviceGroups = groups;
        this.isLoadingGroups = false;
        if (groups.length > 0 && groups[0].services.length > 0) {
          this.select(groups[0].services[0]);
        }
      },
      error: () => {
        this.groupsError = 'Failed to load service groups. Please try again later.';
        this.isLoadingGroups = false;
      },
    });
  }

  get combinedMarkdown(): string {
    if (!this.selectedService) return '';
    return [...this.selectedService.contents]
      .sort((a, b) => a.sequence_number - b.sequence_number)
      .map(c => c.content ?? '')
      .join('\n\n');
  }

  select(service: ServiceInfoOut): void {
    this.selectedServiceId = service.id;
    this.selectedService = null;
    this.serviceError = null;
    this.isLoadingService = true;

    this.documentationService.getService(service.id).subscribe({
      next: (serviceOut) => {
        this.selectedService = serviceOut;
        this.isLoadingService = false;
      },
      error: () => {
        this.serviceError = 'Failed to load service content. Please try again later.';
        this.isLoadingService = false;
      },
    });
  }
}
