import { Component } from '@angular/core';
import { ServiceService } from '../../@service/service.service';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpServiceService } from '../../@service/http-service.service';

@Component({
  selector: 'app-preview',
  imports: [],
  templateUrl: './preview.component.html',
  styleUrl: './preview.component.scss'
})
export class PreviewComponent {
  constructor(
    private service:ServiceService,
    private router:Router,
    private route:ActivatedRoute,
    private http:HttpServiceService
  ){}
  userId!:number;  // 網址用
  qId!:number;  // 網址用
  quiz:any;
  questionnaire:any;
  previewData!:any;
  name!:string;
  phone!:string;
  email!:string;
  age!:number;
  answer:any=[];
  ngOnInit(): void {

    this.userId=Number(this.route.snapshot.paramMap.get('userId'));
    this.qId=Number(this.route.snapshot.paramMap.get('qId'));

    // this.service.getAllQuestionnaires().subscribe(data=>{
    //   this.questionnaire=data;
    // })
    this.previewData=this.service.getPreviewData();
    console.log(this.previewData);
    this.http.getApi('http://localhost:8080/quiz/get_quiz?id='+this.qId).subscribe((res:any)=>{
      this.quiz=res.quiz;

      this.http.getApi('http://localhost:8080/quiz/get_questions?quizId='+this.qId).subscribe((res:any)=>{
        this.questionnaire=res.questionVoList;

        if(this.previewData.id==this.quiz.id){
          this.name=this.previewData.name;
          this.phone=this.previewData.phone;
          this.email=this.previewData.email;
          this.age=this.previewData.age;
          this.answer=this.previewData.answers;  // 問卷答案  // Object.entries() 物件{}轉陣列[]
          console.log(this.answer);
        }
      })
    })

  }

  goBack(){
    const back = this.service.getPreviewData(); // 或用 this.previewData
    console.log(back)
    // 這裡直接回去 answer-page
    this.router.navigate(['/user/answer-page/', back.id]);
  }
  goTo(qId:number){
    // this.userId、this.questionnaire存DB;
    const data = this.service.getPreviewData();
    console.log('送出結果:', JSON.stringify(data));
    this.http.postApi('http://localhost:8080/quiz/fillin', data).subscribe((res:any)=>{
      if(res.code === 200) {
        this.service.clearPreviewData();
      }
    });


    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate(['/user/counting/',this.qId]);
    });
  }
}
