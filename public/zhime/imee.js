/*Downloaded from https://www.codeseek.co/canis/dayi-input-method-editor-ime-ngGvB */
/**************************************
  This code almost 16 year's ago.
  http://clonefactor.com/project/20070928_dayi/
  planning to upgrade to JQuery. hm... may be not.
**************************************/
// Gecko = Netscape 7.x & Mozilla 1.4+
LastNo=0;
SPACECHAR=" "; // 字碼表的分隔,空白字元。
CandChinesePart=new Array(); //侯選字，中文字部份
CandCompPart=new Array();    //侯選字, 後碼部份，如“我o”裏的o

function csort(a,b){ // 修正 sorting 後字碼排列相反問題
	if(a.split(SPACECHAR)[0] < b.split(SPACECHAR)[0]){ 
		return -1; // 放前
	}else if(a.split(SPACECHAR)[0] > b.split(SPACECHAR)[0]){
		return 1; // 放後
	}else
		return 0; // 如字碼相同則不作調換.
}// End csort

AsciiStr=",|.|/|0|1|2|3|4|5|6|7|8|9|;|a|b|c|d|e|f|g|h|i|j|k|l|m|n|o|p|q|r|s|t|u|v|w|x|y|z"; //定義使用的編碼。
AsciiStr=AsciiStr.split('|');
CodeList=CodeList.split('|');
CodeList.sort();

CtrlDown=false;
CancelKey=false;
passNextKeyPress = true;
//==KeyCode 33..47
//Symbol1 = "！”＃＄％＆’（）＊＋，－。／";
//==KeyCode 58..64
//Symbol2 = "：；＜＝＞？＠";
//==KeyCode 91..96
//Symbol3 = "〔、｝︿＿‘";
//==KeyCode 123..126
//Symbol4 = "｛｜〕～";
Punct2 =  new Array('；','＝','，','－','。','／','‘');
Punct3 =  new Array('〔','╲','〕','’');
UPunct2 =  new Array(';','=',',','-','.','/','`');
UPunct3 =  new Array('[','\\',']',"'");

//==按ＳＨＩＦＴ輸出的符號
SPunct1 = new Array('）','！','＠','＃','＄','％','︿','＆','＊','（');
SPunct2 = new Array('：','＋','＜','＿','＞','？','～');
SPunct3 = new Array('｛','｜','｝','”');

//==全形數位和字母
FullShape_No=new Array("０","１","２","３","４","５","６","７","８","９");
FullShape_BigAZ=new Array("Ａ","Ｂ","Ｃ","Ｄ","Ｅ","Ｆ","Ｇ","Ｈ","Ｉ","Ｊ","Ｋ","Ｌ","Ｍ","Ｎ","Ｏ","Ｐ","Ｑ","Ｒ","Ｓ","Ｔ", "Ｕ","Ｖ","Ｗ","Ｘ","Ｙ","Ｚ");
FullShape_SmallAZ=new Array('ａ','ｂ','ｃ','ｄ','ｅ','ｆ','ｇ','ｈ','ｉ','ｊ','ｋ','ｌ','ｍ','ｎ','ｏ','ｐ','ｑ','ｒ','ｓ','ｔ','ｕ','ｖ','ｗ','ｘ','ｙ','ｚ');

// 二分搜索法 字串需先行排列順序
function FindIn(s) {
var find=-1,low=0,mid=0,high=CodeList.length;
var sEng="";  
  while(low<high){
    mid=(low+high)/2; // 整段長度
    mid=Math.floor(mid); // 去浮點數
    sEng=CodeList[mid]; // 讀取mid 的中位字符
    if(sEng.indexOf(s,0)==0){find=mid;break;} // 字碼位置對比 - 有 - break 
    sEng=CodeList[mid-1]; // 真隨便 ... 退一格的字
    if(sEng.indexOf(s,0)==0){find=mid;break;} // 字碼位置對比 - 有 - break 
    if(sEng<s){low=mid+1;}else{high=mid-1;} // 如查找中字串 對比 處理中的字串少..
  }
  while(find>0){ // 找到了頭緒了. 一大段同碼的結果. , 0 就是沒有了.
    sEng=CodeList[find-1]; // ?? 啥
    if(sEng.indexOf(s,0)==0){find--;}else{break;} // 確保找到的 list 是 sEng 處於該字碼的首位順序 e.g. [abc @] 找 ab 會找到 [xab][hhab]確保找到是 ab 開頭的
  }
  return(find);
}

