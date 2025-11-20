import { QuestionRes } from './../../@service/service.service';
import { FormsModule } from '@angular/forms';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { QuizCreateReq, ServiceService } from '../../@service/service.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-question-list-manage',
  imports: [ FormsModule ],
  templateUrl: './question-list-manage.component.html',
  styleUrl: './question-list-manage.component.scss'
})
export class QuestionListManageComponent {

  constructor(private router:Router,
    private service:ServiceService,
    private sanitizer:DomSanitizer,  // 標記安全HTML
    private route:ActivatedRoute
  ){}


  dataSource:any[]=[];  // 資料列表用
  originalData:any;  // 搜尋用
  userId!:number;

  currentPage = 1;
  pageSize = 5; // 每頁顯示5筆
  totalPages = 1;
  dataLength!:number;
  filteredData: any[] = [];   // 篩選後的問卷（全部、進行中、未開始、已結束）
  questionList:any[]=[];  // tab2用

  deleteQuestionnaire:number[]=[];  // 刪除問卷用
  deleteQ:number[]=[];  // 刪除問題用

  ngOnInit(): void {

    this.userId=Number(this.route.snapshot.paramMap.get('userId'));
    this.service.getAllQuestionnaires().subscribe(data => {  // 管理員不需判斷發布沒
      this.dataSource = data;
    });


    this.tell();
    this.originalData=this.dataSource;  // 避免資料越找越少
    this.selectButton(0);
    // 分頁初始化
    this.All();

  }
  tell(){
    // 原時間資料判斷
    let begin!:Date;
    let end!:Date;
    for(let eachOne of this.dataSource){
      begin=new Date(eachOne.startTime);
      end=new Date(eachOne.endTime);
      begin.setHours(0,0,0,0);
      end.setHours(23, 59, 59, 999);
      if(eachOne.question_status==false){
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
    const eachLetter = this.searchData.toLowerCase().split('');  // split('')拆成單一字母並組成陣列
    const searchResult = this.originalData.filter((item:any) =>                 // filter陣列的篩選法
      eachLetter.every(c => item.title.toLowerCase().includes(c))
    );
    this.paginator(searchResult);
    this.dataLength=searchResult.length;
  }
  highlight(text: string): SafeHtml {
    if (!this.searchData) return text;  // 沒輸入就不處理
    let highLightLetter = this.searchData.toLowerCase().split('');
    let result = text;
    for (let c of highLightLetter) {
          // 建立不分大小寫的正則式 (正規表達式通常被用來檢索、替換那些符合某個模式的文字)
          // 'gi'： (g=>globel + i=>ignoreCase) => 不論大小寫全部搜索
          // 當 replace() 被多次執行時，會在已經插入的 <span> 裡面又再插入另一個 <span>，會破壞原本已經replace好的HTML
          // 用暫存符號標記，避免破壞 HTML
      const regex = new RegExp(`(${c})`, 'gi');  // 找到指定字元 ()建立字元群組 供後續建立HTML標籤使用
      result = result.replace(regex,'[[HIGHLIGHT:$1]]');  // $1： 跑(${c})裡的內容 將符合的位置用特殊符號包起來，這裡標註成 [[HIGHLIGHT:字元]]
    }
        // 把暫存符號，這裡指的是[[HIGHLIGHT:字元]]，轉成 HTML<span> 標籤
            //  / ... /g   ： 這是一個「正則表達式 (RegExp)」， g 表示要全域搜尋（不只取第一個匹配)
            //  \[\[       ： 匹配字面上的 [[ ，因為 [ 是特殊符號，要加 \ 跳脫
            //  HIGHLIGHT: ： 固定文字，表示要找的開頭是 HIGHLIGHT: 的部分
            //  (.*?)      ： 括號是群組，用來「捕捉」中間要取出的內容（即要高亮的文字）
            //  .*?        ： 代表「任何字元、最短匹配」
            //  \]\]       ： 匹配字面上的 ]]，結尾符號
    result= result.replace(/\[\[HIGHLIGHT:(.*?)\]\]/g, `<span style="color:	red;font-weight:bold;">$1</span>`);
        // ### 說明：https://blog.csdn.net/rubys007/article/details/136118107
        // 渲染HTML通常會引入跨站腳本攻擊。(XSS)的潛在風險。渲染的HTML可能包含惡意腳本,構成安全性問題。
        // 解決XSS的一種方法是限制HTML元素和屬性的種類,只允許一組已知的「安全」元素和屬性。
        // 在幕後,[innerHTML]使用Angular的DomSanitizer,它使用一組經過批准的HTML元素和屬性。
        // 這將限制你的[innerHTML]值不能使用<script>和<style>標籤以及style屬性。在選擇使用[innerHTML]時要牢記這一限制。
    return this.sanitizer.bypassSecurityTrustHtml(result);
  }
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
      QAbegin=new Date(date.startTime);
      QAend=new Date(date.endTime);
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
    if (this.deleteQuestionnaire.length > 0) {
      this.service.deleteQuestionnaires(this.deleteQuestionnaire).subscribe({
        next: res => {
          console.log('刪除成功', res);
          this.service.getAllQuestionnaires().subscribe(data=>{
            this.paginator(data);
          });
        },
        error: err => {
          console.error('刪除失敗', err);
        }
      });
    }else if(this.deleteQ.length > 0){
      this.questionList = this.questionList.filter(q => !this.deleteQ.includes(q.questionID));
      console.log('已刪除題目:', this.deleteQ);
      this.deleteQ = []; // 清空選取列表
    }
  }
/*--------------------------------------------------------------*/
  @ViewChild('myDialog') dialog!: ElementRef<HTMLDialogElement>;
  openDialog() {
    this.editingQuestion=null;  // 重置編輯狀態
    this.previewQuestion=null;
    this.questionList=[];
    this.title='';
    this.description=''
    this.startDate
    this.question = '';
    this.type = '';
    this.required = false;
    this.options = [];
    this.dialog.nativeElement.showModal();
  }
  closeDialog() {
    this.dialog.nativeElement.close();
  }
  activeTab: string = 'tab1';
        /*--------------------------------------------------------------*/
  // tab1
  title!:string;
  description!:string;
  startDate!:Date;
  endDate!:Date;
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
  saveQuestion(){
    const Begin=new Date(this.startDate);
    const End=new Date(this.endDate);
    Begin.setHours(0,0,0,0);
    End.setHours(23, 59, 59 ,999);
    this.startDate=Begin;
    this.endDate=End;
    // 驗證是否有填日期、時間是否有效
    if(!this.startDate || !this.endDate || isNaN(Begin.getTime()) || isNaN(End.getTime())){
      alert("請填寫完整時間");
      return;
    }else{
      if(this.startDate.getDate() < new Date().getDate()){
        alert("開始時間不可在今天之前");
        return;
      }else if(this.endDate.getTime() <= new Date().getTime()){
        alert("結束時間不可在今天之前");
        return;
      }else if(this.startDate.getTime() >= this.endDate.getTime()){
        alert("開始時間不可比結束時間晚");
        return;
      }
    }
    this.startReturn=new Date(this.startDate).toISOString().split('T')[0];
    this.endReturn=new Date(this.endDate).toISOString().split('T')[0];
    this.activeTab='tab2';
  }
        /*--------------------------------------------------------------*/
  // tab2
  // 必填/選填變更 (當使用者勾選 / 取消勾選時觸發)
  selected: number[] = []; // 存放已勾選的 questionID
  onRequiredChange(eachQ: any) {
    if (eachQ.required) {
      // 如果勾選 → 加入 selected 陣列（避免重複）
      if (!this.selected.includes(eachQ.questionID)) {
        this.selected.push(eachQ.questionID);
      }
    } else {
      // 如果取消勾選 → 從 selected 陣列移除
      this.selected = this.selected.filter(id => id !== eachQ.questionID);
    }
    console.log('目前已勾選的題目:', this.selected);
    console.log(this.questionList);
  }
                /*--------------------------------------------------------------*/
  @ViewChild('editArea') editArea!: ElementRef;
  editingQuestion: any = null;  // 編輯用
  previewQuestion: any[] | null=null;
  // 新增題目
  question!:string;
  type!:string;
  required!:any;
  options:any[]=[];  // 新增用
  addQuestion(){
    this.editingQuestion=[];
    // 清空暫存欄位
    this.question = '';
    this.type = '';
    this.required = false;
    this.options = [];
  }

  isNewMode(): boolean {
    return Array.isArray(this.editingQuestion) && this.editingQuestion.length === 0;
  }
  isEditMode(): boolean {
    return !Array.isArray(this.editingQuestion) && !!this.editingQuestion;
  }

  // 編輯題目
  edit(Qid:number) {
    for(let i of this.questionList){
      if(i.questionID==Qid){
        this.editingQuestion = { ...i };
      }
    }

    // 延遲等渲染完畢再滑動
    setTimeout(() => {
      this.editArea.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    this.question = this.editingQuestion.question;
    this.type = this.editingQuestion.type;
    this.options = [...this.editingQuestion.options];
  }
  // 新增用
  addOption() {
    this.options.push('');
  }
  // 編輯用
  addMoreOption() {
    if (!this.editingQuestion.options) {
      this.editingQuestion.options = [];
    }
    this.editingQuestion.options.push('');
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
      const index = this.questionList.findIndex(q => q.questionID === this.editingQuestion.questionID);
      if (index !== -1) {
        // 過濾掉空白的選項
        this.editingQuestion.options = this.editingQuestion.options.filter((opt:any) => opt.trim() !== '');

        // 更新題目
        this.questionList[index] = {
          ...this.questionList[index],
          question: this.question,
          type: this.type,
          required: this.required ?? false,
          options: [...this.editingQuestion.options]
        };
        this.questionList = [...this.questionList];
        console.log('題目已更新:', this.questionList[index]);
      }
    } else {
      // 新增題目
      const newId = this.questionList.length > 0
        ? Math.max(...this.questionList.map(q => q.questionID)) + 1
        : 1;

      // 過濾掉空白的選項
      this.options = this.options.filter((opt:any) => opt.trim() !== '');
      const newQuestion = {
        questionID: newId,
        question: this.question,
        type: this.type,
        required: this.required ?? false,
        options: this.options || []
      };
      this.questionList.push(newQuestion);
    }

    this.editingQuestion = null;
    this.previewQuestion = null;
  }

  cancelEdit() {
    this.editingQuestion = null;
  }
  removeOption(index: number) {
    if(this.isEditMode()){
      this.editingQuestion.options.splice(index, 1);
    }else{
      this.options.splice(index,1);
    }
  }

  @ViewChild('previewArea') previewArea!: ElementRef;
  Data!:any;
  goPreview(){
    if(this.editingQuestion){
      if(confirm("要儲存目前編輯題目嗎?")){
        let previewData:QuizCreateReq={
          title:this.title,
          description:this.description,
          startDate:this.startReturn,
          endDate:this.endReturn,
          published:null as any,
          questionList:this.questionList
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
        title:this.title,
        description:this.description,
        startDate:this.startReturn,
        endDate:this.endReturn,
        published:null as any,
        questionList:this.questionList
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
    const questionnaireData:QuestionRes = {
      questionnaireID: 0, // 或者改成自動生成、或從 route / service 拿
      title: this.title || "未命名問卷",
      status: "success",
      message: `${this.title || '問卷'}資料取得成功`,
      startTime: this.startDate ? this.formatDate(this.startDate) : '',
      endTime: this.endDate ? this.formatDate(this.endDate) : '',
      question_status: false,
      questionVoList: this.questionList.map((q, i) => ({
        questionId: q.questionID || i + 1,
        question: q.question,
        type: q.type,
        required: q.required ?? false,
        options: q.options || []
      }))
    };

    console.log("準備送出的問卷資料:", questionnaireData);

    this.service.saveQuestionnaire(questionnaireData).subscribe({
      next: res => {
        alert("儲存成功");
        console.log("伺服器回應:", res);
        setTimeout(() => {
          this.previewQuestion = null;
        }, 100);
      },
      error: err => {
        console.error("儲存失敗:", err);
        alert("儲存失敗");
      }
    });
    this.tell();
    this.All();
    this.closeDialog();
  }
  push(){
    const questionnaireData:QuestionRes = {
      questionnaireID: 0, // 或者改成自動生成、或從 route / service 拿
      title: this.title || "未命名問卷",
      status: "success",
      message: `${this.title || '問卷'}資料取得成功`,
      startTime: this.startDate ? this.formatDate(this.startDate) : '',
      endTime: this.endDate ? this.formatDate(this.endDate) : '',
      question_status: true,
      questionVoList: this.questionList.map((q, i) => ({
        questionId: q.questionID || i + 1,
        question: q.question,
        type: q.type,
        required: q.required ?? false,
        options: q.options || []
      }))
    };

    console.log("準備送出的問卷資料:", questionnaireData);

    this.service.saveQuestionnaire(questionnaireData).subscribe({
      next: res => {
        alert("儲存成功");
        console.log("伺服器回應:", res);
        setTimeout(() => {
          this.previewQuestion = null;
        }, 100);
      },
      error: err => {
        console.error("儲存失敗:", err);
        alert("儲存失敗");
      }
    });
    console.log("成功");
    this.tell();
    this.All();
    this.closeDialog();
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
