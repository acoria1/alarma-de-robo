import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LogniPage } from './logni.page';

describe('LogniPage', () => {
  let component: LogniPage;
  let fixture: ComponentFixture<LogniPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(LogniPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