function GetStr(No, s){ // 取得字碼 及 字符
  var sTmp="",sChi="";
  var i;
  for(i=0;i<=9;i++){ // 只display 9 個字.
    if(No+i>CodeList.length-1){break;} // 少於9個時處理.
    sTmp=CodeList[No+i]; // 抽出個別字符/碼 - temp
    if(sTmp.indexOf(s)==0){ // 與 s 相同字碼處於字碼開頭
      sChi=CodeList[No+i]; // 扔入相符字碼區
      CandCompPart[i]=sChi.substring(s.length,sChi.indexOf(SPACECHAR)); // 單單抽出 字符
      CandChinesePart[i]=sChi.substr(sChi.lastIndexOf(SPACECHAR)+1); // 單單抽出 餘下 字碼
      if(i<=8){IME.Cand.value+=(i+1)+"."+CandChinesePart[i]+CandCompPart[i]+'\n';} // 選字區. display html code.
      else{IME.Cand.value+=(0)+"."+CandChinesePart[i]+CandCompPart[i]+'\n';}
    }else{ // 與 S 不同 or 不處於開頭則跳過.
      break;
    }
  }
  if(No>10 && CodeList[No-10].indexOf(s)==0) IME.Cand.value+='-.←\n'; // 上一頁
  if(i==10 && No<=CodeList.length-11 && CodeList[No+i].indexOf(s)==0) IME.Cand.value+='+.→'; // 下一頁
  LastNo=No;
}

function Grep(s){
  var No=-1;
  for(i=0;i<=9;i++){CandChinesePart[i]="";}
  if(s!=""){
    No=FindIn(s);
    if(No>=0){GetStr(No, s);}
  }

  //==自動上字
  if( IME.AutoUp.checked==true && CandChinesePart[0]!="" && CandChinesePart[1]=="" && CandCompPart[0]=="" ) {
    SendCand(0);
  }
}

// 送候選字到輸入區
function SendCand(n){
  if ( n>=0 && n<=9 ) {
    SendStr(CandChinesePart[n]);
    IME.Comp.value="";
    IME.Cand.value="";
  }
}

// 設選區：暫時無用
function setSelectionRange(input, selectionStart, selectionEnd) {
  if (input.setSelectionRange) {
    input.focus();
    input.setSelectionRange(selectionStart, selectionEnd);
  } else if (input.createTextRange) {
    var range = input.createTextRange();
    range.collapse(true);
    range.moveEnd('character', selectionEnd);
    range.moveStart('character', selectionStart);
    range.select();
  }
}
// 設游標位置：暫時無用
function setCaretToEnd (input) {
  setSelectionRange(input, input.value.length, input.value.length);
}
function setCaretToBegin (input) {
  setSelectionRange(input, 0, 0);
}
function setCaretToPos (input, pos) {
  setSelectionRange(input, pos, pos);
}

// 送字串到輸入區
function SendStr(s) {
  if (s=="") { return }

  switch (browser) {
  case 1: // IE
    var r=document.selection.createRange();
    r.text=s;
    r.select(); // 不知何故，此碼可取消選區。
    break;
  case 2: // Gecko
    /*
       -simulate keypress
       *simulate scroll
       -change outputString
       -use createRange, setStart, setEnd
    */

    var obj = IME.InputArea;
    var selectionStart = obj.selectionStart;
    var selectionEnd = obj.selectionEnd;
    var oldScrollTop = obj.scrollTop;  //因Gecko不會滾到該滾的地方。
    var oldScrollHeight = obj.scrollHeight;
    var oldLen = obj.value.length;

    obj.value = obj.value.substring(0, selectionStart) + s + obj.value.substring(selectionEnd); // 這時Gecko會將scrollTop改成0
    obj.selectionStart = obj.selectionEnd = selectionStart + s.length;
    if (obj.value.length == oldLen) { // 如果用戶在後面輸入，就直接滾到後面。
      obj.scrollTop = obj.scrollHeight;
    } else if (obj.scrollHeight > oldScrollHeight) { // 如果TextArea增加了高度，就滾下一點點
      obj.scrollTop = oldScrollTop + obj.scrollHeight - oldScrollHeight;
    } else { // 其他情形就滾回之前的地方
      obj.scrollTop = oldScrollTop;
    }
    
    break;
  default: // 其他，就在後面加字算了
    IME.InputArea.value += s;
  }
}

// 將半形字母換成全形字母
function ToFullShapeLetter(aStr) {
  var s="";

  for (i=0;i<aStr.length;i++) {
    var c = aStr.charCodeAt(i);
    if (c>=65 && c<=90) {
      s += FullShape_BigAZ[c-65];
    } else if (c>=97 && c<=122) {
      s += FullShape_SmallAZ[c-97];
    } else {
      s += aStr.charAt(i);
    }
  }

  return s;
}

