define("file-widget-1:download/log.js", function() {
       return {
       event: {},
       ajax: {
       "/api/download": {
       logType: "dis",
       description: "下载文件",
       callback: function(o, t) {
       return [{
               name: "downloadHttpTime",
               value: t && t.time
               }, {
               name: "downloadHttpStatus",
               value: t && t.responseData && t.responseData.errno
               }]
       }
       }
       },
       mix: {
       chromeStraightforwardDownload: {
       logType: "count",
       description: "chrome直接下载文件"
       },
       httpsAccessFail: {
       logType: "count",
       description: "https访问失败"
       },
       httpsAccessSuccess: {
       logType: "count",
       description: "https访问成功"
       },
       https_pub: {
       logType: "count",
       description: "是否命中https访问的小流量"
       },
       callGuanjia: {
       logType: "count",
       description: "是否成功调起云管家"
       },
       tab_download_click: {
       logType: "count",
       discription: "选中文件后点上方按钮文件下载"
       },
       list_download_click: {
       logType: "count",
       discription: "列表下载按钮文件下载"
       },
       file_down_count: {
       logType: "count",
       discription: "文件下载统计(不包含文件夹)"
       }
       }
       }
       });
;
define("file-widget-1:download/start.js", function(e, i, t) {
       var n = e("base:widget/libs/underscore.js"),
       l = window.yunData || {},
       o = e("file-widget-1:download/util/context.js");
       e("file-widget-1:download/service/guanjiaConnector.js");
       var s = {
       start: function(i, t) {
       var a,
       d = null;
       if (o.setContext(i), "object" == typeof t && t.filesList) {
       if (d = t.filesList.length > 0 ? t.filesList : [t.filesList], a = t.hasDlink, t.getDlink && t.callback) {
       var c = n.pluck(d, "fs_id");
       return void s.getDlink(c, t.callback, t.filePosition)
       }
       o.getContext().log.send({
                               name: "list_download_click",
                               value: "列表下载按钮文件下载"
                               })
       } else if ("string" == typeof t)
       d = [{
            dlink: t
            }], a = !0;
       else {
       if ("object" == typeof t && t.fsids && t.getDlink)
       return void s.getDlink(t.fsids, t.callback, t.filePosition);
       d = i.list.getSelected(), o.getContext().log.send({
                                                         name: "tab_download_click",
                                                         value: "选中文件后点上方按钮文件下载"
                                                         })
       }
       e.async("file-widget-1:download/controller/downloadController.js", function(e) {
               var n = {
               list: d,
               hasDlink: a
               };
               "share" === i.pageInfo.currentProduct && (n = {
                                                         list: d,
                                                         product: t && "unzip" === t.from ? "pan" : i.pageInfo.currentProduct,
                                                         hasDlink: a,
                                                         share_uk: l.SHARE_UK,
                                                         share_id: l.SHARE_ID,
                                                         sign: l.SIGN,
                                                         timestamp: l.timestamp
                                                         }), e.download(n)
               })
       },
       getDlink: function(i, t, n) {
       e.async("file-widget-1:download/service/dlinkService.js", function(e) {
               switch (n) {
               case "mbox":
               break;
               case "share":
               break;
               default:
               e.getDlinkPan(i, "nolimit", function(e) {
                             "function" == typeof t && t(e)
                             }, void 0, void 0, "POST")
               }
               })
       }
       };
       t.exports = s
       });
;
define("file-widget-1:download/controller/downloadController.js", function(o, t, n) {
       var i = o("base:widget/libs/jquerypacket.js"),
       a = o("base:widget/libs/underscore.js"),
       e = o("file-widget-1:download/service/downloadManager.js"),
       d = o("file-widget-1:download/service/downloadDirectService.js"),
       r = o("file-widget-1:download/util/downloadCommonUtil.js"),
       s = o("file-widget-1:download/util/context.js"),
       l = o("file-widget-1:download/service/dlinkService.js"),
       c = {
       opts: {},
       downloadManageService: null,
       calculateMode: function(o, t) {
       var n = 0,
       i = 0,
       d = "";
       if (a.isArray(o) === !0)
       for (var s = 0; s < o.length; s++)
       n += parseInt(o[s].size), 1 == parseInt(o[s].isdir) ? i = 1 : "";
       else
       n = parseInt(o.size), i = o.isdir;
       a.isArray(o) === !0 ? (e.logMsg.category = e.logMsg.multipleFileCategory, d = o.length > e.FILES_NUMBER || n > e.MEDIUM_SIZE_FILE || 1 == i ? e.MODE_PRE_INSTALL : e.MODE_PRE_DOWNLOAD, "function" == typeof t && t(d)) : (e.logMsg.category = e.logMsg.singleFileCategory, e.initSingleFileToGuanjiaLimit(function() {
                                                                                                                                                                                                                                                                                                                  var a = e.SIZE_THRESHOLD;
                                                                                                                                                                                                                                                                                                                  r.isChromeAndGreaterThan42() && (a = e.SIZE_THRESHOLD_CHROME);
                                                                                                                                                                                                                                                                                                                  var s = o.server_filename.substr(-4, 4);
                                                                                                                                                                                                                                                                                                                  d = 1 === i ? e.MODE_PRE_INSTALL : !r.isChrome() || ".exe" !== s && ".apk" !== s ? n < e.SMALL_SIZE_FILE ? e.MODE_DIRECT_DOWNLOAD : n >= e.SMALL_SIZE_FILE && a > n ? e.MODE_PRE_DOWNLOAD : e.MODE_PRE_INSTALL : e.MODE_PRE_INSTALL, "function" == typeof t && t(d)
                                                                                                                                                                                                                                                                                                                  }))
       },
       downloadByManager: function(o, t) {
       var n,
       i,
       d = this;
       a.isArray(o) === !0 ? (n = s.getContext().tools.baseService.parseDirFromPath(o[0].path), i = s.getContext().tools.baseService.parseDirFromPath(o[0].path)) : (n = s.getContext().tools.baseService.parseDirFromPath(o.path), i = s.getContext().tools.baseService.parseDirFromPath(o.path)), null === this.downloadManageService ? this.downloadManageService = new e(o, n, i, t, this.opts) : this.downloadManageService.setDependencyData(o, n, i, t, this.opts), this.calculateMode(o, function(o) {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              return void 0 === o ? void console.error("calculateMode method callback arguments is undefined") : (d.downloadManageService.setMode(o), d.downloadManageService.initDialog(), d.downloadManageService.dialog.show(), void d.downloadManageService.updateMode())
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              })
       },
       downloadInWindows: function() {
       var o,
       t = this.opts.list,
       n = t.length,
       i = this.opts.hasDlink || !1;
       switch (n) {
       case 1:
       o = t[0], i === !1 ? this.downloadByManager(0 == o.isdir ? o : [o]) : d.straightforwardDownload(o, t);
       break;
       default:
       this.downloadByManager(t)
       }
       },
       downloadInNotWindows: function() {
       switch (this.opts.product) {
       case l.PRODUCT_PAN:
       this.downloadPanInNotWindows();
       break;
       case l.PRODUCT_MBOX:
       this.downloadMboxInNotWindows();
       break;
       case l.PRODUCT_SHARE:
       this.downloadShareInNotWindows();
       break;
       default:
       this.downloadPanInNotWindows()
       }
       },
       downloadPanInNotWindows: function() {
       var o = this.opts.list,
       t = o.length,
       n = this.opts.hasDlink || !1,
       i = {};
       switch (t) {
       case 1:
       i = o[0], n === !1 ? 1 == i.isdir ? l.getDlinkPan(l.getFsidListData([i]), "batch", function(t) {
                                                         i.dlink = t.dlink + "&zipname=" + encodeURIComponent(r.getPackName(o)), d.straightforwardDownload(i, o)
                                                         }) : l.getDlinkPan(l.getFsidListData([i]), "dlink", function(o) {
                                                                            i.dlink = o.dlink[0].dlink, d.straightforwardDownload(i, i)
                                                                            }) : d.straightforwardDownload(i, i);
       break;
       default:
       l.getDlinkPan(l.getFsidListData(o), "batch", function(t) {
                     i.dlink = t.dlink + "&zipname=" + encodeURIComponent(r.getPackName(o)), d.straightforwardDownload(i, o)
                     })
       }
       },
       downloadMboxInNotWindows: function() {
       var o = this.opts,
       t = this.opts.list,
       n = t.length,
       i = o.hasDlink || !1,
       a = {};
       switch (n) {
       case 1:
       a = t[0], i === !1 ? 1 == a.isdir ? (o.isForBatch = !0, l.getDlinkMbox(o, function(o) {
                                                                              a.dlink = o.dlink, d.straightforwardDownload(a, t)
                                                                              })) : (o.isForBatch = !1, l.getDlinkMbox(o, function(o) {
                                                                                                                       a.dlink = o.list[0].dlink, d.straightforwardDownload(a, a)
                                                                                                                       })) : d.straightforwardDownload(a, a);
       break;
       default:
       o.isForBatch = !0, l.getDlinkMbox(o, function(o) {
                                         a.dlink = o.dlink + "&zipname=" + encodeURIComponent(r.getPackName(t)), d.straightforwardDownload(a, t)
                                         })
       }
       },
       downloadShareInNotWindows: function() {
       var o = this.opts,
       t = this.opts.list,
       n = t.length,
       i = o.hasDlink || !1,
       a = {};
       switch (n) {
       case 1:
       a = t[0], i === !1 ? 1 == a.isdir ? (o.isForBatch = !0, l.getDlinkShare(o, function(o) {
                                                                               a.dlink = o.dlink, d.straightforwardDownload(a, t)
                                                                               })) : (o.isForBatch = !1, l.getDlinkShare(o, function(o) {
                                                                                                                         a.dlink = o.list[0].dlink, d.straightforwardDownload(a, a)
                                                                                                                         })) : d.straightforwardDownload(a, a);
       break;
       default:
       o.isForBatch = !0, l.getDlinkShare(o, function(o) {
                                          a.dlink = o.dlink + "&zipname=" + encodeURIComponent(r.getPackName(t)), d.straightforwardDownload(a, t)
                                          })
       }
       },
       removeDir: function(o) {
       if (!i.isArray(o))
       return [];
       for (var t = [], n = 0; n < o.length; n++)
       1 !== +o.isdir && t.push(o[n]);
       return t
       }
       },
       w = {
       download: function(o) {
       var t = o.list,
       n = t.length,
       i = [];
       return 0 === n ? void r.useToast({
                                        toastMode: "caution",
                                        msg: "您还没有选择下载的文件"
                                        }) : (i = c.removeDir(), i.length > 0 && s.getContext().log.send({
                                                                                                         name: "file_down_count",
                                                                                                         value: i.length,
                                                                                                         discription: "文件下载(不包含文件夹)"
                                                                                                         }), c.opts = o, l.setCurrentProduct(o.product ? o.product : l.PRODUCT_PAN), void (r.isPlatformWindows() === !0 || r.isPlatformMac() && (!o.product || o.product !== l.PRODUCT_MBOX) ? c.downloadInWindows() : (r.isPlatformMac() || s.getContext().log.send({
                                                                                                                                                                                                                                                                                                                                                                     type: "mock_pf_" + navigator.platform
                                                                                                                                                                                                                                                                                                                                                                     }), c.downloadInNotWindows())))
       }
       };
       n.exports = w
       });
