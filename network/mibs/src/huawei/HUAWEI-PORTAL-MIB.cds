\-- =================================================================
-- Copyright (C) 2003 by  HUAWEI TECHNOLOGIES. All rights reserved.
--
-- Description:The HUAWEI-PORTAL-MIB  provides information about portal server
-- Reference:
-- Version: V1.0
-- History:
--     
-- =================================================================
                                                                                                     ,"The MIB contains objects of module PORTAL."e"
                    NanJing Institute,Huawei Technologies Co.,Ltd.
                    HuiHong Mansion,No.91 BaiXia Rd.
                    NanJing, P.R. of China
                    Zipcode:210001
                     
                    Http://www.huawei.com                                       
                    E-mail:support@huawei.com "                       7" 
                The version of supported protocol."                      b"Changed to transparent transmission information.
                The source of transparent transmission information, 'true' means transparent transmission the information of PORTAL server,
                        'false' means no transparent transmission the information of PORTAL server, the default is no transparent transmission.
                "                       $"The receiving UDP port of server. "                       $"The sending UDP port of server.   "                       w"The trap sending UDP port of server, used to send the message that user has been forced to leave.  
                "                       B"The source interface of sending PORTAL packet.
                "                           �"The time of system startup time, statistics of start time.
                 When clear the statistics data, it will be reset.
                 If power off, the data would not be saved.
                "                       A"The total packet number of validate failure.
                 "                       3" The total number of access request error packet."                       3" The total number of logout request error packet."                       E"The total number of inquiry request error packet.
                "                       C"The total number of login confirm error packet.
                "                       G"The total number of received access request packet.
                "                       F"The total number of received login request packet.
                "                       G"The total number of received logout request packet.
                "                       7"The total number of received inquiry request packet. "                       5"The total number of received login confirm packet. "                       2"The total number of access ack failure packet.  "                       0"The total number of login ack failure packet. "                       2"The total number of logout ack failure packet.  "                       3"The total number of inquiry ack failure packet.  "                       1"The total number of sending access ack packet. "                       0"The total number of sending login ack packet. "                       2"The total number of sending logout ack packet.  "                       3"The total number of sending inquiry ack packet.  "                       ["The shared secret key table, realizing the config of shared secret key.
                "                       ("The entry of shared secret key table. "                       #"The IP address of PORTAL server. "                        "The IP mask of PORTAL server. "                       4"The secret key of PORTAL server.
                "                       "The port of PORTAL server."                       9"Whether transport the NAS IP address.
                "                       "The row status."                       ~"The statistics table of PORTAL server, used to inquire total number of every access user on PORTAL server.
                "                       1"The entry of statistics table of PORTAL server."                       ""The IP address of PORTAL server."                       X"
                The total number of access users on PORTAL server.
                "                       k"
                The PORTAL user table, used to inquire the attribute of PORTAL users.
                "                       !"The entry of PORTAL user table."                       ?"
                The MAC address of users.
                "                       >"
                The IP address of users.
                "                       ?"
                The port number of users.
                "                       G"
                The upstream flow, unit is bytes.
                "                       I"
                The downstream flow, unit is bytes.
                "                       3"
                The username.
                "                       ="
                The login time of user.
                "                       ""The IP address of PORTAL server."                       ["The shared secret key table, realizing the config of shared secret key.
                "                       +"The entry of shared secret key table.(V2)"                       '"The IP address of PORTAL server.(V2) "                       $"The IP mask of PORTAL server.(V2) "                       &"The secret key of PORTAL server.(V2)"                        "The port of PORTAL server.(V2)"                       +"Whether transport the NAS IP address.(V2)"                       "The row status.(V2)"                       )"VPN instance name of portal server (V2)"                       p"The statistics table of PORTAL server, used to inquire total number of every access user on PORTAL server.(V2)"                       5"The entry of statistics table of PORTAL server.(V2)"                       &"The IP address of PORTAL server.(V2)"                       8"The total number of access users on PORTAL server.(V2)"                               T"The compliance statement for systems supporting 
                the this module."                   "The config parameter group."                 ("The pachet statistics parameter group."                 "The config secret key group."                 "The PORTAL server group."                 "The PORTAL user group."                 ""The config secret key group.(V2)"                 "The PORTAL server group.(V2)"                