
ngx.header['response'] = ngx.req.get_method() .. '.' .. ngx.var.uri


local config = require "./conf/lua/config"

--local functions
local function isempty(s)
    return s == nil or s == ''
end


-- local function has_value (tab, val)
--     for index, value in ipairs(tab) do
--         if value[val]!=nil  then
--             return value[val]
--         end
--     end

--     return nil
-- end

--end local functions
-- local map = config.allow(ngx.var.uri)
-- if map ~= nil then    

-- else
--     ngx.var.target=map  
--     return 
-- end


local redis = require "resty.redis"
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
-- ngx.say(ngx.var.uri).
-- return ngx.exit(200  )
local cookie_value =  ngx.var.cookie_SSID

--CHUA LOGIN
if isempty(cookie_value) then
    ngx.status = ngx.HTTP_UNAUTHORIZED   --401
    ngx.header['reLogin']='/pages/v3/login.html'         
    return ngx.exit(ngx.HTTP_UNAUTHORIZED  )
end
--local res, err =  red:hget(cookie_value,ngx.var.uri)
local res, err =  red:hmget(cookie_value, 'username','id', ngx.req.get_method() .. '.' .. ngx.var.uri)
--Chưa có trong redis:
  
--ngx.header['responseaa'] = tostring(res[1])
--Kiem tra SESSION_ID co ton tai khong. res[1]=userName
if tostring(res[1])=='userdata: NULL' then
    ngx.header['reLogin']='/pages/v3/login.html'
    ngx.status = ngx.HTTP_UNAUTHORIZED      --401      
    return ngx.exit(ngx.HTTP_UNAUTHORIZED  )
end

--function khong duoc ho tro
if tostring(res[3])=='userdata: NULL' then
    -- ngx.say("not allow!")  
    --ngx.say(tostring(cookie_value))  
    ngx.status = ngx.HTTP_NOT_ALLOWED            
    return ngx.exit(ngx.HTTP_NOT_ALLOWED  )
else
    --Nếu có trong redis=>tăng ex time 5':
    red:expire(cookie_value,config.user.expire) 
    ngx.req.set_header("UserID", res[2])
    ngx.req.set_header("UserName", res[1])
    
    if ngx.var.query_string==nil then
        ngx.var.target = res[3]
    else
        ngx.var.target = res[3] .. '?' .. ngx.var.query_string
    end
    ngx.header['xxx'] = ngx.var.target 
end



