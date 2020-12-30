--ngx.status = ngx.HTTP_OK  
 local cjson = require('cjson')
 local json = require("json")
--  local http = require "resty.http"
-- local httpc = http.new()
-- ngx.header.content_type = "application/json; charset=utf-8"  
-- ngx.say(cjson.encode({ status = true }))  
-- return ngx.exit(ngx.HTTP_OK)  

--print(t.reCaptcha)

function convert2string(str)
  local t={}
  
  str:gsub(".",function(c) 
    if( string.byte(c)>31 and string.byte(c)<127 ) then
      table.insert(t,c) 
    end
  end);
  return table.concat(t);
end

local stringJ=convert2string(ngx.var.rescontent)
local t = json.decode(stringJ)

ngx.log(ngx.CRIT, t.reCaptcha )

-- local res, err = httpc:request_uri("http://127.0.0.1:8066/portalapi/portalapi/api/Login/Get", {
--   method = "GET",
--   headers = {
--   ["Content-Type"] = "application/json",
--   ["SSID"] = ngx.req.header,
--   }
-- })
-- --local data = cjson.decode(res.body)
-- local body, err = res:read_body()
-- print('res.body')
-- ngx.say (  err )
--ngx.req.set_header("UserName", 'afdaf')
-- ngx.res.status = 200;
-- ngx.res.out('res.body');



-- local function isempty(s)
--     return s == nil or s == ''
-- end

-- --ngx.header['response'] = ngx.var.resp_body
-- if isempty(ngx.var.rediscmd) then
--     return
-- end


-- local ctx = ngx.ctx 
-- if ctx.buffers == nil then 
--   ctx.buffers = {} 
--   ctx.nbuffers = 0 
-- end 

-- local data = ngx.arg[1] 
-- local eof = ngx.arg[2] 
-- local next_idx = ctx.nbuffers + 1 

-- if not eof then 
--   if data then 
--     ctx.buffers[next_idx] = data 
--     ctx.nbuffers = next_idx 
--     -- Send nothing to the client yet. 
--     ngx.arg[1] = nil 
--   end 
--   return 
-- elseif data then 
--   ctx.buffers[next_idx] = data 
--   ctx.nbuffers = next_idx 
-- end 

-- -- Yes, we have read the full body. 
-- -- Make sure it is stored in our buffer. 
-- assert(ctx.buffers) 
-- assert(ctx.nbuffers ~= 0, "buffer must not be empty") 

-- -- And send a new body 
-- --local bodyjson = cjson.decode( table.concat(ngx.ctx.buffers) )
-- -- ngx.arg[1] = bodyjson["reCaptcha"]
-- -- local my_json = [[{"my_array":"noi dung"}]]

-- -- local stringJ='{"reCaptcha":false,"reCaptchaSitekey":""}'

-- -- ngx.arg[1] = t 
-- -- ngx.header['response'] = table.concat(ngx.ctx.buffers)



-- -- local h, err = ngx.resp.get_headers()
-- -- ngx.header['response'] = err
-- --  if err == "truncated" then
-- --      -- one can choose to ignore or reject the current response here
-- --  end

-- -- --  for k, v in pairs(h) do
-- -- --      ...
-- -- --  end


-- -- local config = require "./conf/lua/config"

-- -- --local functions
-- -- local function isempty(s)
-- --     return s == nil or s == ''
-- -- end



