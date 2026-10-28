import { Component } from '@angular/core';

@Component({
  selector: 'app-binding-style-component',
  standalone: false,
  templateUrl: './binding-style-component.html',
  styleUrl: './binding-style-component.css',
})
export class BindingStyleComponent {
  progressValue: number = 75; // Value range: 0 - 100
  statusColor: string = 'red'; // Color based on processing logic

  getProgressColor(): string {
    const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e'];
    const position = Math.max(0, Math.min(100, this.progressValue)) / 100 * (colors.length - 1);
    const lowerIndex = Math.floor(position);
    const upperIndex = Math.min(colors.length - 1, lowerIndex + 1);
    const ratio = position - lowerIndex;

    return this.blendColors(colors[lowerIndex], colors[upperIndex], ratio);
  }

  private blendColors(start: string, end: string, ratio: number): string {
    const startRgb = this.hexToRgb(start);
    const endRgb = this.hexToRgb(end);
    const red = Math.round(startRgb[0] + (endRgb[0] - startRgb[0]) * ratio);
    const green = Math.round(startRgb[1] + (endRgb[1] - startRgb[1]) * ratio);
    const blue = Math.round(startRgb[2] + (endRgb[2] - startRgb[2]) * ratio);

    return `rgb(${red}, ${green}, ${blue})`;
  }

  private hexToRgb(color: string): [number, number, number] {
    return [
      parseInt(color.slice(1, 3), 16),
      parseInt(color.slice(3, 5), 16),
      parseInt(color.slice(5, 7), 16),
    ];
  }

  // Check warning threshold
  isCritical(): boolean {
    return this.progressValue > 80;
  }
}