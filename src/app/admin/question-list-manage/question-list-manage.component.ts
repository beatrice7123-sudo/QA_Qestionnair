import { QuestionRes } from './../../@service/service.service';
import { FormsModule } from '@angular/forms';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { QuizCreateReq, ServiceService } from '../../@service/service.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { HttpServiceService } from '../../@service/http-service.service';
import { JsonPipe } from '@angular/common';

@Component({
  selector: 'app-question-list-manage',
  imports: [ FormsModule, JsonPipe ],
  templateUrl: './question-list-manage.component.html',
  styleUrl: './question-list-manage.component.scss'
})
export class QuestionListManageComponent {

  constructor(private router:Router,
    private service:ServiceService,
    private sanitizer:DomSanitizer,  // 標記安全HTML
    private route:ActivatedRoute,
    private http:HttpServiceService
  ){}


  dataSource:any[]=[];  // 資料列表用
  originalData:any;  // 搜尋用
  userId!:number;

  currentPage = 1;
  pageSize = 5; // 每頁顯示5筆
  totalPages = 1;
  dataLength!:number;
  filteredData: any[] = [];   // 篩選後的問卷（全部、進行中、未開始、已結束）
  questionVoList:any[]=[];  // tab2用

  deleteQuestionnaire:number[]=[];  // 刪除問卷用
  deleteQ:number[]=[];  // 刪除問題用

