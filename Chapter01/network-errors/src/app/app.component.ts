import { Component } from '@angular/core';
import { RecipesListComponent } from './components/recipes-list/recipes-list.component';

@Component({
    selector: 'app-root',
    imports: [RecipesListComponent],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'network-errors';
}
