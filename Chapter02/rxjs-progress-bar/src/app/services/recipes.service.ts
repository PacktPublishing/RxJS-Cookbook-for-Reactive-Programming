import { Injectable } from '@angular/core';
import {
  Observable,
  Subject, 
  finalize,
  interval,
  map,
  merge,
  scan,
  takeUntil
} from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Recipe } from '../types/recipes.type';

@Injectable({
  providedIn: 'root',
})
export class RecipesService {
  private complete$ = new Subject<void>();  
  private randomProgress$ = interval(800).pipe(
    map(() => Number((Math.random() * 25 + 5).toFixed(2))),
    scan((acc, curr) => Math.min(acc + curr, 95), 0),
    takeUntil(this.complete$)
  );

  constructor(private httpClient: HttpClient) {}

  postRecipe(recipe: Recipe): Observable<number> {
    return merge(
      this.randomProgress$,
      this.httpClient.post<Recipe>('https://super-recipes.com/api/recipes', recipe).pipe(
        map(() => 100),
        finalize(() => this.complete$.next()),
      )
    )
  }
}
