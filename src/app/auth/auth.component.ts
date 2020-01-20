import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { MatDialog } from '@angular/material';
import { ConfirmDialogComponent, ConfirmDialogModel } from '../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent implements OnInit {

  loginForm: FormGroup;
  terminal: any;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private dialog: MatDialog
  ) { }

  ngOnInit() {
    this.terminal = this.route.snapshot.data['terminal'];
    console.log(this.terminal);
    this.loginForm = this.fb.group({
      'username': [null, Validators.required],
      'password': [null, Validators.required]
    });
  }

  login() {
    this.loading = true;
    this.authService.authenticate(this.loginForm.value).subscribe(resp=>{
      if(resp){
        this.loading = false;
      }
      this.router.navigateByUrl('/rt')
    } ,
    er =>{
     if(er.status === 401){
      this.loading = false;
      const dialogData = new ConfirmDialogModel("Unauthroized!", "Invalid Username Or Password!" , false);
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        maxWidth: "400px",
        data: dialogData,
        disableClose : true
      });
     }
    }
      // () => this.router.navigateByUrl('/rt')
    );
   
  }

}
