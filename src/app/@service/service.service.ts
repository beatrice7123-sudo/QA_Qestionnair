import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { HttpServiceService } from './http-service.service';

@Injectable({
  providedIn: 'root'
})
export class ServiceService {

  constructor(private http: HttpServiceService) {
    this.initQuestionnaires();
   }

  forCount:any=[];
  private userInfo:any;
  private previewData:any;

  // email
  private userEmail$ = new BehaviorSubject<string | null>(null);
  // 設定 userEmail
  setuserEmail(email:string) {
    this.userEmail$.next(email);
  }
  // 取得最新 userEmail
  getUserEmail(): string | null {
    return this.userEmail$.value;
  }
  // 可訂閱 userEmail 變化
  userEmailObservable() {
    return this.userEmail$.asObservable();
  }


  // userInfo
  private userInfo$ = new BehaviorSubject<any>(null);
  setUserInfo(data: any) {
    this.userInfo$.next(data); // 使用 .next 廣播新資料
  }
  getUserInfo() {
    return this.userInfo$.value; // 取得當前值
  }
  userInfoObservable() {
    return this.userInfo$.asObservable(); // 讓其他元件可以訂閱
  }


  private questionnaireList: QuestionRes[] = [];
  // BehaviorSubject 方便讓其他 component 自動更新畫面
  private questionnaires$ = new BehaviorSubject<QuestionRes[]>([]);
  // 問卷清單
  private initQuestionnaires(){
    this.http.getApi('http://localhost:8080/quiz/getAll')
    .subscribe((res: any) => {
      const data = Array.isArray(res.quizList) ? res.quizList : [];
      this.questionnaireList = [...data];       // 更新本地快取
      this.questionnaires$.next([...this.questionnaireList]);          // 更新 BehaviorSubject
      console.log('問卷列表:', data);
    });
  }
  refreshQuestionnaires(): void {
    this.initQuestionnaires();
  }
  getAllQuestionnaires(): Observable<QuestionRes[]> {
    return this.questionnaires$.asObservable();
  }
  // 刪除問卷
  deleteQuestionnaires(ids: number[]): Observable<boolean> {
    this.questionnaireList = this.questionnaireList.filter(q => !ids.includes(q.id));
    this.questionnaires$.next(this.questionnaireList); // 通知畫面更新
    console.log('目前剩餘問卷：', this.questionnaireList);
    return of(true);
  }
  // 新增問卷
  saveQuestionnaire(data: QuestionRes): Observable<boolean> {
    // 自動產生不重複 ID（用目前最大 ID + 1）
    const newId =
      this.questionnaireList.length > 0
        ? Math.max(...this.questionnaireList.map(q => q.id)) + 1
        : 1;

    const newData = {
      ...data,
      quizID: newId
    };

    // 直接加入新問卷（不覆蓋舊的）
    this.questionnaireList.push(newData);

    // 通知畫面更新
    this.questionnaires$.next([...this.questionnaireList]);

    console.log('✅ 已新增問卷：', newData);
    console.log('📋 目前問卷列表：', this.questionnaireList);

    return of(true);
  }



  // 答案回傳(因為一次性，所以另外存)
  // QuestionnaireAnswer(data:any):Observable<any>{
  //   this.forPreview=data;
  //   this.forCount.push([data.questionnaireID,data.answers]);
  //   console.log(this.forCount);
  //   return of(data);
  // }

  // 設定預覽資料
  setPreviewData(data: any) {
    this.previewData = data;
  }
  // 取得預覽資料
  getPreviewData() {
    return this.previewData;
  }
  // 清除暫存
  clearPreviewData() {
    this.previewData = null;
  }
  // 暫存資料
  countingData(userId:number, data:any){
    let time = new Date();
    let timestamp = time.toLocaleString('zh-TW', {
      hour12: false, // 關閉 12 小時制
    });
    const item = { userId, timestamp, ans: data };
    // 取出舊資料
    const existing = JSON.parse(localStorage.getItem('forCount') || '[]');
    existing.push(item);
    // 存回去
    localStorage.setItem('forCount', JSON.stringify(existing));

    this.forCount = existing;
    console.log(this.forCount);
  }


