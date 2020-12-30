
ngx.header['response'] = ngx.req.get_method() .. '.' .. ngx.var.uri


local config = require "./conf/lua/config_coreadmin"

--local functions
local function isempty(s)
    return s == nil or s == ''
end

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

local cookie_value = ngx.var.cookie_ssid

--CHUA LOGIN
if isempty(cookie_value) then
    ngx.status = ngx.HTTP_UNAUTHORIZED   --401      
    return ngx.exit(ngx.HTTP_UNAUTHORIZED  )
end
local res, err =  red:hmget(cookie_value, 'id', 'username', 'logId', 'isSuperAdmin', 'ipAddress', ngx.req.get_method() .. '.' .. ngx.var.uri)
--Chưa có trong redis:
  
--Kiem tra SESSION_ID co ton tai khong. res[1]=id
if tostring(res[1])=='userdata: NULL' then
    ngx.status = ngx.HTTP_UNAUTHORIZED      --401
    ngx.header['reLogin']='/pages/v3/login.html'
    return ngx.exit(ngx.HTTP_UNAUTHORIZED)
else    
    ngx.req.set_header("currentUserId", res[1])
    
    ngx.req.set_header("username", res[2])

    ngx.req.set_header("logid", res[3])

    ngx.req.set_header("isSuperAdmin", res[4])

    ngx.req.set_header("ip", res[5])

    ngx.req.set_header("apiUrl", res[6])

    ngx.req.set_header("apiMethod", ngx.req.get_method())

    ngx.var.target = res[6]
end




