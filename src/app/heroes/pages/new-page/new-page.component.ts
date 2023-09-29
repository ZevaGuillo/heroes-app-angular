import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Hero, Publisher } from '../../interfaces/hero.interface';
import { HeroesService } from '../../services/heroes.service';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { switchMap, tap, filter } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-new-page',
  templateUrl: './new-page.component.html',
  styles: [
  ]
})
export class NewPageComponent implements OnInit {

  public heroForm = new FormGroup({
    id: new FormControl<string>(''),
    superhero: new FormControl<string>('', { nonNullable: true }),
    publisher: new FormControl<Publisher>(Publisher.DCComics),
    alter_ego: new FormControl(''),
    first_appearance: new FormControl(''),
    characters: new FormControl(''),
    alt_img: new FormControl('')
  });

  public publishers = [
    {
      id: 'DC Comics',
      desc: 'DC - Comics'
    },
    {
      id: 'Marvel Comics',
      desc: 'Marvel - Comics'
    }
  ]

  constructor(
    private heroesService: HeroesService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private snackbar: MatSnackBar,
    private dialogo: MatDialog
  ) { }

  get currentHero(): Hero {
    const hero = this.heroForm.value as Hero;

    return hero;
  }

  ngOnInit(): void {
    if (!this.router.url.includes('edit')) return;

    this.activatedRoute.params
      .pipe(
        switchMap(({ id }) => this.heroesService.getHeroById(id)),
      ).subscribe(hero => {
        if (!hero) return this.router.navigateByUrl('/');

        this.heroForm.reset(hero);
        return;
      })
  }

  onSubmit() {
    if (this.heroForm.invalid) return;

    if (this.currentHero.id) {
      this.heroesService.updateHero(this.currentHero)
        .subscribe(hero => {
          this.showSnackbar('Hero updated!');
        });
      return;
    }
    this.heroesService.addHero(this.currentHero)
      .subscribe(hero => {
        this.router.navigate(['/heroes/edit', hero.id]);
        this.showSnackbar('Hero added!');
      });
  }

  onDeleteHero() {
    if (!this.currentHero.id) throw new Error('Hero ID is required');

    const dialog = this.dialogo.open(ConfirmDialogComponent, {
      data: this.heroForm.value
    });

    dialog.afterClosed()
    .pipe(
      filter( (reult: boolean) => reult),
      switchMap( () => this.heroesService.deleteHero(this.currentHero.id!)),
      filter( (wasDeleted: boolean) => wasDeleted),

    )
    .subscribe( result => {
      this.showSnackbar('Hero deleted!');
      this.router.navigate(['/heroes']);
    })

    // dialog.afterClosed().subscribe(
    //   (result) => {
    //     if (!result) return;
    //     this.heroesService.deleteHero(this.currentHero.id!)
    //       .subscribe(resp => {
    //         this.showSnackbar('Hero deleted!');
    //         this.router.navigate(['/heroes']);
    //       }
    //       );
    //   }
    // );
  }

  showSnackbar(message: string) {
    this.snackbar.open(message, 'Ok!', {
      duration: 2500
    });
  }

}
