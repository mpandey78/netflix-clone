import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../core/services/toast.service';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
    selector: 'app-toast',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="toast-container">
      @for (toast of toastService.toasts(); track toast.id) {
        <div class="toast" [class]="toast.type" @fade>
          <span class="message">{{ toast.message }}</span>
          <button class="close-btn" (click)="toastService.remove(toast.id)">×</button>
        </div>
      }
    </div>
  `,
    styles: [`
    .toast-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 10px;
      pointer-events: none; /* Allow clicking through container */
    }

    .toast {
      pointer-events: auto;
      min-width: 300px;
      padding: 16px;
      border-radius: 4px;
      background: #333;
      color: white;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 14px;
      position: relative;
      overflow: hidden;

      &.success {
        background: #2e7d32; // Green
        border-left: 4px solid #81c784;
      }

      &.error {
        background: #c62828; // Red
        border-left: 4px solid #e57373;
      }

      &.info {
        background: #1565c0; // Blue
        border-left: 4px solid #64b5f6;
      }

      .message {
        margin-right: 12px;
      }

      .close-btn {
        background: none;
        border: none;
        color: rgba(255,255,255,0.7);
        font-size: 20px;
        cursor: pointer;
        padding: 0 4px;
        
        &:hover {
          color: white;
        }
      }
    }
  `],
    animations: [
        trigger('fade', [
            transition(':enter', [
                style({ opacity: 0, transform: 'translateY(-20px)' }),
                animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
            ]),
            transition(':leave', [
                animate('200ms ease-in', style({ opacity: 0, transform: 'translateX(50px)' }))
            ])
        ])
    ]
})
export class ToastComponent {
    toastService = inject(ToastService);
}
