import { Routes } from '@angular/router';
import { QuestionListComponent } from './user/question-list/question-list.component';
import { QuestionListManageComponent } from './admin/question-list-manage/question-list-manage.component';
import { AnswerPageComponent } from './user/answer-page/answer-page.component';
import { PreviewComponent } from './user/preview/preview.component';
import { CountingComponent } from './user/counting/counting.component';
import { LoginComponent } from './login/login.component';
import { FeedbackComponent } from './admin/feedback/feedback.component';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' }, // 預設一開始就是 login
  { path: 'login', component: LoginComponent },
  { path: 'user/question-list/:userId', component:QuestionListComponent },
  { path:'user/answer-page/:userId/:qId', component:AnswerPageComponent },
  { path:'user/preview/:userId/:qId', component:PreviewComponent },
  { path:'user/counting/:userId/:qId', component:CountingComponent },
  { path: 'admin/question-list-manage/:userId', component:QuestionListManageComponent },
  { path: 'admin/feedback/:qId', component:FeedbackComponent },
  { path: '**', redirectTo: '/login', pathMatch: 'full' }
];