  sampleUsers = [
    {
      // id: 1,
      name: 'Alice Chen',
      email: 'alice@example.com',
      phone: '0912-345-678',
      birthDate: '1990-05-12',
      gender: 'female',
      admin:true,
    },
    {
      // id: 2,
      name: 'Bob Wang',
      email: 'bob.wang@example.com',
      phone: '0923-456-789',
      birthDate: '1985-11-23',
      gender: 'male',
      admin:false,
    },
    {
      // id: 3,
      name: 'Charlie Liu',
      email: 'charlie.liu@example.com',
      phone: '0934-567-890',
      birthDate: '1992-07-30',
      gender: 'male',
      admin:false,
    },
    {
      // id: 4,
      name: 'Diana Ho',
      email: 'diana.ho@example.com',
      phone: '0945-678-901',
      birthDate: '1995-02-18',
      gender: 'female',
      admin:false,
    },
    {
      // id: 5,
      name: 'Evan Tsai',
      email: 'evan.tsai@example.com',
      phone: '0956-789-012',
      birthDate: '1988-09-05',
      gender: 'other',
      admin:false,
    }
  ];

  feedbackList: FeedbackUserRes[] = [
    {
      status: "success",
      message: "查詢成功",
      timestamp: "2025-11-10",
      quizId: 1,
      userVoList: [
        {
          name: "Alice Chen",
          phone: "0912-345-678",
          email: "alice@example.com",
          age: 35,
          fillinDate: "2025-11-07",
        }
      ],
    },
    {
      status: "success",
      message: "查詢成功",
      timestamp: "2025-11-10",
      quizId: 2,
      userVoList: [
        {
          name: "Bob Wang",
          phone: "0923-456-789",
          email: "bob.wang@example.com",
          age: 40,
          fillinDate: "2025-11-09",
        }
      ],
    },
    {
      status: "success",
      message: "查詢成功",
      timestamp: "2025-11-10",
      quizId: 1,
      userVoList: [
        {
          name: "Evan Tsai",
          phone: "0956-789-012",
          email: "evan.tsai@example.com",
          age: 37,
          fillinDate: "2025-11-05",
        },
      ],
    },
  ];

}

// ------- 以下是後端傳遞給前端的Api跟內容 ---------

export interface QuestionRes // (後端回傳題目清單)
{
  id:number, //問卷ID
  title:string,
  description: string, //提示訊息
  startDate:string,
  endDate:string,
  published:boolean,
  questionVoList:
    {  //題目清單資料，用於題目顯示
      quizId:number,//問卷id
      questionId: number, //題目id
      question: string, //題目名稱
      type: string, //題目類型
      required: boolean, //是否必填
      optionsList:
        {
          code:number,
          optionName:string
        }[]; //題目選項
    }[];
}

// export interface SearchRes // (回傳搜尋結果）
// {
//     status: string, //狀態（success / error）
//     message: string, //提示訊息
//     timestamp: string, //回傳時間(yyyy-MM-dd)
//     quizList: [  //符合條件的測驗清單
//         {
//             id: number, //題目 ID
//             name: string, //題目 名稱
//             description: string, //題目 說明
//             startDate: string, //題目 開始時間(yyyy-MM-dd)
//             endDate: string, //題目 結束時間(yyyy-MM-dd)
//             published: boolean, //題目 是否發佈
//             version: number, //題目 版本
//         }
//     ]
// }

// export interface StatisticsRes // (回傳統計資料）
// {
//     questionnaireID: number,
//     status: string, //狀態（success / error）
//     message: string, //提示訊息
//     timestamp: string, //回傳時間(yyyy-MM-dd)
//     statisticsVoList: [   //統計資料清單
//         {
//             questionId: number, //題目 ID
//             question: string, //題目名稱
//             type: string, //題目類型,
//             required: boolean, //是否必填
//             optionCountVoList: [ //選項統計數量
//                 {
//                     option: string, //選項名稱
//                     count: number, //統計數量
//                 }
//             ]
//         }
//     ]
// }


