import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WordpressBannerComponent } from './wordpress-banner.component';

describe('WordpressBannerComponent', () => {
  let component: WordpressBannerComponent;
  let fixture: ComponentFixture<WordpressBannerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [WordpressBannerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WordpressBannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
