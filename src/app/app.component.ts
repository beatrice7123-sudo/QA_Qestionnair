import { ServiceService, UserInfo } from './@service/service.service';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router,RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, FormsModule ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'QA_Questionnaire';

  userId!:number | null;  // 網址用
  nowUser:any;
  forCancelReset:any;

  showLayout = true;
  routerTell!:string;
  isAdmin = false;


  constructor(
    private router:Router,
    private route:ActivatedRoute,
    private service:ServiceService,
  ){
    this.router.events.subscribe(() => {
      this.showLayout = !this.router.url.includes('/login');
    });
  }

  ngOnInit(): void {

    // 訂閱 userId 變化
    this.service.userIdObservable().subscribe(id => {
      this.userId = id;
      console.log('AppComponent userId (subscribe):', this.userId);

      for(let i of this.service.sampleUsers){
        if(i.id==this.userId){
          this.nowUser={...i};
        }
      }
    });

    this.router.events.subscribe(()=>{
      if(this.router.url.includes('/user')){
        this.routerTell="user";
        this.isAdmin=false;
      }else if(this.router.url.includes('/admin')){
        this.routerTell="admin";
        this.isAdmin=true;
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

  chooseMode(adminMode:boolean){
    if(!adminMode){
      this.goToUser();
    }else{
      this.goToAdmin();
    }
  }
  goToUser(){
      this.router.navigate(['/user/question-list/',this.userId]);
    // this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
    // });
  }
  goToAdmin(){
    this.router.navigate(['/admin/question-list-manage/',this.userId]);
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
