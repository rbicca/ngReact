import { Component, OnInit } from '@angular/core';
import {Observable} from 'rxjs';
import {Message} from '../model/message';
import {tap} from 'rxjs/operators';
import { MessagesService } from './messages.service';

@Component({
    selector: 'messages',
    templateUrl: './messages.component.html',
    styleUrls: ['./messages.component.css'],
    standalone: false
})
export class MessagesComponent implements OnInit {

  showMessages = false;
  error$: Observable<string[]>;


  constructor(public messagesService: MessagesService) {

  }

  ngOnInit() {
    this.error$ = this.messagesService.error$.pipe(
      tap(() =>  this.showMessages = true),
    );

  }


  onClose() {
    this.showMessages = false;
  }

}
