local _config = {}

--  _config.allow ={
--     ['/apis/login/Authenticate'] = '/PortalAPI/PortalAPI/api/Login/Authenticate',
--     ['/apis/login/Get'] = '/PortalAPI/PortalAPI/api/Login/Get' ,
--     ['/apis/login/GetMenu'] = '/PortalAPI/PortalAPI/api/Login/GetMenu',
--     ['/apis/login/GetRole'] = '/PortalAPI/PortalAPI/api/Login/GetRole' ,
--     ['/apis/login/TwoFactorAuthen' ] = '/PortalAPI/PortalAPI/api/Login/TwoFactorAuthen',
--     return nil
-- }
_config.redis ={
    host='192.168.18.28',
    port=6379,
    auth=''
}
_config.user ={
    expire=15*60
}
return _config