function ImeKeyDown(e) {
  var s="";
  if(!e) e=window.event;
  var key = e.which ? e.which : e.keyCode;
  CtrlDown=false;
  passNextKeyPress=false;
  
  switch (key) {
  //==Backspace
  case 8:
    if (IME.Comp.value!="") {
      s=IME.Comp.value;
      IME.Comp.value = s.substr(0, s.length-1);
      IME.Cand.value = "";
      Grep(IME.Comp.value);
      //TODO: how to cancel KeyDown in Opera 7.11? Hack it?
      CancelKey = true;
      return (false);
    }
    return (true);

  //==Tab
  case 9:
    SendStr('　');
    CancelKey = true;
    return (false); 

  //==Esc
  case 27:
    IME.Comp.value="";
    IME.Cand.value="";
    CancelKey = true;
    return (false); //Esc會把全部文字刪除，故禁止 Esc鍵 起任何作用。

  //向前翻頁
  case 109: //firfox keycode '-'
       if(browser != 2) break;
  case 189: //ie keycode '-'
       if(browser != 1 && key != 109) break;
  //==PageUp
  case 33:
  case 57383: // Opera 7.11
    s=IME.Comp.value;
    if (s!="") {
      if(LastNo>10 && CodeList[LastNo-10].indexOf(s)==0){
        IME.Cand.value="";
        GetStr(LastNo-10, s);
      }
      CancelKey = true;
      return(false);
    }
    break;
    //return(true);

  //向後翻頁
  case 61: //firfox keycode '-'
       if(browser != 2) break;
  case 187: //ie keycode '-'
       if(browser != 1 && key != 61) break;
  //==PageDown
  case 34:
  case 57384: // Opera 7.11
    s=IME.Comp.value;
    if ( s!="" ){
      if(LastNo<=CodeList.length-11 && CodeList[LastNo+10].indexOf(s) == 0) {
        IME.Cand.value="";
        GetStr(LastNo+10, s);
      }
      CancelKey = true;
      return(false);
    }
    break;
    //return(true);

  //==Space
  case 32:
    if(IME.Comp.value!="") {
      //TODO: sound if nothing in Cand
      SendCand(0);
      CancelKey = true;
      return(false);
    }
    return(true);

  //==Enter
  case 13:
    if (IME.Comp.value!="") {
      SendStr( IME.FullShape.checked ? 
        ToFullShapeLetter(IME.Comp.value) : 
        IME.Comp.value);
      IME.Comp.value="";
      IME.Cand.value="";
      CancelKey = true;
      return(false);
    }
    return(true);

  //==F2
  case 113:
    IME.AutoUp.checked = !IME.AutoUp.checked;
    CancelKey = true;
    return (false);

  //==F12
  case 123:
  case 57356: // Opera 7.11
    IME.FullShape.checked = !IME.FullShape.checked;
    CancelKey = true;
    return (false);

  //==Ctrl
  case 17:
  case 57402: // Opera 7.11
    CtrlDown=true;
    break;
    
  		case 36: // home
		case 35: // end
		case 37: // left
		case 38: // up
		case 39: // right
		case 40: // down
		case 45: // insert
		case 46: // del
		case 91: // windows key
		case 112: // F1
//		case 113: // F2
		case 114: // F3
		case 115: // F4
		case 116: // F5
		case 117: // F6
		case 118: // F7
		case 119: // F8
		case 120: // F9
		case 121: // F10
		case 122: // F11
//		case 123: // F12
			// let these keys pass through unprocessed in the next keypress events
			passNextKeyPress = true;
			return (true);

  }

  if (e.ctrlKey) { return (true) };
  if (browser==2) { // Little patch here. for some F.U.C*K browser.
      switch (key) {
      case 59: key=186;break;
      case 61: key=187;break;
      case 109: key=189;break;
      }
  }
  //==數字
	if (key>=48 && key<=57) { // in 0~9 keyCode range
		if (e.altKey) {
			// 任何時間按 alt 鍵進行選字
			SendCand( key==48 ? 9 : (key-49) );
			CancelKey = true;
			return (false);
		}else{
			if (IME.FullShape.checked) { // 輸出全形符
				if (e.shiftKey) { // 0-9上符號 !@#$%^&*()
					SendStr(SPunct1[key-48]);
					CancelKey = true;
					return (false);
				} else { // 0-9 全形
					SendStr(FullShape_No[key-48]);
					CancelKey = true;
					return (false);// 直接輸出符號
				}// End Fullshape
			} else { // 非全形
				if (e.shiftKey) { // 0-9上符號 !@#$%^&*()
					return (true);
				} else { //0-9 一般處理方式
					if(IME.EnglishMode.checked){
						return (true);
					}else{ // 輸入字根
						s=IME.Comp.value;
						IME.Comp.value+=String.fromCharCode(key);
						IME.Cand.value="";
						Grep(IME.Comp.value);
						CancelKey = true;
						return (false);
					}
				}
			}
		}
	}// End 數字


  //==其他符號
	if (key>=186 && key<=192) { // ,./`
		if(IME.FullShape.checked) {
			SendStr( e.shiftKey ? SPunct2[key-186] : Punct2[key-186] );
			CancelKey = true;
			return (false);
		}else if(!IME.EnglishMode.checked && !e.shiftKey){ // no shift, non-english mode
			s=IME.Comp.value;
			IME.Comp.value+=UPunct2[key-186];
			IME.Cand.value="";
			Grep(IME.Comp.value);
			CancelKey = true;
			return (false);
		}else{ return (true); } // just show up the char.
	} 
	if (key>=219 && key<=222) { // '[]\
		if(IME.FullShape.checked) {
			SendStr( e.shiftKey ? SPunct3[key-219] : Punct3[key-219] );
			CancelKey = true;
			return (false);
		} else if(!IME.EnglishMode.checked && !e.shiftKey){ // no shift, non-english mode again!
			s=IME.Comp.value;
			IME.Comp.value+=UPunct3[key-219];
			IME.Cand.value="";
			Grep(IME.Comp.value);
			CancelKey = true;
			return (false);
		}else{ return (true); } //just show up the char again!
	}
  return(true);
}