;
define("file-widget-1:download/service/dlinkService.js", function(t, e, r) {
       var a = t("base:widget/libs/jquerypacket.js"),
       n = t("base:widget/libs/underscore.js"),
       o = t("system-core:context/context.js"),
       i = window.yunData,
       s = {
       PRODUCT_PAN: "pan",
       PRODUCT_MBOX: "mbox",
       PRODUCT_SHARE: "share",
       currentProduct: null,
       dialog: null,
       sign: null,
       setCurrentProduct: function(t) {
       this.currentProduct = t
       },
       getCurrentProduct: function() {
       return this.currentProduct
       },
       URL_DLINK_PAN: "/api/download",
       URL_DLINK_SHARE: "/api/sharedownload",
       _doError: function(t) {
       var e = "",
       r = this,
       a = o.instanceForSystem.accountBan(t);
       if (a.isBan)
       return !1;
       if (2 == t && (e = "下载失败，请稍候重试"), 116 === t && (e = "该分享不存在！"), -1 === t && (e = "您下载的内容中包含违规信息！"), 118 === t && (e = "没有下载权限！"), (113 === t || 112 === t) && (e = '页面已过期，请<a href="javascript:window.location.reload();">刷新</a>后重试'), -20 === t)
       return void r._showVerifyDialog();
       121 === t && (e = "你选择操作的文件过多，减点试试吧。"), e = e || "网络错误，请稍候重试";
       new o.instanceForSystem.ui.tip({
                                      mode: "caution",
                                      msg: e,
                                      hasClose: !0,
                                      autoClose: !1
                                      })
       },
       getFsidListData: function(t) {
       return n.isArray(t) === !1 && (t = [t]), a.stringify(n.pluck(t, "fs_id"))
       },
       base64Encode: function(t) {
       var e,
       r,
       a,
       n,
       o,
       i,
       s = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
       for (a = t.length, r = 0, e = ""; a > r;) {
       if (n = 255 & t.charCodeAt(r++), r == a) {
       e += s.charAt(n >> 2), e += s.charAt((3 & n) << 4), e += "==";
       break
       }
       if (o = t.charCodeAt(r++), r == a) {
       e += s.charAt(n >> 2), e += s.charAt((3 & n) << 4 | (240 & o) >> 4), e += s.charAt((15 & o) << 2), e += "=";
       break
       }
       i = t.charCodeAt(r++), e += s.charAt(n >> 2), e += s.charAt((3 & n) << 4 | (240 & o) >> 4), e += s.charAt((15 & o) << 2 | (192 & i) >> 6), e += s.charAt(63 & i)
       }
       return e
       },
       getDlinkPan: function(t, e, r, n, s, c) {
       var d,
       u,
       p = this;
       if (null === p.sign) {
       try {
       u = new Function("return " + i.sign2)()
       } catch (l) {
       throw new Error(l.message)
       }
       if ("function" != typeof u)
       return void this._doError();
       p.sign = p.base64Encode(u(i.sign5, i.sign1))
       }
       "[object Array]" === Object.prototype.toString.call(t) ? t = a.stringify(t) : "string" != typeof t || /^\[\S+\]$/.test(t) || (t = "[" + t + "]"), d = {
       sign: p.sign,
       timestamp: i.timestamp,
       fidlist: t,
       type: e
       }, n && s && (d.ct = n, d.cv = s), a.ajax({
                                                 url: this.URL_DLINK_PAN,
                                                 data: d,
                                                 dataType: "json",
                                                 type: c || "GET",
                                                 success: function(t, e, n) {
                                                 o.instanceForSystem.log.send({
                                                                              type: "webdownload",
                                                                              url: "//update.pan.baidu.com/statistics",
                                                                              clienttype: "0",
                                                                              op: "download",
                                                                              from: d.type,
                                                                              product: "pan",
                                                                              success: t && 0 === +t.errno ? 1 : 0,
                                                                              reason: t ? t.errno : 0,
                                                                              ajaxstatus: n.status,
                                                                              ajaxurl: "/api/download",
                                                                              ajaxdata: a.stringify(e)
                                                                              }), 0 == t.errno ? t.dlink && t.dlink.length > 0 ? "function" == typeof r && (t.logType = "webdownload", t.logFrom = d.type, r(t)) : p._doError() : p._doError(t.errno)
                                                 },
                                                 error: function(t, e) {
                                                 o.instanceForSystem.log.send({
                                                                              type: "webdownload",
                                                                              url: "//update.pan.baidu.com/statistics",
                                                                              clienttype: "0",
                                                                              op: "download",
                                                                              from: d.type,
                                                                              product: "pan",
                                                                              success: 0,
                                                                              ajaxstatus: t.status,
                                                                              ajaxurl: "/api/download",
                                                                              ajaxdata: a.stringify(e)
                                                                              }), p._doError()
                                                 }
                                                 })
       },
       ajaxGetDlinkShare: function() {
       var t = {
       encrypt: 0
       };
       0 === i.SHARE_PUBLIC && (t.extra = a.stringify({
                                                      sekey: decodeURIComponent(o.instanceForSystem.tools.baseService.getCookie("BDCLND"))
                                                      }));
       var e = function() {
       a.get("/share/autoincre", {
             type: 1,
             uk: i.SHARE_UK,
             shareid: i.SHARE_ID,
             sign: i.SIGN,
             timestamp: i.TIMESTAMP
             })
       };
       return function(r, n) {
       var i = this,
       s = a.extend({}, t, r),
       c = s.sign,
       d = s.timestamp;
       delete s.sign, delete s.timestamp, a.ajax({
                                                 type: "POST",
                                                 url: this.URL_DLINK_SHARE + "?sign=" + c + "&timestamp=" + d,
                                                 data: s,
                                                 success: function(t, r, c) {
                                                 var d = null;
                                                 try {
                                                 d = a.parseJSON(t)
                                                 } catch (u) {}
                                                 o.instanceForSystem.log.send({
                                                                              type: "websharedownload",
                                                                              url: "//update.pan.baidu.com/statistics",
                                                                              clienttype: "0",
                                                                              op: "download",
                                                                              from: s.product,
                                                                              product: "pan",
                                                                              success: d && 0 === +d.errno ? 1 : 0,
                                                                              reason: d ? d.errno : 0,
                                                                              ajaxstatus: c.status,
                                                                              ajaxurl: "/api/sharedownload",
                                                                              ajaxdata: a.stringify(r)
                                                                              }), d ? 0 == d.errno ? (s.product === i.PRODUCT_SHARE && e(), "function" == typeof n && (d.logType = "websharedownload", d.logFrom = s.product, n(d))) : i._doError(d.errno) : i._doError()
                                                 },
                                                 error: function(t, e) {
                                                 o.instanceForSystem.log.send({
                                                                              type: "websharedownload",
                                                                              url: "//update.pan.baidu.com/statistics",
                                                                              clienttype: "0",
                                                                              op: "download",
                                                                              from: s.product,
                                                                              product: "pan",
                                                                              success: 0,
                                                                              ajaxstatus: t.status,
                                                                              ajaxurl: "/api/sharedownload",
                                                                              ajaxdata: a.stringify(e)
                                                                              }), i._doError()
                                                 }
                                                 })
       }
       }(),
       getDlinkMbox: function() {
       var t = function(t) {
       var e = {
       uk: i.MYUK,
       product: s.PRODUCT_MBOX,
       encrypt: 0,
       timestamp: "",
       sign: ""
       },
       r = {};
       return t.vcode && (r.vcode = t.vcode, r.input = t.input), t.isForBatch === !0 && (r.type = "batch"), t.isForGuanjia === !0 && (r.encrypt = 1), t.ct && t.cv && (r.ct = t.ct, r.cv = t.cv), r = t.group_id ? a.extend({}, e, r, {
                                                                                                                                                                                                                            primaryid: t.msg_id,
                                                                                                                                                                                                                            fid_list: s.getFsidListData(t.list),
                                                                                                                                                                                                                            extra: a.stringify({
                                                                                                                                                                                                                                               type: "group",
                                                                                                                                                                                                                                               gid: t.group_id
                                                                                                                                                                                                                                               })
                                                                                                                                                                                                                            }) : a.extend({}, e, r, {
                                                                                                                                                                                                                                          primaryid: t.msg_id,
                                                                                                                                                                                                                                          fid_list: s.getFsidListData(t.list),
                                                                                                                                                                                                                                          extra: a.stringify({
                                                                                                                                                                                                                                                             type: "single",
                                                                                                                                                                                                                                                             from_uk: t.from_uk,
                                                                                                                                                                                                                                                             to_uk: t.to_uk
                                                                                                                                                                                                                                                             })
                                                                                                                                                                                                                                          })
       };
       return function(e, r) {
       this.arguments = arguments, this.ajaxGetDlinkShare(t(e), r)
       }
       }(),
       getDlinkShare: function() {
       var t = function(t) {
       var e = {
       product: s.PRODUCT_SHARE,
       encrypt: 0,
       timestamp: "",
       sign: ""
       },
       r = {};
       return t.vcode_input && t.vcode_str && (r.vcode_input = t.vcode_input, r.vcode_str = t.vcode_str), t.type && (r.type = t.type), t.isForBatch === !0 && (r.type = "batch"), t.isForGuanjia === !0 && (r.encrypt = 1), t.ct && t.cv && (r.ct = t.ct, r.cv = t.cv), r = a.extend({}, e, r, {
                                                                                                                                                                                                                                                                                     uk: t.share_uk,
                                                                                                                                                                                                                                                                                     primaryid: t.share_id,
                                                                                                                                                                                                                                                                                     fid_list: s.getFsidListData(t.list),
                                                                                                                                                                                                                                                                                     sign: t.sign,
                                                                                                                                                                                                                                                                                     timestamp: t.timestamp
                                                                                                                                                                                                                                                                                     })
       };
       return function(e, r) {
       this.arguments = arguments, this.ajaxGetDlinkShare(t(e), r)
       }
       }(),
       _showVerifyDialog: function() {
       var t = this;
       t.dialog = o.instanceForSystem.ui.verify({
                                                title: "提示",
                                                prod: "pan",
                                                onSure: function(e, r) {
                                                t.arguments[0].vcode_str = e, t.arguments[0].vcode_input = r, t.arguments.callee.apply(t, t.arguments)
                                                }
                                                }), t.dialog.show()
       }
       };
       r.exports = s
       });
