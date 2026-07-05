'use strict';
// ================================================================
//  TAIPEI METRO — Interactive Map  |  app.js
//  D3.js v7 · Standalone · © 2026 RailPulse / TaipeiScaffold
// ================================================================

// ════════════════════════════════════════════════════════════════
//  STATION DATA
//  Coordinate system: SVG 960 × 1280  (matches map image ratio)
//  type: 'regular' | 'terminal' | 'transfer'
// ════════════════════════════════════════════════════════════════
const STATIONS = {
  R28  : {e:'Tamsui', z:'淡水', x:115, y:62, ln:["R"], t:'station', km:0.0},
  R27  : {e:'Hongshulin', z:'紅樹林', x:128, y:98, ln:["R","V"], t:'main_station', km:0.0},
  R26  : {e:'Zhuwei', z:'竹圍', x:140, y:138, ln:["R"], t:'station', km:0.0},
  R25  : {e:'Guandu', z:'關渡', x:152, y:180, ln:["R"], t:'station', km:0.0},
  R24  : {e:'Zhongyi', z:'忠義', x:165, y:240, ln:["R"], t:'station', km:0.0},
  R23  : {e:'Fuxinggang', z:'復興崗', x:182, y:280, ln:["R"], t:'station', km:0.0},
  R22  : {e:'Beitou', z:'北投', x:238, y:318, ln:["R"], t:'main_station', km:0.0},
  R22A : {e:'Xinbeitou', z:'新北投', x:168, y:318, ln:["R"], t:'station', km:0.0},
  R21  : {e:'Qiyan', z:'奇岩', x:295, y:352, ln:["R"], t:'station', km:0.0},
  R20  : {e:"Qi'lian", z:'唭哩岸', x:322, y:382, ln:["R"], t:'station', km:0.0},
  R19  : {e:'Shipai', z:'石牌', x:345, y:412, ln:["R"], t:'station', km:0.0},
  R18  : {e:'Mingde', z:'明德', x:360, y:442, ln:["R"], t:'station', km:0.0},
  R17  : {e:'Zhishan', z:'芝山', x:372, y:472, ln:["R"], t:'station', km:0.0},
  R16  : {e:'Shilin', z:'士林', x:382, y:508, ln:["R"], t:'station', km:0.0},
  R15  : {e:'Jiantan', z:'劍潭', x:388, y:545, ln:["R"], t:'station', km:0.0},
  R14  : {e:'Yuanshan', z:'圓山', x:382, y:585, ln:["R"], t:'station', km:0.0},
  R13  : {e:'Minquan W. Rd.', z:'民權西路', x:372, y:625, ln:["R","O"], t:'main_station', km:0.0},
  R12  : {e:'Shuanglian', z:'雙連', x:365, y:660, ln:["R"], t:'station', km:0.0},
  R11  : {e:'Zhongshan', z:'中山', x:358, y:695, ln:["R","G"], t:'main_station', km:0.0},
  R10  : {e:'Taipei Main Station', z:'台北車站', x:352, y:730, ln:["R"], t:'main_station', km:0.0},
  BL12  : {e:'Taipei Main Station', z:'台北車站', x:352, y:730, ln:["BL","G"], t:'main_station', km:0.0},
  R09  : {e:'Beimen', z:'北門', x:308, y:730, ln:["R"], t:'station', km:0.0},
  R08  : {e:'Ximen', z:'西門', x:278, y:858, ln:["R"], t:'main_station', km:0.0},
  BL11  : {e:'Ximen', z:'西門', x:278, y:858, ln:["BL"], t:'main_station', km:0.0},
  R07  : {e:'Chiang Kai-shek Memorial', z:'中正紀念堂', x:345, y:858, ln:["R","G"], t:'main_station', km:0.0},
  R06  : {e:'Dongmen', z:'東門', x:412, y:858, ln:["R","O"], t:'main_station', km:0.0},
  R05  : {e:'Daan', z:'大安', x:479, y:858, ln:["R"], t:'station', km:0.0},
  R04  : {e:'Xinyi Anhe', z:'信義安和', x:546, y:858, ln:["R"], t:'station', km:0.0},
  R03  : {e:'Taipei 101 / WTC', z:'台北101/世貿', x:613, y:858, ln:["R"], t:'station', km:0.0},
  R02  : {e:'Xiangshan', z:'象山', x:680, y:858, ln:["R"], t:'station', km:0.0},
  BL01 : {e:'Dingpu', z:'頂埔', x:98, y:1150, ln:["BL"], t:'station', km:0.0},
  BL02 : {e:'Yongning', z:'永寧', x:120, y:1110, ln:["BL"], t:'station', km:0.0},
  BL03 : {e:'Tucheng', z:'土城', x:145, y:1072, ln:["BL"], t:'station', km:0.0},
  BL04 : {e:'Haishan', z:'海山', x:168, y:1035, ln:["BL"], t:'station', km:0.0},
  BL05 : {e:'Far Eastern Hospital', z:'亞東醫院', x:192, y:998, ln:["BL"], t:'station', km:0.0},
  BL06 : {e:'Fuzhong', z:'府中', x:205, y:980, ln:["BL"], t:'station', km:0.0},
  BL07 : {e:'Banqiao', z:'板橋', x:218, y:962, ln:["BL","Y"], t:'main_station', km:0.0},
  BL08 : {e:'Xinpu', z:'新埔', x:245, y:928, ln:["BL"], t:'station', km:0.0},
  BL09 : {e:'Jiangzicui', z:'江子翠', x:272, y:895, ln:["BL"], t:'station', km:0.0},
  BL10 : {e:'Longshan Temple', z:'龍山寺', x:262, y:840, ln:["BL"], t:'station', km:0.0},
  BL13 : {e:'Shandao Temple', z:'善導寺', x:408, y:730, ln:["BL"], t:'station', km:0.0},
  BL14 : {e:'Zhongxiao Xinsheng', z:'忠孝新生', x:462, y:730, ln:["BL","O"], t:'main_station', km:0.0},
  BL15 : {e:'Zhongxiao Fuxing', z:'忠孝復興', x:518, y:730, ln:["BL","BR"], t:'main_station', km:0.0},
  BL16 : {e:'Zhongxiao Dunhua', z:'忠孝敦化', x:572, y:730, ln:["BL"], t:'station', km:0.0},
  BL17 : {e:'Sun Yat-sen Memorial', z:'國父紀念館', x:625, y:730, ln:["BL"], t:'station', km:0.0},
  BL18 : {e:'Taipei City Hall', z:'市政府', x:678, y:730, ln:["BL"], t:'station', km:0.0},
  BL19 : {e:'Yongchun', z:'永春', x:718, y:730, ln:["BL"], t:'station', km:0.0},
  BL20 : {e:'Houshanpi', z:'後山埤', x:758, y:730, ln:["BL"], t:'station', km:0.0},
  BL21 : {e:'Kunyang', z:'昆陽', x:798, y:710, ln:["BL"], t:'station', km:0.0},
  BL22 : {e:'Nangang', z:'南港', x:830, y:688, ln:["BL"], t:'station', km:0.0},
  BL23 : {e:'Nangang Exh. Center', z:'南港展覽館', x:862, y:665, ln:["BL","BR"], t:'main_station', km:0.0},
  G18  : {e:'Songshan', z:'松山', x:620, y:648, ln:["G"], t:'station', km:0.0},
  G17  : {e:'Nanjing Sanmin', z:'南京三民', x:580, y:682, ln:["G"], t:'station', km:0.0},
  G16  : {e:'Taipei Arena', z:'台北小巨蛋', x:548, y:712, ln:["G"], t:'station', km:0.0},
  G15  : {e:'Nanjing Fuxing', z:'南京復興', x:515, y:712, ln:["G","BR"], t:'main_station', km:0.0},
  G14  : {e:'Songjiang Nanjing', z:'松江南京', x:480, y:712, ln:["G","O"], t:'main_station', km:0.0},
  G11  : {e:'Xiaonanmen', z:'小南門', x:305, y:765, ln:["G"], t:'station', km:0.0},
  G09  : {e:'Guting', z:'古亭', x:282, y:838, ln:["G","O"], t:'main_station', km:0.0},
  G08  : {e:'Taipower Building', z:'台電大樓', x:385, y:870, ln:["G"], t:'station', km:0.0},
  G07  : {e:'Gongguan', z:'公館', x:388, y:912, ln:["G"], t:'station', km:0.0},
  G06  : {e:'Wanlong', z:'萬隆', x:395, y:952, ln:["G"], t:'station', km:0.0},
  G05  : {e:'Jingmei', z:'景美', x:398, y:990, ln:["G"], t:'station', km:0.0},
  G03  : {e:'Qizhang', z:'七張', x:435, y:1048, ln:["G","Y"], t:'main_station', km:0.0},
  G04  : {e:'Xiaobitan', z:'小碧潭', x:365, y:1048, ln:["G"], t:'station', km:0.0},
  G02  : {e:'Xindian District Office', z:'新店區公所', x:462, y:1128, ln:["G"], t:'station', km:0.0},
  G01  : {e:'Xindian', z:'新店', x:472, y:1200, ln:["G"], t:'station', km:0.0},
  O01  : {e:'Nanshijiao', z:'南勢角', x:200, y:1090, ln:["O"], t:'station', km:0.0},
  O02  : {e:'Jingan', z:'景安', x:218, y:1052, ln:["O"], t:'station', km:0.0},
  O03  : {e:'Yongan Market', z:'永安市場', x:230, y:1018, ln:["O"], t:'station', km:0.0},
  O04  : {e:'Dingxi', z:'頂溪', x:242, y:982, ln:["O"], t:'station', km:0.0},
  O05  : {e:'Yonghe Senior HS', z:'永和高中', x:255, y:945, ln:["O"], t:'station', km:0.0},
  O08  : {e:'Xingtian Temple', z:'行天宮', x:445, y:628, ln:["O"], t:'station', km:0.0},
  O09  : {e:'Zhongshan Elem.', z:'中山國小', x:408, y:626, ln:["O"], t:'station', km:0.0},
  O10  : {e:'Daqiaotou', z:'大橋頭', x:272, y:622, ln:["O"], t:'station', km:0.0},
  O13  : {e:'Taipei Bridge', z:'台北橋', x:258, y:650, ln:["O"], t:'station', km:0.0},
  O14  : {e:'Cailiao', z:'菜寮', x:242, y:680, ln:["O"], t:'station', km:0.0},
  O15  : {e:'Sanchong', z:'三重', x:228, y:712, ln:["O"], t:'station', km:0.0},
  O16  : {e:'Xianse Temple', z:'先嗇宮', x:215, y:742, ln:["O"], t:'station', km:0.0},
  O17  : {e:'Toupianzhhuang', z:'頭前庄', x:202, y:768, ln:["O"], t:'station', km:0.0},
  O18  : {e:'Xinzhuang', z:'新莊', x:190, y:798, ln:["O"], t:'station', km:0.0},
  O19  : {e:'Fu Jen University', z:'輔大', x:178, y:828, ln:["O"], t:'station', km:0.0},
  O20  : {e:'Danfeng', z:'丹鳳', x:168, y:858, ln:["O"], t:'station', km:0.0},
  O21  : {e:'Huilong', z:'迴龍', x:155, y:892, ln:["O"], t:'station', km:0.0},
  O50  : {e:'Sanchong Elem.', z:'三重國小', x:178, y:585, ln:["O"], t:'station', km:0.0},
  O51  : {e:'Sanhe Jr. HS', z:'三和國中', x:168, y:550, ln:["O"], t:'station', km:0.0},
  O52  : {e:'St. Ignatius HS', z:'徐匯中學', x:158, y:515, ln:["O"], t:'station', km:0.0},
  O53  : {e:'Sanmin Sr. HS', z:'三民高中', x:145, y:478, ln:["O"], t:'station', km:0.0},
  O54  : {e:'Luzhou', z:'蘆洲', x:128, y:438, ln:["O"], t:'station', km:0.0},
  BR01 : {e:'Taipei Zoo', z:'動物園', x:895, y:1100, ln:["BR","MK"], t:'station', km:0.0},
  BR02 : {e:'Muzha', z:'木柵', x:872, y:1060, ln:["BR"], t:'station', km:0.0},
  BR03 : {e:'Wanfang Hospital', z:'萬芳醫院', x:848, y:1022, ln:["BR"], t:'station', km:0.0},
  BR04 : {e:'Wanfang Community', z:'萬芳社區', x:820, y:988, ln:["BR"], t:'station', km:0.0},
  BR05 : {e:'Xinhai', z:'辛亥', x:792, y:958, ln:["BR"], t:'station', km:0.0},
  BR06 : {e:'Linguang', z:'麟光', x:762, y:928, ln:["BR"], t:'station', km:0.0},
  BR07 : {e:'Liuzhangli', z:'六張犁', x:728, y:900, ln:["BR"], t:'station', km:0.0},
  BR08 : {e:'Technology Building', z:'科技大樓', x:698, y:872, ln:["BR"], t:'station', km:0.0},
  BR09 : {e:'Daan (Wenhu)', z:'大安', x:652, y:848, ln:["BR"], t:'station', km:0.0},
  BR12 : {e:'Zhongshan Jr. HS', z:'中山國中', x:530, y:685, ln:["BR"], t:'station', km:0.0},
  BR13 : {e:'Songshan Airport', z:'松山機場', x:575, y:640, ln:["BR"], t:'station', km:0.0},
  BR14 : {e:'Dazhi', z:'大直', x:615, y:608, ln:["BR"], t:'station', km:0.0},
  BR15 : {e:'Jiannan Rd.', z:'劍南路', x:658, y:572, ln:["BR"], t:'station', km:0.0},
  BR16 : {e:'Xihu', z:'西湖', x:700, y:548, ln:["BR"], t:'station', km:0.0},
  BR17 : {e:'Gangqian', z:'港墘', x:742, y:535, ln:["BR"], t:'station', km:0.0},
  BR18 : {e:'Wende', z:'文德', x:780, y:525, ln:["BR"], t:'station', km:0.0},
  BR19 : {e:'Neihu', z:'內湖', x:818, y:520, ln:["BR"], t:'station', km:0.0},
  BR20 : {e:'Dahu Park', z:'大湖公園', x:852, y:510, ln:["BR"], t:'station', km:0.0},
  BR21 : {e:'Huzhou', z:'葫洲', x:870, y:532, ln:["BR"], t:'station', km:0.0},
  BR22 : {e:'Donghu', z:'東湖', x:878, y:558, ln:["BR"], t:'station', km:0.0},
  BR23 : {e:'Nangang Software Park', z:'南港軟體園區', x:870, y:610, ln:["BR"], t:'station', km:0.0},
  Y01  : {e:'New Taipei Industrial Pk', z:'新北產業園區', x:92, y:720, ln:["Y"], t:'station', km:0.0},
  Y02  : {e:'Xinfu', z:'幸福', x:112, y:752, ln:["Y"], t:'station', km:0.0},
  Y03  : {e:'Taishan', z:'泰山', x:130, y:778, ln:["Y"], t:'station', km:0.0},
  Y04  : {e:'Taishan-Guihe', z:'泰山貴和', x:148, y:806, ln:["Y"], t:'station', km:0.0},
  Y05  : {e:'Xinzhuang Hub', z:'新莊副都心', x:162, y:832, ln:["Y"], t:'station', km:0.0},
  Y10  : {e:'Xinpu-Minsheng', z:'新埔民生', x:190, y:898, ln:["Y"], t:'station', km:0.0},
  Y12  : {e:'Zhongyuan', z:'中原', x:358, y:1010, ln:["Y"], t:'station', km:0.0},
  Y13  : {e:'Zhonghe', z:'中和', x:385, y:1030, ln:["Y"], t:'station', km:0.0},
  Y14  : {e:'Jing-an (Y)', z:'景安', x:408, y:1052, ln:["Y"], t:'station', km:0.0},
  Y15  : {e:'Jingan (Y)', z:'景安', x:432, y:1075, ln:["Y"], t:'station', km:0.0},
  Y16  : {e:'Jingping', z:'景平', x:452, y:1098, ln:["Y"], t:'station', km:0.0},
  Y17  : {e:'Xiulang Bridge', z:'秀朗橋', x:480, y:1118, ln:["Y"], t:'station', km:0.0},
  Y18  : {e:'Shizhang', z:'十四張', x:495, y:1140, ln:["Y"], t:'station', km:0.0},
  Y19  : {e:'Dapinglin', z:'大坪林', x:518, y:1092, ln:["Y"], t:'station', km:0.0},
  V11  : {e:'Shazun', z:'沙崙', x:45, y:15, ln:["V"], t:'station', km:0.0},
  V10  : {e:'Kanding', z:'崁頂', x:62, y:38, ln:["V"], t:'station', km:0.0},
  V09  : {e:'Danhai', z:'淡海', x:78, y:58, ln:["V"], t:'station', km:0.0},
  V08  : {e:'Xinshi 1st Rd.', z:'新市一路', x:90, y:78, ln:["V"], t:'station', km:0.0},
  V07  : {e:'Danhai New Town', z:'淡海新市鎮', x:100, y:98, ln:["V"], t:'station', km:0.0},
  V06  : {e:'Xinshi 3rd Rd.', z:'新市三路', x:108, y:118, ln:["V"], t:'station', km:0.0},
  V05  : {e:'Tamsui Admin. Ctr.', z:'淡水行政中心', x:116, y:138, ln:["V"], t:'station', km:0.0},
  V04  : {e:'Tamsui Culture Univ.', z:'台灣大學海洋', x:122, y:158, ln:["V"], t:'station', km:0.0},
  V03  : {e:'Danjiang University', z:'淡江大學', x:126, y:178, ln:["V"], t:'station', km:0.0},
  V02  : {e:'Ganzhenlin', z:'竿蓁林', x:128, y:198, ln:["V"], t:'station', km:0.0},
  V01  : {e:'Hongshulin (V)', z:'紅樹林', x:128, y:218, ln:["V"], t:'station', km:0.0},
  K01  : {e:'Shizhang (K)', z:'十四張', x:490, y:1140, ln:["K"], t:'station', km:0.0},
  K02  : {e:'Shuangcheng', z:'雙城', x:498, y:1162, ln:["K"], t:'station', km:0.0},
  K03  : {e:'Rose China Town', z:'玫瑰中國城', x:505, y:1185, ln:["K"], t:'station', km:0.0},
  K04  : {e:'Taipei Xiaocheng', z:'台北小城', x:512, y:1208, ln:["K"], t:'station', km:0.0},
  K05  : {e:'Cardinal Tien Hospital', z:'耕莘醫院', x:518, y:1228, ln:["K"], t:'station', km:0.0},
  K06  : {e:'Ankeng', z:'安坑', x:525, y:1248, ln:["K"], t:'station', km:0.0},
  MK02 : {e:'Zoo South', z:'動物園南站', x:908, y:1140, ln:["MK"], t:'station', km:0.0},
  MK03 : {e:'Zhinan Temple', z:'指南宮', x:920, y:1175, ln:["MK"], t:'station', km:0.0},
  MK04 : {e:'Maokong', z:'貓空', x:932, y:1210, ln:["MK"], t:'station', km:0.0},
};

