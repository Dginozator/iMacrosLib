//23 модуля, регулярное выражение //-+//[^/]*//-+ . После отбора удалить строки со словами "Завершение" и "End"
/**
Список модулей

Основные функции
Служебные функции Imacros
Взаимодействие с контекстом
Работа с сервисом RuCaptcha
Работа с SimSMS
Работа с SMSActivate
Навигация
Работа с файлами
Логирование
HTML файл-отчет
Соц. сети
Генерация данных
Математические функции
Yandex регистрация
Базовые функции поисковых систем
Регистрация Pinterest
Регистрация AddmefastReg
Функции beatstars.com
Yotube вспомогательные функции
Telegram Bot API JS
Wikipedia
Seosprint функции
xpcom Tabs
*/
//234 функции, поиск по регулярному выражению ^(\S*\s?=\s?)?function\s[^(]*
//11401 строка
//Шапка узакана в качестве примера!
/**
Project: 			Pinterest Registrator
Version: 			see filename
Description:  Скрипт регистрирует аккаунт на Pinterest. Может
регистрироваться почта.
							Возможности:
                ) можно указать ссылку на список пользователей
                ) может начать подписку с определенного 
                		пользователя.
                ) указывается количество пользователей для подписки
                Если установить -1 - подписывается до отключения скрипта.
Date: 				05-10-2016
Author: 			Dginozator

Улучшено:
1) ускорен выбор имени и фамилии, начиная со второй выборки;
2) увеличено количество имен и фамилий. Списки можно как чистить, так и расширять;
3) меняется User-agent для устойчивости к бану;
4) устанавливается аватар.

Для установки аватара необходимо:
 - в папку iMacros\Downloads\avatars сложить подряд пронумерованные от 1 изображения расширения jpg;
 - в MAX_NUM_AVATARS (внизу этого файла) написать количество картинок.
*/

//----------------------//Основные функции//-------------------------

const FILE_IN           = "in.txt";
const FILE_OUT          = "out.txt";
const PROJECT_FOLDER    = "seosprint";
const FILE_SERVICE      = "service.txt";
const FILE_DATA         = "seosprint_data.txt";
const FILE_USERAGENT    = "UserAgent_cut.txt";
const FILE_RESULT       = "output.txt";
const SESSION_DATA			= "session_data.txt";
const CAP_IMG 					= "cap.jpg";
const FILE_LOG 					= "log.txt";

const DEBUG_MODE = true;

var Go = [];

var XMLHttpRequest=Components.Constructor("@mozilla.org/xmlextras/xmlhttprequest;1");

/**
@class    general
@brief    Основная функция программы
@param    -
@return   1                 Успешно выполнено
          -1                Ошибка при выполнении
*/
Go[0] = function () 
{
  var result = 1;
  
  var downloads_path =  getiMacrosFolder("Downloads")+"\\"+PROJECT_FOLDER;
  var datasources_path =  getiMacrosFolder("Downloads")+"\\"+PROJECT_FOLDER;

  var current_proxy = "";

  var service_data = {
    api_rucaptcha: "",
    proxy: []
  };
  service_data = ReadService_v2 (datasources_path + "\\" + FILE_SERVICE, service_data);

  // Список User-agent
  var lUserAgent = UserAgent (datasources_path + "\\" + FILE_USERAGENT);
  var current_useragent = "";
  //proxy, user-agent, clear cookies
  current_useragent = lUserAgent.GetUserAgent(true);
  if (service_data.proxy[current_proxy].length > 6) {
    Start_v2 (service_data.proxy[current_proxy], "", "", current_useragent);
  }
  else {
    Start_v2 ("", "", "", current_useragent);
  }
  current_proxy++;
  if (current_proxy >= service_data.proxy.length) {
    current_proxy = 0;
  }

  //again Function for capModule
  funcData = InputData (lData[lDataCurrent]);
  //alert (funcData.args.callee);
  var capModule = RecaptchaModule();
  capModule.SetData(service_data.api_rucaptcha, datasources_path);
  capModule.createFunctionAgain (funcData.args);
  capModule.streamGo();
  //После капчи

  return (result);
}

/**
@class    general
@brief    Отладочная функция программы
@param    -
@return   1                 Успешно выполнено
          -1                Ошибка при выполнении
*/
Go[1] = function () {
	var result = 1;
	
	return (result);
}

//----------------//Завершение - Основные функции//------------------

//------------------//Служебные функции Imacros//--------------------

/**
@class  service_imacros
@brief  Позволяет определить адреса служебных папок
@param  folderName            Название искомой папки
          "Macros"            Папка со скриптами
          "Datasources"       Данные
          "Downloads"         Загрузки
          "Logs"              Логи
@return                       Адрес искомой папки
            -1                Название было введено неверно
*/
function getiMacrosFolder(folderName) 
{
   var pname;
   switch (folderName)
   {
      case "Macros" :
         pname = "defsavepath";
         break;
      case "Datasources" :
         pname = "defdatapath";
         break;
      case "Downloads" :
         pname = "defdownpath";
         break;
      case "Logs" :
         pname = "deflogpath";
         break;
      default :
          return (-1);
         //throw folderName + " is not a valid iMacros folder name";
         break;
   }
   return imns.Pref.getFilePref(pname).path;
}

/**
@class service_imacros
@brief Функция реализует задержку выполнения программы.
@param  init_time       Требуемая задержка, в секундах.
@return -
*/
function Delay (init_time) {
  iimPlayCode ("WAIT SECONDS=" + init_time);
}

/**
@class    service_imacros
@brief    Очищает временные файлы и устанавливает прокси
@param    proxy_port      Прокси ip и порт, формат ip:port
          proxy_login     Логин прокси
          proxy_pass      Пароль прокси
          p_useragent     Строка User Agent
          pClear          Удаляет куки
            true          Удаление включено
            false         Удаление выключено
          pNoPics         Отключает картинки
            true          Картинки отключены
            false         Картинки включены
@return   1               Выполнено успешно
          -1              Ошибка при выполнении
*/
function Start_v4 (proxy_port, proxy_login, proxy_pass, p_useragent, pClear, pNoPics) {
  const proxyPortMin = 6;
  var result = 1;
  
  if (!pClear && pClear!==false) pClear = true;

  if (pClear) {
    iimPlayCode ("CLEAR");
  }
  
  var socks_ver = '5';
  
  var loc_currentpage = 0;
  
  var proxy = "";
  var port = "";
  
  //proxy
  //Обязательная строка для изменения about:config
  //prefs.setBoolPref("") - изменяет тип настроек "логический "
  //prefs.setCharPref("") - изменяет тип настроек "строка"
  //prefs.setIntPref("") - изменяет тип настроек "целое"
  var prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
  
  if (proxy_port.length < 6) {
    proxy_port = "";
  }

  if (!!proxy_port) {
    var proxy = proxy_port.replace (new RegExp(":[0-9]*", ""), "");
    var port = proxy_port.replace (new RegExp("[0-9.]*:", ""), "");
    
    prefs.setIntPref("network.proxy.type", 1);

    prefs.setBoolPref("network.proxy.share_proxy_settings", false);

    //HTTP proxy
    prefs.setCharPref("network.proxy.http", proxy);
    prefs.setIntPref("network.proxy.http_port", port);

    //SSL Proxy
    prefs.setCharPref("network.proxy.ssl", proxy);
    prefs.setIntPref("network.proxy.ssl_port", port);

    //FTP Proxy
    prefs.setCharPref("network.proxy.ftp", proxy);
    prefs.setIntPref("network.proxy.ftp_port", port);

    //SOCKS Proxy
    prefs.setCharPref("network.proxy.socks", proxy);
    prefs.setIntPref("network.proxy.socks_port", port);
    prefs.setIntPref("network.proxy.socks_version", socks_ver);
  }
  else {
    prefs.setIntPref("network.proxy.type", 0);
  }
  
  //set another user-agent
  //Page for test: http://demo.imacros.net/UserAgent.aspx
  if (!!p_useragent) {
    prefs.setCharPref("general.useragent.override", p_useragent);
  }
  else {
    prefs.clearUserPref("general.useragent.override");
  }

  if (pNoPics) {
    prefs.setIntPref ("permissions.default.image", 2);
  }
  else {
    prefs.setIntPref ("permissions.default.image", 1);
  }
  //javascript.enabled
  
  //close with last tab - no
  // prefs.setBoolPref("browser.tabs.closeWindowWithLastTab", false);
  
  return (result);
}

/**
@class  service_imacros
@brief  Cancel closing window with last tab
@param  p_m                 Timeout in minutes.
                            If 0 - no close timer
@return 1                   Success
        -1                  Error
*/
function noCloseWindow (p_m = 0) {
  var result = 1;
  
  var prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
  //close with last tab - no
  prefs.setBoolPref("browser.tabs.closeWindowWithLastTab", false);

  if (p_m !== 0) {
    setCloseTimer((+p_m)*60);
  }

  return (result);
}

/**
@class    service_imacros
@brief    Очищает временные файлы и устанавливает прокси
@param    p_useragent     Строка User Agent
          pReconnect      
            true          Схема подключения меняется
            false         Схема подключения не меняется
          pClear          Удаляет куки
            true          Удаление включено
            false         Удаление выключено
          pNoPics         Отключает картинки
            true          Картинки отключены
            false         Картинки включены
@return   1               Выполнено успешно
          -1              Ошибка при выполнении
*/
function Start_Tor (p_useragent, pReconnect, pClear, pNoPics) {
  var result = 1;
  
  if (!pClear && pClear!==false) pClear = true;

  if (pClear) {
    iimPlayCode ("CLEAR");
  }
  
  var loc_currentpage = 0;
  
  var proxy = "";
  var port = "";
  
  //proxy
  //Обязательная строка для изменения about:config
  //prefs.setBoolPref("") - изменяет тип настроек "логический "
  //prefs.setCharPref("") - изменяет тип настроек "строка"
  //prefs.setIntPref("") - изменяет тип настроек "целое"
  var prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
  
  var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"] 
    .getService(Components.interfaces.nsIWindowMediator)
    .getMostRecentWindow("navigator:browser");

  if (pReconnect) {
    wm.torbutton_new_circuit();
  }
  
  //set another user-agent
  //Page for test: http://demo.imacros.net/UserAgent.aspx
  if (!!p_useragent) {
    prefs.setCharPref("general.useragent.override", p_useragent);
  }
  else {
    prefs.clearUserPref("general.useragent.override");
  }

  if (pNoPics) {
    prefs.setIntPref ("permissions.default.image", 2);
  }
  else {
    prefs.setIntPref ("permissions.default.image", 1);
  }
  //javascript.enabled
  
  //prefs.setCharPref("general.useragent.override.facebook.com", "");
  //prefs.clearUserPref("general.useragent.override");
  
  return (result);
}

/**
@class  service_imacros
@brief  Окончание программы
@param    
@return   1         Выполнено успешно
          -1        Ошибка при выполнении
*/
function End_() {
  var result = 1;
  
  //iimPlayCode ("CLEAR");
  
  var prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
  prefs.setIntPref("network.proxy.type", 0);
  prefs.clearUserPref("general.useragent.override");
  
  return (result);
}

/**
@class  service_imacros
@brief  Эмулирует клавиатуру
@param  p_text                  вводимый текст
        p_xpath                 Строка вида "XPATH=\//..."
@return iim_fragment            Фрагмент для добавления в скрипт
*/
function KeyboardEmul (p_text, p_xpath) {
  var iim_fragment = "";
  for (var current_char = 0; current_char < p_text.length; current_char++) {
    iim_fragment += "EVENT TYPE=KEYPRESS " + p_xpath + " CHAR = \"" + p_text[current_char] + "\"\n";
  }
  return (iim_fragment);
}

/**
@class service_imacros
@brief Проверяет, есть ли выражение в тексте.
@param    word      Искомое слово, часть слова или словосочетание
          text      Текст для поиска
@return   true      Искомое выражение содержится в тексте.
          false     Искомое выражение в тексте не найдено.
*/
function WordInText (word, text) {
  var result = false;
  var find_content = "";
  
  //var regexp = /([0-9])/igm;
  var regexp = new RegExp(word, "igm");
  
  find_content = regexp.exec(text);
  
  //defined & true
  if (!!find_content && !!find_content[0]) {
    result = true;
  }
  
  return (result);
}

/**
@class  service_imacros
@brief  Сохраняет страницу и делает скриншот
@param  pScreenShotFlag     Разрешение на скриншот
          true              создать скриншот
          false             не создавать скриншот
        pNamePage           Имя сохраняемых файлов
@return  
*/
function savePage (pDir, pScreenShotFlag, pNamePage) {
  var result = 1;
  var date = {
    seconds: 0,
    minutes: 0,
    hours: 0,
    day: 0,
    month: 0,
    year: 0
  };
  var changed_full_path;

  if (!pNamePage) {
    date = GetCurrentDate_v2 ();
    for (t in date) {
      date[t] = String(date[t]);
      if (date[t].length < 2) {
        date[t] = "0" + date[t];
      }
    }
    pNamePage = "date_" + date.day + "_" + date.month + "_" + date.year + "_time_" + date.hours + "_" + date.minutes + "_" + date.seconds;
  }

  if (!!pDir) {
    changed_full_path = pDir;
    if (changed_full_path.search(/\\\\/) == -1){
      changed_full_path = changed_full_path.replace(/\\/g, "\\\\");
    }

    //png, html
    if (pScreenShotFlag) {
      iimPlayCode ("SAVEAS TYPE=PNG FOLDER=\"" + changed_full_path + "\" FILE=\"" + pNamePage + ".png" + "\"");
    }
    iimPlayCode ("SAVEAS TYPE=HTM FOLDER=\"" + changed_full_path + "\" FILE=\"" + pNamePage + ".html" + "\"");
  }
  else {
    //png, html
    if (pScreenShotFlag) {
      iimPlayCode ("SAVEAS TYPE=PNG FOLDER=* FILE=\"" + pNamePage + ".png\"");
    }
    iimPlayCode ("SAVEAS TYPE=HTM FOLDER=* FILE=\"" + pNamePage + ".html\"");
  }

  return (result);
}

/**
@class  service_imacros
@brief  Возвращает текущую дату.
@param  -
@return result. day
                month
                year
*/
function GetCurrentDate_v2 () {
  var result = {
    seconds: 0,
    minutes: 0,
    hours: 0,
    day: 0,
    month: 0,
    year: 0
  }
  
  var currentTime = new Date();
  result.seconds = currentTime.getSeconds();
  result.minutes = currentTime.getMinutes();
  result.hours = currentTime.getHours();
  result.day = currentTime.getDate();
  result.month = currentTime.getMonth() + 1;
  result.year = currentTime.getFullYear();
  result.year -= (Math.floor(result.year/100)*100);
  
  return (result);
}

/**
@class  service_imacros
@brief  Переходит на завершающую страницу
@param  pProjDir            Папка проекта
@return 1                   Выполнено успешно
        -1                  Ошибка при выполнении
*/
function finishPage (pProjDir) {
  var result = 1;
  var pageAudioPath = "audio_page/index_audio.html";
  
  var path_save_url = pProjDir.replace(/\\+/g,"/");
  path_save_url = path_save_url.replace(/\s/g, "%20");

  iimPlayCode ("TAB OPEN\nTAB T=2\nURL GOTO=\"file:///" + path_save_url + "/" +  pageAudioPath + "\"");
  return (result);
}

/**
@class service_imacros
@brief Функция отправляет запрос и получает ответ через вкладку браузера.
@param  loc_http      Адрес запроса.
        parse_on  0   Выводить данные без парсинга.
                  1   Получать данные из JSON строки.
        pMaxTries     Максимальное число попыток
@return Ответ в формате JSON (до функции\после функции parse)
                  -1  Ошибка
*/
function JSON_tab_v3 (loc_http, parse_on, pMaxTries) {
  var result = 0;
  var iimCode = 0;
  var currentTry = 0;
  if (!pMaxTries) {
    pMaxTries = 1;
  }
  else {
    if (pMaxTries < 1) {
      pMaxTries = 1;
    }
    else if (pMaxTries === 1) {
      pMaxTries = 2;
    }
  }

  iimPlayCode ("TAB OPEN\nTAB T=2");

  var loc_macros = "CODE:SET !EXTRACT_TEST_POPUP NO"+"\n";
  loc_macros += "URL GOTO=" + loc_http + "\n";
  loc_macros += "TAG POS=1 TYPE=BODY ATTR=* EXTRACT=TXT"+"\n";

  do {
    iimCode = iimPlay(loc_macros);
    result = iimGetLastExtract();
    currentTry++;
  } while (((iimCode!==1) || (result=="#EANF#")) && (currentTry < pMaxTries));

  if (!(currentTry < pMaxTries)) {
    result = -1;
  }
  else {
    iimDisplay (result);
    if (parse_on) {
      try {
        result = JSON.parse(result);
      } catch (loc_error) {
        result = -1;
      }
    }
  }

  iimPlayCode("TAB CLOSE");
  
  return (result);
}

/**
@class service_imacros
@brief Функция отправляет запрос и получает ответ. Без дополнительных вкладок.
@param  loc_http      Адрес запроса.
        parse_on  0   Выводить данные без парсинга.
                  1   Получать данные из JSON строки.
        pMaxTries     Максимальное число попыток
@return Ответ в формате JSON (до функции\после функции parse)
                  -1  Ошибка
*/
function get_json_v4 (loc_http, parse_on, pMaxTries) {
  var result = 0;
  var iimCode = 0;
  var currentTry = 0;
  var xhr = new XMLHttpRequest();

  if (!pMaxTries) {
    pMaxTries = 1;
  }
  else {
    if (pMaxTries < 1) {
      pMaxTries = 1;
    }
    else if (pMaxTries === 1) {
      pMaxTries = 2;
    }
  }
  
  do {
    xhr.open("GET", loc_http, false);
    xhr.timeout = 30*1000;
    xhr.send();
    currentTry++;
    Delay(3);
  } while ((xhr.status !== 200) && (currentTry < pMaxTries));

  if (!(currentTry < pMaxTries)) {
    result = -1;
  }
  else {
    result = xhr.responseText;
    iimDisplay (result);
    if (parse_on) {
      try {
        result = JSON.parse(result);
      } catch (loc_error) {
        result = -1;
      }
    }
  }
  
  return (result);
}

/**
@class  service_imacros
@brief  JSON from local file
@param  p_file              Fullpath
        parse_on
          0                 without parsing
          1                 parse JSON
@return JSON answer (with\no parse)
        -1                  Error
*/
function json_local (p_file, parse_on) {
  var result = 0;

  var imns_result = imnsRead(p_file);

  if (imns_result.status === -1) {
    result = -1;
  }
  else {
    result = imns_result.text;
    if (parse_on) {
      try {
        result = JSON.parse(result);
      } catch (loc_error) {
        result = -1;
      }
    }
  }
  return (result);
}

/**
@class service_imacros
@brief  Транслит.
@param  p_str         Текст
@return Измененная строка
*/
function translite(p_str){
  var dictionary = {'а':'a', 'б':'b', 'в':'v', 'г':'g', 'д':'d',
    'е':'e', 'ж':'g', 'з':'z', 'и':'i', 'й':'y', 'к':'k', 'л':'l',
    'м':'m', 'н':'n', 'о':'o', 'п':'p', 'р':'r', 'с':'s', 'т':'t',
    'у':'u', 'ф':'f', 'ы':'i', 'э':'e', 'А':'A', 'Б':'B', 'В':'V',
    'Г':'G', 'Д':'D', 'Е':'E', 'Ж':'G', 'З':'Z', 'И':'I', 'Й':'Y',
    'К':'K', 'Л':'L', 'М':'M', 'Н':'N', 'О':'O', 'П':'P', 'Р':'R',
    'С':'S', 'Т':'T', 'У':'U', 'Ф':'F', 'Ы':'I', 'Э':'E', 'ё':'yo',
    'х':'h', 'ц':'ts', 'ч':'ch', 'ш':'sh', 'щ':'shch', 'ъ':'',
    'ь':'', 'ю':'yu', 'я':'ya', 'Ё':'YO', 'Х':'H', 'Ц':'TS', 'Ч':'CH',
    'Ш':'SH', 'Щ':'SHCH', 'Ъ':'', 'Ь':'', 'Ю':'YU', 'Я':'YA'};

  return p_str.replace(/[\s\S]/g, function(x){
    if( dictionary.hasOwnProperty( x ) )
      return dictionary[ x ];
    return x;
  });
};

/**
@class  service_imacros
@brief  Заменяет существующие свойства и добавляет отсутствующие из передаваемого объекта. Возвращает итоговый объект, исходные объекты остаются неизменными.
@param  p_obj         Объект для правки
        p_added       Объект с добавляемыми свойствами.
@return Итоговый объект.
*/
function addObject (p_obj, p_added) {
  var result = new Object ();
  for (s in p_obj) {
    result[s] = p_obj[s];
  }
  for (s in p_added) {
    result[s] = p_added[s];
  }
  return (result);
}

/**
@class  service_imacros
@brief  Вывод alert для тестирования. Регулируется возникновение через глобальную константу DEBUG_FLAG.
@param  p_text        Выводимый текст.
@return -
*/
function alertDebug (p_text) {
  if (typeOf (DEBUG_FLAG) !== "undefined") {
    if (DEBUG_FLAG) {
      alert (p_text);
    }
  }
}

/**
@class service_imacros
@brief Функция отправляет запрос и получает ответ через вкладку браузера.
@param  loc_http      Адрес запроса.
        parse_on  0   Выводить данные без парсинга.
                  1   Получать данные из JSON строки.
@return Ответ в формате JSON (до функции\после функции parse)
                  -1  Ошибка
*/
function JSON_tab_v2 (loc_http, parse_on) {
  var result = 0;
  
  var loc_macros = "CODE:SET !EXTRACT_TEST_POPUP NO"+"\n";
  
  loc_macros += "TAB OPEN" + "\n";
  loc_macros += "TAB T=2" + "\n";
  loc_macros += "URL GOTO=" + loc_http + "\n";
  loc_macros += "TAG POS=1 TYPE=BODY ATTR=* EXTRACT=TXT"+"\n";
  iimPlay(loc_macros);
  
  result = iimGetLastExtract();
  iimDisplay (result);
  if (parse_on) {
    try {
      result = JSON.parse(result);
    } catch (loc_error) {
      result = -1; 
    }
  }
  
  loc_macros = "CODE:SET !EXTRACT_TEST_POPUP NO"+"\n";
  loc_macros += "TAB CLOSE"+"\n";
  iimPlay(loc_macros);
  
  return (result);
}

/**
@class  service_imacros
@brief  Convert local path to url for browser.
@param  pLocalPath              Local path for converting
        pGo                     Go to the page
          0                     no
          1                     yes
@return Converted path in url format
*/
function LocalPathToURL (pLocalPath, pGo) {
  var result = 'file:///';

  var l_localpath = pLocalPath.replace(/\\+/g,"/");
  l_localpath = l_localpath.replace(/\s/g, "%20");

  result += l_localpath;

  if (pGo === 1) {
    iimPlayCode ("TAB OPEN\nTAB T=2\nURL GOTO=\"" + result + "\"");
  }
  
  return (result);
}

/**
@class  service_imacros
@brief  Define ip
@param  -
@return [0-255].[0-255].[0-255].[0-255]
        -1                 Error
*/
function GetIP () {
  var result = -1;
  var delay_time = 5;

  var regexp_ip = /([0-9]{1,3}\.){3}[0-9]{1,3}/;

  var get_ip_url = [
    "http://www.myexternalip.com/raw",
    "http://bot.whatismyipaddress.com",
    "http://ip.jsontest.com/",
    "https://wtfismyip.com/text"
  ];
  var url_length = get_ip_url.length;
  // Additional list of possible IP disovery sites by z3r0c00l12.
  // http://corz.org/ip
  // http://icanhazip.com
  // http://ip.appspot.com - bad
  // http://ip.eprci.net/text - good
  // http://ip.jsontest.com/
  // http://services.packetizer.com/ipaddress/?f=text
  // http://whatthehellismyip.com/?ipraw
  // http://wtfismyip.com/text
  // http://www.networksecuritytoolkit.org/nst/tools/ip.php
  // http://www.telize.com/ip
  // http://www.trackip.net/ip

  var loc_macros = "";
  var page_text = '';

  for (i = 0; i < url_length; i++) {
    loc_macros = "CODE:SET !EXTRACT_TEST_POPUP NO" + "\n";
    loc_macros += "TAB OPEN" + "\n";
    loc_macros += "TAB T=2" + "\n";
    loc_macros += "URL GOTO=" + get_ip_url[i] + "\n";
    loc_macros += "TAG POS=1 TYPE=BODY ATTR=* EXTRACT=TXT"+"\n";
    loc_macros += "TAB CLOSE" + "\n";
    if (iimPlay (loc_macros) === 1) {
      page_text = iimGetLastExtract();
      if (page_text.search(regexp_ip) !== -1) {
        result = page_text.match(regexp_ip);
        if (result === null) {
          result = -1;
        }
        else {
          result = result[0];
        }
        break;
      }
    }
    Delay (delay_time);
  }
  
  return (result);
}

/**
@class  service_imacros
@brief  Search element in array.
@param  p_array             Array
        p_element           Searching value
@return  index              Index of first found element
        -1                  Error, or not found
*/
function searchInArray (p_array, p_element) {
  var result = -1;
  var l = 0;

  if (Array.isArray(p_array)) {
    l = p_array.length;
    for (cur_i = 0; cur_i < l; cur_i++) {
      if (p_array[cur_i] === p_element) {
        result = cur_i;
        break;
      }
    }
  }
  else {
    //result = -1;
  }

  return (result);
}

function esc2Uni(str) {
  var regExp = /\\?u([\d\w]{4})/gi;
  var escapedCodeTemp = str.replace(regExp, function (match, group) {
      return String.fromCharCode(parseInt(group, 16)); 
    });
  return  unescape(escapedCodeTemp);
}

// UTF-8 encode / decode by Johan Sundstr?m
function encode_utf8( s )
{
  return unescape( encodeURIComponent( s ) );
}

function decode_utf8( s )
{
  return decodeURIComponent( escape( s ) );
}

/**
@class  service_imacros
@brief  Define data type with array type
@param  p_                  Checked variable
@return Like as typeof output, except
          array             Array type
*/
function realIsObj (p) {
  var result = "";

  if (typeof p === "object") {
    if (Array.isArray(p)) {
      result = "array";
    }
  }
  if (result !== "array") {
    result = typeof p;
  }
  
  return (result);
}

/**
@class  service_imacros
@brief  Validate object in order to example
@param  p_example           Example structure
        p_obj               Checked object
@return {
          status
            1               valid object
            -1              not valid
          text
            this            Not valid property
        }
*/
function validate_data (p_example, p_obj) {
  var result = {
    status: 1,
    text: "this"
  };
  var prev_result = {
    status: 1,
    text: "this"
  };

  var par;

  if (typeof p_example === typeof p_obj) {
    if (realIsObj(p_example) === "object") {
      for (par in p_example) {
        if (typeof p_obj[par] === "undefined") {
          result.status = -1;
          result.text = result.text + "." + par;
          break;
        }
        else {
          prev_result = validate_data (p_example[par], p_obj[par]);
          if (prev_result.status === -1) {
            result.status = -1;
            result.text = prev_result.text.replace ("this", "this." + par);
            break;
          }
        }
      }
    }
    else {
      //result.status = 1
    }
  }
  else {
    result.status = -1;
    // result.text = "this";
  }

  return (result);
}

/**
@class  service_imacros
@brief  Read data properties
@param  p_obj               Object
        p_level             Counts of level
          -1                All levels
@return string
          -1                Error
*/
function objToTxt (p_obj, p_level = -1) {
  var res_txt = "";
  var prev_res = "";
  var next_lvl = -1;

  if (p_level !== 0) {
    if (p_level > 0) {
      next_lvl = p_level - 1;
    }
    if (realIsObj (p_obj) === "object"){
      for (par in p_obj) {
        try {
          res_txt += objToTxt(p_obj[par], next_lvl).replace("this", "this." + par);
        }
        catch (e) {
          res_txt += p_obj[par] + ": error\n";
        }
      }
    }
    else {
      res_txt += "this = " + String(p_obj).slice(0, 30) + "\n";
    }
  }
  else {
    if (realIsObj (p_obj) === "string") {
      res_txt += "this = " + String(p_obj).slice(0, 30) + "\n";
    }
    else {
      res_txt += "this type " + realIsObj (p_obj) + "\n";
    }
  }

  return (res_txt);
}

/**
@class  service_imacros
@brief  Exec application. Example: _startExe('C:\\Key-6.exe')
@param  put                 Fullpath exe
        args                Parameters array
@return  
*/
function _startExe(put,args=[]){ 
  var Cc=Components.classes, Ci=Components.interfaces;
  var proc=Cc["@mozilla.org/process/util;1"].createInstance(Ci.nsIProcess);
  var file=Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsILocalFile);
  file.initWithPath(put);
  proc.init(file);
  proc.run(false, args, args.length); 
}

/**
@class  service_imacros
@brief  Include library
@param  inputURL            Lib URL
@return   true              Success
          false             Error
*/
function importLib(inputURL) {
  iimPlay('CODE: CLEAR');
  if ($ !== undefined) {
    // jquery already loaded
    return true;
  }
  var jqueryURL = inputURL || 'http://code.jquery.com/jquery.min.js'
  var result = loadScriptAtURL(jqueryURL);
  return result;
}
function loadScriptAtURL(url) {

  var request = new XMLHttpRequest();
  var async = false;
  request.open('GET', url, async);

  request.send();
  // because of "false" above, will block until the request is done and status
  // is available. Not recommended, however it works for simple cases.
  if (request.status !== 200) {
    var message = 'an error occurred while loading script at url: ' + url +', status: ' + request.status;
    iimDisplay(message);
    return false;
  }
  eval(request.response);
  return true;
}

/**
@class  service_imacros
@brief  Minimize and maximize window.
@param  p_max
          -1                Window in tray
          0                 Window out of tray
          1                 Window maximize
@return  
*/
function maximizeWindow (p_max = 1) {
  var result = 1;
  
  var mainWindow = window.QueryInterface(Components.interfaces.nsIInterfaceRequestor).getInterface(Components.interfaces.nsIWebNavigation).QueryInterface(Components.interfaces.nsIDocShellTreeItem).rootTreeItem.QueryInterface(Components.interfaces.nsIInterfaceRequestor).getInterface(Components.interfaces.nsIDOMWindow);
  window.console.log("for test 1150");
  window.console.log(mainWindow);

  if (p_max > -1) {
    mainWindow.maximize();
    if (p_max !== 1) {
      mainWindow.onTitlebarMaxClick();
    }
  }
  else {
    mainWindow.minimize();
  }

  return (result);
}

/**
@class  service_imacros
@brief  Adding panels
@param  -
@return  -
*/
function addingPanels () {
  var result = 1;

  var mainWindow = window.QueryInterface(Components.interfaces.nsIInterfaceRequestor).getInterface(Components.interfaces.nsIWebNavigation).QueryInterface(Components.interfaces.nsIDocShellTreeItem).rootTreeItem.QueryInterface(Components.interfaces.nsIInterfaceRequestor).getInterface(Components.interfaces.nsIDOMWindow);
  d='document';
  qs='querySelector';
  qsA='querySelectorAll';
  ind='indexOf';
  sp='split';
  inner='innerHTML';
  text='textContent';
  len='length';
  re='replace';
  doc=mainWindow.document;
  pCom=Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
  function sel(sk, sl){var isk=content[d][qs](sk);if(isk&&isk[inner][ind](sl)+1)return true;else return};
  function FormBar(element,id,parend,parametr) {
    if(!doc[qs]('#'+id)) {
      var but = doc.createElement(element);
      this.but = but;
      but.id=id;
      for(i=3;i<arguments.length; i++) {
        but.setAttribute (arguments[i].split('|')[0], arguments[i].split('|')[1])
      }
      doc[qs](parend).appendChild(but);
      this.closeBut = function(kolVo) {
        but.addEventListener("click",function() {for(i=0;i<kolVo; i++){doc[qs](parend).removeChild(doc[qs](parend).lastChild)}})
      }
    }
  };
  var panel =new FormBar('toolbar','myToolbar','#navigator-toolbox');
  if(!doc[qs]('#myToolbarClose')){
    var panelClose =new FormBar('toolbarbutton','myToolbarClose','#myToolbar', 'label|X').closeBut(4)
  }
  var textbox= new FormBar('textbox','myTextbox','#myToolbar', 'multiline|true');
  var textbox1= new FormBar('textbox','myTextbox1','#myToolbar', 'multiline|true');
  var bokPanel= new FormBar('tree','vbox2','#browser', 'treecols|chromeclass-extrachrome','width|200', 'multiline|true');
  if(!doc[qs]('#bokPanelClose')){
    var panelClose =new FormBar('toolbarbutton','bokPanelClose','#browser', 'label|X').closeBut(2);
  }
  
  return (result);
}

//-----------//Завершение - служебные функции Imacros//--------------

//-------------------------//Взаимодействие с контекстом//------------------------

/**
@class  globalThis
@brief  Get scroll-Y
@param  -
@return Number
*/
function getScroll_Y () {
  return (this.window.scrollY);
}

/**
@class  globalThis
@brief  Set scrolling
@param  x,y                 Coordinates
@return 1                   Success
        -1                  Error
*/
function setScroll(px, py) {
  var result = 1;
  
  this.window.scroll(0, 0);

  return (result);
}

/**
@class  globalThis
@brief  Get url this page
@param  -
@return URL
*/
function GetCurrentURL () {
  return (String(this.window.location));
}

/**
@class  globalThis
@brief  Get frames count
@param  -
@return Frames count on page
*/
function getFramesCount () {
  return (this.window.length);
}

/**
@class  globalThis
@brief  Common adress to Global. Do not work!
@param  p_                  String - property or method
        [args]              Arguments for method
@return Property or method result
*/
function global (p_, ...p_array) {
  var result = 1;
  var context = this;
  
  if (p_array.length > 0) {
    // context = context["window"];
    // context = context["scroll"];
    // result = this[p_].apply(this, p_array);
    // this.window.scroll (0,0);
    result = this.window.scroll.apply(context, p_array);

    // result = context.apply(this, p_array);
  }
  else {
    result = this[p_];
  }

  return (result);
}

/**
@class  globalThis
@brief  Close window
@param  -
@return -
*/
function winClose () {this.window.close();}

/**
@class  globalThis
@brief  Calculate average tag size with the same class
@param  p_class             Class name
        p_mode              Mode
          "textContent"       Define size like a length of textContent
          "Area"            Define size like a square of tag
@return Average num of chars
        -1                  No elements with the class
*/
function avgSizeClass (p_class, mode = "textContent") {
  var elems = this.window.document.getElementsByClassName(p_class);
  var len = elems.length;
  var sum_length = 0;
  var avg = 0;

  if (mode === "textContent") {
    for (var i = 0; i < len; i++) {
      sum_length += elems[i].textContent.length;
      // sum_length += elems[i].innerHTML.length;
    }

    if (len > 0) {
      avg = sum_length/len;
    }
    else {
      avg = -1;
    }
  }
  else {
    //
  }
  
  return (avg);
}

/**
@class  globalThis
@brief  Extract all tags with the class
@param  p_class             Class name
@return Joined tags with the class
*/
function getAllClassTags (p_class) {
  var result = '';
  var elems = this.window.document.getElementsByClassName(p_class);
  var len = elems.length;

  for (var i = 0; i < len; i++) {
    result += elems[i].innerHTML;
  }

  return (result);
}

/**
@class  globalThis
@brief  Back page
@param  -
@return 1                   Success
        -1                  Error
*/
function backNavi () {
  var result = 1;
  try {
    this.window.back();
  }
  catch(err) {
    result = -1;
    Delay(2);
    // this.window.close();
    iimPlayCode ("TAB CLOSE");
  }
  return(result);
}

/**
@class  globalThis
@brief  Set close timeout
@param  p_s                 Timer in seconds
@return -
*/
function setCloseTimer(p_s) {
  this.window.setTimeout(winClose, (+p_s)*1000);
  // this.window.setTimeout(alert, (+p_s)*1000);
}

/**
@class  globalThis
@brief  Extract all methods and properties
@param  p_data               Researched data
@return -
*/
function extractAllMethProp(p_data) {
  var txt = "";

  try {
    txt = "";
    for (var prop in p_data) {
      txt += "" + "." + prop + " type " + (typeof p_data[prop]);
      if (typeof p_data[prop] === "string") {
        txt += "; =" + p_data[prop];
      }
      txt += "\n";
    }
  }
  catch (e) {
    txt = "";
    for (var prop in p_data) {
      txt += "" + "." + prop + "\n";
    }
  }

  toJournal("for test 1024\n" + txt);
}

/**
@class  globalThis
@brief  Refresh page
@param  -
@return -
*/
function refresh() {
  this.window.location.reload();
}

/**
@class  globalThis
@brief  Go to the page throw the GET query
@param  p_http            URL
@return 
*/
function getGo (p_http) {
  var result = 1;
  pMaxTries = 3;
  currentTry = 0;

  p_http = AddHTTP(p_http);

  var xhr = new XMLHttpRequest();

  do {
    if (currentTry > 0) {
      Delay(3);
    }
    xhr.open("GET", p_http, false);
    xhr.timeout = 30*1000;
    xhr.send();
    currentTry++;
  } while ((xhr.status !== 200) && (currentTry < pMaxTries));

  if (!(currentTry < pMaxTries)) {
    result = -1;
  }
  else {
    iimPlayCode ("TAB OPEN\nTAB T=2");

    result = xhr.responseText;
    content.document.querySelector('body').innerHTML = result;
  }
  
  return (result);
}

/**
@class  globalThis
@brief  Scroll simulating. Not working
@param  -
@return -
*/
function simScroll () {
  var result = 1;
  var uniq_class = "clizdishbach";

  var loc_a = content.window.document.createElement("a");
  loc_a.innerHTML = "<a href=\"#\" href=\"javascript:setTimout(function() {alert('for test fff')}, 1000);\" class=\"" + uniq_class + "\">!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!</a>";

  var parent_ = content.window.document.getElementsByTagName("body");
  parent_[0].innerHTML = parent_[0].innerHTML.replace(/<\/body>/, "");
  parent_[0].innerHTML = parent_[0].innerHTML + loc_a.innerHTML + "</body>";
  iimPlayCode("EVENT TYPE=CLICK XPATH=\"/descendant::a[@class='" + uniq_class + "'][1]\" BUTTON=0");

  iimDisplay("sim");
  return (result);
}

//------------------//Завершение - взаимодействие с контекстом//------------------

//-----------------//Работа с сервисом RuCaptcha//-------------------

/**
@class  Captcha
@brief  Создает модуль рекапчи
@param  -
@return Модуль рекапчи
*/
function RecaptchaModule () {
  var result = {
    serviceKey: "",
    step: "",
    frame_iimline: "",
    img_dir: "",
    img_name: "captcha.jpg",
    resize_page: "_smaller.html",
    rucaptchaSettings: {
      api: "",
      pol_dok_kap: "NO", //использовать гет запрос
      phrase_kap: "NO", // YES если 2 слова
      regsense_kap: "NO", // YES если с учетом регистра
      calc_kap: "NO", // YES если с математическим выражением
      min_len_kap: "", // минимальная длина
      max_len_kap: "", // максимальная длина
      language_kap: "1", // язык 1 - russian 2 - english
      textinstructions :  "",
      numeric_kap: "2", // язык 1 - только цифры 2 - только буквы 3 - цифры и буквы
      soft_id_kap: "",
    },
    trueSizes: [
      {x: 2, y: 4, count: 8},
      {x: 3, y: 3, count: 9},
      {x: 4, y: 4, count: 16}
    ],
    isStatic: false,
    findParam: "SIZE", //for test, default "SIZEnSTATIC"
    findParamList: [
      "SIZE",
      "STATIC",
      "SIZEnSTATIC"
    ],
    clickInstructions: "",
    size: {
      x: 0,
      y: 0,
      count: 0
    },
    APITroubles: false,
    saveRecaptchaExamples: true,
    zeroLengthClickInstructions: 1,
    maxTries: 10,
    status: 0,
    statusList: {
      afterInit:              0,
      afterReset:             1,
      recaptchaHere:          2,
      checked:                3,
      noRecaptcha:            4,
      apiTroubles:            5,
      tryAgain:               6,
      findWrongMode:          7,
      overTryFind:            8,
      truelyCaptcha:          9,
      errorReload:           10,
      undefinedSize:         11,
      errorSendToRecognize:  12,
      errorClickInstruction: 13
    },

    /**
    @class    Captcha
    @brief    Функция определяет, есть ли на странице Recaptcha
    @param    -
    @return   true                Рекапча есть
              false               Рекапчи нет
    */
    recaptchaHere: function () {
      var loc_result = false;
      if (iimPlayCode('SET !TIMEOUT_STEP 0\nTAG POS=1 TYPE=script ATTR=src:*recaptcha*') === 1) {
        loc_result = true;
        this.status = this.statusList.noRecaptcha;
      }
      else {
        this.status = this.statusList.recaptchaHere;
      }
      return (loc_result);
    },

    /**
    @class  Captcha
    @brief  Определяет фрейм рекапчи
    @param  -
    @return строка вида 'FRAME name=...'
    */
    SetFrame: function () {
      var f2 = "";
      iimPlayCode('SET !TIMEOUT_STEP 0\nTAG POS=1 TYPE=iframe ATTR=src:*recaptcha/api2/frame?c=* extract=htm');
      var frame_adr = iimGetExtract();
      if (frame_adr === "#EANF#") {
      	//
      }
      else {
      	f2 = 'FRAME ' + frame_adr.match(/name=".*?"/)+'\n';
	      this.frame_iimline = f2;
      }
      iimDisplay (f2);
      return (f2);
    },

    /**
    @class  Captcha
    @brief  Нажимает на чекбокс рекапчи
    @param  -
    @return Код выполнения iMacros
    */
    click: function () {
      var f1='FRAME NAME=undefined\n';
      var read_f_name_iim = "SET !TIMEOUT_STEP 0\n"+f1+"TAG POS=1 TYPE=DIV ATTR=ROLE:presentation" + "\n";
      read_f_name_iim += "WAIT SECONDS=5" + "\n";
      return (iimPlayCode (read_f_name_iim));
    },

    /**
    @class  Captcha
    @brief  Обновляет капчу, пока не найдет подходящую палету картинок
    @param  pMode
              "SIZE"              По размеру
              "STATIC"            По статичности
              "SIZEnSTATIC"       По размеру и статичности
    @return true                  Найден подходящий вариант
            false                 Не найден подходящий вариант
    */
    find: function (pMode, pMaxTries) {
      const MODE = {
        SIZE: 1,
        STATIC: 2,
        SIZEnSTATIC: 3
      }
      this.step = "Find captcha";

      var flag_truely = false;
      var tries = 0;
      if (!pMaxTries) {
        pMaxTries = 10;
      }
      var flagFirstItteration = true;
      var flagExitError = false;
      while ((tries < pMaxTries) && (!flag_truely)) {
        if (flagFirstItteration) {
          flagFirstItteration = false;
        }
        else {
          this.reloadRecaptcha();
        }
        switch (pMode) {
          case "SIZE":
            this.SetSize();
            flag_truely = this.trueSize();
          break;
          case "STATIC":
            this.SetStaticDynamic();
            flag_truely = this.isStatic;
          break;
          case "SIZEnSTATIC":
            this.SetSize();
            if (this.trueSize()) {
              this.SetStaticDynamic();
              flag_truely = this.isStatic;
            }
            // flag_truely = this.trueSize() && this.isStatic;
          break;
          default:
            this.status = this.statusList.findWrongMode;
            flagExitError = true;
          break;
        }
        if (flagExitError) {
          break;
        };
        tries++;
      }

      if (flag_truely) {
        this.status = this.statusList.truelyCaptcha;
      }
      else {
        if (!(tries < pMaxTries)) {
          if (!flagExitError) {
            this.status = this.statusList.overTryFind;
          }
        }
      }
      
      this.step = "After find captcha";
      return (flag_truely);
    },

    /**
    @class    Captcha
    @brief    Функция обновляет ReCAPTCHA.
    @param    -
    @return   Код выполнения iMacros
    */
    reloadRecaptcha: function () {
      var result = iimPlayCode(this.frame_iimline + 'EVENT TYPE=CLICK XPATH=\"\//div[@id=\'recaptcha-reload-button\']\" BUTTON=0');
      return (result);
    },

    /**
    @class  Captcha
    @brief  Определяет, восстанавливаются ли картинки.
              Static - картинки остаются
              Dynamic - картинки обновляются
    @param  -
    @return true                Static
            false               Dynamic
    */
    SetStaticDynamic: function () {
      var result = false;
      //[директива случайного ввода, количество нажатий]
      var localInstructions = [0, 1];
      //если сразу после клика этот тег есть, то это dynamic
      //td[@class, 'rc-imageselect-dynamic-selected']
      //Если есть этот тег, то это static
      //td[class="rc-imageselect-tileselected"]
      localInstructions = this.recaptchaResolve (localInstructions);

      var loc_macros = "SET !EXTRACT_TEST_POPUP NO" + "\n";
      loc_macros += this.frame_iimline;
      loc_macros += "SET !TIMEOUT_STEP 1" + "\n";
      loc_macros += "TAG XPATH=\"//td[contains (@class, \'rc-imageselect-tileselected\')]\"" + "\n";
      var status_iim = iimPlayCode (loc_macros);

      result = !!(status_iim === 1);
      this.isStatic = result;
      if (result) {
        this.recaptchaResolve (localInstructions);
      }
      return (result);
    },

    /**
    @class  Captcha
    @brief  Сброс текущих данных
    @param  -
    @return -
    */
    resetData: function () {
      this.step = "After reset";
      //this.function_again = function () {alert ("No function again")};
      this.frame_iimline = "";
      this.rucaptchaSettings.textinstructions = "";
      this.clickInstructions = "";
      this.size.x = 0;
      this.size.y = 0;
      this.size.count = 0;
      this.APITroubles = false;
      this.status = this.statusList.afterReset;
    },

    /**
    @class  Captcha
    @brief  Установка параметров
    @param  Параметры для инициализации
            pServiceKey           Ключ от сервиса распознавания капчи
            pDir                  Рабочая папка проекта, для сохранения капчи
    @return -
    */
    SetData: function (pServiceKey, pDir) {
      this.serviceKey = pServiceKey;
      if (pDir.indexOf ("\\\\")===-1) {
        this.img_dir = pDir.replace (/\\/g, "\\\\");
      }
      else {
        this.img_dir = pDir;
      }
    },

    /**
    @class  Captcha
    @brief  Определяет, есть ли проблемы с API рекапчи
    @param  -
    @return false               Проблем с API нет
            true                Есть проблемы с API
    */
    isAPItroubles: function () {
      var loc_result = false;
      if ("INVALID_API" === IdentifyPages("INVALID_API")) {
        loc_result = true;
        this.status = this.statuslist.apiTroubles;
      };
      this.APITroubles = loc_result;
      return (loc_result);
    },

    /**
    @class  Captcha
    @brief  Получает ссылку на функцию, совершающую действия от начала 
      блока действий до рекапчи. Например, InputData
    @param  В свойство записывается функция
    @return -
    */
    function_again: function () {alert ("No function again")},

    /**
    @class  Captcha
    @brief  Создает обертку функции function_again, замыкая её. 
      Вызывается из функции, ссылку на которую нужно получить
    @param  pArgs           arguments от функции, на которую получается: createFunctionAgain (arguments)
      ссылка
    @return  1                Выполнено успешно
              0               Ошибка при выполнении
    */
    createFunctionAgain: function (pArgs) {
      var result = 1;
      this.function_again = (function () {
        var loc_args = pArgs;
        return function () {
        	iimPlayCode("TAB CLOSE");
          loc_args.callee(loc_args);
          //pFunc(loc_args);
        };
      }());
      return (result);
    },

    /**
    @class  Captcha
    @brief  Перезагружает страницу
    @param  -
    @return Код выполнения iMacros
    */
    reloadPage: function () {
      var iimStatus = iimPlayCode ("REFRESH");
      if (iimStatus===1) {
        //
      }
      else {
        this.status = this.statusList.errorReload;
      }
      return (iimStatus);
    },

    /**
    @class  Captcha
    @brief  Определяет размер капчи
    @param  -
    @return {
              x: 0,           Изображений в длину
              y: 0,                       в высоту
              count: 0        Общее число изображений
            }
    */
    SetSize: function () {
      var aCounts = [
        {x: 1, y: 1, count: 1},
        {x: 2, y: 4, count: 8},
        {x: 3, y: 3, count: 9},
        {x: 4, y: 4, count: 16}
      ];
      var result = {
        x: 0,
        y: 0,
        count: 0
      };

      var loci = 0;
      var txt = "";
      var error = 1;
      
      error = iimPlay('CODE:SET !TIMEOUT_STEP 1\n' + this.frame_iimline + 'TAG POS=' + aCounts[loci].count + ' TYPE=DIV ATTR=class:rc-image-tile-overlay&&TXT:* EXTRACT=TXT');
      txt = iimGetExtract();
      if (txt != "#EANF#") {
        result.count = 1;
      };

      if (result.count === 0) {
        this.status = this.statusList.undefinedSize;
      }
      else {
        for (loci = 1; loci < aCounts.length; loci++) {
          error = iimPlay('CODE:SET !TIMEOUT_STEP 1\n' + this.frame_iimline + 'TAG POS=' + (aCounts[loci].count + 1) + ' TYPE=DIV ATTR=class:rc-image-tile-overlay&&TXT:* EXTRACT=TXT');
          txt = iimGetExtract();
          if (txt == "#EANF#") {
            //Следующей картинки нет
            result = aCounts[loci];
            break;
          };
        };
      };
      this.size = result;
      return (result);
    },

    /**
    @class  Captcha
    @brief  Управляет модулем для определения капчи.
    					Время распознавания - 5..10 минут.
    @param  -
    @return  Статус модуля
    */
    streamGo: function () {
      var locmaxTries = this.maxTries;
      var flagFinded = false;
      var clickInst = new Array();
      var lastInstructionsLength = 0;
      var flagcheckStatic = true;

      while (this.status !== this.statusList.checked) {
      	//2016 протестировать isTryAgain
        if (this.isTryAgain()) {
        	lastInstructionsLength = 0;
        	flagcheckStatic = true;
        }
        else {
        	if ((!(this.recaptchaHere ())) || (this.isAPItroubles())) {
            this.resetData();
            this.function_again();
            continue;
          }
          if (this.isChecked()) {
            continue;
          }
          if (this.SetFrame()) {
        		//
        	}
        	else {
        		this.click();
          	this.SetFrame();
        	}
        }

        flagFinded = this.find(this.findParam, locmaxTries);
        if (!flagFinded) {
          this.resetData();
          iimPlayCode("TAB CLOSE");
          this.function_again();
          continue;
        }
        if (flagcheckStatic) {
        	this.SetStaticDynamic();
        	flagcheckStatic = false;
        }
        this.saveIMG ();
        this.saveTextInstructions ();
        this.rucaptchaSettings.textinstructions += " Если отсутствует - нажмите несколько любых.";
        this.saveExample();
        this.sendToRecognize(locmaxTries);
        clickInst = this.GetClickInstructionsLength();
        if (this.isStatic) {
        	this.recaptchaResolve(clickInst.instrArray);
        	this.confirm();
        	this.isChecked();
        }
        else {
	      	if ((clickInst.len > lastInstructionsLength) || (clickInst.len === 0)){
	      		if (lastInstructionsLength !== 0) {
	      			this.confirm();
	        		this.isChecked();
	      		}
	      		else {
	      			lastInstructionsLength = clickInst.len;
	      			this.recaptchaResolve(clickInst.instrArray);
	      		}
	      	}
	      	else {
	      		if (!clickInst.error) {
		          this.recaptchaResolve(clickInst.instrArray);
		          lastInstructionsLength = clickInst.len;
		        }
	      	}
	      }
      	iimDisplay(lastInstructionsLength + "\n" + clickInst.len);
      }
      return (this.status);
    },

    /**
    @class  Captcha
    @brief  Подтверждает ввод
    @param  -
    @return Код выполнения iMacros
    */
    confirm: function () {
      var result = iimPlayCode(this.frame_iimline + 'EVENT TYPE=CLICK XPATH=\"\//div[@id=\'recaptcha-verify-button\']\" BUTTON=0');
      return (result);
    },

    /**
    @class  Captcha
    @brief  Капча пройдена
    @param  -
    @return true                Капча пройдена
            false               Капча не пройдена
    */
    isChecked: function () {
      var result = false;
      
      var f2 = "FRAME NAME=\"undefined\"" + "\n";

      var iim_status = iimPlayCode (f2 + "SET !TIMEOUT_STEP 0\nTAG XPATH=\"\//span[contains (@class, \'recaptcha-checkbox goog-inline-block recaptcha-checkbox-unchecked rc-anchor-checkbox recaptcha-checkbox-checked\')]\"");
      if (iim_status===1) {
        result = 1;
        this.status = this.statusList.checked;
      }
      return (result);
    },

    /**
    @class  Captcha
    @brief  Редактирование картинки - уменьшение размеров и объема
      300x300
      400x400
      10кБ< <100кБ
    @param  -
    @return - 
    */
    changeSizePict: function () {
      var path_save_url = this.img_dir.replace(/\\+/g,"/");
      path_save_url = path_save_url.replace(/\s/g, "%20");
      var resize_macros = "CODE:SET !EXTRACT_TEST_POPUP NO"+"\n";
      resize_macros += "TAB OPEN"+"\n";
      resize_macros += "TAB T=2"+"\n";
      resize_macros += "URL GOTO=file:\///" + path_save_url + "/" +  this.resize_page + "\n";
      resize_macros += "ONDOWNLOAD FOLDER=\"" + this.img_dir + "\" FILE="+ this.img_name +"\n";
      
      if (this.size.count===9) {
        resize_macros += "TAG POS=1 TYPE=IMG ATTR=SRC:* CONTENT=EVENT:SAVE_ELEMENT_SCREENSHOT" + "\n";
      }
      else if (this.size.count===16) {
        resize_macros += "TAG POS=2 TYPE=IMG ATTR=SRC:* CONTENT=EVENT:SAVE_ELEMENT_SCREENSHOT"+"\n";
      }
      iimPlay (resize_macros);
    },

    /**
    @class  Captcha
    @brief  Сохраняет рекапчу (изображение)
    @param  -
    @return Код выполнения iMacros
    */
    saveIMG: function () {
      var iim_status = iimPlayCode('ONDOWNLOAD FOLDER="' +  this.img_dir + '" FILE=' + this.img_name + ' WAIT=YES\n'+ this.frame_iimline +'TAG POS=1 TYPE=DIV ATTR=class:rc-imageselect-challenge CONTENT=EVENT:SAVE_ELEMENT_SCREENSHOT');

      return (iim_status);
    },

    /**
    @class  Captcha
    @brief  Сохраняет текст капчи
    @param  -
    @return -
    */
    saveTextInstructions: function () {
      iimPlayCode(this.frame_iimline + 'TAG POS=1 TYPE=DIV ATTR=class:rc-imageselect-desc-no-canonical EXTRACT=HTM');
      var text = iimGetLastExtract();
      //delete <span> text, small
      text = text.replace (new RegExp("<span>.*</span>", ""), "");
      //delete tags
      text = text.replace (new RegExp("<\/?[a-z][^>]*(>|$)", "g"), "");
      this.rucaptchaSettings.textinstructions = text;
    },

    /**
    @class  Captcha
    @brief  Отправляет в Rucaptcha
    @param  -
    @return 1               Выполнено успешно
            -1              Ошибка при выполнении
    */
    sendToRecognize: function (pMaxTries) {
      var result = 1;
      var fullPathCaptcha = this.img_dir + "\\\\" + this.img_name;
      var locTries = 0;
      var macroKap = "CODE:SET !EXTRACT_TEST_POPUP NO"+"\n";
      macroKap += "TAB OPEN" + "\n";
      macroKap += "TAB T=2" + "\n";
      iimPlay(macroKap);
      
      macroKap = "CODE:SET !EXTRACT_TEST_POPUP NO"+"\n";
      macroKap += "URL GOTO=http://imacros2.rucaptcha.com/new/" + "\n"; //ЗАХОД НА КАПЧУ
      macroKap += "TAG POS=1 TYPE=INPUT:TEXT FORM=ACTION:getcapcha.php ATTR=TYPE:text&&VALUE:&&NAME:key&&SIZE:64 CONTENT=" + this.serviceKey + "\n";
      macroKap += "TAG POS=1 TYPE=INPUT:FILE FORM=ACTION:getcapcha.php ATTR=NAME:file CONTENT={{FULLKAP}}" + "\n";
      macroKap += "TAG POS=1 TYPE=INPUT:TEXT FORM=ACTION:getcapcha.php ATTR=NAME:language CONTENT=" + this.rucaptchaSettings.language_kap + "\n";
      macroKap += "TAG POS=1 TYPE=INPUT:TEXT FORM=ACTION:getcapcha.php ATTR=NAME:numeric CONTENT=" + this.rucaptchaSettings.numeric_kap + "\n";
        //macroKap += "TAG POS=1 TYPE=INPUT:TEXT FORM=ACTION:getcapcha.php ATTR=NAME:textinstructions CONTENT=abc" + textinstructions + "\n";
      macroKap += "TAG POS=1 TYPE=INPUT:TEXT FORM=ACTION:getcapcha.php ATTR=NAME:textinstructions CONTENT=\"" + this.rucaptchaSettings.textinstructions + "\"\n";
      macroKap += "TAG POS=1 TYPE=INPUT:CHECKBOX FORM=ACTION:getcapcha.php ATTR=NAME:recaptcha CONTENT=YES" + "\n";
      macroKap += "TAG POS=1 TYPE=INPUT:TEXT FORM=ACTION:getcapcha.php ATTR=NAME:recaptchacols CONTENT=" + this.size.x + "\n";
      macroKap += "TAG POS=1 TYPE=INPUT:TEXT FORM=ACTION:getcapcha.php ATTR=NAME:recaptcharows CONTENT=" + this.size.y + "\n";
      macroKap += "TAG POS=1 TYPE=INPUT:SUBMIT FORM=ACTION:getcapcha.php ATTR=*" + "\n";

      do {
        iimSet("FULLKAP",fullPathCaptcha);
        locTries++;
      } while ((iimPlay(macroKap)!==1)  && (locTries < pMaxTries));

      if (!(locTries < pMaxTries)) {
        result = -1;
        this.status = this.statusList.errorSendToRecognize;
        //for test
        iimDisplay (macroKap);
        iimPlayCode("PAUSE");
        this.display();
      }
      else {
        iimPlayCode ("WAIT SECONDS=1\nTAG POS=1 TYPE=BODY ATTR=* EXTRACT=TXT");
        var captchaOutput = iimGetLastExtract();
        iimDisplay("капча - " + captchaOutput);
        this.clickInstructions = captchaOutput;
      }
      
      iimPlayCode("TAB CLOSE");
      return (result);
    },

    /**
    @class  Captcha
    @brief  Знак того, что нужно пройти капчу еще раз
    @param  -
    @return true                    Есть призыв пройти капчу снова
            false                   Проходить снова капчу не требуется
    */
    isTryAgain: function () {
      var result = false;
      var tagHere = iimPlayCode(this.frame_iimline + "SET !TIMEOUT_STEP 0\nTAG XPATH=\"//div[@class=\'rc-imageselect-incorrect-response\']\"");
      var attrHere = iimPlayCode(this.frame_iimline + "SET !TIMEOUT_STEP 0\nTAG XPATH=\"//div[@class=\'rc-imageselect-incorrect-response\']/self::*[contains(@style, \'none\')]\"");
      //Если нет ни первого ни второго - false
      //Есть первое нет второго - true
      //нет первого есть второе - невозможный вариант
      //есть первое и второе - false
      if (tagHere===1) {
      	if (attrHere!==1) {
      		result = true;
      		this.status = this.statusList.tryAgain;
      	}
      }
      return (result);
    },

    /**
    @class  Captcha
    @brief  Определяет длину кликовой инструкции
    @param  -
    @return  Длина кликовой инструкции
              {
                len: 0,        Длина
                instrArray: [],   Массив с номерами изображений, на которые нужно нажать
                error: false      Если инструкция некорректная - error=true
              }
    */
    GetClickInstructionsLength: function () {

      var result = {
        len: 0,
        instrArray: [],
        error: false
      };
      //иногда ERROR_CAPTCHA_UNSOLVABLE означает нет решений
      if (this.clickInstructions.search("ERROR_CAPTCHA_UNSOLVABLE")!==-1) {
        result.error = true;
        this.status = this.statusList.errorClickInstruction;
      }
      else {
        if (this.clickInstructions.search("click:")===-1) {
          result = -1;
          result.error = true;
        this.status = this.statusList.errorClickInstruction;
        }
        else {
          var loc_answer = this.clickInstructions.replace ("click:", "");
          var answer_array = loc_answer.split('/');
          result.len = answer_array.length;
          result.instrArray = answer_array;
        }
      }
      return (result);
    },

    /**
    @class  Captcha
    @brief  Вводит инструкцию
    @param  aClicks           Массив номеров картинок для нажатия
              [0, a]          Случайным образом нажимает на a картинок
    @return  []               Массив нажатий
    */
    recaptchaResolve: function (aClicks) {
    	var doFlag = true;
      //Генерация случайных кликов
      try {
      	if (aClicks[0] === 0 ) {
	        var randClicks = (aClicks[1] > 0) ? aClicks[1] : 1;
	        // aClicks is undefined, line 882
	        var currentRand = 0;
	        for (var i = 0; i < this.size.count; i++) {
	          aClicks[i] = i+1;
	        }
	        aClicks = shuffle(aClicks);
	        aClicks = aClicks.slice (1, (randClicks+1));
	      }
      }
      catch (err) {
      	//alert ("1723 fortest: error " + err);
      	doFlag = false;
      }

      var macros = "CODE:SET !EXTRACT_TEST_POPUP NO"+"\n";
      if (doFlag) {
      	macros += this.frame_iimline;
	      for (var i = 0; i < aClicks.length; i++) {
	        macros += 'TAG POS=' + aClicks[i] + ' TYPE=DIV ATTR=class:rc-image-tile-overlay&&TXT:*' + "\n";
	        macros += "WAIT SECONDS=1" + "\n";
	      }
	      iimPlay (macros);
      }
      return (aClicks);
    },

    //2016 дописываем модуль
    /**
    @class  Captcha
    @brief  Обновляет статус
    @param  -
    @return -
    */
    updateStatus: function () {
      if (isTryAgain()) {
        //
      }
      else if (isChecked()) {
        //
      }
      else if (isAPItroubles()) {
        //
      }
    },

    /**
    @class  Captcha
    @brief  Сохраняет образец капчи
    @param  -
    @return Код выполнения iMacros
    */
    saveExample: function () {
      var iim_status = iimPlayCode('ONDOWNLOAD FOLDER=* FILE=\"' + result.rucaptchaSettings.textinstructions + '.jpg\"' + ' WAIT=YES\n' + this.frame_iimline + 'TAG POS=1 TYPE=DIV ATTR=class:rc-imageselect-challenge CONTENT=EVENT:SAVE_ELEMENT_SCREENSHOT');
    },

    /**
    @class  Captcha
    @brief  Размер совпадает с одним из разрешенных
    @param  -
    @return true        Совпадает с одним из разрешенных
            false       Не совпадает с разрешенными
    */
    trueSize: function () {
      var result = false;
      for (var i = 0; i < this.trueSizes.length; i++) {
        if (this.size.count === this.trueSizes[i].count) {
          result = true;
          break;
        }
      }
      return (result);
    },

    /**
    @class  Captcha
    @brief  Выводит данные модуля
    @param  alertFlag         Определяет, выводить ли данные в alert
              true            Выводить
              false           Не выводить
    @return  -
    */
    display: function (alertFlag) {
      var textOutput = "";

      textOutput += "serviceKey: " + this.serviceKey + "\n";
      textOutput += "frame_iimline: " + this.frame_iimline + "\n";
      textOutput += "img_dir: " + this.img_dir + "\n";
      textOutput += "textinstructions: " + this.rucaptchaSettings.textinstructions + "\n";
      textOutput += "isStatic: " + this.isStatic + "\n";
      textOutput += "clickInstructions: " + this.clickInstructions + "\n";
      textOutput += "size.x: " + this.size.x + "\n";
      textOutput += "size.y: " + this.size.y + "\n";
      textOutput += "size.count: " + this.size.count + "\n";
      textOutput += "APITroubles: " + this.APITroubles + "\n";
      textOutput += "status: " + this.status;

      iimDisplay(textOutput);
      if (alertFlag) {
        alert (textOutput);
      }
      else {
        iimPlayCode("PAUSE");
      }
    }
  };
  
  return (result);
}

/**
@class  Captcha
@brief  Рекапча решается при помощи отправки id сайта и получения кода прохождения

https://rucaptcha.com/newapi-recaptcha
Информация для нового модуля прохождения рекапчи

http://rucaptcha.com/proxyinfo.php - узнаем актуальные данные о сервере Rucaptcha

@param  -
@return  Модуль решения рекапчи
*/
function RecaptchaModule_v2 () {
  var result = {
    serviceKey: "",
    frame_iimline: "",
    sitekey: "",
    recapAnswer: "",
    captchaID: 0,
    status: 0,
    maxTries: 10,
    tryDelay_s: 15,
    statusList: {
      afterInit:              0,
      afterReset:             1,
      recaptchaHere:          2,
      checked:                3,
      noRecaptcha:            4,
      apiTroubles:            5,
      tryAgain:               6,
      findWrongMode:          7,
      overTry:                8,
      truelyCaptcha:          9,
      errorReload:           10,
      undefinedSize:         11,
      errorSendToRecognize:  12,
      errorClickInstruction: 13,
      badResponse:           14,
      badAnswerID:           15,
    },

    /**
    @class  Captcha
    @brief  Установка параметров
    @param  Параметры для инициализации
            pServiceKey           Ключ от сервиса распознавания капчи
            pDir                  Рабочая папка проекта, для сохранения капчи
    @return -
    */
    SetData: function (pServiceKey) {
      this.serviceKey = pServiceKey;
    },

    /**
    @class    Captcha
    @brief    Функция определяет, есть ли на странице Recaptcha
    @param    -
    @return   true                Рекапча есть
              false               Рекапчи нет
    */
    recaptchaHere: function () {
      var loc_result = false;
      if (iimPlayCode('SET !TIMEOUT_STEP 0\nTAG POS=1 TYPE=script ATTR=src:*recaptcha*') === 1) {
        loc_result = true;
        this.status = this.statusList.recaptchaHere;
      }
      else {
        this.status = this.statusList.noRecaptcha;
      }
      return (loc_result);
    },

    /**
    @class  Captcha
    @brief  Определяет sitekey, присвоенный Google сайту - "data-sitekey="
    @param  -
    @return  -
    */
    SetSitekey: function () {
      var loc_res = "";
      var all_page = "";
      var loc_macros = "CODE:SET !EXTRACT_TEST_POPUP NO" + "\n";
      loc_macros += "TAG POS=1 TYPE=HTML ATTR=* EXTRACT=HTM" + "\n";
      iimPlay (loc_macros);

      all_page = iimGetExtract ();
      loc_res = (RegExp(/data-sitekey=\"[^\"]+/)).exec(all_page);
      loc_res = String(loc_res).replace (/^.+\"/, "");
      this.sitekey = loc_res;
    },

    /**
    @class  Captcha
    @brief  Управляет модулем для определения капчи.
    @param  -
    @return  Статус модуля
    */
    streamGo: function () {
      var loc_result = 1;
      if (this.recaptchaHere ()) {
        this.SetSitekey();
        this.GetSolution();
        this.FillGTextarea();
      };
      return (this.status);
    },

    /**
    @class  Captcha
    @brief  Капча пройдена
    @param  -
    @return true                Капча пройдена
            false               Капча не пройдена
    */
    isChecked: function () {
      var result = false;
      
      var f2 = "FRAME NAME=\"undefined\"" + "\n";

      var iim_status = iimPlayCode (f2 + "SET !TIMEOUT_STEP 0\nTAG XPATH=\"\//span[contains (@class, \'recaptcha-checkbox goog-inline-block recaptcha-checkbox-unchecked rc-anchor-checkbox recaptcha-checkbox-checked\')]\"");
      if (iim_status===1) {
        result = true;
        this.status = this.statusList.checked;
      }
      return (result);
    },

    /**
    @class  Captcha
    @brief  Сброс текущих данных
    @param  -
    @return -
    */
    resetData: function () {
      this.status = this.statusList.afterReset;
    },

    /**
    @class  Captcha
    @brief  Получает ссылку на функцию, совершающую действия от начала 
      блока действий до рекапчи. Например, InputData
    @param  В свойство записывается функция
    @return -
    */
    function_again: function () {alert ("No function again")},

    /**
    @class  Captcha
    @brief  Отправляет запрос на Rucaptcha и получает ответ
    @param  -
    @return  -
    */
    GetSolution: function () {
      var loc_res = 1;
      var currentTry = 0;
      var current_url = GetCurrentURL();
      var currentSite = "";
      var answerID = "";
      // OK|2191555148
      var trueAnswer = RegExp (/OK\|[0-9]+/);
      var iimCode = 1;

      var locAnswerRecap = "";

      this.recapAnswer = "";

      //polandonline.vfsglobal.com/
      currentSite = RegExp(/\/\/[^\/]+/).exec(current_url);
      currentSite = String(currentSite).replace("//", "");

      var loc_macros = "CODE:SET !EXTRACT_TEST_POPUP NO" + "\n";
      loc_macros += "TAB OPEN" + "\n";
      loc_macros += "TAB T=2" + "\n";
      // Пример загрузки капчи: 
      // http://rucaptcha.com/in.php?key=YOUR_API_KEY&method=userrecaptcha&googlekey=googlekey&pageurl=site.com
      loc_macros += "URL GOTO=http://rucaptcha.com/in.php?key=" + this.serviceKey + "&method=userrecaptcha&googlekey=" + this.sitekey + "&pageurl=" + currentSite + "\n";

      // OK|2191555148
      loc_macros += "TAG POS=1 TYPE=BODY ATTR=* EXTRACT=TXT" + "\n";
      iimPlay (loc_macros);
      answerID = iimGetLastExtract();

      //Чтение решения
      if (answerID.search(trueAnswer) !== -1) {
        this.captchaID = answerID.match(/[0-9]+/);
        loc_macros = "CODE:SET !EXTRACT_TEST_POPUP NO" + "\n";
        // Адрес для получения ответа:
        // http://rucaptcha.com/res.php?key=YOUR_API_KEY&action=get&id=CAPTCHA_ID
        loc_macros += "URL GOTO=http://rucaptcha.com/res.php?key=" + this.serviceKey + "&action=get&id=" + this.captchaID + "\n";
        loc_macros += "TAG POS=1 TYPE=BODY ATTR=* EXTRACT=TXT" + "\n";
        do {
          Delay (this.tryDelay_s);
          iimCode = iimPlay (loc_macros);
          locAnswerRecap = iimGetExtract();
          currentTry++;
        } while ((currentTry < this.maxTries) && ((iimCode !== 1) || (locAnswerRecap === "CAPCHA_NOT_READY")));

        if (currentTry < this.maxTries) {
          if (locAnswerRecap.search("OK|") !== -1) {
            this.recapAnswer = locAnswerRecap.replace("OK|", "");
            this.status = this.statusList.checked;
          }
          else {
            this.status = this.statusList.badResponse;
          }
        }
        else {
          this.status = this.statusList.overTry;
        }
      }
      else {
        this.status = this.statusList.badAnswerID;
      }
      iimPlayCode("TAB CLOSE");
      return (loc_res);
    },

    /**
    @class  Captcha
    @brief  Вводит ответ Recaptcha
    @param  -
    @return  -
    */
    FillGTextarea: function () {
      // <textarea id="g-recaptcha-response" name="g-recaptcha-response" class="g-recaptcha-response" style="width: 250px; height: 40px; border: 1px solid #c1c1c1; margin: 10px 25px; padding: 0px; resize: none; "></textarea>
      var loc_macros = "CODE:SET !EXTRACT_TEST_POPUP NO" + "\n";
      loc_macros += "TAG XPATH=\"//textarea[@id='g-recaptcha-response']\" CONTENT=" + this.recapAnswer + "\n";
      iimPlay (loc_macros);

      var result = 1;
      
      return (result);
    }

  };

  return (result);
}

/**
@class    PinterestReg
@brief    Функция позволяет определить капчу через сервис RuCaptcha.
@param    rucaptcha_api   Ключ сервиса RuCaptcha
@return   result          Распознанный текст
          -1              Неизвестная ошибка при регистрации
          -2              Баланс менее 5 рублей
*/
function ReadCaptcha(rucaptcha_api, path_save) {
  var result = "";
  
  var pol_dok_kap="NO"; //использовать гет запрос
  var phrase_kap="NO"; // YES если 2 слова
  var regsense_kap="NO"; // YES если с учетом регистра
  var calc_kap="NO"; // YES если с математическим выражением
  var min_len_kap=""; // минимальная длина
  var max_len_kap=""; // максимальная длина
  var language_kap="1"; // язык 1 - russian 2 - english
  var numeric_kap="2"; // язык 1 - только цифры 2 - только буквы 3 - цифры и буквы
  var soft_id_kap=""; // не знаю, скорее всего прога ихняя
  var attr_cap="ATTR=ID:adcopy-puzzle-image-image";
  var put_kap="captcha.png";
  var full_put_kap = path_save + "\\" + put_kap;
  var macroKapSk = "CODE:SET !EXTRACT_TEST_POPUP NO"+"\n";
  macroKapSk += "ONDOWNLOAD FOLDER=*" + " FILE=" + put_kap + " WAIT=YES" + "\n"; //Закачка картинки
  macroKapSk += "TAG POS=2 TYPE=IMG ATTR=SRC:* CONTENT=EVENT:SAVE_ELEMENT_SCREENSHOT" + "\n"; //Закачка картинки
  iimPlay(macroKapSk);//скачка картинки
  
  iimSet("FULLKAP",full_put_kap);
  
  var macroKap = "CODE:SET !EXTRACT_TEST_POPUP NO"+"\n";
  macroKap += "TAB OPEN" + "\n"; //ЗАХОД НА КАПЧУ
  macroKap += "TAB T=2" + "\n"; //ЗАХОД НА КАПЧУ
  macroKap += "URL GOTO=http://imacros2.rucaptcha.com/new/" + "\n"; //ЗАХОД НА КАПЧУ
  macroKap += "TAG POS=1 TYPE=INPUT:TEXT FORM=ACTION:getcapcha.php ATTR=TYPE:text&&VALUE:&&NAME:key&&SIZE:64 CONTENT=" + rucaptcha_api + "\n";
  
  macroKap += "TAG POS=1 TYPE=INPUT:FILE FORM=ACTION:getcapcha.php ATTR=NAME:file CONTENT={{FULLKAP}}" + "\n";
  macroKap += "TAG POS=1 TYPE=INPUT:TEXT FORM=ACTION:getcapcha.php ATTR=NAME:language CONTENT=1" + "\n";
  macroKap += "TAG POS=1 TYPE=INPUT:TEXT FORM=ACTION:getcapcha.php ATTR=NAME:numeric CONTENT=2" + "\n";
  macroKap += "TAG POS=1 TYPE=INPUT:SUBMIT FORM=ACTION:getcapcha.php ATTR=*" + "\n";
  iimPlay(macroKap);//заход на сайт капчи
  
  var loc_macros = "CODE:SET !EXTRACT_TEST_POPUP NO"+"\n";
  loc_macros += "TAG POS=1 TYPE=BODY ATTR=* EXTRACT=TXT"+"\n";
  iimPlay(loc_macros);
  result = iimGetLastExtract();
  
  iimDisplay("капча - "+result);
  iimPlay("CODE:SET !EXTRACT_TEST_POPUP NO"+"\n"+"TAB CLOSE");
  
  return (result);
}

/**
@class  Captcha
@brief  Функция позволяет определить капчу через сервис RuCaptcha
@param  rucaptcha_api             Ключ Rucaptcha
        full_path_captcha         Полный путь капчи
@return                           Результат определения капчи
        -1                        Любая ошибка (в т.ч. ERROR_CAPTCHA_UNSOLVABLE)
*/
function ReadCaptcha_v2(rucaptcha_api, full_path_captcha) {
  var result = 0;
  
  var pol_dok_kap="NO"; //использовать гет запрос
  var phrase_kap="NO"; // YES если 2 слова
  var regsense_kap="NO"; // YES если с учетом регистра
  var calc_kap="NO"; // YES если с математическим выражением
  var min_len_kap=""; // минимальная длина
  var max_len_kap=""; // максимальная длина
  var language_kap="2"; // язык 1 - russian 2 - english
  
  var textinstructions = "";
  var numeric_kap="3"; // язык 1 - только цифры 2 - только буквы 3 - цифры и буквы
  var soft_id_kap="";
  
  var macroKap = "CODE:SET !EXTRACT_TEST_POPUP NO"+"\n";
  macroKap += "TAB OPEN" + "\n";
  macroKap += "TAB T=2" + "\n";
  iimPlay(macroKap);
  
  macroKap = "CODE:SET !EXTRACT_TEST_POPUP NO"+"\n";
  macroKap += "SET !TIMEOUT_PAGE 90" + "\n";
  macroKap += "URL GOTO=http://imacros2.rucaptcha.com/new/" + "\n"; //ЗАХОД НА КАПЧУ
  macroKap += "TAG POS=1 TYPE=INPUT:TEXT FORM=ACTION:getcapcha.php ATTR=TYPE:text&&VALUE:&&NAME:key&&SIZE:64 CONTENT=" + rucaptcha_api + "\n";
  macroKap += "TAG POS=1 TYPE=INPUT:CHECKBOX FORM=ACTION:getcapcha.php ATTR=NAME:phrase CONTENT=" + phrase_kap + "\n";
  macroKap += "TAG POS=1 TYPE=INPUT:CHECKBOX FORM=ACTION:getcapcha.php ATTR=NAME:regsense CONTENT=" + regsense_kap + "\n";
  macroKap += "TAG POS=1 TYPE=INPUT:FILE FORM=ACTION:getcapcha.php ATTR=NAME:file CONTENT={{FULLKAP}}" + "\n";
  macroKap += "TAG POS=1 TYPE=INPUT:TEXT FORM=ACTION:getcapcha.php ATTR=NAME:language CONTENT=" + language_kap + "\n";
  macroKap += "TAG POS=1 TYPE=INPUT:TEXT FORM=ACTION:getcapcha.php ATTR=NAME:numeric CONTENT=" + numeric_kap + "\n";
  macroKap += "TAG POS=1 TYPE=INPUT:SUBMIT FORM=ACTION:getcapcha.php ATTR=*" + "\n";
  
  do {
    iimSet("FULLKAP",full_path_captcha);
  } while (iimPlay(macroKap)!=1);
  
  var loc_macros = "CODE:SET !EXTRACT_TEST_POPUP NO"+"\n";
  loc_macros += "TAG POS=1 TYPE=BODY ATTR=* EXTRACT=TXT"+"\n";
  loc_macros += "TAB CLOSE" + "\n";
  iimPlay(loc_macros);
  result = iimGetLastExtract();
  if (result.search(/ERROR_/i) !== -1) {
    result = -1;
  }
  iimDisplay("капча - " + result);
  
  return(result);
}

/**
@class  Captcha
@brief  Сохраняет изображение.
@param  p_tag                   Тег, содержащий капчу. Строка вида "TAG ..." с любым видом адресации.
        p_path                  Путь сохранения капчи
        p_filename              Имя файла
@return Статус выполнения iMacros
*/
function saveCap (p_tag, p_path, p_filename) {
  var result = 1;
  
  if (p_path.search(/\\\\/) !== -1){
    p_path = p_path.replace(/\\\\/g, "\\");
  }

  var loc_macros = "CODE:SET !EXTRACT_TEST_POPUP NO" + "\n";
  loc_macros += 'ONDOWNLOAD FOLDER="' +  p_path + '" FILE="' + p_filename + '" WAIT=YES' + "\n";
  // loc_macros += "ONDOWNLOAD FOLDER=* FILE=* WAIT=YES" + "\n";
  loc_macros += p_tag + " CONTENT=EVENT:SAVE_ELEMENT_SCREENSHOT" + "\n";
  result = iimPlay (loc_macros);

  return (result);
}

/**
@class  Captcha
@brief  Сохраняет изображение.
@param  p_tag                   Тег, содержащий капчу. Строка вида "TAG ..." с любым видом адресации.
@return Статус выполнения iMacros
*/
function saveCap_v2 (p_tag) {
  var result = 1;
  
  var loc_macros = "CODE:SET !EXTRACT_TEST_POPUP NO" + "\n";
  loc_macros += p_tag + " CONTENT=EVENT:SAVE_ELEMENT_SCREENSHOT" + "\n";
  result = iimPlay (loc_macros);

  return (result);
}

//----------//Завершение - Работа с сервисом RuCaptcha//-------------

//-----------------------//Работа с SimSMS//-------------------------

/**
@class simsms_activation
@brief Функция отправляет запрос и получает ответ.
@param  loc_http      Адрес запроса.
        parse_on  0   Выводить данные без парсинга.
                  1   Получать данные из JSON строки.
        tries         Количество попыток.
@return Ответ в формате JSON (до функции\после функции parse)
                  -1  Ошибка
*/
function JSON_request(loc_http, parse_on, tries, delay_s) {
  var result = 0;
  var current_tries = 0;
  
  while (current_tries < tries) {
    var exit = 0;
    var x = new XMLHttpRequest();
    result = 0;
    x.open("GET", loc_http, true);
    x.onload = function (){
      result = x.responseText;
    }
    x.send(null);
    
    if ((delay_s > 0) && (delay_s!=undefined)) {
      Delay (delay_s);
    }
    
    while (1)
      if (result) break;
    
    if (parse_on) {
      try {
        //undefined, if proxy not working
          exit = 1;
          current_tries++;
          result = JSON.parse(result);
      } catch (loc_error) {
        exit = 0; 
      }
    }
    else exit = 1;
    if (exit) break;
  }
  if (current_tries==tries) result = -1;
  
  return (result);
}

/**
@class simsms_activation
@brief Функция связывается с сайтом SIMSMS и получает данные.
@description
Коды возвращаемых ошибок

{"response":"5","number":null,"id":0,"text":null,"extra":null,"sms":null} - Превышено количество запросов в минуту

{"response":"6","number":null,"id":0,"text":null,"extra":null,"sms":null} - Вы забанены на 10 минут, т.к. набрали отрицательную карму

{"response":"7","number":null,"id":0,"text":null,"extra":null,"sms":null} - Превышено количество одновременных потоков. Дождитесь смс от предыдущих заказов

API KEY не получен! - Введен не верный API KEY
Недостаточно средств! - Недостаточно средств для выполнения операции. Пополните Ваш кошелек
Превышено количество попыток! - Задайте больший интервал между вызовами к серверу API
Произошла неизвестная ошибка. - Попробуйте повторить запрос позже.
Неверный запрос. - Проверьте синтаксис запроса и список используемых параметров (его можно найти на странице с описанием метода).
Произошла внутренняя ошибка сервера. - Попробуйте повторить запрос позже.
@param  p_api_simsms         API аккаунта на сервисе SIMSMS
@return     
        result.number   Номер телефона для СМС
          2..255          Коды ошибок
        result.id       ID обращения в сервис
*/
function SimSMS_Get_Number (p_api_simsms) {
  const SimSMS_ERROR = {
    CHECKBALANCE: {value: 2, text:"Not id or not user balance (SimSMS)"},
    SMALLBALANCE: {value: 3, text:"Менее 10 рублей на балансе SIMSMS.", min: 10},
    CHECKCOUNT_ACTS: {value: 4, text:"Проблемы на этапе уточнения количества свободных активаций."},
    NOACTS: {value: 5, text:"Нет свободных активаций."},
    GETNUMBER: {value: 6, text:"Невозможно получить номер."},
    WAIT_GETNUMBER: {value: 7, text:"Номера заняты, пробуйте получить номер заново через 30 секунд.", delay: 30}
  };
  
  const PARSE = {
    ON: 1,
    OFF: 0
  };

  var reg_service = "ya";
  var result = {
    number: 0,
    id: 0
  };
  var text = 0;
  
  text = JSON_tab_v2 ("http://simsms.org/priemnik.php?metod=get_balance&service=opt23&apikey="+p_api_simsms, PARSE.ON);
  
  if (text.response != 1) {
    result.number = SimSMS_ERROR.CHECKBALANCE.value;
    return (result);
  }
  iimDisplay("Баланс: " + text.balance + " р.");
  if (text.balance <= SimSMS_ERROR.SMALLBALANCE.min) {
    result.number = SimSMS_ERROR.SMALLBALANCE.value;
    alertDebug("1702: " + SimSMS_ERROR.SMALLBALANCE.text);
    return (result);
  }
  
  text = JSON_tab_v2 ("http://simsms.org/priemnik.php?metod=get_count&service=opt23&apikey=" + p_api_simsms + "&service_id=" + reg_service, PARSE.OFF);
  //counts Yandex -> counts
  text = text.replace('counts Yandex', 'counts');
  text = JSON.parse(text);
  if (text.response != 1) {
    result.number = SimSMS_ERROR.CHECKCOUNT_ACTS.value;
    alertDebug ("1703: " + SimSMS_ERROR.CHECKCOUNT_ACTS.text);
    return (result);
  }
  iimDisplay("Свободных активаций: " + text.counts);
  if (!(text.counts > 0)) {
    result.number = SimSMS_ERROR.NOACTS.value;
    alertDebug ("1704: " + SimSMS_ERROR.NOACTS.text);
    return (result);
  }
  
  while (1) {
    text = JSON_tab_v2 ("http://simsms.org/priemnik.php?metod=get_number&country=ru&service=opt23&id=1&apikey=" + p_api_simsms + "&service_id=" + reg_service, PARSE.ON);
    //get_number
    //ok {"response":"1","number":"9871234567","id":25623}
    //error {"response":"2","number":"","id":"-1"}
    
    if (text.response!=2 && text.response!=1) {
      result.number = SimSMS_ERROR.GETNUMBER.value;
      alertDebug ("1705: " + SimSMS_ERROR.GETNUMBER.text);
      return (result);
    }
    
    if (text.response==2) {
      //Задержка до повторного запроса
      Delay(SimSMS_ERROR.WAIT_GETNUMBER.delay);
    }
    if (text.response==1) break;
  }

  result = {number: text.number, id: text.id};
  iimDisplay (result.number + ", " + result.id + ", " + p_api_simsms);
  
  return (result);
}

/**
@class simsms_activation
@brief Функция получает код с ресурса SimSMS по полученному номеру.
@param  p_api_simsms       API аккаунта на сервисе SIMSMS.
        id            ID обращения в сервис.
@return Возвращает код из СМС, либо ошибку.
                -1    СМС не может быть получено.
                [Код] Код из СМС.
*/
function SimSMS_Get_Code (p_api_simsms, id) {
  const short_time = 30;
  const long_time = 570; //9:30
  const PARSE = {
    ON: 1,
    OFF: 0
  };
  var times_max = Math.floor(long_time/short_time);
  var current_times = 0;
  var result = 0;
  
  //{"response":"1","number":"9871234567","sms":''234562'}
  //{"response":"1","number":"9661859124","id":1915338048,"text":"395396 - \u0432\u0430\u0448 \u043a\u043e\u0434 \u043f\u043e\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043d\u0438\u044f. \u041d\u0435 \u043f\u0435\u0440\u0435\u0434\u0430\u0432\u0430\u0439\u0442\u0435 \u0435\u0433\u043e \u043d\u0438\u043a\u043e\u043c\u0443! OK.RU","extra":"0","karma":21,"pass":null,"sms":"395396","balanceOnPhone":-10}
  //{"response":"2","number":"9871234567","sms":null}
  //{"response":"2","number":"9661462521","id":728398417,"text":"","extra":"0","karma":20.75,"pass":"","sms":"","balanceOnPhone":0}
  //{"response":"3","number":"null","sms":null} 
  
  while ((result == 0) && (current_times < times_max)) {
    Delay(short_time);
    var text = JSON_tab_v2 ("http://simsms.org/priemnik.php?metod=get_sms&country=ru&service=opt23&id=" + id + "&apikey=" + p_api_simsms,  PARSE.ON);
    iimDisplay("http://simsms.org/priemnik.php?metod=get_sms&country=ru&service=opt23&id=" + id + "&apikey=" + p_api_simsms+"\n"+text.response+"\n"+text.sms);
    var flag_out = 0;
    
    switch (text.response) {
      case '1':
        result = text.sms;
        //flag_out = 1;
      break;
      case '2':
        //wait
        current_times++;
      break;
      case '3':
        result = -1;
        flag_out = 1;
      break;
      default:
        
      break;
    }
    if (flag_out) break;
  }
  
  if (!(current_times < times_max)) {
    //бан номера
    Ban (p_api_simsms, id);
    result = -1;
  }
  
  return(result);
}

/**
@class simsms_activation
@brief Функция сообщает сервису, что номер уже использован либо непригоден.
@param  p_api_simsms       API аккаунта на сервисе SIMSMS.
        id            ID обращения в сервис.
*/
function Ban (p_api_simsms, id) {
  const PARSE = {
    ON: 1,
    OFF: 0
  };
  //var text = JSON_request("http://simsms.org/priemnik.php?metod=ban&service=opt5&apikey=" + p_api_simsms + "&id=" + id,  PARSE.ON.value, JSON_TRIES);
  
  var text = JSON_tab_v2 ("http://simsms.org/priemnik.php?metod=ban&service=opt23&apikey=" + p_api_simsms + "&id=" + id,  PARSE.ON);
}

//----------------//Завершение - работа с SimSMS//-------------------

//--------------------//Работа с SMSActivate//-----------------------

/**
@class  SMSActivate
@brief  Создает модуль для работы с API SMSActivate.
@param  p_api           API ключ
        p_service       Сервис, для которого нужны смс

        Необязательные параметры
        p_id            Идентификатор обращения
        p_number        Номер телефона
        p_accnum        Номер регистрируемого аккаунта
        p_smscount_in_session Количество полученных смс в сессии
        p_maxacc        Максимальное количество аккаунтов на один номер
@return -
*/
SMSActivate_Module = function (p_api, p_service, p_id, p_number, p_accnum, p_smscount_in_session, p_maxacc) {
  this.api_key = p_api;
  this.service = p_service;
  var reg_service_list = [
    "vk", //(Вконтакте)
    "ok", //(Одноклассники)
    "wa", //(Whatsapp)
    "vi", //(Viber)
    "tg", //(Telegram)
    "wb", //(WeChat)
    "go", //(Google,youtube,Gmail)
    "av", //(avito)
    "fb", //(facebook)
    "tw", //(Twitter)
    "ub", //(Uber)
    "qw", //(Qiwi)
    "gt", //(Gett)
    "sn", //(OLX.ua)
    "ig", //(Instagram)
    "ss", //(SeoSprint)
    "ym", //(Юла)
    "ma", //(Mail.ru)
    "mm", //(Microsoft)
    "uk", //(IMO messenger)
    "me", //(Line messenger)
    "mb", //(Yahoo)
    "we", //(Aol)
    "bd", //(Rambler.ru)
    "kp", //(Gem4me)
    "dt", //(Такси Максим)
    "ya", //(Яндекс)
    "mt", //(Skout)
    "oi", //(Momo)
    "fd", //(GetResponse)
    "ot"  //(Любой другой)
  ];
  this.check_period = 30;

  if (!p_id) {
    this.id = 0;
  }
  else {
    this.id = p_id;
  }
  if (!p_number) {
    this.number = 0;
  }
  else {
    this.number = p_number;
  }
  this.smscode = 0;

  if (!p_maxacc) {
    this.maxacc = 1;
  }
  else {
    this.maxacc = p_maxacc;
  }

  if (!p_accnum) {
    this.accnum = 0;
  }
  else {
    this.accnum = p_accnum;
  }

  if (!p_smscount_in_session) {
    this.smscount_in_session = 0;
  }
  else {
    this.smscount_in_session = p_smscount_in_session;
  }
}

/**
@class	SMSActivate
@brief	Выводит данные о текущем состоянии для дальнейшего восстановления
@param	-
@return	{
					id,
					number,
					smscount_in_session
				}
*/
SMSActivate_Module.prototype.exportSession = function () {
	var result = {
		id: this.id,
		number: this.number,
		smscount_in_session: this.smscount_in_session
	};
	return (result);
}

/**
@class  SMSActivate
@brief  Изменяет текущий номер регистрируемого аккаунта.
@param    p_change      Относительное значение
          p_abs         Абсолютное значение
@return   Ответ метода GetCode
*/
SMSActivate_Module.prototype.changeAccNum = function  (p_change, p_abs) {

  if (!!p_abs) {
    this.accnum = p_abs;
  }
  else {
    this.accnum += p_change;
  }

  if (this.id !== 0) {
    this.endAct();
  }
  this.id = 0;
}

/**
@class  SMSActivate
@brief  Определяет номер телефона с учетом доступности номера и максимальным количеством вызовов.
@param    -
@return   number        Номер телефона для СМС
            1..255          код ошибки
          id            Идентификатор обращения
          new_num
            false       Обращения за новым номером не было
            true        Получен новый номер
*/
SMSActivate_Module.prototype.GetNumber = function  () {
  var flag_new_skip = false;
  var result = {
    number: 0,
    id: 0,
    new_num: false
  }

  if (this.id !== 0) {
    if (this.accnum % this.maxacc !== 0) {
      flag_new_skip = true;
    }
  }

  if (!flag_new_skip) {
    this.GetNewNumber();
  }

  result.number   = this.number;
  result.id       = this.id;
  result.new_num  = !flag_new_skip;

  return (result);
}

/**
@class  SMSActivate
@brief  Изменяет статус активации - переводит модуль в режим ожидания смс.
@param    -
@return   1							Статус в норме
					-1						Статус указывает на ошибку
*/
SMSActivate_Module.prototype.waitCommand = function  () {
	var result = 1;
  if (this.smscount_in_session === 0) {
    result = this.SetStatus ("SENT");
  }
  else {
    result = this.SetStatus ("RETRY");
  }
  if ((result > 4) && (result < 12)) {
  	this.endAct ();
  	result = -1;
  }
  else {
  	result = 1;
  }
  return (result);
}

/**
@class  SMSActivate
@brief  Получение СМС.
@param    -
@return   Ответ метода GetCode
*/
SMSActivate_Module.prototype.GetSMS = function  () {
  var result = this.GetCode ();
  return (result);
}

/**
@class  SMSActivate
@brief  Закрытие активации.
@param    -
@return   -
*/
SMSActivate_Module.prototype.endAct = function  () {
  this.SetStatus ("END");
  this.id = 0;
}

/**
@class  SMSActivate
@brief  Бан номера.
@param    -
@return   -
*/
SMSActivate_Module.prototype.ban = function  () {
  this.SetStatus ("BAN");
  this.id = 0;
}

/**
@class  SMSActivate
@brief  Связывается с сайтом SMSActivate и получает данные.
@param    p_api           API аккаунта на сервисе SMSActivate
@return   result.number   Номер телефона для СМС
            1..255          код ошибки
          result.id       ID обращения в сервис
*/
SMSActivate_Module.prototype.GetNewNumber = function  () {
  const ERROR = {
    CHECKBALANCE: {value: 2, text:"Not id or not user balance (SMSActivate)", answer_contains: "BAD_KEY", answer_not_contains: "ACCESS_BALANCE"},
    NOREQUIRED: {value: 4, text:"Нет нужного сервиса в списке"},
    NOACTS: {value: 5, text:"Нет свободных номеров"},
    NO_NUMBERS: {value: 6, text:"Нет свободных номеров"},
    NO_BALANCE: {value: 7, text:"Закончился баланс"},
    BAD_ACTION: {value: 8, text:"Некорректное действие"},
    BAD_SERVICE: {value: 9, text:"Некорректное наименование сервиса"},
    BAD_KEY: {value: 10, text:"Неверный API-ключ"},
    ERROR_SQL: {value: 11, text:"Ошибка SQL-сервера"},
    ACCESS_NUMBER: {value: 0}
  };

  var before_balance_val = new RegExp(ERROR.CHECKBALANCE.answer_not_contains + ":\s?", "g");

  const PARSE = {
    ON: 1,
    OFF: 0
  };

  var result = {
    number: 0,
    id: 0
  };
  var loc_request = "";
  var loc_answer = "";
  var p_api = this.api_key;
  var reg_service = {
    name: this.service,
    forward: 0,
    full: ""
  }
  reg_service.full = reg_service.name + "_" +  reg_service.forward;

  this.smscount_in_session = 0;

  loc_request = "http://sms-activate.ru/stubs/handler_api.php?api_key=" + p_api + "&action=getBalance";
  loc_answer = JSON_tab_v2 (loc_request, PARSE.OFF);

  if ((loc_answer.indexOf (ERROR.CHECKBALANCE.answer_contains) !== -1) || (loc_answer.indexOf (ERROR.CHECKBALANCE.answer_not_contains) === -1)) {
    result.number = ERROR.CHECKBALANCE.value;
    iimDisplay (ERROR.CHECKBALANCE.text);
    return (result);
  }

  loc_answer = loc_answer.replace (before_balance_val, "");
  iimDisplay("Баланс: " + loc_answer + " р.");

  loc_request = "http://sms-activate.ru/stubs/handler_api.php?api_key=" + p_api + "&action=getNumbersStatus";
  loc_answer = JSON_tab_v2 (loc_request, PARSE.ON);

  if (loc_answer[reg_service.full] === undefined) {
    result.number = ERROR.NOREQUIRED.value;
    alertDebug (ERROR.NOREQUIRED.text);
    return (result);
  }

  loc_answer = loc_answer[reg_service.full];
  iimDisplay("Свободных активаций: " + loc_answer);

  if (!(loc_answer > 0)) {
    result.number = ERROR.NOACTS.value;
    alertDebug (ERROR.NOACTS.text);
    return (result);
  }

  //get num
  loc_request = "http://sms-activate.ru/stubs/handler_api.php?api_key=" + p_api + "&action=getNumber&service=" + reg_service.name + "&forward=" + reg_service.forward;
  loc_answer = JSON_tab_v2 (loc_request, PARSE.OFF);

  var codename = "";
  for (codename in ERROR) {
    if (loc_answer.indexOf(codename) !== -1) {
      break;
    }
  }

  if (codename !== "ACCESS_NUMBER") {
    result.number = ERROR[codename].value;
    alertDebug (ERROR[codename].text);
    return (result);
  }

  var array_answer = loc_answer.split(":");
  result = {id: array_answer[1], number: array_answer[2]};

  this.id = array_answer[1];
  this.number = array_answer[2];

  iimDisplay (result.id + ", " + result.number + ", " + p_api);

  // alertDebug ("for test 1104: " + result.id + ", " + result.number + ", " + p_api);

  return (result);
}

/**
@class SMSActivate
@brief Функция получает код с ресурса SMSActivate по полученному номеру.
@param  p_api             API аккаунта на сервисе SMSActivate.
        p_id              ID обращения в сервис.
@return Возвращает код из СМС, либо ошибку.
          -255..-1        Код ошибки
          [Код]           Код из СМС.
*/
SMSActivate_Module.prototype.GetCode = function  () {
  const ERROR = {
    NO_ACTIVATION: {value: -1, text:"id активации не существует"},
    ERROR_SQL: {value: -2, text:"Ошибка SQL-сервера"},
    BAD_KEY: {value: -3, text:"Неверный API-ключ"},
    BAD_ACTION: {value: -4, text:"Некорректное действие"},
    // UNKNOWN: {value: -5, text:"Неизвестная ошибка"}
  };

  const UNKNOWN_ = -5;

  const STATUS = {
    WAIT_CODE: -6,
    WAIT_RETRY: -7,
    WAIT_RESEND: -8,
    CANCEL: -9,
    STATUS_OK: 1
  }
  var p_api = this.api_key;
  var p_id = this.id;

  var result = 0;
  var loc_request = "";
  var loc_answer = "";
  var current_status = "";
  var l_code = "";
  
  loc_request = "http://sms-activate.ru/stubs/handler_api.php?api_key=" + p_api + "&action=getStatus&id=" + p_id;
  do {
    Delay (this.check_period);
    loc_answer = JSON_tab_v2 (loc_request, 0);
    current_status = "";
    for (l_code in ERROR) {
      if (loc_answer.indexOf(l_code) !== -1) {
        current_status = l_code;
        break;
      }
    }
    if (current_status==="") {
      for (l_code in STATUS) {
        if (loc_answer.indexOf(l_code) !== -1) {
          current_status = l_code;
          break;
        }
      }
    }
  } while (current_status.indexOf("WAIT") !== -1);

  if (current_status === "STATUS_OK") {
    loc_answer = loc_answer.split (":");
    result = loc_answer[1];
  }
  else if (current_status === "") {
    alertDebug ("Неизвестная ошибка");
    result = UNKNOWN_;
  }
  else {
    try {
      alertDebug (ERROR[current_status].text);
      result = ERROR[current_status].value;
    } catch (err) {
      alertDebug ("Ошибка без текста, " + current_status);
      result = UNKNOWN_;
    }
  }

  this.smscount_in_session++;
  this.smscode = result;

  if ((+result) < 0) {
  	this.id = 0;
  }

  return(result);
}

/**
@class SMSActivate
@brief Функция получает код с ресурса SMSActivate по полученному номеру.
@param  
        p_status          Новый статус активации.
          CANCEL = -1     отменить активацию
          SENT = 1        смс на номер отправлено
          RETRY = 3       запросить еще один код
          END = 6         завершить активацию
          BAN = 8         номер использован, отмена
@return Возвращает код из СМС, либо ошибку.
          1..11           Код состояния
*/
SMSActivate_Module.prototype.SetStatus = function  (p_status) {
  const STATUS = {
    CANCEL: -1,
    SENT: 1,
    RETRY: 3,
    END: 6,
    BAN: 8
  };

  const ANSWERS = {
    ACCESS_READY: {value: 1, text: "Готовность номера подтверждена"},
    ACCESS_RETRY_GET: {value: 2, text: "Ожидание нового смс"},
    ACCESS_ACTIVATION: {value: 3, text: "Сервис успешно активирован"},
    ACCESS_CANCEL: {value: 4, text: "Активация отменена"}
  };

  const ERROR = {
    ERROR_SQL: {value: 5, text:"Ошибка SQL-сервера"},
    NO_ACTIVATION: {value: 6, text:"id активации не существует"},
    BAD_SERVICE: {value: 7, text:"Некорректное наименование сервиса"},
    BAD_STATUS: {value: 8, text:"некорректный статус"},
    BAD_KEY: {value: 9, text:"Неверный API-ключ"},
    BAD_ACTION: {value: 10, text:"Некорректное действие"}
  };

  const UNKNOWN_ = 11;

  p_api = this.api_key;
  p_id = this.id;

  var result = "";
  var loc_request = "";
  var loc_answer = "";
  var current_type_answer = "";
  var current_error = "";
  var l_code = "";

  if ((typeof p_status) == "string") {
    if (STATUS[p_status] === undefined) {
      alertDebug ("1406: В функцию SetStatus передан некорректный статус");
      return (ERROR.BAD_STATUS.value);
    }
    else {
      p_status = STATUS[p_status];
    }
  }

  loc_request = "http://sms-activate.ru/stubs/handler_api.php?api_key=" + p_api + "&action=setStatus&status=" + p_status + "&id=" + p_id;
  loc_answer = JSON_tab_v2 (loc_request, 0);

  current_type_answer = "";
  current_error = "";

  for (l_code in ANSWERS) {
    if (loc_answer.indexOf(l_code) !== -1) {
      current_type_answer = l_code;
      break;
    }
  }

  for (l_code in ERROR) {
    if (loc_answer.indexOf(l_code) !== -1) {
      current_error = l_code;
      break;
    }
  }

  if (current_error === "") {
    if (current_type_answer === "") {
      result = UNKNOWN_;
    }
    else {
      result = ANSWERS[current_type_answer].value;
    }
  }
  else {
    result = ERROR[current_error].value;
  }
  iimDisplay ("SetStatus: " + result);
  Delay (1);

  return (result);
}

//--------------//Завершение - Работа с SMSActivate//----------------

//--------------------------//Навигация//----------------------------

/**
@class  Navigation
@brief  Функция определяет текущую страницу одноклассников по тексту.
@param  test_page           Предполагаемая страница. Если параметр 
                              задан, то проверяется совпадение только 
                              с одной страницей.
@return Возвращает код из СМС, либо ошибку.
                0           Не соответствует ни одному признаку известных страниц.
                [PAGE_SIGN] Название соответствующей страницы.
*/
function IdentifyPages (test_page) {
  const PAGE_SIGN = {
    INVALID_API: {text:"API", frame: "undefined"},
    //ERROR_RECAPTCHA: {text:"ERROR for site owner", frame: "undefined"},
    RECAPTCHA: {text:"Why do I have to complete a CAPTCHA"},
    ERROR_RECAPTCHA: {text:"ERROR for site owner", frame: "undefined"},
  }
  
  var content_from_page = 0;
  var truepage = 0;
  var text_sign = "";
  var loc_macro = "";
  
  if (!!test_page) {
    if (!!PAGE_SIGN[test_page]) {
      text_sign = PAGE_SIGN[test_page].text;
      
      loc_macro = "CODE:SET !EXTRACT_TEST_POPUP NO" + "\n";
      loc_macro += "SET !ERRORIGNORE YES" + "\n";
      loc_macro += "SET !TIMEOUT_STEP 1" + "\n";
      if (!!(PAGE_SIGN[test_page].frame)) {
        loc_macro += "FRAME NAME=" + PAGE_SIGN[test_page].frame + "\n";
      }
      
      loc_macro += "SEARCH SOURCE=REGEXP:\"(" + PAGE_SIGN[test_page].text + ")\" EXTRACT=$1" + "\n";
      iimPlay(loc_macro);
      content_from_page = iimGetExtract();
      
      if (content_from_page == PAGE_SIGN[test_page].text) {
        truepage = test_page;
      }
    }
    else {
      //truepage = 0
    }
  }
  else {
    for (current_sign in PAGE_SIGN) {
      text_sign = PAGE_SIGN[current_sign].text;
      if (text_sign == "") continue;
      
      loc_macro = "CODE:SET !EXTRACT_TEST_POPUP NO" + "\n";
      loc_macro += "SET !TIMEOUT_STEP 1" + "\n";
      if (!!(PAGE_SIGN[current_sign].frame)) {
        loc_macro += "FRAME NAME=" + PAGE_SIGN[current_sign].frame + "\n";
      }
      
      loc_macro += "SEARCH SOURCE=REGEXP:\"(" + PAGE_SIGN[current_sign].text + ")\" EXTRACT=$1" + "\n";
      iimPlay(loc_macro);
      content_from_page = iimGetExtract();
      
      if (content_from_page == PAGE_SIGN[current_sign].text) {
        truepage = current_sign;
        break;
      }
    }
  }
  
  return (truepage);
}

/**
@class  Navigation
@brief  Функция определяет текущую страницу одноклассников по тексту.
@param  test_page           Предполагаемая страница. Если параметр 
                              задан, то проверяется совпадение только 
                              с одной страницей.
@return Возвращает код из СМС, либо ошибку.
          0                 Не соответствует ни одному признаку известных страниц.
          [PAGE_SIGN]       Название соответствующей страницы.
*/
function IdentifyPages_v2 (test_page) {
  const PAGE_SIGN = {
    //INVALID_API: {text:"API", frame: "undefined"},
    FB_REG: {text:["Create an account", "Регистрация"]},
    G_REG: {text:["Sign in", "Join Google+", "Войти"]},
    VK_REG: {text:["Forgot your password", "Забыли пароль"]},
    T_REG: {text:["Log in", "Войти"]},
    VK_CAPTCHA: {text:["Enter the code", "Введите код с картинки"]}
  }
  
  var content_from_page = 0;
  var truepage = 0;
  var text_sign = "";
  var loc_macro = "";
  
  if (!!test_page) {
    if (!!PAGE_SIGN[test_page]) {
      for (var current_num_text = 0; current_num_text < PAGE_SIGN[test_page].text.length; current_num_text++) {
        text_sign = PAGE_SIGN[test_page].text[current_num_text];
        
        loc_macro = "CODE:SET !EXTRACT_TEST_POPUP NO" + "\n";
        loc_macro += "SET !ERRORIGNORE YES" + "\n";
        loc_macro += "SET !TIMEOUT_STEP 1" + "\n";
        if (!!(PAGE_SIGN[test_page].frame)) {
          loc_macro += "FRAME NAME=" + PAGE_SIGN[test_page].frame + "\n";
        }
        
        loc_macro += "SEARCH SOURCE=REGEXP:\"(" + text_sign + ")\" EXTRACT=$1" + "\n";
        iimPlay(loc_macro);
        content_from_page = iimGetExtract();
        
        if (content_from_page == text_sign) {
          truepage = test_page;
        }
      }
    }
    else {
      //truepage = 0
    }
  }
  else {
    for (current_sign in PAGE_SIGN) {
      for (var text_num = 0; text_num < PAGE_SIGN[current_sign].text.length; text_num++) 
      {
        text_sign = PAGE_SIGN[current_sign].text[text_num];
        if (text_sign == "") {
          continue;
        }
        
        loc_macro = "CODE:SET !EXTRACT_TEST_POPUP NO" + "\n";
        loc_macro += "SET !TIMEOUT_STEP 1" + "\n";
        if (!!(PAGE_SIGN[current_sign].frame)) {
          loc_macro += "FRAME NAME=" + PAGE_SIGN[current_sign].frame + "\n";
        }
        
        loc_macro += "SEARCH SOURCE=REGEXP:\"(" + text_sign + ")\" EXTRACT=$1" + "\n";
        iimPlay(loc_macro);
        content_from_page = iimGetExtract();
        
        if (content_from_page == text_sign) {
          truepage = current_sign;
          break;
        }
      }
    }
  }
  
  return (truepage);
}

/**
@class  Navigation
@brief  Определяет, существует ли тег, по XPATH
@param    line      Строковая переменная вида "XPATH = \"\//...\""
          timeout   Длительность ожидания нужного тега
@return   false     Не существует тегов по пути XPATH
          true      Есть как минимум один объект по пути XPATH
*/
function XPATH_Here (line, timeout) {
  const SCRIPT_OK = "OK";
  const SCRIPT_ERROR = "ERROR";
  var result = true;
  var error = "";
  var loc_script = "";
  var iim_status = 1;
  
  if (!timeout) {
    timeout = 0;
  }
  
  loc_script = "CODE:SET !EXTRACT_TEST_POPUP NO"+ "\n";
  loc_script += "SET !TIMEOUT_STEP " + timeout + "\n";
  loc_script += "TAG " + line + "\n";
  iim_status = iimPlay(loc_script);
  error = iimGetLastError();
  if (iim_status !== 1) {
    error = SCRIPT_ERROR;
  }
  if (error !== SCRIPT_OK) {
    result = false;
  }
  else {
    result = true;
  }
  
  return (result);
}

/**
@class Navigation
@brief Определяет, есть ли слово на странице.
@param    word                  Слово для поиска.
@return   false                 Слова нет.
          true                  Слово есть.
*/
function CheckWord (word) {
  var result = false;

  var find_content = "";
  var loc_macro = "CODE:SET !EXTRACT_TEST_POPUP NO"+ "\n";
  
  loc_macro += "SEARCH SOURCE=REGEXP:\"(" + word + ")\" EXTRACT=$1" + "\n";
  iimPlay(loc_macro);
  find_content = iimGetExtract();
  
  if (find_content == word) {
    result = true;
  }
  
  return (result);
}

/**
@class Navigation
@brief Возвращает текст внутри тега.
@param    p_xpath   Строковая переменная вида "XPATH = \"\//...\""
          type      Тип извлечения. По умолчанию TXT
            TXT     Без тегов.
            HTM     С тегами.
@return             Текст внутри тега.
          -1        Если тег не найден
*/
function TagText(p_xpath, type) {
  var result = "";
  
  if ((type!="TXT") && (type!="HTM")) type = "TXT";
  
  if (XPATH_Here(p_xpath)) {
    var loc_macro = "CODE:SET !EXTRACT_TEST_POPUP NO"+ "\n";
    loc_macro += "SET !EXTRACT NULL"+ "\n";
    loc_macro += "TAG " + p_xpath + " EXTRACT=" + type + "\n";
    //loc_macro += "WAIT SECONDS=1" + "\n";
    iimPlay(loc_macro);
    result += iimGetExtract(1);
  }
  else {
    result = -1;
  }
  
  return (result);
}

/**
@class  Navigation
@brief  Separate domain from url
@param  p_url               URL
@return  domain
*/
function DomainFromURL (p_url) {
  var result = '';
  var l_regexp = /^(https?:\/\/)?[^/]*/;
  var l_regexp_del = /^.*\//;
  var www_regexp_del = /w{3}\./;

  var regexp_domain = /\/?[^/]+/;

  result = p_url.match (l_regexp);

  if (result === null) {
    result = p_url.match (regexp_domain);
    result = result[0];
    result = result.replace(/\//, "");
  }
  else {
    result = result[0];
    result = result.replace (l_regexp_del, '');
    result = result.replace (www_regexp_del, '');
  }
  return (result);
}

/**
@class  Navigation
@brief  Define domain and main page url
@param  p_site
@return domain              Domain
        main_url            Main page url
        full_url            Full source url
        no_p                No params
        www_f               www flag
          1                 www here
          -1                no www
*/
function wrapper_http (p_site) {
  var result = {
    domain: "",
    main_url: "",
    full_url: "",
    no_p: "",
    www_f: -1
  };
  var http_init = 'http://';
  var regexp_http = /^https?:\/\//;
  var regexp_main = /^https?:\/\/[^/]*/;
  var regexp_domain = /^\/*[^/]*/;
  var regexp_params = /\?.*/;
  var regexp_www = /^www\./;
  var l_site = p_site;

  if (p_site.search(regexp_http) === -1) {
    l_site = p_site.match (regexp_domain);
    l_site = l_site[0];
    result.domain = l_site.replace(/^\/*/, "");
    result.main_url = http_init + result.domain;
    result.full_url = result.main_url;
  }
  else {
    //
    result.full_url = p_site;
    l_site = p_site.match (regexp_main);
    result.main_url = l_site[0];
    l_site = l_site[0];
    l_site = l_site.replace(regexp_http, "");
    result.domain = l_site.replace(/\/*/, "");
  }
  result.no_p = result.full_url.replace(regexp_params, "");

  if (result.domain.search(regexp_www) !== -1) {
    result.www_f = 1;
    result.domain = result.domain.replace (regexp_www, "");
  }
  
  return (result);
}

/**
@class  Navigation
@brief  Search all href on page
@param  p_fragment          Fragment for url searching
        p_mode              (reserved)
          1                 all pages
          0                 except p_page urls
@return  Array with all URLs in format 'href="url"'
*/
function AllURL (p_fragment = '', p_mode = 1) {
  var result = [];
  var html_code = '';
  // var regexp_url = /[A-Za-z]+=(('[^']*\/[^']*')|("[^"]*\/[^"]*"))/g;
  var regexp_url = /href=(('[^']*')|("[^"]*"))/g;
  var regexp_del = [/(\.css|\.ico|\.jpg|\.xml)\S{0,3}$/,
  /\/\?/,
  /javascript:/,
  /#/,
  /\/feed/,
  /\/xml/
  ];

  // http://info.siteads.ru/aleksey-panin-znaet-pochemu-maksim-gal/feed/
  // http://info.siteads.ru/xmlrpc.php

  var search_result = null;
  var l_length = 0;
  var reg_j = 0;
  var reg_len = regexp_del.length;
  var double_i = 0;
  var loc_macros = "";

  if (p_fragment === '') {
    loc_macros = "CODE:SET !EXTRACT_TEST_POPUP NO" + "\n";
    loc_macros += "TAG POS=1 TYPE=BODY ATTR=* EXTRACT=HTM" + "\n";
    while (iimPlay (loc_macros) !== 1) {
      Delay(15);
      refresh();
    }
    html_code = iimGetLastExtract();
  }
  else {
    html_code = p_fragment;
  }
  search_result = html_code.match (regexp_url);

  //filter
  if (search_result !== null) {
    var l_len = search_result.length;
    for (var i = 0; i < l_len; i++) {
      search_result[i] = search_result[i].replace(/'/g, "\"");
      //delete doubles
      for (double_i = i+1; double_i < l_len; double_i++) {
        if (search_result[double_i] === search_result[i]) {
          search_result.splice (double_i, 1);
          double_i--;
          l_len--;
        }
      }

      for (reg_j = 0; reg_j < reg_len; reg_j++) {
        if (search_result[i].search(regexp_del[reg_j]) !== -1) {
          search_result.splice (i, 1);
          i--;
          l_len--;
          break;
        }
      }
    }
    result = search_result;
  }

  return (result);
}

/**
@class  Navigation
@brief  Search all href in all frames on page
@param  p_fragment          Fragment of searched url (reserved)
        p_mode              (reserved)
          1                 all pages
          0                 except p_page urls
@return  Array with all URLs in format AllURLwithFrame
*/
function AllFramesURL () {
  var result = new Array();
  var l_len = 0;
  var search_result = new Array();
  var frame_edge = new Object ();

  var html_code = '';
  // var regexp_url = /[A-Za-z]+=(('[^']*\/[^']*')|("[^"]*\/[^"]*"))/g;
  var regexp_url = /href=(('[^']*\/[^']*')|("[^"]*\/[^"]*"))/g;
  var regexp_concat_sign = /['"]+\s*\+\s*['"]/g;

  var loc_macros = "";
  var iim_code = 0;
  var f = -1;

  do {
    f++;

    loc_macros = "CODE:SET !EXTRACT_TEST_POPUP NO" + "\n";
    loc_macros += "SET !TIMEOUT_STEP 1" + "\n";
    loc_macros += "FRAME F = " + f + "\n";
    loc_macros += "TAG POS=1 TYPE=BODY ATTR=* EXTRACT=HTM" + "\n";
    iim_code = iimPlay (loc_macros);
    if (iim_code === 1) {
      html_code = iimGetLastExtract();
      html_code = html_code.replace(regexp_concat_sign, "");
      search_result = html_code.match (regexp_url);
      if (search_result !== null) {
        // add search_result to result
        result = result.concat(search_result);
        frame_edge[f] = result.length;
      }
    }
  } while (iim_code === 1);

  result = new AllURLwithFrame (result, frame_edge);

  return(result);
}

AllURLwithFrame = function (p_AllURL, p_frame_edge) {
  this.AllURL = p_AllURL;
  this.frames = p_frame_edge;
}

/**
@class  navigation
@brief  Method of AllURLwithFrame. Get one element. If p_num is out of range, then get last element.
@param  p_num               Position number
@return  {
            allURL_item     'text="url"'
            frame           Frame number
            status          p_num out of range
              1             no
              -1            yes
          }
*/
AllURLwithFrame.prototype.getOne = function (p_num) {
  var result = {
    allURL_item: "",
    frame: -1,
    status: 1
  };
  var len = this.AllURL.length;
  var len_frames = 0;
  var b = -1;
  var skip_flag = false;
  var arr_indexes = new Array ();
  var arr_indexes_length = 0;

  if (!(p_num < len)) {
    p_num = len - 1;
    result.status = -1;
  }

  result.allURL_item = this.AllURL[p_num];

  for (b in this.frames) {
    len_frames++;
    arr_indexes.push (b);
  }

  arr_indexes_length = arr_indexes.length;

  for (g = 0; g < arr_indexes_length; g++) {
    if (this.frames[arr_indexes[g]] > p_num) {
      result.frame = arr_indexes[g];
      break;
    }
  }

  if (result.frame === -1) {
    result.frame = arr_indexes[g-1];
  }

  return (result);
}

/**
@class  Navigation
@brief  Divide 'text="url"' to param name and text.
@param  p_allurl            Text with view 'text="url"'
@return  {
            param: "text",  Parameter name
            text: "url"     Parameter value
            status
              1             success
              -1            error
          }
*/
function AllURL_div (p_allurl) {
  var result = {
    param: "",
    text: "",
    status: 1
  };

  var current = null;

  var regexp_param = /^[^=]+/;
  var regexp_text = /=(('[^']*\/[^']*')|("[^"]*\/[^"]*"))/g;

  try {
    current = p_allurl.match (regexp_param);
  }
  catch(e) {
    current = null;
    toJournal("for test 1453: " + p_allurl);
  }
  if (current === null) {
    result.status = -1;
  }

  if (result.status === 1) {
    result.param = current[0];
    current = p_allurl.match (regexp_text);
    if (current === null) {
      result.status = -1;
    }
  }

  if (result.status === 1) {
    result.text = current[0];
    result.text = result.text.replace (/["'=]/g, "");
  }
  
  return (result);
}

/**
@class  Navigation
@brief  Go to url
@param  p_allurl_item       Text with view 'text="url"'
        p_oldurl            
@return
          {
            url: '',        Current URL
            status          1 - success
                            -1 - no changes
                            -2 - iim error
                            -3 - other domain
                            -4 - error AllURL_div
          }
*/
function AllURL_Go (p_allurl_item, p_oldurl = null) {
  var result = {
    url: '',
    status: 1
  };
  var l_iim_status = 0;
  var iim_text = '';

  var ceil = AllURL_div (p_allurl_item);

  var old_url = "";
  if (!p_oldurl) {
    old_url = GetCurrentURL ();
  }
  else {
    old_url = p_oldurl;
  }

  var old_wrap = wrapper_http(old_url);
  var new_url = '';
  var new_wrap = new Object();

  result.url = old_url;

  if (ceil.status !== 1) {
    result.status = -4;
  }
  else {
    iim_text = 'SET !TIMEOUT_STEP 0\nTAG XPATH="/descendant::*[contains(@' + ceil.param + ', \'' + ceil.text + '\')][1]"';
    
    l_iim_status = iimPlayCode (iim_text);

    //was not found, -921
    if (l_iim_status === -921) {
      ceil.text = ceil.text.replace (/\?.+$/, "");
      iim_text = 'SET !TIMEOUT_STEP 0\nTAG POS=1 TYPE=A ATTR=' + ceil.param + ':' + '"' + ceil.text + '*"';
      l_iim_status = iimPlayCode (iim_text);
    }

    new_url = GetCurrentURL ();
    new_wrap = wrapper_http(new_url);
    if (l_iim_status === 1) {
      if (old_url === new_url) {
        result.status = -1;
      }
    }
    else {
      result.status = -2;
    }
    if (old_wrap.domain !== new_wrap.domain) {
      toJournal ("for test 2141: " + old_wrap.domain + ";" + new_wrap.domain);
      result.status = -3;
      backNavi();
    }
    else {
      result.url = new_url;
    }
  }
  
  return (result);
}

/**
@class  Navigation
@brief  Navigate to banner with the domain.
@param  p_urls              URLs on page, AllFramesURL format
        ads_domain          advertisments channel domain
@return  1                  Success
        -1                  Error
*/
function GoBanner (p_urls, ads_domain) {
  var result = -1;
  var ads_elem = new Object();

  var local_imacros = '';
  var iim_code = -1;

  var ceil = new Object ();
  var parent_site = GetCurrentURL();

  ads_elem = BannerURL (p_urls, ads_domain);

  if (ads_elem === -1) {
    // result = -1;
  }
  else {
    //go to ads site, ads_elem
    // .allURL_item, .frame

    ceil = AllURL_div(ads_elem.allURL_item);

    if (ceil.status === -1) {
      // result = -1;
    }
    else {
      ceil.text = ceil.text.replace (/\?.*$/, "");
      local_imacros = 'SET !TIMEOUT_STEP 1\nFRAME F=' + ads_elem.frame + '\nEVENT TYPE=CLICK XPATH="/descendant::*[contains(' + '@' + ceil.param + ', \'' + ceil.text + '\')][1]" BUTTON=0';
      iim_code = iimPlayCode (local_imacros);

      iimDisplay (local_imacros + "\n" + iim_code);

      if (GetCurrentURL().search(DomainFromURL (parent_site)) !== -1) {
        iimPlayCode("TAB CLOSE");
        iimPlayCode ("URL GOTO=" + parent_site);

        local_imacros = 'SET !TIMEOUT_STEP 1\nFRAME F=' + ads_elem.frame + '\nEVENT TYPE=CLICK XPATH="/descendant::*[contains(' + '@' + ceil.param + ', \'' + ads_domain + '\')][2]" BUTTON=0';
        iim_code = iimPlayCode (local_imacros);
        iimDisplay (local_imacros + "\n" + iim_code);
      }
      result = 1;    
    }
  }

  return (result);
}

/**
@class  Navigation
@brief  Define only one ads url
@param  p_urls              URLs on page, AllFramesURL format
        p_ads_domain        Advertisments channel domain
@return  AllURLwithFrame.getOne format
        -1                  Error
*/
function BannerURL (p_urls, p_ads_domain) {
  var result = -1;
  var length_arr = p_urls.AllURL.length;
  var f_arr = new Array();
  var f_arr_l = 0;
  var iim_status = 0;

  for (h = 0; h < length_arr; h++) {
    if (p_urls.AllURL[h].search(p_ads_domain) !== -1) {
      result = p_urls.getOne(h);
      break;
    }
  }
  
  return (result);
}

/**
@class  Navigation
@brief  Get frame names in array.
@param  -
@return  Names array
*/
function GetFrameNames () {
  var result = new Array();
  var status = 1;

  var search_result_array = new Array();
  var search_result_string = '';
  var search_res_len = 0;

  var regexp_iframe = /<iframe[^>]*>/g;
  var regexp_nameval = /name=(('[^']*')|("[^"]*"))/g;
  var regexp_val = /(('[^']*')|("[^"]*"))/g;

  var loc_macros = "CODE:SET !EXTRACT_TEST_POPUP NO" + "\n";
  loc_macros += "TAG POS=1 TYPE=BODY ATTR=* EXTRACT=HTM" + "\n";
  iimPlay (loc_macros);
  search_result_string = iimGetLastExtract();
  search_result_array = search_result_string.match (regexp_iframe);

  if (search_result_array === null) {
    status = -1;
  }

  if (status !== -1) {
    search_result_string = search_result_array.join(",");
    search_result_array = search_result_string.match(regexp_nameval);
  }

  if (search_result_array === null) {
    status = -1;
  }

  if (status !== -1) {
    search_result_string = search_result_array.join(",");
    search_result_array = search_result_string.match(regexp_val);
  }

  if (search_result_array === null) {
    status = -1;
  }

  if (status !== -1) {
    search_res_len = search_result_array.length;
    for (j = 0; j < search_res_len; j++) {
      search_result_array[j] = "FRAME NAME=" + search_result_array[j];
    }
    result = search_result_array;
  }
  
  return (result);
}

/**
@class  Navigation
@brief  Convert relative url to absolute.
@param  p_rel               Relative url
        p_page              initial page
@return  Absolute url after converting
*/
function RelativeToAbsolute (p_rel, p_page) {
  var result = '';
  var abs_init = 'http://';
  var regexp_abs_init = /^https?:\/\//;

  var regexp_params = /\?.*$/;
  var doc_name_delete = /\/[^/.]+\.[^/.]+$/;
  var regexp_doc_name = /\/[^/]+/g;
  var docs = 0;
  var wrap_page = new Object();

  var counter = 0;
  var j = 0;

  if (isAbsolutePath (p_rel)) {
    result = p_rel;
  }
  else {
    if (!p_page) {
      p_page = GetCurrentURL ();
    }
    else {
      p_page = AddHTTP (p_page);
    }
    wrap_page = wrapper_http(p_page);
    if (!isAbsolutePath(p_page)) {
      p_page = abs_init + p_page;
    }
    p_page = p_page.replace (regexp_params, "");

    docs = p_page.match(regexp_doc_name);
    if (docs !== null) {
      if (docs.length > 1) {
        p_page = p_page.replace (doc_name_delete, "/");
      }
      if (p_page.search(/\/$/) === -1) {
        p_page = p_page + "/";
      }
    }

    if (p_rel.search (/^\.\./) !== -1) {
      //1. different folders - target upper
      // <a href="../Ссылаемый документ.html">Ссылка</a>
      do {
        p_rel = p_rel.replace(/^\.\.\//, "");
        counter++;
      } while (p_rel.search (/^\.\./) !== -1);

      docs = p_page.match(regexp_doc_name);
      if (docs !== null) {
        if (counter > (docs.length - 1)) {
          counter = docs.length - 1;
        }
      }

      for (j = 0; j < counter; j++) {
        p_page = p_page.replace(/[^/]+\/?$/, "");
      }
      result = p_page + p_rel;
    }
    else if (p_rel.search (/^\//) !== -1) {
      //2. Relative path to main folder
      // <a href="/course/">Курсы</a>
      result = abs_init + wrap_page.domain + p_rel;
    }
    else if (p_rel.search (/^(.+\/)*.+\.?.*$/) !== -1) {
      //3. same folders
      // <a href="Ссылаемый документ.html">Ссылка</a>
      //4. different folders - target deeper
      // <a href="Папка/Ссылаемый документ.html">Ссылка</a>
      result = p_page + p_rel;
    }
    else {
      result = p_rel;
    }
  }

  return (result);
}

/**
@class  Navigation
@brief  Get end of link
@param  p_url               Full URL
@return End of link
*/
function relURL (p_url) {
  var result = "";
  var reg_end = /[^/]+\/?$/;
  try {
    result = p_url.match(reg_end)[0];
  }
  catch (e) {
    result = p_url;
  }
  
  return (result);
}

/**
@class  Navigation
@brief  Add http in url.
@param  p_url               URL for changing
@return  new url
*/
function AddHTTP (p_url) {
  var abs_init = 'http://';
  var regexp_abs_init = /^https?:\/\//;
  var result = '';
  
  if (p_url.search(regexp_abs_init) === -1) {
    result = abs_init + p_url;
  }
  else {
    result = p_url;
  }

  return (result);
}

/**
@class  Navigation
@brief  Define own url.
@param  p_url               Tested URL
        p_current_url       Current URL
@return  true               Own url
         false              Foreign url 
*/
function OwnURL (p_url, p_current_url) {
  var result = false;

  if (!p_current_url) {
    p_current_url = GetCurrentURL ();
  }
  var current_domain = DomainFromURL(p_current_url);
  var p_url_without_params = p_url.replace (/\?.*/, "");

  if (current_domain !== -1) {
    if (isAbsolutePath (p_url)) {
      if (p_url_without_params.search (current_domain) !== -1) {
        result = true;
      }
    }
    else {
      result = true;
    }
  }
  
  return (result);
}

/**
@class  Navigation
@brief  Relative or absolute path check
@param  p_url               URL
@return true                Is absolute path
        false               Is relative path
*/
function isAbsolutePath (p_url) {
  var result = false;
  
  // var regexp_abs_init = /^https?:\/\//;
  var regexp_abs_init = /(https?:)?\/\//;

  if (p_url.search(regexp_abs_init) !== -1) {
    result = true;
  }

  return (result);
}

/**
@class  Navigation
@brief  Walks on the site
@param  p_site              Site page
        navigation_count    Count of saved site urls
        p_ad_url            ad url example
        p_ad_count          Count of saved ads urls
@return  report
          site              site url array
          ad                ad url array
          status            function status
            1               Success
            -1              Error
*/
function SiteWalker (p_site, navigation_count, p_ad_url, p_ad_count = 0) {
  var ERROR = {
    MAIN_WALK: -1
  }

  var report = {
    site: [],
    ad: [],
    status: 1
  };

  if (p_ad_count === 0) {
    p_ad_url = "";
  }

  // var loc_site = {
  //  domain: "",
  //  main_url: "",
  // full_url: ""
  // }
  var loc_site = wrapper_http(p_site);
  var ad_site = new Object();

  var l_wlk = new SiteWalker_v2 (p_site, navigation_count, p_ad_url);
  var ad_wlk = new Object();
  var ad_flag = true;

  var ad_report = new Object();
  var wlk_report = l_wlk.checkin();

  toJournal("for test 240: " + wlk_report.site.length);
  if (wlk_report.status === 1) {
    report.site = wlk_report.site;
  }
  else {
    report.status = ERROR.MAIN_WALK;
  }

  //ad walking
  if (report.status === 1) {
    if (!(p_ad_count > 0)) {
      ad_flag = false;
    }
    if (!p_ad_url) {
      ad_flag = false;
    }
  }

  if (ad_flag) {
    //go banner
    report.status = l_wlk.adsGo();
    toJournal("for test 2142: " + report.status);
  }
  if (report.status === 1) {
    ad_site = wrapper_http(GetCurrentURL());
    ad_wlk = new SiteWalker_v2 (ad_site.domain, p_ad_count);
    ad_report = ad_wlk.checkin();
    toJournal("for test 246: " + ad_report.site.length);
    if (ad_report.status === 1) {
      report.ad = ad_report.site;
    }
    else {
      report.status = -1;
    }
  }

  var close_sitewalk = true;
  //site_domain or ad_domain - close tab
  do {
    close_sitewalk = false;
    current_url = GetCurrentURL();
    if (current_url.search(loc_site.domain) !== -1) {
      close_sitewalk = true;
    }
    else if (p_ad_url !== "") {
      if (ad_site.hasOwnProperty("domain")) {
        if (current_url.search(ad_site.domain) !== -1) {
          close_sitewalk = true;
        }
      }
    }

    if (close_sitewalk) {
      iimPlayCode ("TAB CLOSE");
    }
  } while (close_sitewalk);

  if ((report.site.length === 0) && (report.ad.length === 0)) {
    report.status = -1;
  }
  toJournal("for test 324: " + report.status);
  
  return (report);
}

/**
@class  Navigation
@brief  Walks on the site
@param  p_site              Site page
        navigation_count    Count of saved site urls
        p_ad_url            ad url example
@return  report
          site              site url array
          with_ads_page     Page with ads
          status            function status
            1               Success
            -1              Error
*/
var SiteWalker_v2 = function (p_site, navigation_count, p_ad_url) {
  this.report = {
    site: [],
    with_ads_page: "",
    status: 1
  };

  // {
  //  domain: "",
  //  main_url: "",
  //  full_url: ""
  // };
  this.site = wrapper_http(p_site);

  this.site_size = this.SIZE.DEFAULT;

  this.current_url = "";

  this.navi_count = navigation_count;
  if (!p_ad_url) {
    this.p_ad_url = "";
  }
  else {
    this.p_ad_url = p_ad_url;
  }

  // {
  //  nextpages: pages array
  //  cost: 1024
  // }
  this.pages = new Object();
  this.bottom_cost = 0;

  this.url_history = new Array();
  this.historyRepeats_flag = false;
  this.contentClass = "";

  this.timepoint = (new Date()).getTime();

  this.goodurl_scope = new Array();
}

//for test -  - - - - - - - - - - - - [4, 7];
//main mode - - - - - - - - - - - - - [40, 60];
SiteWalker_v2.prototype._delay_range = [40, 60];

SiteWalker_v2.prototype.SIZE = {
  ERROR_NOSITE: -1,
  DEFAULT: 0,
  LITTLE_SITE: 1,
  NORMAL_SITE: 2
}

/**
@class  Navigation
@brief  Check on page - collect all urls and change costs
@param  -
@return Report
*/
SiteWalker_v2.prototype.checkin = function () {
  var par = "";
  var test_pages = 4;
  var k = 0;

  this.gosite();
  if (!(this.navi_count > 0)) {
    return (this.report);
  }

  if (this.navi_count > test_pages) {
    test_pages = this.navi_count;
  }
  for (k = 0; k < test_pages; k++) {
    this.goRandom();
    toJournal("for test 900: " + k + "; " + this.current_url);
  }

  this.addToScope();

  while (this.goodurl_scope.length < this.navi_count) {
    toJournal("for test 901: " + this.goodurl_scope.length + "/" + this.navi_count + "; " + this.current_url);
    this.goRandom();
    this.addToScope(this.current_url);
  }

  var test_txt = "for test 938: " + this.goodurl_scope.join("\n");
  toJournal(test_txt);

  for (k = 0; k < this.goodurl_scope.length; k++) {
    toJournal("for test 2055: " + this._getpagescount());
    this.settimepoint();
    this.directlinkGo(this.goodurl_scope[k]);
    this.wait_withtimepoints();
  }

  this.report.site = this.goodurl_scope;
  this.report.status = 1;
  // with_ads_page?

  return(this.report);
}

/**
@class  Navigation
@brief  Go to site
@param  -
@return -
*/
SiteWalker_v2.prototype.gosite = function () {
  var wr_current = wrapper_http(GetCurrentURL());

  if (wr_current.domain !== this.site.domain) {
    if ("about:logopage" !== wr_current.domain) {
      iimPlayCode ("TAB OPEN\nTAB T=2");
    }
    iimPlayCode ("URL GOTO=\"" + this.site.main_url + "\"");
  }

  this._actualURL();
}

/**
@class  Navigation
@brief  Go to the page
@param  -
@return -
*/
SiteWalker_v2.prototype.goPage = function (p_url) {
  var l_current = GetCurrentURL();
  var wr_url = wrapper_http (p_url);

  if (l_current !== wr_url.full_url) {
    iimPlayCode ("URL GOTO=\"" + wr_url.full_url + "\"");
  }

  this._actualURL();
}

/**
@class  Navigation
@brief  Actualize current_url
@param  wait_flag           Waiting here
@return Current URL
*/
SiteWalker_v2.prototype._actualURL = function(wait_flag = false) {
  this.current_url = GetCurrentURL();
  var early_i = 0;

  if (this.url_history[this.url_history.length-1] !== this.current_url || (this.url_history.length === 0)) {
    if (wait_flag) {
      this.wait_withtimepoints();
    }
    this.url_history.push (this.current_url);
    if (!this.historyRepeats_flag) {
      early_i = this.url_history.indexOf(this.current_url);
      if ((early_i !== -1) && (early_i !== this.url_history.length-1)) {
        this.url_history.splice(early_i, 1);
      }
    }
    toJournal("for test 2102: " + this.url_history.length);
    this._addpages();
  }

  return (this.current_url);
}

/**
@class  Navigation
@brief  Add pages to object
@param  -
@return -
*/
SiteWalker_v2.prototype._addpages = function() {
  var j = 0;
  var l_len = 0;
  var tested_url = "";
  var current_url = "";
  var reg_inquotes = /"[^"]*"/;
  var class_content = "";
  var init_val = 1024;

  current_url = this.current_url;
  this.defineContentClass();

  if (!this.pages.hasOwnProperty(current_url)) {
    this.pages[current_url] = new Object();
    this.pages[current_url].cost = init_val;
  }
  if (!((this.pages[current_url]).hasOwnProperty("nextpages"))) {
    if (this.contentClass === "") {
      this.pages[current_url].nextpages = AllURL();
    }
    else {
      class_content = getAllClassTags (this.contentClass);
      this.pages[current_url].nextpages = AllURL(class_content);
    }
    if (this.pages[current_url].nextpages.length === 0) {
      this.pages[current_url].nextpages = AllURL();
    }
    
    l_len = this.pages[current_url].nextpages.length;
    for (j = 0; j < l_len; j++) {
      //delete href and quotes
      try {
        tested_url = this.pages[current_url].nextpages[j].match(reg_inquotes)[0].replace(/"/g, "");
      }
      catch (err) {
        continue;
      }

      //only own urls
      if (!OwnURL(tested_url, current_url)) {
        continue;
      }

      //get absolute url
      tested_url = RelativeToAbsolute (tested_url, current_url);

      if (!this.pages.hasOwnProperty(tested_url)) {
        this.pages[tested_url] = new Object();
        this.pages[tested_url].cost = init_val;
      }
      else {
        this.pages[tested_url].cost = this.pages[tested_url].cost/2;
      }
    }
  }
}

/**
@class  Navigation
@brief  Count records in this.pages
@param  
@return 
*/
SiteWalker_v2.prototype._getpagescount = function () {
  var count = 0;

  for (var par in this.pages) {
    count++;
  }
  return(count);
}

/**
@class  Navigation
@brief  Resave pages to object
@param  -
@return -
*/
SiteWalker_v2.prototype.resave_URLs = function(t_pages) {
  t_pages.nextpages = AllURL();
}

/**
@class  Navigation
@brief  Define content class
@param  -
@return Content class
*/
SiteWalker_v2.prototype.defineContentClass = function () {
  this.contentClass = BiggestOftenClass ();
  
  return (this.contentClass);
}

/**
@class  Navigation
@brief  Go with random link
@param  -
@return 1                   Success
        -1                  Error
*/
SiteWalker_v2.prototype.goRandom = function (p_historyexcept_flag = true) {
  var result = 1;
  var new_url = "";
  var next_res = -1;
  var hist_it = this.url_history.length - 2;
  var back_res = 0;

  while (next_res === -1) {
    if (p_historyexcept_flag) {
      next_res = NextRandomPage(this.pages[this.current_url].nextpages);
    }
    else {
      next_res = NextRandomPage(this.pages[this.current_url].nextpages, this.url_history);
    }
    toJournal("for test 1350: " + next_res);
    if (next_res === -1) {
      if (!(hist_it < 0)) {
        this.directlinkGo(this.url_history[hist_it]);
        hist_it--;
      }
      else {
        if (result === 1) {
          result = -1;
          this.resave_URLs(this.pages[this.current_url]);
          this.report.status = -1;
          // break;
        }
        else {
          result = 1;
          back_res = backNavi();
          toJournal ("for test 2216 here: " + GetCurrentURL());
          // if (GetCurrentURL().search(/about:/) !== -1) {
          if (back_res === -1) {
            iimPlayCode ("TAB OPEN\nTAB T=2");
            this.directlinkGo(this.site.main_url);
          }
        }
      }
    }
    else {
      result = 1;
    }
  }

  this._actualURL();

  return (result);
}

/**
@class  Navigation
@brief  Add good urls to scope
@param  p_url               URL. If empty - adding history
@return -
*/
SiteWalker_v2.prototype.addToScope = function (p_url = '') {
  var arr = new Array();
  var loc_len = 0;
  // this.goodurl_scope
  // if p_url
  if (p_url) {
    arr.push(p_url);
  }
  else {
    arr = this.url_history;
  }
  loc_len = arr.length;

  this.getBottomCost();

  for (var i = 0; i < loc_len; i++) {
    if (this.pages.hasOwnProperty(arr[i])) {
      if (this.pages[arr[i]].nextpages.length < 2) {
        continue;
      }
      if (this.bottom_cost < this.pages[arr[i]].cost) {
        if (this.goodurl_scope.indexOf(arr[i]) === -1) {
          this.goodurl_scope.push(arr[i]);
        }
      }
    }
  }
}

/**
@class  Navigation
@brief  Define top cost
@param  -
@return get top cost
*/
SiteWalker_v2.prototype.getBottomCost = function () {
  this.bottom_cost = 512;

  for (var par in this.pages) {
    if (this.pages[par].cost < this.bottom_cost) {
      this.bottom_cost = this.pages[par].cost;
    }
  }

  return (this.bottom_cost);
}

/**
@class  Navigation
@brief  Go with random link
@param  p_url               URL
@return iMacros status
*/
SiteWalker_v2.prototype.directlinkGo = function (p_url) {
  return (iimPlayCode ("URL GOTO=\"" + p_url + "\""));
}

/**
@class  Navigation
@brief  Go to ads
@param  p_url               URL
@return 1                   Success
        -1                  Error
*/
SiteWalker_v2.prototype.adsGo = function () {
  var res = -1;
  var iter = -1;
  var length = this.report.site.length;
  var current_link = "";
  var lurls = new Object();

  if (this.p_ad_url === "") {
    return (-1);
  }

  var ad_domain = DomainFromURL (this.p_ad_url);

  while (iter < length) {
    if (iter === -1) {
      current_link = this.site.main_url;
    }
    else {
      current_link = this.report.site[iter];
    }
    if (GetCurrentURL() !== this.site.main_url) {
      this.directlinkGo(current_link);
    }
    
    lurls = AllFramesURL();
    if (GoBanner(lurls, ad_domain) === 1) {
      res = 1;
      break;
    }
    iter++;
  }

  return (res);
}

/**
@class  Navigation
@brief  Set timepoint for define time periods
@param  -
@return -
*/
SiteWalker_v2.prototype.settimepoint = function () {
  this.timepoint = (new Date()).getTime();
}

/**
@class  Navigation
@brief  Wait with timepoints
@param  -
@return -
*/
SiteWalker_v2.prototype.wait_withtimepoints = function () {
  var current_point = (new Date()).getTime();
  var delta_s = Math.round((current_point - this.timepoint)/1000);
  var rand_period = getRandom (this._delay_range[0], this._delay_range[1]);

  toJournal("for test 956 wait period: " + delta_s + "/" + rand_period);

  if (rand_period > delta_s) {
    Delay(rand_period - delta_s);
  }

  this.settimepoint();
}

/**
@class  Navigation
@brief  Doing while count of history url count not more then p_count_edge, or while not all pages was invited
@param  -
@return 1                   Little site
        2                   Normal site
        -1                  Error
*/
SiteWalker_v2.prototype.breadthfirstTree = function () {
  var STATUS = {
    DEFAULT: 0,
    LITTLE_SITE: 1,
    NORMAL_SITE: 2,
    ERROR_NOSITE: -1
  }
  this.site_size = this.SIZE.DEFAULT;
  var cur_elem = 0;
  var cur_allurl = 0;
  var a_one_elem = new Array();

  //elem: {
  //  url: "",
  //  next_allurl: array(),
  //}
  var arr_pages = new Array();
  var next_res = -1;
  var old_history_size = 0;

  this.historyRepeats_flag =false;

  this.gosite();

  if (this.site_size === this.SIZE.DEFAULT) {
    arr_pages.push ({url: this.current_url, next_allurl: this.pages[this.current_url].nextpages});
  }
  while (this.site_size === this.SIZE.DEFAULT) {
    if (this.url_history.length > this.navi_count) {
      this.site_size = this.SIZE.NORMAL_SITE;
    }
    else {
      a_one_elem = arr_pages[cur_elem].next_allurl.slice(cur_allurl, cur_allurl+1);
      toJournal("for test 1941: " + cur_elem + "\n" + a_one_elem[0]);
      toJournal("for test 2056: " + arr_pages.length + "/" + this.url_history.length);
      next_res = NextRandomPage(a_one_elem, this.url_history);
      if (next_res !== -1) {
        old_history_size = this.url_history.length;
        this._actualURL();
        if (old_history_size < this.url_history.length) {
          // arr_pages.push ({url: this.current_url, next_allurl: this.pages[this.current_url].nextpages});

          //split current object
          arr_pages.splice (cur_elem+1, 0, {url: arr_pages[cur_elem].url, next_allurl: arr_pages[cur_elem].next_allurl.slice(cur_allurl + 1)});
          arr_pages[cur_elem].next_allurl.splice(0, arr_pages[cur_elem].next_allurl.length);

          //add between splits
          arr_pages.splice (cur_elem+1, 0, {url: this.current_url, next_allurl: this.pages[this.current_url].nextpages});
        }
      }
      cur_allurl++;
      if (cur_allurl >= arr_pages[cur_elem].next_allurl.length) {
        cur_allurl = 0;
        cur_elem++;
      }
      if (cur_elem >= arr_pages.length) {
        this.site_size = this.SIZE.LITTLE_SITE;
        break;
      }
      else {
        this.goPage(arr_pages[cur_elem].url);
      }
    }
  }

  this.historyRepeats_flag = true;

  return (this.site_size);
}

/**
@class  Navigation
@brief  Doing while count of history url count not more then p_count_edge, or while not all pages was invited. Async version
@param  -
@return 1                   Little site
        2                   Normal site
        -1                  Error
*/
SiteWalker_v2.prototype.breadthfirstTree_async = function () {
  var STATUS = {
    DEFAULT: 0,
    LITTLE_SITE: 1,
    NORMAL_SITE: 2,
    ERROR_NOSITE: -1
  }

  var cur_elem = 0;
  var cur_allurl = 0;
  var a_one_elem = new Array();
  var cur_tubnum = 0;
  var cur_ghosttub = 0;
  var cur_id = "";

  //elem: {
  //  url: "",
  //  next_allurl: array(),
  //  outerHTML: ""
  //}
  var arr_pages = new Array();
  var next_res = -1;
  var old_history_size = 0;

  var uIn_map = new Map();

  this.site_size = this.SIZE.DEFAULT;
  this.historyRepeats_flag = false;
  this.gosite();

  toJournal("for test 1441: " + this.current_url);

  arr_pages.push ({url: this.current_url, next_allurl: this.pages[this.current_url].nextpages, outerHTML: ""});
  while (this.site_size === this.SIZE.DEFAULT) {
    if (this.url_history.length > this.navi_count) {
      this.site_size = this.SIZE.NORMAL_SITE;
      break;
    }
    else {
      a_one_elem = arr_pages[cur_elem].next_allurl.slice(cur_allurl, cur_allurl+1);
      toJournal("for test 1941: " + cur_elem + "\n" + a_one_elem[0]);
      toJournal("for test 2056: " + arr_pages.length + "/" + this.url_history.length);

      if (arr_pages[cur_elem].outerHTML) {
        cur_tubnum = Tabs.newtab();
        Tabs.body_outerHTML(cur_tubnum, arr_pages[cur_elem].outerHTML);
        toJournal("for test 1138-1:" + arr_pages[cur_elem].outerHTML.length);
      }
      else {
        toJournal("for test 1427: " + arr_pages[cur_elem].url);
        cur_tubnum = Tabs.newtab();
        Tabs.loadtabevent(function(){
          cb_saveOuterHTML (arr_pages[cur_elem], cur_tubnum);
          toJournal("for test 2326:" + arr_pages[cur_elem].outerHTML.length);
        });
        cur_ghosttub = Tabs.newtab();
        Tabs.loadURI(arr_pages[cur_elem].url, cur_tubnum);
        Tabs.tabclose(cur_ghosttub);
      }

      Tabs.go(cur_tubnum);
      cur_id = Tabs.setId();

      uIn_map.set (cur_id, new uInstance(arr_pages[cur_elem].url, a_one_elem[0]));
      
      //do transfer

      // async NextRandomPage
      // next_res = NextRandomPage(a_one_elem, this.url_history);

      toJournal("for test 1054: " + arr_pages[cur_elem].outerHTML.length);

      cur_allurl++;
      if (cur_allurl >= arr_pages[cur_elem].next_allurl.length) {
        cur_allurl = 0;
        cur_elem++;
      }
      if (cur_elem >= arr_pages.length) {
        cur_elem--;
        // this.site_size = this.SIZE.LITTLE_SITE;
        // break;
      }
      else {
        // this.goPage(arr_pages[cur_elem].url);
      }
    }

    //close ended u-instances
    for (var l_item of uIn_map) {
      if (!!l_item[1].state) {
        Tabs.tabclose(Tabs.idtonum(l_item[0]));
        uIn_map.delete(l_item[0]);
      }
    }
    
    // Delay(1);
  }

  this.historyRepeats_flag = true;

  return (this.site_size);
}

/**
@class  Navigation
@brief  Callback template function for saving
          outerHTML
@param  p_struct
          outerHTML         Changed in callback
        p_tabIndex          tab with copied html
@return  
*/
function cb_saveOuterHTML (p_struct, p_tabIndex) {
  if (!p_struct.outerHTML) {
    p_struct.outerHTML = Tabs.body_outerHTML(p_tabIndex)
  }
}

/**
@class  Navigation
@brief  uInstance constructor
@param  p_url               Init url
        p_allurl_item       link for transfer
@return result
          url               init url
          allurl_item       link for transfer
          state             state of loading
          res_url           result url
*/
var uInstance = function(p_url, p_allurl_item) {
  var result = {
    url: p_url,
    allurl_item: p_allurl_item,
    state: "",
    res_url: ""
  }
  return (result);
}

/**
@class  Navigation
@brief  Set tab_id
@param  p_id                tab id
@return -
*/
uInstance.prototype.setTab_id = function (p_id) {
  this.tab_id = p_id;
}

/**
@class  Navigation
@brief  Go to the next random page.
@param  p_urls              URLs on page, AllURL format
@return  New URL
        -1                  Error
*/
function NextRandomPage (p_urls, p_history = new Array()) {
  var result = 0;
  var url_count = p_urls.length;
  var url_go = {
    url: '',
    status: -1
  };
  var back_res = 0;
  var l_current_url = GetCurrentURL ();
  var ceil = new Object();

  var indexes = new Array();

  toJournal("for test 1333: " + url_count);

  indexes = numShuffle (url_count);

  for (i = 0; i < url_count; i++) {
    ceil = AllURL_div(p_urls[indexes[i]]);
    if (ceil.status === -1) {
      continue;
    }
    if (!OwnURL (ceil.text, l_current_url)) {
      continue;
    }
    url_go = AllURL_Go(p_urls[indexes[i]]);
    if (url_go.status === 1) {
      toJournal("for test 2201");
      if (p_history.indexOf(url_go.url) === -1) {
        p_history.push();
        break;
      } else {
        url_go.status === -1;
        backNavi();
        continue;
      }
    }
  }

  if (url_go.status !== 1) {
    result = -1;
  }
  else {
    result = url_go.url;
  }

  return (result);
}

/**
@class  Navigation
@brief  Define most often class.
@param  -
@return Array               Classes from often to rare
        [], length=0        No classes on page
        item
        {
          class_name: "",   Class name 
          times: 0,         Times at the page
          size: 0,          For saving average tag size
          points: 0,        Result points
        }
*/
function veryOftenClasses () {
  var result = [];
  var search_result = null;
  var len = 0;
  var max = {
    value: 0,
    class: ''
  };
  var edge = 3;
  var item = function (p_class, p_times) {
    this.class_name = p_class;
    this.times = p_times;
    this.size = 0;
    // this.points = 0;
  }
  var i = 0;
  var html_code = '';
  var regexp_url = /class\s?=\s?(('[^']*')|("[^"]*"))/g;
  var regexp_class_name = /(('[^']*')|("[^"]*"))/;

  var classes = new Object();
  var test_txt = "";

  var loc_macros = "CODE:SET !EXTRACT_TEST_POPUP NO" + "\n";
  loc_macros += "TAG POS=1 TYPE=BODY ATTR=* EXTRACT=HTM" + "\n";
  iimPlay (loc_macros);
  html_code = iimGetLastExtract();
  search_result = html_code.match (regexp_url);

  if (search_result !== null) {
    len = search_result.length;
    for (i = 0; i < len; i++) {
      search_result[i] = search_result[i].match(regexp_class_name)[0];
      search_result[i] = search_result[i].replace (/["']/g, "");
      if (classes.hasOwnProperty(search_result[i])) {
        classes[search_result[i]]++;
      }
      else {
        classes[search_result[i]] = 1;
      }
    }

    var cur = "";
    for (cur in classes) {
      if (classes[cur] > max.value) {
        max.value = classes[cur];
        max.class = cur;
      }
    }

    // if (edge < max.value/2) {
    //  edge = max.value/2;
    // }

    for (cur in classes) {
      // test_txt += cur + ": " + classes[cur] + "\n";
      len = result.length;
      if (classes[cur] > edge) {
        for (i = 0; i <= len; i++) {
          if (i === len) {
            result.push(new item (cur, classes[cur]));
          }
          if (result[i].times < classes[cur]) {
            result.splice (i, 0, new item (cur, classes[cur]));
            break;
          }
        }
      }
    }
    // result = max.class;
  }

  len = result.length;
  for (i = 0; i < len; i++) {
    result[i].size = avgSizeClass (result[i].class_name);

    // test_txt += result[i].class_name + ": " + result[i].times + "; " + result[i].size + "\n";
  }
  // toJournal("for test 2054:\n" + test_txt);

  return (result);
}

/**
@class  Navigation
@brief  Biggest often class
@param  -
@return Class name
*/
function BiggestOftenClass () {
  var result = "";
  var size_max = 0;
  var l_rarity_classes = veryOftenClasses ();
  var len = l_rarity_classes.length;

  for (var i = 0; i < len; i++) {
    if (l_rarity_classes[i].size > size_max) {
      size_max = l_rarity_classes[i].size;
      result = l_rarity_classes[i].class_name;
    }
  }
  
  return (result);
}

/**
@class  Navigation
@brief  Define next URL. Not working!
@param  p_allurl_item       String in format 'href="url"'
        p_current_url       Current URL
@return Promise
*/
function defineNextURL (p_allurl_item, p_current_url) {
  var result = 1;
  var regexp_url = /^[^=]*=["']([^"']+)["']$/;
  var l_href = "";
  var xhr = new XMLHttpRequest();
  var l_timeout = 30*1000;

  if (!p_current_url) {
    p_current_url = GetCurrentURL();
  }

  if (p_allurl_item.search(regexp_url) === -1) {
    l_href = p_allurl_item;
  }
  else {
    l_href = p_allurl_item.replace (regexp_url, "$1");
  }
  l_href = RelativeToAbsolute(l_href, p_current_url);
  toJournal("for test 1924: " + l_href);
  
  do {
    // xhr.open ("GET", l_href, false);
    xhr.open ("GET", l_href, false);
    xhr.timeout = l_timeout;
    xhr.send ();
    Delay(10);
  } while (xhr.status !== 200);
  iimDisplay (xhr.getAllResponseHeaders());
  toJournal("for test 1929: " + result);
  toJournal("for test 1943: " + xhr.getAllResponseHeaders());
  result = xhr.responseURL;
  getGo (xhr.responseURL);

  toJournal("for test 1957: " + xhr.responseURL);
  toJournal("for test 1945: " + xhr.responseText);
  
  return (result);
}

/**
@class  Navigation
@brief  Go to page. Maybe with saved body - fast open.
@param  p_url               URL
        p_body              Body content
        p_allurl_elem       All_URL elem
        p_history           History
@return  1                  Success
        -1                  Error
*/
function goPage (p_url, p_body, p_allurl_elem, p_history = new Array()) {
  var result = 1;
  var tab_num = Tabs.newtab("about:logopage");
  var tab_id = Tabs.setId(tab_num);

  if (!!p_url) {
    content.document.location.replace(p_url);
  }

  toJournal("for test 1956");

  var acts_page = [
    // function () {
    //   //
    // },
  ];

  acts_page.push (
    function () {
      toJournal("for test 2047");
      return(1);
    }
  );

  if (!p_url) {
    acts_page.push (
      function () {
        toJournal("for test 2158");
        content.document.querySelector('body').innerHTML = p_body;
        if (!p_allurl_elem) {
          return (1);
        }
      }
    );
  }

  if (!!p_allurl_elem) {
    acts_page.push (
      function () {
        toJournal("for test 2159");
        if (AllURL_Go(p_allurl_elem) !== 1) {
          return (1);
        }
      }
    );
  }

  acts_page.push (
    function () {
      toJournal("for test 2200");
      // var url = Tabs.geturl(tab_num);
      var url = Tabs.geturl(-1, true);
      if (p_history.indexOf (url) !== 1) {
        p_history.push (url);
      }
      // Tabs.tabclose(tab_num);
      Tabs.tabclose();
    }
  );

  Tabs.loadtabevent(acts_page);

  return (result);
}

//-------------------//Завершение - навигация//----------------------

//----------------------//Работа с файлами//-------------------------

/**
@class  Files
@brief  Читает файл, открывая его в браузере. Разделяет содержимое на строки
@param  pFullPath     Полный путь к читаемому файлу
@return Массив строк
          -1          Ошибка при выполнении
*/
function readFile (pFullPath) {
  var resultArr = 1;
  var URLfile = pFullPath;
  var textData = "";
  var length = 0;
  var iim_code = 0;
  if (URLfile.search(/file:/) === -1) {
    if (URLfile.search(/\\\\/) !== -1){
      URLfile = URLfile.replace(/\\\\/g, "\\");
    }
    URLfile = URLfile.replace(/\\/g, "/");
    URLfile = "\"file:///" + URLfile + "\"";
  }
  
  var loc_macros = "CODE:SET !EXTRACT_TEST_POPUP NO" + "\n";
  loc_macros += "TAB OPEN" + "\n";
  loc_macros += "TAB T=2" + "\n";
  loc_macros += "URL GOTO=" + URLfile + "\n";
  loc_macros += "TAG POS=1 TYPE=BODY ATTR=* EXTRACT=TXT" + "\n";
  loc_macros += "TAB CLOSE" + "\n";
  iim_code = iimPlay (loc_macros);
  if (iim_code !== 1) {
    resultArr = -1;
  }
  else {
    textData = iimGetExtract ();

    resultArr = textData.split("\n");

    length = resultArr.length;
    for (i = 0; i < length; i++) {
      if (resultArr[i] === "") {
        resultArr.splice (i, 1);
      }
    }
  }

  return (resultArr);
}

/**
@class    Files
@brief    Читает данные из файла с нужной строчки
@param    full_path   Полный путь к читаемому файлу
          line        Номер строчки
          numoftabs   Количество столбцов в таблице
          first_line  (необязательно)Первая строчка
@return   Данные строчки. В формате массива, начиная с индекса 1
          -1          Ошибка при чтении файла
*/
function ReadLine_v2(full_path, line, numoftabs, pDiv, p_first_line) {
  var result = [];
  var tab = 1;
  
  if ((!(!!pDiv)) || (pDiv==="")) {
    pDiv = ",";
  }

  var macro = "CODE:SET !EXTRACT_TEST_POPUP NO"+"\n";
  macro += "SET !ERRORIGNORE YES" + "\n";
  
  if (!full_path) {
    alertDebug ("1706: " + arguments[0] + "\n" + arguments[1] + "\n" + arguments[2] + "\n" + arguments[3] + "\n" + arguments[4]);
  }

  var loc_file = File_(full_path);
  if (loc_file.name == -1) {
    return (-1);
  }
  
  var changed_full_path = "\"" + full_path + "\"";
  
  if (changed_full_path.search(/\\\\/) == -1){
    changed_full_path = changed_full_path.replace(/\\/g, "\\\\");
  }
  
  macro +="SET !DATASOURCE_DELIMITER " + pDiv + "\n";
  macro +="SET !DATASOURCE " + changed_full_path + "\n";
  macro +="SET !DATASOURCE_COLUMNS " + numoftabs + "\n";
  macro +="SET !DATASOURCE_LINE " + line + "\n";
  
  for (tab = 1; tab<=numoftabs; tab++) {
    macro += "ADD !EXTRACT {{!COL" + tab + "}}"+ "\n";
  }
  if (iimPlay(macro) === 1) {
    for (tab = 1; tab<=numoftabs; tab++) {
      result[tab] = iimGetLastExtract(tab);
      if ((result[tab]===null) || (result[tab]=="undefined")) {
        return (-1);
      }
      if ((tab===1) && (result[tab]==="")) {
        return (-1);
      }
    }
  }
  else {
    return (-1);
  };
  //<0.9 version
  if (line !== 1) {
    

    if ((!p_first_line) || (p_first_line=="")) {
      p_first_line = ReadLine_v2(full_path, 1, numoftabs, pDiv);
      p_first_line = p_first_line[1];
    }
    
    if (result[1] === p_first_line) {
      result = -1;
    }
  }

  return (result);
}

/**
@class  Files
@brief  Разделяет полный путь файла на адрес папки и название файла
@param  full        полное имя файла
@return result      
          dir       Папка
          name      Имя файла
            -1      Ошибка при выполнении
*/
function File_(full) {
  var result = {
    dir: "",
    name: ""
  };
  if (!full) {
    alertDebug ("Function File_ error: full is not defined");
    return (-1);
  }
  // \[A-Za-z0-9._]*.[a-z]*
  result.name = full.match(RegExp("[A-Za-z0-9_]+[.]+[a-z]+", ""));
  result.dir = full.replace(result.name, "");
  return (result);
}

/**
@class  Files
@brief  Инициализирует чтение файла со списком UserAgent
@param  p_fullnamefile          Полное имя файла
@return Зависит от применяемого метода
*/
function UserAgent (p_fullnamefile) {
  var result = {
    fullnamefile: p_fullnamefile,
    min_str: 2,
    num_tab: 2,
    div: ";"
  }
  result.l_first_line = (ReadLine_v2(p_fullnamefile, 1, result.num_tab, result.div, ""))[1];

  result.l_min_absent_str = (function () {
    var local_result = 2;

    var l_read_line = ReadLine_v2(p_fullnamefile, local_result, result.num_tab, result.div, result.l_first_line);
    while (l_read_line!=-1) {
      local_result *= 2;
      l_read_line = ReadLine_v2(p_fullnamefile, local_result, result.num_tab, result.div, result.l_first_line);
    }
    return (local_result);
  })();
  result.l_current_str = result.min_str;
  /**
  @class  Files
  @brief  Определяет UserAgent
  @param  p_rand                Последовательность определения величин
            true                Случайный порядок
            false               Возвращается следующее значение
  @return                       Строковое значение UserAgent
  */
  result.GetUserAgent = function (p_rand) {
    var loc_result = "";

    var l_read_line = "";
    if (p_rand) {
      this.l_current_str = getRandom (this.min_str, this.l_min_absent_str);
      l_read_line = ReadLine_v2(this.fullnamefile, this.l_current_str, this.num_tab, this.div, this.l_first_line);
      while (l_read_line==-1) {
        if (this.l_current_str < this.l_min_absent_str) {
          this.l_min_absent_str = this.l_current_str;
        }
        this.l_current_str = getRandom (this.min_str, this.l_min_absent_str);
        l_read_line = ReadLine_v2(this.fullnamefile, this.l_current_str, this.num_tab, this.div, this.l_first_line);
      }
    }
    else {
      this.l_current_str++;
      l_read_line = ReadLine_v2(this.fullnamefile, this.l_current_str, this.num_tab, this.div, this.l_first_line);
      if (l_read_line==-1) {
        this.l_current_str = this.min_str;
      }
    }
    loc_result = l_read_line[2] + " " + l_read_line[1];

    return (loc_result);
  };
  return (result);
}

/**
@class  Files
@brief  Инициализирует чтение файла со списком UserAgent. Использует 
          readFile
@param  p_fullnamefile          Полное имя файла
@return Зависит от применяемого метода
*/
function UserAgent_v2 (p_fullnamefile) {
  var result = {
    fullnamefile: p_fullnamefile,
    min_str: 2,
    num_tab: 2,
    div: ";",
  }

  var a_useragent_content = readFile (p_fullnamefile);

  result.l_first_line = a_useragent_content[0];
  result.l_min_absent_str = a_useragent_content.length;
  result.l_current_str = result.min_str;

  /**
  @class  Files
  @brief  Определяет UserAgent
  @param  p_rand                Определяет последовательность 
                                  определения величин
            true                Случайный порядок
            false               Возвращается следующее значение
  @return                       Строковое значение UserAgent
  */
  result.GetUserAgent = function (p_rand) {
    var loc_result = "";
    var loc_a_useragent_content = readFile (this.fullnamefile);
    var l_read_line = "";
    var a_u_line = [];
    var first_div_pos = 0;

    if (p_rand) {
      this.l_current_str = getRandom (this.min_str, this.l_min_absent_str);
      l_read_line = loc_a_useragent_content[this.l_current_str+1];
    }
    else {
      this.l_current_str++;
      if (!(this.l_current_str < this.l_min_absent_str)) {
        this.l_current_str = this.min_str;
      }
      l_read_line = loc_a_useragent_content[this.l_current_str+1];
    }
    l_read_line = l_read_line.replace(/"/g, "");
    first_div_pos = l_read_line.indexOf (this.div);
    a_u_line[0] = l_read_line.substring(0, first_div_pos);
    a_u_line[1] = l_read_line.substring(first_div_pos+1);
    loc_result = a_u_line[1] + " " + a_u_line[0];
    return (loc_result);
  };
  return (result);
}

/**
@class    Files
@brief    Читает служебные данные из файла.
@param    full_path_service   Полный путь служебного файла
@param    struct_sample       Пример структуры результата.
          {                     Последний элемент - массив.
            a:"",
            ...
            z:"",
            array: []
          }
@return   result              Служебные данные. Формат соответствует
                                аргументу struct_sample
          В случае ошибок возвращает struct_sample
*/
function ReadService_v2 (full_path_service, struct_sample) {
  var result = struct_sample;
  
  var current_line = 1;
  var count_lines = 0;
  var lines = [];
  var tabs = 1;
  
  lines[current_line] = ReadLine_v2 (full_path_service, 1, tabs, "", "");
  if (lines[current_line] == -1) {
    return (result);
  }
  lines[current_line] = lines[current_line][1];
  while (true) {
    current_line++;
    lines[current_line] = ReadLine_v2 (full_path_service, current_line, tabs, "", lines[1]);

    if (lines[current_line] == -1) {
      break;
    }
    else {
      lines[current_line] = lines[current_line][1];
    }
  }
  if (lines[0] == -1) {
    return (result);
  }
  
  count_lines = current_line;
  
  current_line = 0;
  
  var prev_param = "";
  for (param in result) {
    if (prev_param !== "") {
      result[prev_param] = lines[current_line];
    }
    prev_param = param;
    current_line++;
  }
  
  var proxy_line = current_line;
  for (current_line; current_line < count_lines; current_line++) {
    result[prev_param][current_line - proxy_line] = lines[current_line];
  }
  
  return (result);
}

/**
@class	Files
@brief	Записывает данные в файл. Совместимо с ReadService_v2
@param	pDirPath						Путь к папке с файлом
				pFile 							Имя файла
				struct_sample 			Данные
					{                 
            a:"",
            ...
            z:"",
            array: []
          }
@return	1										Успешно выполнено
				-1									Ошибка при выполнении
*/
function writeStruct (pDirPath, pFile, struct_data) {
	var result = 1;
	var loc_macros = "";
	var last_param = "";
	var param = "";
	var l_arr = [];
	var arr_size = 0;
	pDirPath = pDirPath.replace (/\\/g, "\\\\");
  
  iimPlayCode("FILEDELETE NAME=\"" + pDirPath + "\\\\" + pFile + "\"");

  for (param in struct_data) {
  	last_param = param;
  }

  for (param in struct_data) {
  	if (last_param === param) {
  		break;
  	}
	  addRecToFile (pDirPath, pFile, struct_data[param]);
  }

  //последний элемент - массив
  if ( Array.isArray (struct_data[last_param]) ) {
  	l_arr = struct_data[last_param];
  	arr_size = l_arr.length;
  	for (i = 0; i < arr_size; i++) {
	  	addRecToFile (pDirPath, pFile, l_arr[i]);
  	}
  }
  //Последний элемент - не массив
  else {
	  addRecToFile (pDirPath, pFile, struct_data[last_param]);
  }
	
	return (result);
}

/**
@class  Files
@brief  Добавляет данные в файл
@param  pDirPath            Путь к папке с файлом
        pFile               Имя файла
        p_data              Данные
@return 1                   Success
        -1                  Error
*/
function addRecToFile (pDirPath, pFile, p_data) {
  var result = 1;
  imnsWrite (pDirPath + "\\" + pFile, p_data);

  return (result);
}

/**
@class    Files
@brief    Читает служебные данные из файла. Применяет функцию readFile.
@param    full_path_service   Полный путь служебного файла
@return     Массив пакетов аккаунтов, структура каждого элемента 
              представлена ниже. В элементе могут отсутствовать
              некоторые записи.
          {
            //ip_proxy:port_proxy
            proxy: "N:N",
            //Service - только в 0 пакете
            service: {
              delayTime: 0,
            }
            //FB
            facebook: [acc_data],
            //G+
            google_plus: [acc_data],
            //VK
            vk: [acc_data]
          }
          
          Вспомогательные структуры:
          const acc_data = {
            login: "",
            pass: "",
            page: [],
            material: [material_url]
          }
          const material_url: {
            url: "",
            last_check: ""
          }
          
          -1                            Нет данных
*/
function ReadService_accs (path_service_folder, p_service_file)
{
  var full_path_service = path_service_folder + "\\" + p_service_file;
  
  var result = [];
  var lines = readFile (full_path_service);

  if (lines === -1) {
    return (-1);
  }

  var count_lines = lines.length;

  var current_line = 0;
  var num_packet = -1;
  var id_social = "";
  var num_acc_inline = -1;
  var numpage = -1;
  var num_source = -1;
  var log_pass_counter = 0; // 0 - логин, 1 - пароль
  var serviceParamName = "";
  var serviceParamVal = "";
  
  for (current_line = 0; current_line < count_lines; current_line++) {
    if (lines[current_line]=="") {
      continue;
    };
    
    line_type = VerifyServiceLine (lines[current_line]);
    if ((line_type!="UNDEF") && (log_pass_counter==1)) {
      alert ("Ошибка входных данных: отсутствует пароль одного из аккаунтов");
    }
    switch (line_type) {
      case "SERVICE":
        //В 0 пакете Service
      break;
      case "SERVICELINE":
        //delayTime_s: 1800
        serviceParamName = (/[^:]*/).exec(lines[current_line]);
        serviceParamVal = (/:\s?.*$/).exec(lines[current_line]);
        serviceParamVal = String(serviceParamVal).replace(/:\s?/, "");
        if (result[0].service === undefined) {
          result[0].service = new Object();
        }
        result[0].service[serviceParamName] = serviceParamVal;
      break;
      case "PROXY":
        num_packet++;
        result[num_packet] = CreateAccPacket ();
        result[num_packet].proxy = lines[current_line];
        id_social = "";
        num_acc_inline = -1;
        numpage = -1;
        num_source = -1;
        log_pass_counter = 0;
      break;
      case "VK":
        id_social = "vk";
        num_acc_inline = -1;
        numpage = -1;
        num_source = -1;
        log_pass_counter = 0;
      break;
      case "FB":
        id_social = "facebook";
        num_acc_inline = -1;
        numpage = -1;
        num_source = -1;
        log_pass_counter = 0;
      break;
      case "G_":
        id_social = "google_plus";
        num_acc_inline = -1;
        numpage = -1;
        num_source = -1;
        log_pass_counter = 0;
      break;
      case "T":
        id_social = "twitter";
        num_acc_inline = -1;
        numpage = -1;
        num_source = -1;
        log_pass_counter = 0;
      break;
      //login and pass
      case "UNDEF":
        if (log_pass_counter==0) {
          //login
          num_acc_inline++;

          if (result[num_packet][id_social] === undefined) {
            result[num_packet][id_social] = [];
          }

          result[num_packet][id_social][num_acc_inline] = CreateAcc ();
          result[num_packet][id_social][num_acc_inline].login = lines[current_line];
          
          //alert ("num_packet: " + num_packet + "\n" + "id_social: " + id_social + "\n" + "num_acc_inline: " + num_acc_inline + "\n" + result[num_packet][id_social][num_acc_inline].login);
          
          log_pass_counter++;
        } else if (log_pass_counter==1) {
          //pass
          result[num_packet][id_social][num_acc_inline].pass = lines[current_line];
          numpage = -1;
          num_source = -1;
          log_pass_counter = 0;
        }
      break;
      case "PAGE":
        numpage++;
        result[num_packet][id_social][num_acc_inline].page[numpage] = lines[current_line].replace(/page:\s?/, "");
      break;
      case "URL":
        num_source++;
        result[num_packet][id_social][num_acc_inline].material[num_source] = CreateMaterial();
        result[num_packet][id_social][num_acc_inline].material[num_source].url = lines[current_line];
        //грузить логи для определения последней проверки источника
        result[num_packet][id_social][num_acc_inline].material[num_source].last_check = 0;
      break;
      default:
        //Are you serious?!
      break;
    }
  }
  
  //alert (result[0].facebook[0].login);
  
  return (result);
}

/**
@class    Files
@brief    Определяет тип строки
@param    p_line                  Определяемая строка
*/
function VerifyServiceLine (p_line) {
  const LINE_SIGN = {
    SERVICE: "SERVICE",
    VK: /^VK$/,
    FB: /^FB$/,
    G_: /^G\+?$/,
    T: /^T$/,
    PROXY: /^[0-9.N]{1,15}:[0-9N]{1,15}$/,
    SERVICELINE: /^[A-Za-z].*:\s?[^/]*$/,
    PAGE: /page:\s?/,
    URL: /^https?:\/\/$/,
    //UNDEF
  };
  
  var result = "";
  
  for (var current_sign in LINE_SIGN) {
    if (p_line.match(LINE_SIGN[current_sign], "") !== null) {
      result = current_sign;
      break;
    }
  }
  
  if (result == "") {
    result = "UNDEF";
  }
  
  return (result);
}

function CreateAccPacket () {
  var struct_sample = {
    //ip_proxy:port_proxy
    proxy: "N:N",
    //FB
    facebook: [],
    //G+
    google_plus: [],
    //VK
    vk: []
  };
  
  return (struct_sample);
}

function CreateAcc () {
  var acc_data = {
    login: "",
    pass: "",
    page: [],
    material: []
  };
  return (acc_data);
}

function CreateMaterial () {
  var material_url = {
    url: "",
    last_check: ""
  };
  
  return (material_url);
}

/**
@class  Files
@brief  Загружает из файла данные для регистрации
@param  pFullNameFile           Полное имя файла
@return  Данные для регистрации
          -1                Ошибка при выполнении
*/
function GetData (pFullNameFile) {
  var tab_name = {
    "Name":           {name: "name",        col: 1},
    "surname":        {name: "surname",     col: 2},
    "date of birth":  {name: "birthday",    col: 3},
    "passport nr":    {name: "passport_nr", col: 4},
    "issue":          {name: "issue",       col: 5},
    "KOD":            {name: "kod",         col: 6},
    "Register from":  {name: "from",        col: 7},
    "register up to": {name: "upto",        col: 8},
    "city register":  {name: "city_reg",    col: 9},
  }
  // const isData = [
  //   "date of birth",
  //   "issue",
  //   "Register from",
  //   "register up to"
  // ];

  // var name = "";
  // var surname = "";
  // var birthday = "";
  // var passport_nr = "";
  // var issue = "";
  // var kod = "";
  // var from = "";
  // var upto = "";
  // var city_reg = "";

  var result = new Array();
  
  var div = ";";
  var num_tab = 1;

  var num_tab_min = 1;
  var num_tab_max = 14;
  var tab_max_checked = false;

  while (( (function () {
    var line = ReadLine_v2(pFullNameFile, 1, num_tab, div, "");
    return (line);
  })() !== -1) || (Math.abs(num_tab_max-num_tab_min) > 1) ) {
    num_tab++;
    if (tab_max_checked) {
      num_tab = Math.round (num_tab_min + (num_tab_max - num_tab_min)/2);
      if (ReadLine_v2(pFullNameFile, 1, num_tab, div, "")===-1) {
        num_tab_max = num_tab;
      }
      else {
        num_tab_min = num_tab;
      }
      //alert ("num_tab_min: " + num_tab_min + "\n" + "num_tab_max: " + num_tab_max + "\n" + "num_tab: " + num_tab);
    }
    else {
      if (ReadLine_v2(pFullNameFile, 1, num_tab_max, div, "")===-1) {
        num_tab = Math.round (num_tab_min + (num_tab_max - num_tab_min)/2);
        tab_max_checked = true;
      }
      else {
        num_tab_max *= 2;
      }
    }
  }
  num_tab--;

  var a_first_line = ReadLine_v2(pFullNameFile, 1, num_tab, div, "");
  var first_line_first_el = a_first_line[1];

  //alert (first_line_first_el);
  var i = 1;
  for (i = 1; i <= num_tab; i++) {
    for (cur_tubname in tab_name) {
      if (cur_tubname === a_first_line[i]) {
        tab_name[cur_tubname].col = i;
        break;
      }
    }
  }
  var lines = ["", a_first_line];
  var current_num_line = 2;

  while (true) {
    var current_line = ReadLine_v2 (pFullNameFile, current_num_line, num_tab, div, first_line_first_el);
    if (current_line === -1) {
      break;
    }
    lines[current_num_line] = current_line;
    current_num_line++;
  }
  
  /**
  @class  Files
  @brief  Загружает строку в структуру
  @param  -
  @return Структура с данными
  */
  function LoadLine (p_parseline) {
    var loc_result = new Object ();
    var current_column = 1;

    for (cur_tubname in tab_name) {
      loc_result[cur_tubname] = p_parseline[tab_name[cur_tubname].col];
      for (current_column = (tab_name[cur_tubname].col + 1); current_column < (num_tab + 1); current_column++) {
        if (!!a_first_line[current_column]) {
          break;
        }
        if (!!p_parseline[current_column]) {
          loc_result[cur_tubname] += "/" + p_parseline[current_column];
        }
      }
    }
    //searchInArray (pLine, pArray)
    return (loc_result);
  }

  for (i = 2; i < lines.length; i++) {
    result[(i-2)] = LoadLine (lines[i]);
  }

  return (result);
}

/**
@class  Files
@brief  Запись в файл номера картинки последней публикации
@param  pPicNum             Номер картинки
        pDirPath            Папка с файлом
        pFile               Файл
@return  1                  Выполнено успешно
          Коды ошибок iMacros
*/
function SetLastValue (pPicNum, pDirPath, pFile) {
  var result = 1;
  pDirPath = pDirPath.replace (/\\/g, "\\\\");
  
  iimPlayCode("FILEDELETE NAME=\"" + pDirPath + "\\\\" + pFile + "\"");

  iimSet ("VAR1", String(pPicNum));
  var loc_macros = "CODE:SET !EXTRACT_TEST_POPUP NO" + "\n";
  loc_macros += "ADD !EXTRACT {{!VAR1}}" + "\n";
  loc_macros += "SAVEAS TYPE=EXTRACT FOLDER=\"" + pDirPath + "\" FILE=" + pFile + "\n";
  result = iimPlay (loc_macros);
  return (result);
}

/**
@class  Files
@brief  Загрузка из файла последнего значения.
@param  pDirPath            Папка с файлом
        pFile               Файл, 1 столбец
@return  Строка
*/
function GetLastValue_Classic_imacros (pDirPath, pFile) {
  var result = -1;
  pDirPath = pDirPath.replace (/\\/g, "\\\\");
  var full_path = pDirPath + "\\\\" + pFile;
  var loc_first_line = ReadLine_v2(full_path, 1, 1, "");

  if (loc_first_line != -1) {
    loc_first_line = loc_first_line[1];
  }
  var current_line = loc_first_line;

  var i = 1;
  while (current_line!=-1) {
    result = current_line;
    i++;
    current_line = ReadLine_v2(full_path, i, 1, loc_first_line);
    if (current_line != -1) {
      current_line = current_line[1];
    }
  }
  
  return (result);
}

/**
@class  Files
@brief  Загрузка последнего значения из файла. Использует более быструю функцию readFile вместо ReadLine_v2.
@param  pDirPath            Папка с файлом
        pFile               Файл, 1 столбец
@return  Строка
					-1								Ошибка при выполнении
*/
function GetLastValue_v2 (pDirPath, pFile) {
  pDirPath = pDirPath.replace (/\\/g, "\\\\");
  var full_path = pDirPath + "\\\\" + pFile;
  var result = readFile (full_path);
  var lValue = "";
  var lineIndex = 0;
  var lengthArray = 0;
  var regExpNumber = new RegExp(/"([0-9]+)"/g);
  if (result != -1) {
  	lengthArray = result.length;
  	for (lineIndex = 1; !(lineIndex > lengthArray); lineIndex++) {
  		if (result[lengthArray - lineIndex] !== "") {
  			lValue = result[lengthArray - lineIndex];
  			break;
  		}
  	}
  	if (regExpNumber.test(lValue)) {
  		lValue = lValue.replace(regExpNumber, "$1");
  	}
  	
  	result = lValue;
  }
  return (result);
}

/**
@class  Files
@brief  Преобразует данные в формате объекта или массива в строку
@param  p_data          Данные
        p_div           Разделитель

@return 
*/
function dataToString (p_data, p_div) {
  var local_t = "";
  var array_size = 0;
  var last_div_regexp = new RegExp (p_div + "$", "");

  if (!p_div) {
    p_div = ";";
  }

  if (p_data instanceof Array) {
    array_size = p_data.length;
    for (i = 0; i < array_size; i++) {
      local_t += p_data[i] + p_div;
    }
  }
  else {
    for (i in p_data) {
      local_t += p_data[i] + p_div;
    }
  }

  local_t = local_t.replace (last_div_regexp, "");

  return (local_t);
}

/**
@class  Files
@brief  Читает данные из файла в определенный формат структуры
@param  pFullPath     Полный путь к читаемому файлу
        p_div           Разделитель между элементами записи. По умолчанию точка с запятой.
        p_struct_sample Пример структуры результата.
@return  {
            a_res []: {
              p_struct_sample
            }
            status: 1,
            count: a_res.length
          }

          a_res - массив объектов по примеру структуры
          status
            1         Успешно выполнено
            -1        Ошибка при выполнении
          count       Количество объектов в массиве
*/
function readData (pFullPath, p_div, p_struct_sample) {
  var result = {
    a_res: [],
    status: 1,
    count: 0
  };
  var a_line = [];
  var l_length = 0;
  var j = 0;

  if (p_div === "") {
    p_div = ";";
  }

  var a_lines = readFile (pFullPath);
  if (a_lines === -1) {
    result.status = -1;
    l_length = 0;
  }
  else {
    l_length = a_lines.length;
  }

  for (i = 0; i < l_length; i++) {
    a_line = a_lines[i].split(p_div);
    j = 0;
    result.a_res[i] = new Object();
    for (tabname in p_struct_sample) {
      result.a_res[i][tabname] = a_line[j];
      j++;
    }
  }

  if (!(Array.isArray(result.a_res))) {
    result.a_res = [];
  }
  result.count = result.a_res.length;
  return (result);
}

/**
@class  Files
@brief  Read file data
@param  filename            full path
@return object
          status
            1               Success
            -1              Error
          text              File data
*/
function imnsRead(filename){
  var result = {
    status: 0,
    text: ""
  }
  var fileDescriptor = imns.FIO.openNode(filename);

  if (!fileDescriptor.exists()) {
    result.status = -1;
  }
  else {
    result.status = 1;
    result.text = imns.FIO.readTextFile(fileDescriptor);
  }

  return result;
}

/**
@class  Files
@brief  Write data to file
@param  p_file              full path
        p_text              Text
        p_rewrite_flag
          false             Add to file
          true              Rewrite file
@return 1                   Success
        -1                  Error
*/
function imnsWrite (p_file, p_text, p_rewrite_flag = false) {
  var result = 1;

  var fileDescriptor = imns.FIO.openNode(p_file);

  if (p_rewrite_flag) {
    imns.FIO.writeTextFile(fileDescriptor, p_text);
  }
  else {
    imns.FIO.appendTextFile(fileDescriptor, p_text);
  }
  return (result);
}

/**
@class  Files
@brief  Read CSV file
@param  fileName            Fullpath
@return 2D array
*/
loadCSVFile = function (fileName) {

  this.CSVToArray = function ( strData, strDelimiter ){
    
    strDelimiter = (strDelimiter || ",");

    var objPattern = new RegExp(
      (
        "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +          
        "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +               
        "([^\"\\" + strDelimiter + "\\r\\n]*))"
      ),
      "gi"
      );

    var arrData = [[]];
    var arrMatches = null;

    while (arrMatches = objPattern.exec( strData )){           
      var strMatchedDelimiter = arrMatches[ 1 ];
      if (
        strMatchedDelimiter.length &&
        strMatchedDelimiter !== strDelimiter
        ){
        arrData.push( [] );
      }
      var strMatchedValue;
      if (arrMatches[ 2 ]){
        strMatchedValue = arrMatches[ 2 ].replace(
          new RegExp( "\"\"", "g" ),
          "\""
          );
      } else {
        strMatchedValue = arrMatches[ 3 ];
      }
      arrData[ arrData.length - 1 ].push( strMatchedValue );
    }

    return( arrData );
  }

  var fileDescriptor = imns.FIO.openNode(fileName);
  return this.CSVToArray(
    imns.FIO.readTextFile(fileDescriptor)
  );
}

/**
@class  Files
@brief  Save to CSV file
@param  fileName            Fullpath
        tableArray          2D array
        separator           Separator in CSV
@return 
*/
var saveToCSVFile = function (fileName, tableArray, separator) {

  this.arrayToCSV = function(tableArray, replacer) {
    replacer = replacer || function(r, c, v) { return v; };
    separator = separator || ",";
    var csv = '', c, cc, r, rr = tableArray.length, cell;
    for (r = 0; r < rr; ++r) {
      if (r) { csv += '\r\n'; }
      for (c = 0, cc = tableArray[r].length; c < cc; ++c) {
        if (c) { csv += separator; }
        cell = replacer(r, c, tableArray[r][c]);
        if (/[,\r\n"]/.test(cell)) { cell = '"' + cell.replace(/"/g, '""') + '"'; }
        cell = typeof(cell) == "string" && cell.length > 0 ? "\"" + cell + "\"" : cell;
        csv += (cell || 0 === cell) ? cell : '';
        
      }
    }
    return csv;
  }

  var fileDescriptor = imns.FIO.openNode(fileName);
  imns.FIO.writeTextFile(fileDescriptor, this.arrayToCSV(tableArray));

};

//----------------//Завершение - работа с файлами//------------------

//-------------------------//Логирование//---------------------------

/**
@class  Logs
@brief  Модуль журнала. Через объект .see можно следить за значениями переменных.
@param  p_dir               Папка
        p_file              Файл для логов
        p_timestamp_flag
          true              Устанавливает в  метки времени
          false             Не устанавливает метки времени
        p_clear_every_time  Очищать файл перед записью каждый раз
          true
          false
@return модуль
*/
Journal_Module = function (p_dir, p_file, p_timestamp_flag, p_clear_every_time) {
  this.dir = p_dir;
  this.file = p_file;
  this.time_flag = p_timestamp_flag;
  this.clear = p_clear_every_time;
  //Наблюдаемые значения
  this.see = {};
}

/**
@class  Logs
@brief  Записывает текст, как правило, однострочный. %variable% - заменяется на this.see.variable
@param  p_text              Записываемый текст
@return 1                   Успешно выполнено
        -1                  Ошибка при выполнении
*/
Journal_Module.prototype.write = function (p_text) {
  var result = 1;
  var journal = this;
  // p_text = p_text.replace (/%.*%/g, )
  if (typeof p_text === "string") {
    p_text = p_text.replace (/%[^%]*/g, function (x) {
        x = x.replace (/%/g, "");
        if (journal.see.hasOwnProperty (x)) {
        return journal.see[x];
      }
      return x;
    });
  }

  if (!!this.clear) {
    iimPlayCode("FILEDELETE NAME=\"" + this.dir + "\\\\" + this.file + "\"");
  }
  if (!!this.time_flag) {
    p_text = timeStamp() + p_text;
  }
  addRecToFile (this.dir, this.file, p_text + "\n");
  return (result);
}

/**
@class  Logs
@brief  Проверяет, создана ли переменная с журналом. Если создана, делает запись
@param  p_text              Записываемый текст
@return 1                   Успешно выполнено
        -1                  Ошибка при выполнении
*/
function toJournal (p_text) {
  var result = 1;
  if (typeof(g_Journal) !== "undefined") {
    g_Journal.write(p_text);
  }
  return (result);
}

/**
@class  Logs
@brief  Возвращает метку времени
@param  -
@return Строка, содержащая время в формате ДД.ММ.ГГГГ ЧЧ:ММ:CC
*/
function timeStamp () {
  var result = 1;
  var sdate = GetCurrentDate_v2 ();

  for (t in sdate) {
    sdate[t] = String(sdate[t]);
    if (sdate[t].length < 2) {
      sdate[t] = "0" + sdate[t];
    }
  }

  result = sdate.day + "." +  sdate.month + "." + sdate.year + " " + sdate.hours + ":" + sdate.minutes + ":" + sdate.seconds + " : ";

  return (result);
}

/**
@class  Logs
@brief  Пишет в лог функцию и значения аргументов

var logInterceptor = new Interceptor(printCallInfo,  printCallResult);

sum = logInterceptor.interceptInvokes(sum);
sub = logInterceptor.interceptInvokes(sub);
div = logInterceptor.interceptInvokes(div);
mult = logInterceptor.interceptInvokes(mult);
@param  callback
        args
@return -
*/
function printCallInfo(callback, args) {
  var logStr = "Invoking function '" + callback.name + "' with args: \n" + args.join(', ');
  var current_page = "";
  iimPlay = iimPlay_orig;
  iimPlayCode = iimPlayCode_orig;

  current_page = GetCurrentURL();
  if (current_page.search(/about:logopage/) == -1) {
    savePage (getiMacrosFolder("Downloads"), true);
  }
  toJournal (logStr);
}

/**
@class  Logs
@brief  Пишет в лог результат выполнения функции
@param  callback
        args
        result
@return -
*/
function printCallResult(callback, args, result) {
  const SCRIPT_OK = "OK";
  var logStr = "Function '" + callback.name
    + "' is successfully invoke\nresult: " + result + "\n";

  var loc_extract = iimGetExtract();

  // if (iimGetLastError() === SCRIPT_OK) {
  //   toJournal (logStr);
  // }

  if (loc_extract != "") {
    iimSet ("VAR1", loc_extract);
    iimPlayCode("SET !EXTRACT {{!VAR1}}");
  }
  iimPlay = iimPlay_debug;
  iimPlayCode = iimPlayCode_debug;
}

function emptyFunction() {};

function Interceptor(preInvoke, postInvoke) {
  /*
   * Если preInvoke не функция, то заменяем этот аргумент
   * на пустую функцию. Вдруг нам не нужно будет ничего делать
   * до перехватываемого вызова.
   */
  var preInvoke = typeof preInvoke === 'function' ?
    preInvoke : emptyFunction,
 
    // Аналогично с postInvoke
    postInvoke = typeof postInvoke === 'function' ?
    postInvoke : emptyFunction;
 
  this.preInvoke = preInvoke;
  this.postInvoke = postInvoke;
}

Interceptor.prototype = {
  constructor: Interceptor,
  interceptInvokes: function (callback) {
    /*
     * Запоминаем текущий контекст, так как в
     * в следующей анонимной функции, но уже другой
     */
    var self = this;
    return function () { // преобразованная функция
      // конвертируем arguments в массив
      var args = Array.prototype.slice.call(arguments, 0),
        /*
         * Массив с аргументами для preInvoke и postInvoke.
         * Добавим в него в качестве первого элемента функцию,
         * вызов которой перехватывается. Вдруг нам понадобится дополнительная информация о ней.
         */
        result;        
 
      // Делаем что-то до перехватываемого вызова
      self.preInvoke.call(self, callback, args); 
      result = callback.apply(self, args);
      // Делаем что-то после
      self.postInvoke.call(self, callback, args, result);
 
      return result;
    };
  }
}

//------------------//Завершение - логирование//---------------------

//-----------------------//HTML файл-отчет//-------------------------
/*
Пример составляемого файла
<html>
  <body>
    <p>Привет, Москва!111</p>
    <p><a href="https://yandex.ru/yandsearch?clid=1923018&text=%D0%BF%D1%80%D0%BE%D1%81%D1%82%D0%BE%D0%B9%20html%20%D1%84%D0%B0%D0%B9%D0%BB&lr=37&redircnt=1473217942.1">Яша, просто яша. Хотя нет, с запросом</a></p>
  </body>
</html>
*/

/**
@class CAP
@brief Функция начинает создание HTML файла.
@param      path_file   Полный путь файла
            filename    Имя файла
@return     -
*/
function BeginHTML(path_file, filename) {
  var to_file_script = "CODE:SET !EXTRACT_TEST_POPUP NO"+"\n";
  var loc_text = "<html>" + "\n";
  loc_text += "<head>" + "\n";
  loc_text += "<meta charset=\"utf-8\"" + ">" + "\n";
  loc_text += "</head>" + "\n";
  loc_text += "<body>";
  iimSet ("VAR1", loc_text);
  to_file_script += "ADD !EXTRACT {{VAR1}}" + "\n";
  to_file_script += "SAVEAS TYPE=EXTRACT FOLDER=" + path_file + " FILE=" + filename + "\n";
  iimPlay(to_file_script);
}

/**
@class CAP
@brief Добавляет ссылки в файл.
@param      path_file   Полный путь файла
            filename    Имя файла
            a_url       Добавляемая ссылка
            a_text      Текст ссылки
@return     -
*/
function AddHTML(path_file, filename, a_url, a_text) {
  var to_file_script = "CODE:SET !EXTRACT_TEST_POPUP NO"+"\n";
  var loc_text = "<p><a href=\"" + a_url + "\"" + " target=\"_blank\"" + ">" + a_text + "</a></p>";
  iimSet ("VAR1", loc_text);
  to_file_script += "ADD !EXTRACT {{VAR1}}" + "\n";
  to_file_script += "SAVEAS TYPE=EXTRACT FOLDER=" + path_file + " FILE=" + filename + "\n";
  iimPlay(to_file_script);
}

/**
@class CAP
@brief Добавляет разделы в файл.
@param      path_file   Полный путь файла
            filename    Имя файла
            title       Название раздела
@return     -
*/
function AddHTML_cat(path_file, filename, title) {
  var to_file_script = "CODE:SET !EXTRACT_TEST_POPUP NO"+"\n";
  var loc_text = "<p>" + title + ":</p>";
  iimSet ("VAR1", loc_text);
  to_file_script += "ADD !EXTRACT {{VAR1}}" + "\n";
  to_file_script += "SAVEAS TYPE=EXTRACT FOLDER=" + path_file + " FILE=" + filename + "\n";
  iimPlay(to_file_script);
}

/**
@class CAP
@brief Устанавливает завершающие теги в HTML файл
@param      path_file   Полный путь файла
            filename    Имя файла
@return
*/
function EndHTML(path_file, filename) {
  var to_file_script = "CODE:SET !EXTRACT_TEST_POPUP NO"+"\n";
  to_file_script += "ADD !EXTRACT \"" + "</body>" + "</html>" + "\"" + "\n";
  to_file_script += "SAVEAS TYPE=EXTRACT FOLDER=" + path_file + " FILE=" + filename + "\n";
  iimPlay(to_file_script);
}

/**
@class CAP
@brief Генерирует временную метку средствами iMacros
@param -
@return         Временная метка.
*/
function GetDateImacros () {
  var result = 0;
  var macros = "CODE:SET !EXTRACT_TEST_POPUP NO"+"\n";
  macros += "ADD !EXTRACT {{!NOW:ddmmyyyy}}" + "\n";
  iimPlay (macros);
  result = iimGetExtract ();
  return (result);
}

//----------------//Завершение - HTML файл-отчет//-------------------

//--------------------------//Соц. сети//----------------------------

//Сохранение текущих логинов
var g_current_login = {
  facebook: "",
  google_plus: "",
  vk: "",
  twitter: ""
  //for test
  //facebook: "forex@dginozator.com",
  //google_plus: "levelup080816@gmail.com",
  //vk: "levelup@dginozator.com"
}

/**
@class  Social
@brief  Входит в аккаунт.
@param  site                    Социальная сеть.
          "facebook"
          "google_plus"
          "vk"
          "twitter"
        p_login                 Логин
        p_pass                  Пароль
        p_force                   Определяет, выходить ли из аккаунта,
                                  если авторизация уже была.
          0                     Если авторизован, не выходить
          1                     Перезавторизоваться, только если другой 
                                  аккаунт
          2                     Перезавторизоваться, даже если это тот же 
                                  аккаунт.
@return   1                     Успешно выполнено
          -1                    Ошибка при выполнении
*/
function Login (site, p_login, p_pass, p_force) {
  var loc_downloads_path =  getiMacrosFolder("Downloads")+"\\"+PROJECT_FOLDER;
  
  const c_Force = {
    NO_FORCE: 0,
    ANOTHER_LOGIN: 1,
    SAME_LOGIN: 2
  }
  
  var result = 1;
  var login_flag = false;
  var loc_sign = "";
    
  switch (site) {
    case "facebook":
      iimPlayCode ("URL GOTO=https://www.facebook.com/");
      loc_sign = "FB_REG";
    break;
    case "google_plus":
      iimPlayCode ("URL GOTO=https://plus.google.com");
      loc_sign = "G_REG";
    break;
    case "vk":
      iimPlayCode ("URL GOTO=https://vk.com");
      loc_sign = "VK_REG";
    break;
    case "twitter":
      iimPlayCode ("URL GOTO=https://twitter.com/");
      loc_sign = "T_REG";
    break;
    default:
      //wat
      return (-1);
    break;
  }

  if (g_current_login[site] == p_login) {
    if (p_force == c_Force["SAME_LOGIN"]) {
      Logout (site);
      login_flag = true;
    }
  }
  else {
    if (p_force > c_Force["NO_FORCE"]) {
      Logout (site);
      login_flag = true;
    }
  }
  
  var l_macros = "CODE:SET !EXTRACT_TEST_POPUP NO" + "\n";
  if (login_flag) {
    switch (site) {
      case "facebook":
          l_macros += "URL GOTO=https://www.facebook.com/" + "\n";
          l_macros += "TAG XPATH=\"\//input[@id=\'email\']\" CONTENT=" + p_login + "\n";
          l_macros += "TAG XPATH=\"\//input[@id=\'pass\']\" CONTENT=" + p_pass + "\n";
          iimPlay (l_macros);
          iimPlayCode ("SET !TIMEOUT_STEP 1\nTAG XPATH=\"\//button[contains(@id,\'loginbutton\')]\"");
          iimPlayCode ("SET !TIMEOUT_STEP 1\nTAG XPATH=\"\//input[@type='submit']\"");
      break;
      case "google_plus":
        iimPlayCode ("URL GOTO=https://plus.google.com\nTAG XPATH=\"\//a[@target=\'_top\']\"");
        if (XPATH_Here ("XPATH = \"\//input[@id=\'Passwd\']\"")) {
          l_macros += "TAG XPATH=\"\//a[@id=\'account-chooser-link\']\"" + "\n";
          l_macros += "TAG XPATH=\"\//a[@id=\'account-chooser-add-account\']\"" + "\n";
        };
        l_macros += "TAG POS=1 TYPE=INPUT:EMAIL FORM=ID:gaia_loginform ATTR=ID:Email CONTENT=" + p_login + "\n";
        l_macros += "TAG POS=1 TYPE=INPUT:SUBMIT FORM=ID:gaia_loginform ATTR=ID:next" + "\n";
        l_macros += "SET !ENCRYPTION NO" + "\n";
        l_macros += "TAG POS=1 TYPE=INPUT:PASSWORD FORM=ID:gaia_loginform ATTR=ID:Passwd CONTENT=" + p_pass + "\n";
        l_macros += "TAG POS=1 TYPE=INPUT:SUBMIT FORM=ID:gaia_loginform ATTR=ID:signIn" + "\n";
        iimPlay (l_macros);
      break;
      case "vk":
        l_macros += "TAG XPATH=\"\//input[@id=\'index_email\']\" CONTENT=" + p_login + "\n";
        l_macros += "TAG XPATH=\"\//input[@id=\'index_pass\']\" CONTENT=" + p_pass + "\n";
        l_macros += "TAG XPATH=\"\//button[@id='index_login_button']\"" + "\n";
        iimPlay (l_macros);
        Delay(3);
        while (IdentifyPages_v2("VK_CAPTCHA")=="VK_CAPTCHA") {
        
          var cap_img = "cap.png";
          var path_captcha = loc_downloads_path + "\\" + cap_img;
          
          loc_downloads_path = loc_downloads_path.replace (/\\/g, "\\\\");
          
          //alert("ONDOWNLOAD FOLDER=\"" + loc_downloads_path + "\" FILE=" + cap_img + " WAIT=YES\n" + "TAG POS=1 TYPE=IMG ATTR=SRC:https://vk.com/captcha.php?sid=* CONTENT=EVENT:SAVE_ELEMENT_SCREENSHOT");
          iimPlayCode("ONDOWNLOAD FOLDER=\"" + loc_downloads_path + "\" FILE=" + cap_img + " WAIT=YES\n" + "TAG POS=1 TYPE=IMG ATTR=SRC:https://vk.com/captcha.php?sid=* CONTENT=EVENT:SAVE_ELEMENT_SCREENSHOT");
          
          var cap_data = ReadCaptcha_v2(service_data.rucaptcha_api, path_captcha);
          
          iimPlayCode ("TAG POS=1 TYPE=INPUT:TEXT ATTR=* CONTENT=" + cap_data);
          iimPlayCode ("TAG XPATH=\"\//button[@class=\'flat_button\']\"");
        }
      break;
      case "twitter":
        l_macros += "TAG XPATH=\"//a[contains(@class,'Button StreamsLogin js-login')]\"" + "\n";
        // //div[contains(@class,'LoginDialog-body modal-body')]
        // l_macros += "TAG XPATH = \"//input[@name='session[username_or_email]']\" CONTENT=" + p_login + "\n";
        l_macros += "TAG XPATH = \"//div[contains(@class,'LoginDialog-body modal-body')]/input[@name='session[username_or_email]']\" CONTENT=" + p_login + "\n";
        l_macros += "SET !ENCRYPTION NO" + "\n";
        // l_macros += "TAG XPATH = \"//input[@name='session[password]']\" CONTENT=" + p_pass + "\n";
        l_macros += "TAG XPATH = \"//div[contains(@class,'LoginDialog-body modal-body')]/input[@name='session[password]']\" CONTENT=" + p_pass + "\n";
        l_macros += "TAG XPATH=\"//div[contains(@class,'LoginDialog-body modal-body')]/input[@type='submit']\"" + "\n";
        iimPlay (l_macros);
      break;
      default:
        //really strange
        return (-1);
      break;
    }
    g_current_login[site] = p_login;
  }
  return (result);
}

/**
@class  Social
@brief  Выходит из аккаунта
@param  site                    Социальная сеть.
          "facebook"
          "google_plus"
          "vk"
          "twitter"
@return 1                       Выполнено успешно
        -1                      Ошибка при выполнении
*/
function Logout (site) {
  var result = 1;
  
  var loc_macro = "CODE:SET !EXTRACT_TEST_POPUP NO" + "\n";
  
  switch (site) {
    case "facebook":
      loc_macro += "URL GOTO=https://www.facebook.com" + "\n";
      loc_macro += "TAG POS=1 TYPE=DIV ATTR=ID:userNavigationLabel" + "\n";
      loc_macro += "TAG POS=2 TYPE=SPAN ATTR=TXT:Выйти" + "\n";
    break;
    case "google_plus":
      loc_macro += "URL GOTO=https://accounts.google.com/Logout" + "\n";
    break;
    case "vk":
      loc_macro += "URL GOTO=https://vk.com" + "\n";
      loc_macro += "TAG XPATH=\"\//*[@id=\'top_profile_link\']\"" + "\n";
      loc_macro += "TAG XPATH=\"\//*[@id=\'top_logout_link\']\"" + "\n";
      loc_macro += "URL GOTO=https://vk.com" + "\n";
    break;
    case "twitter":
      loc_macro += "URL GOTO=https://twitter.com/logout" + "\n";
      loc_macro += "TAG XPATH = \"//button[contains(@class,'btn primary-btn js-submit')]\"" + "\n";
    break;
    default:
      //WAT?
    break;
  }
  iimPlay (loc_macro);
  
  return (result);
}

/**
@class  Social
@brief  Считывает время публикации поста
@param  page                    Страница
        news_num                Порядковый номер поста
@return 23 Oct 2016 18:01       Время публикации, если было опубликовано 
                                  сегодня
        0                       Пост опубликован не сегодня
        -1                      Не является постом
*/
function GetNewsDate_today (page, news_num) {
  const replace_month = {
    Jan: "января",
    Feb: "февраля",
    Mar: "марта",
    Apr: "апреля",
    May: "мая",
    Jun: "июня",
    Jul: "июля",
    Aug: "августа",
    Sep: "сентября",
    Oct: "октября",
    Nov: "ноября",
    Dec: "декабря"
  }
  
  var result = 0;
  
  //23 октября 2016 г. в 18:01
  var ret_code = iimPlayCode ("TAG XPATH = \"/html/body/descendant::div[@aria-label=\'Новость\'][" + news_num + "]/descendant::abbr[1]\" EXTRACT=TITLE");
  if (ret_code != 1) {
    return (-1);
  }
  
  //16 ч
  //iimPlayCode ("TAG XPATH = \"/html/body/descendant::div[@aria-label=\'Новость\'][" + news_num + "]/descendant::abbr[1]/span[1]\" EXTRACT=TXT");
  
  var date_extr = iimGetExtract();
  
  if (date_extr == "#EANF#") {
    return (-1);
  }
  
  for (current_month in replace_month) {
    date_extr = date_extr.replace(replace_month[current_month], current_month);
  }
  date_extr = date_extr.replace("г. в ", "");
  
  var post_date = new Date(date_extr);
  var today = new Date();
  
  if (post_date.getDate () != today.getDate ()) {
    result = 0;
  }
  else {
    var delta_hours = (today - post_date)/3600000;
    if (delta_hours < 24) {
    
      result = date_extr;
    }
    else {
      result = 0;
    }
  }
  
  return (result);
}

/**
@class  Social
@brief  Сравнивает две даты
@param  a, b                  Значения времени
@return result                Разница (a-b)
*/
function DeltaTime (a, b) {
  var result = 0;
  
  var a_time = new Date(a);
  var b_time = new Date(b);
  
  result = a_time - b_time;
  
  return (result);
}

/**
@class  Social
@brief  Считывает данные поста, сохраняет изображения
@param  page                      Страница
        news_num                  Порядковый номер поста
        img_folder                Папка для сохранения изображений
@return result                    
          text                    Текст
          count_pics              Количество картинок    
*/
function GetNews (page, news_num, img_folder)
{
  //В этом случае необходимо нажимать на  и вычитывать пост на отдельной странице
  var big_post_sign = "Читать дальше";
  var result = {
    text: "",
    count_pics: 0
  };
  var ret_code = 1;
  var current_p = 0;
  var p_text = "";
  
  var new_page = false;
  
  var url_img = "";
  
  var max_picts = 40;
  
  img_folder = img_folder.replace (/\\/g, "\\\\");
  
  //Сохранение текста
  ret_code = iimPlayCode ("SET !TIMEOUT_STEP 1\nTAG XPATH = \"/html/body/descendant::div[@aria-label=\'Новость\'][" + news_num + "]/descendant::a[contains(.,'Читать дальше')]\"");
  var local_news_num = news_num;
  if (ret_code == 1) {
    local_news_num = 1;
    new_page = true;
  }
  while (1) {
    current_p++;
    ret_code = iimPlayCode ("SET !TIMEOUT_STEP 1\nTAG XPATH = \"/html/body/descendant::div[@aria-label=\'Новость\'][" + local_news_num + "]/descendant::p[" + current_p + "]\" EXTRACT=TXT");
    p_text = iimGetExtract();
    if (p_text == "#EANF#") {
      break;
    }
    result.text += p_text + "\n";
  }
  
  if (new_page == true) {
    iimPlayCode ("TAB CLOSE");
  }
  
  //Сохранение изображений
  //Ссылка на дате публикации
  
  ret_code = iimPlayCode ("TAG XPATH = \"/html/body/descendant::div[@aria-label=\'Новость\'][" + news_num + "]/descendant::abbr[1]/parent::*\" EXTRACT=HREF");
  
  const POST_TYPE = ["ONE_PIC", "MANY_PICS", "VIDEOS", "SHARE", "OTHER_SITE_VIDEO"];
  
  var date_url = iimGetExtract ();
  var post_num = 0;
  var regexp_postnum = /[0-9]+\/[^\/]+$/g;
  var m_post_url = "";
  var post_type = 0;
  //https://www.facebook.com/Unit.Production/photos/a.569860189731642.1073741825.175143102536688/1262921313758856/?type=3
  //https://www.facebook.com/Unit.Production/posts/1264167086967612
  
  iimPlayCode ("TAG XPATH = \"/html/body/descendant::div[@aria-label=\'Новость\'][" + news_num + "]/descendant::h5[1]\" EXTRACT=TXT");
  
  var h5_text = iimGetExtract ();
  
  if (h5_text.indexOf('поделил')!=-1) {
    post_type = "SHARE";
  }
  else if (date_url.indexOf('photos')!=-1) {
    post_num = regexp_postnum.exec(date_url);
    post_num = String(post_num).replace (/\/.+$/, "");
    
    m_post_url = date_url.replace (/photos.+$/, "");
    m_post_url += "posts/" + post_num;
    
    post_type = "ONE_PIC";
  }
  else if (date_url.indexOf('videos')!=-1) {
    m_post_url = "";
    post_type = "VIDEOS";
  }
  else {
    m_post_url = date_url;
    post_type = "MANY_PICS";
  }
  
  if (post_type == "VIDEOS") {
    return (result);
  }
  
  if (post_type == "SHARE") {
    return (result);
  }
  
  m_post_url = m_post_url.replace ("www.", "m.");
  
  //Добываем картинки
  var current_pic = 1;
  result.count_pics = current_pic;
  
  ret_code = iimPlayCode ("SET !TIMEOUT_STEP 1\nONDOWNLOAD FOLDER=\"" + img_folder + "\" FILE=" + current_pic + ".png" + "\nTAG XPATH = \"/html/body/descendant::div[@aria-label=\'Новость\'][" + news_num + "]/descendant::img[contains (@class, 'scaledImageFit')][1]\" CONTENT=EVENT:SAVEITEM");
  
  if (post_type == "SHARE") {
    return (result);
  }
  
  ret_code = iimPlayCode ("TAB OPEN\nTAB T=2\nURL GOTO=" + m_post_url);
  
  if (post_type == "MANY_PICS") {
    iimPlayCode ("TAG XPATH=\"\//a[contains(@style, \'width\')][1]\"");
    ret_code = 1;
    
    ret_code = iimPlayCode ("SET !TIMEOUT_STEP 1\nTAG POS=1 TYPE=A ATTR=TXT:Далее");
    if (ret_code != 1) {
      post_type == "OTHER_SITE_VIDEO";
      
      iimPlayCode ("TAG XPATH=\"\//div[contains(@id, \'permalink_view\')]/descendant::table[1]/ancestor::a[1]\" EXTRACT=HREF");
      var loc_href = iimGetExtract();
      
      iimPlayCode ("TAB OPEN\nTAB T=2\nURL GOTO=" + loc_href + "\nWAIT SECONDS=2");
      loc_href = GetCurrentURL();
      iimPlayCode ("TAB CLOSE");
      
      result.text += "\n" + loc_href;
      iimPlayCode ("TAB CLOSE");
      return (result);
    }
    
    iimPlayCode ("SET !TIMEOUT_STEP 1\nTAG POS=1 TYPE=A ATTR=TXT:Назад");
    var first_pic_url = GetCurrentURL();
    first_pic_url = first_pic_url.replace (/set=[^$]+$/g, "");
    current_pic_url = "";
    
    iimPlayCode ("TAG XPATH=\"\//abbr[1]/ancestor::span[1]/parent::*/parent::*\" EXTRACT=TXT");
    //iimPlayCode ("TAG XPATH=\"\//abbr[1]\" EXTRACT=HTM");
    
    var first_under_pic_text = iimGetExtract();
    var current_under_pic_text = "";
    //iimPlayCode ("SET !TIMEOUT_STEP 1\nTAG POS=1 TYPE=A ATTR=TXT:Далее");
    iimPlayCode ("URL GOTO=" + m_post_url);
    ret_code = iimPlayCode ("TAG XPATH=\"\//a[contains(@style, \'width\')][4]\"");
    if (ret_code != 1) {
      iimPlayCode ("TAG XPATH=\"\//a[contains(@style, \'width\')][2]\"");
    }
    while (1) {
      iimPlayCode ("SET !TIMEOUT_STEP 1\nTAG POS=1 TYPE=A ATTR=TXT:Далее");
      current_pic_url = GetCurrentURL();
      current_pic_url = current_pic_url.replace (/set=[^$]+$/g, "");
      if ((current_pic_url == first_pic_url) || (current_pic > max_picts)) {
        //alert (first_pic_url + "\n" + current_pic_url);
        break;
      }
    }
    iimPlayCode ("SET !TIMEOUT_STEP 1\nTAG POS=1 TYPE=A ATTR=TXT:Далее");
    do {
      //iimPlayCode ("TAG XPATH=\"\//abbr[1]/ancestor::span[1]/parent::*/parent::*\" EXTRACT=TXT");
      //current_under_pic_text = iimGetExtract();
      //alert (current_under_pic_text);
      //if (current_under_pic_text != first_under_pic_text) {
      //  alert ("break");
      //  break;
      //}
      
      current_pic++;
      ret_code = iimPlayCode ("ONDOWNLOAD FOLDER=\"" + img_folder + "\" FILE=" + current_pic + "\nTAG XPATH=\"\//img[@width=\'320\']\" CONTENT=EVENT:SAVE_ELEMENT_SCREENSHOT");
      //Delay (1);
      iimPlayCode ("TAG POS=1 TYPE=A ATTR=TXT:Далее");
      
      current_pic_url = GetCurrentURL();
      current_pic_url = current_pic_url.replace (/set=[^$]+$/g, "");
      if ((current_pic_url == first_pic_url) || (current_pic > max_picts)) {
        break;
      }
    } while (ret_code == 1);
  }
  else {
    //do nothing
  }
  
  iimPlayCode ("TAB CLOSE");
  
  result.count_pics = current_pic;
  
  return (result);
}

/**
@class  Social
@brief  Осуществляет постинг
@param  p_site                  Социальная сеть.
          "facebook"
          "google_plus"
          "vk"
        p_post                  Пост в формате GetNews
          text                    Текст
          count_pics              Количество картинок
        img_folder              Папка с изображениями
@return 1                       Успешно выполнено
        -1                      Ошибка при выполнении
*/
function PostIt (p_site, p_post, img_folder) {
  var result = 1;
  var pics = p_post.count_pics;
  var l_pics_group = 0;
  var max_pics_group = 3;
  
  img_folder = img_folder.replace (/\\/g, "\\\\");
  //вводим текст и выбираем картинки для загрузки, жмем опубликовать
  iimSet ( "VAR1", p_post.text);
  var loc_macros = "CODE:SET !EXTRACT_TEST_POPUP NO" + "\n";
  switch (p_site) {
    case "facebook":
      loc_macros += "URL GOTO=https://m.facebook.com/" + "\n";
      loc_macros += "TAG POS=1 TYPE=TEXTAREA FORM=ACTION:/composer/mbasic/?av=* ATTR=ID:* CONTENT={{!VAR1}}" + "\n";
      
      if (pics > 0) {
        loc_macros += "TAG XPATH=\"\//input[contains(@name,\'photo\')]\"" + "\n";
      }
      
      while (pics > 0) {
        l_pics_group++;
        
        loc_macros += "TAG XPATH=\"\//input[@name=\'file" + l_pics_group + "\']\" CONTENT=\"" + img_folder + "\\\\" + (p_post.count_pics - pics + 1) + ".png\"" + "\n";
        pics--;
        if (l_pics_group > (max_pics_group-1)) {
          l_pics_group = 0;
          loc_macros += "TAG XPATH=\"\//input[@type=\'submit\']\"" + "\n";
          if (pics > 0) {
            loc_macros += "TAG XPATH=\"\//input[contains(@class,\'cc\')]\"" + "\n";
          }
        }
      }
      iimPlay (loc_macros);
      
      iimPlayCode ("SET !ERRORIGNORE YES\nSET !TIMEOUT_STEP 1\nTAG XPATH=\"\//input[@type=\'submit\']\"");
      iimPlayCode ("SET !ERRORIGNORE YES\nSET !TIMEOUT_STEP 1\nTAG XPATH=\"\//input[contains(@name,\'post\')]\"");
      iimPlayCode ("WAIT SECONDS = 2");
      iimPlayCode ("SET !TIMEOUT_STEP 3\nTAG XPATH=\"\//input[@name=/'done/']\"");
      
    break;
    case "google_plus":
      loc_macros += "URL GOTO=https://plus.google.com" + "\n";
      loc_macros += "TAG XPATH=\"//div[@class=\'OnYLS\']\"" + "\n";
      loc_macros += "WAIT SECONDS = 3" + "\n";
      loc_macros += "TAG XPATH=\"//textarea[@role=\'textbox\']\" CONTENT={{!VAR1}}" + "\n";
      loc_macros += "EVENT TYPE=KEYPRESS XPATH=\"//textarea[@role=\'textbox\']\" CHAR = \"R\"" + "\n";
      loc_macros += "EVENT TYPE=KEYPRESS XPATH=\"//textarea[@role=\'textbox\']\" KEY = 8" + "\n"; //bckspace
      loc_macros += "WAIT SECONDS = 2" + "\n";
      
      if (pics > 0) {
        loc_macros += "TAG XPATH=\"//div[contains(@aria-label, \'фото\')]\"" + "\n";
        loc_macros += "WAIT SECONDS = 2" + "\n";
        loc_macros += "TAG XPATH=\"\//input[@accept=\'image/*\']\" CONTENT=\"" + img_folder + "\\\\" + pics + ".png\"" + "\n";
        loc_macros += "WAIT SECONDS = 10" + "\n";
      }
      pics--;
      
      while (pics > 0) {
        loc_macros += "TAG XPATH=\"//div[contains(@aria-label, \'ещё фото\')]\"" + "\n";
        loc_macros += "WAIT SECONDS = 2" + "\n";
        loc_macros += "TAG XPATH=\"\//input[@accept=\'image/*\']\" CONTENT=\"" + img_folder + "\\\\" + pics + ".png\"" + "\n";
        loc_macros += "WAIT SECONDS = 10" + "\n";
        
        pics--;
      }
      
      loc_macros += "TAG XPATH=\"\//span[contains(.,\'Опубликовать\')]\"" + "\n";
      loc_macros += "WAIT SECONDS = 5" + "\n";
      iimPlay (loc_macros);
    break;
    case "vk":
      loc_macros += "URL GOTO=https://m.vk.com" + "\n";
      loc_macros += "TAG XPATH=\"\//div[@class=\'ip_user_link\']/a[1]\"" + "\n";
      loc_macros += "WAIT SECONDS = 2" + "\n";
      
      loc_macros += "TAG POS=1 TYPE=TEXTAREA FORM=ACTION:/wall* ATTR=NAME:message CONTENT={{!VAR1}}" + "\n";
      
      while (pics > 0) {
        loc_macros += "WAIT SECONDS = 3" + "\n";
        
        loc_macros += "TAG POS=3 TYPE=INPUT:FILE FORM=ACTION:/wall* ATTR=* CONTENT=\"" + img_folder + "\\\\" + (p_post.count_pics - pics + 1) + ".png\"" + "\n";
        pics--;
      }
      loc_macros += "WAIT SECONDS = 4" + "\n";
      loc_macros += "TAG XPATH=\"\//input[@type=\'submit\']\"" + "\n";
      loc_macros += "WAIT SECONDS = 3" + "\n";
      iimPlay (loc_macros);
    break;
    default:
      //wat
      return (-1);
    break;
  }
  
  return (result);
}

/**
@class  Social
@brief  Осуществляет постинг картинок
@param  pSite                   Социальная сеть.
          "facebook"
          //"google_plus"
          "vk"
          "twitter"
        pPage                   Страница для публикации
        pImgFolder              Папка с изображениями
        pImgNum                 Номер публикуемого изображения
@return 1                       Успешно выполнено
        -1                      Ошибка при выполнении
*/
function postImg (pSite, pPage, pImgFolder, pImgNum) {
  var result = 1;
  var pics = 1;
  var l_pics_group = 1;
  var max_pics_group = 3;
  var picExtansion = ".jpg";
  var locPage = pPage.replace (/(https?):\/\/(www.)?/, "$1://m.");
  
  //for test
  //alert ("for test 1450: " + pSite);

  pImgFolder = pImgFolder.replace (/\\/g, "\\\\");
  //выбираем картинки для загрузки, жмем опубликовать
  var loc_macros = "CODE:SET !EXTRACT_TEST_POPUP NO" + "\n";
  switch (pSite) {
    case "facebook":
      if (pPage === "") {
        loc_macros += "URL GOTO=https://m.facebook.com/" + "\n";
      }
      else {
        loc_macros += "URL GOTO=" + locPage + "\n";
      }
      loc_macros += "TAG XPATH=\"\//input[contains(@name,\'photo\')]\"" + "\n";
      loc_macros += "TAG XPATH=\"\//input[@name=\'file" + l_pics_group + "\']\" CONTENT=\"" + pImgFolder + "\\\\" + pImgNum + picExtansion + "\"" + "\n";
      loc_macros += "TAG XPATH=\"\//input[@type=\'submit\']\"" + "\n";
      iimPlay (loc_macros);
      iimPlayCode ("SET !ERRORIGNORE YES\nSET !TIMEOUT_STEP 1\nTAG XPATH=\"\//input[@type=\'submit\']\"");
      iimPlayCode ("SET !ERRORIGNORE YES\nSET !TIMEOUT_STEP 1\nTAG XPATH=\"\//input[contains(@name,\'post\')]\"");
      iimPlayCode ("WAIT SECONDS = 2");
      iimPlayCode ("SET !TIMEOUT_STEP 3\nTAG XPATH=\"\//input[@name=/'done/']\"");
    break;
    // case "google_plus":
    //   loc_macros += "URL GOTO=https://plus.google.com" + "\n";
    //   loc_macros += "TAG XPATH=\"//div[@class=\'OnYLS\']\"" + "\n";
    //   loc_macros += "WAIT SECONDS = 3" + "\n";
    //   loc_macros += "TAG XPATH=\"//textarea[@role=\'textbox\']\" CONTENT={{!VAR1}}" + "\n";
    //   loc_macros += "EVENT TYPE=KEYPRESS XPATH=\"//textarea[@role=\'textbox\']\" CHAR = \"R\"" + "\n";
    //   loc_macros += "EVENT TYPE=KEYPRESS XPATH=\"//textarea[@role=\'textbox\']\" KEY = 8" + "\n"; //bckspace
    //   loc_macros += "WAIT SECONDS = 2" + "\n";
      
    //   if (pics > 0) {
    //     loc_macros += "TAG XPATH=\"//div[contains(@aria-label, \'фото\')]\"" + "\n";
    //     loc_macros += "WAIT SECONDS = 2" + "\n";
    //     loc_macros += "TAG XPATH=\"\//input[@accept=\'image/*\']\" CONTENT=\"" + pImgFolder + "\\\\" + pics + picExtansion + "\"" + "\n";
    //     loc_macros += "WAIT SECONDS = 10" + "\n";
    //   }
    //   pics--;
      
    //   while (pics > 0) {
    //     loc_macros += "TAG XPATH=\"//div[contains(@aria-label, \'ещё фото\')]\"" + "\n";
    //     loc_macros += "WAIT SECONDS = 2" + "\n";
    //     loc_macros += "TAG XPATH=\"\//input[@accept=\'image/*\']\" CONTENT=\"" + pImgFolder + "\\\\" + pics + picExtansion + "\"" + "\n";
    //     loc_macros += "WAIT SECONDS = 10" + "\n";
        
    //     pics--;
    //   }
      
    //   loc_macros += "TAG XPATH=\"\//span[contains(.,\'Опубликовать\')]\"" + "\n";
    //   loc_macros += "WAIT SECONDS = 5" + "\n";
    //   iimPlay (loc_macros);
    // break;
    case "vk":
      // Группа. Тест публикаций
      // Страница. Тест публикаций
      // Публикация на своей стене
      // //div[@id='post_field']
      if (pPage === "") {
        loc_macros += "URL GOTO=https://m.vk.com" + "\n";
        loc_macros += "TAG XPATH=\"\//div[@class=\'ip_user_link\']/a[1]\"" + "\n";
      }
      else {
        loc_macros += "URL GOTO=" + locPage + "\n";
      }
      loc_macros += "WAIT SECONDS = 2" + "\n";
      //2016 не найден тег
      loc_macros += "TAG POS=3 TYPE=INPUT:FILE FORM=ACTION:/wall* ATTR=* CONTENT=\"" + pImgFolder + "\\\\" + pImgNum + picExtansion + "\"" + "\n";
      loc_macros += "WAIT SECONDS = 4" + "\n";
      loc_macros += "TAG XPATH=\"\//input[@type=\'submit\']\"" + "\n";
      loc_macros += "WAIT SECONDS = 3" + "\n";
      iimPlay (loc_macros);
    break;
    case ("twitter"):
      loc_macros += "URL GOTO=https://twitter.com/" + "\n";
      loc_macros += "EVENT TYPE=CLICK XPATH=\"//div[@id='tweet-box-home-timeline']\"" + "\n";
      loc_macros += "TAG POS=1 TYPE=INPUT:FILE FORM=ACTION://upload.twitter.com/i/tweet/create_with_media.iframe ATTR=NAME:media_empty CONTENT=\"" + pImgFolder + "\\\\" + pImgNum + picExtansion + "\"" + "\n";
      loc_macros += "WAIT SECONDS = 1" + "\n";
      loc_macros += "TAG XPATH = \"//button[contains(@class,'btn primary-btn tweet-action tweet-btn js-tweet-btn')]\"" + "\n";
      loc_macros += "WAIT SECONDS = 6" + "\n";
      iimPlay (loc_macros);
    break;
    default:
      //wat
      result = -1;
    break;
  }
  
  return (result);
}

//-------------------//Завершение - соц. сети//----------------------

//----------------------//Генерация данных//-------------------------

/**
@class    data_generation
@brief    Функция определяет случайные данные пользователя для регистрации
@param    old_min         Минимальный возраст
          old_max         Максимальный возраст
          p_service_data  Данные в формате функции ReadService
@return   result          Данные для регистрации
            first_name    Имя
            last_name     Фамилия
            birthday      День рождения
              year
              month
              day
            pass          пароль
            number        Номер телефона. Присваивается после успешного 
                            обращения к SimSMS, по умолчанию +7
*/
function RandomData (old_min, old_max, p_service_data) {
  var result = {
    first_name: "",
    last_name:  "",
    birthday:   {year: 1, month: 1, day: 1},
    age:        0,
    pass:       "",
    number:     "+7"
  };

  var m_fullname = createFullName_v2 (p_service_data.full_path_f_names, p_service_data.full_path_l_names);
  
  var current_rand_fullname = m_fullname.GetRandomFullName (true);

  result.first_name = current_rand_fullname.first_name;
  result.last_name = current_rand_fullname.last_name;
  
  var currentTime = new Date();
  var current_year = currentTime.getFullYear();
  
  result.age = getRandom (old_min, old_max);
  result.birthday.year = current_year - result.age;
  result.birthday.mouth = getRandom (1, 12);
  result.birthday.day = getRandom (1, 28);
  
  return (result);
}

/**
@class  data_generation
@brief  Создает объект fullName с нужными свойствами и методами.
@param  
@return  
*/
function createFullName_v2 (first_names_fullpath, last_names_fullpath) {
  var result = {
    min_str: 1,
    num_tab: 1,
    f_fullnamefile: first_names_fullpath,
    l_fullnamefile: last_names_fullpath,
    first_name_pos: 1,
    last_name_pos: 1,
    f_first_line: "",
    l_first_line: "",
    f_current_linenum: 1,
    l_current_linenum: 1,
    f_name_min_absent_str: 2,
    l_name_min_absent_str: 2
  }

  result.f_first_line = (ReadLine_v2(first_names_fullpath, 1, result.num_tab, "", ""))[1];

  result.f_name_min_absent_str = (function () {
    var local_result = 2;

    var l_read_line = ReadLine_v2(first_names_fullpath, local_result, result.num_tab, "", result.f_first_line);
    while (l_read_line!=-1) {
      local_result *= 2;
      l_read_line = ReadLine_v2(first_names_fullpath, local_result, result.num_tab, "", result.f_first_line);
    }
    return (local_result);
  })();
  result.f_current_linenum = result.min_str;

  //--last name

  result.l_first_line = (ReadLine_v2(last_names_fullpath, 1, result.num_tab, "", ""))[1];

  result.l_name_min_absent_str = (function () {
    var local_result = 2;

    var l_read_line = ReadLine_v2(last_names_fullpath, local_result, result.num_tab, "", result.l_first_line);
    while (l_read_line!=-1) {
      local_result *= 2;
      l_read_line = ReadLine_v2(last_names_fullpath, local_result, result.num_tab, "", result.l_first_line);
    }
    return (local_result);
  })();
  result.l_current_linenum = result.min_str;

  /**
  @class  data_generation
  @brief  Определяет случайное имя
  @param  p_rand            Определяет последовательность забираемых из файла строк
              true                Случайный порядок
              false               Следующее значение
  @return    loc_result
              first_name  Имя
              last_name   Фамилия
  */
  result.GetRandomFullName = function (p_rand) {
    var loc_result = {
      first_name: "",
      last_name: ""
    };
    var loc_f_line = "";
    var loc_l_line = "";
    if (p_rand) {
      this.f_current_linenum = getRandom (this.min_str, this.f_name_min_absent_str);
      loc_f_line = ReadLine_v2(this.f_fullnamefile, this.f_current_linenum, this.num_tab, "", this.f_first_line);
      while (loc_f_line==-1) {
        if (this.f_current_linenum < this.f_name_min_absent_str) {
          this.f_name_min_absent_str = this.f_current_linenum;
        }
        this.f_current_linenum = getRandom (this.min_str, this.f_name_min_absent_str);
        loc_f_line = ReadLine_v2(this.f_fullnamefile, this.f_current_linenum, this.num_tab, "", this.f_first_line);
      }
      
      //last name

      this.l_current_linenum = getRandom (this.min_str, this.l_name_min_absent_str);
      loc_l_line = ReadLine_v2(this.l_fullnamefile, this.l_current_linenum, this.num_tab, "", this.l_first_line);
      while (loc_l_line==-1) {
        if (this.l_current_linenum < this.l_name_min_absent_str) {
          this.l_name_min_absent_str = this.l_current_linenum;
        }
        this.l_current_linenum = getRandom (this.min_str, this.l_name_min_absent_str);
        loc_l_line = ReadLine_v2(this.l_fullnamefile, this.l_current_linenum, this.num_tab, "", this.l_first_line);
      }
    }
    else {
      this.f_current_linenum++;
      loc_f_line = ReadLine_v2(this.f_fullnamefile, this.f_current_linenum, this.num_tab, "", this.f_first_line);
      if (loc_f_line==-1) {
        this.f_name_min_absent_str = this.f_current_linenum;
        this.f_current_linenum = this.min_str;
        loc_f_line = ReadLine_v2(this.f_fullnamefile, this.f_current_linenum, this.num_tab, "", this.f_first_line);
      }

      this.l_current_linenum++;
      loc_l_line = ReadLine_v2(this.l_fullnamefile, this.l_current_linenum, this.num_tab, "", this.l_first_line);
      if (loc_l_line==-1) {
        this.l_name_min_absent_str = this.l_current_linenum;
        this.l_current_linenum = this.min_str;
        loc_l_line = ReadLine_v2(this.l_fullnamefile, this.l_current_linenum, this.num_tab, "", this.l_first_line);
      }
    }
    loc_result.first_name = loc_f_line[1];
    loc_result.last_name = loc_l_line[1];

    return (loc_result);
  };

  return (result);
}

/**
@class    data_generation
@brief    Функция эмулирует статические переменные. Сохраняет текущие
            позиции чтения файлов first_names и last_names.
          FullName.first_name_pos=1; - определяем позицию чтения
          var full_name = FullName(true, false, first_names_path, 
            last_names_path); - генерируем полное имя
            
@param    next_first_name
            true          Следующее имя
            false         
          next_last_name  
            true          Следующая фамилия.
            false         
@return   result          
            first_name    Имя
            last_name     Фамилия
*/
var FullName = function(next_first_name, next_last_name, first_names_path, last_names_path) {
  var result = {
    first_name: "",
    last_name: ""
  };
  
  const min_str = 1;
  //const max_str = 30;
  
  var num_tab = 1;
  
  if (!(!!arguments.callee.first_name_pos)) arguments.callee.first_name_pos = 1;
  if (!(!!arguments.callee.last_name_pos)) arguments.callee.last_name_pos = 1;
  
  //define full name
  if (!!first_names_path && !!last_names_path) {
    var read_line = "";
    
    if (!(!!arguments.callee.f_name_min_absent_str)) {
      arguments.callee.f_name_min_absent_str = 2;
      
      read_line = ReadLine(first_names_path,arguments.callee.f_name_min_absent_str,num_tab);
      while (read_line!=-1) {
        arguments.callee.f_name_min_absent_str *= 2;
        read_line = ReadLine(first_names_path,arguments.callee.f_name_min_absent_str,num_tab);
      }
    }
    if (!(!!arguments.callee.l_name_min_absent_str)) {
      arguments.callee.l_name_min_absent_str = 2;
      
      read_line = ReadLine(last_names_path,arguments.callee.l_name_min_absent_str,num_tab);
      while (read_line!=-1) {
        arguments.callee.l_name_min_absent_str *= 2;
        read_line = ReadLine(last_names_path,arguments.callee.l_name_min_absent_str,num_tab);
      }
    }
  
    if (next_first_name && next_last_name) {
      //shuffle - rand read positions
      //Если оба параметра, разрешающих перебор значений, установлены как
      //true, то формируется случайная комбинация
      arguments.callee.first_name_pos = getRandom (min_str, arguments.callee.f_name_min_absent_str);
      while (ReadLine(first_names_path,arguments.callee.first_name_pos,num_tab)==-1) {
        if (arguments.callee.first_name_pos < arguments.callee.f_name_min_absent_str) {
          arguments.callee.f_name_min_absent_str = arguments.callee.first_name_pos;
        }
        arguments.callee.first_name_pos = Math.ceil(arguments.callee.first_name_pos/2);
      }
      
      arguments.callee.last_name_pos = getRandom (min_str, arguments.callee.l_name_min_absent_str);
      while (ReadLine(last_names_path, arguments.callee.last_name_pos, num_tab)==-1) {
        if (arguments.callee.last_name_pos < arguments.callee.l_name_min_absent_str) {
          arguments.callee.l_name_min_absent_str = arguments.callee.last_name_pos;
        }
        arguments.callee.last_name_pos = Math.ceil(arguments.callee.last_name_pos/2);
      }
    }
    
    //define first_name
    result.first_name = ReadLine(first_names_path, arguments.callee.first_name_pos, num_tab);
    if (result.first_name==-1) {
      arguments.callee.first_name_pos = 1;
      arguments.callee.last_name_pos++;
      result.first_name = ReadLine(first_names_path, arguments.callee.first_name_pos, num_tab)[1];
    }
    else {
      result.first_name = result.first_name[1];
    }
    
    //define last_name
    result.last_name = ReadLine(last_names_path, arguments.callee.last_name_pos, num_tab);
    if (result.last_name ==-1) {
      arguments.callee.last_name_pos = 1;
      result.last_name = ReadLine(last_names_path, arguments.callee.last_name_pos, num_tab)[1];
    }
    else {
      result.last_name = result.last_name[1];
    }
  }
  
  if (next_first_name) ++arguments.callee.first_name_pos;
  if (next_last_name) ++arguments.callee.last_name_pos;
  
  return (result);
}

/**
@class    data_generation
@brief    Функция возвращает случайное число в нужном диапазоне
@param    min             Минимальное значение
          max             Максимальное значение
@return   min..max        Случайное значение в диапазоне от min до max
*/
function getRandom (min, max) {
  min = +min;
  max = +max;

  var temp = 0;
  if (min > max) {
    temp = min;
    min = max;
    max = temp;
  }
  max = max + 1;
  var result = Math.floor(Math.random() * (max - min) + min);
  if (result === max) {
    result -= 1;
  }
  return (result);
}

/**
@class    data_generation
@brief    Определяет случайное число на базе данного числа и 
            допустимого отклонения
@param    num             Изменяемое число
          deviation       0..100. Допустимые проценты отклонения от
                            номинала.
@return   Измененное число.
*/
function RandomDeviation (num, deviation) {
  var result = Math.round (num*(getRandom(-deviation, deviation)/100 + 1));
  return (result);
}

/**
@class    data_generation
@brief    Функция генерирует случайный пароль
@param    min_sym         Минимальное значение 
          max_sym         Максимальное значение
@return   min..max        Пароль
*/
function CreatePass (min_sym, max_sym) {
  var result = "";
  
  // var cryptoStor = new Uint16Array(8);
  // window.crypto.getRandomValues(cryptoStor);

  var chars=['a','b','c','d','e','f','g','h','j','k','l','m','n','o','p','r','s','t','u','v','w','x','y','z', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  
  var sym = getRandom(min_sym, max_sym);
  
  var new_char = "";
  
  for (current_sym = 0; current_sym < sym; current_sym++) {
    outer_create_pass: while (1) {
      new_char = chars[getRandom (0, (chars.length-1))];
      for (var i = 0; i< result.length; i++) {
        if (result[i]==new_char) {
          continue outer_create_pass;
        }
      }
      break;
    }
    result += new_char;
  }
  return (result);
}

/**
@class  data_generation
@brief  Yes or no? True of false?
@param  p_chance            Chance of yes, int %
        p_f                 function
@return true                Yes
        false               No
*/
function proc (p_chance, p_f) {
  var result = 0;

  if (isNaN(p_chance)) {
    p_chance = 50;
  }
  else if (p_chance > 100) {
    p_chance = 100;
    result = true;
  }
  else if (p_chance < 0) {
    p_chance = 0;
    result = false;
  }

  if (result === 0) {
    if (getRandom(0, 100) < p_chance) {
      result = true;
    }
    else {
      result = false;
    }
  }

  if (!!p_f) {
    if (result) {
      p_f();
    }
  }
  
  return (result);
}

//----------------//Завершение - генерация данных//------------------

//-------------------//Математические функции//----------------------

/**
@class  d_math
@brief  Fisher–Yates Shuffle
        Перемешивает массив случайным образом
@param  array               Массив
@return Массив после перемешивания
*/
function shuffle(array) {
  var m = array.length, t, i;

  // While there remain elements to shuffle…
  while (m) {

    // Pick a remaining element…
    i = Math.floor(Math.random() * m--);

    // And swap it with the current element.
    t = array[m];
    array[m] = array[i];
    array[i] = t;
  }

  return array;
}

/**
@class  d_math
@brief  Shuffle numbers, for random work with arrays
@param  p_len               Length of array 
@return Array with shuffling numbers
*/
function numShuffle (p_len) {
  var indexes = new Array();
  
  p_len = +p_len;

  for (i = 0; i < p_len; i++) {
    indexes[i] = i;
  }
  indexes = shuffle(indexes);

  return (indexes);
}

//-------------//Завершение - Математические функции//---------------

//----------------------//Yandex регистрация//------------------------

/**
@class    yandex_reg
@brief    Функция генерирует адреса почты Yandex. Не регистрирует!
@param    contact_data    Данные для регистрации, формата функции 
                            RandomData
@return   result          Данные аккаунта
            mail_login    Адрес почты
            mail_pass     Пароль почты
            phone         Номер телефона
          -1              Ошибка при регистрации
*/
function YandexNoReg (p_contact_data) {
  var result = {
    mail_login: p_contact_data.first_name,
    mail_pass: "virtual mail",
    phone: ""
  };
  
  var add_figures_min = 10000;
  var add_figures_max = 99999;
  
  result.mail_login = p_contact_data.first_name + String(getRandom (add_figures_min, add_figures_max)) + "@yandex.ru";
  
  return (result);
}

/**
@class    yandex_reg
@brief    Функция регистрирует аккаунты на Yandex через СМС.
@param    contact_data      Данные для регистрации, формата функции 
                              RandomData
          p_api_simsms      Ключ API сервиса SimSMS
          p_api_smsactivate
@return   result            Данные аккаунта
            mail_login      Адрес почты
            mail_pass       Пароль почты
            phone           Номер телефона
          -1                Ошибка при регистрации
*/
function YandexReg_v3 (p_contact_data, p_api_simsms) {
  const error = -1;
  const WITH_DOMAIN_FLAG = false;
  var result = {
    mail_login: p_contact_data.first_name,
    mail_pass: "",
    phone: ""
  };
  
  var sms_service = {
    current: 1,
    list: {
      simsms: 0,
      smsactivate: 1
    }
  };

  var add_figures_min = 10000;
  var add_figures_max = 99999;
  
  var loc_login = "";

  var flag_first_input = true;
  var first_answer = 0;
  var sms_code = "";
  var flag_try_again = false;
  
  var macros = "CODE:SET !EXTRACT_TEST_POPUP NO"+"\n";
  // macros += "URL GOTO=https://yandex.ru/" + "\n";
  macros += "TAG XPATH=\"//a[contains(@href, 'passport.yandex.ru/registration')]\"" + "\n";
  macros += "TAG POS=1 TYPE=INPUT:TEXT FORM=NAME:NoFormName ATTR=ID:firstname CONTENT=" + p_contact_data.first_name + "\n";
  macros += "TAG POS=1 TYPE=INPUT:TEXT FORM=NAME:NoFormName ATTR=ID:lastname CONTENT=" + p_contact_data.last_name + "\n";
  if (iimPlay (macros) !== 1) {
    return (error);
  }

  if ((XPATH_Here ("XPATH = \"\//div[contains(@class, 'human-confirmation_phone')]/self::*[contains(@class, 'g-hidden')]\""))) {
    return (error);
  }
  
  var loc_xpath = "XPATH = \"\//div[@class=\'control__error control__error__login_notavailable\']\"";
  
  do {
    loc_login = translite (p_contact_data.first_name) + String(getRandom (add_figures_min, add_figures_max));
    macros = "CODE:SET !EXTRACT_TEST_POPUP NO"+"\n";
    macros += "TAG POS=1 TYPE=INPUT:TEXT FORM=NAME:NoFormName ATTR=ID:login CONTENT=" + loc_login + "\n";
    macros += "WAIT SECONDS=5" + "\n";
    iimPlay (macros);
  } while (XPATH_Here(loc_xpath));
  
  result.mail_pass = CreatePass (8, 14);

  macros = "CODE:SET !EXTRACT_TEST_POPUP NO"+"\n";
  macros += "SET !ENCRYPTION NO" + "\n";
  macros += "TAG POS=1 TYPE=INPUT:PASSWORD FORM=NAME:NoFormName ATTR=ID:password CONTENT=" + result.mail_pass + "\n";
  macros += "TAG POS=1 TYPE=INPUT:PASSWORD FORM=NAME:NoFormName ATTR=ID:password_confirm CONTENT=" + result.mail_pass + "\n";
  iimDisplay (p_contact_data.pass);
  iimPlay (macros);
  
  loc_xpath = "XPATH = \"\//div[contains (@class, 'control__error control__error__phone-confirm')]/self::*[not(contains(@class, 'g-hidden'))][1]\"";

  flag_first_input = true;
  first_answer = 0;
  sms_code = "";

  do {
    if (sms_service.current === sms_service.list.simsms) {
      first_answer = SimSMS_Get_Number(p_api_simsms);
    }
    else if (sms_service.current === sms_service.list.smsactivate) {
      do {
      	first_answer = g_sms_activate_module.GetNumber();
      } while ( g_sms_activate_module.waitCommand() !== 1 );
    }
    flag_try_again = false;
    if (!(first_answer.number > 256)) {
      //1729 switch to smsactivate
      if (sms_service.current === sms_service.list.smsactivate) {
      	first_answer = g_sms_activate_module.GetNewNumber();
      }
      else {
        sms_service.current = sms_service.list.smsactivate;
      }
      flag_try_again = true;
      continue;
    }
    
    macros = "CODE:SET !EXTRACT_TEST_POPUP NO"+"\n";
    if (flag_first_input) {
      flag_first_input = false;
    }
    else {
      macros += "TAG POS=1 TYPE=BUTTON FORM=NAME:NoFormName ATTR=ID:nb-3" + "\n";
    }
    macros += "TAG POS=1 TYPE=INPUT:TEL FORM=NAME:NoFormName ATTR=ID:phone_number CONTENT=" + first_answer.number + "\n";
    macros += "TAG POS=1 TYPE=BUTTON FORM=NAME:NoFormName ATTR=ID:nb-2" + "\n";
    iimPlay (macros);
    
    if (sms_service.current === sms_service.list.smsactivate) {
      sms_code = g_sms_activate_module.GetSMS();
    }
    else {
      sms_code = SimSMS_Get_Code (p_api_simsms, first_answer.id);
    }
    
    if (sms_code < 0) {
    	return (error);
    }

    macros = "CODE:SET !EXTRACT_TEST_POPUP NO"+"\n";
    macros += "TAG POS=2 TYPE=INPUT:TEL FORM=NAME:NoFormName ATTR=* CONTENT=" + sms_code + "\n";
    macros += "TAG POS=1 TYPE=BUTTON FORM=NAME:NoFormName ATTR=ID:nb-4" + "\n";
    macros += "WAIT SECONDS=6" + "\n";
    iimPlay (macros);
  } while (XPATH_Here(loc_xpath) || flag_try_again);
  
  iimPlayCode("TAG POS=1 TYPE=BUTTON FORM=NAME:NoFormName ATTR=ID:nb-5");
  
  if (checkErrorsOnRegPage() === 1) {
  	iimPlayCode("TAG POS=1 TYPE=BUTTON FORM=NAME:NoFormName ATTR=ID:nb-4");
  	Delay(5);
  	iimPlayCode("TAG POS=1 TYPE=BUTTON FORM=NAME:NoFormName ATTR=ID:nb-5");
		if (checkErrorsOnRegPage() === 1) {
			return (error);
		}
	}

  YandexFirstSteps ();
  
  if (WITH_DOMAIN_FLAG) {
  	result.mail_login = loc_login + "@yandex.ru";
  }
  else {
  	result.mail_login = loc_login;
  }
  result.phone = first_answer.number;
  
  return (result);
}

/**
@class	yandex_reg
@brief	Определяет наличие ошибок при регистрации.
@param	-
@return	1									Ошибки на странице есть
				-1								Ошибок на странице нет
*/
function checkErrorsOnRegPage () {
	var result = -1;
	var i = 1;
	var t_xpath = "";
	var tag_error_here = false;
	var visible_error_here = false;

	while (true) {
		t_xpath = "XPATH = \"//form[@class='form']/descendant::div[contains(@class, 'control__error')][" + i + "]\"";
		tag_error_here = XPATH_Here (t_xpath);
		if (!tag_error_here) {
			break;
		}
		t_xpath = "XPATH = \"//form[@class='form']/descendant::div[contains(@class, 'control__error')][" + i + "]/self::*[not(contains(@class, 'g-hidden'))]\"";
		visible_error_here = XPATH_Here (t_xpath);
		if (visible_error_here) {
			result = 1;
			next_flag = false;
			break;
		}
		i++;
	}
	
	return (result);
}

/**
@class yandex_reg
@brief Закрывает всплывающее окно, отмечает письма как прочитанные
@param -
@return   1             		Выполнено успешно
          -1            		Ошибка при выполнении
*/
function YandexFirstSteps () {
  var result = 1;
  
  var macros = "CODE:SET !EXTRACT_TEST_POPUP NO"+"\n";
  macros += "!ERRORIGNORE YES" + "\n";
  macros += "WAIT SECONDS = 5" + "\n";
  //Первые шаги - закрыть
  macros += "TAG POS=3 TYPE=DIV ATTR=TXT:×" + "\n";
  macros += "WAIT SECONDS = 2" + "\n";
  //Перейти в легкую версию
  macros += "TAG XPATH = \"//a[contains (@href, 'mail.yandex.ru/neo2/go2lite')]\"" + "\n";
  //Выделить все письма
  macros += "TAG XPATH = \"//input[@data-action='check-all']\"" + "\n";
  macros += "WAIT SECONDS = 1" + "\n";
  //Отметить как прочитанное
  macros += "TAG XPATH = \"//input[@name='mark']\"" + "\n";
  iimPlay (macros);

  Delay (10);

  return (result);
}

/**
@class	yandex_reg
@brief	Проверяет, доступны ли Яндекс деньги
@param	-
@return	1							Сервис доступен
				-1						Сервис не доступен
*/
function yaMoneyCheck () {
	var result = 1;
	iimPlayCode("URL GOTO=https://money.yandex.ru");
	if (!XPATH_Here("XPATH=\"\//body[1]\"")) {
  	result = -1;
  }

	return (result);
}

/**
@class yandex_reg
@brief Регистрирует кошелек. После регистрации или логина в почте.
@param 
					p_contact_data  	Данные для регистрации, формата функции RandomData
@return   1             		Выполнено успешно
          -255 < result < 0 Ошибка при получении повторного СМС
          -255							Ошибка в паспортных данных
*/
function yaMoneyReg (p_contact_data) {
  var result = 1;
  var no_access_page_error = -30;
  var pass_error = -255;
  var loc_sms = 0;
  // 1. Переход по элементу
	if (iimPlayCode("TAG XPATH = \"//a[contains (@href, 'money.yandex.ru')]\"") !== 1) {
		iimPlayCode("URL GOTO=https://money.yandex.ru/new");
	}

  if (!XPATH_Here("XPATH=\"\//body[1]\"")) {
  	return (no_access_page_error);
  }

  // 2. Кнопка открытия кошелька
  iimPlayCode("TAG XPATH = \"//h1/following-sibling::a[contains(@href, 'reg')]\"");
  // 3. Подтверждение телефона
  iimPlayCode("TAG XPATH = \"//button[@type='submit']\"");
  // 4. Ввод кода из СМС

  if (g_sms_activate_module.waitCommand() !== 1) {
  	return (-1);
  }
  loc_sms = g_sms_activate_module.GetSMS ();

  if (loc_sms < 0) {
    return (loc_sms);
  }

  iimPlayCode("TAG XPATH = \"//input[@name='sms-response']\" CONTENT=" + loc_sms);
  // 5. Кнопка Создать
  Delay (2);
  iimPlayCode("TAG XPATH = \"//form/descendant::button[contains(@class,'end-reg')]\"");
  //нажатие не произошло
  Delay(4);
  // 6.1 - 6.2. Изменение статуса кошелька
  iimPlayCode("TAG XPATH = \"//div[contains(@class, 'dropdown')]/button[contains(@class,'button')]\"");
  iimPlayCode("TAG XPATH = \"//div[@class='balance__item']/a[contains(@href, 'state')]\"");
  // 7. Выбор "Заполнить онлайн - анкету"
  iimPlayCode("TAG XPATH = \"//div[@class='page-layout__frame-content']/div[2]/div[@class='status-column__user']/a\"");
  // 8. Заполнение паспортных данных
  fillQuestionnaire (p_contact_data);
  
  if (XPATH_Here("XPATH = \"\//div[contains(@class, 'page_type_error')]/descendant::a[contains(@class, 'button2')]\"")) {
  	result = pass_error;
  }

  return (result);
}

/**
@class	yandex_reg
@brief	Заполняет анкету
Иногда попадает на 503 ошибку
@param	p_contact_data  	Данные для регистрации
@return	result
*/
function fillQuestionnaire (p_contact_data) {
	var result = 1;
	
	var loc_macros = "CODE:SET !EXTRACT_TEST_POPUP NO" + "\n";
  loc_macros += KeyboardEmul(p_contact_data.last_name, "XPATH=\"//input[@name='lastName']\"");
  loc_macros += KeyboardEmul(p_contact_data.first_name, "XPATH=\"//input[@name='firstName']\"");
  loc_macros += KeyboardEmul(p_contact_data.middle_name, "XPATH=\"//input[@name='middleName']\"");
  loc_macros += KeyboardEmul(p_contact_data.birthday_ddmmyyyy, "XPATH=\"//input[@name='birthDate']\"");

  loc_macros += KeyboardEmul(p_contact_data.docnum, "XPATH=\"//input[@name='docNumber']\"");
  loc_macros += KeyboardEmul(p_contact_data.docdate, "XPATH=\"//input[@name='docIssueDate']\"");
  iimPlay (loc_macros);

  iimPlayCode("EVENT TYPE=CLICK XPATH = \"//div[@class='data-unit__base']/span[contains(@class, 'link_shown_yes')]\" BUTTON=0");

  Delay(2);
  // Кнопка Сохранить данные
  iimPlayCode("TAG XPATH = \"//div[contains(@class, 'form__submit')]/button[contains(@class,'type_submit')]\"");
  Delay(20);

	return (result);
}

/**
@class	yandex_reg
@brief	Определяет номер кошелька
@param	-
@return	Номер Яндекс кошелька
*/
function GetYaMNum () {
	var result = 1;

	var loc_macros = "CODE:SET !EXTRACT_TEST_POPUP NO" + "\n";
	loc_macros += "URL GOTO=https://money.yandex.ru" + "\n";
	loc_macros += "TAG XPATH = \"\//div[contains(@class, 'balance__heading')]/a[contains (@href, 'money.yandex.ru/to/')]\" EXTRACT=HREF" + "\n";
	iimPlay (loc_macros);
	result = iimGetExtract();
	result = result.match(/[0-9]{6,}/);
	return (result);
}

/**
@class	yandex_reg
@brief	Сохраняет аварийные коды аккаунта
@param	-
@return	Аварийные коды в виде массива
				-255 < result < 0 Ошибка при получении повторного СМС
				-255							Ошибка при введении кода
				-256 							Нет кнопки Получить пароль
*/
function GetCodes () {
	const verify_error = -255;
	const lost_button = -256;
	var check_button_flag = false;
	var result = 1;
	var loc_sms = 0;

	var iimCode = 1;
	var current_code = "";
	var code_num = 0;

	// Переход в настройки яндекс денег
	iimPlayCode("TAG XPATH = \"//div[contains(@class, 'dropdown')]/button[contains(@class,'button')]\"");
	iimPlayCode ("TAG XPATH = \"//div[@class = 'popup__content']/descendant::div[@class='balance__heading']/a[@href = 'https://money.yandex.ru/settings?_openstat=template%3Bipulldown%3Bsettings']\"");

	//Кнопка Аварийные коды
	iimPlayCode ("TAG XPATH = \"//div[contains(@class, 'tabs-panes i-bem')]/descendant::a[contains (@href, 'Bemcode')]\"");

	//бывает такое, что в поле "Подтвердите получение аварийных кодов" ничего нет
	//виноват Useragent
	//Кнопка получить пароль
	while ( iimPlayCode("TAG XPATH = \"//input[@class = 'b-form-button__input']/self::*[@type = 'button']/ancestor::tr[contains(@class, 'hidden-display')]/self::*[contains(@style, 'display')]\"") !== 1 ) {
		if (check_button_flag) {
			return (lost_button);
		}
		else {
			check_button_flag = true;
		}
		g_logs.write ("в поле \"Подтвердите получение аварийных кодов\" ничего нет. Useragent: %current_useragent%");
		Start_Tor("", false, false, false);
		iimPlayCode("REFRESH");
		Delay (15);
	}

	iimPlayCode ("TAG XPATH = \"//input[@class = 'b-form-button__input']/self::*[@type = 'button']\"");

	if (g_sms_activate_module.waitCommand() !== 1) {
  	return (-1);
  }
	loc_sms = g_sms_activate_module.GetSMS ();

	if (loc_sms < 0) {
    return (loc_sms);
  }

	//код из смс
	iimPlayCode ("TAG XPATH = \"//input[@id = 'sms-response']\" CONTENT=" + loc_sms);

	Delay (1);
	//Подтвердить
	iimPlayCode ("TAG XPATH = \"//input[contains(@class, 'b-form-button__input')]/self::*[@type='submit']\"");

	// Проверка состояния. Если тег есть - ошибка
	if ( XPATH_Here ("XPATH = \"//span[@class = 'ym-simple-tip-block']/div[contains(@class, 'ym-simple-tip_theme_red')][1]/self::*[contains (@style, 'visibility: visible')]\"", 6) ) {
		result = verify_error;
	}
	else {
		result = extractCodes();
	}

	return (result);
}

/**
@class	yandex_reg
@brief	Забирает со страницы аварийные коды
@param	-
@return	массив кодов
*/
function extractCodes () {
	var result = [];
	
	var iimCode = 1;
	var current_code = "";
	var code_num = 0;

	while (1) {
		iimCode = iimPlayCode ("TAG XPATH = \"//td[@class='content__center']/descendant::span[@class = 'text_theme_light-grey'][" + (code_num+1) + "]/parent::*\" EXTRACT=TXT");
		current_code = iimGetExtract();
		if ((iimCode!==1) || (current_code=="#EANF#")) {
			break;
		}
		current_code = (String(current_code)).replace (/.*\.\s?/g, "");
		current_code = current_code.replace (/\n/g, "");
		result[code_num] = current_code;
		code_num++;
	}

	return (result);
}

//---------------//Завершение - Yandex//------------------

//-------------------------//Базовые функции поисковых систем//------------------------
/**
This module for communicating with search engines:
- search with test result on anti-bot - input query (this.query);
- search the domain in result at n pages and click it - flag close result, flag click on domain;
*/

/**
@class  search_engines_general
@brief  Searching module.
@param  p_query             Query
@return  Search_module object
*/
Search_module = function (p_engine, p_query) {
  var result = 1;

  if (p_engine === "ya") {
    this.engine = this.ENGINES.ya;
  }
  else if (p_engine === "g") {
    this.engine = this.ENGINES.g;
  }
  else {
    this.engine = p_engine;
  }
  
  this.status = this.STATUS.SUCCESS;
  this.query = "";
  this.url = "";
  this.domain = "";
  this.click_result = 0;

  //test string here
  if (!!p_query) {
    this.query = p_query;
  }

  return (this);
}

//Search engines
Search_module.prototype.ENGINES = {
  ya: 0,
  g: 1
}

//status values
Search_module.prototype.STATUS = {
  SUCCESS:{num: 1, text: "Success"},
  IMBOT:{num: -1, text: "I'm bot in search engine mind"}
}

/**
@class  search_engines_general
@brief  Check search access
@param  -
@return True                Success
        False               Error
*/
Search_module.prototype.check = function () {
  var test_xpath = new Object();
  test_xpath[this.ENGINES.ya] = "XPATH=\"\//input[@type='search']\"";
  test_xpath[this.ENGINES.g] = "XPATH=\"/descendant::input[@type='text'][1]\"";

  var result = XPATH_Here (test_xpath[this.engine], 2);

  if (!result) {
    this.status = this.STATUS.IMBOT;
  }

  return (result);
}

/**
@class  search_engines_general
@brief  Send request
@param  p_domain            Domain for clicking
@return True                Success
        False               Error

*/
Search_module.prototype.search = function (p_domain) {
  var result = true;

  var l_macros = new Object();
  var macros_add = "";

  l_macros[this.ENGINES.ya] = "";
  l_macros[this.ENGINES.g] = "";

  macros_add = "CODE:SET !EXTRACT_TEST_POPUP NO" + "\n";
  macros_add += "TAB OPEN" + "\n";
  macros_add += "TAB T=2" + "\n";

  l_macros[this.ENGINES.ya] = macros_add;
  l_macros[this.ENGINES.g] = macros_add;

  l_macros[this.ENGINES.ya] += "URL GOTO=\"https://yandex.ru\"\n";
  l_macros[this.ENGINES.g] += "URL GOTO=\"https://google.ru\"\n";

  l_macros[this.ENGINES.ya] += KeyboardEmul (this.query, "XPATH=\//input[@id='text']");
  l_macros[this.ENGINES.g] += KeyboardEmul (this.query, "XPATH=\"/descendant::input[@type='text'][1]\"");

  l_macros[this.ENGINES.ya] += "TAG XPATH = \"\//div[@class='search2__button']/descendant::button\"" + "\n";
  l_macros[this.ENGINES.g] += "TAG XPATH=\"//input[contains(@name, 'btnK')]\"" + "\n";

  if (!!p_domain) {
    this.domain = p_domain;
  }

  iimPlay (l_macros[this.engine]);

  if (result = this.check()){
    this.url = GetCurrentURL();
    if (!!this.domain) {
      if (this.clickDomain() === -1) {
        this.close();
        this.click_result = -1;
        result = false;
      }
      else {
        this.click_result = 1;
        result = true;
      }
    }
  }

  return(result);
}

/**
@class  search_engines_general
@brief  Click on the domain. Ads transfer included
@param  p_domain            Domain for clicking
        pages               Pages count
@return 1                   Success
        -1                  Error
*/
Search_module.prototype.clickDomain = function (p_domain, p_pages) {
  var result = 0;
  var current_page = 1;

  var same_domain_xpath = new Object();

  if (!!p_domain) {
    this.domain = p_domain;
  }

  same_domain_xpath[this.ENGINES.ya] = "XPATH=\"/descendant::b[contains(., '" + this.domain + "')][1]/ancestor::li/descendant::h2/descendant::a\"";

  same_domain_xpath[this.ENGINES.g] = "XPATH=\"//div[@id='ires']/descendant::a[contains(@href, '" + this.domain + "')][1]\"";
  
  if (!p_pages) {
    p_pages = 1;
  }
  if (p_pages === 0) {
    p_pages = 1;
  }

  if (!!this.domain) {
    while (result === 0) {
      if (XPATH_Here(same_domain_xpath[this.engine])) {
        //close ya page maybe
        result = 1;
        break;
      }
      current_page++;
      //next page go
      if (current_page > p_pages) {
        result = -1;
      }
    }
  }
  else {
    result = -1;
  }
  
  return (result);
}

/**
@class  search_engines_general
@brief  Close Yandex page
@param  -
@return 1                   Success
        -1                  Error
*/
Search_module.prototype.close = function () {
  var result = 1;

  var search_url = new Object();

  search_url[this.ENGINES.ya] = "yandex.ru";
  search_url[this.ENGINES.g] = "google.";
  
  while (GetCurrentURL().indexOf(search_url[this.engine]) !== -1) {
    iimPlayCode("TAB CLOSE");
  }

  return (result);
}

/**
@class  search_engines_general
@brief  Define text from search engine url. Work with yandex and google
@param  p_url               URL to search query.
@return  ''                 Search query
          -1                Error
*/
function QueryFromSearchURL (p_url) {
  var result = 1;
  
  var regexp_google = /https:\/\/(www\.)?google\./;
  var query_google = /q=[^&#\\]*/;
  var regexp_yandex = /https:\/\/(www\.)?yandex\./;
  var query_yandex = /text=[^&#\\]*/;

  var deleted_signs = /^[^=]*=/;

  if (p_url.search(regexp_google) !== -1) {
    result = p_url.match(query_google);
    if (result !== null) {
      result = String(result).replace (/\+/g, " ");
    }
  }
  else if (p_url.search(regexp_yandex) !== -1) {
    result = p_url.match(query_yandex);
  }
  else {
    result = -1;
  }

  if ((result === null) || (result === -1)) {
    result = -1;
  }
  else {
    result = String(result).replace (deleted_signs, "");
    result = decodeURI (result);
  }

  return (result);
}

/**
@class  search_engines_general
@brief  Wrapper for search module
@param  p_engine            Search engine
          ya                Yandex
          g                 Google
        p_q                 search url or query
        p_domain            Searching domain
@return status
          1                 Success
          -1                Error
        query               Query
        search_url          URL from search engine
*/
function search_wrapper (p_engine, p_q, p_domain) {
  var result = {
    status: 0,
    query: "",
    search_url: ""
  };

  p_domain = DomainFromURL(p_domain);
  
  toJournal("for test 805: " + p_domain);

  // p_q - url or query?
  if (p_q.indexOf("\/") === -1) {
    //query
    result.query = esc2Uni(p_q);
  }
  else {
    //url
    result.search_url = p_q;
    result.query = QueryFromSearchURL(p_q);
    if (result.query === -1) {
      result.query = "";
      result.status = -1;
    }
  }

  if (result.status !== -1) {
    var loc_search = new Search_module (p_engine, result.query);
    if (loc_search.search (p_domain)) {
      result.search_url = loc_search.url;
      result.status = 1;
    }
  }

  return (result);
}

//------------------//Завершение - базовые функции поисковых систем//------------------

//--------------------//Регистрация Pinterest//----------------------

/**
@class  PinterestReg
@brief  Функция регистрирует аккаунт в Pinterest
@param  p_log           Параметр в формате функции WriteResult
@return Возвращает пароль
        -1              Ошибка при выполнении
*/
function PinterestRegi (p_log) {
  var result_pinterest_pass = CreatePass (9, 12);
  
  var macros = "CODE:SET !EXTRACT_TEST_POPUP NO"+"\n";
  macros += "URL GOTO=pinterest.com/" + "\n";
  
  macros += "WAIT SECONDS=2" + "\n";
  
  for (var current_char = 0; current_char < p_log.mail_login.length; current_char++) {
    macros += "EVENT TYPE=KEYPRESS XPATH=\//input[@name=\'id\'] CHAR = \"" + p_log.mail_login[current_char] + "\"\n";
  }
  
  for (var current_char = 0; current_char < result_pinterest_pass.length; current_char++) {
    macros += "EVENT TYPE=KEYPRESS XPATH=\//input[@name=\'password\'] CHAR = \"" + result_pinterest_pass[current_char] + "\"\n";
  }
  
  //macros += "TAG POS=1 TYPE=BUTTON FORM=NAME:NoFormName ATTR=TXT:Продолжить" + "\n";
  macros += "TAG XPATH=\"\//button[@type=\'submit\']\"" + "\n";
  macros += "WAIT SECONDS=2" + "\n";
  
  for (var current_char = 0; current_char < p_log.first_name.length; current_char++) {
    macros += "EVENT TYPE=KEYPRESS XPATH=\"\//input[@name=\'full_name\']\" CHAR = \"" + p_log.first_name[current_char] + "\"\n";
  }
  
  if (CURRENT_GENDER == GENDER.WOMAN) {
    macros += "TAG XPATH=\"\//input[@value=\'female\']\"" + "\n";
  }
  else {
    macros += "TAG XPATH=\"\//input[@value=\'male\']\"" + "\n";
  }
  macros += "TAG XPATH=\"\//button[@type=\'submit\']\"" + "\n";
  macros += "WAIT SECONDS=8" + "\n";
  macros += "REFRESH" + "\n";
  macros += "WAIT SECONDS=5" + "\n";
  iimPlay (macros);
  
  PinterestFirstSteps ();
  
  return (result_pinterest_pass);
}

/**
@class  PinterestReg
@brief  Функция подтверждает регистрацию по почте
@param  max_delay_minutes         Максимальное время ожидания в минутах
@return 1                         Завершено без ошибок
        -1                        Ошибка при выполнении
*/
function VerifyEmail (max_delay_minutes) {
  var result = 1;
  
  if (max_delay_minutes==0) {
    return (-1);
  }

  const delay_s = 60;
  var times_max = Math.ceil(max_delay_minutes * 60 / delay_s);
  var current = 0;
  
  var macros = "CODE:SET !EXTRACT_TEST_POPUP NO"+"\n";
  macros += "TAB OPEN" + "\n";
  macros += "TAB T=2" + "\n";
  macros += "URL GOTO=pinterest.com/" + "\n";
  macros += "TAB T=1" + "\n";
  iimPlay (macros);
  
  var loc_xpath = "XPATH = \"\//span[@class=\'mail-NestedList-Item-Info-MarkRead_icon\']\"";
  do {
    iimDisplay (current + " период из " + String(times_max-1));
    Delay (delay_s);
    current++;
  } while (!XPATH_Here(loc_xpath) && (current<times_max));
  
  if (XPATH_Here(loc_xpath)) {
    loc_xpath = "XPATH=\"\//span[contains(@title,\'Подтвердите адрес эл. почты\')]\"";
    var loc_xpath_en = "XPATH=\"\//span[contains(@title,\'Please confirm your email\')]\"";
    macros = "CODE:SET !EXTRACT_TEST_POPUP NO"+"\n";
    macros += "TAB T=2" + "\n";
    macros += "TAB CLOSE" + "\n";
    if (XPATH_Here(loc_xpath)) {
      macros += "TAG XPATH=\"\//span[contains(@title,\'Подтвердите адрес эл. почты\')]\"" + "\n";
      macros += "TAG POS=1 TYPE=A ATTR=TXT:Подтвердите<SP>эл.<SP>адрес" + "\n";
    }
    else if (XPATH_Here(loc_xpath_en)) {
      macros += "TAG XPATH=\"\//span[contains(@title,\'Please confirm your email\')]\"" + "\n";
      macros += "TAG POS=1 TYPE=A ATTR=TXT:Confirm<SP>your<SP>email" + "\n";
    }
    
    macros += "TAB T=2" + "\n";
    macros += "WAIT SECONDS=10" + "\n";
    macros += "TAB CLOSE" + "\n";
    iimPlay (macros);
  }
  else {
    macros = "CODE:SET !EXTRACT_TEST_POPUP NO"+"\n";
    macros += "TAB T=2" + "\n";
    macros += "TAB CLOSE" + "\n";
    iimPlay (macros);
  }
  
  return (result);
}

/**
@class PinterestReg
@brief Выбирает пять досок.
@param -
@return   1             Выполнено успешно
          -1            Ошибка при выполнении
*/
function PinterestFirstSteps () {
  const pin_select_count = 5;
  const max_step_item = 3;
  const rand_max = 100;
  
  var result = 1;
  
  var macros = "CODE:SET !EXTRACT_TEST_POPUP NO" + "\n";
  
  var pin_item = 0;
  
  for (var i = 0; i < pin_select_count; i++) {
    pin_item += Math.ceil ((getRandom (0, rand_max))/(rand_max/max_step_item));
    loc_xpath = "XPATH = \"\//div[@class=\'Grid Module\']/div[1]/div[" + pin_item + "]/div/div[2]/div[2]/div[1]\"";
    macros += "TAG " + loc_xpath + "\n";
    macros += "WAIT SECONDS=1" + "\n";
  }
  
  macros += "TAG POS=1 TYPE=BUTTON ATTR=data-element-type:96" + "\n";
  macros += "WAIT SECONDS = 5" + "\n";
  iimPlay (macros);
  
  while ("LOAD_WALL" == IdentifyPages("LOAD_WALL")) {
    //пока наполняется стена
    Delay (2);
  }
  
  SetAvatarPinterest ();
  
  return (result);
}

/**
@class  PinterestReg
@brief  Функция устанавливает аватар в Pinterest
*/
function SetAvatarPinterest () {
  var pict_num = getRandom(1, MAX_NUM_AVATARS);
  
  var result = 1;
  
  //'Настройки
  //TAG POS=1 TYPE=BUTTON ATTR=TXT:Alex
  //TAG POS=1 TYPE=A ATTR=TXT:Настройки<SP>аккаунта
  //TAG POS=1 TYPE=TEXTAREA FORM=NAME:NoFormName ATTR=ID:userAbout CONTENT=status
  //TAG POS=1 TYPE=INPUT:URL FORM=NAME:NoFormName ATTR=ID:userWebsite CONTENT=v
  //TAG POS=1 TYPE=BUTTON FORM=NAME:NoFormName ATTR=TXT:Сохранить
  
  var macro = "CODE:SET !EXTRACT_TEST_POPUP NO" + "\n";
  macro += "SET !ERRORIGNORE YES" + "\n";
  macro += "TAG XPATH = \"\//button[contains(@class,\'Module UserNavigateButton merged\')]\"" + "\n";
  macro += "TAG POS=1 TYPE=BUTTON ATTR=TXT:" + "\n";
  macro += "TAG POS=1 TYPE=A ATTR=TXT:Edit<SP>settings" + "\n";
  macro += "TAG POS=1 TYPE=BUTTON FORM=NAME:NoFormName ATTR=TXT:Change<SP>picture" + "\n";
  iimPlay (macro);
  
  var iim_error = 0;
  
  macro = "CODE:SET !EXTRACT_TEST_POPUP NO" + "\n";
  macro += "TAG POS=1 TYPE=INPUT:FILE FORM=NAME:NoFormName ATTR=NAME:img CONTENT=C:\\Program<SP>Files<SP>(x86)\\Pale<SP>Moon<SP>port\\iMacros\\Downloads\\avatars\\" + pict_num + ".jpg" + "\n";
  macro += "WAIT SECONDS = 8" + "\n";
  macro += "TAG POS=1 TYPE=BUTTON FORM=NAME:NoFormName ATTR=TXT:Save<SP>settings" + "\n";
  iim_error = iimPlay (macro);
  
  return (result);
}

/**
@class    PinterestReg
@brief    Записывает зарегистрированный аккаунт в файл
@param    record          данные аккаунта для записи
            first_name        Имя
            last_name         Фамилия
            proxy_port        Прокси и порт
            mail_login        Логин почты
            mail_pass         Пароль почты
            pinterest_pass    Пароль Pinterest
          path                Путь к файлу с выходными
                                данными
          file                Название сохраняемого файла
          empty_line          Добавление пустой строки в конце
            true
            false
@return   1                   Успешно выполнено
          -1                  Ошибка при выполнении
*/
function WriteResult(record, path, file, empty_line) {
  var result = 1;
  
  var record_is_correct = (!!record.first_name);
  record_is_correct &= (!!record.last_name);
  record_is_correct &= (!!record.proxy_port);
  record_is_correct &= (!!record.mail_login);
  record_is_correct &= (!!record.mail_pass);
  record_is_correct &= (!!record.pinterest_pass);
  
  if (!record_is_correct) {
    return (-1);
  }
  
  var to_file_script = "CODE:SET !EXTRACT_TEST_POPUP NO"+"\n";
  var loc_text = record.first_name + "\n";
  loc_text += record.last_name + "\n";
  loc_text += record.proxy_port + "\n";
  loc_text += record.mail_login + "\n";
  loc_text += record.mail_pass + "\n";
  loc_text += record.pinterest_pass + "\n";
  
  iimSet ("VAR1", loc_text);
  to_file_script += "ADD !EXTRACT {{!VAR1}}" + "\n";
  
  to_file_script += "SAVEAS TYPE=EXTRACT FOLDER=\"" + path +  "\" FILE=" + file + "\n";
  iimPlay(to_file_script);
  
  return (result);
}

/**
@class    PinterestReg
@brief    Записывает данные зарегистрированных аккаунтов в файл.
            Может делать запись частями.
@param    record          данные аккаунта для записи
            first_name        Имя
            last_name         Фамилия
            proxy_port        Прокси и порт
            mail_login        Логин почты
            mail_pass         Пароль почты
            pinterest_pass    Пароль Pinterest
          path                Путь к файлу с выходными
                                данными
          file                Название сохраняемого файла
          empty_line          Добавление пустой строки в конце
            true
            false
@return   1                   Успешно выполнено
          -1                  Ошибка при выполнении
*/
function WriteResultSoft(record, path, file, empty_line) {
  var result = 1;
  
  var to_file_script = "CODE:SET !EXTRACT_TEST_POPUP NO"+"\n";
  var loc_text = "";
  var flag_continue = false;
  if (!!record.first_name && record.first_name!="none") {
    if (flag_continue) {
      loc_text += "\n";
    }
    else {
      flag_continue = true;
    }
    loc_text += record.first_name;
  }
  if (!!record.last_name && record.last_name!="none") {
    if (flag_continue) {
      loc_text += "\n";
    }
    else {
      flag_continue = true;
    }
    loc_text += record.last_name;
  }
  if (!!record.proxy_port && record.proxy_port!="none") {
    if (flag_continue) {
      loc_text += "\n";
    }
    else {
      flag_continue = true;
    }
    loc_text += record.proxy_port;
  }
  if (!!record.mail_login && record.mail_login!="none") {
    if (flag_continue) {
      loc_text += "\n";
    }
    else {
      flag_continue = true;
    }
    loc_text += record.mail_login;
  }
  if (!!record.mail_pass && record.mail_pass!="none") {
    if (flag_continue) {
      loc_text += "\n";
    }
    else {
      flag_continue = true;
    }
    loc_text += record.mail_pass;
  }
  if (!!record.pinterest_pass && record.pinterest_pass!="none") {
    if (flag_continue) {
      loc_text += "\n";
    }
    else {
      flag_continue = true;
    }
    loc_text += record.pinterest_pass;
  }
  
  if (empty_line) loc_text += "\n";
  
  iimSet ("VAR1", loc_text);
  to_file_script += "ADD !EXTRACT {{VAR1}}" + "\n";
  
  to_file_script += "SAVEAS TYPE=EXTRACT FOLDER=\"" + path +  "\" FILE=" + file + "\n";
  iimPlay(to_file_script);
  
  return (result);
}

/**
@class    PinterestReg
@brief    Записывает данные зарегистрированных аккаунтов в файл.
          Формат: mail:пас от pinterest:логин это почта до собаки:пароль от почты:ip:port
@param    record          данные аккаунта для записи
            first_name        Имя
            last_name         Фамилия
            proxy_port        Прокси и порт
            mail_login        Логин почты
            mail_pass         Пароль почты
            pinterest_pass    Пароль Pinterest
          path                Путь к файлу с выходными
                                данными
          file                Название сохраняемого файла
@return   1                   Успешно выполнено
          -1                  Ошибка при выполнении
*/
function WriteResult_v3(record, path, file) {
  var result = 1;
  
  var record_is_correct = (!!record.first_name);
  record_is_correct &= (!!record.last_name);
  record_is_correct &= (!!record.proxy_port);
  record_is_correct &= (!!record.mail_login);
  record_is_correct &= (!!record.mail_pass);
  record_is_correct &= (!!record.pinterest_pass);
  
  if (!record_is_correct) {
    return (-1);
  }
  
  var part_mail_login = record.mail_login.replace (RegExp("[@]+[A-Za-z0-9]+[.]+[a-z]+", ""), "");
  
  var to_file_script = "CODE:SET !EXTRACT_TEST_POPUP NO"+"\n";
  
  var loc_text = record.mail_login + ":";
  loc_text += record.pinterest_pass + ":";
  loc_text += part_mail_login + ":";
  loc_text += record.mail_pass + ":";
  loc_text += record.proxy_port;
  
  //var loc_text = record.first_name + "\n";
  //loc_text += record.last_name + "\n";
  //loc_text += record.proxy_port + "\n";
  //loc_text += record.mail_login + "\n";
  //loc_text += record.mail_pass + "\n";
  //loc_text += record.pinterest_pass + "\n";

  iimSet ("VAR1", loc_text);
  iimSet ("PATH1", path);
  to_file_script += "ADD !EXTRACT {{!VAR1}}" + "\n";
  
  //to_file_script += "SAVEAS TYPE=EXTRACT FOLDER={{!PATH1}} FILE=" + file + "\n";
  to_file_script += "SAVEAS TYPE=EXTRACT FOLDER=* FILE=" + file + "\n";
  
  iimPlay(to_file_script);
  
  return (result);
}

//-------------//Завершение - Регистрация Pinterest//----------------

//------------------//Регистрация AddmefastReg//---------------------

/**
@class  Addmefast
@brief  Функция регистрирует аккаунт в Addmefast
@param  p_log           Параметр в формате функции WriteResult
@return Возвращает пароль
        -1              Ошибка при выполнении
*/
function AddmefastReg (mail, api, path_save) {
  var captcha_name = "captcha_amf_reg.jpg";
  var full_put_kap = path_save + "\\" + captcha_name;
  var captcha_result = "";
  var loc_xpath = "";
  var timeout_congratulation = 5;
  
  var macros = "CODE:SET !EXTRACT_TEST_POPUP NO"+"\n";
  macros += "URL GOTO=addmefast.com/" + "\n";
  macros += "WAIT SECONDS=2" + "\n";
  iimPlay (macros);
  
  ReadCaptcha (api, path_save, true, "MORDA_ADDMEFAST");
  //var pass = CreatePass (9, 12);
  var pass = "fetnwqeqq1245";
  
  macros = "CODE:SET !EXTRACT_TEST_POPUP NO"+"\n";
  macros += "REFRESH" + "\n";
  macros += "TAG POS=1 TYPE=A ATTR=TXT:Registration" + "\n";
  macros += "WAIT SECONDS=3" + "\n";
  
  do {
    iimPlay (macros);
    SaveCaptchaAddMeFast (captcha_name);
    captcha_result = ReadCaptcha_v2(api, full_put_kap);
  } while ((captcha_result=="ERROR_CAPTCHA_UNSOLVABLE"));
  
  //alert(captcha_result);
  
  macros = "CODE:SET !EXTRACT_TEST_POPUP NO"+"\n";
  macros += "WAIT SECONDS=3" + "\n";
  //macros += "TAG POS=1 TYPE=INPUT:TEXT FORM=ID:reg_form ATTR=ID:r_email CONTENT=" + mail + "\n";
  var loc_xpath = "XPATH=\//input[@id=\'r_email\']";
  macros += KeyboardEmul (mail, loc_xpath);
  
  macros += "SET !ENCRYPTION NO" + "\n";
  //macros += "TAG POS=1 TYPE=INPUT:PASSWORD FORM=ID:reg_form ATTR=ID:r_pass CONTENT=" + pass + "\n";
  loc_xpath = "XPATH=\//input[@id=\'r_pass\']";
  macros += KeyboardEmul (pass, loc_xpath);
  
  //macros += "TAG POS=1 TYPE=INPUT:PASSWORD FORM=ID:reg_form ATTR=ID:r_re_pass CONTENT=" + pass + "\n";
  loc_xpath = "XPATH=\//input[@id=\'r_re_pass\']";
  macros += KeyboardEmul (pass, loc_xpath);
  
  //macros += "WAIT SECONDS=3" + "\n";
  //macros += "TAG POS=1 TYPE=IMG ATTR=ID:recaptcha_switch_audio" + "\n";
  //macros += "EVENT TYPE=CLICK XPATH=\"\//img[@id=\'recaptcha_switch_audio\']\" BUTTON=0" + "\n";
  //iimPlay (macros);
  
  //var captcha_answer = RecognizeAudioCaptcha(api, path_save);
  
  //var new_captcha_answer = "";
  //for (var i = 0; i < (captcha_answer.length-1); i++) {
  //  new_captcha_answer += captcha_answer[i];
  //}
  //captcha_answer = new_captcha_answer;
  
  //iimDisplay ("audio: " + captcha_answer);
  
  //macros += "TAB CLOSE" + "\n";
  //macros += "TAG POS=1 TYPE=INPUT:TEXT FORM=ID:reg_form ATTR=ID:recaptcha_response_field CONTENT=" + captcha_answer + "\n";
  loc_xpath = "XPATH=\//input[@id=\'recaptcha_response_field\']";
  macros += KeyboardEmul (captcha_result, loc_xpath);
  macros += "TAG POS=1 TYPE=INPUT:SUBMIT FORM=ID:reg_form ATTR=NAME:r_send" + "\n";
  macros += "TAG XPATH = \"\//div[@class=\'success\']\"" + "\n";
  var error_code = iimPlay (macros);
  
  if (error_code==1) {
    //all is good
    //alert ("Congratulation!");
  }
  else {
    pass = AddmefastReg (mail, api, path_save);
  }
  
  return (pass);
}

/**
@class  Addmefast
@brief  Сохраняет изображение капчи
@param  captcha_file          Название файла капчи
@return 1                     Сохранено успешно
        -1                    Ошибка при выполнении
*/
function SaveCaptchaAddMeFast (captcha_file) {
  var result = 0;
  
  var macro = "CODE:SET !EXTRACT_TEST_POPUP NO"+"\n";
  macro += "ONDOWNLOAD FOLDER=* FILE=" + captcha_file +"\n";
  macro += "TAG POS=1 TYPE=IMG ATTR=ID:recaptcha_challenge_image CONTENT=EVENT:SAVEITEM" + "\n";
  iimPlay(macro);
  
  return (result);
}

//------------//Завершение - Регистрация AddmefastReg//--------------

//--------------------//Функции beatstars.com//----------------------

/**
@class  beatstars
@brief  Ищет аккаунт в списке
@param  p_username              Имя аккаунта
        p_maxdeepsearch         Количество просматриваемых аккаунтов
          -1                    Просматривает до тех пор, пока не 
                                  найдет
@return result                  Номер найденного аккаунта
          -1                    Номер не найден (при ограничении поиска)
*/
function FindAccount(p_username, p_maxdeepsearch) {
  var result = 1;
  
  var extract_name = "";
  var current_number = 0;
  
  var account_no_match = true;
  
  do {
    current_number++;
    
    iimPlayCode ("TAG XPATH=\"\//*[@id=\"fans-stream\"]/li[" + current_number + "]/a[2]\" EXTRACT=TXT");
    //while (iimPlayCode ("TAG XPATH=\"\//*[@id=\"fans-stream\"]/li[" + current_number + "]/a[2]\" EXTRACT=TXT") != 1) {
      //https://www.beatstars.com/beatstars/fans/?_rt=p&target=fans-stream&page=0
    //}
    
    extract_name = iimGetExtract ();
    
    if (!!(extract_name.match(RegExp(p_username, "")))) {
      account_no_match = false;
    }
  } while (account_no_match && ((current_number < p_maxdeepsearch) || (p_maxdeepsearch==-1)) );
  
  if (p_maxdeepsearch > 0) {
    if (current_number > p_maxdeepsearch) {
      result = -1;
    }
    else {
      result = current_number;
    }
  }
  else {
    result = current_number;
  }
  
  return (result);
}

/**
@class  beatstars
@brief  Ищет аккаунт в списке
@param  p_username              Имя аккаунта
        p_maxdeepsearch         Количество просматриваемых аккаунтов
          -1                    Просматривает до тех пор, пока не 
                                  найдет
@return result                  Номер найденного аккаунта
          -1                    Номер не найден (при ограничении поиска)
*/
function FindAccount_v2(p_username, p_maxdeepsearch) {
  var result = 1;
  
  var extract_name = "";
  
  //current_num_on_page+current_page = number in list
  var current_num_on_page = 0;
  var current_page = 0;
  var current_account_number = current_num_on_page + current_page;
  
  var account_no_match = true;
  
  var error_code = 1;
  
  var current_url = GetCurrentURL ();
  
  //GoPage(current_url + current_page);
  //https://www.beatstars.com/beatstars/fans/
  //https://www.beatstars.com/beatstars/fans/?target=fans-stream&page=0
  
  do {
    current_num_on_page++;
    do {
      iimPlayCode ("SET !TIMEOUT_STEP 1\nTAG XPATH=\"\//li[" + current_num_on_page + "]/a[2]\" EXTRACT=TXT");
      extract_name = iimGetExtract ();
      
      if (extract_name == "#EANF#") {
        current_page = current_page + current_num_on_page - 1;
        GoPage(current_url + current_page);
        current_num_on_page = 1;
      }
    } while (extract_name == "#EANF#");
    
    if (!!(extract_name.match(RegExp(p_username, "")))) {
      account_no_match = false;
    }
  } while (account_no_match && ((current_num_on_page < p_maxdeepsearch) || (p_maxdeepsearch==-1)) );
  
  current_account_number = current_num_on_page + current_page;
  
  if (p_maxdeepsearch > 0) {
    if (current_account_number > p_maxdeepsearch) {
      result = -1;
    }
    else {
      result = current_account_number;
    }
  }
  else {
    result = current_account_number;
  }
  
  return (result);
}

/**
@class  beatstars
@brief  Фолловинг по списку
@param  page_adress             Имя аккаунта
        max_num_follow          Количество просматриваемых аккаунтов
          -1                    Осуществляет инвайтинг до остановки 
                                  скрипта
        pause_follow            Пауза между подписками
        pause_follow_set,opt    Пауза между группами подписок
        set_length,opt          Количество подписок в группе
@return 1                       Успешно выполнено
        -1                      Ошибка при выполнении
*/
function FollowList (page_adress, start_account, max_num_follow, pause_follow) {
  var result = 1;
  
  var current_count_follows = 0;
  var acc_num_on_list = 0;
  var current_page = start_account;
  var extract_link = "";
  
  pause_follow = RandomDeviation (pause_follow, 20);
  
  GoPage(page_adress + start_account);
  
  if (max_num_follow < 1) {
    while (1) {
      acc_num_on_list++;
      iimPlayCode ("SET !TIMEOUT_STEP 1\nTAG XPATH=\"\//li[" + acc_num_on_list + "]/a[2]\" EXTRACT=HREF");
      extract_link = iimGetExtract ();
      if (extract_link == "#EANF#") {
        current_page += acc_num_on_list - 1;
        GoPage(page_adress + current_page);
        acc_num_on_list = 1;
        continue;
      }
      Follow(extract_link);
      Delay (pause_follow);
    }
  }
  return (result);
}

/**
@class  beatstars
@brief  Функция проверяет, есть ли подписка на аккаунт
@param  p_url                Ссылка на аккаунт
@return 1                       Подписка реализована
        2                       Подписано ранее
        -2                      Ошибка при выполнении
*/
function Follow(p_url)
{
  var result = 1;
  
  var macros = "CODE:SET !EXTRACT_TEST_POPUP NO" + "\n";
  macros += "TAB OPEN" + "\n";
  macros += "TAB T=2" + "\n";
  macros += "URL GOTO=" + p_url + "\n";
  iimPlay (macros);
  
  iimPlayCode ("SET !TIMEOUT_STEP 1\nTAG XPATH=\"\//a[@data-following=\'0\']\"");
  
  iimPlayCode("TAB CLOSE");
  
  return (result);
}

/**
@class  beatstars
@brief  Функция проверяет, есть ли подписка на аккаунт
@param  -
@return 1                       Подписка на аккаунт есть
        -1                      Нет подписки на аккаунт
        -2                      Ошибка при выполнении
*/
function FollowTester() 
{
  var result = 1;
  
  var extract_txt = "";
  
  iimPlayCode ("SET !TIMEOUT_STEP 1\nTAG XPATH=\"\//a[@data-following=\'0\']\" EXTRACT=TXT");
  extract_txt = iimGetExtract ();
  
  for (var i = 0; i < 2; i++) {
    iimPlayCode ("SET !TIMEOUT_STEP 1\nTAG XPATH=\"\//a[@data-following=\'" + i + "\']\" EXTRACT=TXT");
    extract_txt = iimGetExtract ();
    if (extract_txt != "#EANF#") {
      result = i;
    }
  }
  
  if (result==0) {
    result = -1;
  }
  
  return (result);
}

//-------------//Завершение - функции beatstars.com//----------------

//---------------//Yotube вспомогательные функции//------------------
/*
В поиске:
блок каждого элемента (канала, видео)
//*[@id="item-section-501577"]/li[1]/div
//*[@id="item-section-501577"]/li[2]/div
//*[@id="item-section-501577"]/li[20]/div

Название видео
//*[@id="item-section-501577"]/li[1]/div/div/div[2]/h3/a
//*[@id="item-section-501577"]/li[2]/div/div/div[2]/h3/a

Канал
//*[@id="item-section-501577"]/li[1]/div/div/div[2]/div[1]/a
//*[@id="item-section-501577"]/li[2]/div/div/div[2]/div[1]/a
*/
/**
@class CAP
@brief Переходит на Youtube и осуществляет поиск.
@param      request       Запрос в поиске на Youtube.
            filter_type   тип фильтра
              videos
              channels
              playlists
@return     0             Ошибка при выполнении.
            1             Выполнено успешно.
*/
function SearchInYoutube (request, filter_type) {
  var result = 1;
  var macros = "CODE:SET !EXTRACT_TEST_POPUP NO"+"\n";
  macros += "URL GOTO=https://www.youtube.com/" +"\n";
  
  macros += "TAG POS=1 TYPE=INPUT:TEXT FORM=ID:masthead-search ATTR=ID:masthead-search-term CONTENT=" + request + "\n";
  macros += "TAG POS=1 TYPE=BUTTON FORM=ID:masthead-search ATTR=ID:search-btn" + "\n";
  iimPlay (macros);
  
  return (result);
}

/**
@class CAP
@brief Находит нужное видео в поиске.
@param      type_ver        Тип верификации.
              VIDEO_NAME    По названию видео
              CH_NAME       По названию канала
            word            Искомая фраза в названии видео или канала.
@return     result          Порядковый номер видео в поиске.
            0               Ошибка при выполнении.
            
*/
function VerifyVideoInSearchYoutube (type_ver, word) {
  const type_ver_val = ["VIDEO_NAME", "CH_NAME"];
  var result = 0;
  var macros = "CODE:SET !EXTRACT_TEST_POPUP NO"+"\n";
  macros += "" +"\n";
  
  switch (type_ver) {
    case "VIDEO_NAME":
      
    break;
    case "CH_NAME":
    default:
      
    break;
  }
  
  iimPlay (macros);
  
  return (result);
}

/**
@class CAP
@brief Функция возвращает данные о видео в списке поиска Youtube.
@param    list_num        Порядковый номер видео в поиске
@return   result.title    Название видео
            .channel      Название канала 
*/
function GetDataVideoInSearchYoutube (list_num) {
  var xpath = "XPATH=\"\//";
  var result = {
    title: "",
    channel: ""
  };
  
  TagText(p_xpath, "TXT");
  
  return (result);
}

/**
@class CAP
@brief Запускает плейлист со всеми видео.
@param      -
@return     0       Ошибка при выполнении.
            1       Выполнено успешно.
*/
function Playlist () {
  var result = 1;
  
  return (result);
}

/**
@class CAP
@brief Запускает видео с определенным порядковым номером в списке.
@param    video_num   Номер видео в списке.
@return     0         Ошибка при выполнении.
            1         Выполнено успешно.
*/
function PlayVideo (video_num) {
  var result = 1;
  
  //var xpath = "XPATH = \"\//*[class~=\"feed-item-container yt-section-hover-container browse-list-item-container branded-page-box vve-check\"]/li[1]/div/div[1]/div[2]/h3/a\"";
  var xpath = "XPATH = \"\//*[@id=\"browse-items-primary\"]//li["+ video_num + "]/div/div[1]/div[2]/h3/a\"";
  
  if (!AllVideos()){
    return (0);
  }
  
  var macros = "CODE:SET !EXTRACT_TEST_POPUP NO"+"\n";
  macros += "SET !ERRORIGNORE YES"+"\n";
  macros += "TAG " + xpath + "\n";
  
  iimPlay (macros);
  
  return (result);
}

/**
@class CAP
@brief Переходит на страницу Все видео
@param      -
@return     0       Ошибка при выполнении.
            1       Выполнено успешно.
*/
function AllVideos () {
  var result = 1;
  
  var macros = "CODE:SET !EXTRACT_TEST_POPUP NO"+"\n";
  //macros += "SET !ERRORIGNORE YES"+"\n";
  var loc_current_url = GetCurrentURL ();
  if (!(WordInText ("videos", loc_current_url))) {
    macros += "TAG POS=2 TYPE=SPAN ATTR=TXT:Все видео"+"\n";
    //Иногда не работает с этой строкой
    macros += "DELAY SECONDS=1" +"\n";
  }
  iimPlay (macros);
  
  return (result);
}

//---------//Завершение - Yotube вспомогательные функции//-----------

//---------------------//Telegram Bot API JS//-----------------------
/**
Модуль Telegram Bot API JS предназначен для ведения разрешенных в 
Телеграмме ботов с авторизацией по токену.

Все запросы к Telegram Bot API должны осуществляться через HTTPS в 
следующем виде: https://api.telegram.org/bot<token>/НАЗВАНИЕ_МЕТОДА. 
Например:

https://api.telegram.org/bot123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11/getMe

https://tlgrm.ru/docs/bots/api#update
Этот объект представляет из себя входящее обновление. Под обновлением 
подразумевается действие, совершённое с ботом — например, получение 
сообщения от пользователя.
*/

/**
@class	Telegram Bot API
@brief	Прототип модуля TelegramBot
@param	pToken						Токен для авторизации бота
@return	Объект
*/
var TelegramBot = function (pToken) {
	this.token = pToken;
	this.Update = {};
  this.lastChecked = 0;
	this.currentTries = 0;
	this.maxTries = 6;
	this.status = 0;
	this.statusList = {
		ok: 0,
		triesOut: 1,
		errorNoOK: 2,
	};
}

/**
@class	Telegram Bot API
@brief	Сбрасывает статус модуля. Используется для инициализации.
@param	-
@return	-
*/
TelegramBot.prototype.resetStatus = function () {
  var messagLength = 0;

	this.status = 0;
  this.Update = this.getUpdatesAPI();
  messagLength = this.Update.result.length;

  if (messagLength > 0) {
  	this.lastChecked = this.Update.result[messagLength - 1].update_id;
  }
  else {
  	this.lastChecked = 0;
  }
}

/**
@class	Telegram Bot API
@brief	Возвращает данные о боте
https://api.telegram.org/bot123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11/getMe
{"ok":true,"result":{"id":254434798,"first_name":"Dginozator","username":"DginnBot"}}
@param	-
@return	данные в формате JSON
					-1 							Ошибка при выполнении
*/
TelegramBot.prototype.getMe = function () {
	var lParse = true;
	var result = 1;
	var lHttp = "https://api.telegram.org/bot" + this.token + "/getMe";
	result = JSON_tab_v3 (lHttp, lParse, this.maxTries);
	if (result.ok != true) {
		this.status = this.statusList.errorNoOK;
	}
	else {
		this.status = this.statusList.ok;
	}
	return (result);
}

/**
@class	Telegram Bot API
@brief	Отправляет запрос новых сообщений и получает ответ.
https://api.telegram.org/bot254434798:AAGSbHl-TBPN3YdVqW_sqWYyX7IttvRR8NE/getUpdates
{	"ok":true,
	"result":
	[
		{
			"update_id":393632542,
			"message":
			{
				"message_id":3,
				"from":
				{
					"id":302745567,
					"first_name":"Niko",
					"last_name":"Vasiliev",
					"username":"Niko477"
				},
				"chat":
				{
					"id":302745567,
					"first_name":"Niko",
					"last_name":"Vasiliev",
					"username":"Niko477",
					"type":"private"
				},
				"date":1481943978,
				"text":"/start",
				"entities":
				[
					{
						"type":"bot_command",
						"offset":0,
						"length":6
					}
				]
			}
		},
		{
			"update_id":393632543,
			"message":
			{
				"message_id":4,
				"from":
				{
					"id":302745567,
					"first_name":"Niko",
					"last_name":"Vasiliev",
					"username":"Niko477"
				},
				"chat":
				{
					"id":302745567,
					"first_name":"Niko",
					"last_name":"Vasiliev",
					"username":"Niko477",
					"type":"private"
				},
				"date":1481944139,
				"text":"\u0427\u0442\u043e \u0442\u0430\u043a\u043e\u0435 CRM?"
			}
		}
	]
}
@param	
@return	
*/
TelegramBot.prototype.getUpdatesAPI = function () {
	var lParse = true;
	var result = 1;
	var lHttp = "https://api.telegram.org/bot" + this.token + "/getUpdates";
	result = JSON_tab_v3 (lHttp, lParse, this.maxTries);
	if (result.ok != true) {
		this.status = this.statusList.errorNoOK;
	}
	else {
		this.status = this.statusList.ok;
    this.Update = result;
	}
	return (result);
}

/**
@class	Telegram Bot API
@brief	Отправляет сообщение
https://api.telegram.org/bot254434798:AAGSbHl-TBPN3YdVqW_sqWYyX7IttvRR8NE/sendMessage?chat_id=302745567&text=Hi
{
	"ok":true,
	"result":
	{
		"message_id":5,
		"from":
		{
			"id":254434798,
			"first_name":"Dginozator",
			"username":"DginnBot"
		},
		"chat":
		{
			"id":302745567,
			"first_name":"Niko",
			"last_name":"Vasiliev",
			"username":"Niko477",
			"type":"private"
		},
		"date":1481944790,
		"text":"Hi"
	}
}
@param	pChatID            Идентификатор чата
        pText              Текст сообщения
@return	
*/
TelegramBot.prototype.sendMessageAPI = function (pChatID, pText) {
	var lParse = true;
	var result = 1;
	var lHttp = "https://api.telegram.org/bot" + this.token + "/sendMessage?chat_id=" + pChatID + "&text=" + encodeURIComponent (pText);
	result = JSON_tab_v3 (lHttp, lParse, this.maxTries);
	if (result.ok != true) {
		this.status = this.statusList.errorNoOK;
	}
	else {
		this.status = this.statusList.ok;
	}
	return (result);
}

/**
@class  Telegram Bot API
@brief  Определяет индекс самого раннего непрочитанного сообщения
@param  -
@return Индекс самого раннего непрочитанного сообщения в массиве this.Update.result
        -1              Нет новых сообщений
*/
TelegramBot.prototype.earliestUnread = function () {
  var length = this.Update.result.length;
  var earliest = length - 1;
  if (length > 0) {
    if (this.Update.result[earliest].update_id > this.lastChecked) {
      for (earliest = (length - 1); earliest > -1; earliest--) {

        if (!(this.Update.result[earliest].update_id > this.lastChecked)) {
          break;
        }
      }
      earliest++;
    }
    else {
      earliest = -1;
    }
  }
  return (earliest);
}

/**
@class  Telegram Bot API
@brief  Возвращает все непрочитанные сообщения в массиве
@param  -
@return  Массив непрочитанных сообщений
          [] пустой массив, если непрочитанных сообщений нет
*/
TelegramBot.prototype.unreadMessagesArray = function () {
  var result = [];
  var earliestNum = this.earliestUnread();
  if (earliestNum !== -1) {
    for (; earliestNum < this.Update.result.length; earliestNum++) {
      result.push (this.Update.result[earliestNum]);
    }
  }
  else {
    //
  }
  return (result);
}

//--------------//Завершение - Telegram Bot API JS//-----------------

//--------------------------//Wikipedia//----------------------------

/**
@class  Wiki
@brief  Получает ответ с Wiki через поисковую систему Yandex
@param  pQuestion         Вопрос (без знака вопроса)
@return  Ответ с вики
          -1              Ошибка при выполнении
*/
function wikiAnswer (pQuestion) {
  var result = 1;
  var searchResultPos = 1;
  var loc_macros = "CODE:SET !EXTRACT_TEST_POPUP NO" + "\n";
  loc_macros += "TAB OPEN" + "\n";
  loc_macros += "TAB T=2" + "\n";
  loc_macros += "URL GOTO=\"https://yandex.ru\"\n";
  loc_macros += KeyboardEmul (pQuestion + " site:wikipedia.org", "XPATH=\//input[@id='text']");
  loc_macros += "TAG XPATH = \"\//div[@class='search2__button']/descendant::button\"" + "\n";
  iimPlay (loc_macros);

  for (searchResultPos = 1; searchResultPos < 10; searchResultPos++) {
		if (iimPlayCode ("SET !TIMEOUT_STEP 1\nTAG XPATH=\"//ul[@role='main']/descendant::li[contains (@class,'serp-item')][" + searchResultPos + "]/self::*[contains (@class, 'serp-adv-item')]\"") !== 1) {
			break;
		}
  }

  loc_macros = "CODE:SET !EXTRACT_TEST_POPUP NO" + "\n";
  iimPlayCode("TAG XPATH = \"//ul[@role='main']/descendant::li[contains (@class,'serp-item')][" + searchResultPos + "]/descendant::h2/a\"\nTAB T=2");

  result = getFromWiki ();

  iimPlayCode("TAB CLOSE");
  iimPlayCode("TAB CLOSE");

  return (result);
}

/**
@class  Wiki
@brief  Копирует первый абзац со страницы Вики
@param  -
@return  Краткая информация с Вики
          -1                Ошибка при получении текста абзаца
*/
function getFromWiki () {
  var result = 1;
  
  loc_macros = "CODE:SET !EXTRACT_TEST_POPUP NO" + "\n";

  //если есть таблица
  if (iimPlayCode("SET !TIMEOUT_STEP 1\nTAG XPATH = \"//*[@id='mw-content-text']/descendant::table[contains(@class, 'infobox')]\"") === 1) {
    loc_macros += "TAG XPATH = \"//*[@id='mw-content-text']/descendant::table[1]/following-sibling::p[1]\" EXTRACT=TXT" + "\n";
  }
  //таблицы нет
  else {
    loc_macros += "TAG XPATH=\"//div[@id='mw-content-text']/descendant::p[1]\" EXTRACT=TXT" + "\n";
  }
  iimPlay (loc_macros);

  result = iimGetExtract();

  if (result == "#EANF#") {
    result = -1;
  }
  else {
    result = result.replace (/\[\d+\]/g, "");
  }

  return (result);
}

//-------------------//Завершение - Wikipedia//----------------------

//----------------------//Seosprint функции//------------------------

/**
@class  seosprint
@brief  Регистрация аккаунта.
@param  p_email             Электронная почта
        p_name              Имя
        p_sms_module        Модуль смс
        p_rucaptcha         Ключ сервиса Rucaptcha
@return {
          status: 1,        //-1 ошибка при выполнении
                            //1 - успешно выполнено
          pass: "",         //Пароль
          phone: "",        //Номер телефона
          pin: ""           //Пин-код
        }
*/
function reg_Seosprint (p_email, p_name, p_sms_module, p_rucaptcha) {
  var errors = [];
  errors["bad_captcha"] = -1;
  errors["error_sms"] = -2;
  var result = {
    status: 1,
    pass: "pass",
    phone: "phone",
    pin: "pin"
  };
  var l_captcha = "";
  var path_captcha = getiMacrosFolder("Downloads");
  var l_sms_module = 0;
  var sms_text = "";
  var a_sms = [];

  var loc_macros = "";
  
  do {
    loc_macros = "CODE:SET !EXTRACT_TEST_POPUP NO" + "\n";
    loc_macros += "URL GOTO=http://www.seosprint.net/index.php" + "\n";
    loc_macros += "TAG XPATH=\"//span[@class='btnreg']\"" + "\n";
    iimPlay (loc_macros);

    Delay (5);

    // прочитать капчу
    saveCap_v2 ("TAG POS=1 TYPE=IMG ATTR=ID:siimage");
    l_captcha = ReadCaptcha_v2(p_rucaptcha, path_captcha + "\\" + CAP_IMG);

    if (l_captcha === -1) {
      result.status = errors["bad_captcha"];
      return (result);
    }

    // Получить номер
    if (l_sms_module === 0) {
      l_sms_module = p_sms_module.GetNumber();
      while ((+l_sms_module.number) < 256) {
        l_sms_module = p_sms_module.GetNumber();
        Delay(10);
      }
    }

    loc_macros = "CODE:SET !EXTRACT_TEST_POPUP NO" + "\n";
    loc_macros += "TAG POS=1 TYPE=INPUT:TEXT FORM=NAME:postreg ATTR=ID:log_name CONTENT=" + p_name + "\n";
    loc_macros += "TAG POS=1 TYPE=INPUT:TEXT FORM=NAME:postreg ATTR=ID:log_email CONTENT=" + p_email + "\n";
    loc_macros += "TAG POS=1 TYPE=INPUT:TEXT FORM=NAME:postreg ATTR=ID:log_phone CONTENT=" + l_sms_module.number + "\n";
    loc_macros += "TAG POS=1 TYPE=INPUT:TEXT FORM=NAME:postreg ATTR=ID:log_code CONTENT=" + l_captcha + "\n";
    iimPlay (loc_macros);

    iimPlayCode ("TAG POS=1 TYPE=SELECT FORM=NAME:postreg ATTR=ID:log_country CONTENT=%RU");

    iimPlayCode("TAG XPATH=\"//span[@class='button-green-big']\"");
  
    
    Delay(10);
  } while (!(XPATH_Here ("XPATH=\"//form[@name='postregnext']\"")));

  testSeosprint ();
  p_sms_module.waitCommand ();
  sms_text = p_sms_module.GetSMS();
  result.phone = l_sms_module.number;
  if ((+sms_text) < 0) {
    result.status = errors["error_sms"];
  }
  else {
    //divide sms text on pass and pin
    //6ZS6kjHkRE;21387
    a_sms = sms_text.split(";");
    if (a_sms.length > 1) {
      result.pass = a_sms[0];
      result.pin = a_sms[1];
    }
  }

  return (result);
}

/**
@class  seosprint
@brief  Проходит начальный тест Seosprint
@param  -
@return -
*/
function testSeosprint () {
  var result = 1;
  var delay_period_s = 3;
  var delay_rand = function () {
    return (RandomDeviation (delay_period_s, 50));
  };

  var loc_macros = "CODE:SET !EXTRACT_TEST_POPUP NO" + "\n";
  loc_macros += "TAG POS=2 TYPE=INPUT:RADIO FORM=NAME:postregnext ATTR=NAME:ans1" + "\n";
  loc_macros += "WAIT SECONDS=" + delay_rand() + "\n";
  loc_macros += "TAG POS=2 TYPE=INPUT:RADIO FORM=NAME:postregnext ATTR=NAME:ans2" + "\n";

  loc_macros += "WAIT SECONDS=" + delay_rand() + "\n";
  loc_macros += "TAG POS=1 TYPE=INPUT:RADIO FORM=NAME:postregnext ATTR=NAME:ans3" + "\n";

  loc_macros += "WAIT SECONDS=" + delay_rand() + "\n";
  loc_macros += "TAG POS=2 TYPE=INPUT:RADIO FORM=NAME:postregnext ATTR=NAME:ans4" + "\n";

  loc_macros += "WAIT SECONDS=" + delay_rand() + "\n";
  loc_macros += "TAG POS=2 TYPE=INPUT:RADIO FORM=NAME:postregnext ATTR=NAME:ans6" + "\n";

  loc_macros += "WAIT SECONDS=" + delay_rand() + "\n";
  loc_macros += "TAG POS=2 TYPE=INPUT:RADIO FORM=NAME:postregnext ATTR=NAME:ans7" + "\n";
  
  loc_macros += "WAIT SECONDS=" + delay_rand() + "\n";
  loc_macros += "TAG POS=1 TYPE=SPAN ATTR=TXT:Зарегистрироваться!" + "\n";
  iimPlay (loc_macros);

  Delay (5);
  
  return (result);
}

/**
@class  seosprint
@brief  Тестовая функция. Изменяет параметр аргумента.
@param  p_changed           Изменяемый параметр (объект)
        p_simple            Изменяемый параметр (обычный тип)
@return 1                   Успешно выполнено
*/
function seosprint_test (p_changed, p_simple) {
  var result = 1;
  
  p_changed.check = 1;
  p_simple = 4;

  return (result);
}

/**
@class  seosprint
@brief  Seosprint login actions
@param  p_login             Seosprint login
        p_pass              Seosprint password
        p_rucaptcha_module  rucaptcha module for recaptcha recognizing
@return  
*/
function LoginSeosprint (p_login, p_pass, p_rucaptcha_module) {
  var result = 1;
  var iim_status = -1;
  
  iimPlayCode ("URL GOTO=http://www.seosprint.net/");

  var loc_macros = "CODE:SET !EXTRACT_TEST_POPUP NO" + "\n";
  loc_macros += "SET !TIMEOUT_STEP 1" + "\n";
  loc_macros += "TAG XPATH=\"\//span[@class='btnlogin']\"" + "\n";
  iim_status = iimPlay (loc_macros);

  if (iim_status === 1) {
    loc_macros = "CODE:SET !EXTRACT_TEST_POPUP NO" + "\n";
    loc_macros += "WAIT SECONDS = " + getRandom(2,4) + "\n";

    loc_macros += "TAG XPATH=\"\/descendant::input[@type='text'][1]\" CONTENT=" + p_login + "\n";
    loc_macros += "TAG XPATH=\"\//input[@type='password']\" CONTENT=" + p_pass + "\n";
    iimPlay (loc_macros);
  }

  if (!!p_rucaptcha_module) {
    p_rucaptcha_module.streamGo ();
  }

  return (result);
}

/**
@class  seosprint
@brief  fillProfile
@param  
@return 1                   Success
        -1                  Error
*/
function fillProfile (p_ya_m) {
  var result = 1;
  var passer_xpath = "XPATH=\"\//descendant::a[contains(., 'Прохожий')]/parent::*\"";
  var profile_xpath = "XPATH=\"\//descendant::a[contains(., 'Прохожий')]\"";

  if (XPATH_Here(passer_xpath)) {
    if (GetCurrentURL() !== "http://www.seosprint.net/profile.php") {
      XPATH_Here(profile_xpath);
    }
    toJournal("for test 1533 ya num:" + p_ya_m);

    iimPlayCode ("TAG POS=1 TYPE=SELECT FORM=NAME:personal ATTR=NAME:ask_proff CONTENT=%" + getRandom (3, 6));
    Delay(getRandom (1, 4));
    iimPlayCode ("TAG POS=1 TYPE=SELECT FORM=NAME:personal ATTR=NAME:ask_family CONTENT=%" + getRandom (1, 6));
    Delay(getRandom (1, 4));
    iimPlayCode ("TAG POS=1 TYPE=SELECT FORM=NAME:personal ATTR=NAME:ask_sex CONTENT=%" + getRandom (1, 1));
    Delay(getRandom (1, 4));
    iimPlayCode ("TAG POS=1 TYPE=SELECT FORM=NAME:personal ATTR=NAME:ask_bday CONTENT=%" + getRandom (1984, 1996));
    Delay(getRandom (1, 4));
    iimPlayCode ("TAG POS=1 TYPE=INPUT:TEXT FORM=NAME:personal ATTR=NAME:ask_yandex CONTENT=" + p_ya_m);
    Delay(getRandom (1, 4));
    inputPIN ("38266");
  }
  
  return (result);
}

/**
@class  seosprint
@brief  Input pincode
@param  p_val               Pincode
@return 1                   Success
        -1                  Error
*/
function inputPIN (p_val) {
  var result = 1;
  var pinblock = "XPATH=\"\//descendant::div[@id='pinblock']\"";
  p_val = String(p_val);
  var string_len = p_val.length;
  var loc_macro = "TAG XPATH=\"\//descendant::div[@id='pinblock']/descendant::span[contains(@class,'btnpinclear')]\"" + "\n";
  loc_macro += "WAIT SECONDS=1" + "\n";

  if (XPATH_Here(pinblock)) {
    toJournal("for test 1326: pinblock here");
    for (var i = 0; i < string_len; i++) {
      toJournal("for test 1344: " + p_val[i]);
      loc_macro += "TAG XPATH=\"\//descendant::div[@id='pinblock']/descendant::span[contains(.,'" + p_val[i] + "')]\"" + "\n";
      loc_macro += "WAIT SECONDS=1" + "\n";
    }
    iimPlayCode(loc_macro);
  }

  iimPlayCode("TAG XPATH=\"//span[@class='button-green-big']\"");
  
  return (result);
}

/**
@class  seosprint
@brief  Go to task page.
@param  p_tasknum           Task number
@return  1                  Success
          -1                Error
*/
function ToTaskPage (p_tasknum) {
  var result = 1;
  var empty_list = false;

  if (isNaN (+p_tasknum)) {
    result = -1;
  }
  
  if (result !== -1) {
    var loc_macros = "CODE:SET !EXTRACT_TEST_POPUP NO" + "\n";
    loc_macros += "URL GOTO=http://www.seosprint.net/index.php" + "\n";
    loc_macros += "TAG XPATH=\"\//a[@href='/work-task.php']\"" + "\n";
    loc_macros += "TAG XPATH=\"\//span[@id='tsk_mnu3']\"" + "\n";
    loc_macros += "TAG XPATH=\"\//input[@name='tasknum']\" CONTENT=" + p_tasknum + "\n";
    loc_macros += "WAIT SECONDS=1" + "\n";
    loc_macros += "TAG XPATH=\"\//div[@id='tsk_mnu_block3']/input[@class='btnsearch']\"" + "\n";

    iimPlay (loc_macros);
  }

  empty_list = XPATH_Here ("XPATH = \"\//span[@class='advertise-empty']\"", 1);

  if (empty_list) {
    result = -1;
  }
  else {
    //go
    iimPlayCode("TAG XPATH=\"\//table[@class='work-serf']/descendant::tr[1]/descendant::a[contains(@href, 'work-task-read.php')]\"");
  }

  return (result);
}

/**
@class  seosprint
@brief  Check task status
@param  -
@return  1                  Task is executable
        -1                  Task is not executable
*/
function IsExecutableTask () {
  var result = 1;

  if (XPATH_Here("XPATH=\"\//form[@action='/gotask.php']\"")) {
    // result = 1;
  }
  else {
    if (XPATH_Here("XPATH=\"\//form[@name='taskreportform']\"")) {
      // result = 1;
    }
    else {
      result = -1;
    }
  }

  return (result);
}

/**
@class  seosprint
@brief  Start task.
@param  -
@return  1                  Success
        -1                  Error
*/
function DoTask () {
  var result = 1;

  var loc_macros = "CODE:SET !EXTRACT_TEST_POPUP NO" + "\n";
  loc_macros += "SET !TIMEOUT_STEP 1" + "\n";
  loc_macros += "EVENT TYPE=CLICK XPATH=\"\//span[contains(@onclick, 'gotask')]\" BUTTON=0" + "\n";

  var iim_code = iimPlay (loc_macros);
  
  return (result);
}

/**
@class  seosprint
@brief  Выполняет кликовые задания
@param  p_task_data         Элемент из массива задач, из серверного ответа

{
"id_task":"1454655",
"type_task":"clicks",
"url_task":"http:",
"reusable_task_flag":"0",
"answer_task":"",
"additional_task":"{\"search_queries\":[\"\"],\"search_engine\":[\"ya\"],\"search_url\":[\"https:\/\/yandex.ru\/search\/?lr=10335&msid=1489911834.00606.20939.24381&text=%D0%B2%D1%8B%D0%BF%D1%83%D1%81%D0%BA%D0%BD%D0%BE%D0%B5+%D1%81%D0%BE%D1%87%D0%B8%D0%BD%D0%B5%D0%BD%D0%B8%D0%B5\",\"https:\/\/yandex.ru\/search\/?text=%D1%81%D0%BE%D1%87%D0%B8%D0%BD%D0%B5%D0%BD%D0%B8%D0%B5%20%D0%B5%D0%B3%D1%8D%202017%20%D1%80%D1%83%D1%81%D1%81%D0%BA%D0%B8%D0%B9%20%D1%8F%D0%B7%D1%8B%D0%BA%20%D0%BA%D0%BB%D0%B8%D1%88%D0%B5&lr=10335\",\"https:\/\/yandex.ru\/search\/?text=%D0%BE%D1%82%D0%B2%D0%B5%D1%82%D1%8B%20%D1%86%D1%8B%D0%B1%D1%83%D0%BB%D1%8C%D0%BA%D0%BE%202017&lr=10335\"],\"site_domain\":\"vopvet.ru\",\"min_clicks\":\"2\",\"max_clicks\":\"3\",\"min_ads_clicks\":\"1\",\"max_ads_clicks\":\"2\",\"ads_url\":[\"https:\/\/www.vemzu.cz\/?gclid=CMWIvPmS4tICFU_PsgodCj4BgA\"],\"ip_flag\":0}"}

@return  report
В отчет по кликовому заданию может входить:
-Запрос(ы)
массив p_task_data.additional_task.search_queries
Если массив search_queries пустой - заполнить из массива p_task_data.additional_task.search_url
-Ссылки на запрос(ы)
массив p_task_data.additional_task.search_url
-Ссылки с рекламы
От функции walker
-Ссылки с сайта
От функции walker

-Айпи
-Ответ на вопрос к заданию(2+2 мб проверка от ботов)
*/
DoClicks_c = function (p_task_data) {
  this.task_data = p_task_data;
  this.result = {
    status: 1,
    text: ''
  };
  this.walker_report = {
    site: [],
    ad: [],
    status: 1
  };
  this.walker_report_txt = "";
  this.search = {
    query: "",
    url: ""
  }

  this.search_mode = this.C_SEARCH_MODE.SEARCH_URL;

  var valid_res = this.validate(p_task_data);

  if (valid_res.status === -1) {
    this.result = this.C_RESULT.NOT_VALID_INPUT_PROP;
    this.result.text = this.result.text + ": " + valid_res.text;
  }
}

//error codes
DoClicks_c.prototype.C_RESULT = {
  //SUCCESS:{status: 1, text: "Success"},
  INPUT_WRONG_STRUCT: {status: -1, text: "Wrong input format"},
  NO_DOMAIN:{status: -2, text: "Domain is absent"},
  NO_ADS_URL:{status: -3, text: "Incorrect ads URL"},
  EMPTY_QUERIES:{status: -4, text: "Empty queries"},
  NOT_VALID_INPUT_PROP: {status: -5, text: "Not valid input"}
};

//search modes
DoClicks_c.prototype.C_SEARCH_MODE = {
  SEARCH_URL: 0,
  SEARCH_QUERIES: 1,
  NO_SEARCH: 2
}

//common parameters
DoClicks_c.prototype.common = {
  data_example: {
    "id_task":"1454655",
    "type_task":"clicks",
    "url_task":"http:",
    "reusable_task_flag":"0",
    "answer_task":"",
    "additional_task": {
      "search_queries":[""],
      "search_engine":["ya"],
      "search_url":["https://yandex.ru/search/?lr=10335&msid=1489911834.00606.20939.24381&text=%D0%B2%D1%8B%D0%BF%D1%83%D1%81%D0%BA%D0%BD%D0%BE%D0%B5+%D1%81%D0%BE%D1%87%D0%B8%D0%BD%D0%B5%D0%BD%D0%B8%D0%B5","https://yandex.ru/search/?text=%D1%81%D0%BE%D1%87%D0%B8%D0%BD%D0%B5%D0%BD%D0%B8%D0%B5%20%D0%B5%D0%B3%D1%8D%202017%20%D1%80%D1%83%D1%81%D1%81%D0%BA%D0%B8%D0%B9%20%D1%8F%D0%B7%D1%8B%D0%BA%20%D0%BA%D0%BB%D0%B8%D1%88%D0%B5&lr=10335","https://yandex.ru/search/?text=%D0%BE%D1%82%D0%B2%D0%B5%D1%82%D1%8B%20%D1%86%D1%8B%D0%B1%D1%83%D0%BB%D1%8C%D0%BA%D0%BE%202017&lr=10335"],
      "site_domain":"vopvet.ru",
      "min_clicks":"2",
      "max_clicks":"3",
      "min_ads_clicks":"1",
      "max_ads_clicks":"2",
      "ads_url":["https://www.vemzu.cz/?gclid=CMWIvPmS4tICFU_PsgodCj4BgA"],
      "ip_flag":0}}
};

/**
@class  seosprint
@brief  Validate server answer element
@param  -
@return {
          status
            1               valid object
            -1              not valid
          text
            this            Not valid property
        }                 Error
*/
DoClicks_c.prototype.validate = function () {
  return (validate_data(this.common.data_example, this.task_data));
}

/**
@class  seosprint
@brief  Doing site walk
@param  -
@return this.result
          status            In order to constants result
            1               Success
            <0              Error, see C_RESULT
          text              Task answer
*/
DoClicks_c.prototype.act = function () {
  if (this.result.status === 1) {
    //input validation
    //domain here?
    if (!this.task_data.additional_task.site_domain) {
      result = this.C_RESULT.NO_DOMAIN;
    }
  }

  //ads example
  if (this.result.status === 1) {
    if (this.task_data.additional_task.max_ads_clicks > 0) {
      if (!this.task_data.additional_task.ads_url) {
        result = this.C_RESULT.NO_ADS_URL;
      }
    }
  }

  var search_data;
  var l_len = 0;
  var iter = 0;

  toJournal ("for test 614");

  //delete empty strings
  if (this.task_data.additional_task.search_url[0] === "") {
    this.task_data.additional_task.search_url.splice(0, 1);
  }
  if (this.task_data.additional_task.search_queries[0] === "") {
    this.task_data.additional_task.search_queries.splice(0, 1);
  }

  //query or search_url
  if (this.task_data.additional_task.search_url.length > 0) {
    this.search_mode = this.C_SEARCH_MODE.SEARCH_URL;
    search_data = this.task_data.additional_task.search_url;
  }
  else {
    if (this.task_data.additional_task.search_queries.length > 0) {
      this.search_mode = this.C_SEARCH_MODE.SEARCH_QUERIES;
      search_data = this.task_data.additional_task.search_queries;
    }
    else {
      //no searches
      this.search_mode = this.C_SEARCH_MODE.NO_SEARCH;
    }
  }

  toJournal ("for test 644");

  if (this.result.status === 1) {
    var search_res = {
      status: 0,
      query: "",
      search_url: ""
    };

    if (typeof(search_data) !== "undefined") {
      //search
      search_data = shuffle(search_data);
      l_len = search_data.length;

      toJournal ("for test 2124");

      for (iter = 0; iter < l_len; iter++) {
        if (search_data[iter] === "") {
          continue;
        }
        toJournal ("for test 2128");
        search_res = search_wrapper (this.task_data.additional_task.search_engine[0], search_data[iter], this.task_data.additional_task.site_domain);
        toJournal ("for test 2134");
        if (search_res.status === 1) {
          this.search.query = search_res.query;
          this.search.url = search_res.search_url;
          break;
        }
      }

      toJournal ("for test 2125");

      if (search_res.status !== 1) {
        if (this.search_mode === this.C_SEARCH_MODE.SEARCH_URL) {
          this.search.url = this.task_data.additional_task.search_url[0];
        }
        else if (this.search_mode === this.C_SEARCH_MODE.SEARCH_QUERIES) {
          this.search.url = this.task_data.additional_task.search_queries[0];
        }
      }

      this.result.text = this.search.query + "\n";
      this.result.text += this.search.url + "\n";
    }

    toJournal ("for test 2123");

    if (search_res.status !== 1) {
      //after search error - direct transition
      iimPlayCode ("TAB OPEN\nTAB T=2\nURL GOTO=\"" + AddHTTP (this.task_data.additional_task.site_domain) + "\"");
    }

    var l_site = this.task_data.additional_task.site_domain;
    var l_ads_url = this.task_data.additional_task.ads_url[0];
    var clicks = getRandom (this.task_data.additional_task.min_clicks, this.task_data.additional_task.max_clicks);
    var ads_clicks = getRandom (this.task_data.additional_task.min_ads_clicks, this.task_data.additional_task.max_ads_clicks);

    var test_txt = "";
    for (par in this.task_data.additional_task) {
      test_txt += par + ", " + typeof this.task_data.additional_task[par] + ": " + String(this.task_data.additional_task[par]).substr(0, 20) + "\n";
    }
    iimDisplay(test_txt);


    // toJournal("for test 2348: " + l_site + "; " + l_ads_url,);
    this.walker_report = SiteWalker (l_site, clicks, l_ads_url, ads_clicks);

    toJournal("for test 251: " + this.walker_report.status);
    if (this.walker_report.status === -1) {
      //walking error
    }
    else {
      this.walker_report_txt = this.walker_report.site.join("\n");
      if (this.walker_report.ad.length > 0) {
        this.walker_report_txt += this.walker_report.ad.join("\n");
      }
      toJournal("for test 316: " + this.walker_report_txt);
      this.result.text += this.walker_report_txt;
    }
  }

  return (this.result);
}

/**
@class  seosprint
@brief  Convert additional parameters from string to object.
@param  
@return  1                  Success
        -1                  Error
*/
function additionalToJSON (p_task_data) {
  var result = 1;
  
  if (p_task_data.hasOwnProperty("additional_task")) {
    //
    if ((typeof p_task_data.additional_task) == "string") {
      //
      p_task_data.additional_task = JSON.parse(p_task_data.additional_task);
    }
    else {
      result = -1;
    }
  }
  else {
    result = -1;
  }
  return (result);
}

/**
@class  seosprint
@brief  Search url at the page
@param  p_text              Text for searching
@return  true               URL was found
          false             URL was not found
*/
function SearchURL (p_text) {
  var result = true;
  var html_code = '';

  var loc_macros = "CODE:SET !EXTRACT_TEST_POPUP NO" + "\n";
  loc_macros += "TAG POS=1 TYPE=BODY ATTR=* EXTRACT=TXT"+"\n";
  iimPlay (loc_macros);

  html_code = iimGetLastExtract();

  result = WordInText (p_text, html_code);
  
  return (result);
}

/**
@class  seosprint
@brief  Input report in text area.
@param  p_text              Report text
@return  1                  Success
        -1                  Error
*/
function inputReport (p_text) {
  var result = 1;
  var iim_code = -1;
  var loc_macros = "";
  var in_textarea = "";
  var elem = content.document.querySelector('textarea.replyarea');
  var empty = /^\s+/gm; 

  if (!p_text) {
    result = -1;
  }

  p_text = p_text.replace(empty, "");
  if (p_text === "") {
    result = -1;
  }

  if (elem === null) {
    result = -1;
  }

  if (result !== -1) {
    if (!reportQuality(p_text)) {
      result = -1;
    }
  }

  if (result !== -1) {
    loc_macros = "CODE:SET !EXTRACT_TEST_POPUP NO" + "\n";
    loc_macros += "SET !TIMEOUT_STEP 2" + "\n";
    loc_macros += "EVENT TYPE=CLICK XPATH=\"//textarea[@class='replyarea']\" BUTTON=0" + "\n";
    loc_macros += "WAIT SECONDS = 2" + "\n";

    do {
      if (result <= -1) {
        break;
      }
      else {
        toJournal("for test 805: " + p_text);
        iim_code = iimPlay (loc_macros);
        elem.value = p_text;
        Delay(3);
        result--;
      }
      in_textarea = getReport();
      if (in_textarea.status === -1) {
        result--;
      }
      //while equal intext and initial report
    } while (in_textarea.text !== p_text);
  }

  if (result > -1) {
    toJournal("for test 756: yes, input");
    alert ("for test 756");
    iimPlayCode("TAG XPATH=\"\//span[@class='button-big-flat-green']\"");
  }

  return (result);
}

/**
@class  seosprint
@brief  Get report from text area.
@param  -
@return status
          1                 Success
          -1                Error
        text                Report text
*/
function getReport () {
  var result = {
    text: "",
    status: 1
  }

  var elem = content.document.querySelector('textarea.replyarea');

  if (elem === null) {
    result.status = -1;
  }
  else {
    result.text = content.document.querySelector('textarea.replyarea').value;
  }

  return (result);
}

/**
@class  seosprint
@brief  Define report quality
@param  p_report            Report text
@return true                Good report
        false               Bad report
*/
function reportQuality (p_report) {
  var result = true;
  var reg_bad = [
    {reg:/undefined/, cost: 2},
    {reg:/__/, cost: 1},
    {reg:/http/, cost: -1}
  ]
  var bad_edge = 2;
  var bad_sum = 0;
  var len = reg_bad.length;
  var replays_num = 0;
  var matches = new Array();

  for (var i = 0; i < len; i++) {
    replays_num = 0;
    matches = p_report.match(reg_bad[i].reg);
    if (matches !== null) {
      replays_num = matches.length;
    }
    bad_sum += replays_num*reg_bad[i].cost;
    if (bad_sum >= bad_edge) {
      result = false;
      break;
    }
  }
  toJournal ("for test 2326 bad_sum: " + bad_sum);
  
  return (result);
}

/**
@class  seosprint
@brief  Get current balance and delta balance for session
@param  p_without_delta     Result without delta
@return {
          balance: 2000,
          delta(),
          status
            1
            -1        
        }
*/
function get_sBalance (p_without_delta = false) {
  var result = {
    balance: 2000,
    delta: function() {
      //
    },
    status: 1
  };
  var bal = 2000;

  var xpath_val = "XPATH=\"\//div[@class='balance-block']\"";

  while (!XPATH_Here(xpath_val)) {
    if (result.status === 1) {
      result.status === 0;
      iimPlayCode ("URL GOTO=http://seosprint.net");
    }
    else {
      result.status === -1;
      break;
    }
  }

  if (result.status !== -1) {
    result.status = 1;
    // result.balance =
    bal = content.document.querySelector('div.balance-block').textContent;
    try {
      bal = +bal.match(/\d+\.\d+/)[0];
      result.balance = bal;
      if (!p_without_delta) {
        result.delta = function () {
          var r = get_sBalance(true);
          return ({
            s: r.status,
            d: Math.round(100*(r.balance - result.balance))/100
          })
        }
      }
    }
    catch(e) {
      result.status = -1;
    }
  }
  return (result);
}

/**
@class  seosprint
@brief  Trap for apples
@param  -
@return true                Apple was trapped
        false               No apple
*/
function apple_trap () {
  return (XPATH_Here("XPATH=\"\//span[@id='icratpluc']\"\nWAIT SECONDS=" + getRandom(1, 3)));
}

/**
@class  seosprint
@brief  Read news
@param  -
@return -
*/
function readNews () {
  var result = 1;

  while (iimPlayCode("TAG XPATH=\"\//a[@href='/news.php']\"") !== 1) {
    if (result === 1) {
      result = 0;
      iimPlayCode("URL GOTO=http://www.seosprint.net/index.php");
    }
    else {
      result = -1;
    }
  };
  if (result !== -1) {
    Delay(getRandom(13,25));
  }
  
  return (result);
}

//---------------//Завершение - Seosprint функции//------------------

//-------------------------//xpcom Tabs//------------------------
/**
XPCOM module

main tab components
Tabs._browser.getBrowserAtIndex(0)
Tabs._browser.tabContainer.childNodes[0]

Really duplicates, but useful not at all
var dup = Tabs._browser.duplicateTab(Tabs._browser.tabContainer.childNodes[0]);
How duplicate without load?

Work with content

var newTabBrowser = gBrowser.getBrowserForTab(gBrowser.addTab("http://www.google.com"));
newTabBrowser.addEventListener("load", function () {
  newTabBrowser.contentDocument.body.innerHTML = "<div>hello world</div>";}, true);
*/

var Tabs = {
  _browser: function () {     
    var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"] 
       .getService(Components.interfaces.nsIWindowMediator);    
    return wm.getMostRecentWindow("navigator:browser").gBrowser;
  }(),
  _recentwindow: function () {
    var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"] 
       .getService(Components.interfaces.nsIWindowMediator);
    return wm.getMostRecentWindow("navigator:browser");
  }(),
  /**
    absolute position of tab focused on
    Tabs.go(1);
  */
  go: function (tabIndex) {
    this._browser.selectedTab = this._browser.tabContainer.childNodes[tabIndex];  
  },
  /**
    count of tabs
  */
  count: function () {
    // return (this._browser.tabContainer.childNodes.length);
    return (this._browser.browsers.length);

  },
  //return index of current tab
  openAndReuseOneTabPerURL: function (reg_url) {
    var result = -1;
    var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                       .getService(Components.interfaces.nsIWindowMediator);
    var browserEnumerator = wm.getEnumerator("navigator:browser");

    // Check each browser instance for our URL
    var found = false;
    while (!found && browserEnumerator.hasMoreElements()) {
      var browserWin = browserEnumerator.getNext();
      var tabbrowser = browserWin.gBrowser;

      // Check each tab of this browser instance
      var numTabs = tabbrowser.browsers.length;
      for (var index = 0; index < numTabs; index++) {
        var currentBrowser = tabbrowser.getBrowserAtIndex(index);
        if (currentBrowser.currentURI.spec.search(reg_url) !== -1) {

          result = index;
          // The URL is already opened. Select this tab.
          tabbrowser.selectedTab = tabbrowser.tabContainer.childNodes[index];

          // Focus *this* browser-window
          browserWin.focus();

          found = true;
          break;
        }
      }
    }

    // Our URL isn't open. Open it now.
    // if (!found) {
    //   var recentWindow = wm.getMostRecentWindow("navigator:browser");
    //   if (recentWindow) {
    //     // Use an existing browser window
    //     recentWindow.delayedOpenTab(url, null, null, null, null);
    //   }
    //   else {
    //     // No browser windows are open, so open a new one.
    //     window.open(url);
    //   }
    // }
    return (result);
  },
  idtonum: function (p_id, transit_flag = false) {
    result = -1;
    var len = this.count();
    for (var i = 0; i < len; i++) {
      if (this._browser.tabContainer.childNodes[i].id == p_id) {
        result = i;
        if (transit_flag) {
          this._browser.selectedTab = this._browser.tabContainer.childNodes[i];
        }
        break;
      }
    }
    return (result);
  },
  newtab: function (url) {
    if (!url) {
      this._recentwindow.delayedOpenTab("about:blank", null, null, null, null);
    }
    else {
      this._recentwindow.delayedOpenTab(url, null, null, null, null);
    }
    return (this.getcurrenttabnum());
  },
  loadURI: function (url = null, tabIndex = -1) {
    var result = -1;

    if (!!url) {
      if (tabIndex === -1) {
        tabIndex = this.getcurrenttabnum();
      }
      if (tabIndex === -1) {
        // result = -1;
        return (result);
      }

      this._browser.getBrowserAtIndex(tabIndex).loadURI(url);

      result = 1;
    }
    return (result);
  },
  refresh: function (tabIndex = -1) {
    var result = -1;

    if (tabIndex === -1) {
      tabIndex = this.getcurrenttabnum();
    }
    if (tabIndex === -1) {
      // result = -1;
      return (result);
    }
    this._browser.getBrowserAtIndex(tabIndex).reload();
    ;
  },
  tabclose: function (tabIndex = -1) {
    if (tabIndex === -1) {
      this._browser.removeCurrentTab();
    }
    else {
      this._browser.removeTab(this._browser.tabContainer.childNodes[tabIndex]);
    }
  },
  geturl: function (tabIndex = -1, without_param_flag = false) {
    var result = "";
    if (tabIndex === -1) {
      tabIndex = this.getcurrenttabnum();
    }
    result = this._browser.getBrowserAtIndex(tabIndex).currentURI.spec;
    if (without_param_flag) {
      result = result.replace (/\?.*/, "");
    }
    return (result);
  },
  getcurrenttabnum: function () {
    var current_num = -1;

    // return (this._browser.tabContainer.selectedIndex + 1);

    var l_count = this.count();
    for (var i = 0; i < l_count; i++) {
      if (this._browser.selectedTab === this._browser.tabContainer.childNodes[i]) {
        current_num = i;
        break;
      }
    }
    return (current_num);
  },
  tabload_stop: function (tabIndex = -1) {
    if (tabIndex === -1) {
      tabIndex = this.getcurrenttabnum();
    }
    this._browser.getBrowserAtIndex(tabIndex).stop();
  },
  fastload: function (p_mode = true) {
    if (p_mode) {
      this._browser.addEventListener('DOMContentLoaded', this._fastload_func, true);
    }
    else {
      this._browser.removeEventListener('DOMContentLoaded', this._fastload_func, true);
    }
  },
  _fastload_func: function() {
    iimDisplay("fast stop: " + (new Date()).getSeconds());
    this.tabload_stop();
  },
  setId: function (tabIndex = -1, p_force = false) {
    if (p_force) {
      this._browser.tabContainer.childNodes[(tabIndex === -1 ? this.getcurrenttabnum() : tabIndex)].id = "";
    }
    return(this._browser.tabContainer.childNodes[(tabIndex === -1 ? this.getcurrenttabnum() : tabIndex)].id = this._browser.tabContainer.childNodes[(tabIndex === -1 ? this.getcurrenttabnum() : tabIndex)].id || new Date());
  },
  body_outerHTML: function (tabIndex = -1, p_outerHTML = null) {
    var result = "";
    if (tabIndex === -1) {
      tabIndex = this.getcurrenttabnum();
    }
    if (tabIndex === -1) {
      return (-1);
    }

    var tab = this._browser.tabContainer.childNodes[tabIndex];
    // content.console.log("for test 920: " + typeof l_body.outerHTML);
    content.console.log(this._browser.getBrowserForTab(tab).contentDocument);
    var l_doc = this._browser.getBrowserForTab(tab).contentDocument;

    toJournal("for test 1833: " + l_doc.readyState);

    var l_body = l_doc.body;

    // Delay(0);
    result = l_body.outerHTML;

    if (!!p_outerHTML) {
      if (l_doc.readyState === "complete") {
        toJournal("for test 1030: " + l_doc.readyState);
        l_body.outerHTML = p_outerHTML;
      }
      else {
        toJournal("for test 1033: " + l_doc.readyState);
        this._recentwindow.setTimeout(function() {
          l_body = Tabs._browser.getBrowserForTab(tab).contentDocument.body;
          try {
            l_body.outerHTML = p_outerHTML;
          } catch (e) {
            //
          }
        }, 300);
      }
    }
    else {
      // result = l_body.outerHTML;
    }
    return (result);
  },
  /**
  getstate res:
  loading
  interactive
  complete
  */
  getstate: function(tabIndex = -1) {
    if (tabIndex === -1) {
      tabIndex = this.getcurrenttabnum();
    }
    if (tabIndex === -1) {
      return (-1);
    }
    return(this._browser.getBrowserAtIndex(tabIndex).contentDocument.readyState);
  },
  changestatevent: function(func, tabIndex = -1) {
    if (tabIndex === -1) {
      tabIndex = this.getcurrenttabnum();
    }
    if (tabIndex === -1) {
      return (-1);
    }
    var l_tab = this._browser.getBrowserAtIndex(tabIndex);

    l_tab.addEventListener('DOMContentLoaded', func, true);
  },
  loadtabevent: function (func, tabIndex = -1) {
    if (tabIndex === -1) {
      tabIndex = this.getcurrenttabnum();
    }
    var l_tab = this._browser.getBrowserAtIndex(tabIndex);
    var l_id = this.setId(tabIndex);
    //for test 1751
    // Delay(1);
    // while (!content.console) {};
    // content.console.log(l_tab);
    // content.console.log(this._browser);

    if (!Array.isArray(func)) {
      func = [func];
    }

    function event_f () {
      var f_len = func.length;
      var f_res = 0;
      Tabs.tabload_stop(Tabs.idtonum(l_id));
      l_tab.removeEventListener('DOMContentLoaded', event_f, true);
      while (f_len > 0) {
        Tabs.go(Tabs.idtonum(l_id));
        f_res = func.shift()();
        f_len = func.length;
        if (f_res === 1) {
          toJournal("for test 2014: continue f");
          continue;
        }
        else {
          break;
        }
      }
      if (f_len > 0) {
        l_tab.addEventListener('DOMContentLoaded', event_f, true);
      }
      else {
        l_tab.removeEventListener('DOMContentLoaded', event_f, true);
      }
    }
    l_tab.addEventListener('DOMContentLoaded', event_f, true);
    // l_tab.addEventListener('load', function(){toJournal("for test 1756")}, true);
    // l_tab.addEventListener('DOMContentLoaded', function(){toJournal("for test 1756")}, true);
  }
};

//------------------//End - xpcom Tabs//------------------

//------------------//Основной текст программы//---------------------
const go_num = 3;

var g_logInterceptor = new Interceptor(printCallInfo,  printCallResult);

var iimPlay_orig = iimPlay;
var iimPlayCode_orig = iimPlayCode;
var iimPlay_debug = iimPlay;
var iimPlayCode_debug = iimPlayCode;

var g_Journal = new Object();

if (DEBUG_MODE) {
  iimPlay = g_logInterceptor.interceptInvokes(iimPlay);
  iimPlay_debug = iimPlay;
  iimPlayCode = g_logInterceptor.interceptInvokes(iimPlayCode);
  iimPlayCode_debug = iimPlayCode;

  g_Journal = new Journal_Module (getiMacrosFolder("Downloads"), FILE_LOG, true, false);
}

toJournal ("------------//Начало работы Go " + go_num + "//----------");

alert ("for test 1028: Atention!");

// noCloseWindow (15);

// Go[go_num] = g_logInterceptor.interceptInvokes(Go[go_num]);

Go[go_num]();
//------------//Завершение - основной текст программы//--------------