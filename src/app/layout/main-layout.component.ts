import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-main-layout',
    templateUrl: './main-layout.component.html',
    imports: [
        CommonModule,
        RouterModule,
    ],
    styleUrl: './main-layout.component.scss'
})

export class MainLayoutComponent {

}