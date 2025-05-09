import { MatSidenavModule } from '@angular/material/sidenav';
import { Component } from '@angular/core';
import { RecipesListComponent } from './components/recipes-list/recipes-list.component';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from './shared/components/sidebar/sidebar.component';

@Component({
    selector: 'app-root',
    imports: [CommonModule, RecipesListComponent, MatSidenavModule, SidebarComponent],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'ngrx-state-management';
}
