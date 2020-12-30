local _config = {}

_config.redis ={
    host='192.168.18.28',
    port=6379,
    auth=''
}

_config.user ={
    expire=100*60
}

return _config