// ════════════════════════════════════════════════════════════════
//  LINE DEFINITIONS
//  stations: ordered ID list for path rendering
//  branches: [{from, stations}]  – rendered as separate path segments
// ════════════════════════════════════════════════════════════════
const LINES = [
  { id:'R',  e:'Tamsui-Xinyi Line',      z:'淡水信義線', color:'#E3002C',
    stations:['R28','R27','R26','R25','R24','R23','R22','R21','R20','R19','R18','R17','R16','R15','R14','R13','R12','R11','R10','R09','R08','R07','R06','R05','R04','R03','R02'],
    branches:[{from:'R22', stations:['R22A']}] },

  { id:'BL', e:'Bannan Line',            z:'板南線',     color:'#0070BD',
    stations:['BL23','BL22','BL21','BL20','BL19','BL18','BL17','BL16','BL15','BL14','BL13','BL12','BL11','BL10','BL09','BL08','BL07','BL06','BL05','BL04','BL03','BL02','BL01'],
    branches:[] },

  { id:'G',  e:'Songshan-Xindian Line',  z:'松山新店線', color:'#008659',
    stations:['G18','G17','G16','G15','G14','R11','BL12','G11','R07','G09','G08','G07','G06','G05','G03','G02','G01'],
    branches:[{from:'G03', stations:['G04']}] },

  { id:'O',  e:'Zhonghe-Xinlu Line',     z:'中和新蘆線', color:'#F8A500',
    // Main spine: Luzhou → east → south → Nanshijiao
    stations:['O54','O52','O51','O50','O53','O14','O13','O10','R13','O09','O08','G14','BL14','R06','G09','O05','O04','O03','O02','O01'],
    // Huilong branch off Daqiaotou (O14)
    branches:[{from:'O14', stations:['O15','O16','O17','O18','O19','O20','O21']}] },

  { id:'BR', e:'Wenhu Line',             z:'文湖線',     color:'#C48A00',
    stations:['BR01','BR02','BR03','BR04','BR05','BR06','BR07','BR08','BR09','BL15','G15','BR12','BR13','BR14','BR15','BR16','BR17','BR18','BR19','BR20','BR21','BR22','BR23','BL23'],
    branches:[] },

  { id:'Y',  e:'Circular Line',          z:'環狀線',     color:'#FFCB00',
    stations:['Y01','Y02','Y03','Y04','Y05','Y10','BL07','Y12','Y13','Y14','Y15','Y16','Y17','Y18','G03'],
    branches:[{from:'Y18', stations:['Y19']}] },

  { id:'V',  e:'Danhai LRT',             z:'淡海輕軌',   color:'#00ABDE',
    stations:['R27','V01','V02','V03','V04','V05','V06','V07','V08','V09','V10','V11'],
    branches:[] },

  { id:'K',  e:'Ankeng LRT',             z:'安坑輕軌',   color:'#A0785A',
    stations:['K01','K02','K03','K04','K05','K06'],
    branches:[] },

  { id:'MK', e:'Maokong Gondola',        z:'貓空纜車',   color:'#7B5B3A', dashed:true,
    stations:['BR01','MK02','MK03','MK04'],
    branches:[] },
];

