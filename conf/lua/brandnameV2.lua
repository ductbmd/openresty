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




local redis = require "resty.redis"
local xml = require("resty.xmlSimple").newParser()
local md5 = require 'resty.md5'
local red = redis:new()
 
red:set_timeout(1000) -- 1 sec

local ok, err = red:connect("127.0.0.1", 6379)
if not ok then
    ngx.say("failed to connect: ", err)
    return
end

--local res, err = red:auth("foobared")
-- if not res then
--     ngx.say("failed to authenticate: ", err)
--     return
-- end 

-- local headers = ngx.req.get_headers()
-- local res, err =  red:get(headers["user"])
-- if not res then
--     ngx.say("failed to get SessionId: ", err)
--     return
-- end
-- return

ngx.req.read_body()  -- explicitly read the req body

local data = ngx.req.get_body_data()-- string.gsub(ngx.req.get_body_data(),":","_")

-- local parsedXml = xml:ParseXmlText(data)
local sumData   = md5.sumhexa(data)  
if data then
   
    
    
    local res, err =  red:get(sumData)
    --Chưa có trong redis:
    if tostring(res)=='userdata: NULL' then
        red:set(sumData,1,'EX',5*60)        
        --ngx.say("failed to get SessionId: ", err)    
    else
        ngx.req.set_header('Content-Type', 'text/xml; charset=utf-8')
        local msg =[[<?xml version="1.0" encoding="utf-8"?>
        <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
            <soap:Body>
                <BulkSendSmsResponse xmlns="http://tempuri.org/">
                    <BulkSendSmsResult>
                        <error_code>0</error_code>
                        <error_detail />
                        <messageId>304</messageId>
                    </BulkSendSmsResult>
                </BulkSendSmsResponse>
            </soap:Body>
        </soap:Envelope>]]
        ngx.say(msg)
        return
    end
    
    --ngx.print(parsedXml.test.nine:value() )
    --ngx.print(xml:children()[1]:name())
    --  ngx.print(parsedXml.s11_Envelope.s11_Body.ns1_BulkSendSms.ns1_msisdn:value())
   
end
--local json = require "json"
--local json = require("lualib/json.lua"); 
-- ngx.say("Hello: ",json.decode( res)["UserName"])
--ngx.say("Hello: ",res)
-- ngx.log(ngx.INFO, 'res:' .. res)
--red:hmset("myhash", "field1", "value1", "field2", "value2")

