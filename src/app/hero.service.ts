import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import { Hero } from './hero';
import { MessageService } from './message.service';

@Injectable({
  providedIn: 'root',
})

export class HeroService {
  private heroesUrl = 'api/heroes'; //url to web api
  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json'})
  };
   constructor(
    private messageService: MessageService,
    private http: HttpClient) { }

  getHeroes(): Observable<Hero[]>{
   return this.http.get<Hero[]>(this.heroesUrl);
  }

  getHero(id: number): Observable<Hero>{
    //todo: send the message _after_ fetching the hero

    /* .pipe:
        functions that could be used ilke ordinary functions but, in practice, there tend to be many of them         convolved together and become unreadable: 
          op4()(op3()(op2()(op1()(obs))));

        This accomplishes the same thing in a more readable manner
          obs.pipe(
            op1(),
            op2(),
            op3(),
            op4()
          )
    */

    /* .tap

        looks at the Observable values and does something with those values and then passes them along. It doesn't touch the values themselves

    */
   const url = `${this.heroesUrl}/${id}`;
   return this.http.get<Hero>(url).pipe(
     tap(_ => this.log(`fetched hero id=${id}`)),
     catchError(this.handleError<Hero>(`getHero id=${id}`))
   );
  }
 
  /*PUT: update the hero on the server */
  updateHero(hero: Hero): Observable<any>{
    return this.http.put(this.heroesUrl, hero, this.httpOptions).pipe(
      tap(_ => this.log(`updated hero id=${hero.id}`)),
      catchError(this.handleError<any>('updateHero'))
    );
  }

  /* POST: add a new hero to the server */
  addHero(hero: Hero): Observable<Hero> {
    return this.http.post<Hero>(this.heroesUrl, hero, this.httpOptions).pipe(
      tap((newHero: Hero) => this.log(`added hero with id=${newHero.id}`)), 
      catchError(this.handleError<Hero>('addHero'))
    );
  }

  /*DELETE: remove hero from server */
  deleteHero(hero:Hero | number): Observable<Hero>{
    const id = typeof hero === "number" ? hero : hero.id;
    const url = `${this.heroesUrl}/${id}`;

    return this.http.delete<Hero>(url, this.httpOptions).pipe(
      tap(_ => this.log(`deleted hero id=${id}`)), 
      catchError(this.handleError<Hero>('deleteHero'))
    );
  }

  // GET heroes whose name contains search term
  searchHeroes(term: string): Observable<Hero[]>{
    if(!term.trim()) {
      //if not search term return empty hero array
      return of([]);
    }

    return this.http.get<Hero[]>(`${this.heroesUrl}/?name=${term}`).pipe(
      tap(_ => this.log(`found heroes matching "${term}"`)),
      catchError(this.handleError<Hero[]>('searchHeroes', []))
    );
  }

  private log(message: string) {
    this.messageService.add(`HeroService: ${message}`)
  }

  private handleError<T> (operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {

      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead

      // TODO: better job of transforming error for user consumption
      this.log(`${operation} failed: ${error.message}`);

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }
}