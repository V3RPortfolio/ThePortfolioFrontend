import { Component } from '@angular/core';
import { DataTableComponent } from '../../components/shared/data-table/data-table.component';
import { MetricsCardComponent } from '../../components/shared/card/metrics-card/metrics-card.component';

@Component({
  selector: 'app-data-engineering',
  templateUrl: './data-engineering.component.html',
  styleUrl: './data-engineering.component.scss',
  standalone: true,
  imports: [
    DataTableComponent,
    MetricsCardComponent
  ]
})
export class DataEngineeringComponent {
  sampleMetrics = [
    { title: 'Pipeline Uptime', value: 60, unit: '%', isPercentage: true },
    { title: 'Data Processed', value: 1200, unit: 'GB' },
    { title: 'Error Rate', value: 40, unit: '%', isPercentage: true },
    { title: 'Average Latency', value: 200, unit: 'ms' }
  ];
  
  sampleData = [
    { id: 1, name: 'Project A', description: 'A data engineering project focused on building a scalable data pipeline.' },
    { id: 2, name: 'Project B', description: 'A project that involved designing a data warehouse for analytics.' },
    { id: 3, name: 'Project C', description: 'A project that implemented real-time data processing using Apache Kafka.' }
  ];

  columns = [
    { name: 'ID', key: 'id' },
    { name: 'Name', key: 'name' },
    { name: 'Description', key: 'description' }
  ];

  pagination = [
    { pageNumber: 1, isActive: true },
    { pageNumber: 2 },
    { pageNumber: 3 }
  ];

  onPageChange(pageNumber: number) {
    console.log('Page changed to:', pageNumber);
    // Implement pagination logic here
  }

  onRowClick(rowData: any) {
    console.log('Row clicked:', rowData);
    // Implement row click logic here
  }
}