function ImeKeyPress(e) {
  if(!e) e=window.event;
  var key = e.which ? e.which : e.keyCode;

	// pass keypress without processing it
	if(passNextKeyPress) {
		return (true);
	}

  // Gecko 雖不能於 OnKeyDown 取消鍵，但它卻是在 OnKeyPress 之後才執行鍵的動作，故於 OnKeyPress 取消鍵亦無所謂。
  // 但 Opera 在 OnKeyPress 之前已執行鍵的動作，故仍未能取消 Backspace 等鍵。  
  // 為什麼不連IE也在此取消多一次？即在OnKeyDown取消，在OnKeyPress再取消。因會出現一個問題：快速輸入文字時，第一個字會被取消。原因未知。
  if (browser==2 || browser==3) {
    if (CancelKey) {
      CancelKey = false;
      return (false);
    }
  }

  if (e.ctrlKey) { return (true); }

  // 為何不將A-Z的處理放在OnKeyDown ? 因無從知道Caps Lock的狀況。
  //==A-Z
  if ( key>=65 && key<=90 ) {
    if (IME.FullShape.checked) {
      SendStr(FullShape_BigAZ[key-65]);
      return (false);
    }
    return (true);
  }

  //==a-z
  if (key>=97 && key<=122) {
	if (IME.FullShape.checked) {
        SendStr( FullShape_SmallAZ[key-97] );
        return (false);
    } else if (IME.EnglishMode.checked) {
      return (true);
    } else {
      s=IME.Comp.value;
      if (s.length<MAX) {
        IME.Comp.value+=String.fromCharCode(key);
        IME.Cand.value="";
        Grep(IME.Comp.value);
      }
      return (false);
    }
  }

  // Gecko 的某些鍵會產生兩個KeyCode，如?和/，須取消其中一個，否則將一鍵兩字
  if (browser==2) {
    switch (key) {
    case 47: case 63:
      if (!IME.EnglishMode.checked || IME.FullShape.checked) {
        return (false);
      }
      break;
    }
  }

  return (true);
}

function ImeKeyUp(e) {
  if(!e) e=window.event;
  var key = e.which ? e.which : e.keyCode;

  //==Ctrl
  if (key==17 || key==57402) {
    if (CtrlDown==true) {
      IME.EnglishMode.checked = !IME.EnglishMode.checked;
    }
  }

  return(true);
}

function BodyOnLoad() {
  browser = 
    (navigator.appName.indexOf('Microsoft') != -1) ? 1 :
    (navigator.appName.indexOf('Netscape')  != -1) ? 2 :
    (navigator.appName.indexOf('Opera')     != -1) ? 3 :
    4;
  if(browser == 2 && navigator.userAgent.indexOf('Safari') != -1) browser = 5;
  // Gecko 的JavaScript須以DOM方式表示物件，getElementById是“方便法”。IE亦通曉此法。Opera似乎亦曉得。
  IME = {
    InputArea: document.getElementById("InputArea"),
    Comp:      document.getElementById("Comp"),
    Cand:      document.getElementById("Cand"),

    EnglishMode: document.getElementById("EnglishMode"),
    FullShape:   document.getElementById("FullShape"),
    AutoUp:      document.getElementById("AutoUp")
  };
  IME.InputArea.focus(); 
}