// export interface FeedbackRes // (取得意見回饋資料)
// {
//     status: string, //狀態（success / error）
//     message: string, //提示訊息
//     timestamp: string, //回傳時間(yyyy-MM-dd)
//     questionAnswerVoList: [  //使用者回饋清單
//         {
//             questionId: number, //題目ID
//             question: string, //題目名稱
//             type: string, //題目類型
//             required: boolean, //是否必填
//             answerList: Array<string>, //題目答案
//         }
//     ]
// }

export interface FeedbackUserRes // (單一使用者的意見內容)
{
    status: string, //狀態（success / error）
    message: string, //提示訊息
    timestamp: string, //回傳時間(yyyy-MM-dd)
    quizId: number, //問卷 ID
    userVoList: [
        {
            name: string, //使用者名稱
            phone: string, //使用者手機
            email: string, //使用者Email
            age: number, //使用者年紀
            fillinDate: string, //填寫日期
        }
    ]
}


// // ------- 以下是傳遞給後端的Api跟內容 ---------

export interface FillinReq // (填答題目用)
{
    quizId: number, //問卷 ID
    email: string, //使用者Email
    questionAnswerList:   //題目答案
      {
          questionId: number, //題目 ID
          answerList: string, //使用者選的答案
      }[],

}

export interface LoginReq // (登入請求)
{
    email: string, //使用者Email
    password: string, //密碼
}
export interface UserInfo {
  // id: number;           // 使用者 ID
  name: string;         // 使用者姓名
  password:string;
  email: string;        // 使用者 Email
  phone?: string;       // 電話號碼（可選）
  birthDate?: string;   // 生日（可選，格式 YYYY-MM-DD）
  gender?: string; // 性別（可選）
  admin:boolean;
}


// export interface QuizUpdateReq // (更新測驗資料)
// {
//     quizId: number, //問卷 ID
//     name: string, //使用者名稱
//     description: string, //問卷說明
//     startDate: string, //問卷開始時間(yyyy-MM-dd)
//     endDate: string, //問卷結束時間(yyyy-MM-dd)
//     published: boolean, //問卷 是否發佈
//     questionList: [  //題目內容
//         {
//             question: string, //題目名稱
//             type: string, //題目類型
//             required: boolean, //是否必填
//             options: Array<string>, //題目選項
//         }
//     ]
// }

// export interface AddInfoReq // (新增補充資訊)
// {
//     name: string, //使用者名稱
//     phone: string, //使用者手機
//     email: string, //使用者Email
//     age: number, //使用者年紀
//     password: string, //使用者密碼
// }

// export interface DeleteReq // (刪除問卷)
// {
//     quizIdList: Array<integer>, //要刪除的項目 ID 清單
// }

export interface QuizCreateReq // (建立新問卷)
{
    quizId: number, //問卷 ID
    title: string, //名稱
    description: string, //問卷說明
    startDate: string, //問卷開始時間(yyyy-MM-dd)
    endDate: string, //問卷結束時間(yyyy-MM-dd)
    published: boolean, //問卷 是否發佈
    questionVoList:   //題目內容
      {
          quizId:number,
          questionId:number,
          question: string, //題目名稱
          type: string, //題目類型
          required: boolean, //是否必填
          optionsList:
            {
              code:number,
              optionName:string
            }[];//題目選項
      }[];
}

// export interface SearchReq // (搜尋測驗或題目)
// {
//     quizName: string, //問卷的名稱
//     startDate: string, //問卷開始時間(yyyy-MM-dd)
//     endDate: string, //問卷結束時間(yyyy-MM-dd)
//     published: boolean, //問卷 是否發佈
// }
