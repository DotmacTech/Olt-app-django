�--  =================================================================
-- Copyright (C) 2009 by  HUAWEI TECHNOLOGIES. All rights reserved
-- 
-- Description: HUAWEI HTTP MIB, this mib will maintain information of HTTP 
--              protocol for datacomm product.  
-- Reference:
-- Version:     V1.00
-- History:
--  
--  V1.00 2009-03-27 initial version
-- =================================================================
                     �"This file is a HTTP MIB. It provides the functions such as
           globally enabling or disabling the HTTP service, configuring the global
           port number, showing http server and users information." �"R&D NanJing, Huawei Technologies co.,Ltd.
				High hope mansion, 
				Baixia road,
				Nanjing city
				Zip:100085
				Http://www.huawei.com
				E-mail:support@huawei.com        
				Zip:100000
            "       -- July 15, 2008 at 14:30 GMT
               �"The object indicates globally enable or disable the HTTP configuration. If the hwHttpEnable 
       	 	is 1, HTTP server is enabled. If the hwHttpEnable is 2, HTTP server is 
       	 	disabled. By default, HTTP server is enabled."                       �"The object indicates globally port number the HTTP configuration.  The value rangs from 1025 to 55535,
			   User can modify HTTP server listen in port number, 
			   By default, HTTP server listen in 80 port."                       �"The object indicates globally ACL the HTTP configuration.  The value rangs from 2000 to 2999,
			   user can modify HTTP server ACL number,By default, the ACL number is 0."                       �"The object indicates globally overtime the HTTP configuration.  The value rangs from 1 to 35791,
			   User can modify HTTP server overtime interval, 
			   By default, The time is 3 minutes."                       D"The object indicates the number of concurrent server users online."                       I"The object indicates maximum number of concurrent server users allowed."                       +"HTTP user infomation configuration table."                       :"Entries of the HTTP user infomation configuration table."                       c"The object indicates the user index of user has logined HTTP server. The value rangs from 1 to 5."                       j"The object indicates the user name of user has logined HTTP server. It ranges from 1
     		     to 64."                       M"The object indicates the source IP address of user has logined HTTP server."                       E"The object indicates the date and time of user logined HTTP server."                       @"The object indicates the overtime of user logined HTTP server."                               T"The compliance statement for SNMP entities which implement
		the HUAWEI-HTTP-MIB."                   �"The collection of objects which are used to configure the
		HTTP implementation behavior.
		This group is mandatory for agents which implement the HTTP."                 O"The collection of objects indicates the information of HTTP server and users."                            