// ════════════════════════════════════════════════════════════════
//  D3.js SETUP
// ════════════════════════════════════════════════════════════════
const SVG_W = 960, SVG_H = 1280;
let curZoom = d3.zoomIdentity;
let routeActive = false;
let routeFrom = null, routeTo = null, routeSelectMode = null;
const graph = {};  // adjacency list for Dijkstra

// Create SVG
const svg = d3.select('#map-container')
  .append('svg')
  .attr('id','map-svg')
  .attr('viewBox',`0 0 ${SVG_W} ${SVG_H}`)
  .attr('preserveAspectRatio','xMidYMid meet');

// Add inline stylesheet inside SVG for standalone rendering compatibility
svg.append('style').text(`
  #map-svg { background: radial-gradient(ellipse at 40% 35%, #0d1528 0%, #050911 100%); }
  .line-path { stroke-linecap: round; stroke-linejoin: round; transition: stroke-width .18s ease, opacity .18s ease; cursor: pointer; }
  .station-group { cursor: pointer; }
  .station-label { font-family: 'Inter', 'Noto Sans TC', sans-serif; pointer-events: none; user-select: none; }
  .lbl-en { font-size: 7px; font-weight: 500; fill: #cdd5e2; }
  .lbl-zh { font-size: 6.5px; fill: #6b7590; }
  .tt-dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }
`);

