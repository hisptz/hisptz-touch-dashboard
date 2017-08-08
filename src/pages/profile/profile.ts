import { Component,OnInit } from '@angular/core';
import { IonicPage, NavController } from 'ionic-angular';
import {ProfileProvider} from "../../providers/profile/profile";

/**
 * Generated class for the ProfilePage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html',
})
export class ProfilePage implements OnInit{


  constructor(public navCtrl: NavController, private profileProvider : ProfileProvider) {
  }

  ngOnInit(){

  }


}
