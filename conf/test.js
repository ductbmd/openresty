/* JSONPath 0.8.0 - XPath for JSON
 *
 * Copyright (c) 2007 Stefan Goessner (goessner.net)
 * Licensed under the MIT (MIT-LICENSE.txt) licence.
 */
function jsonPath(obj, expr, arg) {
    var P = {
        resultType: arg && arg.resultType || "VALUE",
        result: [],
        normalize: function (expr) {
            var subx = [];
            return expr.replace(/[\['](\??\(.*?\))[\]']/g, function ($0, $1) { return "[#" + (subx.push($1) - 1) + "]"; })
                .replace(/'?\.'?|\['?/g, ";")
                .replace(/;;;|;;/g, ";..;")
                .replace(/;$|'?\]|'$/g, "")
                .replace(/#([0-9]+)/g, function ($0, $1) { return subx[$1]; });
        },
        asPath: function (path) {
            var x = path.split(";"), p = "$";
            for (var i = 1, n = x.length; i < n; i++)
                p += /^[0-9*]+$/.test(x[i]) ? ("[" + x[i] + "]") : ("['" + x[i] + "']");
            return p;
        },
        store: function (p, v) {
            if (p) P.result[P.result.length] = P.resultType == "PATH" ? P.asPath(p) : v;
            return !!p;
        },
        trace: function (expr, val, path) {
            if (expr) {
                var x = expr.split(";"), loc = x.shift();
                x = x.join(";");
                if (val && val.hasOwnProperty(loc))
                    P.trace(x, val[loc], path + ";" + loc);
                else if (loc === "*")
                    P.walk(loc, x, val, path, function (m, l, x, v, p) { P.trace(m + ";" + x, v, p); });
                else if (loc === "..") {
                    P.trace(x, val, path);
                    P.walk(loc, x, val, path, function (m, l, x, v, p) { typeof v[m] === "object" && P.trace("..;" + x, v[m], p + ";" + m); });
                }
                else if (/,/.test(loc)) { // [name1,name2,...]
                    for (var s = loc.split(/'?,'?/), i = 0, n = s.length; i < n; i++)
                        P.trace(s[i] + ";" + x, val, path);
                }
                else if (/^\(.*?\)$/.test(loc)) // [(expr)]
                    P.trace(P.eval(loc, val, path.substr(path.lastIndexOf(";") + 1)) + ";" + x, val, path);
                else if (/^\?\(.*?\)$/.test(loc)) // [?(expr)]
                    P.walk(loc, x, val, path, function (m, l, x, v, p) { if (P.eval(l.replace(/^\?\((.*?)\)$/, "$1"), v[m], m)) P.trace(m + ";" + x, v, p); });
                else if (/^(-?[0-9]*):(-?[0-9]*):?([0-9]*)$/.test(loc)) // [start:end:step]  phyton slice syntax
                    P.slice(loc, x, val, path);
            }
            else
                P.store(path, val);
        },
        walk: function (loc, expr, val, path, f) {
            if (val instanceof Array) {
                for (var i = 0, n = val.length; i < n; i++)
                    if (i in val)
                        f(i, loc, expr, val, path);
            }
            else if (typeof val === "object") {
                for (var m in val)
                    if (val.hasOwnProperty(m))
                        f(m, loc, expr, val, path);
            }
        },
        slice: function (loc, expr, val, path) {
            if (val instanceof Array) {
                var len = val.length, start = 0, end = len, step = 1;
                loc.replace(/^(-?[0-9]*):(-?[0-9]*):?(-?[0-9]*)$/g, function ($0, $1, $2, $3) { start = parseInt($1 || start); end = parseInt($2 || end); step = parseInt($3 || step); });
                start = (start < 0) ? Math.max(0, start + len) : Math.min(len, start);
                end = (end < 0) ? Math.max(0, end + len) : Math.min(len, end);
                for (var i = start; i < end; i += step)
                    P.trace(i + ";" + expr, val, path);
            }
        },
        eval: function (x, _v, _vname) {
            try { return $ && _v && eval(x.replace(/@/g, "_v")); }
            catch (e) { throw new SyntaxError("jsonPath: " + e.message + ": " + x.replace(/@/g, "_v").replace(/\^/g, "_a")); }
        }
    };

    var $ = obj;
    if (expr && obj && (P.resultType == "VALUE" || P.resultType == "PATH")) {
        P.trace(P.normalize(expr).replace(/^\$;/, ""), obj, "$");
        return P.result.length ? P.result : false;
    }
}


var service = {
    'common': { 'getConstStatusOrder': '/BRNToolCoreAPI/BRNToolCoreAPI/api/common/getConstStatusOrder', },
    'brand': { 'get': '/BRNToolCoreAPI/BRNToolCoreAPI/api/brand/Get', 'getList': '/BRNToolCoreAPI/BRNToolCoreAPI/api/brand/GetList', 'delete': '/BRNToolCoreAPI/BRNToolCoreAPI/api/brand/Delete', 'post': '/BRNToolCoreAPI/BRNToolCoreAPI/api/brand/Post ', 'put': '/BRNToolCoreAPI/BRNToolCoreAPI/api/brand/Put' },
    'branches': { 'get': '/BRNToolCoreAPI/BRNToolCoreAPI/api/branches/Get', 'getList': '/BRNToolCoreAPI/BRNToolCoreAPI/api/branches/GetList', 'delete': '/BRNToolCoreAPI/BRNToolCoreAPI/api/branches/Delete', 'post': '/BRNToolCoreAPI/BRNToolCoreAPI/api/branches/Post ', 'put': '/BRNToolCoreAPI/BRNToolCoreAPI/api/branches/Put' },
    'sysAccounts': {
        'get': '/PortalAPI/PortalAPI/api/sysAccounts/Get', 'getList': '/PortalAPI/PortalAPI/api/sysAccounts/GetList', 'delete': '/PortalAPI/PortalAPI/api/sysAccounts/Delete', 'post': '/PortalAPI/PortalAPI/api/sysAccounts/Post ', 'put': '/PortalAPI/PortalAPI/api/sysAccounts/Put', 'getListIsNotDelete': '/PortalAPI/PortalAPI/api/sysAccounts/GetListIsNotDelete',
        'logUpAccount': '/PortalAPI/PortalAPI/api/sysAccounts/LogUpAccount', 'logUpSMS': '/PortalAPI/PortalAPI/api/sysAccounts/LogUpAccountSMS', 'getAllListModule': '/PortalAPI/PortalAPI/api/sysAccounts/GetAllListModule', 'addFuncInAccount': '/PortalAPI/PortalAPI/api/sysAccounts/AddFuncInAccount', 'getGroupAccByAccID': '/PortalAPI/PortalAPI/api/sysAccounts/GetGroupAccByAccID',
        'addGroupInAccount': '/PortalAPI/PortalAPI/api/sysAccounts/AddGroupInAccount', 'changePassword': '/PortalAPI/PortalAPI/api/sysAccounts/ChangePassword', 'itemPrepaidpackage': '/PortalAPI/PortalAPI/api/sysAccounts/itemPrepaidpackage', 'getListManager': '/PortalAPI/PortalAPI/api/sysAccounts/GetListManager', 'getListSaleManager': '/PortalAPI/PortalAPI/api/sysAccounts/GetListSaleManager',
        'getAccountByUserName': '/PortalAPI/PortalAPI/api/sysAccounts/GetAccountByUserName', 'getListUserByAccountType': '/PortalAPI/PortalAPI/api/sysAccounts/GetListUserByAccountType', 'searchAccount': '/PortalAPI/PortalAPI/api/sysAccounts/SearchAccount', 'lockAccountAPI': '/PortalAPI/PortalAPI/api/sysAccounts/LockAccountAPI',
        'getListUserByGroupMenuID': '/PortalAPI/PortalAPI/api/sysAccounts/GetListUserByGroupMenuID', 'addUserInGroupMenu': '/PortalAPI/PortalAPI/api/sysAccounts/AddUserInGroupMenu', 'getAccByUserName': '/PortalAPI/PortalAPI/api/sysAccounts/GetAccByUserName'
    },
    'sysGroupFunctions': { 'get': '/PortalAPI/PortalAPI/api/sysGroupFunctions/Get', 'getList': '/PortalAPI/PortalAPI/api/sysGroupFunctions/GetList', 'delete': '/PortalAPI/PortalAPI/api/sysGroupFunctions/Delete', 'post': '/PortalAPI/PortalAPI/api/sysGroupFunctions/Post ', 'put': '/PortalAPI/PortalAPI/api/sysGroupFunctions/Put' },
    'sysAccountGroups': {
        'get': '/PortalAPI/PortalAPI/api/sysAccountGroups/Get', 'getList': '/PortalAPI/PortalAPI/api/sysAccountGroups/GetList', 'delete': '/PortalAPI/PortalAPI/api/sysAccountGroups/Delete', 'post': '/PortalAPI/PortalAPI/api/sysAccountGroups/Post ', 'put': '/PortalAPI/PortalAPI/api/sysAccountGroups/Put',
        'getListNotDelete': '/PortalAPI/PortalAPI/api/sysAccountGroups/GetListNotDelete', 'addUserInGroup': '/PortalAPI/PortalAPI/api/sysAccountGroups/AddUserInGroup ', 'getMemberInGroup': '/PortalAPI/PortalAPI/api/sysAccountGroups/GetMemberInGroup', 'getAllListModule': '/PortalAPI/PortalAPI/api/sysAccountGroups/GetAllListModule',
        'addFuncInGroups': '/PortalAPI/PortalAPI/api/sysAccountGroups/AddFuncInGroups', 'getFuncInGroup': '/PortalAPI/PortalAPI/api/sysAccountGroups/GetFuncInGroup', 'getSysGroupFuncByGroupCode': '/PortalAPI/PortalAPI/api/sysAccountGroups/GetSysGroupFuncByGroupCode',
        'getListGroupAccountByGroupType': '/PortalAPI/PortalAPI/api/sysAccountGroups/GetListGroupAccountByGroupType'
    },
    'sysAccountFunctions': { 'get': '/PortalAPI/PortalAPI/api/sysAccountFunctions/Get', 'getList': '/PortalAPI/PortalAPI/api/sysAccountFunctions/GetList', 'delete': '/PortalAPI/PortalAPI/api/sysAccountFunctions/Delete', 'post': '/PortalAPI/PortalAPI/api/sysAccountFunctions/Post ', 'put': '/PortalAPI/PortalAPI/api/sysAccountFunctions/Put' },
    'sysMenus': { 'get': '/PortalAPI/PortalAPI/api/sysMenus/Get', 'getList': '/PortalAPI/PortalAPI/api/sysMenus/GetList', 'delete': '/PortalAPI/PortalAPI/api/sysMenus/Delete', 'post': '/PortalAPI/PortalAPI/api/sysMenus/Post ', 'put': '/PortalAPI/PortalAPI/api/sysMenus/Put', 'getAllListModule': '/PortalAPI/PortalAPI/api/sysMenus/GetAllListModule', 'getListIsNotDelete': '/PortalAPI/PortalAPI/api/sysMenus/GetListIsNotDelete', 'getAllListModuleByMenuID': '/PortalAPI/PortalAPI/api/sysMenus/GetAllListModuleByMenuID' },
    'sysModules': { 'get': '/PortalAPI/PortalAPI/api/sysModules/Get', 'getList': '/PortalAPI/PortalAPI/api/sysModules/GetList', 'delete': '/PortalAPI/PortalAPI/api/sysModules/Delete', 'post': '/PortalAPI/PortalAPI/api/sysModules/Post ', 'put': '/PortalAPI/PortalAPI/api/sysModules/Put', 'getListContented': '/PortalAPI/PortalAPI/api/sysModules/GetListContented' },
    'sysGroupMenus': {
        'get': '/PortalAPI/PortalAPI/api/sysGroupMenus/Get', 'getList': '/PortalAPI/PortalAPI/api/sysGroupMenus/GetList', 'delete': '/PortalAPI/PortalAPI/api/sysGroupMenus/Delete', 'post': '/PortalAPI/PortalAPI/api/sysGroupMenus/Post ', 'put': '/PortalAPI/PortalAPI/api/sysGroupMenus/Put',
        'getListNotDelete': '/PortalAPI/PortalAPI/api/sysGroupMenus/GetListNotDelete', 'addUserInGroup': '/PortalAPI/PortalAPI/api/sysGroupMenus/AddUserInGroup ', 'getMemberInGroup': '/PortalAPI/PortalAPI/api/sysGroupMenus/GetMemberInGroup', 'getSysGroupMenuByName': '/PortalAPI/PortalAPI/api/sysGroupMenus/GetSysGroupMenuByName'
    },
    'sysFunctions': { 'get': '/PortalAPI/PortalAPI/api/sysFunctions/Get', 'getList': '/PortalAPI/PortalAPI/api/sysFunctions/GetList', 'delete': '/PortalAPI/PortalAPI/api/sysFunctions/Delete', 'post': '/PortalAPI/PortalAPI/api/sysFunctions/Post ', 'put': '/PortalAPI/PortalAPI/api/sysFunctions/Put' },
    'sysFunctionApis': { 'get': '/PortalAPI/PortalAPI/api/sysFunctionApis/Get', 'getList': '/PortalAPI/PortalAPI/api/sysFunctionApis/GetList', 'delete': '/PortalAPI/PortalAPI/api/sysFunctionApis/Delete', 'post': '/PortalAPI/PortalAPI/api/sysFunctionApis/Post ', 'put': '/PortalAPI/PortalAPI/api/sysFunctionApis/Put' },
    'sysApis': { 'get': '/PortalAPI/PortalAPI/api/sysApis/Get', 'getList': '/PortalAPI/PortalAPI/api/sysApis/GetList', 'delete': '/PortalAPI/PortalAPI/api/sysApis/Delete', 'post': '/PortalAPI/PortalAPI/api/sysApis/Post ', 'put': '/PortalAPI/PortalAPI/api/sysApis/Put' },
    'warnings': { 'get': '/BRNToolCoreAPI/BRNToolCoreAPI/api/warnings/Get', 'getList': '/BRNToolCoreAPI/BRNToolCoreAPI/api/warnings/GetList', 'delete': '/BRNToolCoreAPI/BRNToolCoreAPI/api/warnings/Delete', 'post': '/BRNToolCoreAPI/BRNToolCoreAPI/api/warnings/Post ', 'put': '/BRNToolCoreAPI/BRNToolCoreAPI/api/warnings/Put' },
    'warningGroups': { 'get': '/BRNToolCoreAPI/BRNToolCoreAPI/api/warningGroups/Get', 'getList': '/BRNToolCoreAPI/BRNToolCoreAPI/api/warningGroups/GetList', 'delete': '/BRNToolCoreAPI/BRNToolCoreAPI/api/warningGroups/Delete', 'post': '/BRNToolCoreAPI/BRNToolCoreAPI/api/warningGroups/Post ', 'put': '/BRNToolCoreAPI/BRNToolCoreAPI/api/warningGroups/Put' },
    'warningGroupConfig': { 'get': '/BRNToolCoreAPI/BRNToolCoreAPI/api/warningGroupConfig/Get', 'getList': '/BRNToolCoreAPI/BRNToolCoreAPI/api/warningGroupConfig/GetList', 'delete': '/BRNToolCoreAPI/BRNToolCoreAPI/api/warningGroupConfig/Delete', 'post': '/BRNToolCoreAPI/BRNToolCoreAPI/api/warningGroupConfig/Post ', 'put': '/BRNToolCoreAPI/BRNToolCoreAPI/api/warningGroupConfig/Put' },
    'warningEmails': { 'get': '/BRNToolCoreAPI/BRNToolCoreAPI/api/warningEmails/Get', 'getList': '/BRNToolCoreAPI/BRNToolCoreAPI/api/warningEmails/GetList', 'delete': '/BRNToolCoreAPI/BRNToolCoreAPI/api/warningEmails/Delete', 'post': '/BRNToolCoreAPI/BRNToolCoreAPI/api/warningEmails/Post ', 'put': '/BRNToolCoreAPI/BRNToolCoreAPI/api/warningEmails/Put' },
    'warningContacts': { 'get': '/BRNToolCoreAPI/BRNToolCoreAPI/api/warningContacts/Get', 'getList': '/BRNToolCoreAPI/BRNToolCoreAPI/api/warningContacts/GetList', 'delete': '/BRNToolCoreAPI/BRNToolCoreAPI/api/warningContacts/Delete', 'post': '/BRNToolCoreAPI/BRNToolCoreAPI/api/warningContacts/Post ', 'put': '/BRNToolCoreAPI/BRNToolCoreAPI/api/warningContacts/Put' },
    'warningCode': { 'get': '/BRNToolCoreAPI/BRNToolCoreAPI/api/warningCode/Get', 'getList': '/BRNToolCoreAPI/BRNToolCoreAPI/api/warningCode/GetList', 'delete': '/BRNToolCoreAPI/BRNToolCoreAPI/api/warningCode/Delete', 'post': '/BRNToolCoreAPI/BRNToolCoreAPI/api/warningCode/Post ', 'put': '/BRNToolCoreAPI/BRNToolCoreAPI/api/warningCode/Put' },
    'typePackage': { 'get': '/BRNToolCoreAPI/BRNToolCoreAPI/api/typePackage/Get', 'getList': '/BRNToolCoreAPI/BRNToolCoreAPI/api/typePackage/GetList', 'delete': '/BRNToolCoreAPI/BRNToolCoreAPI/api/typePackage/Delete', 'post': '/BRNToolCoreAPI/BRNToolCoreAPI/api/typePackage/Post ', 'put': '/BRNToolCoreAPI/BRNToolCoreAPI/api/typePackage/Put' },
    'tickets': { 'get': '/BRNToolCoreAPI/BRNToolCoreAPI/api/tickets/Get', 'getList': '/BRNToolCoreAPI/BRNToolCoreAPI/api/tickets/GetList', 'delete': '/BRNToolCoreAPI/BRNToolCoreAPI/api/tickets/Delete', 'post': '/BRNToolCoreAPI/BRNToolCoreAPI/api/tickets/Post ', 'put': '/BRNToolCoreAPI/BRNToolCoreAPI/api/tickets/Put' },
    'tempMessages': { 'get': '/BRNToolCoreAPI/BRNToolCoreAPI/api/tempMessages/Get', 'getList': '/BRNToolCoreAPI/BRNToolCoreAPI/api/tempMessages/GetList', 'delete': '/BRNToolCoreAPI/BRNToolCoreAPI/api/tempMessages/Delete', 'post': '/BRNToolCoreAPI/BRNToolCoreAPI/api/tempMessages/Post ', 'put': '/BRNToolCoreAPI/BRNToolCoreAPI/api/tempMessages/Put' },
    'tempBirthdays': { 'get': '/BRNToolCoreAPI/BRNToolCoreAPI/api/tempBirthdays/Get', 'getList': '/BRNToolCoreAPI/BRNToolCoreAPI/api/tempBirthdays/GetList', 'delete': '/BRNToolCoreAPI/BRNToolCoreAPI/api/tempBirthdays/Delete', 'post': '/BRNToolCoreAPI/BRNToolCoreAPI/api/tempBirthdays/Post ', 'put': '/BRNToolCoreAPI/BRNToolCoreAPI/api/tempBirthdays/Put' },
    'telcos': { 'get': '/BRNToolCoreAPI/BRNToolCoreAPI/api/telcos/Get', 'getList': '/BRNToolCoreAPI/BRNToolCoreAPI/api/telcos/GetList', 'delete': '/BRNToolCoreAPI/BRNToolCoreAPI/api/telcos/Delete', 'post': '/BRNToolCoreAPI/BRNToolCoreAPI/api/telcos/Post ', 'put': '/BRNToolCoreAPI/BRNToolCoreAPI/api/telcos/Put' },
    'targets': { 'get': '/BRNToolCoreAPI/BRNToolCoreAPI/api/targets/Get', 'getList': '/BRNToolCoreAPI/BRNToolCoreAPI/api/targets/GetList', 'delete': '/BRNToolCoreAPI/BRNToolCoreAPI/api/targets/Delete', 'post': '/BRNToolCoreAPI/BRNToolCoreAPI/api/targets/Post ', 'put': '/BRNToolCoreAPI/BRNToolCoreAPI/api/targets/Put' },
    'sysCatItems': { 'get': '/PortalAPI/PortalAPI/api/sysCatItems/Get', 'getList': '/PortalAPI/PortalAPI/api/sysCatItems/GetList', 'delete': '/PortalAPI/PortalAPI/api/sysCatItems/Delete', 'post': '/PortalAPI/PortalAPI/api/sysCatItems/Post ', 'put': '/PortalAPI/PortalAPI/api/sysCatItems/Put' },
    'sysCatGroupItems': { 'get': '/PortalAPI/PortalAPI/api/sysCatGroupItems/Get', 'getList': '/PortalAPI/PortalAPI/api/sysCatGroupItems/GetList', 'delete': '/PortalAPI/PortalAPI/api/sysCatGroupItems/Delete', 'post': '/PortalAPI/PortalAPI/api/sysCatGroupItems/Post ', 'put': '/PortalAPI/PortalAPI/api/sysCatGroupItems/Put' },
    'stepsCrossCheck': { 'get': '/BRNToolCoreAPI/BRNToolCoreAPI/api/stepsCrossCheck/Get', 'getList': '/BRNToolCoreAPI/BRNToolCoreAPI/api/stepsCrossCheck/GetList', 'delete': '/BRNToolCoreAPI/BRNToolCoreAPI/api/stepsCrossCheck/Delete', 'post': '/BRNToolCoreAPI/BRNToolCoreAPI/api/stepsCrossCheck/Post ', 'put': '/BRNToolCoreAPI/BRNToolCoreAPI/api/stepsCrossCheck/Put' },
    'routers': { 'get': '/BRNToolCoreAPI/BRNToolCoreAPI/api/routers/Get', 'getList': '/BRNToolCoreAPI/BRNToolCoreAPI/api/routers/GetList', 'delete': '/BRNToolCoreAPI/BRNToolCoreAPI/api/routers/Delete', 'post': '/BRNToolCoreAPI/BRNToolCoreAPI/api/routers/Post ', 'put': '/BRNToolCoreAPI/BRNToolCoreAPI/api/routers/Put' },
    'routerGroups': { 'get': '/BRNToolCoreAPI/BRNToolCoreAPI/api/routerGroups/Get', 'getList': '/BRNToolCoreAPI/BRNToolCoreAPI/api/routerGroups/GetList', 'delete': '/BRNToolCoreAPI/BRNToolCoreAPI/api/routerGroups/Delete', 'post': '/BRNToolCoreAPI/BRNToolCoreAPI/api/routerGroups/Post ', 'put': '/BRNToolCoreAPI/BRNToolCoreAPI/api/routerGroups/Put' },
    'routerPrioritizeBr': { 'get': '/BRNToolCoreAPI/BRNToolCoreAPI/api/routerPrioritizeBr/Get', 'getList': '/BRNToolCoreAPI/BRNToolCoreAPI/api/routerPrioritizeBr/GetList', 'delete': '/BRNToolCoreAPI/BRNToolCoreAPI/api/routerPrioritizeBr/Delete', 'post': '/BRNToolCoreAPI/BRNToolCoreAPI/api/routerPrioritizeBr/Post ', 'put': '/BRNToolCoreAPI/BRNToolCoreAPI/api/routerPrioritizeBr/Put' },
    'routerFeeDetail': { 'get': '/BRNToolCoreAPI/BRNToolCoreAPI/api/routerFeeDetail/Get', 'getList': '/BRNToolCoreAPI/BRNToolCoreAPI/api/routerFeeDetail/GetList', 'delete': '/BRNToolCoreAPI/BRNToolCoreAPI/api/routerFeeDetail/Delete', 'post': '/BRNToolCoreAPI/BRNToolCoreAPI/api/routerFeeDetail/Post ', 'put': '/BRNToolCoreAPI/BRNToolCoreAPI/api/routerFeeDetail/Put' },
    'revenueProfitFeedbacks': { 'get': '/BRNToolCoreAPI/BRNToolCoreAPI/api/revenueProfitFeedbacks/Get', 'getList': '/BRNToolCoreAPI/BRNToolCoreAPI/api/revenueProfitFeedbacks/GetList', 'delete': '/BRNToolCoreAPI/BRNToolCoreAPI/api/revenueProfitFeedbacks/Delete', 'post': '/BRNToolCoreAPI/BRNToolCoreAPI/api/revenueProfitFeedbacks/Post ', 'put': '/BRNToolCoreAPI/BRNToolCoreAPI/api/revenueProfitFeedbacks/Put' },
    'resendManagements': { 'get': '/BRNToolCoreAPI/BRNToolCoreAPI/api/resendManagements/Get', 'getList': '/BRNToolCoreAPI/BRNToolCoreAPI/api/resendManagements/GetList', 'delete': '/BRNToolCoreAPI/BRNToolCoreAPI/api/resendManagements/Delete', 'post': '/BRNToolCoreAPI/BRNToolCoreAPI/api/resendManagements/Post ', 'put': '/BRNToolCoreAPI/BRNToolCoreAPI/api/resendManagements/Put' },
    'refunds': { 'get': '/BRNToolCoreAPI/BRNToolCoreAPI/api/refunds/Get', 'getList': '/BRNToolCoreAPI/BRNToolCoreAPI/api/refunds/GetList', 'delete': '/BRNToolCoreAPI/BRNToolCoreAPI/api/refunds/Delete', 'post': '/BRNToolCoreAPI/BRNToolCoreAPI/api/refunds/Post ', 'put': '/BRNToolCoreAPI/BRNToolCoreAPI/api/refunds/Put' },
    'prices': { 'get': '/BRNToolCoreAPI/BRNToolCoreAPI/api/prices/Get', 'getList': '/BRNToolCoreAPI/BRNToolCoreAPI/api/prices/GetList', 'delete': '/BRNToolCoreAPI/BRNToolCoreAPI/api/prices/Delete', 'post': '/BRNToolCoreAPI/BRNToolCoreAPI/api/prices/Post ', 'put': '/BRNToolCoreAPI/BRNToolCoreAPI/api/prices/Put' },
    'priceDetail': { 'get': '/BRNToolCoreAPI/BRNToolCoreAPI/api/priceDetail/Get', 'getList': '/BRNToolCoreAPI/BRNToolCoreAPI/api/priceDetail/GetList', 'delete': '/BRNToolCoreAPI/BRNToolCoreAPI/api/priceDetail/Delete', 'post': '/BRNToolCoreAPI/BRNToolCoreAPI/api/priceDetail/Post ', 'put': '/BRNToolCoreAPI/BRNToolCoreAPI/api/priceDetail/Put' },
    'prepaidRecharge': { 'get': '/BRNToolCoreAPI/BRNToolCoreAPI/api/prepaidRecharge/Get', 'getList': '/BRNToolCoreAPI/BRNToolCoreAPI/api/prepaidRecharge/GetList', 'delete': '/BRNToolCoreAPI/BRNToolCoreAPI/api/prepaidRecharge/Delete', 'post': '/BRNToolCoreAPI/BRNToolCoreAPI/api/prepaidRecharge/Post ', 'put': '/BRNToolCoreAPI/BRNToolCoreAPI/api/prepaidRecharge/Put' },
    'prepaidPackage': { 'get': '/BRNToolCoreAPI/BRNToolCoreAPI/api/prepaidPackage/Get', 'getList': '/BRNToolCoreAPI/BRNToolCoreAPI/api/prepaidPackage/GetList', 'delete': '/BRNToolCoreAPI/BRNToolCoreAPI/api/prepaidPackage/Delete', 'post': '/BRNToolCoreAPI/BRNToolCoreAPI/api/prepaidPackage/Post ', 'put': '/BRNToolCoreAPI/BRNToolCoreAPI/api/prepaidPackage/Put', 'searchPrePaid': '/BRNToolCoreAPI/BRNToolCoreAPI/api/prepaidPackage/SearchPrePaid' },
    'prepaidManagements': { 'get': '/BRNToolCoreAPI/BRNToolCoreAPI/api/prepaidManagements/Get', 'getList': '/BRNToolCoreAPI/BRNToolCoreAPI/api/prepaidManagements/GetList', 'delete': '/BRNToolCoreAPI/BRNToolCoreAPI/api/prepaidManagements/Delete', 'post': '/BRNToolCoreAPI/BRNToolCoreAPI/api/prepaidManagements/Post ', 'put': '/BRNToolCoreAPI/BRNToolCoreAPI/api/prepaidManagements/Put' },
    'passwordPolicies': { 'get': '/BRNToolCoreAPI/BRNToolCoreAPI/api/passwordPolicies/Get', 'getList': '/BRNToolCoreAPI/BRNToolCoreAPI/api/passwordPolicies/GetList', 'delete': '/BRNToolCoreAPI/BRNToolCoreAPI/api/passwordPolicies/Delete', 'post': '/BRNToolCoreAPI/BRNToolCoreAPI/api/passwordPolicies/Post ', 'put': '/BRNToolCoreAPI/BRNToolCoreAPI/api/passwordPolicies/Put' },
    'passwordHistorys': { 'get': '/BRNToolCoreAPI/BRNToolCoreAPI/api/passwordHistorys/Get', 'getList': '/BRNToolCoreAPI/BRNToolCoreAPI/api/passwordHistorys/GetList', 'delete': '/BRNToolCoreAPI/BRNToolCoreAPI/api/passwordHistorys/Delete', 'post': '/BRNToolCoreAPI/BRNToolCoreAPI/api/passwordHistorys/Post ', 'put': '/BRNToolCoreAPI/BRNToolCoreAPI/api/passwordHistorys/Put' },
    'partners': { 'get': '/BRNToolCoreAPI/BRNToolCoreAPI/api/partners/Get', 'getList': '/BRNToolCoreAPI/BRNToolCoreAPI/api/partners/GetList', 'delete': '/BRNToolCoreAPI/BRNToolCoreAPI/api/partners/Delete', 'post': '/BRNToolCoreAPI/BRNToolCoreAPI/api/partners/Post ', 'put': '/BRNToolCoreAPI/BRNToolCoreAPI/api/partners/Put' },
    'partnerQuota': { 'get': '/BRNToolCoreAPI/BRNToolCoreAPI/api/partnerQuota/Get', 'getList': '/BRNToolCoreAPI/BRNToolCoreAPI/api/partnerQuota/GetList', 'delete': '/BRNToolCoreAPI/BRNToolCoreAPI/api/partnerQuota/Delete', 'post': '/BRNToolCoreAPI/BRNToolCoreAPI/api/partnerQuota/Post ', 'put': '/BRNToolCoreAPI/BRNToolCoreAPI/api/partnerQuota/Put' },
    'packageSmsOrder': {
        'get': '/BRNToolCoreAPI/BRNToolCoreAPI/api/packageSmsOrder/Get', 'getList': '/BRNToolCoreAPI/BRNToolCoreAPI/api/packageSmsOrder/GetList', 'delete': '/BRNToolCoreAPI/BRNToolCoreAPI/api/packageSmsOrder/Delete', 'post': '/BRNToolCoreAPI/BRNToolCoreAPI/api/packageSmsOrder/Post ', 'put': '/BRNToolCoreAPI/BRNToolCoreAPI/api/packageSmsOrder/Put',
        'getPackageSmsOderByCode': '/BRNToolCoreAPI/BRNToolCoreAPI/api/packageSmsOrder/GetPackageSmsOderByCode', 'updateStatus': '/BRNToolCoreAPI/BRNToolCoreAPI/api/packageSmsOrder/UpdateStatus'
    },
    'orders': { 'get': '/BRNToolCoreAPI/BRNToolCoreAPI/api/orders/Get', 'getList': '/BRNToolCoreAPI/BRNToolCoreAPI/api/orders/GetList', 'delete': '/BRNToolCoreAPI/BRNToolCoreAPI/api/orders/Delete', 'post': '/BRNToolCoreAPI/BRNToolCoreAPI/api/orders/Post ', 'put': '/BRNToolCoreAPI/BRNToolCoreAPI/api/orders/Put' },
    'orderOttDetailSend': { 'get': '/BRNToolCoreAPI/BRNToolCoreAPI/api/orderOttDetailSend/Get', 'getList': '/BRNToolCoreAPI/BRNToolCoreAPI/api/orderOttDetailSend/GetList', 'delete': '/BRNToolCoreAPI/BRNToolCoreAPI/api/orderOttDetailSend/Delete', 'post': '/BRNToolCoreAPI/BRNToolCoreAPI/api/orderOttDetailSend/Post ', 'put': '/BRNToolCoreAPI/BRNToolCoreAPI/api/orderOttDetailSend/Put' },
    'orderOttDetail': { 'get': '/BRNToolCoreAPI/BRNToolCoreAPI/api/orderOttDetail/Get', 'getList': '/BRNToolCoreAPI/BRNToolCoreAPI/api/orderOttDetail/GetList', 'delete': '/BRNToolCoreAPI/BRNToolCoreAPI/api/orderOttDetail/Delete', 'post': '/BRNToolCoreAPI/BRNToolCoreAPI/api/orderOttDetail/Post ', 'put': '/BRNToolCoreAPI/BRNToolCoreAPI/api/orderOttDetail/Put' },
    'orderOtt': { 'get': '/BRNToolCoreAPI/BRNToolCoreAPI/api/orderOtt/Get', 'getList': '/BRNToolCoreAPI/BRNToolCoreAPI/api/orderOtt/GetList', 'delete': '/BRNToolCoreAPI/BRNToolCoreAPI/api/orderOtt/Delete', 'post': '/BRNToolCoreAPI/BRNToolCoreAPI/api/orderOtt/Post ', 'put': '/BRNToolCoreAPI/BRNToolCoreAPI/api/orderOtt/Put' },
    'orderEmailDetailSend': { 'get': '/BRNToolCoreAPI/BRNToolCoreAPI/api/orderEmailDetailSend/Get', 'getList': '/BRNToolCoreAPI/BRNToolCoreAPI/api/orderEmailDetailSend/GetList', 'delete': '/BRNToolCoreAPI/BRNToolCoreAPI/api/orderEmailDetailSend/Delete', 'post': '/BRNToolCoreAPI/BRNToolCoreAPI/api/orderEmailDetailSend/Post ', 'put': '/BRNToolCoreAPI/BRNToolCoreAPI/api/orderEmailDetailSend/Put' },
    'orderEmail': { 'get': '/BRNToolCoreAPI/BRNToolCoreAPI/api/orderEmail/Get', 'getList': '/BRNToolCoreAPI/BRNToolCoreAPI/api/orderEmail/GetList', 'delete': '/BRNToolCoreAPI/BRNToolCoreAPI/api/orderEmail/Delete', 'post': '/BRNToolCoreAPI/BRNToolCoreAPI/api/orderEmail/Post ', 'put': '/BRNToolCoreAPI/BRNToolCoreAPI/api/orderEmail/Put' },
    'orderDetailSend': { 'get': '/BRNToolCoreAPI/BRNToolCoreAPI/api/orderDetailSend/Get', 'getList': '/BRNToolCoreAPI/BRNToolCoreAPI/api/orderDetailSend/GetList', 'delete': '/BRNToolCoreAPI/BRNToolCoreAPI/api/orderDetailSend/Delete', 'post': '/BRNToolCoreAPI/BRNToolCoreAPI/api/orderDetailSend/Post ', 'put': '/BRNToolCoreAPI/BRNToolCoreAPI/api/orderDetailSend/Put' },
    'orderDetailResend': { 'get': '/BRNToolCoreAPI/BRNToolCoreAPI/api/orderDetailResend/Get', 'getList': '/BRNToolCoreAPI/BRNToolCoreAPI/api/orderDetailResend/GetList', 'delete': '/BRNToolCoreAPI/BRNToolCoreAPI/api/orderDetailResend/Delete', 'post': '/BRNToolCoreAPI/BRNToolCoreAPI/api/orderDetailResend/Post ', 'put': '/BRNToolCoreAPI/BRNToolCoreAPI/api/orderDetailResend/Put' },
    'orderDetail': { 'get': '/BRNToolCoreAPI/BRNToolCoreAPI/api/orderDetail/Get', 'getList': '/BRNToolCoreAPI/BRNToolCoreAPI/api/orderDetail/GetList', 'delete': '/BRNToolCoreAPI/BRNToolCoreAPI/api/orderDetail/Delete', 'post': '/BRNToolCoreAPI/BRNToolCoreAPI/api/orderDetail/Post ', 'put': '/BRNToolCoreAPI/BRNToolCoreAPI/api/orderDetail/Put' },
    'multimediaData': { 'get': '/BRNToolCoreAPI/BRNToolCoreAPI/api/multimediaData/Get', 'getList': '/BRNToolCoreAPI/BRNToolCoreAPI/api/multimediaData/GetList', 'delete': '/BRNToolCoreAPI/BRNToolCoreAPI/api/multimediaData/Delete', 'post': '/BRNToolCoreAPI/BRNToolCoreAPI/api/multimediaData/Post ', 'put': '/BRNToolCoreAPI/BRNToolCoreAPI/api/multimediaData/Put' },
    'mapPriceContracts': { 'get': '/BRNToolCoreAPI/BRNToolCoreAPI/api/mapPriceContracts/Get', 'getList': '/BRNToolCoreAPI/BRNToolCoreAPI/api/mapPriceContracts/GetList', 'delete': '/BRNToolCoreAPI/BRNToolCoreAPI/api/mapPriceContracts/Delete', 'post': '/BRNToolCoreAPI/BRNToolCoreAPI/api/mapPriceContracts/Post ', 'put': '/BRNToolCoreAPI/BRNToolCoreAPI/api/mapPriceContracts/Put' },
    'mapErrorRouters': { 'get': '/BRNToolCoreAPI/BRNToolCoreAPI/api/mapErrorRouters/Get', 'getList': '/BRNToolCoreAPI/BRNToolCoreAPI/api/mapErrorRouters/GetList', 'delete': '/BRNToolCoreAPI/BRNToolCoreAPI/api/mapErrorRouters/Delete', 'post': '/BRNToolCoreAPI/BRNToolCoreAPI/api/mapErrorRouters/Post ', 'put': '/BRNToolCoreAPI/BRNToolCoreAPI/api/mapErrorRouters/Put' },
    'mapBrLongnumber': { 'get': '/BRNToolCoreAPI/BRNToolCoreAPI/api/mapBrLongnumber/Get', 'getList': '/BRNToolCoreAPI/BRNToolCoreAPI/api/mapBrLongnumber/GetList', 'delete': '/BRNToolCoreAPI/BRNToolCoreAPI/api/mapBrLongnumber/Delete', 'post': '/BRNToolCoreAPI/BRNToolCoreAPI/api/mapBrLongnumber/Post ', 'put': '/BRNToolCoreAPI/BRNToolCoreAPI/api/mapBrLongnumber/Put' },
    'mapRouterBrands': { 'get': '/BRNToolCoreAPI/BRNToolCoreAPI/api/mapRouterBrands/Get', 'getList': '/BRNToolCoreAPI/BRNToolCoreAPI/api/mapRouterBrands/GetList', 'delete': '/BRNToolCoreAPI/BRNToolCoreAPI/api/mapRouterBrands/Delete', 'post': '/BRNToolCoreAPI/BRNToolCoreAPI/api/mapRouterBrands/Post ', 'put': '/BRNToolCoreAPI/BRNToolCoreAPI/api/mapRouterBrands/Put' },
    'mailSender': { 'get': '/BRNToolCoreAPI/BRNToolCoreAPI/api/mailSender/Get', 'getList': '/BRNToolCoreAPI/BRNToolCoreAPI/api/mailSender/GetList', 'delete': '/BRNToolCoreAPI/BRNToolCoreAPI/api/mailSender/Delete', 'post': '/BRNToolCoreAPI/BRNToolCoreAPI/api/mailSender/Post ', 'put': '/BRNToolCoreAPI/BRNToolCoreAPI/api/mailSender/Put' },
    'logTransferRouter': { 'get': '/BRNToolCoreAPI/BRNToolCoreAPI/api/logTransferRouter/Get', 'getList': '/BRNToolCoreAPI/BRNToolCoreAPI/api/logTransferRouter/GetList', 'delete': '/BRNToolCoreAPI/BRNToolCoreAPI/api/logTransferRouter/Delete', 'post': '/BRNToolCoreAPI/BRNToolCoreAPI/api/logTransferRouter/Post ', 'put': '/BRNToolCoreAPI/BRNToolCoreAPI/api/logTransferRouter/Put' },
    'logTpsTest': { 'get': '/BRNToolCoreAPI/BRNToolCoreAPI/api/logTpsTest/Get', 'getList': '/BRNToolCoreAPI/BRNToolCoreAPI/api/logTpsTest/GetList', 'delete': '/BRNToolCoreAPI/BRNToolCoreAPI/api/logTpsTest/Delete', 'post': '/BRNToolCoreAPI/BRNToolCoreAPI/api/logTpsTest/Post ', 'put': '/BRNToolCoreAPI/BRNToolCoreAPI/api/logTpsTest/Put' },
    'logCdrDetail': { 'get': '/BRNToolCoreAPI/BRNToolCoreAPI/api/logCdrDetail/Get', 'getList': '/BRNToolCoreAPI/BRNToolCoreAPI/api/logCdrDetail/GetList', 'delete': '/BRNToolCoreAPI/BRNToolCoreAPI/api/logCdrDetail/Delete', 'post': '/BRNToolCoreAPI/BRNToolCoreAPI/api/logCdrDetail/Post ', 'put': '/BRNToolCoreAPI/BRNToolCoreAPI/api/logCdrDetail/Put' },
    'logCdr': { 'get': '/BRNToolCoreAPI/BRNToolCoreAPI/api/logCdr/Get', 'getList': '/BRNToolCoreAPI/BRNToolCoreAPI/api/logCdr/GetList', 'delete': '/BRNToolCoreAPI/BRNToolCoreAPI/api/logCdr/Delete', 'post': '/BRNToolCoreAPI/BRNToolCoreAPI/api/logCdr/Post ', 'put': '/BRNToolCoreAPI/BRNToolCoreAPI/api/logCdr/Put' },
    'logActions': { 'get': '/BRNToolCoreAPI/BRNToolCoreAPI/api/logActions/Get', 'getList': '/BRNToolCoreAPI/BRNToolCoreAPI/api/logActions/GetList', 'delete': '/BRNToolCoreAPI/BRNToolCoreAPI/api/logActions/Delete', 'post': '/BRNToolCoreAPI/BRNToolCoreAPI/api/logActions/Post ', 'put': '/BRNToolCoreAPI/BRNToolCoreAPI/api/logActions/Put' },
    'infoReceiveAlert': { 'get': '/BRNToolCoreAPI/BRNToolCoreAPI/api/infoReceiveAlert/Get', 'getList': '/BRNToolCoreAPI/BRNToolCoreAPI/api/infoReceiveAlert/GetList', 'delete': '/BRNToolCoreAPI/BRNToolCoreAPI/api/infoReceiveAlert/Delete', 'post': '/BRNToolCoreAPI/BRNToolCoreAPI/api/infoReceiveAlert/Post ', 'put': '/BRNToolCoreAPI/BRNToolCoreAPI/api/infoReceiveAlert/Put' },
    'groupTelcos': { 'get': '/BRNToolCoreAPI/BRNToolCoreAPI/api/groupTelcos/Get', 'getList': '/BRNToolCoreAPI/BRNToolCoreAPI/api/groupTelcos/GetList', 'delete': '/BRNToolCoreAPI/BRNToolCoreAPI/api/groupTelcos/Delete', 'post': '/BRNToolCoreAPI/BRNToolCoreAPI/api/groupTelcos/Post ', 'put': '/BRNToolCoreAPI/BRNToolCoreAPI/api/groupTelcos/Put' },
    'groupBlackLists': { 'get': '/BRNToolCoreAPI/BRNToolCoreAPI/api/groupBlackLists/Get', 'getList': '/BRNToolCoreAPI/BRNToolCoreAPI/api/groupBlackLists/GetList', 'delete': '/BRNToolCoreAPI/BRNToolCoreAPI/api/groupBlackLists/Delete', 'post': '/BRNToolCoreAPI/BRNToolCoreAPI/api/groupBlackLists/Post ', 'put': '/BRNToolCoreAPI/BRNToolCoreAPI/api/groupBlackLists/Put' },
    'groupBlackKeywords': { 'get': '/BRNToolCoreAPI/BRNToolCoreAPI/api/groupBlackKeywords/Get', 'getList': '/BRNToolCoreAPI/BRNToolCoreAPI/api/groupBlackKeywords/GetList', 'delete': '/BRNToolCoreAPI/BRNToolCoreAPI/api/groupBlackKeywords/Delete', 'post': '/BRNToolCoreAPI/BRNToolCoreAPI/api/groupBlackKeywords/Post ', 'put': '/BRNToolCoreAPI/BRNToolCoreAPI/api/groupBlackKeywords/Put' },
    'giftcodes': { 'get': '/BRNToolCoreAPI/BRNToolCoreAPI/api/giftcodes/Get', 'getList': '/BRNToolCoreAPI/BRNToolCoreAPI/api/giftcodes/GetList', 'delete': '/BRNToolCoreAPI/BRNToolCoreAPI/api/giftcodes/Delete', 'post': '/BRNToolCoreAPI/BRNToolCoreAPI/api/giftcodes/Post ', 'put': '/BRNToolCoreAPI/BRNToolCoreAPI/api/giftcodes/Put' },
    'giftcodeDetailSend': { 'get': '/BRNToolCoreAPI/BRNToolCoreAPI/api/giftcodeDetailSend/Get', 'getList': '/BRNToolCoreAPI/BRNToolCoreAPI/api/giftcodeDetailSend/GetList', 'delete': '/BRNToolCoreAPI/BRNToolCoreAPI/api/giftcodeDetailSend/Delete', 'post': '/BRNToolCoreAPI/BRNToolCoreAPI/api/giftcodeDetailSend/Post ', 'put': '/BRNToolCoreAPI/BRNToolCoreAPI/api/giftcodeDetailSend/Put' },
    'giftcodeDetail': { 'get': '/BRNToolCoreAPI/BRNToolCoreAPI/api/giftcodeDetail/Get', 'getList': '/BRNToolCoreAPI/BRNToolCoreAPI/api/giftcodeDetail/GetList', 'delete': '/BRNToolCoreAPI/BRNToolCoreAPI/api/giftcodeDetail/Delete', 'post': '/BRNToolCoreAPI/BRNToolCoreAPI/api/giftcodeDetail/Post ', 'put': '/BRNToolCoreAPI/BRNToolCoreAPI/api/giftcodeDetail/Put' },
    'failovers': { 'get': '/BRNToolCoreAPI/BRNToolCoreAPI/api/failovers/Get', 'getList': '/BRNToolCoreAPI/BRNToolCoreAPI/api/failovers/GetList', 'delete': '/BRNToolCoreAPI/BRNToolCoreAPI/api/failovers/Delete', 'post': '/BRNToolCoreAPI/BRNToolCoreAPI/api/failovers/Post ', 'put': '/BRNToolCoreAPI/BRNToolCoreAPI/api/failovers/Put' },
    'failoverDetail': { 'get': '/BRNToolCoreAPI/BRNToolCoreAPI/api/failoverDetail/Get', 'getList': '/BRNToolCoreAPI/BRNToolCoreAPI/api/failoverDetail/GetList', 'delete': '/BRNToolCoreAPI/BRNToolCoreAPI/api/failoverDetail/Delete', 'post': '/BRNToolCoreAPI/BRNToolCoreAPI/api/failoverDetail/Post ', 'put': '/BRNToolCoreAPI/BRNToolCoreAPI/api/failoverDetail/Put' },
    'errors': { 'get': '/BRNToolCoreAPI/BRNToolCoreAPI/api/errors/Get', 'getList': '/BRNToolCoreAPI/BRNToolCoreAPI/api/errors/GetList', 'delete': '/BRNToolCoreAPI/BRNToolCoreAPI/api/errors/Delete', 'post': '/BRNToolCoreAPI/BRNToolCoreAPI/api/errors/Post ', 'put': '/BRNToolCoreAPI/BRNToolCoreAPI/api/errors/Put' },
    'departments': { 'get': '/BRNToolCoreAPI/BRNToolCoreAPI/api/departments/Get', 'getList': '/BRNToolCoreAPI/BRNToolCoreAPI/api/departments/GetList', 'delete': '/BRNToolCoreAPI/BRNToolCoreAPI/api/departments/Delete', 'post': '/BRNToolCoreAPI/BRNToolCoreAPI/api/departments/Post ', 'put': '/BRNToolCoreAPI/BRNToolCoreAPI/api/departments/Put', 'getListNotDelete': '/BRNToolCoreAPI/BRNToolCoreAPI/api/departments/GetListNotDelete' },
    'declarationAdsDetail': { 'get': '/BRNToolCoreAPI/BRNToolCoreAPI/api/declarationAdsDetail/Get', 'getList': '/BRNToolCoreAPI/BRNToolCoreAPI/api/declarationAdsDetail/GetList', 'delete': '/BRNToolCoreAPI/BRNToolCoreAPI/api/declarationAdsDetail/Delete', 'post': '/BRNToolCoreAPI/BRNToolCoreAPI/api/declarationAdsDetail/Post ', 'put': '/BRNToolCoreAPI/BRNToolCoreAPI/api/declarationAdsDetail/Put' },
    'declarationAds': { 'get': '/BRNToolCoreAPI/BRNToolCoreAPI/api/declarationAds/Get', 'getList': '/BRNToolCoreAPI/BRNToolCoreAPI/api/declarationAds/GetList', 'delete': '/BRNToolCoreAPI/BRNToolCoreAPI/api/declarationAds/Delete', 'post': '/BRNToolCoreAPI/BRNToolCoreAPI/api/declarationAds/Post ', 'put': '/BRNToolCoreAPI/BRNToolCoreAPI/api/declarationAds/Put' },
    'debtRecoveryDetail': { 'get': '/BRNToolCoreAPI/BRNToolCoreAPI/api/debtRecoveryDetail/Get', 'getList': '/BRNToolCoreAPI/BRNToolCoreAPI/api/debtRecoveryDetail/GetList', 'delete': '/BRNToolCoreAPI/BRNToolCoreAPI/api/debtRecoveryDetail/Delete', 'post': '/BRNToolCoreAPI/BRNToolCoreAPI/api/debtRecoveryDetail/Post ', 'put': '/BRNToolCoreAPI/BRNToolCoreAPI/api/debtRecoveryDetail/Put' },
    'debtRecovery': { 'get': '/BRNToolCoreAPI/BRNToolCoreAPI/api/debtRecovery/Get', 'getList': '/BRNToolCoreAPI/BRNToolCoreAPI/api/debtRecovery/GetList', 'delete': '/BRNToolCoreAPI/BRNToolCoreAPI/api/debtRecovery/Delete', 'post': '/BRNToolCoreAPI/BRNToolCoreAPI/api/debtRecovery/Post ', 'put': '/BRNToolCoreAPI/BRNToolCoreAPI/api/debtRecovery/Put' },
    'dataCustomers': { 'get': '/BRNToolCoreAPI/BRNToolCoreAPI/api/dataCustomers/Get', 'getList': '/BRNToolCoreAPI/BRNToolCoreAPI/api/dataCustomers/GetList', 'delete': '/BRNToolCoreAPI/BRNToolCoreAPI/api/dataCustomers/Delete', 'post': '/BRNToolCoreAPI/BRNToolCoreAPI/api/dataCustomers/Post ', 'put': '/BRNToolCoreAPI/BRNToolCoreAPI/api/dataCustomers/Put' },
    'dataCustomerGroup': { 'get': '/BRNToolCoreAPI/BRNToolCoreAPI/api/dataCustomerGroup/Get', 'getList': '/BRNToolCoreAPI/BRNToolCoreAPI/api/dataCustomerGroup/GetList', 'delete': '/BRNToolCoreAPI/BRNToolCoreAPI/api/dataCustomerGroup/Delete', 'post': '/BRNToolCoreAPI/BRNToolCoreAPI/api/dataCustomerGroup/Post ', 'put': '/BRNToolCoreAPI/BRNToolCoreAPI/api/dataCustomerGroup/Put' },
    'contracts': { 'get': '/BRNToolCoreAPI/BRNToolCoreAPI/api/contracts/Get', 'getList': '/BRNToolCoreAPI/BRNToolCoreAPI/api/contracts/GetList', 'delete': '/BRNToolCoreAPI/BRNToolCoreAPI/api/contracts/Delete', 'post': '/BRNToolCoreAPI/BRNToolCoreAPI/api/contracts/Post ', 'put': '/BRNToolCoreAPI/BRNToolCoreAPI/api/contracts/Put' },
    'chargings': { 'get': '/BRNToolCoreAPI/BRNToolCoreAPI/api/chargings/Get', 'getList': '/BRNToolCoreAPI/BRNToolCoreAPI/api/chargings/GetList', 'delete': '/BRNToolCoreAPI/BRNToolCoreAPI/api/chargings/Delete', 'post': '/BRNToolCoreAPI/BRNToolCoreAPI/api/chargings/Post ', 'put': '/BRNToolCoreAPI/BRNToolCoreAPI/api/chargings/Put', 'seachChargings': '/BRNToolCoreAPI/BRNToolCoreAPI/api/chargings/SeachChargings' },
    'chargingDetail': { 'get': '/BRNToolCoreAPI/BRNToolCoreAPI/api/chargingDetail/Get', 'getList': '/BRNToolCoreAPI/BRNToolCoreAPI/api/chargingDetail/GetList', 'delete': '/BRNToolCoreAPI/BRNToolCoreAPI/api/chargingDetail/Delete', 'post': '/BRNToolCoreAPI/BRNToolCoreAPI/api/chargingDetail/Post ', 'put': '/BRNToolCoreAPI/BRNToolCoreAPI/api/chargingDetail/Put' },
    'campaigns': { 'get': '/BRNToolCoreAPI/BRNToolCoreAPI/api/campaigns/Get', 'getList': '/BRNToolCoreAPI/BRNToolCoreAPI/api/campaigns/GetList', 'delete': '/BRNToolCoreAPI/BRNToolCoreAPI/api/campaigns/Delete', 'post': '/BRNToolCoreAPI/BRNToolCoreAPI/api/campaigns/Post ', 'put': '/BRNToolCoreAPI/BRNToolCoreAPI/api/campaigns/Put' },
    'campaignDetailSend': { 'get': '/BRNToolCoreAPI/BRNToolCoreAPI/api/campaignDetailSend/Get', 'getList': '/BRNToolCoreAPI/BRNToolCoreAPI/api/campaignDetailSend/GetList', 'delete': '/BRNToolCoreAPI/BRNToolCoreAPI/api/campaignDetailSend/Delete', 'post': '/BRNToolCoreAPI/BRNToolCoreAPI/api/campaignDetailSend/Post ', 'put': '/BRNToolCoreAPI/BRNToolCoreAPI/api/campaignDetailSend/Put' },
    'campaignDetail': { 'get': '/BRNToolCoreAPI/BRNToolCoreAPI/api/campaignDetail/Get', 'getList': '/BRNToolCoreAPI/BRNToolCoreAPI/api/campaignDetail/GetList', 'delete': '/BRNToolCoreAPI/BRNToolCoreAPI/api/campaignDetail/Delete', 'post': '/BRNToolCoreAPI/BRNToolCoreAPI/api/campaignDetail/Post ', 'put': '/BRNToolCoreAPI/BRNToolCoreAPI/api/campaignDetail/Put' },
    'brandRoleDetailRouter': { 'get': '/BRNToolCoreAPI/BRNToolCoreAPI/api/brandRoleDetailRouter/Get', 'getList': '/BRNToolCoreAPI/BRNToolCoreAPI/api/brandRoleDetailRouter/GetList', 'delete': '/BRNToolCoreAPI/BRNToolCoreAPI/api/brandRoleDetailRouter/Delete', 'post': '/BRNToolCoreAPI/BRNToolCoreAPI/api/brandRoleDetailRouter/Post ', 'put': '/BRNToolCoreAPI/BRNToolCoreAPI/api/brandRoleDetailRouter/Put' },
    'brandRoleDetail': { 'get': '/BRNToolCoreAPI/BRNToolCoreAPI/api/brandRoleDetail/Get', 'getList': '/BRNToolCoreAPI/BRNToolCoreAPI/api/brandRoleDetail/GetList', 'delete': '/BRNToolCoreAPI/BRNToolCoreAPI/api/brandRoleDetail/Delete', 'post': '/BRNToolCoreAPI/BRNToolCoreAPI/api/brandRoleDetail/Post ', 'put': '/BRNToolCoreAPI/BRNToolCoreAPI/api/brandRoleDetail/Put' },
    'brandPendingDetail': { 'get': '/BRNToolCoreAPI/BRNToolCoreAPI/api/brandPendingDetail/Get', 'getList': '/BRNToolCoreAPI/BRNToolCoreAPI/api/brandPendingDetail/GetList', 'delete': '/BRNToolCoreAPI/BRNToolCoreAPI/api/brandPendingDetail/Delete', 'post': '/BRNToolCoreAPI/BRNToolCoreAPI/api/brandPendingDetail/Post ', 'put': '/BRNToolCoreAPI/BRNToolCoreAPI/api/brandPendingDetail/Put' },
    'brandPending': { 'get': '/BRNToolCoreAPI/BRNToolCoreAPI/api/brandPending/Get', 'getList': '/BRNToolCoreAPI/BRNToolCoreAPI/api/brandPending/GetList', 'delete': '/BRNToolCoreAPI/BRNToolCoreAPI/api/brandPending/Delete', 'post': '/BRNToolCoreAPI/BRNToolCoreAPI/api/brandPending/Post ', 'put': '/BRNToolCoreAPI/BRNToolCoreAPI/api/brandPending/Put' },
    'brandDetailRouter': { 'get': '/BRNToolCoreAPI/BRNToolCoreAPI/api/brandDetailRouter/Get', 'getList': '/BRNToolCoreAPI/BRNToolCoreAPI/api/brandDetailRouter/GetList', 'delete': '/BRNToolCoreAPI/BRNToolCoreAPI/api/brandDetailRouter/Delete', 'post': '/BRNToolCoreAPI/BRNToolCoreAPI/api/brandDetailRouter/Post ', 'put': '/BRNToolCoreAPI/BRNToolCoreAPI/api/brandDetailRouter/Put' },
    'brandDetail': { 'get': '/BRNToolCoreAPI/BRNToolCoreAPI/api/brandDetail/Get', 'getList': '/BRNToolCoreAPI/BRNToolCoreAPI/api/brandDetail/GetList', 'delete': '/BRNToolCoreAPI/BRNToolCoreAPI/api/brandDetail/Delete', 'post': '/BRNToolCoreAPI/BRNToolCoreAPI/api/brandDetail/Post ', 'put': '/BRNToolCoreAPI/BRNToolCoreAPI/api/brandDetail/Put' },
    'blackLists': { 'get': '/BRNToolCoreAPI/BRNToolCoreAPI/api/blackLists/Get', 'getList': '/BRNToolCoreAPI/BRNToolCoreAPI/api/blackLists/GetList', 'delete': '/BRNToolCoreAPI/BRNToolCoreAPI/api/blackLists/Delete', 'post': '/BRNToolCoreAPI/BRNToolCoreAPI/api/blackLists/Post ', 'put': '/BRNToolCoreAPI/BRNToolCoreAPI/api/blackLists/Put' },
    'blackListManagements': { 'get': '/BRNToolCoreAPI/BRNToolCoreAPI/api/blackListManagements/Get', 'getList': '/BRNToolCoreAPI/BRNToolCoreAPI/api/blackListManagements/GetList', 'delete': '/BRNToolCoreAPI/BRNToolCoreAPI/api/blackListManagements/Delete', 'post': '/BRNToolCoreAPI/BRNToolCoreAPI/api/blackListManagements/Post ', 'put': '/BRNToolCoreAPI/BRNToolCoreAPI/api/blackListManagements/Put' },
    'blackKeywords': { 'get': '/BRNToolCoreAPI/BRNToolCoreAPI/api/blackKeywords/Get', 'getList': '/BRNToolCoreAPI/BRNToolCoreAPI/api/blackKeywords/GetList', 'delete': '/BRNToolCoreAPI/BRNToolCoreAPI/api/blackKeywords/Delete', 'post': '/BRNToolCoreAPI/BRNToolCoreAPI/api/blackKeywords/Post ', 'put': '/BRNToolCoreAPI/BRNToolCoreAPI/api/blackKeywords/Put' },
    'blackKeywordManagements': { 'get': '/BRNToolCoreAPI/BRNToolCoreAPI/api/blackKeywordManagements/Get', 'getList': '/BRNToolCoreAPI/BRNToolCoreAPI/api/blackKeywordManagements/GetList', 'delete': '/BRNToolCoreAPI/BRNToolCoreAPI/api/blackKeywordManagements/Delete', 'post': '/BRNToolCoreAPI/BRNToolCoreAPI/api/blackKeywordManagements/Post ', 'put': '/BRNToolCoreAPI/BRNToolCoreAPI/api/blackKeywordManagements/Put' },
    'billing': { 'get': '/BRNToolCoreAPI/BRNToolCoreAPI/api/billing/Get', 'getList': '/BRNToolCoreAPI/BRNToolCoreAPI/api/billing/GetList', 'delete': '/BRNToolCoreAPI/BRNToolCoreAPI/api/billing/Delete', 'post': '/BRNToolCoreAPI/BRNToolCoreAPI/api/billing/Post ', 'put': '/BRNToolCoreAPI/BRNToolCoreAPI/api/billing/Put' },
    'appendixs': { 'get': '/BRNToolCoreAPI/BRNToolCoreAPI/api/appendixs/Get', 'getList': '/BRNToolCoreAPI/BRNToolCoreAPI/api/appendixs/GetList', 'delete': '/BRNToolCoreAPI/BRNToolCoreAPI/api/appendixs/Delete', 'post': '/BRNToolCoreAPI/BRNToolCoreAPI/api/appendixs/Post ', 'put': '/BRNToolCoreAPI/BRNToolCoreAPI/api/appendixs/Put' },
    'accountVolatilitysDetail': { 'get': '/BRNToolCoreAPI/BRNToolCoreAPI/api/accountVolatilitysDetail/Get', 'getList': '/BRNToolCoreAPI/BRNToolCoreAPI/api/accountVolatilitysDetail/GetList', 'delete': '/BRNToolCoreAPI/BRNToolCoreAPI/api/accountVolatilitysDetail/Delete', 'post': '/BRNToolCoreAPI/BRNToolCoreAPI/api/accountVolatilitysDetail/Post ', 'put': '/BRNToolCoreAPI/BRNToolCoreAPI/api/accountVolatilitysDetail/Put' },
    'accountVolatilitys': { 'get': '/BRNToolCoreAPI/BRNToolCoreAPI/api/accountVolatilitys/Get', 'getList': '/BRNToolCoreAPI/BRNToolCoreAPI/api/accountVolatilitys/GetList', 'delete': '/BRNToolCoreAPI/BRNToolCoreAPI/api/accountVolatilitys/Delete', 'post': '/BRNToolCoreAPI/BRNToolCoreAPI/api/accountVolatilitys/Post ', 'put': '/BRNToolCoreAPI/BRNToolCoreAPI/api/accountVolatilitys/Put' },
    'accountCostMonth': { 'get': '/BRNToolCoreAPI/BRNToolCoreAPI/api/accountCostMonth/Get', 'getList': '/BRNToolCoreAPI/BRNToolCoreAPI/api/accountCostMonth/GetList', 'delete': '/BRNToolCoreAPI/BRNToolCoreAPI/api/accountCostMonth/Delete', 'post': '/BRNToolCoreAPI/BRNToolCoreAPI/api/accountCostMonth/Post ', 'put': '/BRNToolCoreAPI/BRNToolCoreAPI/api/accountCostMonth/Put' },
    'mapBrandAccount': { 'get': '/BRNToolCoreAPI/BRNToolCoreAPI/api/mapBrandAccount/Get', 'getList': '/BRNToolCoreAPI/BRNToolCoreAPI/api/mapBrandAccount/GetList', 'delete': '/BRNToolCoreAPI/BRNToolCoreAPI/api/mapBrandAccount/Delete', 'post': '/BRNToolCoreAPI/BRNToolCoreAPI/api/mapBrandAccount/Post ', 'put': '/BRNToolCoreAPI/BRNToolCoreAPI/api/mapBrandAccount/Put' },
    'configCountingMt': { 'get': '/BRNToolCoreAPI/BRNToolCoreAPI/api/configCountingMt/Get', 'getList': '/BRNToolCoreAPI/BRNToolCoreAPI/api/configCountingMt/GetList', 'delete': '/BRNToolCoreAPI/BRNToolCoreAPI/api/configCountingMt/Delete', 'post': '/BRNToolCoreAPI/BRNToolCoreAPI/api/configCountingMt/Post ', 'put': '/BRNToolCoreAPI/BRNToolCoreAPI/api/configCountingMt/Put' },

    'branchesExt': { 'deletes': '/BRNToolCoreAPI/BRNToolCoreAPI/api/branches/Deletes', 'search': '/BRNToolCoreAPI/BRNToolCoreAPI/api/branches/Search' },
    'sysCatGroupItemsExt': { 'deletes': '/PortalAPI/PortalAPI/api/sysCatGroupItems/Deletes', 'search': '/PortalAPI/PortalAPI/api/sysCatGroupItems/Search' },
    'sysCatItemsExt': {
        'deletes': '/PortalAPI/PortalAPI/api/sysCatItems/Deletes', 'search': '/PortalAPI/PortalAPI/api/sysCatItems/Search',
        'getAll': '/PortalAPI/PortalAPI/api/sysCatItems/GetAll', 'getMsgByRouter': '/PortalAPI/PortalAPI/api/sysCatItems/GetMsgByRouter',
        'getListByTypeGroup': '/PortalAPI/PortalAPI/api/sysCatItems/GetListByTypeGroup'
    },
    'errorsExt': { 'deletes': '/PortalAPI/PortalAPI/api/errors/Deletes', 'search': '/PortalAPI/PortalAPI/api/errors/Search' },
    'tempMessagesExt': { 'deletes': '/BRNToolCoreAPI/BRNToolCoreAPI/api/tempMessages/Deletes', 'search': '/BRNToolCoreAPI/BRNToolCoreAPI/api/tempMessages/Search' },
    'telcosExt': { 'deletes': '/BRNToolCoreAPI/BRNToolCoreAPI/api/telcos/Deletes', 'search': '/BRNToolCoreAPI/BRNToolCoreAPI/api/telcos/Search' },
    'groupTelcosExt': { 'deletes': '/BRNToolCoreAPI/BRNToolCoreAPI/api/groupTelcos/Deletes', 'search': '/BRNToolCoreAPI/BRNToolCoreAPI/api/groupTelcos/Search', 'filterTelco': '/BRNToolCoreAPI/BRNToolCoreAPI/api/groupTelcos/FilterTelco' },
    'tempBirthdaysExt': { 'deletes': '/BRNToolCoreAPI/BRNToolCoreAPI/api/tempBirthdays/Deletes', 'search': '/BRNToolCoreAPI/BRNToolCoreAPI/api/tempBirthdays/Search' },
    'typePackageExt': { 'deletes': '/BRNToolCoreAPI/BRNToolCoreAPI/api/typePackage/Deletes', 'search': '/BRNToolCoreAPI/BRNToolCoreAPI/api/typePackage/Search' },
    'stepsCrossCheckExt': { 'deletes': '/BRNToolCoreAPI/BRNToolCoreAPI/api/stepsCrossCheck/Deletes', 'search': '/BRNToolCoreAPI/BRNToolCoreAPI/api/stepsCrossCheck/Search', 'getListByNextCrossCheck': '/BRNToolCoreAPI/BRNToolCoreAPI/api/stepsCrossCheck/GetListByNextCrossCheck' },
    'mailSenderExt': { 'deletes': '/BRNToolCoreAPI/BRNToolCoreAPI/api/mailSender/Deletes', 'search': '/BRNToolCoreAPI/BRNToolCoreAPI/api/mailSender/Search' },
    'sysApisExt': { 'deletes': '/PortalAPI/PortalAPI/api/sysApis/Deletes', 'search': '/PortalAPI/PortalAPI/api/sysApis/Search' },
    'sysFunctionsExt': { 'deletes': '/PortalAPI/PortalAPI/api/sysFunctions/Deletes', 'search': '/PortalAPI/PortalAPI/api/sysFunctions/Search' },
    'routersExt': {
        'deletes': '/BRNToolCoreAPI/BRNToolCoreAPI/api/routers/Deletes', 'search': '/BRNToolCoreAPI/BRNToolCoreAPI/api/routers/Search',
        'editOrAdd': '/BRNToolCoreAPI/BRNToolCoreAPI/api/routers/EditOrAdd', 'updateMulti': '/BRNToolCoreAPI/BRNToolCoreAPI/api/routers/UpdateMulti'
        , 'getTelcoByRouter': '/BRNToolCoreAPI/BRNToolCoreAPI/api/routers/GetTelcoByRouter', 'getGTelcoByRouter': '/BRNToolCoreAPI/BRNToolCoreAPI/api/routers/GetGTelcoByRouter'
        , 'getRouterByMsgType': '/BRNToolCoreAPI/BRNToolCoreAPI/api/routers/GetRouterByMsgType', 'getFunctionByModuleID': '/PortalAPI/PortalAPI/api/sysFunctions/GetFunctionByModuleID',
        'getRouterByMessageTypeAndTelco': '/BRNToolCoreAPI/BRNToolCoreAPI/api/routers/GetRouterByMessageTypeAndTelco'
    },
    'routerFeeDetailExt': { 'deletes': '/BRNToolCoreAPI/BRNToolCoreAPI/api/routerFeeDetail/Deletes', 'search': '/BRNToolCoreAPI/BRNToolCoreAPI/api/routerFeeDetail/Search' },
    'blackListManagementsExt': { 'deletes': '/BRNToolCoreAPI/BRNToolCoreAPI/api/blackListManagements/Deletes', 'search': '/BRNToolCoreAPI/BRNToolCoreAPI/api/blackListManagements/Search' },
    'blackKeywordManagementsExt': { 'deletes': '/BRNToolCoreAPI/BRNToolCoreAPI/api/blackKeywordManagements/Deletes', 'search': '/BRNToolCoreAPI/BRNToolCoreAPI/api/blackKeywordManagements/Search' },
    'brandExt': {
        'deletes': '/BRNToolCoreAPI/BRNToolCoreAPI/api/brand/Deletes', 'search': '/BRNToolCoreAPI/BRNToolCoreAPI/api/brand/Search', 'getMsg': '/BRNToolCoreAPI/BRNToolCoreAPI/api/brand/GetMsg',
        'getBrandDetailById': '/BRNToolCoreAPI/BRNToolCoreAPI/api/brand/GetBrandDetailById', 'getBrandDetailById2': '/BRNToolCoreAPI/BRNToolCoreAPI/api/brand/GetBrandDetailById2', 'getRouterById': '/BRNToolCoreAPI/BRNToolCoreAPI/api/brand/GetRouterById'
        , 'updateBrand': '/BRNToolCoreAPI/BRNToolCoreAPI/api/brand/UpdateBrand', 'getBrandDetail': '/BRNToolCoreAPI/BRNToolCoreAPI/api/brand/GetBrandDetail'
        , 'getFeeByRouter': '/BRNToolCoreAPI/BRNToolCoreAPI/api/brand/GetFeeByRouter', 'updateMulti': '/BRNToolCoreAPI/BRNToolCoreAPI/api/brand/UpdateMulti',
        'getFeeBrand': '/BRNToolCoreAPI/BRNToolCoreAPI/api/brand/GetFeeBrand', 'getFeeBrandSale': '/BRNToolCoreAPI/BRNToolCoreAPI/api/brand/GetFeeBrandSale',
        'getFeeBrandMsg': '/BRNToolCoreAPI/BRNToolCoreAPI/api/brand/GetFeeBrandMsg', 'getFeeBrandSaleMsg': '/BRNToolCoreAPI/BRNToolCoreAPI/api/brand/GetFeeBrandSaleMsg'
    },
    'departmentsExt': { 'deletes': '/BRNToolCoreAPI/BRNToolCoreAPI/api/departments/Deletes' },
    'mapRouterBrandsExt': {
        'search': '/BRNToolCoreAPI/BRNToolCoreAPI/api/mapRouterBrands/Search', 'getValueEdit': '/BRNToolCoreAPI/BRNToolCoreAPI/api/mapRouterBrands/GetValueEdit'
        , 'addOrEdit': '/BRNToolCoreAPI/BRNToolCoreAPI/api/mapRouterBrands/AddOrEdit', 'multiDelete': '/BRNToolCoreAPI/BRNToolCoreAPI/api/mapRouterBrands/MultiDelete'
    },
    'dataCustomersExt': { 'search': '/BRNToolCoreAPI/BRNToolCoreAPI/api/dataCustomers/Search', 'saveList': '/BRNToolCoreAPI/BRNToolCoreAPI/api/dataCustomers/SaveList', 'deletes': '/BRNToolCoreAPI/BRNToolCoreAPI/api/dataCustomers/Deletes' },
    //anhnt196 10.04.2019
    'sysAddress': { 'get': '/PortalAPI/PortalAPI/api/sysAddress/Get', 'getList': '/PortalAPI/PortalAPI/api/sysAddress/GetList', 'delete': '/PortalAPI/PortalAPI/api/sysAddress/Delete', 'post': '/PortalAPI/PortalAPI/api/sysAddress/Post ', 'put': '/PortalAPI/PortalAPI/api/sysAddress/Put', 'getAllTreeAddress': '/PortalAPI/PortalAPI/api/sysAddress/GetAllTreeAddress', 'getAllCountry': '/PortalAPI/PortalAPI/api/sysAddress/GetAllCountry', 'getChildrenByParentID': '/PortalAPI/PortalAPI/api/sysAddress/GetChildrenByParentID' },

    'ordersExt': { 'search': '/BRNToolCoreAPI/BRNToolCoreAPI/api/orders/Search', 'handlingOrder': '/BRNToolCoreAPI/BRNToolCoreAPI/api/orders/handlingOrder' },
    'orderDetailExt': { 'getByIdOrder': '/BRNToolCoreAPI/BRNToolCoreAPI/api/orderDetail/GetByIdOrder' },
    'sysAccountsExt': {
        'search': '/PortalAPI/PortalAPI/api/sysAccounts/Search', 'searchGroup': '/PortalAPI/PortalAPI/api/sysAccounts/SearchGroup',
        'updateAccount': '/PortalAPI/PortalAPI/api/sysAccounts/UpdateAccount', 'getAccountByPasswordHash': '/PortalAPI/PortalAPI/api/sysAccounts/GetAccountByPasswordHash',
        'resetToken': '/PortalAPI/PortalAPI/api/sysAccounts/ResetToken'
    },
    'brandPendingExt': {
        'search': '/BRNToolCoreAPI/BRNToolCoreAPI/api/brandPending/Search', 'getMsg': '/BRNToolCoreAPI/BRNToolCoreAPI/api/brandPending/GetMsg'
        , 'getDetailById': '/BRNToolCoreAPI/BRNToolCoreAPI/api/brandPending/GetDetailById', 'addOrEdit': '/BRNToolCoreAPI/BRNToolCoreAPI/api/brandPending/AddOrrEdit'
        , 'updateMulti': '/BRNToolCoreAPI/BRNToolCoreAPI/api/brandPending/UpdateMulti', 'moveBrandPending': '/BRNToolCoreAPI/BRNToolCoreAPI/api/brandPending/MoveBrandPending'
    },
    'ticketsExt': { 'search': '/BRNToolCoreAPI/BRNToolCoreAPI/api/tickets/Search', 'handling': '/BRNToolCoreAPI/BRNToolCoreAPI/api/tickets/handling' },
    'mapBrandAccountExt': {
        'search': '/BRNToolCoreAPI/BRNToolCoreAPI/api/mapBrandAccount/Search', 'getMsg': '/BRNToolCoreAPI/BRNToolCoreAPI/api/mapBrandAccount/GetMsg'
        , 'getBrandRoleById': '/BRNToolCoreAPI/BRNToolCoreAPI/api/mapBrandAccount/GetBrandRoleById', 'updateMulti': '/BRNToolCoreAPI/BRNToolCoreAPI/api/mapBrandAccount/UpdateMulti'
        , 'addOrEdit': '/BRNToolCoreAPI/BRNToolCoreAPI/api/mapBrandAccount/AddOrEdit'
        , 'copyBrand': '/BRNToolCoreAPI/BRNToolCoreAPI/api/mapBrandAccount/CopyBrand'
    },
    'configCountingMtExt': { 'deletes': '/BRNToolCoreAPI/BRNToolCoreAPI/api/configCountingMt/Deletes', 'search': '/BRNToolCoreAPI/BRNToolCoreAPI/api/configCountingMt/Search' },
    'orderDetailSendExt': { 'saveList': '/BRNToolCoreAPI/BRNToolCoreAPI/api/orderDetailSend/SaveList', 'search': '/BRNToolCoreAPI/BRNToolCoreAPI/api/orderDetailSend/Search' },
    'contractsExt': {
        'search': '/BRNToolCoreAPI/BRNToolCoreAPI/api/contracts/Search', 'updateMulti': '/BRNToolCoreAPI/BRNToolCoreAPI/api/contracts/UpdateMulti'
        , 'addOrEdit': '/BRNToolCoreAPI/BRNToolCoreAPI/api/contracts/AddOrEdit'
    },
    'pricesExt': {
        'search': '/BRNToolCoreAPI/BRNToolCoreAPI/api/prices/Search', 'updateMulti': '/BRNToolCoreAPI/BRNToolCoreAPI/api/prices/UpdateMulti'
        , 'addOrEdit': '/BRNToolCoreAPI/BRNToolCoreAPI/api/prices/AddOrEdit', 'getPriceDetailById': '/BRNToolCoreAPI/BRNToolCoreAPI/api/prices/GetPriceDetailById',
        'searchByContract': '/BRNToolCoreAPI/BRNToolCoreAPI/api/prices/SearchByContract'
    },
    'sysConfigurePassword': {
        'get': '/PortalAPI/PortalAPI/api/sysConfigurePassword/Get', 'getList': '/PortalAPI/PortalAPI/api/sysConfigurePassword/GetList',
        'delete': '/PortalAPI/PortalAPI/api/sysConfigurePassword/Delete', 'post': '/PortalAPI/PortalAPI/api/sysConfigurePassword/Post ', 'put': '/PortalAPI/PortalAPI/api/sysConfigurePassword/Put',
        'getListConfigurePassBySearch': '/PortalAPI/PortalAPI/api/sysConfigurePassword/GetListConfigurePassBySearch', 'changeStatus': '/PortalAPI/PortalAPI/api/sysConfigurePassword/ChangeStatus', 'getSysConfigurePasswordEffective': '/PortalAPI/PortalAPI/api/sysConfigurePassword/GetSysConfigurePasswordEffective'
    },
    'packageSmsOrderExt': {
        'search': '/BRNToolCoreAPI/BRNToolCoreAPI/api/packageSmsOrder/Search'
    },
    'discounts': { 'get': '/BRNToolCoreAPI/BRNToolCoreAPI/api/discounts/Get', 'getList': '/BRNToolCoreAPI/BRNToolCoreAPI/api/discounts/GetList', 'delete': '/BRNToolCoreAPI/BRNToolCoreAPI/api/discounts/Delete', 'post': '/BRNToolCoreAPI/BRNToolCoreAPI/api/discounts/Post ', 'put': '/BRNToolCoreAPI/BRNToolCoreAPI/api/discounts/Put' },
    'discountDetails': { 'get': '/BRNToolCoreAPI/BRNToolCoreAPI/api/discountDetails/Get', 'getList': '/BRNToolCoreAPI/BRNToolCoreAPI/api/discountDetails/GetList', 'delete': '/BRNToolCoreAPI/BRNToolCoreAPI/api/discountDetails/Delete', 'post': '/BRNToolCoreAPI/BRNToolCoreAPI/api/discountDetails/Post ', 'put': '/BRNToolCoreAPI/BRNToolCoreAPI/api/discountDetails/Put' },
    'discountsExt': {
        'getDiscountDetailById': '/BRNToolCoreAPI/BRNToolCoreAPI/api/discounts/GetDiscountDetailById', 'applyDiscount': '/BRNToolCoreAPI/BRNToolCoreAPI/api/discounts/ApplyDiscount'
        , 'addOrEdit': '/BRNToolCoreAPI/BRNToolCoreAPI/api/discounts/AddOrEdit', 'searchByContract': '/BRNToolCoreAPI/BRNToolCoreAPI/api/discounts/SearchByContract'
        , 'searchByTime': '/BRNToolCoreAPI/BRNToolCoreAPI/api/discounts/SearchByTime'
    },
    'multimediaDataExt': {
        'search': '/BRNToolCoreAPI/BRNToolCoreAPI/api/multimediaData/Search', 'handling': '/BRNToolCoreAPI/BRNToolCoreAPI/api/multimediaData/handling', 'deletes': '/BRNToolCoreAPI/BRNToolCoreAPI/api/multimediaData/Deletes'
    },
    'sysMenusExt': {
        'saveMenu': '/PortalAPI/PortalAPI/api/sysMenus/SaveMenu', 'editMenu': '/PortalAPI/PortalAPI/api/sysMenus/EditMenu',
        'getAllTreeMenu': '/PortalAPI/PortalAPI/api/sysMenus/GetAllTreeMenu', 'removeMenu': '/PortalAPI/PortalAPI/api/sysMenus/RemoveMenu'
    },
    'sysFiles': {
        'upload': '/PortalAPI/PortalAPI/api/SysFiles/Upload',
        'delete': '/PortalAPI/PortalAPI/api/SysFiles/Delete',
    },
    'sysAccountTelcos': {
        'get': '/PortalAPI/PortalAPI/api/sysAccountTelcos/Get', 'getList': '/PortalAPI/PortalAPI/api/sysAccountTelcos/GetList', 'delete': '/PortalAPI/PortalAPI/api/sysAccountTelcos/Delete',
        'post': '/PortalAPI/PortalAPI/api/sysAccountTelcos/Post ', 'put': '/PortalAPI/PortalAPI/api/sysAccountTelcos/Put'
    },
    'sysAccountTelcosExt': {
        'searchSysAccountTelco': '/PortalAPI/PortalAPI/api/sysAccountTelcos/SearchSysAccountTelco '
    },
    'prepaidRechargeExt': {
        'searchPrepaidRecharge': '/BRNToolCoreAPI/BRNToolCoreAPI/api/prepaidRecharge/SearchPrepaidRecharge'
    },
    'debtRecoveryExt': {
        'searchDebtRecovery': '/BRNToolCoreAPI/BRNToolCoreAPI/api/debtRecovery/SearchDebtRecovery',
        'saveDebtRecovery': '/BRNToolCoreAPI/BRNToolCoreAPI/api/debtRecovery/SaveDebtRecovery',
        'searchDebtRecoveryDetail': '/BRNToolCoreAPI/BRNToolCoreAPI/api/debtRecovery/SearchDebtRecoveryDetail'
    },
    'brandDetailRouterExt': { 'getRouterRun': '/BRNToolCoreAPI/BRNToolCoreAPI/api/brandDetailRouter/GetRouterRun' },
    'logBrandExt': {
        'search': '/BRNToolCoreAPI/BRNToolCoreAPI/api/logBrand/Search'
    }
};
function setToValue(obj, value, path) {
    var i;
    path = path.split('.');
    for (i = 0; i < path.length - 1; i++) {
        if (obj[path[i]]==undefined) {
            obj[path[i]] = {};
        }
        obj = obj[path[i]];

    }

    obj[path[i]] = value;
}
setToValue(service, 'val1', 'xxx.yyyyy.xxx.search');

console.log(service.xxx.yyyyy.xxx.search);