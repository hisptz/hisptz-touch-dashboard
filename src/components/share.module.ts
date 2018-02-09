import {NgModule} from '@angular/core';
import {LoadingComponent} from './loading/loading';
import {IonicModule} from "ionic-angular";
import {WarningComponent} from "./warning/warning";
import {ProgressBarComponent} from "./progress-bar/progress-bar";
import {EmptyListNotificationComponent} from "./empty-list-notification/empty-list-notification";
import {AvailableLocalInstanceComponent} from "./available-local-instance/available-local-instance";
import {ProgressLoaderComponent} from "./progress-loader/progress-loader.component";

@NgModule({
  declarations: [LoadingComponent, ProgressLoaderComponent,ProgressBarComponent, EmptyListNotificationComponent, AvailableLocalInstanceComponent, WarningComponent],
  imports: [IonicModule],
  exports: [LoadingComponent,ProgressLoaderComponent, ProgressBarComponent, EmptyListNotificationComponent, AvailableLocalInstanceComponent, WarningComponent]

})
export class SharedModule {
}
