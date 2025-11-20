import { Component } from '@angular/core';
import { ServiceService } from '../../@service/service.service';
import { ActivatedRoute, Router } from '@angular/router';

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
  ){}
  userId!:number;  // 網址用
  qId!:number;  // 網址用
  questionnaire:any;
  previewData!:any;
  name!:string;
  phone!:string;
  email!:string;
  age!:number;
  answer:any={};
  ngOnInit(): void {


    this.userId=Number(this.route.snapshot.paramMap.get('userId'));
    this.qId=Number(this.route.snapshot.paramMap.get('qId'));

    this.service.getAllQuestionnaires().subscribe(data=>{
      this.questionnaire=data;
    })
    this.previewData=this.service.getPreviewData();
    console.log(this.previewData);
    console.log(this.questionnaire);


    for(let i of this.questionnaire){
      if(this.previewData.questionnaireID==i.questionnaireID){
        this.name=this.previewData.name;
        this.phone=this.previewData.phone;
        this.email=this.previewData.email;
        this.age=this.previewData.age;
        this.answer=Object.entries(this.previewData.answers);  // 問卷答案  // Object.entries() 物件{}轉陣列[]
        this.questionnaire=i;  // 問卷資訊+指定題目
      }
    }
  }

  goBack(){
    const back = this.service.getPreviewData(); // 或用 this.previewData
    console.log(back)
    // 這裡直接回去 answer-page
    this.router.navigate(['/user/answer-page',this.userId, back.questionnaireID]);
  }
  goTo(qId:number){
    // this.userId、this.questionnaire存DB;
    const data = this.service.getPreviewData();
    console.log('送出結果:', data);
    alert('儲存成功！');
    this.service.countingData(this.userId, data);
    setTimeout(() => {
      this.service.clearPreviewData(); // 清除暫存
    },100);


    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate(['/user/counting/',this.userId,this.qId]);
    });
  }
}