;
define("file-widget-1:download/service/downloadDirectService.js", function(o, e, t) {
       var n = o("base:widget/libs/jquerypacket.js"),
       i = o("file-widget-1:download/util/downloadCommonUtil.js"),
       a = o("file-widget-1:download/util/pcsUtil.js"),
       d = o("base:widget/libs/underscore.js"),
       l = o("file-widget-1:download/util/context.js"),
       s = {
       SINGLE_DOWNLOAD: "http://pcs.baidu.com/rest/2.0/pcs/file?method=download&app_id=250528",
       MULTI_DOWNLOAD: "https://pcs.baidu.com/rest/2.0/pcs/file?method=batchdownload&app_id=250528",
       downloadDom: null,
       _warmupHTML: function() {
       var o = this.downloadDom,
       e = [];
       null == o && (o = document.createElement("div"), o.className = "pcs-hide-ele", document.body.appendChild(o), e.push('<iframe src="javascript:;" id="pcsdownloadiframe" name="pcsdownloadiframe" style="display:none"></iframe>'), e.push('<form target="pcsdownloadiframe" enctype="application/x-www-form-urlencoded" action="' + this.MULTI_DOWNLOAD + '" method="post" name="pcsdownloadform">'), e.push('<input name="method" value="batchdownload" type="hidden" /><input name="zipcontent" type="hidden" /><input name="zipname" type="hidden" /></form>'), o.innerHTML = e.join(""), this.downloadDom = o)
       },
       log: {
       getFileSizeType: function(o) {
       var e = 1048576,
       t = 0,
       n = !0,
       i = 0;
       if (d.isArray(o) === !0) {
       n = !1;
       for (var a = 0; a < o.length && !(t > 300 * e); a++)
       t += o[a].size
       } else
       t = o.size;
       if (t = Math.ceil(t / e), n) {
       var l = [0, 50, 100, 200, 300];
       l.sort(function(o, e) {
              t > o && e >= t ? i = o : t > e && (i = e)
              })
       } else {
       var l = [0, 100, 300];
       l.sort(function(o, e) {
              t > o && e >= t ? i = o : t > e && (i = e)
              })
       }
       return i
       },
       straightforwardDownload: function(o) {
       var e = "";
       try {
       e = d.isArray(o) === !1 ? "downloadfile|downloadSize_" + o.size + "|downloadFileLength_1|downloadFileCategory_." + o.path.split(".")[o.path.split(".").length - 1] : "downloadfile|downloadFileLength_" + o.length, l.getContext().log.send({
                                                                                                                                                                                                                                                   page: i.getDownloadLogmsg(),
                                                                                                                                                                                                                                                   type: e,
                                                                                                                                                                                                                                                   pf: navigator.platform,
                                                                                                                                                                                                                                                   fileSize: s.log.getFileSizeType(o),
                                                                                                                                                                                                                                                   md5: o.md5 || "proxypcs"
                                                                                                                                                                                                                                                   }), /chrome\/(\d+\.\d+)/i.test(navigator.userAgent) && l.getContext().log.send({
                                                                                                                                                                                                                                                                                                                                  name: "chromeStraightforwardDownload",
                                                                                                                                                                                                                                                                                                                                  sendServerLog: !1,
                                                                                                                                                                                                                                                                                                                                  value: "chrome"
                                                                                                                                                                                                                                                                                                                                  })
       } catch (t) {}
       },
       _showDownloadingDialog: function() {
       try {
       l.getContext().log.send({
                               page: i.getDownloadLogmsg(),
                               type: "download_browser_lteq_ie8"
                               })
       } catch (o) {}
       }
       },
       _switchDownloadTips: function(o) {
       var e = n.browser,
       t = !1;
       e.msie && parseInt(e.version, 10) <= 8 && (t = !0), t === !0 ? this._showDownloadingDialog(o) : this._doDownloadFile(o)
       },
       _doDownloadFile: function(o) {
       var e = null;
       this._warmupHTML(), e = document.getElementById("pcsdownloadiframe");
       var t = o.dlink.match(/(http|https):\/\/([^\/]*)\/.*/),
       n = t ? t[2] : "";
       e.onload = e.onreadystatechange = function() {
       l.getContext().log.send({
                               type: o.logType || "webotherdownload",
                               url: "//update.pan.baidu.com/statistics",
                               clienttype: "0",
                               op: "download",
                               product: "pan",
                               from: o.logFrom,
                               success: 0,
                               reason: "dlinkDownloadFailed",
                               dlinkDomain: n
                               })
       }, e.src = this._obtainDownloadURL(o)
       },
       _obtainDownloadURL: function(o) {
       var e = "",
       t = o.dlink;
       return a && a._sResult && (e = "&cflg=" + encodeURIComponent(a._sResult + ":" + a._sRevision), t += e), t && 0 === t.indexOf("http://") && "https:" === window.location.protocol && (t = t.replace("http://", window.location.protocol + "//")), n.browser.msie && (t += "&response-cache-control=private"), t
       },
       _showDownloadingDialog: function(o) {
       var e = this,
       t = null,
       n = {
       title: "提示",
       body: "下载链接已生成，请点击下载。",
       sureText: "立即下载",
       onSure: function() {
       t.hide(), e._doDownloadFile(o), s.log._showDownloadingDialog()
       }
       };
       t = l.getContext().ui.confirm(n), t.show()
       }
       },
       r = {
       straightforwardDownload: function(o, e) {
       s._switchDownloadTips(o), s.log.straightforwardDownload(e)
       }
       };
       t.exports = r
       });
;
define("file-widget-1:download/service/downloadGuanjiaService.js", function(n, e, a) {
       var i = n("base:widget/libs/jquerypacket.js"),
       t = n("file-widget-1:download/util/downloadCommonUtil.js"),
       o = n("file-widget-1:download/service/dlinkService.js"),
       s = n("file-widget-1:download/service/guanjiaConnector.js"),
       r = {
       GUANJIA_VERSION_COMPARE: "4.8.0",
       GUANJIA_VERSION_DEFAULT: "5.4.4",
       GUANJIA_VERSION_NEW: null,
       GUANJIA_DOWNLOAD_URL: null,
       GUANJIA_DOWNLOAD_URL_XP: "http://issuecdn.baidupcs.com/issue/netdisk/yunguanjia/BaiduYunGuanjia_4.7.6.exe",
       fetchGuanjiaVersion: function() {
       var n = function(n) {
       var e = n.split("V"),
       a = e[1],
       i = /^\d{1,2}\.\d{1,2}\.\d{1,2}$/;
       return i.test(a) === !0 ? a : r.GUANJIA_VERSION_DEFAULT
       };
       return function() {
       var e = this;
       return t.isPlatformMac() ? (e.setGuanjiaVersion("2.0.0"), void e.setGuanjiaURL("http://issuecdn.baidupcs.com/issue/netdisk/MACguanjia/BaiduNetdisk_mac_2.0.0.dmg")) : void i.ajax({
                                                                                                                                                                                         url: "/disk/cmsdata",
                                                                                                                                                                                         data: {
                                                                                                                                                                                         "do": "download"
                                                                                                                                                                                         },
                                                                                                                                                                                         type: "GET",
                                                                                                                                                                                         dataType: "JSON",
                                                                                                                                                                                         cache: !1,
                                                                                                                                                                                         success: function(a) {
                                                                                                                                                                                         var t,
                                                                                                                                                                                         o;
                                                                                                                                                                                         if (0 === a.errorno)
                                                                                                                                                                                         if (a.content)
                                                                                                                                                                                         try {
                                                                                                                                                                                         t = i.parseJSON(a.content), o = n(t.version), e.setGuanjiaVersion(o), e.setGuanjiaURL(t.url)
                                                                                                                                                                                         } catch (s) {
                                                                                                                                                                                         e.setGuanjiaVersion(e.GUANJIA_VERSION_DEFAULT), disk.DEBUG && console.log("The /disk/cmsdata interface is wrong and use the default version : " + e.GUANJIA_VERSION_DEFAULT)
                                                                                                                                                                                         }
                                                                                                                                                                                         else
                                                                                                                                                                                         e.setGuanjiaVersion(e.GUANJIA_VERSION_DEFAULT), disk.DEBUG && console.log("The version is null and use the default version : " + e.GUANJIA_VERSION_DEFAULT);
                                                                                                                                                                                         else
                                                                                                                                                                                         e.setGuanjiaVersion(e.GUANJIA_VERSION_DEFAULT), disk.DEBUG && console.log("The version is wrong and use the default version : " + e.GUANJIA_VERSION_DEFAULT)
                                                                                                                                                                                         },
                                                                                                                                                                                         error: function() {
                                                                                                                                                                                         e.setGuanjiaVersion(e.GUANJIA_VERSION_DEFAULT)
                                                                                                                                                                                         }
                                                                                                                                                                                         })
       }
       }(),
       setGuanjiaVersion: function(n) {
       this.GUANJIA_VERSION_NEW = n
       },
       setGuanjiaURL: function(n) {
       this.GUANJIA_DOWNLOAD_URL = n ? n : "http://issuecdn.baidupcs.com/issue/netdisk/yunguanjia/BaiduYunGuanjia_5.4.4.exe"
       },
       _hasPlugin: function() {
       var n = null;
       try {
       n = new ActiveXObject("YunWebDetect.YunWebDetect.1")
       } catch (e) {
       for (var a = null, i = navigator.plugins, t = 0, o = i.length; o > t; t++)
       if (a = i[t].name || i[t].filename, -1 != a.indexOf("BaiduYunGuanjia")) {
       n = i[t];
       break
       }
       }
       return null != n
       },
       _getFileListData: function(n) {
       return i.stringify({
                          filelist: n
                          })
       }
       },
       u = {
       GUANJIA_VERSION_COMPARE: "4.8.0",
       doError: function(n) {
       var e = navigator.userAgent.toLowerCase(),
       a = "启动百度网盘客户端失败，请安装最新版本";
       /x64/g.test(e) === !0 && /msie\s[678]/i.test(e) === !0 ? a = "加速下载暂不支持64位浏览器，请换个浏览器试试" : e.indexOf("se 2.x") > -1 ? a = "无法启动百度网盘客户端，请换个浏览器试试" : e.indexOf("360se") > -1 ? a = "无法启动百度网盘客户端，请换个浏览器试试" : void 0 === n ? a = "插件已被禁用，请查看浏览器插件设置" : -2 == n ? a = "启动百度网盘客户端失败，请重启浏览器后重试" : -4 == n && (a = "检测到百度网盘客户端已卸载，请重新安装后重试"), t.useToast({
                                                                                                                                                                                                                                                                                                                                                      toastMode: "caution",
                                                                                                                                                                                                                                                                                                                                                      msg: a
                                                                                                                                                                                                                                                                                                                                                      })
       },
       getGuanjiaVersion: function() {
       return s.getVersion()
       },
       callClientDownload: function(n, e) {
       var a,
       i,
       u,
       d = this;
       try {
       a = this.getGuanjiaVersion()
       } catch (l) {
       return disk.DEBUG && console.log("GetVersion()方法错误"), void this.doError()
       }
       switch (o.getCurrentProduct()) {
       case o.PRODUCT_SHARE:
       try {
       t.isPlatformWindows() && !t.compareVersion(a, r.GUANJIA_VERSION_COMPARE) ? (i = r._getFileListData(n), u = 0 === yunData.SHARE_PUBLIC ? s.callGuanjia("DownloadPrivateShareItems", i) : s.callGuanjia("DownloadPublicShareItems", i)) : u = e ? s.callGuanjia("DownloadShareItems", e, yunData.MYUK, !1) : 2, 0 > u && d.doError(u)
       } catch (l) {
       u = -2, d.doError(u)
       }
       break;
       case o.PRODUCT_MBOX:
       try {
       u = e ? s.callGuanjia("DownloadShareItems", e, yunData.MYUK, !0) : 2, 0 > u && d.doError(u)
       } catch (l) {
       u = -2, d.doError(u)
       }
       break;
       default:
       i = r._getFileListData(n);
       try {
       u = t.isPlatformWindows() && !t.compareVersion(a, r.GUANJIA_VERSION_COMPARE) ? s.callGuanjia("DownloadSelfOwnItems", i, yunData.MYNAME) : s.callGuanjia("DownloadSelfOwnItems", i, yunData.MYUK + ""), 0 > u && d.doError(u)
       } catch (l) {
       u = -2, d.doError(u)
       }
       }
       },
       getDownloadGuanjiaUrl: function(n) {
       var e;
       return n ? "http://bcscdn.baidu.com/netdisk/BaiduYunGuanjia_" + n + ".exe" : (e = navigator.userAgent, -1 === e.indexOf("Windows NT 5.1") ? (null === r.GUANJIA_DOWNLOAD_URL && r.fetchGuanjiaVersion(), r.GUANJIA_DOWNLOAD_URL) : r.GUANJIA_DOWNLOAD_URL_XP)
       },
       getDownloadGuanjiaUrlOfNew: function() {
       return null === r.GUANJIA_DOWNLOAD_URL && r.fetchGuanjiaVersion(), r.GUANJIA_DOWNLOAD_URL
       },
       checkAvailability: function() {
       return s.getVersion()
       },
       initConnector: function(n) {
       s.init(n)
       },
       initDownload: function() {
       r.fetchGuanjiaVersion()
       }
       };
       u.initDownload(), a.exports = u
       });
