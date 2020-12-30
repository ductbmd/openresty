--check cookie:
-- function split(s, delimiter)
--     result = {};
--     for match in (s..delimiter):gmatch("(.-)"..delimiter) do
--         table.insert(result, match);
--     end
--     return result;
-- end
-- local s = "[in brackets]"


 
--ngx.say(json.decode('{"widget": {    "debug": "on",    "window": {        "title": "Sample Konfabulator Widget",        "name": "main_window",        "width": 500,        "height": 500    },    "image": {         "src": "Images/Sun.png",        "name": "sun1",        "hOffset": 250,        "vOffset": 250,        "alignment": "center"    },    "text": {        "data": "Click Here",        "size": 36,        "style": "bold",        "name": "text1",        "hOffset": 250,        "vOffset": 100,        "alignment": "center",        "onMouseUp": "sun1.opacity = (sun1.opacity / 100) * 90;"    }}}')['widget']['debug'] )
-- local tb=split('foo, bar,baz', ',%s*')
-- for key, val in pairs(tb) do  -- Table iteration.
--     print(key, val)
--     ngx.say(key, val)
--   end



local SessionId = ngx.var.cookie_SessionId
ngx.say("SessionId", " => ", SessionId)
if not SessionId then
    ngx.say("not auth ")
    return
end

ngx.log(ngx.INFO, 'SessionId:' .. SessionId)

local redis = require "resty.redis"
local red = redis:new()

red:set_timeout(1000) -- 1 sec

local ok, err = red:connect("127.0.0.1", 6379)
if not ok then
    ngx.say("failed to connect: ", err)
    return
end

local res, err = red:auth("foobared")
if not res then
    ngx.say("failed to authenticate: ", err)
    return
end 
res, err =  red:get(SessionId)
if not res then
    ngx.say("failed to get SessionId: ", err)
    return
end
local json = require "json"
--local json = require("lualib/json.lua"); 
ngx.say("Hello: ",json.decode( res)["UserName"])
ngx.log(ngx.INFO, 'res:' .. res)
--red:hmset("myhash", "field1", "value1", "field2", "value2")

