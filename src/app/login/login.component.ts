import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ServiceService } from '../@service/service.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

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
  ) {}

  email!:string;
  password!:string;
  login() {
    // 找到對應的使用者
    const matchedUser = this.service.sampleLogins.find(u => u.email === this.email && u.password === this.password);

    if (matchedUser) {
      const userInfo = this.service.sampleUsers.find(info => info.email === matchedUser.email);
      if (userInfo) {
        const userId = userInfo.id;
        this.service.setUserId(userId);
        console.log("Login successful for user ID:", userId);
        // 跳轉
        this.router.navigate(['/user/question-list', userId]);
        return;
      }
    }

    console.log("Login failed. Please check your email and password.");
    alert("登入失敗，請確認帳號密碼");
  }

}
