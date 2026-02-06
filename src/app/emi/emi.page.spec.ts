import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EmiPage } from './emi.page';

describe('EmiPage', () => {
  let component: EmiPage;
  let fixture: ComponentFixture<EmiPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(EmiPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