  ngOnInit(): void {
    this.userId=Number(this.route.snapshot.paramMap.get('userId'));
    this.service.getAllQuestionnaires().subscribe(data => {  // 管理員不需判斷發布沒
      this.dataSource = data;
      this.tell();
      this.originalData=this.dataSource;  // 避免資料越找越少
      this.selectButton(0);
      // 分頁初始化
      this.All();
    });
  }
  tell(){
    // 原時間資料判斷
    let begin!:Date;
    let end!:Date;
    for(let eachOne of this.dataSource){
      begin=new Date(eachOne.startDate);
      end=new Date(eachOne.endDate);
      begin.setHours(0,0,0,0);
      end.setHours(23, 59, 59, 999);
      if(eachOne.published==false){
        eachOne.status=4;  // 未發布
      }else{
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

    }
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
    { label: '未發布', action: () => this.onlyStore() },
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
  onlyStore(){
    let searchResult:any[]=[];
    for(let question of this.originalData){
      if(question.status==4){
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
  // 刪除問卷
  questionnaireDelete(questionnaireId:number, questionnaire:any, event:any){
    if (event.target.checked) {
      if (!this.deleteQuestionnaire.includes(questionnaireId)) {
        this.deleteQuestionnaire.push(questionnaireId);
      }else {
        this.deleteQuestionnaire = this.deleteQuestionnaire.filter(x => x !== questionnaireId);
      }
    }
  }
  // 刪除問題
  questionDelete(questionnaireId:number, questionnaire:any, event:any){
    if (event.target.checked) {
      if (!this.deleteQ.includes(questionnaireId)) {
        this.deleteQ.push(questionnaireId);
      }else {
      this.deleteQ = this.deleteQ.filter(x => x !== questionnaireId);
      }
    }
  }
  goToTrashcan() {
    console.log(this.deleteQuestionnaire);
    let deleteData:number[]=[];
    for(let quiz of this.originalData){
      for(let id of this.deleteQuestionnaire){
        if(id==quiz.id && quiz.status==2){
          alert("部分問卷進行中，無法刪除");
          return; //直接結束
        }else if(id==quiz.id && quiz.status!=2){
          deleteData.push(id);
        }
      }
    }
    if (deleteData.length > 0) {
      this.http.postApi('http://localhost:8080/quiz/delete', deleteData).subscribe((res:any)=>{
        if(res.code === 200) {
          this.service.refreshQuestionnaires();
        }
      });
    }else if(this.deleteQ.length > 0){
      this.questionVoList = this.questionVoList.filter(q => !this.deleteQ.includes(q.questionId));
      console.log('已刪除題目:', this.deleteQ);
      this.deleteQ = []; // 清空選取列表
    }
  }
/*--------------------------------------------------------------*/
  @ViewChild('addQuizDialog') addQuizDialog!: ElementRef<HTMLDialogElement>;
  openDialog() {
    this.editingQuestion=null;  // 重置編輯狀態
    this.previewQuestion=null;
    this.questionVoList=[];
    this.title='';
    this.description=''
    this.startDate='';
    this.endDate='';
    this.question = '';
    this.type = '';
    this.required = false;
    this.optionsList = [];
    this.addQuizDialog.nativeElement.showModal();
  }
  closeDialog() {
    this.addQuizDialog.nativeElement.close();
    this.reviseDialog.nativeElement.close();
  }
  activeTab: string = 'tab1';
        /*--------------------------------------------------------------*/
  // tab1
  title!:string;
  description!:string;
  startDate!:string;
  endDate!:string;
  cancel(){
    if(!this.title && !this.description && !this.startDate && !this.endDate){
      this.closeDialog();
    }else{
      if(confirm('確定?')){
        this.closeDialog();
      }
    }
  }
  startReturn!:string;
  endReturn!:string;
  Begin!:Date;
  End!:Date;
  saveQuestion(){
    this.Begin=new Date(this.startDate);
    this.End=new Date(this.endDate);
    this.Begin.setHours(0,0,0,0);
    this.End.setHours(23, 59, 59 ,999);
    console.log(this.Begin, this.End, this.startDate, this.endDate);
    // 驗證是否有填日期、時間是否有效
    if(!this.startDate || !this.endDate || isNaN(this.Begin.getTime()) || isNaN(this.End.getTime())){
      alert("請填寫完整時間");
      return;
    }else{
      if(this.Begin.getDate() < new Date().getDate()){
        alert("開始時間不可在今天之前");
        return;
      }else if(this.End.getTime() <= new Date().getTime()){
        alert("結束時間不可在今天之前");
        return;
      }else if(this.Begin.getTime() >= this.End.getTime()){
        alert("開始時間不可比結束時間晚");
        return;
      }
    }
    this.startReturn=this.formatDate(this.Begin);
    this.endReturn=this.formatDate(this.End);
    this.activeTab='tab2';
  }
        /*--------------------------------------------------------------*/
  // tab2
  // 必填/選填變更 (當使用者勾選 / 取消勾選時觸發)
  selected: number[] = []; // 存放已勾選的 questionId
  onRequiredChange(eachQ: any) {
    if (eachQ.required) {
      // 如果勾選 → 加入 selected 陣列（避免重複）
      if (!this.selected.includes(eachQ.questionId)) {
        this.selected.push(eachQ.questionId);
      }
    } else {
      // 如果取消勾選 → 從 selected 陣列移除
      this.selected = this.selected.filter(id => id !== eachQ.questionId);
    }
    console.log('目前已勾選的題目:', this.selected);
    console.log(this.questionVoList);
  }
                /*--------------------------------------------------------------*/
  @ViewChild('editArea') editArea!: ElementRef;
  editingQuestion: any = null;  // 編輯用
  previewQuestion: any[] | null=null;
  // 新增題目
  question!:string;
  type!:string;
  required!:any;
  optionsList: { code?: number; optionName: string }[] =[];  // 新增用

  addQuestion(){
    this.editingQuestion=[];
    // 清空暫存欄位
    this.question = '';
    this.type = '';
    this.required = false;
    this.optionsList = [];
  }

  isNewMode(): boolean {
    return Array.isArray(this.editingQuestion) && this.editingQuestion.length === 0;
  }
  isEditMode(): boolean {
    return !Array.isArray(this.editingQuestion) && !!this.editingQuestion;
  }

  // 編輯題目
  edit(Qid:number) {
    for(let i of this.questionVoList){
      if(i.questionId==Qid){
        this.editingQuestion = { ...i };
      }
    }

    // 延遲等渲染完畢再滑動
    setTimeout(() => {
      this.editArea.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    this.question = this.editingQuestion.question;
    this.type = this.editingQuestion.type;
    this.optionsList = [...this.editingQuestion.optionsList];
          console.log(this.optionsList);
    for(let i of this.editingQuestion.optionsList){
      console.log(i);
      console.log(i.optionName);
    }
  }
  // 新增用
  addOption() {
    this.optionsList.push({
      optionName: ''
    });
  }
  // 編輯用
  addMoreOption() {
    if (!this.editingQuestion.optionsList) {
      this.editingQuestion.optionsList = [];
    }
    this.editingQuestion.optionsList.push({
      optionName: ''
    });
    console.log(this.editingQuestion.optionsList);
  }
  // 儲存
  save() {
    if (this.question == '' || this.type == '') {
      alert('資料不完整');
      return;
    }

    // 編輯模式
    if (this.isEditMode()) {
      // 找到對應的題目
      const index = this.questionVoList.findIndex(q => q.questionId === this.editingQuestion.questionId);
      if (index !== -1) {
        // 過濾掉空白的選項
        this.editingQuestion.optionsList = this.editingQuestion.optionsList.filter((opt:any) => opt?.optionName?.toString().trim() !== '');

        // 更新題目
        this.questionVoList[index] = {
          ...this.questionVoList[index],
          question: this.editingQuestion.question,
          type: this.editingQuestion.type,
          required: this.editingQuestion.required ?? false,
          optionsList: [...this.editingQuestion.optionsList]
        };
        this.questionVoList = [...this.questionVoList];
        console.log('題目已更新:', this.questionVoList[index]);
        console.log(this.questionVoList);
        console.log(this.editingQuestion);
      }
    } else {
      // 新增題目
      const newId = this.questionVoList.length > 0
        ? Math.max(...this.questionVoList.map(q => q.questionId)) + 1
        : 1;

      // 過濾掉空白的選項
      this.optionsList = this.optionsList.filter((opt:any) => opt?.optionName?.trim() !== '');
      const newQuestion = {
        questionId: newId,
        question: this.question,
        type: this.type,
        required: this.required ?? false,
        optionsList: this.optionsList || []
      };
      this.questionVoList.push(newQuestion);
    }

    this.editingQuestion = null;
    this.previewQuestion = null;
  }

  cancelEdit() {
    this.editingQuestion = null;
  }
  removeOption(code?:any, index?:number) {
    console.log(code);
    if(code){
      if(this.isEditMode()){
        this.editingQuestion.optionsList = this.editingQuestion.optionsList.filter((opt:any) => opt.code !== code);
      }else{
          this.optionsList = this.optionsList.filter(opt => opt.code !== code);
      }
    }else{
      this.editingQuestion.optionsList.splice(index, 1);
    }
    console.log(this.editingQuestion.optionsList);
  }


  @ViewChild('previewArea') previewArea!: ElementRef;
  Data!:any;
  goPreview(){
    if(this.editingQuestion){
      if(confirm("要儲存目前編輯題目嗎?")){
        let previewData:QuizCreateReq={
          quizId: this.quiz?.id || 0,
          title:this.title,
          description:this.description,
          startDate:this.startReturn,
          endDate:this.endReturn,
          published:null as any,
          questionVoList: this.questionVoList.map((q, i) => ({
            quizId: this.quiz?.id || 0,
            questionId: q.questionId || i + 1,
            question: q.question,
            type: q.type,
            required: q.required ?? false,
            optionsList: q.optionsList.map((opt: {optionName:string}, idx: number) => ({
              code: idx + 1,
              optionName: opt.optionName.toString()
            })) || []
          }))
        }
        this.editingQuestion=null;
        this.Data=previewData;
        this.previewQuestion=this.Data;
        if(!this.previewQuestion){
          alert('還沒有填寫資料喔')
        }else{
          // 延遲等渲染完畢再滑動
          setTimeout(() => {
            this.previewArea.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
          });
        }
      }else{
        this.previewQuestion=null;
      }
    }else{
      let previewData:QuizCreateReq={
        quizId: this.quiz?.id || 0,
        title:this.title,
        description:this.description,
        startDate:this.startReturn,
        endDate:this.endReturn,
        published:null as any,
        questionVoList: this.questionVoList.map((q, i) => ({
          quizId:this.quiz?.id || 0,
          questionId: q.questionId || i + 1,
          question: q.question,
          type: q.type,
          required: q.required ?? false,
          optionsList: q.optionsList.map((opt: {optionName:string}, idx: number) => ({
            code: idx + 1,
            optionName:opt.optionName
          })) || []
        }))
      }
      this.editingQuestion=null;
      this.Data=previewData;
      this.previewQuestion=this.Data;
      if(!this.previewQuestion){
        alert('還沒有填寫資料喔')
      }else{
        // 延遲等渲染完畢再滑動
        setTimeout(() => {
          this.previewArea.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
      }
    }
    console.log(this.previewQuestion);
    console.log(this.Data);
  }

  formatDate(date: Date): string {
    const d = new Date(date);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  again(){
    this.previewQuestion=null;
  }
  store(){
    const questionnaireData:QuizCreateReq = {
      quizId: this.quiz?.id || 0,
      title: this.title || "未命名問卷",
      description: this.description,
      startDate:this.formatDate(this.Begin),
      endDate:this.formatDate(this.End),
      published: false,
      questionVoList: this.questionVoList.map((q, i) => ({
        quizId: this.quiz?.id || 0,
        questionId: q.questionId || i + 1,
        question: q.question,
        type: q.type,
        required: q.required ?? false,
        optionsList: q.optionsList.map((opt: {optionName : string}, idx: number) => ({
          code: idx + 1,
          optionName: opt.optionName
        })) || []
      }))
    };

    console.log("準備送出的問卷資料:", JSON.stringify(questionnaireData));

    // this.service.saveQuestionnaire(questionnaireData).subscribe({
    //   next: res => {
    //     alert("儲存成功");
    //     console.log("伺服器回應:", res);
    //     setTimeout(() => {
    //       this.previewQuestion = null;
    //     }, 100);
    //   },
    //   error: err => {
    //     console.error("儲存失敗:", err);
    //     alert("儲存失敗");
    //   }
    // });
    if(questionnaireData.quizId==0){
      this.http.postApi('http://localhost:8080/quiz/create', questionnaireData).subscribe((res:any)=>{
        if(res.code === 200) {
          this.service.refreshQuestionnaires();
        }
      });
    }else{
      this.http.postApi('http://localhost:8080/quiz/update', questionnaireData).subscribe((res:any)=>{
        if(res.code === 200) {
          this.service.refreshQuestionnaires();
        }
      });
    }

    this.tell();
    this.All();
    this.closeDialog();
  }
  push(){
    const questionnaireData:QuestionRes = {
      id: this.quiz?.id || 0,
      title: this.title || "未命名問卷",
      description: this.description,
      startDate: this.formatDate(this.Begin),
      endDate:this.formatDate(this.End),
      published: true,
      questionVoList: this.questionVoList.map((q, i) => ({
        quizId: this.quiz?.id || 0,
        questionId: q.questionId || i + 1,
        question: q.question,
        type: q.type,
        required: q.required ?? false,
        optionsList: q.optionsList.map((opt: {optionName : string}, idx: number) => ({
          code: idx + 1,
          optionName: opt.optionName
        })) || []
      }))
    };

    console.log("準備送出的問卷資料:", questionnaireData);

    // this.service.saveQuestionnaire(questionnaireData).subscribe({
    //   next: res => {
    //     alert("儲存成功");
    //     console.log("伺服器回應:", res);
    //     setTimeout(() => {
    //       this.previewQuestion = null;
    //     }, 100);
    //   },
    //   error: err => {
    //     console.error("儲存失敗:", err);
    //     alert("儲存失敗");
    //   }
    // });
    if(questionnaireData.id==0){
      this.http.postApi('http://localhost:8080/quiz/create', questionnaireData).subscribe((res:any)=>{
        if(res.code === 200) {
          this.service.refreshQuestionnaires();
        }
      });
    }else{
      console.log("更新問卷資料:", questionnaireData);
      this.http.postApi('http://localhost:8080/quiz/update', questionnaireData).subscribe((res:any)=>{
        if(res.code === 200) {
          this.service.refreshQuestionnaires();
        }
      });
    }
    this.tell();
    this.All();
    this.closeDialog();

  }
                /*--------------------------------------------------------------*/
  @ViewChild('reviseDialog') reviseDialog!: ElementRef<HTMLDialogElement>;
  quiz:any;
  revise(id:any){
    this.reviseDialog.nativeElement.showModal();
    this.http.getApi('http://localhost:8080/quiz/get_quiz?id='+id).subscribe((res:any)=>{
      this.quiz=res.quiz;
      this.title=this.quiz.title;
      this.description=this.quiz.description;
      this.startDate=this.quiz.startDate;
      this.endDate=this.quiz.endDate;
    });
    this.http.getApi('http://localhost:8080/quiz/get_questions?quizId='+id).subscribe((res:any)=>{
      this.questionVoList=res.questionVoList;
      this.optionsList = (res.optionsList ?? []).map((o: any) => ({
        code: o.code,
        optionName: String(
          typeof o.optionName === 'object'
            ? o.optionName.optionName
            : o.optionName
        )
      }));
    });
  }
  reviseCancel(){
    if(this.title==this.quiz.title
      && this.description==this.quiz.description
      && this.startDate==this.quiz.startDate
      && this.endDate==this.quiz.endDate){
        this.closeDialog();
    }else{
      if(confirm('確定?')){
        this.closeDialog();
      }
    }
  }
/*--------------------------------------------------------------*/
  // goToAns(qId:number){
  //   this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
  //     this.router.navigate(['/user/answer-page/',this.userId,qId]);
  //   });
  // }
  goTo(qId:number){
    this.router.navigateByUrl('/',{ skipLocationChange: true}).then(() => {
      this.router.navigate(['/admin/feedback/',qId]);
    });
  }
}
