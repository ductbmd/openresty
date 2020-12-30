local config = require "./conf/lua/config"

--local functions
local function isempty(s)
    return s == nil or s == ''
end


local function has_value (tab, val)
    for index, value in ipairs(tab) do
        if value == val then
            return true
        end
    end

    return false
end

--end local functions

-- local allow = {
--     '/PortalAPI/PortalAPI/api/Login/Authenticate',
--     '/PortalAPI/PortalAPI/api/Login/Get',
--     '/PortalAPI/PortalAPI/api/Login/VerifyOTP'
-- }

local redis = require "resty.redis"
local xml = require("resty.xmlSimple").newParser()
local md5 = require 'resty.md5'
local red = redis:new()
 
red:set_timeout(1000) -- 1 sec

local ok, err = red:connect(config.redis.host, config.redis.port)
if not ok then
    ngx.say("failed to connect: ", err)
    ngx.status = ngx.HTTP_NOT_FOUND       
    return ngx.exit(ngx.HTTP_NOT_FOUND) 
end
if not isempty(config.redis.auth)  then
    local res, err = red:auth(config.redis.auth)
    if not res then
        ngx.say("failed to authenticate: ", err)
        return
    end 
end
-- local headers = ngx.req.get_headers()
-- local res, err =  red:get(headers["user"])
-- if not res then
--     ngx.say("failed to get SessionId: ", err)
--     return
-- end
-- return
-- ngx.var.request_uri
if has_value(config.allow,ngx.var.uri) then    
    return 
end



--Get cookie SSID
local cookie_value = ngx.var.cookie_SSID
if isempty(cookie_value) then
    ngx.status = ngx.HTTP_NOT_ALLOWED            
    return ngx.exit(ngx.HTTP_NOT_ALLOWED  )
end
local res, err =  red:hmget(cookie_value,'username','userid')
--Chưa có trong redis:
  
 
if  res[1] == ngx.null then
    
    -- ngx.say(tostring(res[1]))
    ngx.status = ngx.HTTP_NOT_ALLOWED            
    return ngx.exit(ngx.HTTP_NOT_ALLOWED  )
else
     
    --Nếu có trong redis=>tăng ex time 5':
    red:expire(cookie_value,config.user.expire) 

    ngx.req.set_header("UserID", res[2])
    ngx.req.set_header("UserName", res[1])
end