// ── Defs: Glow Filters ───────────────────────────────────────────
const defs = svg.append('defs');
function addGlow(id, blur) {
  const f = defs.append('filter').attr('id',id)
    .attr('x','-60%').attr('y','-60%').attr('width','220%').attr('height','220%');
  f.append('feGaussianBlur').attr('in','SourceGraphic').attr('stdDeviation',blur).attr('result','blur');
  const m = f.append('feMerge');
  m.append('feMergeNode').attr('in','blur');
  m.append('feMergeNode').attr('in','SourceGraphic');
}
addGlow('glow-soft', 3);
addGlow('glow-strong', 6);

// ── Layer Groups ─────────────────────────────────────────────────
const svgEl = d3.select('#map-svg');
const mapG = svgEl.append('g').attr('id', 'map-g');
const bgMap = mapG.append('g').attr('id', 'bg-map');
const linesG = mapG.append('g').attr('id', 'lines-g');
const stnsG = mapG.append('g').attr('id', 'stations-g');
const labelsG = mapG.append('g').attr('id', 'labels-g');
const hiddenLines = new Set();

// Render original background image (initially hidden)
bgMap.append('image')
  .attr('id', 'bg-map-image')
  .attr('href', 'Taipei_Metro_official_map_optimised.png')
  .attr('x', 0)
  .attr('y', 0)
  .attr('width', SVG_W)
  .attr('height', SVG_H)
  .attr('opacity', 0.5)
  .attr('display', 'none');

// ── Zoom ─────────────────────────────────────────────────────────
const zoom = d3.zoom()
  .scaleExtent([0.2, 14])
  .on('zoom', ev => {
    curZoom = ev.transform;
    mapG.attr('transform', ev.transform);
    updateLabelVis(ev.transform.k);
  });

let clusterOffsets = {};

function computeClusterOffsets() {
  clusterOffsets = {};
  const coordsMap = {};
  allStnIds().forEach(id => {
    const s = getStn(id);
    if (!s || s.t !== 'main_station') return;
    const key = `${s.x},${s.y}`;
    if (!coordsMap[key]) coordsMap[key] = [];
    coordsMap[key].push(id);
  });
  
  for (const key in coordsMap) {
    const cluster = coordsMap[key];
    if (cluster.length > 1) {
      cluster.sort();
      const spacing = 19; // width is 18, so slightly spaced
      cluster.forEach((id, idx) => {
        clusterOffsets[id] = (idx - (cluster.length - 1) / 2) * spacing;
      });
    }
  }
}

svg.call(zoom).on('dblclick.zoom', resetView);

// ════════════════════════════════════════════════════════════════
//  HELPERS
// ════════════════════════════════════════════════════════════════
function getStn(id)  { return STATIONS[id]; }
function getLine(id) { return LINES.find(l => l.id === id); }
function lineColor(id) { const l = getLine(id); return l ? l.color : '#888'; }
function stnColor(s)   { return lineColor(s.ln[0]); }

function parseStationId(id) {
  const match = id.match(/^([a-zA-Z]+)(\d+.*)$/);
  return match ? { prefix: match[1], suffix: match[2] } : { prefix: id, suffix: '' };
}

function allStnIds() {
  const set = new Set();
  LINES.forEach(ln => {
    ln.stations.forEach(id => set.add(id));
    (ln.branches||[]).forEach(b => b.stations.forEach(id => set.add(id)));
  });
  return set;
}


// ════════════════════════════════════════════════════════════════
//  RENDER LINES
// ════════════════════════════════════════════════════════════════
function renderLines() {
  const lineGen = d3.line()
    .x(id => getStn(id).x)
    .y(id => getStn(id).y)
    .curve(d3.curveLinear);

  LINES.forEach(ln => {
    const grp = linesG.append('g')
      .attr('class',`lg lg-${ln.id}`)
      .attr('data-lid', ln.id);

    function drawPath(ids) {
      if (ids.length < 2) return;
      grp.append('path')
        .datum(ids)
        .attr('class',`line-path lp-${ln.id}`)
        .attr('d', lineGen)
        .attr('stroke', ln.color)
        .attr('stroke-width', 5.5)
        .attr('stroke-dasharray', ln.dashed ? '9,6' : null)
        .attr('fill','none')
        .attr('stroke-linecap','round')
        .attr('stroke-linejoin','round')
        .on('mouseenter', () => highlightLine(ln.id))
        .on('mouseleave', clearHighlights);
    }

    drawPath(ln.stations);
    (ln.branches||[]).forEach(b => drawPath([b.from, ...b.stations]));
  });
}

function updatePaths() {
  const lineGen = d3.line()
    .x(id => getStn(id).x)
    .y(id => getStn(id).y)
    .curve(d3.curveLinear);
  linesG.selectAll('.line-path').attr('d', lineGen);
}

// ════════════════════════════════════════════════════════════════
//  RENDER STATIONS
// ════════════════════════════════════════════════════════════════
function drawStationMarker(grp, id, s, pc) {
  grp.selectAll('*').remove();
  
  const { prefix, suffix } = parseStationId(id);
  const isMain = s.t === 'main_station';
  const cx = clusterOffsets[id] || 0;
  
  const w = isMain ? 18 : 14;
  const h = isMain ? 22 : 19;
  const rx = isMain ? 3.0 : 2.0;
  const strokeWidth = isMain ? 2.5 : 1.6;
  
  grp.append('rect')
    .attr('x', cx - w / 2)
    .attr('y', -h / 2)
    .attr('width', w)
    .attr('height', h)
    .attr('rx', rx)
    .attr('ry', rx)
    .attr('fill', isMain ? pc : 'white')
    .attr('stroke', pc)
    .attr('stroke-width', strokeWidth);
    
  grp.append('text')
    .attr('class', 'stn-code-prefix')
    .attr('x', cx)
    .attr('y', isMain ? -4.0 : -3.5)
    .attr('text-anchor', 'middle')
    .attr('dominant-baseline', 'central')
    .attr('fill', isMain ? 'white' : '#111827')
    .attr('font-size', isMain ? '7.0px' : '6.0px')
    .attr('font-weight', 'bold')
    .attr('font-family', "'Inter', sans-serif")
    .text(prefix);

  grp.append('text')
    .attr('class', 'stn-code-suffix')
    .attr('x', cx)
    .attr('y', isMain ? 4.0 : 3.5)
    .attr('text-anchor', 'middle')
    .attr('dominant-baseline', 'central')
    .attr('fill', isMain ? 'white' : '#111827')
    .attr('font-size', isMain ? '7.0px' : '6.0px')
    .attr('font-weight', 'bold')
    .attr('font-family', "'Inter', sans-serif")
    .text(suffix);
}