;
define("file-widget-1:download/service/downloadManager.js", function(i, t, e) {
       var s = !1,
       o = i("base:widget/libs/jquerypacket.js"),
       a = i("base:widget/libs/underscore.js"),
       n = i("file-widget-1:download/util/context.js"),
       l = i("file-widget-1:download/service/dlinkService.js"),
       d = i("file-widget-1:download/util/downloadCommonUtil.js"),
       r = i("file-widget-1:download/service/downloadDirectService.js"),
       h = i("file-widget-1:download/service/downloadGuanjiaService.js"),
       g = window.yunData || g,
       p = function(i, t, e, s, o) {
       this._mList = i, this._mIsFile = t, this._mPackName = e, this._mGuanjiaString = s, this._mOpts = o, this._mIspName = null, this._mIsVideoGuideMode = !(l.getCurrentProduct() === l.PRODUCT_SHARE || "mpage" === o.product_second), this._mIsVideo = this._mIsVideoGuideMode && t ? 1 === +i.category : !1, this._mIsChrome = d.isChromeAndGreaterThan42(), this.videoGuideText = "", this.logMode = !1, this._mMsgId = disk.obtainId(), this._mPositiveId = disk.obtainId(), this._mNegativeId = disk.obtainId(), this._mPositiveVideoId = disk.obtainId(), this._mNegativeVideoId = disk.obtainId(), this._mClientHintId = disk.obtainId(), this._mDownloadTipsId = disk.obtainId(), this.dialog = null, this._mMode = p.MODE_PRE_DOWNLOAD, this._mFirst = !0, this._mCheckCount = p.MAX_CHECK_COUNT, this._init(), this.queryIp()
       };
       p.DIALOG_ID = "moduleDownloadDialog", p.MAX_CHECK_COUNT = 3, p.MODE_PRE_DOWNLOAD = 0, p.MODE_PRE_INSTALL = 1, p.MODE_POST_INSTALL = 2, p.MODE_POST_RETRY = 3, p.MODE_DIRECT_DOWNLOAD = 4, p.SIZE_SINGLE_SHARE = 314572800, p.SIZE_THRESHOLD = 314572800, p.SIZE_THRESHOLD_CHROME = 314572800, p.SMALL_SIZE_FILE = 52428800, p.MEDIUM_SIZE_FILE = 314572800, p.SIZE_THRESHOLD_DEFAULT = 300, p.SIZE_THRESHOLD_CHROME_DEFAULT = 300, p.TO_SIZE_M = 1048576, p.setThresholdSizeDefault = function() {
       p.SIZE_THRESHOLD = p.SIZE_THRESHOLD_DEFAULT * p.TO_SIZE_M, p.SIZE_THRESHOLD_CHROME = p.SIZE_THRESHOLD_CHROME_DEFAULT * p.TO_SIZE_M, disk.DEBUG && console.log("The /disk/cmsdata interface is wrong and use the default version : " + p.SIZE_THRESHOLD_DEFAULT + ", chrome-" + p.SIZE_THRESHOLD_CHROME_DEFAULT)
       }, p.FILES_NUMBER = 100, p.guanjiaVersion = "", p.initSingleFileToGuanjiaLimit = function() {
       var i = !1;
       return function(t) {
       return i === !0 ? void ("function" == typeof t && t()) : void o.ajax({
                                                                            url: "/disk/cmsdata",
                                                                            data: {
                                                                            "do": "manual",
                                                                            ch: "download_limit"
                                                                            },
                                                                            type: "GET",
                                                                            dataType: "JSON",
                                                                            cache: !1,
                                                                            timeout: 5e3,
                                                                            success: function(e) {
                                                                            var s;
                                                                            if (0 === e.errorno)
                                                                            if (e.content)
                                                                            try {
                                                                            s = o.parseJSON(e.content)[0], s.download_limit ? (s.download_limit = parseInt(s.download_limit, 10), p.SIZE_THRESHOLD = s.download_limit * p.TO_SIZE_M) : p.SIZE_THRESHOLD = p.SIZE_THRESHOLD_DEFAULT * p.TO_SIZE_M, s.download_limit_chrome ? (s.download_limit_chrome = parseInt(s.download_limit_chrome, 10), p.SIZE_THRESHOLD_CHROME = s.download_limit_chrome * p.TO_SIZE_M) : p.SIZE_THRESHOLD_CHROME = p.SIZE_THRESHOLD_CHROME_DEFAULT * p.TO_SIZE_M
                                                                            } catch (a) {
                                                                            p.setThresholdSizeDefault()
                                                                            }
                                                                            else
                                                                            p.setThresholdSizeDefault();
                                                                            else
                                                                            p.setThresholdSizeDefault();
                                                                            i = !0, "function" == typeof t && t()
                                                                            },
                                                                            error: function() {
                                                                            p.setThresholdSizeDefault(), "function" == typeof t && t()
                                                                            }
                                                                            })
       }
       }(), p.prototype._init = function() {
       this.initDialogDom()
       }, p.prototype._event = function() {
       var i = this;
       o("#" + p.DIALOG_ID).delegate("#" + this._mPositiveId, "click", function() {
                                     return s && console.log("dispatchPositiveEvent"), i.dispatchPositiveEvent()
                                     }), o("#" + p.DIALOG_ID).delegate("#" + this._mNegativeId, "click", function() {
                                                                       return s && console.log("dispatchNegativeEvent"), i.dispatchNegativeEvent()
                                                                       }), o("#" + p.DIALOG_ID).delegate("#" + this._mPositiveVideoId, "click", function() {
                                                                                                         return s && console.log("dispatchPositiveEvent"), n.getContext().log.send({
                                                                                                                                                                                   url: "//pan.baidu.com/api/analytics",
                                                                                                                                                                                   type: "video_download_guide_positive_" + (i.logMode || i._mMode)
                                                                                                                                                                                   }), i.dispatchPositiveEvent()
                                                                                                         }), o("#" + p.DIALOG_ID).delegate("#" + this._mNegativeVideoId, "click", function() {
                                                                                                                                           return s && console.log("dispatchNegativeEvent"), n.getContext().log.send({
                                                                                                                                                                                                                     url: "//pan.baidu.com/api/analytics",
                                                                                                                                                                                                                     type: "video_download_guide_negative_" + i._mMode
                                                                                                                                                                                                                     }), i.dispatchNegativeEvent(), !1
                                                                                                                                           }), o("#" + p.DIALOG_ID).delegate(".playLink", "click", function() {
                                                                                                                                                                             i.dialog.hide(), n.getContext().log.send({
                                                                                                                                                                                                                      url: "//pan.baidu.com/api/analytics",
                                                                                                                                                                                                                      type: "video_download_guide_playclick_" + (i.logMode || i._mMode)
                                                                                                                                                                                                                      })
                                                                                                                                                                             }), o("#" + p.DIALOG_ID).delegate("#goToBuy", "click", function() {
                                                                                                                                                                                                               return n.getContext().log.send({
                                                                                                                                                                                                                                              url: "//pan.baidu.com/api/analytics",
                                                                                                                                                                                                                                              type: "cilick_isp_buy"
                                                                                                                                                                                                                                              }), window.open("/buy/center?tag=2&frm=dl#network"), !1
                                                                                                                                                                                                               }), o("#goToBuyVip").click(function() {
                                                                                                                                                                                                                                          return n.getContext().log.send({
                                                                                                                                                                                                                                                                         url: "//pan.baidu.com/api/analytics",
                                                                                                                                                                                                                                                                         type: "download_buyvip_click"
                                                                                                                                                                                                                                                                         }), window.open("//yun.baidu.com/buy/center?tag=8&from=speedup#question=vip-speed"), !1
                                                                                                                                                                                                                                          })
       }, p.getDownloadUrl = function(i) {
       return o.browser.msie ? i.dlink + "&response-cache-control=private" : i.dlink
       }, p.prototype.setGuanjiaVersion = function() {
       p.guanjiaVersion || (p.guanjiaVersion = h.getGuanjiaVersion())
       };
       var _ = g.SHARE_UK ? "share-" : "";
       p.logMsg = {
       category: _ + "singleFileDownloadCategory",
       singleFileCategory: _ + "singleFileDownloadCategory",
       multipleFileCategory: _ + "multipleFileDownloadCategory",
       actionRecommendPlugin: "actionRecommendPluginDialog",
       actionCompulsoryPlugin: "actionCompulsoryPluginDialog",
       actionDownloadByPlugin: "actionDownloadByPluginAction",
       actionDownloadClient: "downloadClientAction",
       actionInstallClient: "installClientAction",
       actionAccelerateDownload: "accelerateDownloadAction",
       actionOrdinaryDownload: "ordinaryDownloadAction",
       actionDownReportIssue: "downReportIssueAction",
       opt_value: 10
       }, p.straightforwardDownload = function(i, t) {
       r.straightforwardDownload(i, t)
       }, p.prototype.initDialogDom = function() {
       var i = [];
       i.push('<div class="module-download-dialog">'), i.push('<div class="content">'), i.push('<div id="' + this._mMsgId + '_videoGuideBox" class="videoGuide">'), i.push('<div class="guideHeader"></div>'), i.push('<div class="guidePreview"></div>'), i.push("</div>"), i.push('<div id="' + this._mMsgId + '" class="message global-center">加载中&hellip;</div>'), i.push('<div id="' + this._mClientHintId + '" class="g-clearfix download-manage-client-hint g-center"></div>'), i.push('<div class="dlg-ft">'), i.push('<div class="g-clearfix g-center">'), i.push('<div class="videoBtnBox">'), i.push('<a href="javascript:;" id="' + this._mPositiveVideoId + '" class="g-button g-button-large g-button-blue-large">'), i.push('<span class="g-button-right">'), i.push('<span class="text">' + (g.ISSVIP && 1 === +g.ISSVIP ? '<em class="d-svip-icon"></em>超级会员极速下载' : 1 === +g.ISVIP ? '<em class="d-vip-icon"></em>会员高速下载' : "高速下载（推荐）") + "</span>"), i.push("</span>"), i.push("</a>"), i.push('<a href="javascript:;" id="' + this._mNegativeVideoId + '" class="g-button g-button-large g-button-gray-large">'), i.push('<span class="g-button-right">普通下载</span>'), i.push('<i class="lineheight-ie7"></i>'), i.push("</a>"), i.push("</div>"), i.push('<div class="normalBtnBox">'), i.push('<a href="javascript:;" id="' + this._mPositiveId + '" node-type="download-speedup" class="g-button g-button-large g-button-blue-large">'), i.push('<span class="g-button-right">'), i.push('<span class="text">' + (g.ISSVIP && 1 === +g.ISSVIP ? '<em class="d-svip-icon"></em>超级会员极速下载' : 1 === +g.ISVIP ? '<em class="d-vip-icon"></em>会员高速下载' : "高速下载（推荐）") + "</span>"), i.push("</span>"), i.push("</a>"), i.push('<a href="javascript:;"  id="' + this._mNegativeId + '" node-type="download-normal" class="g-button g-button-large g-button-gray-large">'), i.push('<span class="g-button-right">'), i.push('<span class="text">普通下载</span>'), i.push("</span>"), i.push("</a>"), i.push("</div>"), i.push("</div>"), i.push("</div>"), i.push("</div>"), i.push('<div class="dlg-ft01 b-rlv" id="show-acceleration-pack">'), i.push('<div class="g-clearfix center acceleration-pack">'), i.push('<span class="dowmload-imgs-style dowmload-imgs-style01"></span>'), i.push('<span class="dowmload-content-style">还想更快？购买网络加速包，最高</span>'), i.push('<span class="download-upspeed-style">提速40%</span>'), i.push('        <a href="javascript:;" id="goToBuy" class="g-button-small g-button abtn download-change-link-style">'), i.push('            <b class="g-button-right">立即提速</b>'), i.push("        </a>"), i.push("</div>"), i.push("</div>"), i.push('<div class="dlg-ft01 b-rlv" id="show-buyvip-pack" style="display:none;">'), i.push('    <div class="g-clearfix center buyvip-pack">'), i.push('        <span class="dowmload-imgs-style dowmload-imgs-style01"></span>'), i.push('        <span class="dowmload-content-style">买超级会员享提速特权，下载速度最高</span>'), i.push('        <span class="download-upspeed-style">提升200%</span>'), i.push('        <a href="javascript:;" id="goToBuyVip" class="g-button-small g-button abtn download-change-link-style">'), i.push('            <b class="g-button-right">立即提速</b>'), i.push("        </a>"), i.push("    </div>"), i.push("</div>"), this.dialogDom = i.join("")
       }, p.prototype.initDialog = function() {
       this.dialog || (this.dialog = n.getContext().ui.window({
                                                              id: p.DIALOG_ID,
                                                              title: "文件下载",
                                                              body: this.dialogDom,
                                                              width: "568px"
                                                              }), this._event())
       }, p.prototype.setMode = function(i) {
       this._mMode = i
       }, p.prototype.setDependencyData = function(i, t, e, s, o) {
       this._mList = i, this._mIsFile = t, this._mPackName = e, this._mGuanjiaString = s, this._mOpts = o, this._mIsVideo = this._mIsVideoGuideMode && t ? 1 === +i.category : !1
       }, p.prototype._resolveDisplayName = function() {
       if ("number" != typeof this._mList.length)
       return this._mList.server_filename;
       var i = this._mPackName;
       if (this._mIsFile === !0) {
       var t = i.lastIndexOf(".");
       -1 != t && (i = i.substring(0, t))
       }
       return 1 == this._mList.length ? i : i + "等（<strong>" + this._mList.length + "</strong>）个文件"
       }, p.prototype.isHugeFile = function() {
       var i = p.SIZE_THRESHOLD;
       return this._mIsChrome && (i = p.SIZE_THRESHOLD_CHROME), "number" != typeof this._mList.length && this._mList.size >= i
       }, p.prototype.isMediumFile = function() {
       return "number" != typeof this._mList.length && this._mList.size < p.SIZE_THRESHOLD && this._mList.size >= p.SMALL_SIZE_FILE
       }, p.prototype.getFileSizeType = function() {
       var i = 1048576,
       t = 0,
       e = !0,
       s = 0;
       if (a.isArray(this._mList) === !0) {
       e = !1;
       for (var o = 0; o < this._mList.length && !(t > 300 * i); o++)
       t += this._mList[o].size
       } else
       t = this._mList.size;
       if (t = Math.ceil(t / i), e) {
       var n = [0, 50, 100, 200, 300];
       n.sort(function(i, e) {
              return t > i && e >= t ? s = i : t > e && (s = e), s
              })
       } else {
       var n = [0, 100, 300];
       n.sort(function(i, e) {
              return t > i && e >= t ? s = i : t > e && (s = e), s
              })
       }
       return s
       }, p.prototype.isSmallFile = function() {
       return "number" != typeof this._mList.length && this._mList.size <= p.SMALL_SIZE_FILE
       }, p.prototype.isBatchFiles = function() {
       return "number" == typeof this._mList.length
       }, p.prototype.putIconifyName = function(i) {
       var t,
       e,
       s,
       a,
       l = "",
       d = n.getContext().file.getIconAndPlugin;
       i === !0 ? (this.dialog.$dialog.find(".dialog-header-title").text("高速下载"), this._mIsVideo ? l += '<p class="download-mgr-dialog-title"></p>' : l = '<p class="download-mgr-dialog-icon"></p><p class="download-mgr-dialog-title">百度网盘客户端</p>', l += '<p class="download-mgr-dialog-text">快速、稳定下载大文件，请使用百度网盘客户端下载，还支持断点续传哟~</p>') : l = '<span class="fileicon"></span>' + this._resolveDisplayName(), o("#" + this._mMsgId).html(l), a = o(".fileicon", "#" + this._mMsgId), this._mList.length > 1 ? (this._mList instanceof Array && (s = this._mList[0]), t = n.getContext().file.getIconAndPlugin(s.path, 1, !0).smallIcon) : (s = this._mList instanceof Array ? this._mList[0] : this._mList, 1 == s.isdir ? t = d(s.path, 1).smallIcon : (e = s.path, t = d(e, 0).smallIcon)), a.addClass(t), a.css("margin-right", "8px")
       }, p.prototype.videoTypePreview = function(i, t) {
       var e = o("#" + this._mMsgId + "_videoGuideBox"),
       s = e.find(".guideHeader"),
       a = e.find(".guidePreview"),
       l = this._mList,
       r = this,
       h = o("#" + this._mPositiveVideoId).parent(),
       _ = o("#" + this._mPositiveId).parent();
       if (this._mIsVideo) {
       var m = o('<a target="_blank" class="playLink" href="/play/video#video/path=' + encodeURI(l.path) + '&t=-1"><div class="playBox"><i title="播放" class="playIcon"></i><span class="playText">点击播放</span></div></a>'),
       c = "";
       l.thumbs && l.thumbs.url2 && (c = l.thumbs.url2), a.html(m).attr("style", "background:url(" + c + ") 50% 50% no-repeat").show();
       var u = p.SIZE_THRESHOLD;
       if (this._mIsChrome && (u = p.SIZE_THRESHOLD_CHROME), l.size > u ? s.html("<span>" + this.videoGuideText + "</span></div>").show() : s.html('<div class="decorLine"></div><span>' + this.videoGuideText + '</span><div class="decorLine lineR"></div>').show(), r._mMode === p.MODE_POST_INSTALL ? (h.hide(), _.show()) : (h.show(), _.hide()), r._mMode !== p.MODE_POST_INSTALL || t || i) {
       if (r.logMode = !1, t && r._mMode === p.MODE_POST_INSTALL)
       return;
       if (i && (r._mMode === p.MODE_POST_RETRY || r._mMode === p.MODE_PRE_INSTALL))
       return
       } else
       r.logMode = 3;
       n.getContext().log.send({
                               page: d.getDownloadLogmsg(),
                               url: "//pan.baidu.com/api/analytics",
                               type: "video_download_guide_window_" + (r.logMode || r._mMode)
                               }), this._mIspName && 1 === +g.ISSVIP ? o("#show-acceleration-pack").fadeIn("200") : 1 !== +g.ISSVIP && this.showBuyVipPkgGuide()
       } else
       s.hide(), a.hide(), h.hide(), _.show();
       this.dialog.position("center")
       }, p.prototype.updateMode = function(i, t) {
       var e = this;
       switch (s && console.log("this mode is:" + this._mMode), o("div.chromeUpgradeHelpTip", this.dialog.$dialog).remove(), this._mMode) {
       case p.MODE_PRE_DOWNLOAD:
       this.videoGuideText = "点击立即播放，无需下载即可在线观看视频", this._mIspName && 1 === +g.ISSVIP ? o("#show-acceleration-pack").fadeIn("200") : 1 !== +g.ISSVIP && this.showBuyVipPkgGuide(), o("#" + this._mClientHintId).css("display", "none"), o("#" + this._mMsgId).removeClass("download-mgr-tight"), this.putIconifyName(), this._mIsVideo && (o(".g-button-right span", "#" + this._mPositiveVideoId).html(g.ISSVIP && 1 === +g.ISSVIP ? '<em class="d-svip-icon"></em>超级会员极速下载' : 1 === +g.ISVIP ? '<em class="d-vip-icon"></em>会员高速下载' : "高速下载（推荐）"), o("#" + this._mPositiveVideoId).attr("href", "javascript:;").css("display", ""), o("#" + this._mNegativeVideoId).html('<span class="g-button-right">普通下载</span>'), o("#" + this._mNegativeVideoId).css("display", "")), o(".g-button-right span", "#" + this._mPositiveId).html(g.ISSVIP && 1 === +g.ISSVIP ? '<em class="d-svip-icon"></em>超级会员极速下载' : 1 === +g.ISVIP ? '<em class="d-vip-icon"></em>会员高速下载' : "高速下载（推荐）"), o("#" + this._mPositiveId).attr("href", "javascript:;").css("display", ""), o(".g-button-right", "#" + this._mNegativeId).text("普通下载"), o("#" + this._mNegativeId).css("display", ""), this.dialog.$dialog.find(".dialog-header-title").text("文件下载"), s && console.log("display download options"), n.getContext().log.send({
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              type: p.logMsg.category + "-" + p.logMsg.actionRecommendPlugin
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              }), this.dialog.show();
       break;
       case p.MODE_PRE_INSTALL:
       o("#" + this._mMsgId).addClass("download-mgr-tight"), o("#" + this._mPositiveId).css("display", ""), o("#" + this._mPositiveVideoId).css("display", ""), o(".text", "#" + this._mPositiveId).text("安装最新版网盘客户端"), o(".text", "#" + this._mPositiveVideoId).text("安装最新版网盘客户端"), o("#" + this._mPositiveId).attr("href", "javascript:;"), o("#" + this._mPositiveVideoId).attr("href", "javascript:;"), o("#" + this._mNegativeId).css("display", "none"), o("#" + this._mNegativeVideoId).css("display", "none"), o("#" + this._mDownloadTipsId).css("display", "none"), o("#" + this._mClientHintId).css("display", "none"), this.dialog.$dialog.find(".dialog-header-title").text("文件下载");
       var a = !0,
       r = p.SIZE_THRESHOLD;
       if (this._mIsChrome && (r = p.SIZE_THRESHOLD_CHROME), "number" != typeof this._mList.length)
       this._mList.size > r ? (this._mIsVideo ? this.videoGuideText = "你下载的文件过大，请使用百度网盘客户端或点击预览在线观看" : o("#" + this._mClientHintId).html("你下载的文件过大，请使用百度网盘客户端。").show(), a = !1) : (o("#show-acceleration-pack").hide(), o("#show-buyvip-pack").hide(), o("#" + this._mClientHintId).html("").hide());
       else if ("number" == typeof this._mList.length) {
       for (var _ = 0, m = 0, c = 0; c < this._mList.length; c++)
       _ += this._mList[c].size, 1 == this._mList[c].isdir ? m = 1 : "";
       l.getCurrentProduct() !== l.PRODUCT_MBOX ? (_ > p.MEDIUM_SIZE_FILE || this._mList.length > p.FILES_NUMBER) && (o("#" + this._mClientHintId).html("你下载的文件过大或者过多，请使用百度网盘客户端下载。").show(), a = !1) : (_ > p.MEDIUM_SIZE_FILE || this._mList.length > 50) && (o("#" + this._mClientHintId).html("你下载的文件过大或者过多，请使用百度网盘客户端下载。").show(), a = !1), 1 == m ? (o("#" + this._mClientHintId).html("你下载的内容包含文件夹，请使用百度网盘客户端下载。").show(), a = !1) : o("#" + this._mClientHintId).html("").hide()
       } else
       o("#" + this._mClientHintId).html("").hide();
       if (this.putIconifyName(a), this._mIsVideo && -1 === location.pathname.indexOf("/disk/home") && (i = 1), this._mIsVideo && !i) {
       o("#" + this._mPositiveVideoId).css("display", ""), o("#" + this._mNegativeVideoId).css("display", "none"), o(".g-button-right span", "#" + this._mPositiveVideoId).html(g.ISSVIP && 1 === +g.ISSVIP ? '<em class="d-svip-icon"></em>超级会员极速下载' : 1 === +g.ISVIP ? '<em class="d-vip-icon"></em>会员高速下载' : "高速下载（推荐）"), this.dialog.show(), this._mIsVideoShow = !0;
       break
       }
       if (this.dialog.hide(), this._mIsVideoShow = !1, h.checkAvailability()) {
       try {
       this.setGuanjiaVersion()
       } catch (u) {
       return s && console.log("GetVersion()方法错误"), h.doError(), this.dialog.hide(), void n.getContext().log.send({
                                                                                                                  name: "callGuanjia",
                                                                                                                  value: "failure"
                                                                                                                  })
       }
       if (this._mOpts.ct = "pcygj", this._mOpts.cv = p.guanjiaVersion, l.getCurrentProduct() !== l.PRODUCT_PAN)
       if (l.getCurrentProduct() === l.PRODUCT_MBOX) {
       if (d.isPlatformWindows() && p.guanjiaVersion < h.GUANJIA_VERSION_COMPARE) {
       var I = o("#" + this._mMsgId + "_videoGuideBox"),
       v = I.find(".guideHeader"),
       D = I.find(".guidePreview");
       return v.hide(), D.hide(), this._mIsVideo ? this.videoTypePreview(i, t) : o("#" + this._mPositiveVideoId).hide(), o(".download-mgr-dialog-text").hide(), o("#" + this._mClientHintId).html("您的网盘客户端版本太低，请安装新版本").show(), void n.getContext().log.send({
                                                                                                                                                                                                                                                             name: "callGuanjia",
                                                                                                                                                                                                                                                             value: "failure"
                                                                                                                                                                                                                                                             })
       }
       (!this._mIsVideo || i) && (d.useToast({
                                             toastMode: "loading",
                                             msg: "正在获取下载链接，请稍后..."
                                             }), this._mOpts.isForGuanjia = !0, l.getDlinkMbox(this._mOpts, function(i) {
                                                                                               d.useCloseToast(), h.callClientDownload(void 0, i.list), n.getContext().log.send({
                                                                                                                                                                                name: "callGuanjia",
                                                                                                                                                                                value: "success"
                                                                                                                                                                                })
                                                                                               }))
       } else
       l.getCurrentProduct() === l.PRODUCT_SHARE && (this._doCallGuanjiaForShare(), n.getContext().log.send({
                                                                                                            name: "callGuanjia",
                                                                                                            value: "success"
                                                                                                            }));
       else
       (!this._mIsVideo || i) && (this.doCallGuanjia(), n.getContext().log.send({
                                                                                name: "callGuanjia",
                                                                                value: "success"
                                                                                }));
       this.loadingTips && this.loadingTips.hide()
       } else {
       if (0 === o("div.chromeUpgradeHelpTip", this.dialog.$dialog).length) {
       var y = o('<div class="chromeUpgradeHelpTip" style="text-align: center;position:relative;margin-bottom:20px;">已安装新版客户端，仍无法下载，<a style="color:#FF0000;" href="javascript:void(0);" target="_blank">点击启动服务</a></div>');
       o("div.dlg-ft", this.dialog.$dialog).after(y), y.bind("click", function() {
                                                             return location.protocol.indexOf("https") > -1 && !d.getFlashVersion() ? void 0 : (e.dialog.hide(), d.openYunGuanjiaByScheme("baiduyunguanjia://guanjia/noui", function() {
                                                                                                                                                                                          p.MAX_CHECK_COUNT = 7, e._mCheckCount = p.MAX_CHECK_COUNT, e._mMode = p.MODE_PRE_INSTALL, e.updateMode(1)
                                                                                                                                                                                          }), !1)
                                                             })
       }
       location.protocol.indexOf("https") > -1 && !d.getFlashVersion() ? o("div.chromeUpgradeHelpTip a").text("点击查看教程").attr("href", "/disk/help#FAQ18") : o("div.chromeUpgradeHelpTip a").text("点击启动服务").attr("href", "javascript:void(0);"), this._mCheckCount > 0 ? (this.dialog.hide(), this._mCheckCount === p.MAX_CHECK_COUNT && (3 === p.MAX_CHECK_COUNT ? h.initConnector() : h.initConnector(!0), this.loadingTips = n.getContext().ui.tip({
                                                                                                                                                                                                                                                                                                                                                                                                                                                    msg: "正在启动网盘客户端，请稍候...",
                                                                                                                                                                                                                                                                                                                                                                                                                                                    mode: "loading",
                                                                                                                                                                                                                                                                                                                                                                                                                                                    autoClose: !1
                                                                                                                                                                                                                                                                                                                                                                                                                                                    })), this._mCheckCount--, setTimeout(function() {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         e._mMode = p.MODE_PRE_INSTALL, e.updateMode(i)
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         }, 500)) : this._mFirst ? (this._mFirst = !1, d.openYunGuanjiaByScheme("baiduyunguanjia://guanjia/noui", function() {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                p.MAX_CHECK_COUNT = 7, e._mCheckCount = p.MAX_CHECK_COUNT, e._mMode = p.MODE_PRE_INSTALL, e.updateMode(i)
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                })) : (this.dialog.show(), this.loadingTips.hide(), n.getContext().log.send({
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            name: "callGuanjia",
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            value: "failure"
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            })), n.getContext().log.send({
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         page: d.getDownloadLogmsg(),
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         type: this.isHugeFile() ? "DownloadPluginDisplayForceHugeOptions" : "DownloadPluginDisplayForceNonhugeOptions"
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         })
       }
       a || n.getContext().log.send({
                                    page: d.getDownloadLogmsg(),
                                    type: p.logMsg.category + "-" + p.logMsg.actionCompulsoryPlugin
                                    });
       break;
       case p.MODE_POST_INSTALL:
       l.getCurrentProduct() === l.PRODUCT_MBOX ? (o("#" + this._mPositiveId).attr("href", h.getDownloadGuanjiaUrlOfNew()), o("#" + this._mPositiveVideoId).attr("href", h.getDownloadGuanjiaUrl())) : (o("#" + this._mPositiveId).attr("href", h.getDownloadGuanjiaUrl()), o("#" + this._mPositiveVideoId).attr("href", h.getDownloadGuanjiaUrl())), o("#" + this._mClientHintId).css("display", "none"), o("#" + this._mMsgId).removeClass("download-mgr-tight").html("<p>安装完成后，重启浏览器即可高速下载</p>"), o("#" + this._mPositiveId).css("display", "none"), o("#" + this._mPositiveVideoId).css("display", "none"), o("#" + this._mNegativeId).css("display", ""), o("#" + this._mNegativeVideoId).css("display", ""), o("span", "#" + this._mNegativeId).text("知道了"), o("#" + this._mNegativeVideoId).text("知道了"), o("#" + this._mNegativeId).show(), o("#" + this._mPositiveVideoId).parent().hide(), o("#" + this._mPositiveId).parent().show(), this.dialog.show();
       break;
       case p.MODE_DIRECT_DOWNLOAD:
       e.dispatchNegativeEvent()
       }
       this.videoTypePreview(i, t)
       }, p.prototype._doCallGuanjiaForShare = function() {
       var i = function(i, t, e) {
       var s,
       a = [],
       r = [],
       p = i,
       _ = n.getContext().tools.baseService.getCookie("BDCLND");
       if ("number" != typeof i._mList.length)
       s = {}, s.isdir = "0", s.md5 = i._mList.md5, s.server_path = i._mList.path, s.size = String(i._mList.size), s.shareid = t, s.uk = e, s.token = _ || "", s.fs_id = i._mList.fs_id, i._mList.dlink ? s.link = d.getDownloadUrl(i._mList) : r.push(i._mList.fs_id), a = [s];
       else
       for (var m = null, c = 0, u = i._mList.length; u > c; c++)
       s = {}, m = i._mList[c], s.isdir = String(m.isdir), s.md5 = m.md5 || "", s.size = String(m.size || 0), s.server_path = m.path, s.uk = e, s.shareid = t, s.token = _ || "", s.fs_id = m.fs_id, m.dlink || m.isdir ? s.link = m.dlink && d.getDownloadUrl(m) || "" : r.push(m.fs_id), a.push(s);
       r.length > 0 ? (d.useToast({
                                  toastMode: "loading",
                                  msg: "正在获取下载链接，请稍后..."
                                  }), l.getDlinkShare(i._mOpts, function(i) {
                                                      d.useCloseToast(), a = p.getFormatedLinkList(a, i.list), h.callClientDownload(a)
                                                      })) : (o.get("/share/autoincre", {
                                                                   type: 1,
                                                                   uk: g.SHARE_UK,
                                                                   shareid: g.SHARE_ID,
                                                                   sign: g.SIGN,
                                                                   timestamp: g.TIMESTAMP
                                                                   }), h.callClientDownload(a))
       };
       return function() {
       d.isPlatformWindows() && p.guanjiaVersion < h.GUANJIA_VERSION_COMPARE ? i(this, g.SHARE_ID, g.SHARE_UK) : (d.useToast({
                                                                                                                             toastMode: "loading",
                                                                                                                             msg: "正在获取下载链接，请稍后...",
                                                                                                                             autoClose: !1
                                                                                                                             }), this._mOpts.isForGuanjia = !0, l.getDlinkShare(this._mOpts, function(i) {
                                                                                                                                                                                d.useCloseToast(), h.callClientDownload(void 0, i.list)
                                                                                                                                                                                }))
       }
       }(), p.prototype.doCallGuanjia = function() {
       var i,
       t = [],
       e = [],
       s = this;
       if ("number" != typeof this._mList.length)
       i = {}, i.isdir = "0", i.md5 = this._mList.md5, i.server_path = this._mList.path, i.size = String(this._mList.size), i.shareid = "", i.uk = "", i.token = "", i.fs_id = this._mList.fs_id, this._mList.dlink ? i.link = d.getDownloadUrl(this._mList) : e.push(this._mList.fs_id), t = [i];
       else
       for (var o = null, a = 0, n = this._mList.length; n > a; a++)
       i = {}, o = this._mList[a], i.isdir = String(o.isdir), i.md5 = o.md5 || "", i.size = String(o.size || 0), i.server_path = o.path, i.uk = "", i.shareid = "", i.token = "", i.fs_id = o.fs_id, o.dlink || o.isdir ? i.link = o.dlink && d.getDownloadUrl(o) || "" : e.push(o.fs_id), t.push(i);
       e.length > 0 ? (d.useToast({
                                  toastMode: "loading",
                                  msg: "正在获取下载链接，请稍后...",
                                  autoClose: !1
                                  }), l.getDlinkPan(l.getFsidListData(this._mList), "dlink", function(i) {
                                                    0 === i.errno && (d.useCloseToast(), t = s.getFormatedLinkList(t, i.dlink), h.callClientDownload(t))
                                                    }, "pcygj", p.guanjiaVersion)) : h.callClientDownload(t)
       }, p.prototype.getFormatedLinkList = function(i, t) {
       for (var e, s = 0, o = i.length; o > s; s++) {
       e = i[s];
       for (var a = t.length - 1; a >= 0; a--)
       e.fs_id == t[a].fs_id && (e.link = t[a].dlink || "", t.splice(a, 1))
       }
       return i
       }, p.prototype.dispatchNegativeEvent = function() {
       switch (this._mMode) {
       case p.MODE_PRE_DOWNLOAD:
       n.getContext().log.send({
                               page: d.getDownloadLogmsg(),
                               type: p.logMsg.category + "-" + p.logMsg.actionOrdinaryDownload,
                               fileSize: this.getFileSizeType()
                               }), s && console.log("small file download ? " + this.isSmallFile()), this.dialog.hide(), d.useCloseToast(), this.preDownload();
       break;
       case p.MODE_PRE_INSTALL:
       break;
       case p.MODE_POST_INSTALL:
       case p.MODE_POST_RETRY:
       s && console.log("report client download installation issue"), this.dialog.hide(), n.getContext().log.send({
                                                                                                                  page: d.getDownloadLogmsg(),
                                                                                                                  type: p.logMsg.category + "-" + p.logMsg.actionDownReportIssue
                                                                                                                  });
       break;
       case p.MODE_DIRECT_DOWNLOAD:
       n.getContext().log.send({
                               page: d.getDownloadLogmsg(),
                               type: this.isSmallFile() ? "DownloadPluginLowSmallFileDownload" : "DownloadPluginLowBatchFilesDownload",
                               fileSize: this.getFileSizeType()
                               }), s && console.log("small file download ? " + this.isSmallFile()), this.dialog.hide(), this.directDownload();
       break;
       case p.MODE_SMALLVIDEO_PRE_DOWNLOAD:
       this.preDownload()
       }
       }, p.prototype.directDownload = function() {
       var i = {},
       t = this;
       this._mOpts.isForBatch = !1, l.getCurrentProduct() === l.PRODUCT_MBOX ? l.getDlinkMbox(this._mOpts, function(e) {
                                                                                              i.dlink = e.list[0].dlink, e.logType && (i.logType = e.logType), e.logFrom && (i.logFrom = e.logFrom), p.straightforwardDownload(i, t._mList)
                                                                                              }) : l.getCurrentProduct() === l.PRODUCT_SHARE ? l.getDlinkShare(this._mOpts, function(e) {
                                                                                                                                                               i.dlink = e.list[0].dlink, e.logType && (i.logType = e.logType), e.logFrom && (i.logFrom = e.logFrom), p.straightforwardDownload(i, t._mList)
                                                                                                                                                               }) : this._mList.dlink && /^https?:\/\//.test(this._mList.dlink) ? (i = this._mList, i.logType = "webdownload", i.logFrom = "hasDlink", p.straightforwardDownload(i, this._mList)) : l.getDlinkPan(l.getFsidListData(this._mList), "dlink", function(e) {
       i.dlink = e.dlink[0].dlink, e.logType && (i.logType = e.logType), e.logFrom && (i.logFrom = e.logFrom), p.straightforwardDownload(i, t._mList)
       })
}, p.prototype.preDownload = function() {
    var i = {},
    t = this;
    a.isArray(this._mList) === !0 ? (this._mOpts.isForBatch = !0, l.getCurrentProduct() === l.PRODUCT_MBOX ? l.getDlinkMbox(this._mOpts, function(e) {
                                                                                                                            i.dlink = e.dlink + "&zipname=" + encodeURIComponent(d.getPackName(t._mList)), e.logType && (i.logType = e.logType), e.logFrom && (i.logFrom = e.logFrom), p.straightforwardDownload(i, t._mList)
                                                                                                                            }) : l.getCurrentProduct() === l.PRODUCT_SHARE ? l.getDlinkShare(this._mOpts, function(e) {
                                                                                                                                                                                             i.dlink = e.dlink + "&zipname=" + encodeURIComponent(d.getPackName(t._mList)), e.logType && (i.logType = e.logType), e.logFrom && (i.logFrom = e.logFrom), p.straightforwardDownload(i, t._mList)
                                                                                                                                                                                             }) : l.getDlinkPan(l.getFsidListData(this._mList), "batch", function(e) {
                                                                                                                                                                                                                i.dlink = e.dlink + "&zipname=" + encodeURIComponent(d.getPackName(t._mList)), e.logType && (i.logType = e.logType), e.logFrom && (i.logFrom = e.logFrom), p.straightforwardDownload(i, t._mList)
                                                                                                                                                                                                                })) : (this._mOpts.isForBatch = !1, l.getCurrentProduct() === l.PRODUCT_MBOX ? l.getDlinkMbox(this._mOpts, function(e) {
                                                                                                                                                                                                                                                                                                              i.dlink = e.list[0].dlink, e.logType && (i.logType = e.logType), e.logFrom && (i.logFrom = e.logFrom), p.straightforwardDownload(i, t._mList)
                                                                                                                                                                                                                                                                                                              }) : l.getCurrentProduct() === l.PRODUCT_SHARE ? l.getDlinkShare(this._mOpts, function(e) {
                                                                                                                                                                                                                                                                                                                                                                               i.dlink = e.list[0].dlink, e.logType && (i.logType = e.logType), e.logFrom && (i.logFrom = e.logFrom), p.straightforwardDownload(i, t._mList)
                                                                                                                                                                                                                                                                                                                                                                               }) : l.getDlinkPan(l.getFsidListData([this._mList]), "dlink", function(e) {
                                                                                                                                                                                                                                                                                                                                                                                                  i.dlink = e.dlink[0].dlink, e.logType && (i.logType = e.logType), e.logFrom && (i.logFrom = e.logFrom), p.straightforwardDownload(i, t._mList)
                                                                                                                                                                                                                                                                                                                                                                                                  }))
}, p.prototype.dispatchPositiveEvent = function() {
    var i = !1;
    switch (this._mMode) {
        case p.MODE_PRE_DOWNLOAD:
            this._mMode = p.MODE_PRE_INSTALL, n.getContext().log.send({
                                                                      page: d.getDownloadLogmsg(),
                                                                      type: p.logMsg.category + "-" + p.logMsg.actionAccelerateDownload,
                                                                      fileSize: this.getFileSizeType()
                                                                      }), this.updateMode(1);
            break;
        case p.MODE_PRE_INSTALL:
            this._mIsVideo && this._mIsVideoShow ? (this._mIsVideoShow = !1, this._mMode = p.MODE_PRE_INSTALL) : h.checkAvailability() || (this._mMode = p.MODE_POST_INSTALL), l.getCurrentProduct() === l.PRODUCT_MBOX && d.isPlatformWindows() && p.guanjiaVersion < h.GUANJIA_VERSION_COMPARE && (this._mMode = p.MODE_POST_INSTALL), setTimeout(function() {
                                                                                                                                                                                                                                                                                                                                                    n.getContext().log.send({
                                                                                                                                                                                                                                                                                                                                                                            page: d.getDownloadLogmsg(),
                                                                                                                                                                                                                                                                                                                                                                            type: p.logMsg.category + "-" + p.logMsg.actionDownloadClient
                                                                                                                                                                                                                                                                                                                                                                            })
                                                                                                                                                                                                                                                                                                                                                    }, 1e3), this.updateMode(1), i = !0;
            break;
        case p.MODE_POST_INSTALL:
        case p.MODE_POST_RETRY:
            h.checkAvailability() ? (this.dialog.hide(), this._mMode == p.MODE_POST_INSTALL && n.getContext().log.send({
                                                                                                                       page: d.getDownloadLogmsg(),
                                                                                                                       type: "downloadPluginCompleteInstall",
                                                                                                                       version: "1.0.0.0"
                                                                                                                       }), h.callClientDownload(this._mList, this._mGuanjiaString)) : (s && console.log("on post install, we hav't got client plugin yet"), this._mMode = p.MODE_POST_RETRY, this.updateMode(1), this._mIsVideo && (i = !0))
    }
    return i
}, p.prototype.showBuyVipPkgGuide = function() {
    1 !== +g.ISSVIP && o("#show-buyvip-pack").length > 0 && (o("#show-buyvip-pack").fadeIn("200"), n.getContext().log.send({
                                                                                                                           url: "//pan.baidu.com/api/analytics",
                                                                                                                           type: "download_buyvip_view"
                                                                                                                           }))
}, p.prototype.queryIp = function() {
    var i = "/rest/2.0/membership/isp?method=query",
    t = this;
    1 == g.LOGINSTATUS && (t._mIsVideo || o.ajax({
                                                 url: i,
                                                 type: "POST",
                                                 data: {
                                                 user_id: 1
                                                 },
                                                 success: function(i) {
                                                 var e = null;
                                                 try {
                                                 e = o.parseJSON(i), e.isp_name && "" !== e.isp_name && 1 === +g.ISSVIP ? (t._mIspName = e.isp_name, o("#show-acceleration-pack").length && o("#show-acceleration-pack").fadeIn("200"), n.getContext().log.send({
                                                                                                                                                                                                                                                                page: d.getDownloadLogmsg(),
                                                                                                                                                                                                                                                                url: "//pan.baidu.com/api/analytics",
                                                                                                                                                                                                                                                                type: "check_isp_name"
                                                                                                                                                                                                                                                                })) : t.showBuyVipPkgGuide()
                                                 } catch (a) {
                                                 s && console.log("[LOG]====>parse json error on get user products ", a.message)
                                                 }
                                                 },
                                                 error: function(i) {
                                                 s && console.log(i);
                                                 var t,
                                                 e,
                                                 a,
                                                 n = i.responseText;
                                                 try {
                                                 t = o.parseJSON(responseText), e = t.error_code, a = disk.util.buyErrorMessage[e]
                                                 } catch (l) {
                                                 s && console.log(n)
                                                 }
                                                 }
                                                 }))
}, e.exports = p
});
;
define("file-widget-1:download/service/guanjiaConnector.js", function(e, o, n) {
       var t = e("file-widget-1:download/util/downloadCommonUtil.js"),
       i = e("base:widget/libs/jquerypacket.js"),
       c = e("base:widget/httpProxy/httpProxy.js"),
       a = e("base:widget/tools/tools.js"),
       r = e("file-widget-1:download/util/context.js"),
       l = window.yunData,
       u = {},
       s = {};
       u = {
       conf: {
       localUrl: "http://127.0.0.1",
       localPort: 1e4,
       currentPort: 1e4,
       portPollLimit: 10,
       guanjiaVersion: 0,
       localServerReady: !1,
       domIframeId: "guanjia-iframe-id",
       domHookId: "guanjia-hook-id",
       hook: null,
       minVersion: "5.3.4.5"
       },
       setVersion: function(e) {
       u.conf.guanjiaVersion = e, "http:" !== location.protocol || t.isPlatformWindows() && !t.compareVersion(e, "5.4.7") || u.imageAccess("https://" + location.host + "/yun-static/common/images/default.gif", function() {
                                                                                                                                           a.setCookie("secu", 1, 365, "/"), r.getContext() && r.getContext().log.send({
                                                                                                                                                                                                                       name: "httpsAccessSuccess",
                                                                                                                                                                                                                       value: "success"
                                                                                                                                                                                                                       })
                                                                                                                                           }, function() {
                                                                                                                                           r.getContext() && r.getContext().log.send({
                                                                                                                                                                                     name: "httpsAccessFail",
                                                                                                                                                                                     value: "failure"
                                                                                                                                                                                     })
                                                                                                                                           }), r.getContext() && r.getContext().log.send({
                                                                                                                                                                                         name: "https_pub",
                                                                                                                                                                                         value: "string" == typeof l.sampling && l.sampling.indexOf("https_pub") > -1 ? "success" : "failure"
                                                                                                                                                                                         })
       },
       imageAccess: function(e, o, n) {
       var t = new Image;
       t.onload = function(e) {
       "function" == typeof o && o.call(null, e)
       }, t.onerror = function(e) {
       "function" == typeof n && n.call(null, e)
       }, t.src = e
       },
       util: {
       init: function(e) {
       u.conf.checkStartTime = e ? +new Date : 0, u.util.checkLocalServer(), t.getChromeVersion() <= 42 && setTimeout(function() {
                                                                                                                      u.util.localServerReady || u.util.installHook()
                                                                                                                      }, 1e3)
       },
       checkLtIe8: function() {
       var e = i.browser || {};
       return e.msie && +e.version <= 8 ? !0 : !1
       },
       checkLocalServer: function() {
       if (!u.conf.localServerReady)
       for (var e = 0, o = function(o) {
            var n = u.conf.localUrl + ":" + o + "/guanjia",
            a = {
            url: n,
            type: "GET",
            data: {
            method: "GetVersion"
            },
            dataType: "json",
            timeout: 3e3,
            success: function(e) {
            try {
            e = i.parseJSON(e)
            } catch (n) {}
            if (e && e.version) {
            if (t.isPlatformWindows() && !t.compareVersion(e.version, u.conf.minVersion))
            return;
            u.conf.currentPort = o, u.setVersion(e.version), u.conf.localServerReady = !0
            }
            },
            error: function() {
            e++, e === u.conf.portPollLimit && +new Date - u.conf.checkStartTime < 3e3 && setTimeout(function() {
                                                                                                     u.util.checkLocalServer()
                                                                                                     }, 400)
            }
            };
            location.protocol.indexOf("https") > -1 || u.util.checkLtIe8() ? t.isPlatformMac() ? u.imageAccess(u.conf.localUrl + ":" + o + "/version.png", function() {
                                                                                                               c.ajax(a)
                                                                                                               }, a.error) : c.ajax(a) : i.ajax(a)
            }, n = 0; n < u.conf.portPollLimit; n++)
       o(u.conf.localPort + n)
       },
       installHook: function() {
       var e,
       o,
       n = [];
       return null !== u.conf.hook ? u.conf.hook : (e = document.getElementById(u.conf.domIframeId), e && document.body.removeChild(e), e = document.createElement("div"), e.style.width = "1px", e.style.height = "1px", e.style.position = "absolute", e.style.overflow = "hidden", e.style.left = "-999em", e.style.top = "-999em", e.id = u.conf.domIframeId, document.body.appendChild(e), n.push("undefined" != typeof window.attachEvent || window.ActiveXObject || "ActiveXObject" in window ? '<object id="' + u.conf.domHookId + '" classid="CLSID:8DCE7B6C-C3B9-4efd-9CC6-2D9F938B4A06" hidden="true" viewastext></OBJECT>' : -1 !== navigator.userAgent.indexOf("Trident/7.0") ? '<embed id="' + u.conf.domHookId + '" type="application/bd-npYunWebDetect-plugin" width="0" height="0">' : '<embed id="' + u.conf.domHookId + '" type="application/bd-npYunWebDetect-plugin" width="0" height="0">'), e.innerHTML = n.join(""), o = u.util.hasPlugin(), o && (u.conf.hook = document.getElementById(u.conf.domHookId), u.setVersion(u.conf.hook.GetVersion())), u.conf.hook)
       },
       hasPlugin: function() {
       var e = null;
       try {
       e = new ActiveXObject("YunWebDetect.YunWebDetect.1")
       } catch (o) {
       for (var n = null, t = navigator.plugins, i = 0, c = t.length; c > i; i++)
       if (n = t[i].name || t[i].filename, -1 != n.indexOf("BaiduYunGuanjia")) {
       e = t[i];
       break
       }
       }
       return null != e
       },
       checkPluginHook: function() {
       return u.conf.installHook()
       },
       sendData: function(e, o, n, a, r) {
       if (u.conf.localServerReady) {
       var l = u.conf.localUrl + ":" + u.conf.currentPort + "/guanjia?";
       l += "method=" + e + "&uk=" + n + "&checkuser=" + (a ? 1 : 0);
       var s = {
       url: l,
       type: "POST",
       data: {
       filelist: o
       },
       success: function() {},
       timeout: 3e3,
       error: function() {
       r || t.openYunGuanjiaByScheme("baiduyunguanjia://guanjia", function() {
                                     u.conf.localServerReady = !1, u.util.init(!0), setTimeout(function() {
                                                                                               u.util.sendData(e, o, n, a, !0)
                                                                                               }, 3e3)
                                     })
       }
       };
       location.protocol.indexOf("https") > -1 || u.util.checkLtIe8() ? c.ajax(s) : i.ajax(s)
       } else {
       if (!u.conf.hook)
       return -2;
       try {
       "undefined" == typeof a ? u.conf.hook[e](o, n) : u.conf.hook[e](o, n, a)
       } catch (f) {
       return -2
       }
       }
       }
       }
       }, s = {
       getVersion: function() {
       return u.conf.guanjiaVersion
       },
       checkConnect: function() {
       return u.conf.localServerReady ? !0 : t.isChromeAndGreaterThan42() ? !1 : u.conf.hook && u.conf.guanjiaVersion ? !0 : !1
       },
       callGuanjia: function(e, o, n, t) {
       return u.util.sendData(e, o, n, t)
       },
       init: function(e) {
       u.util.init(e)
       }
       }, u.setVersion(0), n.exports = s
       });
