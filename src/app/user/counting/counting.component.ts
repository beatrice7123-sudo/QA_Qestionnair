// import { QuestionList } from './../question-list/question-list.component';
import { ActivatedRoute, Router } from '@angular/router';
import { QuestionRes,ServiceService } from './../../@service/service.service';
import { Component } from '@angular/core';
import Chart from 'chart.js/auto';
import { HttpServiceService } from '../../@service/http-service.service';

@Component({
  selector: 'app-counting',
  imports: [],
  templateUrl: './counting.component.html',
  styleUrl: './counting.component.scss'
})
export class CountingComponent {
  constructor(
    private service:ServiceService,
    private router:Router,
    private route:ActivatedRoute,
    private http:HttpServiceService
  ){}


  userId!:number;  // 網址用
  id!:number;
  quiz:any;
  question:any;
  forCount:any;
  countingData:any;
  total!:number;
  resultData:[number, { [questionId:string] : { [x:string] : number } }] []=[];  // 單次統計結果
  text:string[]=[];  // 存簡答
  Result:[number, { [questionId:string] : { [option: string] : number }  }] [] = [];  // 儲存合併統計結果

  ngOnInit(): void {

    this.userId=Number(this.route.snapshot.paramMap.get('userId'));
    this.forCount = JSON.parse(localStorage.getItem('forCount') || '[]');  // 還原資料
    this.total=0;

    this.resultData=[];
    this.id=Number(this.route.snapshot.paramMap.get('qId'));
    this.http.getApi('http://localhost:8080/quiz/get_quiz?id='+this.id).subscribe((res:any)=>{     // 全部問卷
      this.quiz=res.quiz;
    })
    this.http.getApi('http://localhost:8080/quiz/get_questions?quizId='+this.id).subscribe((res:any)=>{     // 全部問卷
      this.question=res.questionVoList;
      this.startCounting();
    })

    this.countingData=this.forCount;  // [ {使用者ID, { 題目ID: 答案(字串/陣列),.....}, {使用者ID, { 題目ID: 答案(字串/陣列),.....}, ....... } ]
    console.log(this.countingData);

  }
  startCounting(){
    for(let item of this.countingData){
      console.log(this.quiz);
      console.log(item.ans);
      // 答案的問卷ID = 問卷ID = 使用者選擇的ID
      console.log(this.quiz.id,item.ans.id);
      if(item.ans.id==this.quiz.id){  // 問卷ID核對答案的問卷ID，相同則執行紀錄
        this.total=this.total+1;
        this.countingData=item;  // 使用該筆答案
        console.log(this.countingData);
        for(let i of this.quiz.questionVoList){

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
            this.resultData.push([this.quiz.id, { [questionId]: optionCountMap }]);  // 存紀錄
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
              this.resultData.push([this.quiz.id, { [questionId]: optionCountMap }]);  // 存紀錄
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

    // for(const [id,item] of result){
    //   for(const [questionId,ans] of Object.entries(item)){
    //     for(const [option,count] of Object.entries(ans)){
    //       console.log(option+":"+count);
    //     }
    //   }
    // }


    console.log(this.quiz,this.forCount,this.Result);
  }
  ngAfterViewInit(): void {
    setTimeout(() => this.renderCharts(), 300);
  }


  charts: { [id: string]: Chart } = {}; // 存已建立的圖表
  renderCharts() {
    for (let i of this.question) {
      if (i.type === 'single' || i.type === 'multiple') {
        const ctx = document.getElementById(`chart-${i.questionId}`) as HTMLCanvasElement;
        if (!ctx) continue;  // 若還沒渲染則跳過

        const Ans = this.Result.find(r => r[0] === this.quiz.id)?.[1][i.questionId];
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

        const backgroundColors = i.options.map((_: string, index: number) =>
          pastelColors[index % pastelColors.length]
        );

        const datasetData= i.options.map((opt: string) => (Ans as any)[opt] || 0)
        const data = {
          labels: i.options.map((opt:string, index:number) => `${opt}：${datasetData[index]}人`),
          datasets: [
            {
              label: '',
              // map() 是陣列的方法，用來「一個一個」處理每個選項，並回傳一個新陣列
              // Ans 是一個物件，紀錄每個選項的統計數量
              // 當opt=選項 => 取出Ans=數量
              data:datasetData,
              backgroundColor: backgroundColors,
              hoverOffset: 4,
            },
          ],
        };
        const options= {
          maintainAspectRatio: false,
          aspectRatio: 1,        // 讓圖表成正方形
          plugins: {
            legend: {
              position: 'left' as const,
              fullSize: false,   // ⭐ 讓 legend 不占滿整區域（排版更好調）
              labels: {
                padding: 60,     // ⭐ 只改 legend 與圖表的左右距離
                boxWidth: 50,
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


  backTo(){
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate(['/user/question-list/',this.userId]);
    });
  }
}
