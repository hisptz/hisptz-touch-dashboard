/*
 *
 * Copyright 2015 HISP Tanzania
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston,
 * MA 02110-1301, USA.
 *
 * @since 2015
 * @author Joseph Chingalo <profschingalo@gmail.com>
 *
 */
import { Action } from '@ngrx/store';
import { CurrentUser } from '../../models/current-user';

export enum CurrentUserActionTypes {
  AddCurrentUser = '[Current user] Adding current user',
  ClearCurrentUser = '[Current user] Clear current users',
  SetCurrentUser = '[Current user] Set current user',
  SetCurrentUserColorSettings = '[Current user] Set current user color Settings',
  UpdateCurrentUser = '[Current user] updating current user'
}

export class ClearCurrentUser implements Action {
  readonly type = CurrentUserActionTypes.ClearCurrentUser;
}

export class SetCurrentUser implements Action {
  readonly type = CurrentUserActionTypes.SetCurrentUser;
  constructor(public payload: { id: string }) {}
}

export class SetCurrentUserColorSettings implements Action {
  readonly type = CurrentUserActionTypes.SetCurrentUserColorSettings;
  constructor(public payload: { colorSettings: any }) {}
}

export class AddCurrentUser implements Action {
  readonly type = CurrentUserActionTypes.AddCurrentUser;
  constructor(public payload: { currentUser: CurrentUser }) {}
}

export class UpdateCurrentUser implements Action {
  readonly type = CurrentUserActionTypes.UpdateCurrentUser;
  constructor(public payload: { id: string; currentUser: CurrentUser }) {}
}

export type CurrentUserActions =
  | AddCurrentUser
  | ClearCurrentUser
  | UpdateCurrentUser
  | SetCurrentUser
  | SetCurrentUserColorSettings;