function renderStations() {
  const dragBehavior = d3.drag()
    .on('start', function(ev) {
      d3.select(this).raise();
      this.__moved = false;
    })
    .on('drag', function(ev, id) {
      this.__moved = true;
      const s = getStn(id);
      if (!s) return;
      s.x = Math.round(ev.x);
      s.y = Math.round(ev.y);
      
      clusterOffsets[id] = 0;
      drawStationMarker(d3.select(this), id, s, stnColor(s));
      
      // Update station group position (keep scale 1.25 while dragging)
      d3.select(this).attr('transform', `translate(${s.x},${s.y}) scale(1.25)`);
      
      // Update label group position
      d3.select(`.lbl-grp.lg-${id}`).attr('transform', `translate(${s.x},${s.y})`);
      
      // Update line paths
      updatePaths();
    })
    .on('end', function(ev, id) {
      if (!this.__moved) return;
      const s = getStn(id);
      console.log(`"${id}": {e:'${s.e}', z:'${s.z}', x:${s.x}, y:${s.y}, ln:${JSON.stringify(s.ln)}, t:'${s.t}', km:${s.km}},`);
      saveStationsToLocalStorage();
      saveStationToServer(id, s.x, s.y);
      computeClusterOffsets();
      stnsG.selectAll('*').remove();
      labelsG.selectAll('*').remove();
      renderStations();
      renderLabels();
    });

  allStnIds().forEach(id => {
    const s = getStn(id);
    if (!s || s.t === 'waypoint') return;
    const pc        = stnColor(s);

    const grp = stnsG.append('g')
      .datum(id)
      .attr('class', `station-group sg-${id}`)
      .attr('transform', `translate(${s.x},${s.y})`)
      .attr('data-sid', id)
      .on('mouseenter', ev => onStnEnter(ev, id))
      .on('mouseleave', onStnLeave)
      .on('click',      ev => onStnClick(ev, id))
      .call(dragBehavior);

    drawStationMarker(grp, id, s, pc);
  });
}

// ════════════════════════════════════════════════════════════════
//  RENDER LABELS
// ════════════════════════════════════════════════════════════════
function renderLabels() {
  allStnIds().forEach(id => {
    const s = getStn(id);
    if (!s || !s.e) return;

    const leftSide = s.x < 500;
    const dx = leftSide ? -15 : 15;
    const anchor = leftSide ? 'end' : 'start';

    const cx = clusterOffsets[id] || 0;
    const grp = labelsG.append('g')
      .attr('class',`lbl-grp lg-${id}`)
      .attr('transform',`translate(${s.x + cx},${s.y})`);

    grp.append('text').attr('class','station-label lbl-en')
      .attr('x',dx).attr('y',-2)
      .attr('text-anchor',anchor)
      .attr('fill','#cdd5e2').attr('font-size','7px').attr('font-weight','500')
      .text(s.e);

    grp.append('text').attr('class','station-label lbl-zh')
      .attr('x',dx).attr('y',7)
      .attr('text-anchor',anchor)
      .attr('fill','#6b7590').attr('font-size','6.5px')
      .attr('font-family','Noto Sans TC, sans-serif')
      .text(s.z);
  });
  updateLabelVis(1);
}

function updateLabelVis(scale) {
  labelsG.selectAll('.lbl-en').attr('display', scale >= 1.5 ? null : 'none');
  labelsG.selectAll('.lbl-zh').attr('display', scale >= 2.5 ? null : 'none');
}

// ════════════════════════════════════════════════════════════════
//  INTERACTIONS — Line hover
// ════════════════════════════════════════════════════════════════
function highlightLine(lid) {
  if (routeActive || hiddenLines.has(lid)) return;
  linesG.selectAll('.line-path')
    .transition().duration(160)
    .attr('opacity', function() { return this.classList.contains(`lp-${lid}`) ? 1 : 0.08; })
    .attr('stroke-width', function() { return this.classList.contains(`lp-${lid}`) ? 9 : 5.5; });
  linesG.selectAll(`.lp-${lid}`).attr('filter','url(#glow-soft)');

  stnsG.selectAll('.station-group').each(function() {
    const sid = this.getAttribute('data-sid');
    const s = getStn(sid);
    const on = s && s.ln.includes(lid);
    d3.select(this).selectAll('rect,text')
      .transition().duration(160)
      .attr('opacity', on ? 1 : 0.15);
  });

  labelsG.selectAll('.lbl-grp')
    .attr('opacity', function() {
      const cls = this.getAttribute('class') || '';
      const sid = (cls.match(/lg-(\S+)/) || [])[1];
      const s = sid && getStn(sid);
      return s && s.ln.includes(lid) ? 1 : 0.1;
    });
}

function clearHighlights() {
  if (routeActive) return;
  linesG.selectAll('.line-path')
    .transition().duration(200)
    .attr('opacity',1).attr('stroke-width',5.5).attr('filter',null);
  stnsG.selectAll('.station-group').selectAll('rect,text').transition().duration(200).attr('opacity',1);
  labelsG.selectAll('.lbl-grp').attr('opacity',1);
}

// ════════════════════════════════════════════════════════════════
//  INTERACTIONS — Station hover / click
// ════════════════════════════════════════════════════════════════
function onStnEnter(ev, id) {
  const s = getStn(id);
  if (!s) return;
  showTooltip(ev, id, s);
  d3.select(`.sg-${id}`)
    .transition().duration(120)
    .attr('transform', `translate(${s.x},${s.y}) scale(1.25)`);
}

function onStnLeave() {
  hideTooltip();
  stnsG.selectAll('.station-group')
    .transition().duration(120)
    .attr('transform', function(id) {
      const s = getStn(id);
      return s ? `translate(${s.x},${s.y}) scale(1)` : null;
    });
}

function onStnClick(ev, id) {
  if (ev.defaultPrevented) return;
  ev.stopPropagation();
  if (routeSelectMode) {
    setRouteStation(id);
  } else {
    showInfoPanel(id);
  }
}

// ════════════════════════════════════════════════════════════════
//  TOOLTIP
// ════════════════════════════════════════════════════════════════
const tip = document.getElementById('tooltip');

function showTooltip(ev, id, s) {
  const dots = (s.ln||[]).map(lid =>
    `<span class="tt-dot" style="background:${lineColor(lid)}"></span>`
  ).join('');
  const kmText = s.km !== undefined ? `<div class="tt-km">Km ${(s.km || 0).toFixed(3)}</div>` : '';
  tip.innerHTML = `<div class="tt-en">${s.e}</div><div class="tt-zh">${s.z}</div><div class="tt-id">${id}</div>${kmText}<div class="tt-lines">${dots}</div>`;
  tip.classList.add('show');
  moveTip(ev);
}
function moveTip(ev) {
  const mx = ev.clientX, my = ev.clientY;
  const vw = window.innerWidth, vh = window.innerHeight;
  const tw = 180, th = 90;
  tip.style.left = (mx + 15 + tw > vw ? mx - tw - 10 : mx + 15) + 'px';
  tip.style.top  = (my - 10 + th > vh ? my - th - 5  : my - 10) + 'px';
}
function hideTooltip() { tip.classList.remove('show'); }