;
define("file-widget-1:download/util/context.js", function(t, e, n) {
       var o = {
       context: null
       },
       i = t("file-widget-1:download/log.js"),
       l = {
       getContext: function() {
       return o.context
       },
       setContext: function(t) {
       o.context = t, t && t.log && t.log.define(i)
       }
       };
       n.exports = l
       });
;
define("file-widget-1:download/util/downloadCommonUtil.js", function(e, t, n) {
       var o = e("base:widget/libs/jquerypacket.js"),
       i = e("file-widget-1:download/service/dlinkService.js"),
       a = e("file-widget-1:download/util/context.js"),
       s = {
       getFlashVersion: function() {
       var e = 0,
       t = navigator;
       if (t.plugins && t.plugins.length) {
       for (var n = 0, o = t.plugins.length; o > n; n++)
       if (-1 !== t.plugins[n].name.indexOf("Shockwave Flash")) {
       e = t.plugins[n].description.split("Shockwave Flash ")[1];
       break
       }
       } else if (window.ActiveXObject)
       try {
       var i = new ActiveXObject("ShockwaveFlash.ShockwaveFlash");
       if (i) {
       var a = i.GetVariable("$version"),
       s = /WIN ([\d\.\,]+)/g,
       r = s.exec(a);
       r && (e = r[1])
       }
       } catch (c) {}
       return e
       },
       compareVersion: function(e, t, n) {
       return "string" == typeof e && (e = e.replace(/(^|\.)(\d)(?=\.|$)/g, "$10$2").replace(/\./g, ""), e = e.length <= 6 ? e += "00" : e, e = parseInt(e, 10)), "string" == typeof t && (t = t.replace(/(^|\.)(\d)(?=\.|$)/g, "$10$2").replace(/\./g, ""), t = t.length <= 6 ? t += "00" : t, t = parseInt(t, 10)), n ? e > t : e >= t
       },
       getDownloadLogmsg: function() {
       var e;
       return e = i.getCurrentProduct() === i.PRODUCT_SHARE ? 2 : 1
       },
       useToast: function(e) {
       a.getContext().ui.tip({
                             mode: e.toastMode,
                             msg: e.msg
                             })
       },
       useCloseToast: function() {
       a.getContext().ui.hideTip()
       },
       getPackName: function(e) {
       var t,
       n = a.getContext().tools.baseService.parseDirFromPath(e[0].path),
       o = e[0].isdir;
       if ("number" == typeof e.length) {
       var i = e.length > 1 ? "【批量下载】{%packName%}等.zip" : "{%packName%}.zip";
       return 0 === o && (t = n.lastIndexOf("."), -1 !== t && (n = n.substring(0, t))), i.replace(/{%packName%}/g, n)
       }
       return a.getContext().tools.baseService.parseDirFromPath(e[0].path)
       },
       isFile: function(e) {
       return 0 === e || void 0 === e ? !0 : !1
       },
       isPlatformWindows: function() {
       var e = navigator.platform;
       return 0 === e.toLowerCase().indexOf("win")
       },
       isPlatformMac: function() {
       var e = /Mac\D+(\d+).(\d*)/gi,
       t = e.exec(navigator.userAgent);
       return t && t[1] && (+t[1] > 10 || 10 === +t[1] && t[2] && +t[2] >= 10) ? !0 : !1
       },
       getDownloadUrl: function(e) {
       return o.browser.msie ? e.dlink + "&response-cache-control=private" : e.dlink
       },
       isChromeAndGreaterThan42: function() {
       var e = "42";
       return s.getChromeVersion() >= e ? !0 : !1
       },
       getChromeVersion: function() {
       var e,
       t = navigator.userAgent.toLowerCase(),
       n = /chrome/,
       o = /safari\/\d{3}\.\d{2}$/,
       i = /chrome\/(\S+)/;
       return n.test(t) && o.test(t) && i.test(t) ? e = RegExp.$1 : 0
       },
       isChrome: function() {
       var e = navigator.userAgent.toLowerCase(),
       t = /chrome/;
       return t.test(e) ? !0 : !1
       },
       toLogin: function() {
       var t = this;
       this.useToast({
                     toastMode: "loading",
                     msg: "请稍候..."
                     }), e.async("base:widget/passAPI/passAPI.js", function(e) {
                                 t.useCloseToast(), e.promise.done(function() {
                                                                   e.passAPI.PassportInit.netdiskLogin({
                                                                                                       reload: !0
                                                                                                       }), e.passAPI.PassLoginDialog.onLoginSuccessCallback = function() {
                                                                   e.passAPI.PassportInit.hide(), a.getContext().log.send({
                                                                                                                          type: "download_share_single_size_limit_login_success"
                                                                                                                          })
                                                                   }
                                                                   }), a.getContext().log.send({
                                                                                               type: "download_share_single_size_limit_login_dialog_show"
                                                                                               })
                                 })
       },
       openYunGuanjiaByScheme: function(e, t) {
       var n = !1,
       i = function() {
       n = !0
       };
       o(window).on("blur", i);
       var a = function() {
       n && setTimeout(function() {
                       "function" == typeof t && t()
                       }, 100), n = !1, o(window).off("focus", a)
       };
       if (o(window).on("focus", a), s.isChrome()) {
       var r = document.createElement("a"),
       c = null;
       "function" == typeof MouseEvent ? c = new MouseEvent("click", {
                                                            bubbles: !0,
                                                            cancelable: !1
                                                            }) : (c = document.createEvent("MouseEvents"), c.initEvent("click", !0, !1)), r.href = e, r.dispatchEvent(c)
       } else {
       var l = s.callClientIframe;
       l || (l = document.createElement("iframe"), o(l).hide(), s.callClientIframe = l, document.body.appendChild(l)), l.src = e
       }
       setTimeout(function() {
                  o(window).off("blur", i), n || (o(window).off("focus", a), "function" == typeof t && t())
                  }, 100)
       }
       };
       n.exports = s
       });
