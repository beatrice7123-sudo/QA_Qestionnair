import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterOutlet } from "@angular/router";
import { ServiceService } from '../../@service/service.service';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-question-list',
  imports: [ FormsModule ],
  templateUrl: './question-list.component.html',
  styleUrl: './question-list.component.scss'
})
export class QuestionListComponent {

  constructor(private router:Router,
    private service:ServiceService,
    private sanitizer:DomSanitizer,  // 標記安全HTML
    private route:ActivatedRoute
  ){}


  dataSource:any[]=[];  // 資料列表用
  originalData:any;  // 搜尋用
  // userId!:number;

  currentPage = 1;
  pageSize = 5; // 每頁顯示5筆
  totalPages = 1;
  dataLength!:number;
  filteredData: any[] = [];   // 篩選後的問卷（除了未發布的全部、進行中、未開始、已結束）

  ngOnInit(): void {

    // this.userId=Number(this.route.snapshot.paramMap.get('userId'));
    this.service.getAllQuestionnaires().subscribe(data=>{
      this.originalData=data;
      for(let Q of this.originalData){  // 判斷是否發布
        if(Q.published){
          this.dataSource.push(Q);
        }
      }


      // 原時間資料判斷
      let begin!:Date;
      let end!:Date;
      for(let eachOne of this.dataSource){
        begin=new Date(eachOne.startDate);
        end=new Date(eachOne.endDate);
        begin.setHours(0,0,0,0);
        end.setHours(23, 59, 59, 999);
        if(new Date().getTime() < begin.getTime()){
          eachOne.status=1;  // 未開始
        }else{
          if(new Date().getTime() <= end.getTime()){
            eachOne.status=2;  // 進行中
          }else{
            eachOne.status=3;  // 已結束
          }
        }
      }
      console.log(this.dataSource);
      this.originalData=this.dataSource;  // 避免資料越找越少(資料替換後回送取代originalData原資料) dataSource之後用來儲存要給畫面的資料
      this.selectButton(0);
      // 分頁初始化
      this.All();

    })
  }

/*--------------------------------------------------------------*/
  // 即時搜尋
  searchData!:string;
  letterSearch(){
    let eachLetter:string[]=[];
    if(this.searchData!=this.searchData.toLowerCase()){
       eachLetter= this.searchData.toLowerCase().split('');  // split('')拆成單一字母並組成陣列
    }else{
      eachLetter= this.searchData.split('');  // split('')拆成單一字母並組成陣列
    }
    const searchResult = this.originalData.filter((item:any) =>     // filter:陣列的篩選法
      eachLetter.every(c => item.title.toLowerCase().includes(c))
    );
    this.paginator(searchResult);
    this.dataLength=searchResult.length;
  }
  highlight(text: string): SafeHtml {
    if (!this.searchData || !text) return text;
    // 1. 處理特殊字元（防止使用者輸入像 * + ? 等正則符號導致當機）
    const escapedSearch = this.searchData.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // 2. 搜尋個別字元 (例如輸入 "ft"，所有 "f" 和 "t" 都會紅)
    const letters = escapedSearch.split('').join('|');
    //g (Global)：全域搜尋，不只找第一個，而是找整段文字中所有匹配的部分。
    //i (Ignore Case)：不分大小寫，搜尋 "A" 也會高亮 "a"。
    const regex = new RegExp(`(${letters})`, 'gi');
    // 3. 一次性取代，不要分兩次執行，避免 self-replacement
    const result = text.replace(regex, '<span style="color: red; font-weight: bold;">$1</span>');

    return this.sanitizer.bypassSecurityTrustHtml(result);
  }
  // highlight(text: string): SafeHtml {
  //   if (!this.searchData) return text;  // 沒輸入就不處理
  //   let highLightLetter = this.searchData.toLowerCase().split('');
  //   let result = text;
  //   for (let c of highLightLetter) {
  //         // 建立不分大小寫的正則式 (正規表達式通常被用來檢索、替換那些符合某個模式的文字)
  //         // 'gi'： (g=>globel + i=>ignoreCase) => 不論大小寫全部搜索
  //         // 當 replace() 被多次執行時，會在已經插入的 <span> 裡面又再插入另一個 <span>，會破壞原本已經replace好的HTML
  //         // 用暫存符號標記，避免破壞 HTML
  //     const regex = new RegExp(`(${c})`, 'gi');  // 找到指定字元 ()建立字元群組 供後續建立HTML標籤使用
  //     result = result.replace(regex,'[[HIGHLIGHT:$1]]');  // $1： 跑(${c})裡的內容 將符合的位置用特殊符號包起來，這裡標註成 [[HIGHLIGHT:字元]]
  //   }
  //       // 把暫存符號，這裡指的是[[HIGHLIGHT:字元]]，轉成 HTML<span> 標籤
  //           //  / ... /g   ： 這是一個「正則表達式 (RegExp)」， g 表示要全域搜尋（不只取第一個匹配)
  //           //  \[\[       ： 匹配字面上的 [[ ，因為 [ 是特殊符號，要加 \ 跳脫
  //           //  HIGHLIGHT: ： 固定文字，表示要找的開頭是 HIGHLIGHT: 的部分
  //           //  (.*?)      ： 括號是群組，用來「捕捉」中間要取出的內容（即要高亮的文字）
  //           //  .*?        ： 代表「任何字元、最短匹配」
  //           //  \]\]       ： 匹配字面上的 ]]，結尾符號
  //   result= result.replace(/\[\[HIGHLIGHT:(.*?)\]\]/g, `<span style="color:	red;font-weight:bold;">$1</span>`);
  //       // ### 說明：https://blog.csdn.net/rubys007/article/details/136118107
  //       // 渲染HTML通常會引入跨站腳本攻擊。(XSS)的潛在風險。渲染的HTML可能包含惡意腳本,構成安全性問題。
  //       // 解決XSS的一種方法是限制HTML元素和屬性的種類,只允許一組已知的「安全」元素和屬性。
  //       // 在幕後,[innerHTML]使用Angular的DomSanitizer,它使用一組經過批准的HTML元素和屬性。
  //       // 這將限制你的[innerHTML]值不能使用<script>和<style>標籤以及style屬性。在選擇使用[innerHTML]時要牢記這一限制。
  //   return this.sanitizer.bypassSecurityTrustHtml(result);
  // }
/*--------------------------------------------------------------*/
  // 問卷開始時間搜尋
  searchBegin!:string;
  searchEnd!:string;
  QuestionnaireDateSearch(){
    let QAbegin!:Date;
    let QAend!:Date;
    let searchResult:any[]=[];
    const beginDate = this.searchBegin ? new Date(this.searchBegin) : null;  // 畫面傳來的searchDate是string，所以要進行資料類型轉換
    const endDate = this.searchEnd ? new Date(this.searchEnd) : null;
    for(let date of this.originalData){
      QAbegin=new Date(date.startDate);
      QAend=new Date(date.endDate);
      if(beginDate && endDate){
        if(endDate<beginDate){
          alert("結束日期不可早於開始日期，請重新選擇");
          this.selectButton(0);
          return;
        }else{
          if(QAbegin.getTime() >= beginDate.getTime()
            && QAend.getTime() <= endDate.getTime()){
              searchResult.push(date);
            }
        }
        this.selectedBtnIndex=null;  // 清除按鍵狀態
      }else if (beginDate && !endDate){
        if (QAbegin.getTime() >= beginDate.getTime()){
          searchResult.push(date);
        }
        this.selectedBtnIndex=null;  // 清除按鍵狀態
      }else if (!beginDate && endDate){
        if (QAend.getTime() <= endDate.getTime()){
          searchResult.push(date);
        }
        this.selectedBtnIndex=null;  // 清除按鍵狀態
      }else{
          return this.selectButton(0);
      }
    }
    this.paginator(searchResult);
    this.dataLength=searchResult.length;
  }
/*--------------------------------------------------------------*/
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
  // 按鍵搜尋
  selectedBtnIndex: number | null = null;
  buttons = [
    { label: '全部', action: () => this.All() },
    { label: '進行中', action: () => this.ING() },
    { label: '未開始', action: () => this.notYet() },
    { label: '已結束', action: () => this.finish() },
  ];
  selectButton(index: number) {
    this.selectedBtnIndex = index;
    this.buttons[index].action(); // 點擊後執行對應動作
  }

