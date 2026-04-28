import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Title } from '@angular/platform-browser';
import { RouterOutlet } from '@angular/router';
import { NetworkStatusService } from '@bills/tools';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, MatIconModule]
})
export class AppComponent {
  private titleService = inject(Title);
  protected readonly networkStatus = inject(NetworkStatusService);

  constructor() {
    this.titleService.setTitle('Rachunki');
  }

}
