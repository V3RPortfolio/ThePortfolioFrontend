import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OpenSourceBannerComponent } from './open-source-banner.component';

describe('OpenSourceBannerComponent', () => {
  let component: OpenSourceBannerComponent;
  let fixture: ComponentFixture<OpenSourceBannerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [OpenSourceBannerComponent]
})
    .compileComponents();

    fixture = TestBed.createComponent(OpenSourceBannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
