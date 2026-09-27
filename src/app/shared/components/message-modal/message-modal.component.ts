import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-message-modal',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="modal-overlay">
      <div class="modal-content">
        <h2>{{ title }}</h2>
        <p>{{ message }}</p>
        <div class="actions">
          <button class="btn cancel" (click)="onCancel()">{{ cancelText }}</button>
          <button class="btn confirm" (click)="onConfirm()">{{ confirmText }}</button>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.85);
      z-index: 2000;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .modal-content {
      background: #181818;
      padding: 30px;
      border-radius: 8px;
      max-width: 400px;
      width: 90%;
      color: white;
      text-align: center;
      box-shadow: 0 10px 30px rgba(0,0,0,0.5);

      h2 {
        margin-top: 0;
        margin-bottom: 15px;
        font-size: 1.5rem;
      }

      p {
        color: #b3b3b3;
        margin-bottom: 25px;
        line-height: 1.5;
      }
    }

    .actions {
      display: flex;
      justify-content: center;
      gap: 15px;

      .btn {
        padding: 10px 25px;
        border: none;
        border-radius: 4px;
        font-size: 1rem;
        cursor: pointer;
        font-weight: 500;
        transition: opacity 0.2s;

        &:hover {
          opacity: 0.85;
        }

        &.confirm {
          background: #e50914;
          color: white;
        }

        &.cancel {
          background: #333;
          color: white;
        }
      }
    }
  `]
})
export class MessageModalComponent {
    @Input() title = 'Confirm';
    @Input() message = 'Are you sure?';
    @Input() confirmText = 'Yes';
    @Input() cancelText = 'No';

    @Output() confirm = new EventEmitter<void>();
    @Output() cancel = new EventEmitter<void>();

    onConfirm() {
        this.confirm.emit();
    }

    onCancel() {
        this.cancel.emit();
    }
}
