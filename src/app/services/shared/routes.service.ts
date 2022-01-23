import { Injectable } from '@angular/core';
import { ROUTES } from "../../../routes/routes";

@Injectable({
  providedIn: 'root'
})
export class RoutesService {
  public readonly routes = ROUTES;

  constructor() { }
}