// ════════════════════════════════════════════════════════════════
//  INFO PANEL
// ════════════════════════════════════════════════════════════════
function showInfoPanel(id) {
  const s = getStn(id);
  if (!s) return;
  const badges = (s.ln||[]).map(lid => {
    const l = getLine(lid);
    return l ? `<span class="ip-badge" style="background:${l.color}">${l.e}</span>` : '';
  }).join('');
  
  document.getElementById('info-content').innerHTML = `
    <div class="ip-edit-row">
      <span class="ip-edit-label">Station ID</span>
      <input type="text" id="ip-id-input" value="${id}" onchange="updateStationId('${id}', this.value)" style="font-weight:bold; color:var(--accent);">
    </div>
    <div class="ip-name-en" style="margin-top:8px">${s.e}</div>
    <div class="ip-name-zh">${s.z}</div>
    <div class="ip-lines">${badges}</div>
    
    <div class="ip-edit-row">
      <span class="ip-edit-label">Name (EN)</span>
      <input type="text" id="ip-name-en-input" value="${s.e}" oninput="updateStationMeta('${id}', 'e', this.value)">
    </div>

    <div class="ip-edit-row">
      <span class="ip-edit-label">Name (ZH)</span>
      <input type="text" id="ip-name-zh-input" value="${s.z}" oninput="updateStationMeta('${id}', 'z', this.value)">
    </div>

    <div class="ip-edit-row">
      <span class="ip-edit-label">Lines</span>
      <input type="text" id="ip-lines-input" value="${(s.ln||[]).join(',')}" onchange="updateStationMeta('${id}', 'ln', this.value)">
    </div>
    
    <div class="ip-edit-row">
      <span class="ip-edit-label">Type</span>
      <select id="ip-type-select" onchange="updateStationType('${id}', this.value)">
        <option value="station" ${s.t === 'station' ? 'selected' : ''}>Station</option>
        <option value="main_station" ${s.t === 'main_station' ? 'selected' : ''}>Main Station</option>
      </select>
    </div>
    
    <div class="ip-edit-row">
      <span class="ip-edit-label">Km Position</span>
      <input type="number" step="0.001" id="ip-km-input" value="${(s.km || 0).toFixed(3)}" oninput="updateStationKm('${id}', this.value)">
    </div>
    
    <button class="ip-route-btn" onclick="setRouteFromPanel('${id}')">Use in Route ↗</button>
  `;
  document.getElementById('info-panel').classList.add('visible');
}

function updateStationId(oldId, newIdStr) {
  const newId = newIdStr.trim();
  if (!newId || newId === oldId) return;
  if (STATIONS[newId]) {
    alert('Station ID ' + newId + ' already exists!');
    document.getElementById('ip-id-input').value = oldId;
    return;
  }
  
  STATIONS[newId] = STATIONS[oldId];
  delete STATIONS[oldId];
  
  LINES.forEach(ln => {
    const idx = ln.stations.indexOf(oldId);
    if (idx !== -1) ln.stations[idx] = newId;
    (ln.branches||[]).forEach(b => {
      if (b.from === oldId) b.from = newId;
      const bIdx = b.stations.indexOf(oldId);
      if (bIdx !== -1) b.stations[bIdx] = newId;
    });
  });
  
  saveStationsToLocalStorage();
  saveLinesToLocalStorage();
  
  linesG.selectAll('*').remove();
  stnsG.selectAll('*').remove();
  labelsG.selectAll('*').remove();
  
  Object.keys(graph).forEach(k => delete graph[k]);
  buildGraph();
  
  renderLines();
  renderStations();
  renderLabels();
  
  showInfoPanel(newId);
}

function updateStationType(id, type) {
  const s = getStn(id);
  if (!s) return;
  
  s.t = type;
  
  const grp = d3.select(`.sg-${id}`);
  const pc = stnColor(s);
  drawStationMarker(grp, id, s, pc);
  
  saveStationsToLocalStorage();
}

function updateStationMeta(id, field, val) {
  const s = getStn(id);
  if (!s) return;
  if (field === 'ln') {
    s.ln = val.split(',').map(l => l.trim()).filter(l => l);
    const grp = d3.select(`.sg-${id}`);
    const pc = stnColor(s);
    drawStationMarker(grp, id, s, pc);
  } else {
    s[field] = val;
    if (field === 'e') d3.select(`.lbl-grp.lg-${id} .lbl-en`).text(s.e);
    if (field === 'z') d3.select(`.lbl-grp.lg-${id} .lbl-zh`).text(s.z);
  }
  saveStationsToLocalStorage();
}

function updateStationKm(id, kmVal) {
  const s = getStn(id);
  if (!s) return;
  s.km = parseFloat(kmVal) || 0.0;
  saveStationsToLocalStorage();
}

function saveStationsToLocalStorage() {
  localStorage.setItem('taipei_mrt_stations_full', JSON.stringify(STATIONS));
}

function saveLinesToLocalStorage() {
  localStorage.setItem('taipei_mrt_lines', JSON.stringify(LINES));
}

function saveStationToServer(id, x, y) {
  fetch('/api/save-station', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, x, y })
  })
  .then(res => res.json())
  .then(data => {
    console.log('Successfully saved station position to disk:', data);
  })
  .catch(err => {
    console.warn('Failed to save station position to disk (running standalone?):', err);
  });
}

function closeInfo() {
  document.getElementById('info-panel').classList.remove('visible');
}

function setRouteFromPanel(id) {
  closeInfo();
  if (!routeFrom) { setRouteStation(id); activateRouteSelect('to'); }
  else            { setRouteStation(id); }
}


//  SEARCH
// ════════════════════════════════════════════════════════════════
(function initSearch() {
  const input = document.getElementById('search-input');
  input.addEventListener('input', function() {
    const q = this.value.trim().toLowerCase();
    renderSR(q ? search(q) : []);
  });
})();

function search(q) {
  return Object.entries(STATIONS)
    .filter(([id,s]) => s.e && (s.e.toLowerCase().includes(q) || s.z.includes(q) || id.toLowerCase().includes(q)))
    .slice(0, 12)
    .map(([id,s]) => ({id, ...s}));
}

function renderSR(results) {
  const c = document.getElementById('search-results');
  if (!results.length) { c.innerHTML = ''; return; }
  c.innerHTML = results.map(r =>
    `<div class="sr-item" onclick="flyTo('${r.id}')">
      <span class="sr-code" style="background:${lineColor(r.ln[0])}">${r.id}</span>
      <div class="sr-names"><div class="sr-en">${r.e}</div><div class="sr-zh">${r.z}</div></div>
    </div>`
  ).join('');
}

function flyTo(id) {
  const s = getStn(id);
  if (!s) return;
  document.getElementById('search-input').value = '';
  document.getElementById('search-results').innerHTML = '';
  const cw = document.getElementById('map-container').clientWidth;
  const ch = document.getElementById('map-container').clientHeight;
  const sc = 3.5;
  svg.transition().duration(650).ease(d3.easeCubicInOut)
    .call(zoom.transform, d3.zoomIdentity
      .translate(cw/2 - sc*s.x, ch/2 - sc*s.y).scale(sc));
  setTimeout(() => showInfoPanel(id), 500);
}

