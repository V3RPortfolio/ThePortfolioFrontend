import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JarvisAiIntroComponent } from './jarvis-ai-intro.component';

describe('JarvisAiIntroComponent', () => {
  let component: JarvisAiIntroComponent;
  let fixture: ComponentFixture<JarvisAiIntroComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [JarvisAiIntroComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JarvisAiIntroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
