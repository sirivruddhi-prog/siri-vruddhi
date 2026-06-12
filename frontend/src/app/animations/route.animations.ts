import { trigger, transition, style, animate, query } from '@angular/animations';

export const routeFadeAnimation = trigger('routeFade', [
  transition('* <=> *', [
    query(':enter', [
      style({ opacity: 0 }),
      animate('320ms 80ms cubic-bezier(0.22, 1, 0.36, 1)', style({ opacity: 1 })),
    ], { optional: true }),
    query(':leave', [
      animate('220ms cubic-bezier(0.22, 1, 0.36, 1)', style({ opacity: 0 })),
    ], { optional: true }),
  ]),
]);
