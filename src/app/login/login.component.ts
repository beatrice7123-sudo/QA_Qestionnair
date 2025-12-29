import { Component, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { LoginReq, ServiceService, UserInfo } from '../@service/service.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpServiceService } from '../@service/http-service.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ CommonModule,FormsModule ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  constructor(
    private router: Router,
    private service:ServiceService,
    private http:HttpServiceService,
  ) {}

  email!:string;
  password!:string;

  name!:string;
  birthDate!:string;
  gender!:string;
  phone!:string;
  newEmail!:string;
  newPassword!:string;
  admin!:boolean;

  loginData!:LoginReq;
  registerData!:UserInfo;
  userInfo!:any;


  @ViewChild('loginDialog') loginDialog!: ElementRef<HTMLDialogElement>;
  login() {
    this.loginData={
      email:this.email,
      password:this.password
    }
    this.http.postApi("http://localhost:8080/quiz/login", this.loginData).subscribe((res:any) => {
      if(res.code==200){
        this.userInfo={
          name:res.name,
          phone:res.phone,
          email:res.email,
          birthDate:res.birthDate,
          gender:res.gender,
          admin:res.admin
        }
        this.service.setuserEmail(res.email);
        this.service.setUserInfo(this.userInfo);
        this.router.navigate(['/user/question-list']);
      }else{
        this.loginDialog.nativeElement.showModal();
        setTimeout(() => {
          this.loginDialog.nativeElement.close();
        }, 2000);
      }
    })

    // // 找到對應的使用者
    // const matchedUser = this.service.sampleLogins.find(u => u.email === this.email && u.password === this.password);

    // // if (matchedUser) {
    // //   const userInfo = this.service.sampleUsers.find(info => info.email === matchedUser.email);
    // //   if (userInfo) {
    // //     const userId = userInfo.id;
    // //     this.service.setUserId(userId);
    // //     console.log("Login successful for user ID:", userId);
    // //     // 跳轉
    // //     this.router.navigate(['/user/question-list', userId]);
    // //     return;
    // //   }
    // // }

  }

  @ViewChild('registerDialog') registerDialog!: ElementRef<HTMLDialogElement>;
  register(){
    this.registerDialog.nativeElement.showModal();
  }
  closeDialog() {
    this.registerDialog.nativeElement.close();
  }
  @ViewChild('alertDialog') alertDialog!: ElementRef<HTMLDialogElement>;
  @ViewChild('checkDialog') checkDialog!: ElementRef<HTMLDialogElement>;
  @ViewChild('passwordErrorDialog') passwordErrorDialog!: ElementRef<HTMLDialogElement>;
  @ViewChild('successDialog') successDialog!: ElementRef<HTMLDialogElement>;
  @ViewChild('errorDialog') errorDialog!: ElementRef<HTMLDialogElement>;

  save(){
    const passwordPattern = /^(?=.*[!@#$%^&*?_]).{8,16}$/;
    const phonePattern = /^09\d{8}$/;
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const cleanPhone = this.phone.replace(/-/g, '');
    if(this.name==null || this.newPassword==null || this.phone==null ||
       this.email==null || this.birthDate==null || this.gender==null || this.admin==null){
      this.alertDialog.nativeElement.showModal();
      setTimeout(() => {
        this.alertDialog.nativeElement.close();
      }, 2000);
    }else if(!passwordPattern.test(this.newPassword) || !phonePattern.test(cleanPhone) || !emailPattern.test(this.email)){
      this.errorDialog.nativeElement.showModal();
      setTimeout(() => {
        this.errorDialog.nativeElement.close();
      }, 2000);
    }else{
      this.phone=this.phone.replace(/-/g, '');
      this.registerData={
        name:this.name,
        password:this.newPassword,
        phone:this.phone,
        email:this.newEmail,
        birthDate:this.birthDate,
        gender:this.gender,
        admin:this.admin
      }
      this.checkDialog.nativeElement.showModal();
    }

    console.log(this.registerData);
  }
  recheck!:string;
  check(){
    if(this.recheck==this.registerData.password){
      this.http.postApi('http://localhost:8080/quiz/register', this.registerData).subscribe((res:any) => {
        if(res.code==200){
          this.name="";
          this.birthDate="";
          this.gender="";
          this.phone="";
          this.newEmail="";
          this.newPassword="";
          this.admin=false;
          this.successDialog.nativeElement.showModal();
          setTimeout(() => {
            this.successDialog.nativeElement.close();
            this.checkDialog.nativeElement.close();
            this.registerDialog.nativeElement.close();
          }, 2000);
        }
      })
    }else{
      this.passwordErrorDialog.nativeElement.showModal();
      setTimeout(() => {
        this.passwordErrorDialog.nativeElement.close();
        this.recheck="";
      }, 2000);
    }
  }
  closeCheck(){
    this.checkDialog.nativeElement.close();
    this.recheck="";
  }
}