;
define("file-widget-1:download/util/pcsUtil.js", function(t) {
       var e = t("base:widget/libs/jquerypacket.js"),
       s = {};
       s.testPCSCDNConnectivity = function(t) {
       s._getHostList(t)
       }, s._sList = null, s._sIndex = -1, s._sConnectedIndex = -1, s._sResult = 0, s._path = null, s._sRevision = 0, s._getHostList = function(t) {
       e.ajax({
              url: "https://d.pcs.baidu.com/rest/2.0/pcs/manage?method=listhost&t=" + (new Date).getTime(),
              method: "get",
              dataType: "jsonp",
              success: function(e) {
              e && e.list && (s._path = e.path, s._sList = e.list, s._sRevision = e.rev || 0, s._startTesting(t))
              },
              error: function() {
              "function" == typeof t && t.call(s, 0)
              }
              })
       }, s._startTesting = function(t) {
       s._sIndex++;
       var e = s._sList[s._sIndex];
       if (s._sIndex < s._sList.length) {
       var n = new Image;
       n.onload = function() {
       s._sConnectedIndex = s._sIndex, s._sResult += e.id, s._startTesting(t)
       }, n.onerror = function() {
       s._startTesting(t)
       }, n.src = "//" + e.host + (s._path || "/monitor.jpg?xcode=1a81b0bbd448fc368d78cc336e28561a") + (new Date).getTime()
       } else
       "function" == typeof t && t.call(s, 1, s._sConnectedIndex, s._sList, s._sResult, s._sRevision, s._path)
       }, s.testPCSCDNConnectivity()
       });
