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
      // body > div.JPdR6b.e5Emjc.CIYi0d.jvUMfb.yOCuXd.qjTEB > div > div > span.z80M1.NticYc.I3Yihd > div.uyYuVb.oJeWuf > div > div
      var record = $("span.z80M1.NticYc.I3Yihd");
      // var record = $("span.z80M1.NticYc.I3Yihd > div.uyYuVb.oJeWuf");
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


$.ajax({
  type: "POST",
  url: "some.php",
  data: "name=John&location=Boston",
  success: function (msg) {
    alert("Data Saved: " + msg);
  }
});







_.q();

var Phe = function (a) { switch (a) { case 1: case 3: return [1, 3]; case 2: case 4: return [2, 4]; default: return [] } }, Rhe = function (a, b) { _.yf && !Qhe(a) ? _.Th(b, 1E3) : b() }, She = { Op: 1700, prefix: "//www.gstatic.com/meet/sounds/recording_error_", Sx: "ceefce62ca733f47769769dd092a51f3.mp3" }, The = { Op: 2E3, prefix: "//www.gstatic.com/meet/sounds/recording_start_", Sx: "1c84d5cd789e5473b43a0b686b5af788.mp3" }, Uhe = { Op: 2E3, prefix: "//www.gstatic.com/meet/sounds/recording_stop_", Sx: "f8884f5dfa1e16ec6a927a81d0bc3b49.mp3" }; _.l("GZl2nc");

var Vhe = function (a) { _.W.call(this, a.Pa); this.Ia = new Map; this.Da = new Map; this.Ba = null; this.Ca = a.$a.Bd.Qm(); this.Zb = a.model.call; this.Oa = a.model.Yn; this.La = a.Ga.ud; this.Aa = a.Ga.notify }; _.u(Vhe, _.W); Vhe.Ma = function () { return { $a: { Bd: _.Ik }, model: { call: _.vl, Yn: _.aW }, Ga: { ud: _.Qu, notify: _.jR } } };
Vhe.prototype.mLb = function (a) {
  a = a.data; var b = a.status, c = a.Tx, d = a.reason, e = a.uf; if (a.Ak && _.YV().has(e)) { if (null !== this.Ba && this.Ba !== e) switch (e) { case 2: this.Aa.show("broadcastSettingUpdateToPrivate", 2E3); break; case 4: this.Aa.show("broadcastSettingUpdateToPublic", 2E3) }this.Ba = e } if (b !== c || d) switch (b) {
    case 1: Whe(this, a); break; case 2: case 4: case 3: case 5: Xhe(this, a); break; case 6: a = a.uf; Yhe(this, a, 1) || (Zhe(this, a, 1), this.Ca.play(The), a = _.hY(a), this.La.Aa(a.Tr.Zu)); break; case 7: $he(this, a); break; case 8: break;
    default: _.Hu(b, "status had an unknown type")
  }
}; Vhe.prototype.oLb = function (a) { (a = aie.get(a.data)) && this.Aa.show(a) };
var Xhe = function (a, b) { var c = b.uf; b = b.f5; if (!Yhe(a, c, 0)) { Zhe(a, c, 0); var d = _.hY(c); Qhe(b) ? a.Aa.show(d.Tr.kBa, void 0, [null === b || void 0 === b ? void 0 : b.name]) : Rhe(b, function () { a.Aa.show(d.Tr.jBa) }) } }, $he = function (a, b) { b = b.uf; var c = _.hY(b); bie(a, b); var d = _.gb(2E3).then(function () { return a.Aa.show(c.Tr.iCa) }); a.Da.set(b, d) }, Whe = function (a, b) {
  var c = b.uf, d = b.reason, e = b.f5, f = b.Wx; Yhe(a, c, 2) || cie(a, c) || (Zhe(a, c, 2), bie(a, c), die(a).then(function (g) {
    var k = eie(b, g), m = [e && e.name || "", f || ""]; d && 7 !== d ? (Rhe(e, function () {
      a.Aa.og(k,
        void 0, m)
    }), a.Ca.play(She)) : (Rhe(e, function () { a.Aa.show(k, 4E3, m) }), a.Ca.play(Uhe))
  }))
}, Yhe = function (a, b, c) { b = _.Sb(Phe(b)); for (var d = b.next(); !d.done; d = b.next())if (a.Ia.get(d.value) === c) return !0; return !1 }, Zhe = function (a, b, c) { b = _.Sb(Phe(b)); for (var d = b.next(); !d.done; d = b.next())a.Ia.set(d.value, c) }, cie = function (a, b) { b = _.Sb(Phe(b)); for (var c = b.next(); !c.done; c = b.next())if (1 !== a.Oa.Kc(c.value)) return !0; return !1 }, bie = function (a, b) { var c = a.Da.get(b); c && (c.cancel(), a.Da.delete(b)) }, die = function (a) {
  return _.ib([a.Zb.Da.promise,
  _.gb(250)]).then(function (b) { return !!b }, function () { return !1 })
}, eie = function (a, b) { var c = a.reason, d = Qhe(a.f5); a = _.hY(a.uf).Tr; switch (c) { case 2: return a.fCa; case 6: return a.aCa; case 4: return a.eCa; case 3: return d ? a.$Ba : a.ZBa; case 7: return a.YBa; case 5: return a.XBa; case 1: return a.dCa; default: return d ? b ? a.gCa : a.hCa : b ? a.bCa : a.cCa } }; _.X(Vhe.prototype, "CgG2U", function () { return this.oLb }); _.X(Vhe.prototype, "CuNoEd", function () { return this.mLb });
var Qhe = function (a) { return !!a && !a.Ne && !!a.name }, aie = new Map([[1, "recordingAboutToStop"]]); _.Y(_.gwa, Vhe);

_.q();

}catch (e) { _._DumpException(e) }
}).call(this, this.default_MeetingsUi);
// Google Inc.