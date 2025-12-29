import { Component, ElementRef, ViewChild } from '@angular/core';
import { QuestionRes, ServiceService } from '../../@service/service.service';
import { ActivatedRoute } from '@angular/router';
import Chart from 'chart.js/auto';
import { HttpServiceService } from '../../@service/http-service.service';

@Component({
  selector: 'app-feedback',
  imports: [],
  templateUrl: './feedback.component.html',
  styleUrl: './feedback.component.scss'
})
export class FeedbackComponent {
  constructor(
    private service:ServiceService,
    private route:ActivatedRoute,
    private http:HttpServiceService
  ){}
  activeTab: string = 'tab1';
  originalData:any;
  dataSource:any[]=[];
  id!:number;

  fillinUser:any[]=[];

  fillinList:any[]=[];
  feedbackList:any[]=[];
  showAns:any | null=null;
  userList:any | null=null;

  quiz!:any;
  total!:number;
  newQdata:any={};
  forCount:any;
  countingData:any;
  resultData:[number, { [questionId:string] : { [x:string] : number } }] []=[];  // 單次統計結果
  text:string[]=[];  // 存簡答
  Result:[number, { [questionId:string] : { [option: string] : number }  }] [] = [];  // 儲存合併統計結果

  ngOnInit(): void {
    this.total=0;

    this.id=Number(this.route.snapshot.paramMap.get('qId'));
    this.http.getApi('http://localhost:8080/quiz/fillin_user?id='+this.id).subscribe((res:any) => {
      this.fillinUser=res.fillinUser;
    })
    this.http.getApi('http://localhost:8080/quiz/feedback_list?id='+this.id).subscribe((res:any) => {
      this.fillinList=res.feedbackList;
    })

    this.http.getApi('http://localhost:8080/quiz/get_quiz?id='+this.id).subscribe((res:any)=>{     // 全部問卷
      this.quiz=res.quiz;
    })
    this.http.getApi('http://localhost:8080/quiz/get_questions?quizId='+this.id).subscribe((res:any)=>{     // 全部問卷
      this.question=res.questionVoList;
    })
    this.http.getApi('http://localhost:8080/quiz/statistics?id='+this.id).subscribe((res:any) => {
      this.countingData=res.statisticsList;
      this.total=res.fillinTotal;
      this.http.getApi('http://localhost:8080/quiz/text_ans?id='+this.id).subscribe((res:any) => {
        this.text=res.textAns;
        setTimeout(() => this.renderCharts(), 500);
      })
    })

  //// 原時間資料判斷
  //   let begin!:Date;
  //   let end!:Date;
  //   for(let eachOne of this.originalData){
  //     begin=new Date(eachOne.startTime);
  //     end=new Date(eachOne.endTime);
  //     begin.setHours(0,0,0,0);
  //     end.setHours(23, 59, 59, 999);
  //     if(new Date().getTime() < begin.getTime()){
  //       eachOne.status=1;  // 未開始
  //     }else{
  //       if(new Date().getTime() <= end.getTime()){
  //         eachOne.status=2;  // 進行中
  //       }else{
  //         eachOne.status=3;  // 已結束
  //       }
  //     }
  //   }
  //   for(let Q of this.originalData){  // 判斷是否發布
  //     if(Q.question_status==true){
  //       if(Q.status==2 || Q.status==3){
  //         this.dataSource.push(Q);
  //       }
  //     }
  //   }
  //   // console.log(this.dataSource);
  //   this.fillinList=JSON.parse(localStorage.getItem('forCount') || '[]');  // localStorage
  //   this.showAns=null;
  //   this.feedbackList=this.service.feedbackList;
  //   console.log(this.feedbackList);

  //   this.userList=null;
  //   this.dataLength=this.dataSource.length;
  //   this.paginator(this.dataSource);
  //  /*--------------------------------------------------------------*/
  //   // tab2
  //   // 還原資料
  //   this.forCount = JSON.parse(localStorage.getItem('forCount') || '[]');
  //   console.log(this.forCount);
  //   this.showUser(this.id);
 }
/*--------------------------------------------------------------*/
  // tab1
  currentPage = 1;
  pageSize = 5; // 每頁顯示5筆
  totalPages = 1;
  dataLength!:number;
  filteredData: any[] = [];   // 篩選後的問卷（除了未發布的全部、進行中、未開始、已結束）
  // 分頁
  paginator(data: any[]) {
    this.filteredData = data; // 每次篩選都更新基礎資料
    this.totalPages = Math.ceil(data.length / this.pageSize);
    this.currentPage = 1; // 重新分頁時回到第1頁
    this.loadPageData();
  }
  loadPageData() {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.dataSource = this.filteredData.slice(start, end);
  }
  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadPageData();
    }
  }
  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadPageData();
    }
  }
