$(function () {
  console.log("content.js loaded");

  chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    console.log('"' + request.message + '" received');

    // button = $(".uArJ5e.UQuaGc.Y5sE8d.uyXBBb.xKiqt"); // 開始ボタン
    // console.log(button);
    // button.click();
    /*
    <div jsshadow="" role="button" class="U26fgb c7fp5b FS4hgd nByyte iWO5td" jscontroller="iSvg6e"
      jsaction="click:cOuCgd; mousedown:UX7yZ; mouseup:lbsD7e; mouseenter:tfO1Yc; mouseleave:JywGue; focus:AHmuwe; blur:O22p3e; contextmenu:mg9Pef;touchstart:p6p2H; touchmove:FwuNnf; touchend:yfqBxc(preventMouseEvents=true|preventDefault=true); touchcancel:JMtRjd;keydown:I481le"
      jsname="aGHX8e" aria-label="その他のオプション" aria-disabled="false" tabindex="0" data-tooltip="その他のオプション"
      aria-haspopup="true" aria-expanded="true" data-dynamic="true" data-menu-corner="bottom-end"
      data-anchor-corner="top-end" data-vertical-menu-offset="-15" data-tooltip-position="top"
      data-tooltip-vertical-offset="12" data-tooltip-horizontal-offset="0">
      <div class="lVYxmb MbhUzd" jsname="ksKsZd" style="top: 44px; left: 30px; width: 88px; height: 88px;"></div>
      <div class="g4jUVc" aria-hidden="true"></div><span jsslot="" class="I3EnF oJeWuf"><span class="NlWrkb snByac"><span
            class="DPvwYc" aria-hidden="true"><svg focusable="false" width="24" height="24" viewBox="0 0 24 24"
              class="Hdh4hc cIGbvc NMm5M">
              <path
                d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z">
              </path>
            </svg></span></span></span>
    </div>
    */
    var option = $("div.U26fgb.c7fp5b.FS4hgd.nByyte"); // option menu
    console.log(option);
    option.click();

    var timeout = 0;
    var id = setInterval(function () {
      /*
<span jsslot="" class="z80M1 NticYc I3Yihd"
  jsaction="click:o6ZaF(preventDefault=true); mousedown:lAhnzb; mouseup:Osgxgf; mouseenter:SKyDAe; mouseleave:xq3APb;touchstart:jJiBRc; touchmove:kZeBdd; touchend:VfAz8(preventMouseEvents=true)"
  jsname="j7LFlb" aria-label="ミーティングを録画" role="menuitem" tabindex="-1">
  <div class="aBBjbd MbhUzd" jsname="ksKsZd" style="top: 20px; left: 233px; width: 320px; height: 320px;"></div>
  <div class="PCdOIb Ce1Y1c" aria-hidden="true"><span class="DPvwYc VfeYV" aria-hidden="true"></span></div>
  <div class="uyYuVb oJeWuf" jscontroller="dBndrc" jsaction="rcuQ6b:npT2md;JIbuQc:JIbuQc;h9HLZc:CE7Jad;">
    <div class="jO7h3c">
      <div jsname="f1CTvf">ミーティングを録画</div>
    </div>
  </div>
</span>
      */
      // var record = $('[jscontroller="dBndrc"]'); // record
      var record = $('[jscontroller="pc452"]'); // full screen

      console.log(record);
      if (record.length > 0) {
        console.log("record button found");
        record.click();
        clearInterval(id);
      }
      timeout++;
      if (timeout > 10) {
        clearInterval(id);
      }
    }, 1000);

    sendResponse("OK");
  });
});