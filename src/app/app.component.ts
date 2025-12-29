import { LoginReq, ServiceService, UserInfo } from './@service/service.service';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router,RouterOutlet } from '@angular/router';
import { HttpServiceService } from './@service/http-service.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, FormsModule ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'QA_Questionnaire';

  userEmail!:string | null;  // 網址用
  nowUser:any;
  forCancelReset:any;

  showLayout = true;
  routerTell!:string;
  isAdmin = false;


  constructor(
    private router:Router,
    private route:ActivatedRoute,
    private service:ServiceService,
    private http:HttpServiceService
  ){
    this.router.events.subscribe(() => {
      this.showLayout = !this.router.url.includes('/login');
    });
  }

  ngOnInit(): void {

    // 訂閱 userEmail 變化
    this.service.userEmailObservable().subscribe(email => {
      this.userEmail = email ?? "";
      console.log('AppComponent userEmail (subscribe):', this.userEmail);
      this.service.userInfoObservable().subscribe(info => {
        this.nowUser=info;
        console.log(this.nowUser);
      })
      // for(let i of this.service.sampleUsers){
      //   if(i.id==this.userEmail){
      //     this.nowUser={...i};
      //   }
      // }
    });

    this.router.events.subscribe(()=>{
      if(this.router.url.includes('/user')){
        this.routerTell="user";
        this.checkPass=false;
      }else if(this.router.url.includes('/admin')){
        this.routerTell="admin";
        this.checkPass=true;
      }
    });

  }


  show = false;
  menuOpen = false;
  hovering = false;
  private timer: any;
  member() {
    // this.show = true;
    // this.menuOpen = true;
    // // 每次按下按鈕重置計時器
    // clearTimeout(this.timer);
    // this.timer = setTimeout(() => {
    //   if (!this.hovering) {
    //     this.show = false;
    //     this.menuOpen = false;
    //   }
    // }, 1000);

    this.show=!this.show;
    this.menuOpen=this.show;
  }

  // // 滑鼠移入選單：保持開啟
  // onEnterMenu() {
  //   this.hovering = true;
  //   clearTimeout(this.timer);  // 取消倒數
  // }
  // // 滑鼠離開選單：延遲關閉
  // onLeaveMenu() {
  //   this.hovering = false;
  //   this.timer = setTimeout(() => {
  //     this.show = false;
  //     this.menuOpen = false;
  //   }, 400);
  // }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
    this.show=this.menuOpen;
  }


  isOpenEdit=false;
  commitOK=false;
  name:any;
  phone:any;
  birthDate:any;
  gender:any;
  infoEdit(){
    this.isAdmin=false;
    this.doubleCheck=false;
    this.forCancelReset={...this.nowUser};  // 備份取消用
    this.name=this.nowUser.name;
    this.phone=this.nowUser.phone;
    this.birthDate=this.nowUser.birthDate;
    this.gender=this.nowUser.gender;
    this.isOpenEdit=true;
  }
  commit(){
    this.forCancelReset={...this.nowUser};
    this.commitOK=true;
    setTimeout(()=>{
      this.isOpenEdit=false;
      setTimeout(()=>{
        this.commitOK=false;
      },3000)
    },3000)
  }
  cancel(){
    this.nowUser={...this.forCancelReset};  // 資料復原
    this.isOpenEdit=false;
  }

  doubleCheck:boolean=false;
  checkPass:boolean=false;
  chooseMode(adminMode:boolean){
    if(!adminMode){
      this.doubleCheck=false;
      this.checkPass=false;
      this.goToUser();
    }else{
      this.doubleCheck=true;
    }
  }

  @ViewChild('loginDialog') loginDialog!: ElementRef<HTMLDialogElement>;
  loginData!:LoginReq;
  password!:string;
  PasswordCheck(){
    this.loginData={
      email:this.service.getUserEmail() ?? "",
      password:this.password
    }
    this.http.postApi("http://localhost:8080/quiz/login", this.loginData).subscribe((res:any) => {
      if(res.code==200){
        this.checkPass=true;
          this.goToAdmin();
          setTimeout(()=>{
            this.password="";
            this.doubleCheck=false;
          },1000);
      }else{
        this.loginDialog.nativeElement.showModal();
        setTimeout(() => {
          this.loginDialog.nativeElement.close();
        }, 2000);
      }
    })
    // for(let i of this.service.sampleLogins){
    //   if(this.nowUser.email==i.email){
    //     if(this.password==i.password){
    //       this.checkPass=true;
    //       this.goToAdmin();
    //       setTimeout(()=>{
    //         this.password="";
    //         this.doubleCheck=false;
    //       },1000);
    //     }else{
    //       alert("密碼錯誤");
    //     }
    //   }
    // }
  }
  goToUser(){
      this.router.navigate(['/user/question-list']);
    // this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
    // });
  }
  goToAdmin(){
    this.router.navigate(['/admin/question-list-manage']);
    // this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
    // });
  }

  logout(){
    // 清掉登入資料
    localStorage.clear();
    sessionStorage.clear();
    // 回登入頁
    this.router.navigate(['/login']).then(() => {
      // 阻擋返回上一頁
      history.pushState(null, '', location.href);
      window.addEventListener('popstate', () => {
        history.pushState(null, '', location.href);
      });
    });
  }


}