/*--------------------------------------------------------------*/
  // tab1
  @ViewChild('userRecArea') userRecArea!: ElementRef;
  showUser(quizId:number){
    this.userList=[];
    for(let i of this.feedbackList){
      if(i.quizId==quizId){
        this.userList.push(i);
      }
    }
    console.log(this.userList, this.fillinList, this.feedbackList);
    /*--------------------------------------------------------------*/
    // tab2
    this.resultData=[];
    this.service.getAllQuestionnaires().subscribe(data=>{     // 全部問卷
      for(let ques of data){
        if(quizId==ques.id){
          // 得到的ID控制管理者想看到的問卷
          this.newQdata=ques;  // 若得到的ID和問卷ID相符，則使用該筆問卷
        }
      }
    });

    this.countingData=this.forCount;  // [ {使用者ID, { 題目ID: 答案(字串/陣列),.....}, {使用者ID, { 題目ID: 答案(字串/陣列),.....}, ....... } ]
    console.log(this.countingData);
    for(let item of this.countingData){
      // 答案的問卷ID = 問卷ID = 管理者選擇的ID
      console.log(this.newQdata.questionnaireID,item.ans.questionnaireID);
      if(item.ans.questionnaireID==this.newQdata.questionnaireID){  // 問卷ID核對答案的問卷ID，相同則執行紀錄
        this.total=this.total+1;
        this.countingData=item;  // 使用該筆答案
        console.log(this.countingData);
        for(let i of this.newQdata.questionVoList){

          if(i.type=="single"){
            const questionId = i.questionId.toString();
            const optionCountMap: { [option: string]: number } = {};
            for(let option of i.options){
              optionCountMap[option] = 0;  // 建立選項
            }
            for (const [key, value] of Object.entries(this.countingData.ans.answers)) {
              if (key == questionId && typeof value == "string") {
                if (optionCountMap.hasOwnProperty(value)) {
                  optionCountMap[value]++;
                }
              }
            }
            this.resultData.push([this.newQdata.questionnaireID, { [questionId]: optionCountMap }]);  // 存紀錄
          }else{
            if(i.type=="multiple"){
              const questionId = i.questionId.toString();
              const optionCountMap: { [option: string]: number } = {};
              for(let option of i.options){
                optionCountMap[option] = 0;
              }
              for (const [key, value] of Object.entries(this.countingData.ans.answers)) {
                if (key == questionId && Array.isArray(value)) {
                  for (const chosen of value) {
                    if (optionCountMap.hasOwnProperty(chosen)) {
                      optionCountMap[chosen]++;
                    }
                  }
                }
              }
              this.resultData.push([this.newQdata.questionnaireID, { [questionId]: optionCountMap }]);  // 存紀錄
            }else{
              if(i.options.length==0){
                for(let y of Object.entries(this.countingData.ans.answers)){
                  if(y[0]==i.questionId){
                    this.text.push(String(y[1]));
                  }
                }
              }
            }
          }
        }
      }
    }

    /*問卷合併統計*/
    for (const [id, item] of this.resultData) {
      const existing = this.Result.find(r => r[0] === id);  // 看 result 裡有沒有相同問卷 ID
      if (existing) {  // 合併統計
        for(const [questionId,ans] of Object.entries(item)){
          if (!existing[1][questionId]) {
            existing[1][questionId] = {};
          }

          for (const [option, count] of Object.entries(ans)) {
            existing[1][questionId][option] =
              (existing[1][questionId][option] || 0) + (Number(count) || 0);
          }
        }
      }else {  // 新問卷ID → 確保格式正確再 push
        const cleanItem: { [questionId: string]: { [option: string]: number } } = {};
        for (const [questionId, ans] of Object.entries(item)) {
          cleanItem[questionId] = {};
          for (const [option, count] of Object.entries(ans)) {
            cleanItem[questionId][option] = Number(count) || 0;  // 確保是數字
          }
        }
        this.Result.push([id, cleanItem]);
      }
    }
    console.log(this.newQdata,this.forCount,this.Result);
    setTimeout(() => this.renderCharts(), 300);
    /*--------------------------------------------------------------*/
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

  @ViewChild('showAnsArea') showAnsArea!: ElementRef;
  question:any;
  lookAns(email:string){
    this.showAns=[];
    console.log(this.originalData,this.showAns, this.userList, this.fillinList);
    // 取答案
    for(let answers of this.fillinList){
      if(email==answers.email){
        this.showAns=answers;  // 後續需限定只寫一次
        this.showAns.age=this.calculateAge(answers.birthDate);
      }
    }
    // 取題目
    // for(let questionnaire of this.originalData){
    //   if(questionnaire.questionnaireID==this.showAns.ans.questionnaireID){
    //     this.question=questionnaire;
    //   }
    // }
    console.log(this.showAns, this.question);
  }
/*--------------------------------------------------------------*/
  // tab2
  onTabChange(tab: string) {
    this.activeTab = tab;
    if (tab === 'tab2') {
      setTimeout(() => this.renderCharts(), 0); // 保證 DOM 已渲染
    }
  }

  charts: { [id: string]: Chart } = {}; // 存已建立的圖表
    renderCharts() {
      console.log(this.question);
      for (let i of this.question) {
        if (i.type === 'single' || i.type === 'multiple') {
          const ctx = document.getElementById(`chart-${i.questionId}`) as HTMLCanvasElement;
          if (!ctx) continue;  // 若還沒渲染則跳過

          const Ans = this.countingData.find((s: any) => s.questionId === i.questionId);
          if (!Ans) continue;

          if (this.charts[i.questionId]) {  // 並免重覆建立圖表
            this.charts[i.questionId].destroy();
          }

          // 自動產色
          // const backgroundColors = i.options.map((_: string, index: number) => {
          //   const hue = (index * 360) / i.options.length;
          //   return `hsl(${hue}, 70%, 60%)`;
          // });
          const pastelColors = [
            '#f1c28a', '#d3837c', '#f3b9b8', '#95b6af', '#4c6083',
            '#e3ded8', '#c5a68d', '#9aa8b1', '#d8a59e', '#b8a6b3'
          ];

          const backgroundColors = i.optionsList?.map(
            (_: any, index: number) =>
              pastelColors[index % pastelColors.length]
          ) ?? [];

          const datasetData = i.optionsList.map((opt: any) => {
            const optionStat = Ans.opCountList.find((o: any) => o.code === opt.code);
            return optionStat ? optionStat.count : 0;
          });
          const data = {
            labels: i.optionsList.map((opt: any, index: number) => `${opt.optionName}：${datasetData[index]}人`),
            datasets: [
              {
                label: '',
                data: datasetData,
                backgroundColor: backgroundColors,
                borderColor: '#000000',
                hoverOffset: 4,
              }
            ]
          };

          // const datasetData= i.options.map((opt: string) => (Ans as any)[opt] || 0)
          // const data = {
          //   labels: i.options.map((opt:string, index:number) => `${opt}：${datasetData[index]}人`),
          //   datasets: [
          //     {
          //       label: '',
          //       // map() 是陣列的方法，用來「一個一個」處理每個選項，並回傳一個新陣列
          //       // Ans 是一個物件，紀錄每個選項的統計數量
          //       // 當opt=選項 => 取出Ans=數量
          //       data:datasetData,
          //       backgroundColor: backgroundColors,
          //       hoverOffset: 4,
          //     },
          //   ],
          // };
          const options= {
            maintainAspectRatio: false,
            aspectRatio: 1,        // 讓圖表成正方形
            plugins: {
              legend: {
                position: 'left' as const,
                fullSize: false,   // ⭐ 讓 legend 不占滿整區域（排版更好調）
                labels: {
                  padding: 40,     // ⭐ 只改 legend 與圖表的左右距離
                  boxWidth: 40,
                  font: {
                    size: 20,
                    family:'LXGW WenKai TC',
                  },
                }
              }
            },
            layout: {
              padding: 10,        // 整張圖四周留白
            }
          }

          this.charts[i.questionId] = new Chart(ctx, {
            type: 'pie',
            data,
            options,
          });
        }
      }
  }

}