;
define("file-widget-1:download/view/downloadDialog.tpl.js", function(a, s, n) {
       var l = [];
       l.push('<div class="module-download-dilaog">'), l.push('<div id="topTips" class="g-clearfix g-center download-mgr-banner download-mgr-client-hint"></div><div class="content"><div node-type="message-tip" class="message-tip g-center">加载中&hellip;</div></div><div class="dlg-ft"><div class="g-clearfix g-center"><a node-type="download-speedup" class="btn btn-blue btn-blue-long btn-blue-high" href="javascript:void(0);"><span class="text text-normal">加速下载（推荐）</span></a><a node-type="download-normal" class="btn btn-gray btn-gray-long btn-gray-high" href="javascript:void(0);"><span class="text text-normal">普通下载</span></a><span node-type="guanjia-tip" class="download-mgr-hint download-mgr-hint-l special-mgr-left" style="display: block;"><em></em>多文件<b>不限文件个数</b><br>下载<b>更稳定</b></span><span node-type="normal-tip" class="download-mgr-hint download-mgr-hint-r"><em></em>浏览器单线程下载</span></div></div>'), l.push('<div class="dlg-ft01 b-rlv" id="show-acceleration-pack">'), l.push('    <div class="g-clearfix g-center acceleration-pack">'), l.push('        <span class="dowmload-imgs-style dowmload-imgs-style01"></span>'), l.push('        <span class="dowmload-content-style">使用网络加速包,即可为你最高</span>'), l.push('        <span class="download-upspeed-style">提速300%</span>'), l.push('        <a href="javascript:window.open(\'/buy/center?tag=2&frm=dl#network\')"class="download-change-link-style">立即购买</a>'), l.push("    </div>"), l.push("</div>"), l.push('</div">'), n.exports = {
       downloadDialog: l.join("")
       }
       });