// ════════════════════════════════════════════════════════════════
//  ROUTING UI
// ════════════════════════════════════════════════════════════════
function activateRouteSelect(role) {
  routeSelectMode = role;
  document.getElementById('route-from').style.borderColor = role==='from' ? 'var(--accent)' : '';
  document.getElementById('route-to').style.borderColor   = role==='to'   ? 'var(--accent)' : '';
}

function setRouteStation(id) {
  const s = getStn(id);
  if (!s || !routeSelectMode) return;
  const label = `${s.e} (${s.z})`;
  if (routeSelectMode === 'from') {
    routeFrom = id;
    document.getElementById('route-from').textContent = '✓ ' + label;
    document.getElementById('route-from').classList.add('set');
    routeSelectMode = 'to';
    activateRouteSelect('to');
  } else {
    routeTo = id;
    document.getElementById('route-to').textContent = '✓ ' + label;
    document.getElementById('route-to').classList.add('set');
    routeSelectMode = null;
    document.getElementById('route-btn').disabled = false;
    document.getElementById('route-clear').style.display = 'block';
    activateRouteSelect(null);
  }
}

function clearRoute() {
  routeFrom = routeTo = routeSelectMode = null;
  routeActive = false;
  document.getElementById('route-from').textContent = '— Select start · 出發站 —';
  document.getElementById('route-from').classList.remove('set');
  document.getElementById('route-to').textContent   = '— Select end · 目的站 —';
  document.getElementById('route-to').classList.remove('set');
  document.getElementById('route-btn').disabled = true;
  document.getElementById('route-clear').style.display = 'none';
  document.getElementById('route-result').classList.remove('visible');
  document.getElementById('route-from').style.borderColor = '';
  document.getElementById('route-to').style.borderColor   = '';
  clearHighlights();
}

// ════════════════════════════════════════════════════════════════
//  ROUTING — Dijkstra
// ════════════════════════════════════════════════════════════════
function buildGraph() {
  function addEdge(a, b, lid) {
    if (!a || !b) return;
    if (!graph[a]) graph[a] = [];
    if (!graph[b]) graph[b] = [];
    if (!graph[a].some(e => e.to===b)) graph[a].push({to:b, line:lid, w:1});
    if (!graph[b].some(e => e.to===a)) graph[b].push({to:a, line:lid, w:1});
  }

  LINES.forEach(ln => {
    const main = ln.stations;
    for (let i=0; i<main.length-1; i++) addEdge(main[i], main[i+1], ln.id);
    (ln.branches||[]).forEach(b => {
      const arr = [b.from, ...b.stations];
      for (let i=0; i<arr.length-1; i++) addEdge(arr[i], arr[i+1], ln.id);
    });
  });
}

function dijkstra(start, end) {
  const dist = {}, prev = {}, vis = new Set();
  Object.keys(STATIONS).forEach(id => dist[id] = Infinity);
  dist[start] = 0;
  const pq = [{id:start, d:0}];

  while (pq.length) {
    pq.sort((a,b) => a.d - b.d);
    const {id:u} = pq.shift();
    if (vis.has(u)) continue;
    vis.add(u);
    if (u === end) break;
    for (const {to:v, w} of (graph[u]||[])) {
      if (vis.has(v)) continue;
      const nd = dist[u] + w;
      if (nd < dist[v]) { dist[v]=nd; prev[v]=u; pq.push({id:v,d:nd}); }
    }
  }
  if (dist[end] === Infinity) return null;
  const path=[]; let cur=end;
  while(cur) { path.unshift(cur); cur=prev[cur]; }
  return path;
}

function calculateRoute() {
  if (!routeFrom || !routeTo) return;
  const path = dijkstra(routeFrom, routeTo);
  const res = document.getElementById('route-result');
  if (!path) {
    res.innerHTML = '<div style="color:#f87171">No route found.</div>';
    res.classList.add('visible'); return;
  }

  const stops = path.length - 1;
  res.innerHTML = `<div style="font-weight:600;color:#60a5fa;margin-bottom:7px">${stops} stop${stops!==1?'s':''}</div>`
    + path.map((id,i) => {
        const s = getStn(id); if (!s) return '';
        const c = lineColor(s.ln[0]);
        const w = (i===0||i===path.length-1)?'#e2e8f4':'#7a8499';
        return `<div class="rs-stop"><span class="rs-dot" style="background:${c}"></span><span class="rs-name" style="color:${w}">${s.e}</span></div>`;
      }).join('');
  res.classList.add('visible');
  highlightRoute(path);
}

function highlightRoute(path) {
  routeActive = true;
  const ps = new Set(path);

  linesG.selectAll('.line-path').transition().duration(200).attr('opacity',0.07).attr('stroke-width',5.5);
  stnsG.selectAll('.station-group').each(function() {
    const id = this.getAttribute('data-sid');
    d3.select(this).selectAll('rect,text').transition().duration(200)
      .attr('opacity', ps.has(id) ? 1 : 0.15);
  });

  // Highlight path edges
  for (let i=0; i<path.length-1; i++) {
    const a=path[i], b=path[i+1];
    LINES.forEach(ln => {
      const m=ln.stations, ia=m.indexOf(a), ib=m.indexOf(b);
      if (ia!==-1 && ib!==-1 && Math.abs(ia-ib)===1) {
        linesG.selectAll(`.lp-${ln.id}`)
          .transition().duration(200)
          .attr('opacity',1).attr('stroke-width',9)
          .attr('filter','url(#glow-soft)');
      }
      // check branches
      (ln.branches||[]).forEach(br => {
        const arr=[br.from,...br.stations];
        const ja=arr.indexOf(a), jb=arr.indexOf(b);
        if (ja!==-1 && jb!==-1 && Math.abs(ja-jb)===1) {
          linesG.selectAll(`.lp-${ln.id}`)
            .transition().duration(200).attr('opacity',1).attr('stroke-width',9);
        }
      });
    });
  }

  // Fit view
  const xs = path.map(id=>getStn(id)?.x).filter(Boolean);
  const ys = path.map(id=>getStn(id)?.y).filter(Boolean);
  if (xs.length) fitExtent(Math.min(...xs),Math.min(...ys),Math.max(...xs),Math.max(...ys));
}

function fitExtent(x1,y1,x2,y2) {
  const pad=80;
  const c = document.getElementById('map-container');
  const cw=c.clientWidth, ch=c.clientHeight;
  const sc = Math.min(cw/(x2-x1+2*pad), ch/(y2-y1+2*pad)) * 0.85;
  const tx = cw/2 - sc*(x1+x2)/2, ty = ch/2 - sc*(y1+y2)/2;
  svg.transition().duration(650)
    .call(zoom.transform, d3.zoomIdentity.translate(tx,ty).scale(sc));
}

// ════════════════════════════════════════════════════════════════
//  MAP CONTROLS
// ════════════════════════════════════════════════════════════════
function zoomIn()  { svg.transition().duration(280).call(zoom.scaleBy, 1.5); }
function zoomOut() { svg.transition().duration(280).call(zoom.scaleBy, 0.7); }

function resetView() {
  const c = document.getElementById('map-container');
  const cw=c.clientWidth, ch=c.clientHeight;
  const sc = Math.min(cw/SVG_W, ch/SVG_H) * 0.9;
  svg.transition().duration(500)
    .call(zoom.transform, d3.zoomIdentity
      .translate((cw-SVG_W*sc)/2, (ch-SVG_H*sc)/2).scale(sc));
  routeActive = false;
  clearHighlights();
}

