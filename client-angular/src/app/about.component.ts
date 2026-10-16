import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({ selector: 'app-about', imports: [RouterLink], template: `
  <section class="page-hero about-hero"><div class="section-shell"><p class="eyebrow coral">About Harbour Hearts</p><h1>Good things<br><em>grow together.</em></h1><p>We connect generous people with practical, local ways to create a fairer and more hopeful future.</p></div></section>
  <section class="intro section-shell"><div><p class="eyebrow coral">Why we gather</p><h2>Every event is a doorway into action.</h2></div><div class="intro-text"><p>Harbour Hearts Foundation works with community partners to turn shared experiences into measurable support. From food security to coastal care, we believe a room full of people can move an entire neighbourhood forward.</p><p>Our events are welcoming, transparent and designed so that every ticket, bid and conversation contributes to a specific goal.</p><a class="text-link" routerLink="/search">Find an event ↗</a></div></section>
`, })
export class AboutComponent {}
