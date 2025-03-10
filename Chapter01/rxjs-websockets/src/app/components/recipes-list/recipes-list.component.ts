import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { RecipeItemComponent } from '../recipe-item/recipe-item.component';
import { Recipe } from '../../types/recipes.type';
import { Message, RecipesService } from '../../services/recipes.service';


@Component({
    selector: 'app-recipes-list',
    imports: [CommonModule, RecipeItemComponent],
    templateUrl: './recipes-list.component.html',
    styleUrl: './recipes-list.component.scss'
})
export class RecipesListComponent {
  private recipesSubscription: Subscription | undefined;
  recipes: Recipe[] = [];

  constructor(private recipesService: RecipesService) { }

  ngOnInit() {
    this.recipesService.connect();
    this.recipesService.sendMessage({ type: 'recipes' });
    this.recipesSubscription = this.recipesService.recipes$.subscribe((message: Message<Recipe[]>) => {
      this.recipes = message.payload || [];
    });

    // Test WS heartbeat behavior
    // this.recipesService.sendHeartbeat();
    // console.log('Heartbeat says I\'m alive!')

    // setTimeout(() => {
    //   this.recipesService.close();
    //   this.recipes = [];
    //   console.log('Heartbeat will throw error, since we closed WS connection')
    // }, 8000);
    
    // setTimeout(() => {
    //   this.recipesService.connect();
    //   console.log('Heartbeat says I\'m alive!')
    //   this.connectToRecipesTopic();
    // }, 25000);
  }

  ngOnDestroy() {
    this.recipesSubscription?.unsubscribe();
    this.recipesService.close();
  }

  private connectToRecipesTopic(): void {
    this.recipesService.sendMessage({ type: 'recipes' });
      this.recipesSubscription = this.recipesService.recipes$.subscribe((message: Message<Recipe[]>) => {
        this.recipes = message.payload || [];
    });
  }

}
