// ข้อมูลจำลอง (ไม่ใช่ข้อมูลจริง) — แท็บ dict + แท็บ index
window.MOCK_DICT = [
 {id:"C-KH",type:"ประเทศ",canonical:"กัมพูชา",terms:["กัมพูชา","เขมร","cambodia"]},
 {id:"C-MM",type:"ประเทศ",canonical:"เมียนมา",terms:["เมียนมา","พม่า","myanmar"]},
 {id:"C-LA",type:"ประเทศ",canonical:"ลาว",terms:["ลาว","สปป.ลาว","laos"]},
 {id:"P-0001",type:"บุคคล",canonical:"นายสมชาย ตัวอย่าง",terms:["สมชาย","ผวจ.สมชาย"]},
 {id:"P-0002",type:"บุคคล",canonical:"นางสาวมาลี สมมติ",terms:["มาลี"]},
 {id:"P-0003",type:"บุคคล",canonical:"พ.อ.ทดสอบ ใจดี",terms:["ทดสอบ ใจดี","ผบ.ทดสอบ"]},
 {id:"O-0001",type:"องค์กร",canonical:"กองกำลังป้องกันชายแดน (จำลอง)",terms:["กกล.","กองกำลังชายแดน"]},
 {id:"O-0002",type:"องค์กร",canonical:"สำนักงานจังหวัด (จำลอง)",terms:["สนง.จังหวัด","ศาลากลาง"]},
 {id:"O-0003",type:"องค์กร",canonical:"ด่านศุลกากร (จำลอง)",terms:["ศุลกากร","ด่าน"]},
 {id:"L-0001",type:"สถานที่",canonical:"จุดผ่านแดนถาวรบ้านตัวอย่าง",terms:["บ้านตัวอย่าง","จุดผ่านแดน"]},
 {id:"L-0002",type:"สถานที่",canonical:"ตลาดชายแดนสมมติ",terms:["ตลาดชายแดน"]},
 {id:"L-0003",type:"สถานที่",canonical:"อำเภอลุ่มน้ำ (จำลอง)",terms:["ลุ่มน้ำ","น้ำท่วม"]}
];
window.MOCK_CATEGORIES=["ชายแดน","ความมั่นคง","สาธารณภัย/คมนาคม","ข่าวสาร/ข่าวลวง","ประชุม","เศรษฐกิจ/แรงงาน"];
const _A=(n)=>n.map(x=>({name:x,url:"#"}));
window.MOCK_INDEX = [
 {txt_id:"TXT-20251222-090",thread_id:"S-0009",status:"จบ",title:"สรุปสถานการณ์ชายแดนช่วงปลายปี 2568 (จำลอง)",summary:"ภาพรวมการผ่านแดนช่วงเทศกาลปีใหม่ ปริมาณเพิ่มขึ้นตามฤดูกาล ไม่มีเหตุรุนแรง",topic_date_from:"2025-12-22",topic_date_to:"2026-01-05",countries:["C-KH"],persons:[],orgs:["O-0001"],places:["L-0001"],source_groups:["กลุ่มข่าวชายแดน ตอ."],source_senders:["ผู้ส่ง ก."],category:"ชายแดน",keywords:["ปีใหม่"],txt_url:"#",ocr_used:false,attachments:[]},
 {txt_id:"TXT-20260315-040",thread_id:"S-0005",status:"จบ",title:"ประชุมประสานแรงงานต่างด้าว มี.ค. 69 (จำลอง)",summary:"ทบทวนมาตรการตรวจเอกสารแรงงานบริเวณตลาดชายแดน",topic_date_from:"2026-03-15",topic_date_to:"2026-03-15",countries:["C-MM"],persons:["P-0002"],orgs:["O-0003"],places:["L-0002"],source_groups:["กลุ่มประสานงานจังหวัด"],source_senders:["ผู้ส่ง ข."],category:"ประชุม",keywords:["แรงงาน"],txt_url:"#",ocr_used:false,attachments:[]},
 {txt_id:"TXT-20261028-001",thread_id:"S-0010",status:"ติดตาม",title:"สรุปสถานการณ์ชายแดนด้านตะวันออก ช่วงปลายเดือน ต.ค.",summary:"การเคลื่อนไหวบริเวณจุดผ่านแดนถาวร การค้าชายแดนกลับมาปกติ ไม่พบเหตุกระทบกระทั่ง",topic_date_from:"2026-10-26",topic_date_to:"2026-10-28",countries:["C-KH"],persons:["P-0003"],orgs:["O-0001"],places:["L-0001"],source_groups:["กลุ่มข่าวชายแดน ตอ."],source_senders:["ผู้ส่ง ก."],category:"ชายแดน",keywords:["การค้า"],txt_url:"#",ocr_used:false,attachments:[]},
 {txt_id:"TXT-20261029-002",thread_id:"S-0011",status:"ใหม่",title:"ภาพประกาศหน่วยงานท้องถิ่นเรื่องปิดถนนชั่วคราว",summary:"ถอดข้อความจากภาพประกาศ ปิดเส้นทาง 29–31 ต.ค. เพื่อซ่อมสะพาน แนะนำเส้นทางเลี่ยง",topic_date_from:"2026-10-29",topic_date_to:"2026-10-31",countries:[],persons:["P-0001"],orgs:["O-0002"],places:["L-0003"],source_groups:["กลุ่มประสานงานจังหวัด"],source_senders:["ผู้ส่ง ข."],category:"สาธารณภัย/คมนาคม",keywords:["ปิดถนน"],txt_url:"#",ocr_used:true,attachments:_A(["ประกาศปิดถนน.jpg"])},
 {txt_id:"TXT-20261030-003",thread_id:"S-0012",status:"ติดตาม",title:"ความเห็นสื่อสังคมออนไลน์ต่อการซ้อมรบร่วม",summary:"กระแสความเห็นส่วนใหญ่เป็นกลาง มีข่าวคลาดเคลื่อน 2 ประเด็นที่ควรชี้แจง",topic_date_from:"2026-10-30",topic_date_to:"2026-10-30",countries:["C-KH","C-LA"],persons:[],orgs:["O-0001"],places:[],source_groups:["กลุ่มเฝ้าระวังสื่อ"],source_senders:["ผู้ส่ง ค."],category:"ข่าวสาร/ข่าวลวง",keywords:["ซ้อมรบ"],txt_url:"#",ocr_used:false,attachments:[]},
 {txt_id:"TXT-20261030-004",thread_id:"S-0010",status:"ติดตาม",title:"รายงานประชุมติดตามสถานการณ์ประจำสัปดาห์",summary:"สรุปวาระ 4 เรื่อง พร้อมข้อสั่งการให้ติดตามประเด็นชายแดนและแรงงานต่างด้าว",topic_date_from:"2026-10-30",topic_date_to:"2026-10-30",countries:["C-KH","C-MM"],persons:["P-0001","P-0002"],orgs:["O-0002"],places:[],source_groups:["กลุ่มข่าวชายแดน ตอ.","กลุ่มประสานงานจังหวัด"],source_senders:["ผู้ส่ง ก."],category:"ประชุม",keywords:["ข้อสั่งการ"],txt_url:"#",ocr_used:true,attachments:_A(["สไลด์ประชุม.pdf"])},
 {txt_id:"TXT-20261031-005",thread_id:"S-0013",status:"ใหม่",title:"แจ้งเตือนอุทกภัยพื้นที่ลุ่มต่ำ",summary:"ระดับน้ำเพิ่มขึ้นต่อเนื่อง หน่วยในพื้นที่เตรียมเครื่องสูบน้ำและจุดอพยพ 3 แห่ง",topic_date_from:"2026-10-31",topic_date_to:"2026-11-01",countries:[],persons:["P-0001"],orgs:["O-0002"],places:["L-0003"],source_groups:["กลุ่มประสานงานจังหวัด"],source_senders:["ผู้ส่ง ข."],category:"สาธารณภัย/คมนาคม",keywords:["อพยพ"],txt_url:"#",ocr_used:false,attachments:_A(["ภาพระดับน้ำ.jpg"])},
 {txt_id:"TXT-20261101-006",thread_id:"S-0014",status:"ติดตาม",title:"ความเคลื่อนไหวแรงงานต่างด้าวบริเวณตลาดชายแดน",summary:"การเดินทางเข้าออกเพิ่มขึ้นช่วงวันหยุด เจ้าหน้าที่ตรวจเอกสารเข้มงวดขึ้น",topic_date_from:"2026-11-01",topic_date_to:"2026-11-01",countries:["C-MM"],persons:[],orgs:["O-0003"],places:["L-0002"],source_groups:["กลุ่มข่าวชายแดน ตอ."],source_senders:["ผู้ส่ง ง."],category:"เศรษฐกิจ/แรงงาน",keywords:["แรงงาน"],txt_url:"#",ocr_used:false,attachments:[]},
 {txt_id:"TXT-20261101-007",thread_id:"S-0012",status:"จบ",title:"ภาพหน้าจอข่าวลือเรื่องปิดด่าน (ตรวจสอบแล้วไม่จริง)",summary:"ถอดข้อความจากภาพหน้าจอที่ส่งต่อในกลุ่ม หน่วยงานยืนยันว่าด่านเปิดตามปกติ",topic_date_from:"2026-11-01",topic_date_to:"2026-11-02",countries:["C-KH"],persons:[],orgs:["O-0003"],places:["L-0001"],source_groups:["กลุ่มเฝ้าระวังสื่อ"],source_senders:["ผู้ส่ง ค."],category:"ข่าวสาร/ข่าวลวง",keywords:["ข่าวลือ"],txt_url:"#",ocr_used:true,attachments:_A(["screenshot.png"])}
];
window.MOCK_INBOX = {remaining:0,scenario:"ok"}; // พรีวิว: ?busy=1 | ?busy=timeout | ?busy=error
// ตัวชี้ทางใน index (จำลอง): txt_url / attachment_ids — หน้าเว็บใช้ตอนกด「รายละเอียด」เท่านั้น
window.MOCK_INDEX.forEach(r=>{r.txt_url=(r.txt_url&&r.txt_url!=="#")?r.txt_url:"mock://txt/"+r.txt_id+".txt";
 r.attachment_ids=r.attachment_ids||(r.attachments||[]).map((a,i)=>r.txt_id+"-A"+(i+1));});
