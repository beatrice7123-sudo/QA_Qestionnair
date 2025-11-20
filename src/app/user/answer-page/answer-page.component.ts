import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { QuestionRes, ServiceService } from '../../@service/service.service';
import { FormsModule } from '@angular/forms';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  selector: 'app-answer-page',
  imports: [FormsModule, MatRadioModule, MatCheckboxModule],
  templateUrl: './answer-page.component.html',
  styleUrl: './answer-page.component.scss'
})
export class AnswerPageComponent {
  constructor(
    private route:ActivatedRoute,
    private service:ServiceService,
    private router:Router
  ) { }

  userId!:number;  // 網址用
  qId!:number;  // 網址用
  questionnaireID!:number;  // 儲存傳來的id
  eachQuestionnaireData!:any;  // 儲存id相對的問卷資訊
  userName!:string;
  userPhone!:string;
  userEmail!:string;
  userAge!:number;
  Answer:{ [questionId:number]:any }={};

  ngOnInit(): void {
    this.userId=Number(this.route.snapshot.paramMap.get('userId'));
    this.qId=Number(this.route.snapshot.paramMap.get('qId'));
    this.questionnaireID=Number(this.route.snapshot.paramMap.get('qId'));

    this.service.getAllQuestionnaires().subscribe(data=>{
      this.eachQuestionnaireData=data.find(
        q => q.questionnaireID === this.questionnaireID
      )
    });


    const saved = this.service.getPreviewData();
    if (saved && saved.questionnaireID === this.questionnaireID) {
      this.userName = saved.name;
      this.userPhone = saved.phone;
      this.userEmail = saved.email;
      this.userAge = saved.age;
      this.Answer = saved.answers;
    }
  }
  // 單選
  selectedSingle(questionId:number, answer:string){
    this.Answer[questionId]=answer;
  }
  // 多選
  selectedMultiple(questionId:number, answer:string, event:any){
    if (!this.Answer[questionId]) {
      this.Answer[questionId] = [];
    }
    if (event.target.checked) {
      // 被勾選 → 加入陣列
      this.Answer[questionId].push(answer);
    } else {
      // 取消勾選 → 移除
      this.Answer[questionId] = this.Answer[questionId].filter(
        (a: string) => a !== answer
      );
    }
  }
  // 簡答
  selectedText(questionId:number, event:any){
    const value=event.target.value;
    this.Answer[questionId]=value;
  }


  sendSuccess:boolean=false;
  preview(){
    const result={
      questionnaireID:this.questionnaireID,
      status:"complete",
      name:this.userName,
      phone:this.userPhone,
      email: this.userEmail,
      age:this.userAge,
      answers:this.Answer
    }
    // console.log(result.answers);
    // console.log('送出結果:', JSON.stringify(result.answers, null, 2));
    // this.service.QuestionnaireAnswer(result).subscribe((res:any) => {
    //   this.sendSuccess=true;
    //   setTimeout(() => {
    //     alert("送出成功")
    //     setTimeout(() => {
    //       this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
    //         this.router.navigate(['/user/preview']);
    //       });
    //     },1000);
    //   },0);
    // });



    // 將資料存到 service
    this.service.setPreviewData(result);

    // 導到預覽頁
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate(['/user/preview',this.userId,this.qId]);
    });


  }
  cancel(){
    if(confirm("確定?!!!!")){
      this.service.clearPreviewData();
      this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
        this.router.navigate(['/user/question-list/'+this.userId]);
      });
    }
  }

}