  All(){
    this.dataSource=this.originalData;

    this.dataLength=this.dataSource.length;
    this.paginator(this.dataSource);
  }
  ING(){
    let searchResult:any[]=[];
    for(let question of this.originalData){
      if(question.status==2){
        searchResult.push(question);
      }
    }
    this.dataSource=searchResult;

    this.dataLength=this.dataSource.length;
    this.paginator(this.dataSource);
  }
  notYet(){
    let searchResult:any[]=[];
    for(let question of this.originalData){
      if(question.status==1){
        searchResult.push(question);
      }
    }
    this.dataSource=searchResult;

    this.dataLength=this.dataSource.length;
    this.paginator(this.dataSource);
  }
  finish(){
    let searchResult:any[]=[];
    for(let question of this.originalData){
      if(question.status==3){
        searchResult.push(question);
      }
    }
    this.dataSource=searchResult;

    this.dataLength=this.dataSource.length;
    this.paginator(this.dataSource);
  }
/*--------------------------------------------------------------*/
  goToAns(qId:number){
    // console.log(this.dataSource, this.userId, qId);
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate(['/user/answer-page/',qId]);
    });
  }
  goToCount(qId:number){
    this.router.navigateByUrl('/',{ skipLocationChange: true}).then(() => {
      this.router.navigate(['/user/counting/',qId]);
    });
  }
}

// export interface QuestionList{
//   id:number;
//   name:string;
//   statue:number;
//   startDate:string;
//   endDate:string;
//   result:string;
// }
// const listData:QuestionList[]=[
//   {id:1, name:'Azyxwv', statue:1, startDate:"2024-12-25", endDate:"2025-01-01", result:""},
//   {id:2, name:'Byxwvu', statue:2, startDate:"2024-10-25", endDate:"2025-01-01", result:""},
//   {id:3, name:'Cxwvut', statue:2, startDate:"2024-12-25", endDate:"2025-01-01", result:""},
//   {id:4, name:'Dwvuts', statue:1, startDate:"2025-09-25", endDate:"2025-12-01", result:""},
//   {id:5, name:'Evutsr', statue:3, startDate:"2025-12-25", endDate:"2026-01-01", result:""},
//   {id:6, name:'Futsrq', statue:1, startDate:"2024-12-25", endDate:"2025-11-30", result:""}
// ]