// ════════════════════════════════════════════════════════════════
//  LEGEND
// ════════════════════════════════════════════════════════════════
function buildLegend() {
  const c = document.getElementById('legend-items');
  LINES.forEach(ln => {
    const div = document.createElement('div');
    div.className = 'legend-item';
    div.dataset.lid = ln.id;
    
    const eyeSpan = document.createElement('span');
    eyeSpan.className = 'legend-eye';
    eyeSpan.innerHTML = '👁️';
    eyeSpan.title = 'Toggle Line Visibility';
    
    eyeSpan.addEventListener('click', (ev) => {
      ev.stopPropagation();
      if (hiddenLines.has(ln.id)) {
        hiddenLines.delete(ln.id);
        div.classList.remove('hidden-line');
        eyeSpan.innerHTML = '👁️';
        eyeSpan.style.opacity = '1';
      } else {
        hiddenLines.add(ln.id);
        div.classList.add('hidden-line');
        eyeSpan.innerHTML = '👁️‍🗨️';
        eyeSpan.style.opacity = '0.4';
      }
      applyLineVisibility();
    });

    const swatch = document.createElement('div');
    swatch.className = 'legend-swatch';
    swatch.style.background = ln.color;

    const textWrap = document.createElement('div');
    textWrap.className = 'legend-text';
    textWrap.innerHTML = `<div class="l-en">${ln.e}</div><div class="l-zh">${ln.z}</div>`;

    div.appendChild(swatch);
    div.appendChild(textWrap);
    div.appendChild(eyeSpan);

    div.addEventListener('mouseenter', () => highlightLine(ln.id));
    div.addEventListener('mouseleave', clearHighlights);
    div.addEventListener('click', () => {
      document.querySelectorAll('.legend-item').forEach(el => el.classList.remove('active'));
      div.classList.toggle('active');
    });
    c.appendChild(div);
  });
}

function applyLineVisibility() {
  LINES.forEach(ln => {
    d3.selectAll(`.lp-${ln.id}`).attr('display', hiddenLines.has(ln.id) ? 'none' : null);
  });
  
  d3.selectAll('.station-group').attr('display', function() {
    const match = d3.select(this).attr('class').match(/sg-([A-Z0-9]+)/);
    if (!match) return null;
    const id = match[1];
    const s = STATIONS[id];
    if (!s || !s.ln) return null;
    const allHidden = s.ln.every(l => hiddenLines.has(l));
    return allHidden ? 'none' : null;
  });
  
  d3.selectAll('.label-group').attr('display', function() {
    const match = d3.select(this).attr('class').match(/lg-([A-Z0-9]+)/);
    if (!match) return null;
    const id = match[1];
    const s = STATIONS[id];
    if (!s || !s.ln) return null;
    const allHidden = s.ln.every(l => hiddenLines.has(l));
    return allHidden ? 'none' : null;
  });
}

// ════════════════════════════════════════════════════════════════
//  CLICK-AWAY CLOSE
// ════════════════════════════════════════════════════════════════
svg.on('click', () => {
  closeInfo();
  if (!routeSelectMode && routeActive) { routeActive=false; clearHighlights(); }
});

// ════════════════════════════════════════════════════════════════
//  EXPORT SVG
// ════════════════════════════════════════════════════════════════
function downloadSVG() {
  const svgEl = document.getElementById('map-svg').cloneNode(true);
  
  // Remove interactive control overlays if cloned or just export cleanly
  const serializer = new XMLSerializer();
  let source = serializer.serializeToString(svgEl);
  
  if (!source.match(/^<svg[^>]+xmlns="http:\/\/www\.w3\.org\/2000\/svg"/)) {
    source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
  }
  if (!source.match(/^<svg[^>]+xmlns:xlink="http:\/\/www\.w3\.org\/1999\/xlink"/)) {
    source = source.replace(/^<svg/, '<svg xmlns:xlink="http://www.w3.org/1999/xlink"');
  }
  
  source = '<?xml version="1.0" encoding="utf-8"?>\n' + source;
  
  const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'taipei_metro_map.svg';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function exportStationsJSON() {
  const jsonStr = JSON.stringify(STATIONS, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'stations.json';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function resetCoordinates() {
  if (confirm('Ripristinare tutte le coordinate delle stazioni a quelle di default? La pagina verrà ricaricata.')) {
    localStorage.removeItem('taipei_mrt_coords');
    localStorage.removeItem('taipei_mrt_stations_full');
    localStorage.removeItem('taipei_mrt_lines');
    location.reload();
  }
}

// ════════════════════════════════════════════════════════════════
//  BACKGROUND IMAGE CONTROLS
// ════════════════════════════════════════════════════════════════
let bgImageVisible = false;

function toggleBgImage() {
  bgImageVisible = !bgImageVisible;
  const btn = document.getElementById('toggle-bg-btn');
  const sliderWrap = document.getElementById('bg-opacity-wrap');
  const img = d3.select('#bg-map-image');
  
  if (bgImageVisible) {
    btn.textContent = 'Hide';
    btn.classList.add('active');
    sliderWrap.style.display = 'flex';
    img.attr('display', null);
  } else {
    btn.textContent = 'Show';
    btn.classList.remove('active');
    sliderWrap.style.display = 'none';
    img.attr('display', 'none');
  }
}

function adjustBgOpacity(val) {
  const opacity = val / 100;
  d3.select('#bg-map-image').attr('opacity', opacity);
  document.getElementById('bg-opacity-val').textContent = val + '%';
}

// ════════════════════════════════════════════════════════════════
//  INIT
// ════════════════════════════════════════════════════════════════
const DB_VERSION = 12; // Auto-invalidate cache when topology changes
const localVer = localStorage.getItem('taipei_mrt_db_version');
const isOutdated = (!localVer || parseInt(localVer) < DB_VERSION);

let savedStns = null;
try {
  const full = localStorage.getItem('taipei_mrt_stations_full');
  if (full) savedStns = JSON.parse(full);
} catch(e) {}

if (isOutdated) {
  // Upgrade: preserve user X/Y drag positions, but load new topology (lines, new nodes, metadata)
  if (savedStns) {
    Object.keys(STATIONS).forEach(id => {
      if (savedStns[id] && savedStns[id].x !== undefined && savedStns[id].y !== undefined) {
        STATIONS[id].x = savedStns[id].x;
        STATIONS[id].y = savedStns[id].y;
      }
    });
  }
  localStorage.removeItem('taipei_mrt_coords'); // old format cleanup
  localStorage.removeItem('taipei_mrt_lines'); // discard old lines to get new topology
  localStorage.setItem('taipei_mrt_db_version', DB_VERSION);
  localStorage.setItem('taipei_mrt_stations_full', JSON.stringify(STATIONS));
} else {
  // Not outdated: fully load lines and stations from local storage
  const localLines = localStorage.getItem('taipei_mrt_lines');
  if (localLines) {
    try {
      const linesData = JSON.parse(localLines);
      LINES.length = 0;
      linesData.forEach(l => LINES.push(l));
    } catch(e) {}
  }
  if (savedStns) {
    Object.keys(STATIONS).forEach(k => delete STATIONS[k]);
    Object.assign(STATIONS, savedStns);
  }
}

computeClusterOffsets();
renderLines();
renderStations();
renderLabels();
buildLegend();
buildGraph();
setTimeout(resetView, 80);
