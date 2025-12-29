import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { QuestionRes, ServiceService } from '../../@service/service.service';
import { FormsModule } from '@angular/forms';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { HttpServiceService } from '../../@service/http-service.service';

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
    private router:Router,
    private http:HttpServiceService
  ) { }


  quizId!:number;  // 儲存傳來的id
  eachQuiz!:any;  //儲存問卷資訊
  eachQuestionnaireData!:any;  // 儲存id相對的問題資訊
  userName!:string;
  userPhone!:string;
  userEmail!:string;
  userAge!:number;
  Answer: { [questionId: number]: QuestionAnswer } = {};

  ngOnInit(): void {
    this.quizId=Number(this.route.snapshot.paramMap.get('qId'));

    this.http.getApi('http://localhost:8080/quiz/get_quiz?id='+this.quizId).subscribe((res:any)=>{
      this.eachQuiz=res.quiz;
    });
    this.http.getApi('http://localhost:8080/quiz/get_questions?quizId='+this.quizId).subscribe((res:any) => {
      if (res?.questionVoList) {
        this.eachQuestionnaireData = res.questionVoList;
      } else {
        this.eachQuestionnaireData = []; // 避免 undefined
      }
      console.log(this.eachQuestionnaireData);

      // 答案儲存初始化
      for (const q of this.eachQuestionnaireData) {
        this.Answer[q.questionId] = {
          questionId: q.questionId,
          answerVoList: [] // 統一初始化為空陣列
        };
      }

      const saved = this.service.getPreviewData();
      if (saved && saved.id === this.quizId) {
        this.userName = saved.name;
        this.userPhone = saved.phone;
        this.userEmail = saved.email;
        this.userAge = saved.age;
        // 將存儲的陣列 (Array) 轉回成組件使用的物件 (Map) 格式
        if (Array.isArray(saved.answers)) {
          const tempMap: { [key: number]: any } = {};
          saved.answers.forEach((ans: any) => {
            // 以 questionId 作為 Key，把整筆答案物件放回去
            tempMap[ans.questionId] = {
              questionId: ans.questionId,
              answerVoList: ans.answerVoList
            };
          });
          this.Answer = tempMap;
        } else {
          // 防呆：如果原本就是物件則直接賦值
          this.Answer = saved.answers || {};
        }
      }

      this.userName=this.service.getUserInfo().name;
      this.userPhone=this.service.getUserInfo().phone;
      this.userEmail=this.service.getUserInfo().email;
      this.userAge=this.calculateAge(this.service.getUserInfo().birthDate);
      console.log(this.userAge);
    });
  }
  calculateAge(birthDate: string | Date): number {
    const today = new Date();
    const birth = new Date(birthDate);

    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    // 如果今年還沒過生日，年齡要減 1
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  }

  // 單選
  selectedSingle(questionId:number, option:any){
    this.Answer[questionId].answerVoList = [
      {
        code: option.code,
        optionName: option.optionName,
        check: true
      }
    ];
  }
  // 多選
  selectedMultiple(questionId: number, option: any, event: any) {
    const voList = this.Answer[questionId].answerVoList;

    if (event.target.checked) {
      voList.push({
        code: option.code,
        optionName: option.optionName,
        check: true
      });
    } else {
      this.Answer[questionId].answerVoList = voList.filter(
        (vo: any) => vo.code !== option.code
      );
    }
  }
  // 簡答
  selectedText(questionId: number, event: any) {
    this.Answer[questionId].answerVoList = [
      {
        code: 0, // 簡答通常 code 為 0 或 null
        optionName: event.target.value,
        check: true
      }
    ];
  }
  // 用來判斷該選項是否該被勾選
  checkIsSelected(questionId: number, code: string | number): boolean {
    const answerObj = this.Answer[questionId];
    if (!answerObj || !answerObj.answerVoList) return false;

    // 檢查 answerVoList 陣列中是否含有該 code
    return answerObj.answerVoList.some((vo: any) => vo.code === code);
  }

  sendSuccess:boolean=false;
  // 儲存答案卷
  Result() {
    // 將 Map 結構轉為 Array 結構，只保留我們需要的內容
    const answerList = Object.values(this.Answer).map(item => ({
      questionId: item.questionId,
      answerVoList: item.answerVoList
    }));

    const result = {
      id: this.quizId,
      // status: "complete",
      name: this.userName,
      phone: this.userPhone,
      email: this.userEmail,
      age: this.userAge,
      // 這裡存入轉換後的陣列，或者保留 Map 結構（視你預覽頁的需求而定）
      // 建議維持 Map 方便回頭修改，或存為陣列方便顯示
      answers: answerList
    };

    // 將資料存到 service
    this.service.setPreviewData(result);
    console.log(result);

    // 導到預覽頁
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate(['/user/preview/', this.quizId]);
    });
  }
  RequiredAlert:boolean=false;
  isEmpty=false;
  preview() {
    this.isEmpty = false;
    for (let q of this.eachQuestionnaireData) {
      if (q.required) {
        const currentAnswer = this.Answer[q.questionId];
        // 判斷邏輯：
        // 1. 完全沒這題的資料
        // 2. 答案清單是空的
        // 3. 簡答題 (text) 雖然有陣列，但內容是空的
        const hasNoList = !currentAnswer || currentAnswer.answerVoList.length === 0;
        const isTextEmpty = q.type === 'text' && (!currentAnswer?.answerVoList[0]?.optionName?.trim());
        if (hasNoList || isTextEmpty) {
          this.isEmpty = true;
          break;
        }
      }
    }

    if (this.isEmpty) {
      alert("有必填欄位未填寫！");
    } else {
      // 額外增加個人資訊的檢查
      if (!this.userName || !this.userPhone || !this.userEmail) {
        alert("請完整填寫個人聯絡資訊！");
        return;
      }
      this.Result();
    }
  }

  cancel(){
    if(confirm("確定?!!!!")){
      this.service.clearPreviewData();
      this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
        this.router.navigate(['/user/question-list']);
      });
    }
  }

}


interface QuestionAnswer {
  questionId: number;
  answerVoList: AnswerVo[];
}
interface AnswerVo {
  code: number;
  optionName: string;
  check: boolean;
}
