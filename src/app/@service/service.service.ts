import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ServiceService {

  constructor() { }

  forCount:any=[];
  private previewData:any;

  // ID
  private userId$ = new BehaviorSubject<number | null>(null);
  // 設定 userId
  setUserId(id: number) {
    this.userId$.next(id);
  }
  // 取得最新 userId
  getUserId(): number | null {
    return this.userId$.value;
  }
  // 可訂閱 userId 變化
  userIdObservable() {
    return this.userId$.asObservable();
  }

  private questionnaireList: QuestionRes[] = this.initQuestionnaires();
  // BehaviorSubject 方便讓其他 component 自動更新畫面
  private questionnaires$ = new BehaviorSubject<QuestionRes[]>(this.questionnaireList);
  // 問卷清單
  private initQuestionnaires(): QuestionRes[] {
    return [
      {
        questionnaireID: 1,
        title: "城市美食探索",
        status: "success",
        message: "阿說明說明說明說明說明說明說明說明 阿說明說明說明說明說明說明說明說明",
        startTime: "2024-10-01",
        endTime: "2028-12-31",
        question_status:true,
        questionVoList: [
          { questionId: 101, question: "您最常外食的餐類是？", type: "single", required: true, options: ["中式", "西式", "日式", "韓式", "其他"] },
          { questionId: 102, question: "您平均一週外食幾次？", type: "single", required: true, options: ["0~1次", "2~4次", "5次以上"] },
          { questionId: 103, question: "您最重視餐廳的哪一點？", type: "multiple", required: false, options: ["價格", "口味", "服務", "環境", "交通"] },
          { questionId: 104, question: "是否願意嘗試異國料理？", type: "single", required: true, options: ["是", "否"] },
          { questionId: 105, question: "請描述您最喜歡的一道菜。", type: "text", required: false, options: [] }
        ]
      },
      {
        questionnaireID: 2,
        title: "假日電影喜好調查",
        status: "success",
        message: "阿說明說明說明說明說明說明說明說明 阿說明說明說明說明說明說明說明說明",
        startTime: "2024-01-10",
        endTime: "2025-02-28",
        question_status:true,
        questionVoList: [
          { questionId: 201, question: "您每月大約看幾部電影？", type: "single", required: true, options: ["1~2部", "3~5部", "超過5部"] },
          { questionId: 202, question: "最常使用的觀影平台？", type: "multiple", required: true, options: ["Netflix", "Disney+", "YouTube", "電影院", "其他"] },
          { questionId: 203, question: "最喜歡的電影類型？", type: "multiple", required: false, options: ["動作", "喜劇", "愛情", "恐怖", "紀錄片"] },
          { questionId: 204, question: "請分享一部您印象深刻的電影。", type: "text", required: false, options: [] }
        ]
      },
      {
        questionnaireID: 3,
        title: "旅遊方式與偏好",
        status: "success",
        message: "阿說明說明說明說明說明說明說明說明 阿說明說明說明說明說明說明說明說明",
        startTime: "2023-05-01",
        endTime: "2023-12-30",
        question_status:true,
        questionVoList: [
          { questionId: 301, question: "一年旅遊幾次？", type: "single", required: true, options: ["0~1次", "2~3次", "4次以上"] },
          { questionId: 302, question: "偏好國內或國外旅遊？", type: "single", required: true, options: ["國內", "國外"] },
          { questionId: 303, question: "您喜歡哪種旅遊類型？", type: "multiple", required: false, options: ["自然風景", "美食之旅", "購物行程", "歷史文化"] },
          { questionId: 304, question: "旅遊時最看重什麼？", type: "multiple", required: false, options: ["預算", "交通", "住宿品質", "體驗活動"] },
          { questionId: 305, question: "請簡述您最難忘的一次旅行經驗。", type: "text", required: false, options: [] }
        ]
      },
      {
        questionnaireID: 4,
        title: "音樂喜好大調查",
        status: "success",
        message: "阿說明說明說明說明說明說明說明說明 阿說明說明說明說明說明說明說明說明",
        startTime: "2025-06-01",
        endTime: "2026-07-30",
        question_status:true,
        questionVoList: [
          { questionId: 401, question: "您每天大約聽音樂多久？", type: "single", required: true, options: ["不到30分鐘", "1~2小時", "3小時以上"] },
          { questionId: 402, question: "偏好哪種類型的音樂？", type: "multiple", required: true, options: ["流行", "搖滾", "爵士", "古典", "嘻哈", "其他"] },
          { questionId: 403, question: "聽音樂的主要平台？", type: "single", required: true, options: ["Spotify", "YouTube", "Apple Music", "KKBOX"] },
          { questionId: 404, question: "請說出您最喜歡的歌手或樂團。", type: "text", required: false, options: [] }
        ]
      },
      {
        questionnaireID: 5,
        title: "夜市美食最愛排行",
        status: "success",
        message: "阿說明說明說明說明說明說明說明說明 阿說明說明說明說明說明說明說明說明",
        startTime: "2024-03-01",
        endTime: "2024-09-30",
        question_status:true,
        questionVoList: [
          { questionId: 501, question: "您最常去的夜市是？", type: "text", required: false, options: [] },
          { questionId: 502, question: "最常買的夜市小吃？", type: "multiple", required: true, options: ["雞排", "珍奶", "臭豆腐", "蚵仔煎", "地瓜球"] },
          { questionId: 503, question: "平均消費金額？", type: "single", required: false, options: ["100元以下", "100~300元", "300元以上"] },
          { questionId: 504, question: "是否願意嘗試創新口味？", type: "single", required: true, options: ["願意", "不願意"] },
          { questionId: 505, question: "請描述您最喜歡的夜市攤位。", type: "text", required: false, options: [] }
        ]
      },
      {
        questionnaireID: 6,
        title: "旅人住宿喜好分析",
        status: "success",
        message: "阿說明說明說明說明說明說明說明說明 阿說明說明說明說明說明說明說明說明",
        startTime: "2027-02-01",
        endTime: "2028-12-31",
        question_status:true,
        questionVoList: [
          { questionId: 601, question: "旅遊時通常選擇哪種住宿？", type: "single", required: true, options: ["飯店", "民宿", "青年旅館", "露營"] },
          { questionId: 602, question: "選擇住宿最重視什麼？", type: "multiple", required: false, options: ["價格", "地點", "設施", "評價"] },
          { questionId: 603, question: "是否會參考網路評論？", type: "single", required: true, options: ["會", "不會"] },
          { questionId: 604, question: "您最難忘的住宿經驗是？", type: "text", required: false, options: [] }
        ]
      },
      {
        questionnaireID: 7,
        title: "甜點偏好調查",
        status: "success",
        message: "阿說明說明說明說明說明說明說明說明 阿說明說明說明說明說明說明說明說明",
        startTime: "2023-08-15",
        endTime: "2024-01-31",
        question_status:true,
        questionVoList: [
          { questionId: 701, question: "最常吃的甜點種類？", type: "multiple", required: true, options: ["蛋糕", "冰淇淋", "珍珠奶茶", "餅乾", "豆花"] },
          { questionId: 702, question: "甜點甜度偏好？", type: "single", required: true, options: ["無糖", "微糖", "半糖", "全糖"] },
          { questionId: 703, question: "您喜歡嘗試創新甜點嗎？", type: "single", required: true, options: ["是", "否"] },
          { questionId: 704, question: "請描述您心目中的完美甜點。", type: "text", required: false, options: [] }
        ]
      },
      {
        questionnaireID: 8,
        title: "電影觀影習慣",
        status: "success",
        message: "阿說明說明說明說明說明說明說明說明 阿說明說明說明說明說明說明說明說明",
        startTime: "2023-09-10",
        endTime: "2024-03-30",
        question_status:true,
        questionVoList: [
          { questionId: 801, question: "您偏好哪種觀影地點？", type: "single", required: true, options: ["家中", "電影院", "朋友家"] },
          { questionId: 802, question: "觀影時是否搭配零食？", type: "single", required: true, options: ["是", "否"] },
          { questionId: 803, question: "喜歡哪種電影風格？", type: "multiple", required: false, options: ["懸疑", "科幻", "喜劇", "浪漫", "恐怖"] },
          { questionId: 804, question: "最近看過印象最深的電影是？", type: "text", required: false, options: [] }
        ]
      },
      {
        questionnaireID: 9,
        title: "海外旅遊經驗調查",
        status: "success",
        message: "阿說明說明說明說明說明說明說明說明 阿說明說明說明說明說明說明說明說明",
        startTime: "2024-04-15",
        endTime: "2026-04-15",
        question_status:true,
        questionVoList: [
          { questionId: 901, question: "您曾去過哪個國家？", type: "text", required: false, options: [] },
          { questionId: 902, question: "出國主要目的？", type: "multiple", required: true, options: ["休閒", "商務", "探親", "學習", "其他"] },
          { questionId: 903, question: "旅途中遇到最大挑戰是？", type: "text", required: false, options: [] },
          { questionId: 904, question: "是否會再次出國旅遊？", type: "single", required: true, options: ["會", "不會"] }
        ]
      },
      {
        questionnaireID: 10,
        title: "音樂收聽設備分析",
        status: "success",
        message: "阿說明說明說明說明說明說明說明說明 阿說明說明說明說明說明說明說明說明",
        startTime: "2029-02-01",
        endTime: "2029-08-31",
        question_status:false,
        questionVoList: [
          { questionId: 1001, question: "您最常用什麼設備聽音樂？", type: "single", required: true, options: ["手機", "電腦", "藍牙音響", "車上"] },
          { questionId: 1002, question: "是否使用耳機？", type: "single", required: true, options: ["是", "否"] },
          { questionId: 1003, question: "音質對您來說重要嗎？", type: "single", required: true, options: ["非常重要", "普通", "不在意"] },
          { questionId: 1004, question: "是否購買串流音樂會員？", type: "single", required: false, options: ["有", "沒有"] }
        ]
      },
      {
        questionnaireID: 11,
        title: "早餐飲食習慣",
        status: "success",
        message: "阿說明說明說明說明說明說明說明說明 阿說明說明說明說明說明說明說明說明",
        startTime: "2023-01-01",
        endTime: "2025-12-31",
        question_status:true,
        questionVoList: [
          { questionId: 1101, question: "是否每天吃早餐？", type: "single", required: true, options: ["是", "否"] },
          { questionId: 1102, question: "最常吃的早餐類型？", type: "multiple", required: false, options: ["中式", "西式", "速食", "自煮"] },
          { questionId: 1103, question: "早餐平均花費？", type: "single", required: true, options: ["50元以下", "50~100元", "100元以上"] },
          { questionId: 1104, question: "請簡述您最喜歡的早餐組合。", type: "text", required: false, options: [] }
        ]
      },
      {
        questionnaireID: 12,
        title: "電影配樂偏好",
        status: "success",
        message: "阿說明說明說明說明說明說明說明說明 阿說明說明說明說明說明說明說明說明",
        startTime: "2024-07-01",
        endTime: "2026-01-31",
        question_status:true,
        questionVoList: [
          { questionId: 1201, question: "您是否關注電影配樂？", type: "single", required: true, options: ["是", "否"] },
          { questionId: 1202, question: "最喜歡哪位配樂作曲家？", type: "text", required: false, options: [] },
          { questionId: 1203, question: "您覺得哪種音樂最能營造氣氛？", type: "multiple", required: false, options: ["鋼琴", "弦樂", "電子", "搖滾"] },
          { questionId: 1204, question: "最近一次被配樂感動的電影？", type: "text", required: false, options: [] }
        ]
      },
      {
        questionnaireID: 13,
        title: "咖啡飲用習慣調查",
        status: "success",
        message: "阿說明說明說明說明說明說明說明說明 阿說明說明說明說明說明說明說明說明",
        startTime: "2024-03-01",
        endTime: "2024-11-30",
        question_status:true,
        questionVoList: [
          { questionId: 1301, question: "平均一天喝幾杯咖啡？", type: "single", required: true, options: ["0", "1~2杯", "3杯以上"] },
          { questionId: 1302, question: "偏好哪種咖啡風味？", type: "multiple", required: false, options: ["拿鐵", "美式", "黑咖啡", "焦糖瑪奇朵"] },
          { questionId: 1303, question: "是否自煮咖啡？", type: "single", required: true, options: ["是", "否"] },
          { questionId: 1304, question: "請描述您一天中最喜歡喝咖啡的時刻。", type: "text", required: false, options: [] }
        ]
      },
      {
        questionnaireID: 14,
        title: "旅遊交通偏好",
        status: "success",
        message: "阿說明說明說明說明說明說明說明說明 阿說明說明說明說明說明說明說明說明",
        startTime: "2023-09-01",
        endTime: "2024-02-01",
        question_status:true,
        questionVoList: [
          { questionId: 1401, question: "旅遊時主要交通工具？", type: "single", required: true, options: ["自駕", "火車", "巴士", "飛機", "步行"] },
          { questionId: 1402, question: "是否喜歡自駕旅行？", type: "single", required: true, options: ["是", "否"] },
          { questionId: 1403, question: "選擇交通方式時最重視？", type: "multiple", required: false, options: ["價格", "時間", "便利性", "體驗感"] },
          { questionId: 1404, question: "最難忘的一次交通經驗是？", type: "text", required: false, options: [] }
        ]
      },
      {
        questionnaireID: 15,
        title: "音樂與情緒關聯",
        status: "success",
        message: "阿說明說明說明說明說明說明說明說明 阿說明說明說明說明說明說明說明說明",
        startTime: "2027-03-01",
        endTime: "2028-06-01",
        question_status:false,
        questionVoList: [
          { questionId: 1501, question: "您會依心情選音樂嗎？", type: "single", required: true, options: ["會", "不會"] },
          { questionId: 1502, question: "聽音樂主要目的？", type: "multiple", required: false, options: ["放鬆", "提神", "專注", "陪伴"] },
          { questionId: 1503, question: "哪種類型最能安撫情緒？", type: "multiple", required: false, options: ["抒情", "古典", "輕音樂", "爵士"] },
          { questionId: 1504, question: "請描述音樂如何影響您的情緒。", type: "text", required: false, options: [] }
        ]
      },
      {
        questionnaireID: 16,
        title: "街頭美食文化",
        status: "success",
        message: "阿說明說明說明說明說明說明說明說明 阿說明說明說明說明說明說明說明說明",
        startTime: "2024-05-01",
        endTime: "2026-05-01",
        question_status:true,
        questionVoList: [
          { questionId: 1601, question: "您喜歡街頭小吃嗎？", type: "single", required: true, options: ["是", "否"] },
          { questionId: 1602, question: "最常吃的街頭美食？", type: "multiple", required: false, options: ["串燒", "滷味", "甜不辣", "章魚燒", "蔥油餅"] },
          { questionId: 1603, question: "街頭美食吸引您的原因？", type: "multiple", required: false, options: ["便宜", "方便", "道地", "懷舊"] },
          { questionId: 1604, question: "請描述您印象最深的街頭美食。", type: "text", required: false, options: [] }
        ]
      },
      {
        questionnaireID: 17,
        title: "旅遊攝影習慣",
        status: "success",
        message: "阿說明說明說明說明說明說明說明說明 阿說明說明說明說明說明說明說明說明",
        startTime: "2027-01-01",
        endTime: "2027-12-31",
        question_status:true,
        questionVoList: [
          { questionId: 1701, question: "旅遊時是否一定會拍照？", type: "single", required: true, options: ["是", "否"] },
          { questionId: 1702, question: "使用何種設備拍照？", type: "single", required: true, options: ["手機", "相機", "運動攝影機"] },
          { questionId: 1703, question: "拍照的主要原因？", type: "multiple", required: false, options: ["紀念", "社群分享", "攝影興趣"] },
          { questionId: 1704, question: "最滿意的一張旅遊照片是什麼？", type: "text", required: false, options: [] }
        ]
      },
      {
        questionnaireID: 18,
        title: "音樂串流服務偏好",
        status: "success",
        message: "阿說明說明說明說明說明說明說明說明 阿說明說明說明說明說明說明說明說明",
        startTime: "2025-04-15",
        endTime: "2025-12-31",
        question_status:true,
        questionVoList: [
          { questionId: 1801, question: "最常使用的串流平台？", type: "single", required: true, options: ["Spotify", "Apple Music", "YouTube Music", "KKBOX"] },
          { questionId: 1802, question: "是否使用付費方案？", type: "single", required: true, options: ["是", "否"] },
          { questionId: 1803, question: "最重視的平台功能？", type: "multiple", required: false, options: ["音質", "推薦系統", "介面", "離線播放"] },
          { questionId: 1804, question: "希望未來增加什麼功能？", type: "text", required: false, options: [] }
        ]
      },
      {
        questionnaireID: 19,
        title: "電影與飲食習慣",
        status: "success",
        message: "阿說明說明說明說明說明說明說明說明 阿說明說明說明說明說明說明說明說明",
        startTime: "2024-06-01",
        endTime: "2025-02-01",
        question_status:true,
        questionVoList: [
          { questionId: 1901, question: "看電影時會吃東西嗎？", type: "single", required: true, options: ["會", "不會"] },
          { questionId: 1902, question: "最常搭配的食物？", type: "multiple", required: false, options: ["爆米花", "飲料", "洋芋片", "糖果"] },
          { questionId: 1903, question: "是否介意他人吃東西聲音？", type: "single", required: true, options: ["會", "不會"] },
          { questionId: 1904, question: "看電影的理想環境是？", type: "text", required: false, options: [] }
        ]
      },
      {
        questionnaireID: 20,
        title: "旅遊夥伴偏好",
        status: "success",
        message: "阿說明說明說明說明說明說明說明說明 阿說明說明說明說明說明說明說明說明",
        startTime: "2024-09-01",
        endTime: "2025-09-01",
        question_status:true,
        questionVoList: [
          { questionId: 2001, question: "您通常與誰一起旅行？", type: "multiple", required: true, options: ["家人", "朋友", "伴侶", "獨旅"] },
          { questionId: 2002, question: "最理想的旅伴特質？", type: "multiple", required: false, options: ["隨和", "細心", "愛冒險", "善規劃"] },
          { questionId: 2003, question: "是否曾與旅伴發生爭執？", type: "single", required: true, options: ["有", "沒有"] },
          { questionId: 2004, question: "請描述理想中的完美旅伴。", type: "text", required: false, options: [] }
        ]
      },
      {
        questionnaireID: 21,
        title: "料理興趣與技巧",
        status: "success",
        message: "阿說明說明說明說明說明說明說明說明 阿說明說明說明說明說明說明說明說明",
        startTime: "2024-02-01",
        endTime: "2026-02-01",
        question_status:true,
        questionVoList: [
          { questionId: 2101, question: "是否喜歡自己下廚？", type: "single", required: true, options: ["是", "否"] },
          { questionId: 2102, question: "最常做的料理類型？", type: "multiple", required: false, options: ["中式", "日式", "義式", "甜點"] },
          { questionId: 2103, question: "是否曾參加料理課程？", type: "single", required: false, options: ["有", "沒有"] },
          { questionId: 2104, question: "最想學會的一道料理？", type: "text", required: false, options: [] }
        ]
      },
      {
        questionnaireID: 22,
        title: "電影與情感共鳴調查",
        status: "success",
        message: "阿說明說明說明說明說明說明說明說明 阿說明說明說明說明說明說明說明說明",
        startTime: "2027-03-01",
        endTime: "2028-11-30",
        question_status:false,
        questionVoList: [
          { questionId: 2401, question: "您平均多久看一次電影？", type: "single", required: true, options: ["每週一次以上", "每月幾次", "偶爾", "幾乎不看"] },
          { questionId: 2402, question: "您偏好在哪裡看電影？", type: "single", required: false, options: ["電影院", "串流平台", "電視", "其他"] },
          { questionId: 2403, question: "您最喜歡哪種類型的電影？（可複選）", type: "multiple", required: false, options: ["愛情", "動作", "驚悚", "動畫", "紀錄片"] },
          { questionId: 2404, question: "哪一部電影讓您印象最深刻？", type: "text", required: false, options: [] },
          { questionId: 2405, question: "您看電影時最重視哪一個元素？", type: "single", required: true, options: ["劇情", "演員", "畫面", "音樂"] },
          { questionId: 2406, question: "您是否會因電影原聲帶而重看某部片？", type: "single", required: false, options: ["會", "不會", "看情況"] },
          { questionId: 2407, question: "請描述一部讓您哭過的電影。", type: "text", required: false, options: [] }
        ]
      }
    ];
  }
  getAllQuestionnaires(): Observable<QuestionRes[]> {
    return this.questionnaires$.asObservable();
  }
  // 刪除問卷
  deleteQuestionnaires(ids: number[]): Observable<boolean> {
    this.questionnaireList = this.questionnaireList.filter(q => !ids.includes(q.questionnaireID));
    this.questionnaires$.next(this.questionnaireList); // 通知畫面更新
    console.log('目前剩餘問卷：', this.questionnaireList);
    return of(true);
  }
  // 新增問卷
  saveQuestionnaire(data: QuestionRes): Observable<boolean> {
    // 自動產生不重複 ID（用目前最大 ID + 1）
    const newId =
      this.questionnaireList.length > 0
        ? Math.max(...this.questionnaireList.map(q => q.questionnaireID)) + 1
        : 1;

    const newData = {
      ...data,
      questionnaireID: newId
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



  sampleLogins: LoginReq[] = [
    { email: 'alice@example.com',            password: '1234567' },
    { email: 'bob.wang@example.com',         password: 'BlueCar#42' },
    { email: 'chen.ling@example.com',        password: 'Ling2025$Ok' },
    { email: 'dev.user@example.com',         password: 'Dev_User!2024' },
    { email: 'test.account@example.com',     password: 'T3st!Acc#' }
  ];

  sampleUsers: UserInfo[] = [
    {
      id: 1,
      name: 'Alice Chen',
      email: 'alice@example.com',
      phone: '0912-345-678',
      birthDate: '1990-05-12',
      gender: 'female',
      admin:true,
    },
    {
      id: 2,
      name: 'Bob Wang',
      email: 'bob.wang@example.com',
      phone: '0923-456-789',
      birthDate: '1985-11-23',
      gender: 'male',
      admin:false,
    },
    {
      id: 3,
      name: 'Charlie Liu',
      email: 'charlie.liu@example.com',
      phone: '0934-567-890',
      birthDate: '1992-07-30',
      gender: 'male',
      admin:false,
    },
    {
      id: 4,
      name: 'Diana Ho',
      email: 'diana.ho@example.com',
      phone: '0945-678-901',
      birthDate: '1995-02-18',
      gender: 'female',
      admin:false,
    },
    {
      id: 5,
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
    questionnaireID:number, //問卷id
    title:string,
    status: string, //狀態（success / error）
    message: string, //提示訊息
    startTime:string,
    endTime:string,
    question_status:boolean,
    // timestamp: string, //回傳時間(yyyy-MM-dd)
    questionVoList: {  //題目清單資料，用於題目顯示
      questionId: number, //題目id
      question: string, //題目名稱
      type: string, //題目類型
      required: boolean, //是否必填
      options: Array<string>, //題目選項
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
  id: number;           // 使用者 ID
  name: string;         // 使用者姓名
  email: string;        // 使用者 Email
  phone?: string;       // 電話號碼（可選）
  birthDate?: string;   // 生日（可選，格式 YYYY-MM-DD）
  gender?: 'male' | 'female' | 'other'; // 性別（可選）
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
    title: string, //名稱
    description: string, //問卷說明
    startDate: string, //問卷開始時間(yyyy-MM-dd)
    endDate: string, //問卷結束時間(yyyy-MM-dd)
    published: boolean, //問卷 是否發佈
    questionList:   //題目內容
      {
          questionID:number,
          question: string, //題目名稱
          type: string, //題目類型
          required: boolean, //是否必填
          options: Array<string>, //題目選項
      }[],
}

// export interface SearchReq // (搜尋測驗或題目)
// {
//     quizName: string, //問卷的名稱
//     startDate: string, //問卷開始時間(yyyy-MM-dd)
//     endDate: string, //問卷結束時間(yyyy-MM-dd)
//     published: boolean, //問卷 是否發佈
// }
